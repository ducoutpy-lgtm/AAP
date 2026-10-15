"""Migration : le controle du modele vaut relecture (changement verification-assistee-haiku, decision de Monsieur
DUCOUT du 2026-10-15, midi : « je t'avais demande d'utiliser Haiku pour controler et valider toutes ces fiches »).

Pourquoi : l'import ne reecrit jamais status ni validation d'une fiche deja enregistree (lot 0). Les fiches deja
dans la base, controlees par le modele, doivent donc recevoir sa decision par une operation unique, apres
sauvegarde et accord de Monsieur DUCOUT. Un verdict humain existant l'emporte toujours.

Ce que fait le script, pour chaque fiche controlee (scrape_metadata.verification) dans le champ :
  1. calcule la decision (scraping/verification.decision_du_modele) : validee, rejetee ou a_corriger, et les
     corrections lisibles (dates, montants) lues sur la page par le modele ;
  2. retrouve le document (identifiant derive de l'adresse) ; passe si verdict humain ou brouillon hors champ ;
  3. --dry-run : affiche les comptes et cinq exemples, n'ecrit rien ;
  4. sinon : sauvegarde JSON dans scripts/sauvegardes/controle_<date>.json, puis ecrit validation (au nom du
     modele), tags, les champs corriges (deadline, publicationDate, budgetMin, budgetMax, budgetTotal) et
     status = archived pour une fiche rejetee. Rien d'autre n'est touche.

Usage :
  python scripts/appliquer_controle.py --dry-run
  python scripts/appliquer_controle.py
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import import_to_firestore as imp  # noqa: E402
import verification  # noqa: E402

SAUVEGARDES = Path(__file__).resolve().parent / "sauvegardes"
# Champ de la fiche corrige -> champs du document a reecrire.
CHAMPS_DOCUMENT = {"date_cloture": ("deadline",), "date_ouverture": ("publicationDate",), "montant_min": ("budgetMin",),
                   "montant_max": ("budgetMax",), "enveloppe_globale": ("budgetTotal",)}


def modifications(item: dict, source_name: str, decision: dict, now: datetime, today: date) -> dict:
    """Ce qui serait ecrit pour une fiche controlee (fonction pure) : validation, tags, champs corriges, status."""
    doc = imp.to_app_aap(verification.appliquer_corrections(item, decision), source_name, now)
    if "deadline" not in doc:
        doc = imp.sans_date_en_attente(doc, today)
    doc = imp.appliquer_decision_du_modele(imp.champ_en_attente(imp.appliquer_verdict(doc, None), today), decision)
    maj = {"validation": doc["validation"], "tags": doc["tags"]}
    for champ in decision["corrections"]:
        for cle in CHAMPS_DOCUMENT[champ]:
            maj[cle] = doc.get(cle)
    if "enveloppe_globale" in decision["corrections"]:
        maj["scrapeMetadata.enveloppeGlobale"] = decision["corrections"]["enveloppe_globale"]
    if decision["statut"] == "rejetee":
        maj["status"] = "archived"
    return maj


def _serialisable(valeur):
    return valeur.isoformat() if hasattr(valeur, "isoformat") else valeur


def main() -> int:
    parser = argparse.ArgumentParser(description="Decision du controle du modele appliquee aux fiches de la base.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--key", default=str(imp.DEFAULT_KEY))
    args = parser.parse_args()
    if not Path(args.key).exists():
        print(f"Cle de compte de service introuvable : {args.key}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import credentials, firestore

    firebase_admin.initialize_app(credentials.Certificate(args.key))
    col = firestore.client().collection("aap")
    now, today = datetime.now(timezone.utc), date.today()
    a_ecrire, bilan = [], Counter()
    # Une fiche par adresse, le connecteur l'emportant sur le modele local (meme regle que l'import, fusionner).
    fiches: dict[str, tuple[str, dict]] = {}
    for source_name, item in imp.load_results(None):
        if not item.get("url_source") or (item.get("scrape_metadata") or {}).get("champ") == "hors-champ":
            continue
        ident = imp.identifiant(item["url_source"])
        actuel = fiches.get(ident)
        moteur = (item.get("scrape_metadata") or {}).get("moteur")
        if actuel is None or not (moteur == "ollama" and (actuel[1].get("scrape_metadata") or {}).get("moteur") != "ollama"):
            fiches[ident] = (source_name, item)
    for ident, (source_name, item) in fiches.items():
        decision = verification.decision_du_modele(item)
        if not decision:
            continue
        snap = col.document(ident).get()
        if not snap.exists:
            bilan["absente de la base"] += 1
            continue
        d = snap.to_dict()
        val = d.get("validation") or {}
        if val.get("par") == imp.RELECTEUR:
            bilan["verdict humain, conservee"] += 1
            continue
        if "hors-champ" in (d.get("tags") or []):
            bilan["brouillon hors champ, conservee"] += 1
            continue
        maj = modifications(item, source_name, decision, now, today)
        if val.get("statut") == decision["statut"] and val.get("par") == maj["validation"]["par"]:
            bilan["deja appliquee"] += 1
            continue
        bilan[decision["statut"]] += 1
        for champ in decision["corrections"]:
            bilan[f"correction {champ}"] += 1
        a_ecrire.append((ident, d, maj))
    print("Bilan : " + ", ".join(f"{k} {v}" for k, v in sorted(bilan.items())))
    print(f"{len(a_ecrire)} fiches a mettre a jour")
    for ident, d, maj in a_ecrire[:5]:
        print(f"  {ident}  {(d.get('title') or '')[:55]}  -> {maj['validation']['statut']} : {maj['validation']['commentaire'][:90]}")
    if args.dry_run:
        print("Essai a blanc : rien n'a ete ecrit.")
        return 0
    if not a_ecrire:
        return 0

    SAUVEGARDES.mkdir(exist_ok=True)
    chemin = SAUVEGARDES / f"controle_{datetime.now().strftime('%Y-%m-%d_%H%M')}.json"
    chemin.write_text(json.dumps({i: {k: _serialisable(v) for k, v in d.items()} for i, d, _ in a_ecrire},
                                 ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    print(f"Sauvegarde : {chemin} ({len(a_ecrire)} fiches)")
    batch, pending, ecrites = col._client.batch(), 0, 0
    for ident, _, maj in a_ecrire:
        batch.update(col.document(ident), maj)
        pending += 1
        ecrites += 1
        if pending >= 400:
            batch.commit()
            batch, pending = col._client.batch(), 0
    if pending:
        batch.commit()
    print(f"Mises a jour : {ecrites} fiches.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
