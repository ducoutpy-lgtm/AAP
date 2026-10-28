"""Connecteur du portail européen Funding & Tenders (changement connecteur-funding-tenders, 2026-10-28).

Pourquoi : le portail publie tous les appels de la Commission européenne, mais il est chargé par script et la
découverte n'y lit aucun lien. Son interface de recherche publique (clé « SEDIA », celle du site lui-même) renvoie les
appels ouverts ou à venir avec des données structurées : identifiant, titre, dates, budget par action, lien officiel.
Une lecture page par page, sans navigateur ni modèle, aucune fabrication possible. On garde les programmes de santé.

Usage :
  python funding_tenders.py                    # écrit results/funding_tenders.json
  python funding_tenders.py --fichier rep.json # depuis une liste de résultats déjà enregistrée (essai sans réseau)

La qualification (qualifier_fiches.py, Haiku) et l'import suivent la chaîne habituelle : ce script ne paie rien.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from datetime import date, datetime, timezone
from pathlib import Path

import httpx

from schema import AapNormalized
from utils import DEFAULT_HTTP_HEADERS, ensure_utf8_stdout

ICI = Path(__file__).resolve().parent
SORTIE = ICI / "results" / "funding_tenders.json"
SOURCE_ID = "portail-funding-tenders-commission-europeenne"  # identifiant de la source au registre
RECHERCHE = "https://api.tech.ec.europa.eu/search-api/prod/rest/search"
# Types 1, 2, 8 : appels à propositions et sujets ; statuts 31094501 (ouvert) et 31094502 (à venir), d'après le portail
FILTRE = {"bool": {"must": [{"terms": {"type": ["1", "2", "8"]}}, {"terms": {"status": ["31094501", "31094502"]}}]}}
STATUTS = {"31094501": "ouvert", "31094502": "a-venir"}
# Tri imposé : sans lui, l'ordre change d'une page à l'autre et deux lectures différaient de 190 appels (2026-10-28)
TRI = {"field": "identifier", "order": "ASC"}
ENRICHISSEMENTS = ("qualification", "verification")  # résultats payés du modèle, repris d'une lecture à l'autre
TAILLE_PAGE, PAGES_MAX = 100, 30
# Programmes de santé, reconnus au début de l'identifiant, et financeur affiché
PROGRAMMES = [
    (re.compile(r"^HORIZON-HLTH-"), "Commission européenne – Horizon Europe, pôle Santé"),
    (re.compile(r"^HORIZON-MISS-\d{4}-\d{2}-CANCER-"), "Commission européenne – Horizon Europe, mission Cancer"),
    (re.compile(r"^HORIZON-JU-IHI-"), "Initiative en santé innovante (IHI), Commission européenne et industrie"),
    (re.compile(r"^HORIZON-JU-GH-EDCTP3-"), "Partenariat EDCTP3 Santé mondiale, Commission européenne"),
    (re.compile(r"^EU4H-"), "Commission européenne – programme EU4Health"),
]
LONGUEUR_DESCRIPTION = 3000


def financeur_de(identifiant: str) -> str | None:
    for motif, financeur in PROGRAMMES:
        if motif.match(identifiant):
            return financeur
    return None


def retenu(identifiant: str) -> bool:
    return financeur_de(identifiant) is not None


def _premier(meta: dict, cle: str) -> str:
    valeur = meta.get(cle) or []
    return (valeur[0] if isinstance(valeur, list) and valeur else valeur or "") or ""


def date_iso(texte: str) -> str | None:
    """« 2027-02-17T00:00:00.000+0000 » -> « 2027-02-17 » ; vide ou illisible -> None (fonction pure)."""
    t = (texte or "").strip()[:10]
    try:
        return date.fromisoformat(t).isoformat()
    except ValueError:
        return None


def prochaine_date(textes: list[str], aujourdhui: date) -> str | None:
    """Première date limite à venir (appels en deux étapes) ; à défaut, la dernière (appel clos, écarté à l'import)."""
    dates = sorted(d for d in (date_iso(t) for t in textes or []) if d)
    a_venir = [d for d in dates if d >= aujourdhui.isoformat()]
    return a_venir[0] if a_venir else (dates[-1] if dates else None)


def montants(budget: str, identifiant: str) -> tuple[int | None, int | None, str | None]:
    """(contribution minimale, maximale par projet, enveloppe de l'action) lues dans budgetOverview (fonction pure)."""
    try:
        carte = json.loads(budget or "{}").get("budgetTopicActionMap") or {}
    except (json.JSONDecodeError, AttributeError):
        return None, None, None
    for actions in carte.values():
        for a in actions or []:
            if str(a.get("action", "")).startswith(identifiant + " "):
                total = sum(int(float(v)) for v in (a.get("budgetYearMap") or {}).values() if str(v).replace(".", "").isdigit())
                return a.get("minContribution"), a.get("maxContribution"), (f"{total} EUR" if total else None)
    return None, None, None


def texte_depuis_html(fragment: str) -> str:
    texte = re.sub(r"<[^>]+>", " ", fragment or "")
    return re.sub(r"\s+", " ", html.unescape(texte)).strip()


def fiche_depuis_resultat(resultat: dict, maintenant: str, aujourdhui: date) -> dict | None:
    """Un résultat de l'interface -> fiche AapNormalized (dict), ou None si hors santé, sans titre ou sans identifiant."""
    meta = resultat.get("metadata") or {}
    identifiant, titre = _premier(meta, "identifier"), _premier(meta, "title")
    financeur = financeur_de(identifiant)
    if not financeur or not titre:
        return None
    mini, maxi, enveloppe = montants(_premier(meta, "budgetOverview"), identifiant)
    entete = " ; ".join(t for t in (_premier(meta, "callTitle"), _premier(meta, "typesOfAction").replace("  ", " ")) if t)
    description = (entete + ". " if entete else "") + texte_depuis_html(_premier(meta, "descriptionByte"))
    url = _premier(meta, "url") or ("https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/"
                                    f"topic-details/{identifiant}")
    fiche = AapNormalized(
        titre=titre.strip(), financeur=financeur, description=description[:LONGUEUR_DESCRIPTION], url_source=url,
        date_ouverture=date_iso(_premier(meta, "startDate")),
        date_cloture=prochaine_date(meta.get("deadlineDate") or [], aujourdhui),
        montant_min=mini, montant_max=maxi, enveloppe_globale=enveloppe, territoire="Europe",
        scrape_metadata={
            "source": SOURCE_ID, "moteur": "api-portail", "modele": "", "scraped_at": maintenant, "collecte_le": maintenant,
            "produite_le": maintenant, "vue_rubrique_le": maintenant, "identifiant_portail": identifiant,
            "statut_portail": STATUTS.get(_premier(meta, "status"), _premier(meta, "status")),
            "champ": "sante", "champ_raison": "programme européen de santé (identifiant " + identifiant.split("-20")[0] + ")",
            "champ_modele": "", "champ_source": "connecteur",
        },
    )
    return fiche.model_dump()


def fiches_de_sante(resultats: list[dict], maintenant: str, aujourdhui: date) -> list[dict]:
    """Fiches des appels de santé, une par identifiant (l'interface renvoie des doublons), dans l'ordre de lecture.
    Le portail laisse « ouvert » ou « à venir » des appels clos depuis 2023-2024 : ceux dont toutes les dates limites
    sont passées sont écartés (26 le 2026-10-28)."""
    vus, fiches = set(), []
    for r in resultats:
        fiche = fiche_depuis_resultat(r, maintenant, aujourdhui)
        if fiche and fiche.get("date_cloture") and fiche["date_cloture"] < aujourdhui.isoformat():
            continue
        if fiche and fiche["scrape_metadata"]["identifiant_portail"] not in vus:
            vus.add(fiche["scrape_metadata"]["identifiant_portail"])
            fiches.append(fiche)
    return fiches


def conserver_enrichissements(nouvelles: list[dict], anciennes: list[dict]) -> list[dict]:
    """Reprend la qualification et le contrôle du modèle des fiches du fichier précédent, par identifiant du portail :
    le connecteur réécrit son fichier à chaque veille et ces résultats ont été payés (fonction pure)."""
    par_id = {(a.get("scrape_metadata") or {}).get("identifiant_portail"): a["scrape_metadata"] for a in anciennes}
    for f in nouvelles:
        ancien = par_id.get(f["scrape_metadata"]["identifiant_portail"]) or {}
        f["scrape_metadata"].update({k: ancien[k] for k in ENRICHISSEMENTS if k in ancien})
    return nouvelles


def resume(fiches: list[dict], aujourdhui: date) -> dict:
    ouvertes = [f for f in fiches if f["scrape_metadata"]["statut_portail"] == "ouvert"
                and (not f.get("date_cloture") or f["date_cloture"] >= aujourdhui.isoformat())]
    par_financeur: dict[str, int] = {}
    for f in fiches:
        par_financeur[f["financeur"]] = par_financeur.get(f["financeur"], 0) + 1
    return {"fiches": len(fiches), "ouvertes": len(ouvertes), "par_financeur": par_financeur}


def lire_tout() -> list[dict]:
    """Tous les appels ouverts ou à venir, page par page (environ 1 200 résultats, 13 pages le 2026-10-28)."""
    resultats: list[dict] = []
    with httpx.Client(timeout=60, headers=DEFAULT_HTTP_HEADERS) as client:
        for page in range(1, PAGES_MAX + 1):
            fichiers = {"query": ("blob", json.dumps(FILTRE), "application/json"),
                        "languages": ("blob", json.dumps(["en"]), "application/json"),
                        "sort": ("blob", json.dumps(TRI), "application/json")}
            reponse = client.post(RECHERCHE, params={"apiKey": "SEDIA", "text": "***", "pageSize": TAILLE_PAGE,
                                                     "pageNumber": page}, files=fichiers)
            reponse.raise_for_status()
            donnees = reponse.json()
            lot = donnees.get("results") or []
            resultats += lot
            if not lot or len(resultats) >= int(donnees.get("totalResults") or 0):
                break
    return resultats


def main() -> int:
    ensure_utf8_stdout()
    parser = argparse.ArgumentParser(description="Portail Funding & Tenders -> results/funding_tenders.json")
    parser.add_argument("--fichier", help="liste de résultats déjà enregistrée (sinon lecture de l'interface)")
    args = parser.parse_args()
    try:
        resultats = json.loads(Path(args.fichier).read_text(encoding="utf-8")) if args.fichier else lire_tout()
    except (httpx.HTTPError, ValueError, OSError) as err:
        print(f"Interface du portail indisponible, fichier de résultats inchangé : {err}")
        return 1
    aujourdhui = date.today()
    fiches = fiches_de_sante(resultats, datetime.now(timezone.utc).isoformat(), aujourdhui)
    anciennes = json.loads(SORTIE.read_text(encoding="utf-8")) if SORTIE.exists() else []
    fiches = conserver_enrichissements(fiches, anciennes)
    r = resume(fiches, aujourdhui)
    SORTIE.parent.mkdir(exist_ok=True)
    SORTIE.write_text(json.dumps(fiches, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(resultats)} résultats lus, {r['fiches']} appels de santé retenus, dont {r['ouvertes']} ouverts "
          f"-> {SORTIE.name}")
    for financeur, n in sorted(r["par_financeur"].items(), key=lambda x: -x[1]):
        print(f"  {n:4} {financeur}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
