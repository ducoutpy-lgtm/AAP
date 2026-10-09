"""Import des AAP scrapes (scraping/results/*.json) dans Firestore (collection "aap").

Jonction entre le volet scraping (schema AapNormalized, scraping/schema.py) et
l'application web (type AAP, app/src/types/index.ts).

Pourquoi un script separe plutot qu'un appel direct depuis le scraper ?
  - Le scraping produit des JSON (contrat machine) ; l'ecriture en base est un acte distinct,
    rejouable, que l'on peut lancer en --dry-run pour controler avant d'ecrire.
  - On garde le principe "un outil = une responsabilite" du POC.

Pre-requis :
  pip install -r scripts/requirements.txt
  Cle de compte de service Firebase dans scripts/serviceAccountKey.json (ignoree par Git).
  Console Firebase > Parametres du projet > Comptes de service > Generer une nouvelle cle privee.

Usage :
  python scripts/import_to_firestore.py --dry-run
  python scripts/import_to_firestore.py
  python scripts/import_to_firestore.py --source fondation_de_france
  python scripts/import_to_firestore.py --include-expired   # importe aussi les AAP deja clos
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESULTS_DIR = ROOT / "scraping" / "results"
DEFAULT_KEY = ROOT / "scripts" / "serviceAccountKey.json"

# Identifiant de "financeur" pour les AAP importes automatiquement.
# Les AAP scrapes n'appartiennent a aucun compte financeur de la plateforme.
SCRAPED_FINANCEUR_ID = "scraped"

# Correspondance territoire (texte libre du scraping) -> valeur REGIONS de l'application
# (app/src/pages/financeur/CreateAapPage.tsx). Comparaison insensible a la casse et aux accents.
REGIONS = {
    "auvergne-rhone-alpes": "auvergne-rhone-alpes",
    "bourgogne-franche-comte": "bourgogne-franche-comte",
    "bretagne": "bretagne",
    "centre-val-de-loire": "centre-val-de-loire",
    "corse": "corse",
    "grand-est": "grand-est",
    "hauts-de-france": "hauts-de-france",
    "ile-de-france": "ile-de-france",
    "normandie": "normandie",
    "nouvelle-aquitaine": "nouvelle-aquitaine",
    "occitanie": "occitanie",
    "pays-de-la-loire": "pays-de-la-loire",
    "provence-alpes-cote-d-azur": "provence-alpes-cote-d-azur",
    "paca": "provence-alpes-cote-d-azur",
}


def _slug(text: str) -> str:
    """Normalise un texte : minuscules, sans accents, tirets."""
    import unicodedata

    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text


def signature(titre: str, financeur: str, date_cloture: str | None) -> str:
    """Meme formule que scraping/orchestrator.py : import idempotent."""
    base = f"{(titre or '').strip().lower()}|{(financeur or '').strip().lower()}|{date_cloture or ''}"
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]


def parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def map_territoires(territoire: str | None) -> list[str]:
    if not territoire:
        return ["france"]
    s = _slug(territoire)
    found = [v for k, v in REGIONS.items() if k in s]
    if found:
        return sorted(set(found))
    if "national" in s or "france" in s:
        return ["france"]
    return ["france"]  # inconnu : on reste visible pour tous, le texte brut est conserve dans tags


def parse_budget_total(enveloppe: str | None) -> int | None:
    """Extrait un montant entier d'une chaine du type '2 500 000 euros'. Retourne None si ambigu."""
    if not enveloppe:
        return None
    digits = re.findall(r"\d[\d\s .]*", enveloppe)
    if len(digits) != 1:
        return None
    try:
        return int(re.sub(r"[\s .]", "", digits[0]))
    except ValueError:
        return None


def to_app_aap(item: dict, source_name: str, now: datetime) -> dict | None:
    """Mappe un AapNormalized vers le type AAP de l'application. Retourne None si inexploitable."""
    titre = (item.get("titre") or "").strip()
    financeur = (item.get("financeur") or "").strip()
    if not titre or not financeur:
        return None

    deadline = parse_date(item.get("date_cloture"))
    publication = parse_date(item.get("date_ouverture"))

    tags = [source_name]
    if item.get("territoire"):
        tags.append(item["territoire"].strip())
    for cat in item.get("categories_etablissement") or []:
        tags.append(cat.strip())

    doc = {
        "financeurId": SCRAPED_FINANCEUR_ID,
        "financeurName": financeur,
        "title": titre,
        "description": (item.get("description") or "").strip(),
        # Specialisation sante : tous les AAP scrapes relevent du secteur "sante" ou "social"
        # de l'application. [A VALIDER - Monsieur DUCOUT : affiner par source si besoin]
        "sectorsTargeted": ["sante", "social"],
        "territoriesEligible": map_territoires(item.get("territoire")),
        "structureTypeEligible": item.get("categories_etablissement") or [],
        "budgetMin": item.get("montant_min"),
        "budgetMax": item.get("montant_max"),
        "budgetTotal": parse_budget_total(item.get("enveloppe_globale")),
        "deadline": deadline,
        "publicationDate": publication,
        "eligibilityCriteria": "\n".join(f"- {e}" for e in item.get("eligibilite") or []) or None,
        "requiredDocuments": item.get("pieces_attendues") or [],
        "externalUrl": item.get("url_source"),
        "tags": [t for t in tags if t],
        "status": "published",
        "source": "scraped",
        "scrapeMetadata": {
            "source": source_name,
            "signature": signature(titre, financeur, item.get("date_cloture")),
            "enveloppeGlobale": item.get("enveloppe_globale"),
            "fichiersJoints": [
                {"url": f.get("url"), "filename": f.get("filename")}
                for f in item.get("fichiers_joints") or []
            ],
            "importedAt": now,
        },
        "views": 0,
        "applicationsCount": 0,
        "updatedAt": now,
    }
    # Firestore refuse les None dans certains SDK ; on les retire pour rester propre.
    return {k: v for k, v in doc.items() if v is not None}


def load_results(source_filter: str | None) -> list[tuple[str, dict]]:
    items: list[tuple[str, dict]] = []
    for path in sorted(RESULTS_DIR.glob("*.json")):
        if path.name.endswith(".errors.json"):
            continue
        source_name = path.stem
        if source_filter and source_name != source_filter:
            continue
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)
        if isinstance(data, dict):
            data = list(data.values())
        for item in data:
            items.append((source_name, item))
    return items


def main() -> int:
    parser = argparse.ArgumentParser(description="Import des AAP scrapes dans Firestore.")
    parser.add_argument("--dry-run", action="store_true", help="n'ecrit rien, affiche le resultat du mapping")
    parser.add_argument("--source", help="n'importer qu'une source (nom du fichier JSON sans extension)")
    parser.add_argument("--include-expired", action="store_true", help="importer aussi les AAP dont la cloture est passee")
    parser.add_argument(
        "--include-without-deadline",
        action="store_true",
        help="importer les AAP sans date de cloture (AAP permanents) avec une echeance fictive a +365 jours, tag 'sans-date-cloture'",
    )
    parser.add_argument("--key", default=str(DEFAULT_KEY), help="chemin de la cle de compte de service Firebase")
    args = parser.parse_args()

    if not RESULTS_DIR.exists():
        print(f"Dossier introuvable : {RESULTS_DIR}. Lancer d'abord scraping/run.py.", file=sys.stderr)
        return 1

    now = datetime.now(timezone.utc)
    today = date.today()
    raw = load_results(args.source)
    mapped: list[tuple[str, dict]] = []
    skipped = {"incomplet": 0, "sans_date_cloture": 0, "expire": 0}

    for source_name, item in raw:
        doc = to_app_aap(item, source_name, now)
        if doc is None:
            skipped["incomplet"] += 1
            continue
        if "deadline" not in doc:
            # Le type AAP exige une deadline : sans elle, l'affichage et le tri casseraient.
            if not args.include_without_deadline:
                skipped["sans_date_cloture"] += 1
                continue
            doc["deadline"] = datetime(today.year + 1, today.month, today.day, tzinfo=timezone.utc)
            doc["tags"] = doc.get("tags", []) + ["sans-date-cloture"]
        if not args.include_expired and doc["deadline"].date() < today:
            skipped["expire"] += 1
            continue
        mapped.append((doc["scrapeMetadata"]["signature"], doc))

    # Deux sources peuvent livrer le meme AAP (ars_idf et ars_idf_local) : meme signature, donc
    # meme document Firestore. On fusionne ici pour que les compteurs affiches correspondent au
    # nombre reel de documents ecrits (le dernier lu l'emporte).
    uniques = {sig: doc for sig, doc in mapped}
    doublons = len(mapped) - len(uniques)
    mapped = list(uniques.items())

    print(f"AAP lus : {len(raw)} | a importer : {len(mapped)} (dont {doublons} doublons fusionnes) | ignores : {skipped}")

    if args.dry_run:
        for sig, doc in mapped[:10]:
            print(f"  [{sig}] {doc['financeurName']} - {doc['title'][:70]} - cloture {doc['deadline'].date()}")
        if len(mapped) > 10:
            print(f"  ... et {len(mapped) - 10} autres")
        return 0

    key_path = Path(args.key)
    if not key_path.exists():
        print(f"Cle de compte de service introuvable : {key_path}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(str(key_path)))
    db = firestore.client()
    col = db.collection("aap")

    created = updated = 0
    batch = db.batch()
    pending = 0
    for sig, doc in mapped:
        ref = col.document(f"scraped-{sig}")
        exists = ref.get().exists
        if exists:
            updated += 1
            batch.set(ref, doc, merge=True)  # conserve views / applicationsCount existants
        else:
            created += 1
            batch.set(ref, {**doc, "createdAt": now, "publishedAt": now})
        pending += 1
        if pending >= 400:  # limite Firestore : 500 operations par batch
            batch.commit()
            batch = db.batch()
            pending = 0
    if pending:
        batch.commit()

    print(f"Termine : {created} crees, {updated} mis a jour, collection 'aap'.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
