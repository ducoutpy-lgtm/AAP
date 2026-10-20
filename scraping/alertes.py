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
import sys
from datetime import datetime, timedelta, timezone
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


def fiches_nouvelles_pour(profil: dict, fiches: list[dict], depuis: datetime) -> list[dict]:
    """Fiches visibles publiées depuis `depuis`, de la région du candidat ou nationales, ouvertes à sa famille de
    structure (ou à toutes), clôture la plus proche d'abord (fonction pure)."""
    region = ((profil.get("address") or {}).get("region") or "").strip()
    famille = FAMILLE_PAR_FORME.get(profil.get("structureType") or "")
    retenues = []
    for f in fiches:
        if not visible(f):
            continue
        quand = _date(f.get("publishedAt")) or _date(f.get("createdAt"))
        if not quand or quand < depuis:
            continue
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
    loin = datetime.max.replace(tzinfo=timezone.utc)
    return sorted(retenues, key=lambda f: _date(f.get("deadline")) or loin)


def montant(f: dict) -> str:
    mx, tot = f.get("budgetMax"), f.get("budgetTotal")
    if mx:
        return f"jusqu'à {int(mx):,} €".replace(",", " ")
    if tot:
        return f"enveloppe {int(tot):,} €".replace(",", " ")
    return "montant non précisé"


def courriel_candidat(profil: dict, fiches: list[dict], url: str, maximum: int = 10) -> tuple[str, str]:
    """(sujet, texte) du courriel hebdomadaire d'un candidat ; les fiches sont déjà filtrées et triées."""
    nom = profil.get("structureName") or "votre structure"
    n = len(fiches)
    sujet = (f"AAP Santé : {n} nouveaux appels à projets pour {nom}" if n > 1
             else f"AAP Santé : 1 nouvel appel à projets pour {nom}" if n == 1
             else f"AAP Santé : aucun nouvel appel cette semaine pour {nom}")
    lignes = ["Bonjour,", "", f"Voici les appels à projets publiés cette semaine qui concernent {nom} :" if n else "Aucun nouvel appel à projets ne concerne votre structure cette semaine.", ""]
    for f in fiches[:maximum]:
        cloture = _date(f.get("deadline"))
        quand = f"clôture le {cloture.strftime('%d/%m/%Y')}" if cloture else "date de clôture non précisée"
        lignes += [f"- {f.get('title', '')}", f"  {f.get('financeurName') or 'Financeur non précisé'} · {montant(f)} · {quand}",
                   f"  {url}/aap/{f.get('id', '')}", ""]
    if n > maximum:
        lignes.append(f"... et {n - maximum} autre{'s' if n - maximum > 1 else ''} : {url}/aap/search")
        lignes.append("")
    lignes += [f"Tous les appels de votre région : {url}/aap/search", "",
               "Pour ne plus recevoir ces courriels : Mon profil, préférences des alertes.", "", "AAP Santé."]
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


def lire_candidats(db) -> list[tuple[dict, dict]]:
    """(compte, profil) des candidats au profil complet qui acceptent les courriels."""
    resultat = []
    for u in db.collection("users").where("userType", "==", "porteur").stream():
        compte = u.to_dict()
        if not compte.get("profileComplete") or not compte.get("email"):
            continue
        if (compte.get("notificationPreferences") or {}).get("email") is False:
            continue
        p = db.collection("porteurProfiles").document(u.id).get()
        if p.exists:
            resultat.append((compte, p.to_dict()))
    return resultat


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
        for compte, profil in lire_candidats(db):
            retenues = fiches_nouvelles_pour(profil, fiches, depuis)
            sujet, texte = courriel_candidat(profil, retenues, args.url)
            print(f"candidat {compte['email']} : {len(retenues)} appel(s) ;", courriel.envoyer(compte["email"], sujet, texte, args.dry_run))
    return 0


if __name__ == "__main__":
    sys.exit(main())
