"""Alertes hebdomadaires par courriel (jour 3 du plan MVP, changement OpenSpec alertes-courriel, 2026-10-20).

Deux courriels, après la veille du lundi :
  --admin     : à Monsieur DUCOUT, le bilan de la veille (sources relues, liens nouveaux, disparus) et l'état de la
                base (fiches nouvelles de la semaine, fiches à contrôler) avec le lien direct vers la liste à contrôler.
  --candidats : à chaque candidat au profil complet qui accepte les courriels, les appels publiés depuis sept jours qui
                concernent sa région (ou nationaux) et sa famille de structure, dix au plus, avec le lien de chaque fiche.

Lecture seule sur Firestore (compte de service). Sans boîte d'envoi configurée, ou avec --dry-run, les courriels sont
écrits dans logs/courriels/ pour relecture. Usage :
  python alertes.py --admin --candidats [--dry-run] [--jours 7] [--url http://localhost:3000]
"""
from __future__ import annotations

import argparse
import re
import math
import sys
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courriel  # noqa: E402

ICI = Path(__file__).resolve().parent
VEILLE_MD = ICI / "VEILLE.md"
CLE_COMPTE = ICI.parent / "scripts" / "serviceAccountKey.json"

# Famille de destinataires d'un candidat d'après sa forme juridique (pages/onboarding/parcours.ts) ; None = toutes
FAMILLE_PAR_FORME = {
    "etablissement-public": "public", "espic": "prive-non-lucratif", "association": "prive-non-lucratif",
    "fondation": "prive-non-lucratif", "prive-lucratif": "prive-lucratif", "entreprise": "prive-lucratif",
    "gcs": "public", "collectivite": "collectivites", "exercice-coordonne": "prive-lucratif", "laboratoire": "recherche",
}


# ---------------------------------------------------------------- fonctions pures (testées)

def resume_veille(texte: str) -> dict:
    """Chiffres de l'en-tête de VEILLE.md : sources relues, en erreur, liens vus, nouveaux, disparus, date."""
    nombres = {"sources": 0, "erreurs": 0, "vus": 0, "nouveaux": 0, "disparus": 0, "date": ""}
    m = re.search(r"Rapport du (\d{4}-\d{2}-\d{2})", texte)
    if m:
        nombres["date"] = m.group(1)
    for cle, motif in (("sources", r"Sources relues : (\d+)"), ("erreurs", r"compteurs inchangés\) : (\d+)"),
                       ("vus", r"Liens vus : (\d+)"), ("nouveaux", r"nouveaux : (\d+)"), ("disparus", r"disparus : (\d+)")):
        m = re.search(motif, texte)
        if m:
            nombres[cle] = int(m.group(1))
    return nombres


def courriel_admin(veille: dict, base: dict, url: str) -> tuple[str, str]:
    """(sujet, texte) du bilan hebdomadaire de l'administrateur."""
    sujet = f"AAP Santé : veille du {veille.get('date') or datetime.now().strftime('%Y-%m-%d')}, {base['a_controler']} fiches à contrôler"
    lignes = [
        "Bonjour Monsieur DUCOUT,", "",
        "La veille hebdomadaire a tourné.", "",
        f"- Sources relues : {veille['sources']} (en erreur : {veille['erreurs']})",
        f"- Liens vus : {veille['vus']} ; nouveaux : {veille['nouveaux']} ; disparus : {veille['disparus']}",
        f"- Fiches nouvelles en base depuis sept jours : {base['nouvelles']} (dont validées par le modèle : {base['nouvelles_validees']})",
        f"- Fiches à contrôler (proposées ou à corriger) : {base['a_controler']}",
        f"- Fiches publiées et visibles des candidats : {base['publiees']}", "",
        f"Contrôler les fiches : {url}/admin/aaps?validation=proposee", "",
        "Les textes nouveaux de la veille ne sont extraits qu'après votre accord (devis dans la fenêtre de la veille).", "",
        "AAP Santé, veille automatique.",
    ]
    return sujet, "\n".join(lignes)


def _date(valeur) -> datetime | None:
    if valeur is None:
        return None
    if isinstance(valeur, datetime):
        return valeur if valeur.tzinfo else valeur.replace(tzinfo=timezone.utc)
    if hasattr(valeur, "to_datetime"):  # Timestamp Firestore
        return valeur.to_datetime()
    if isinstance(valeur, str):
        try:
            return datetime.fromisoformat(valeur.replace("Z", "+00:00")).astimezone(timezone.utc)
        except ValueError:
            return None
    return None


def visible(fiche: dict) -> bool:
    """Même règle que l'application : publiée, et validée ou saisie à la main."""
    v = fiche.get("validation")
    return fiche.get("status") == "published" and (not v or v.get("statut") == "validee")


LOIN = datetime.max.replace(tzinfo=timezone.utc)


def _nouvelles_visibles(fiches: list[dict], depuis: datetime) -> list[dict]:
    """Fiches visibles du public publiées (ou créées) depuis `depuis` : règle commune au profil et aux recherches."""
    return [f for f in fiches if visible(f)
            and (quand := _date(f.get("publishedAt")) or _date(f.get("createdAt"))) and quand >= depuis]


def _par_cloture(fiches: list[dict]) -> list[dict]:
    """Clôture la plus proche d'abord, appels sans date en dernier (tri stable)."""
    return sorted(fiches, key=lambda f: _date(f.get("deadline")) or LOIN)


def fiches_nouvelles_pour(profil: dict, fiches: list[dict], depuis: datetime) -> list[dict]:
    """Fiches visibles publiées depuis `depuis`, de la région du candidat ou nationales, ouvertes à sa famille de
    structure (ou à toutes), clôture la plus proche d'abord (fonction pure)."""
    region = ((profil.get("address") or {}).get("region") or "").strip()
    famille = FAMILLE_PAR_FORME.get(profil.get("structureType") or "")
    retenues = []
    for f in _nouvelles_visibles(fiches, depuis):
        territoires = f.get("territoriesEligible") or []
        if region and territoires and region not in territoires and "france" not in territoires:
            continue
        dest = (f.get("qualification") or {}).get("destinataires") or []
        if famille and dest and famille not in dest and "tous" not in dest:
            continue
        cloture = _date(f.get("deadline"))
        if cloture and cloture < datetime.now(timezone.utc):
            continue
        retenues.append(f)
    return _par_cloture(retenues)


# ---------------------------------------------------------------- filtres d'une recherche sauvegardée
# Copie de filtrerAppels (app/src/utils/recherche.ts) : même règle que /aap/search, pour que l'alerte d'une recherche
# envoie les appels que la page affiche. Cas communs : app/src/utils/cas_filtres_recherche.json (Vitest et pytest).
# Changement alertes-recherches-sauvegardees, 2026-11-16.

CLES_FILTRES = ("q", "thematique", "territory", "financeur", "source", "relecture", "statut", "budgetMin", "budgetMax",
                "destinataire", "typeAppel")
SEUIL_BIENTOT_CLOS_JOURS = 30


def filtres_depuis_params(params: str) -> dict:
    """Filtres d'après l'adresse de la recherche (« thematique=sante&territory=ile-de-france ») ; absents = vides."""
    lus = parse_qs(params or "", keep_blank_values=True)
    return {cle: (lus.get(cle) or [""])[0] for cle in CLES_FILTRES}


def statut_appel(fiche: dict) -> str:
    cloture = _date(fiche.get("deadline"))
    if not cloture:
        return "sans-date"
    jours = math.ceil((cloture - datetime.now(timezone.utc)).total_seconds() / 86400)
    if jours < 0:
        return "clos"
    return "bientot-clos" if jours <= SEUIL_BIENTOT_CLOS_JOURS else "ouvert"


_DEBUT_NOMBRE = re.compile(r"\s*[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?")


def _parse_float(s: str) -> float:
    """Comme parseFloat en JavaScript : début numérique du texte, sinon nan (« 50 000 » vaut 50, « abc » nan) ;
    float() levait une erreur et arrêtait l'envoi (relecture du 2026-11-16)."""
    m = _DEBUT_NOMBRE.match(s or "")
    return float(m.group()) if m else math.nan


def correspond(fiche: dict, f: dict) -> bool:
    """Vrai si la fiche passe les filtres de la recherche (fonction pure, même règle que l'application)."""
    terme = (f.get("q") or "").lower()
    financeur = fiche.get("financeurName") or "Non spécifié"
    if terme and not any(terme in (x or "").lower() for x in (fiche.get("title"), fiche.get("description"), financeur)):
        return False
    champ = (fiche.get("scrapeMetadata") or {}).get("champ")
    if f.get("thematique") and (champ if champ in ("sante", "medico-social") else "non-classee") != f["thematique"]:
        return False
    territoire, t = f.get("territory") or "", fiche.get("territoriesEligible") or []
    if territoire and territoire not in t and not (territoire not in ("france", "non-precise") and "france" in t):
        return False
    statut = f.get("statut") or ""
    if statut != "tous" and (statut_appel(fiche) == "clos" if not statut else statut_appel(fiche) != statut):
        return False
    qualif = fiche.get("qualification") or {}
    dest = qualif.get("destinataires") or []
    if f.get("destinataire") and dest and f["destinataire"] not in dest and "tous" not in dest:
        return False
    if f.get("typeAppel") and (qualif.get("typeAppel") or "") != f["typeAppel"]:
        return False
    if f.get("financeur") and financeur != f["financeur"]:
        return False
    # Même comparaison que filtrerAppels : avec nan (montant illisible), la fiche chiffrée est écartée
    if f.get("budgetMin") and fiche.get("budgetMax") is not None and not fiche["budgetMax"] >= _parse_float(f["budgetMin"]):
        return False
    if f.get("budgetMax") and fiche.get("budgetMin") is not None and not fiche["budgetMin"] <= _parse_float(f["budgetMax"]):
        return False
    return True


def montant(f: dict) -> str:
    mx, tot = f.get("budgetMax"), f.get("budgetTotal")
    if mx:
        return f"jusqu'à {int(mx):,} €".replace(",", " ")
    if tot:
        return f"enveloppe {int(tot):,} €".replace(",", " ")
    return "montant non précisé"


def _lignes_fiche(f: dict, url: str) -> list[str]:
    cloture = _date(f.get("deadline"))
    quand = f"clôture le {cloture.strftime('%d/%m/%Y')}" if cloture else "date de clôture non précisée"
    return [f"- {f.get('title', '')}", f"  {f.get('financeurName') or 'Financeur non précisé'} · {montant(f)} · {quand}",
            f"  {url}/aap/{f.get('id', '')}", ""]


def _nom_sur(nom) -> str:
    """Nom de recherche affiché dans le courriel : liens retirés, 80 caractères au plus (le nom est saisi par le compte
    et part depuis la boîte officielle ; défense en profondeur, relecture du 2026-11-16)."""
    propre = re.sub(r"(https?://|www\.)\S*", "[lien retiré]", str(nom or "")).strip()
    return (propre[:79] + "…") if len(propre) > 80 else (propre or "Recherche sans nom")


def sections_recherches(recherches: list[dict], fiches: list[dict], depuis: datetime) -> list[dict]:
    """Une section par recherche dont l'alerte est active : fiches visibles publiées depuis `depuis` qui passent ses
    filtres, clôture la plus proche d'abord (fonction pure, alertes-recherches-sauvegardees)."""
    nouvelles = _nouvelles_visibles(fiches, depuis)
    sections = []
    for r in recherches:
        if not r.get("alertEnabled"):
            continue
        # Une recherche sans adresse ne filtrerait rien : aucune section « toute la France » sous son nom
        params = r.get("params") or ""
        if not params:
            continue
        filtres = filtres_depuis_params(params)
        retenues = _par_cloture([f for f in nouvelles if correspond(f, filtres)])
        sections.append({"nom": _nom_sur(r.get("name")), "params": params, "fiches": retenues})
    return sections


def courriel_candidat(profil: dict, fiches: list[dict], url: str, maximum: int = 10,
                      sections: list[dict] | None = None) -> tuple[str, str]:
    """(sujet, texte) du courriel hebdomadaire d'un candidat ; les fiches sont déjà filtrées et triées ; une section par
    recherche sauvegardée dont l'alerte est active (`sections_recherches`)."""
    sections = sections or []
    nom = profil.get("structureName") or "votre structure"
    n = len(fiches)
    total = len({f.get("id") for f in fiches} | {f.get("id") for s in sections for f in s["fiches"]})
    sujet = (f"AAP Santé : {total} nouveaux appels à projets pour {nom}" if total > 1
             else f"AAP Santé : 1 nouvel appel à projets pour {nom}" if total == 1
             else f"AAP Santé : aucun nouvel appel cette semaine pour {nom}")
    lignes = ["Bonjour,", "", f"Voici les appels à projets publiés cette semaine qui concernent {nom} :" if n else "Aucun nouvel appel à projets ne concerne votre structure cette semaine.", ""]
    for f in fiches[:maximum]:
        lignes += _lignes_fiche(f, url)
    if n > maximum:
        lignes.append(f"... et {n - maximum} autre{'s' if n - maximum > 1 else ''} : {url}/aap/search")
        lignes.append("")
    lignes += [f"Tous les appels de votre région : {url}/aap/search", ""]
    for s in sections:
        k = len(s["fiches"])
        compte = (f"{k} nouveaux appels" if k > 1 else "1 nouvel appel" if k == 1 else "aucun nouvel appel cette semaine")
        lignes += [f"Votre recherche « {s['nom']} » : {compte}", ""]
        for f in s["fiches"][:5]:
            lignes += _lignes_fiche(f, url)
        lignes += [f"  Voir la recherche : {url}/aap/search?{s['params']}", ""]
    if sections:
        lignes += [f"Pour arrêter l'alerte d'une recherche : Recherches sauvegardées, {url}/recherches-sauvegardees.", ""]
    lignes += ["Pour ne plus recevoir ces courriels : Mon profil, préférences des alertes.", "", "AAP Santé."]
    return sujet, "\n".join(lignes)


# ---------------------------------------------------------------- lecture de la base

def _firestore():
    import firebase_admin
    from firebase_admin import credentials, firestore
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(str(CLE_COMPTE)))
    return firestore.client()


def lire_fiches(db) -> list[dict]:
    return [{"id": d.id, **d.to_dict()} for d in db.collection("aap").stream()]


def etat_base(fiches: list[dict], depuis: datetime) -> dict:
    nouvelles = [f for f in fiches if (_date(f.get("createdAt")) or datetime.min.replace(tzinfo=timezone.utc)) >= depuis]
    return {"nouvelles": len(nouvelles),
            "nouvelles_validees": sum(1 for f in nouvelles if (f.get("validation") or {}).get("statut") == "validee"),
            "a_controler": sum(1 for f in fiches if f.get("status") != "archived" and (f.get("validation") or {}).get("statut") in ("proposee", "a_corriger")),
            "publiees": sum(1 for f in fiches if visible(f))}


def lire_candidats(db) -> list[tuple[dict, dict, list[dict]]]:
    """(compte, profil, recherches sauvegardées) des candidats au profil complet qui acceptent les courriels."""
    resultat = []
    for u in db.collection("users").where("userType", "==", "porteur").stream():
        compte = u.to_dict()
        if not compte.get("profileComplete") or not compte.get("email"):
            continue
        if (compte.get("notificationPreferences") or {}).get("email") is False:
            continue
        p = db.collection("porteurProfiles").document(u.id).get()
        if p.exists:
            recherches = [r.to_dict() for r in db.collection("savedSearches").where("userId", "==", u.id).stream()]
            resultat.append((compte, p.to_dict(), recherches))
    return resultat


def envoyer_aux_candidats(candidats, fiches: list[dict], depuis: datetime, url: str, dry_run: bool) -> list[str]:
    """Courriel de chaque candidat ; une erreur sur l'un est notée et n'arrête pas l'envoi aux suivants."""
    lignes = []
    for compte, profil, recherches in candidats:
        try:
            retenues = fiches_nouvelles_pour(profil, fiches, depuis)
            sections = sections_recherches(recherches, fiches, depuis)
            sujet, texte = courriel_candidat(profil, retenues, url, sections=sections)
            lignes.append(f"candidat {compte['email']} : {len(retenues)} appel(s), {len(sections)} recherche(s) en alerte ; "
                          + courriel.envoyer(compte["email"], sujet, texte, dry_run))
        except Exception as e:  # noqa: BLE001 - une donnée imprévue ne doit priver personne d'autre de son courriel
            lignes.append(f"candidat {compte.get('email')} : ÉCHEC {type(e).__name__} {e}")
    return lignes


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--admin", action="store_true")
    parser.add_argument("--candidats", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--jours", type=int, default=7)
    parser.add_argument("--url", default="http://localhost:3000", help="adresse de l'application dans les liens")
    args = parser.parse_args()
    if not (args.admin or args.candidats):
        parser.print_help()
        return 0
    depuis = datetime.now(timezone.utc) - timedelta(days=args.jours)
    db = _firestore()
    fiches = lire_fiches(db)
    if args.admin:
        veille = resume_veille(VEILLE_MD.read_text(encoding="utf-8")) if VEILLE_MD.exists() else resume_veille("")
        sujet, texte = courriel_admin(veille, etat_base(fiches, depuis), args.url)
        config = courriel.charger_config()
        dest = (config or {}).get("admin") or "admin (COURRIEL_ADMIN non renseigné)"
        print("admin :", courriel.envoyer(dest, sujet, texte, args.dry_run))
    if args.candidats:
        for ligne in envoyer_aux_candidats(lire_candidats(db), fiches, depuis, args.url, args.dry_run):
            print(ligne)
    return 0


if __name__ == "__main__":
    sys.exit(main())
