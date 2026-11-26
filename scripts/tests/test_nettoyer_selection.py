"""Tests de scripts/nettoyer_selection.py (selection-des-appels, 2026-11-26) : fonctions pures, aucun Firestore."""
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(RACINE / "scripts"))
sys.path.insert(0, str(RACINE / "scraping"))
import import_to_firestore as imp  # noqa: E402
import nettoyer_selection as ns  # noqa: E402

ECRAN = "Vérification de sécurité en cours. Ce site vérifie que vous n’êtes pas un bot."


def test_textes_bloques_et_entrees_retirees(tmp_path):
    fiches = tmp_path / "decouverte" / "grand-est" / "fiches"
    fiches.mkdir(parents=True)
    (fiches / "a.txt").write_text("# collecte_le 2026-11-16T11:21:40\nhttps://www.grandest.fr/x\nlien\n\n" + ECRAN, encoding="utf-8")
    (fiches / "b.txt").write_text("https://www.grandest.fr/y\nlien\n\nAppel à projets santé mentale, dépôt avant le 31/12.",
                                  encoding="utf-8")
    assert [p.name for p in ns.textes_bloques(tmp_path / "decouverte")] == ["a.txt"]
    entrees = [{"scrape_metadata": {"fichier": "decouverte\\grand-est\\fiches\\a.txt"}, "titre": "Pacte"},
               {"fichier": "decouverte/grand-est/fiches/a.txt", "raison": "refus"},
               {"scrape_metadata": {"fichier": "decouverte\\grand-est\\fiches\\b.txt"}, "titre": "Santé mentale"}]
    restent = ns.sans_entrees(entrees, {"decouverte/grand-est/fiches/a.txt"})
    assert [e.get("titre") for e in restent] == ["Santé mentale"]


def _doc(**k):
    base = {"title": "t", "description": "Appel.", "externalUrl": "https://www.exemple.fr/appel", "status": "published",
            "financeurName": "ARS Bretagne", "validation": {"statut": "validee", "par": "claude-haiku-5-5"},
            "scrapeMetadata": {"source": "ars-bretagne", "financeurExtrait": "ARS Bretagne"}}
    return {**base, **k}


def test_plan_de_la_base():
    medicen = _doc(title="Appel A Projets France 2030 : « Première Usine »",
                   financeurName="Medicen Paris Region – appels à projets (dans le cadre du plan France 2030)",
                   scrapeMetadata={"source": "medicen-paris-region",
                                   "financeurExtrait": "Medicen Paris Region – appels à projets (dans le cadre du plan France 2030)"})
    docs = [
        ("prado", _doc(externalUrl="https://marchespublics.ampmetropole.fr/?page=x&id=510860")),
        ("urbanisme", _doc(description="La page source affichait uniquement un écran de vérification de sécurité (protection anti-bots).")),
        ("deja", _doc(externalUrl="https://marchespublics.ampmetropole.fr/?id=2", status="archived",
                      validation={"statut": "rejetee", "par": "x"})),
        ("relue", _doc(externalUrl="https://marchespublics.ampmetropole.fr/?id=3", validation={"statut": "validee", "par": imp.RELECTEUR})),
        ("medicen", medicen),
        ("normale", _doc()),
    ]
    # Financeur corrigé par la relecture du 2026-11-26 (EIT Health sur une fiche de Biotech Santé Bretagne) : jamais réécrit
    docs.append(("eit", _doc(financeurName="EIT Health", scrapeMetadata={
        "source": "biotech-sante-bretagne", "financeurExtrait": "Biotech Santé Bretagne – appels à projets"})))
    plan, relues = ns.plan_base(docs, imp.EMETTEURS, imp.FINANCEURS, "2026-11-27", {"eit": {"financeur": "EIT Health"}})
    par_id = {p["id"]: p for p in plan}
    assert set(par_id) == {"prado", "urbanisme", "medicen"} and relues == ["relue"]
    assert par_id["prado"]["changements"]["status"] == "archived"
    assert par_id["prado"]["changements"]["validation"]["commentaire"] == "marché public"
    assert par_id["urbanisme"]["changements"]["validation"]["commentaire"] == "page bloquée à la collecte"
    assert par_id["medicen"]["changements"] == {"financeurName": "France 2030 (État)"}
