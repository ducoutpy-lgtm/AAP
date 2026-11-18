"""Tests de la mesure d'exactitude (changement mesure-exactitude-30-fiches, tâche 1.1)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import exactitude as e  # noqa: E402


def _fiche(i: int, jour: str, champ: str) -> dict:
    return {"titre": f"Appel {i}", "financeur": "ARS", "date_cloture": None, "montant_max": None, "montant_min": None,
            "enveloppe_globale": None, "url_source": f"https://exemple.fr/{i:03d}",
            "scrape_metadata": {"produite_le": f"{jour}T10:00:00", "champ": champ, "fichier": f"decouverte/x/{i}.txt"}}


FICHES = ([_fiche(i, "2026-10-28", "sante") for i in range(20)] + [_fiche(i, "2026-10-28", "medico-social") for i in range(20, 40)]
          + [_fiche(i, "2026-10-28", "hors-champ") for i in range(40, 50)] + [_fiche(i, "2026-11-13", "sante") for i in range(50, 60)]
          + [_fiche(i, "2026-10-19", "sante") for i in range(60, 70)])


def test_tirage_rejouable_filtre_par_periode_et_par_champ():
    t1 = e.tirer(FICHES, n=30)
    t2 = e.tirer(list(reversed(FICHES)), n=30)
    assert [f["url"] for f in t1] == [f["url"] for f in t2] and len(t1) == 30
    numeros = {int(f["url"].rsplit("/", 1)[1]) for f in t1}
    assert numeros <= set(range(40))
    assert set(t1[0]) == {"url", "titre", "financeur", "date_cloture", "montant", "fichier"}


def test_moins_de_fiches_que_demande_toutes_retenues():
    assert len(e.tirer(FICHES[:5], n=30)) == 5


def _verdicts(justes: int, dates_inventees: int) -> list[dict]:
    champs = []
    for i in range(30):
        champs.append({"url": f"u{i}", "champs": {c: {"verdict": "juste", "preuve": ""} for c in e.CHAMPS}})
    reste = 120 - justes
    for i in range(reste):
        champs[i]["champs"]["montant"]["verdict"] = "faux"
    for i in range(dates_inventees):
        champs[29 - i]["champs"]["date_cloture"]["verdict"] = "invente"
    return champs


def test_rapport_seuil_non_atteint_par_une_date_inventee():
    r = e.resume(_verdicts(111, 1))  # 110 justes : 9 montants faux et 1 date inventée
    assert (r["justes"], r["total"], r["dates_inventees"], r["seuil_atteint"]) == (110, 120, 1, False)
    assert "110 / 120 champs justes (91,7 %)" in e.texte_rapport(r, [])
    assert "seuil non atteint" in e.texte_rapport(r, [])


def test_rapport_seuil_atteint_et_vide_juste_compte_comme_juste():
    v = _verdicts(120, 0)
    v[0]["champs"]["montant"]["verdict"] = "vide-juste"
    r = e.resume(v)
    assert (r["justes"], r["seuil_atteint"]) == (120, True)
    assert "seuil atteint" in e.texte_rapport(r, [])


def test_le_texte_ecrit_a_la_main_apres_le_repere_est_garde():
    ancien = "# Ancien calcul\n\n" + e.REPERE + "\n## Méthode\n\nTexte écrit à la main.\n"
    nouveau = e.assembler("# Nouveau calcul\n", ancien)
    assert nouveau.startswith("# Nouveau calcul\n") and "Texte écrit à la main." in nouveau and "Ancien calcul" not in nouveau
    assert e.assembler("# Calcul\n", "") == "# Calcul\n\n" + e.REPERE + "\n"
