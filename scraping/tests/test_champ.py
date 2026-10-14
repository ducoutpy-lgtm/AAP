"""Tests du filtre du champ (fonctions pures, sans réseau, sans Ollama, sans appel API)."""
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import champ  # noqa: E402
import echantillon  # noqa: E402


def test_normaliser_champ_ramene_a_quatre_valeurs():
    assert echantillon.normaliser_champ({"champ": "Santé", "raison": "soins"}) == ("sante", "soins")
    assert echantillon.normaliser_champ({"champ": "medico_social"})[0] == "medico-social"
    assert echantillon.normaliser_champ({"champ": "Hors champ"})[0] == "hors-champ"
    assert echantillon.normaliser_champ({"champ": "social"})[0] == "incertain"
    assert echantillon.normaliser_champ(None) == ("incertain", "")


def test_texte_pour_classement_page_puis_fiche(tmp_path):
    chemin = tmp_path / "decouverte" / "src" / "fiches" / "a.txt"
    chemin.parent.mkdir(parents=True)
    chemin.write_text("https://x/a\nlien\n\nTexte de la page", encoding="utf-8")
    fiche = {"titre": "T", "financeur": "F", "description": "D", "eligibilite": ["e1"], "categories_etablissement": ["EHPAD"],
             "scrape_metadata": {"fichier": "decouverte\\src\\fiches\\a.txt"}}
    assert champ.texte_pour_classement(fiche, tmp_path) == ("Texte de la page", "page")
    fiche["scrape_metadata"]["fichier"] = "decouverte/src/fiches/absent.txt"
    texte, origine = champ.texte_pour_classement(fiche, tmp_path)
    assert origine == "fiche" and "Titre : T" in texte and "EHPAD" in texte


def test_fichiers_de_l_import_memes_exclusions_que_l_import(tmp_path):
    for nom in ["ars_idf.json", "extraction_locale.json", "extraction_locale_non_aap.json", "extraction_locale.errors.json",
                "echantillon_claude_code.json", "controle_echantillon.json", "validation_x.json", "comparaison_api_h.json"]:
        (tmp_path / nom).write_text("[]", encoding="utf-8")
    assert [p.name for p in champ.fichiers_de_l_import(tmp_path)] == ["ars_idf.json", "extraction_locale.json"]


def test_a_classer_et_estimation():
    fiches = [{"scrape_metadata": {"champ": "sante"}}, {"scrape_metadata": {}}, {}]
    assert len(champ.a_classer(fiches)) == 2
    assert 0 < champ.estimation_euros(4000, "claude-haiku-5-5") < 0.001
    with pytest.raises(ValueError):
        champ.estimation_euros(4000, "modele-inconnu")


def test_evaluer_pur_accords_exacts_et_dans_hors():
    fiches = [{"url_source": "a", "scrape_metadata": {"champ": "sante", "champ_raison": "r1"}},
              {"url_source": "b", "scrape_metadata": {"champ": "medico-social"}},
              {"url_source": "c", "scrape_metadata": {"champ": "hors-champ", "champ_raison": "r3"}},
              {"url_source": "d", "scrape_metadata": {}},
              {"url_source": "e", "scrape_metadata": {"champ": "sante"}}]
    verdicts = {"a": "sante", "b": {"champ": "sante"}, "c": "medico-social", "d": "sante"}
    r = champ.evaluer_pur(fiches, verdicts)
    assert (r["comparables"], r["accords_exacts"], r["accords_dans_hors"]) == (3, 1, 2)
    assert r["desaccords"] == [{"url": "c", "modele": "hors-champ", "verdict": "medico-social", "raison": "r3"}]


def test_rapport_markdown_part_par_source_et_sources_a_revoir():
    fiches = ([{"scrape_metadata": {"source": "agence-eau", "champ": "hors-champ"}} for _ in range(5)]
              + [{"scrape_metadata": {"source": "ars-x", "champ": "sante"}} for _ in range(4)]
              + [{"scrape_metadata": {"source": "ars-x"}}])
    registre = {"agence-eau": {"categorie": "agence-nationale", "perimetre": "sante-et-medico-social", "notes": "lien indirect"},
                "ars-x": {"categorie": "ars", "perimetre": "sante"}}
    texte = champ.rapport_markdown(fiches, registre, "2026-10-14")
    assert "| ars-x | ars | 5 | 4 | 4 | 100 % |" in texte
    assert "| agence-eau | agence-nationale | 5 | 5 | 0 | 0 % |" in texte
    assert "- `agence-eau` (agence-nationale, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 5 classées (0 %). Notes du registre : lien indirect." in texte
    assert "hors-champ 5, sante 4, non classe 1" in texte
