import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import comparaison  # noqa: E402
import echantillon  # noqa: E402


def _candidats():
    # 20 ars, 10 fondation, 5 autre : quotas pour 7 = 4 ars, 2 fondation, 1 autre
    return ([{"url": f"https://ars/{i}", "categorie": "ars"} for i in range(20)]
            + [{"url": f"https://fond/{i}", "categorie": "fondation"} for i in range(10)]
            + [{"url": f"https://autre/{i}", "categorie": "autre"} for i in range(5)])


def test_tirer_pages_reproductible_au_prorata_sans_doublon():
    premier = comparaison.tirer_pages(_candidats(), 7, 2026)
    second = comparaison.tirer_pages(_candidats(), 7, 2026)
    assert premier == second and len(premier) == 7
    assert comparaison.repartition(premier) == "ars 4, fondation 2, autre 1"
    assert len({p["url"] for p in premier}) == 7
    assert comparaison.tirer_pages(_candidats(), 7, 1) != premier  # une autre graine, un autre tirage


def test_tirer_pages_bornes():
    assert comparaison.tirer_pages([], 50, 2026) == []
    assert len(comparaison.tirer_pages(_candidats(), 100, 2026)) == 35


def test_candidats_jamais_traites_exclut_traites_echantillon_et_doublons(tmp_path, monkeypatch):
    monkeypatch.setattr(echantillon, "DOSSIER", tmp_path / "decouverte")
    textes = {("a", "1"): "https://x/libre", ("a", "2"): "https://x/fiche-faite", ("a", "3"): "https://x/refusee",
              ("b", "4"): "https://x/echec", ("b", "5"): "https://x/echantillon", ("b", "6"): "https://x/libre"}
    for (source, nom), url in textes.items():
        dossier = tmp_path / "decouverte" / source / "fiches"
        dossier.mkdir(parents=True, exist_ok=True)
        (dossier / f"{nom}.txt").write_text(url + "\nlien\n\ntexte", encoding="utf-8")
    sources = [{"id": "a", "nom": "A", "categorie": "ars"}, {"id": "b", "nom": "B", "categorie": "autre"},
               {"id": "c", "nom": "sans dossier", "categorie": "autre"}]
    fiches = [{"url_source": "https://x/fiche-faite", "scrape_metadata": {"fichier": "decouverte\\a\\fiches\\2.txt"}}]
    refus = [{"url": "https://x/refusee", "fichier": "decouverte/a/fiches/3.txt"}]
    echecs = [{"fichier": "decouverte/b/fiches/4.txt"}]
    candidats = comparaison.candidats_jamais_traites(sources, fiches, refus, echecs, {"https://x/echantillon"})
    assert [(c["source"], c["url"]) for c in candidats] == [("a", "https://x/libre")]
    assert candidats[0]["fichier"] == "decouverte/a/fiches/1.txt" and candidats[0]["categorie"] == "ars"


def test_mesures_reperage_qualite_fabrications():
    pages = [{"url": f"u{i}"} for i in range(6)]
    verdicts = {"u0": {"page": "appel", "local": "juste"}, "u1": {"page": "appel", "local": "a-corriger"},
                "u2": {"page": "appel", "local": None}, "u3": {"page": "pas-un-appel", "local": None},
                "u4": {"page": "pas-un-appel", "local": None}}  # u5 : pas encore jugée
    resultats = {"u0": {"fiche": {}}, "u1": {"fiche": {}}, "u2": {"refus": "x"}, "u3": {"fiche": {}},
                 "u4": {"refus": "y"}, "u5": {"fiche": {}}}
    assert comparaison.mesures(pages, verdicts, resultats, "local") == {
        "traitees": 6, "jugees": 5, "appels": 3, "reperage": 3, "qualite": 1, "fabrications": 1}


def test_cout_journal_filtre_par_adresse_et_modele(tmp_path):
    journal = tmp_path / "couts.jsonl"
    journal.write_text('{"model": "m", "url": "a", "cost_eur_approx": 0.5}\n{"model": "m", "url": "b", "cost_eur_approx": 0.25}\n'
                       '{"model": "autre", "url": "a", "cost_eur_approx": 9}\n', encoding="utf-8")
    assert comparaison.cout_journal({"a"}, "m", journal) == (1, 0.5)
    assert comparaison.cout_journal({"a"}, "m", tmp_path / "absent.jsonl") == (0, 0.0)


def test_resultats_moteur_et_duree_totale():
    resultats = comparaison.resultats_moteur([{"url_source": "a", "scrape_metadata": {"duree_s": 10}}],
                                             [{"url": "b", "raison": "non", "duree_s": "2.5"}, {"url": "a", "raison": "doublon"}])
    assert "fiche" in resultats["a"] and resultats["b"]["refus"] == "non"
    assert comparaison.duree_totale(resultats) == 12.5


def test_verdict_invalide():
    adresses = {"a": {}}
    assert comparaison.verdict_invalide({"url": "x", "page": "appel"}, adresses) == "adresse hors liste"
    assert comparaison.verdict_invalide({"url": "a", "page": "bof"}, adresses) == "verdict de page manquant"
    assert comparaison.verdict_invalide({"url": "a", "page": "appel", "local": "nimporte"}, adresses) == "verdict local invalide"
    assert comparaison.verdict_invalide({"url": "a", "page": "pas-un-appel", "local": None, "api": "juste"}, adresses) is None


def test_rapport_markdown_pourcentages_et_liste():
    infos = {"graine": 2026, "candidats": 765}
    pages = [{"url": "u0", "nom": "Source A", "categorie": "collectivite"}, {"url": "u1", "nom": "Source B", "categorie": "collectivite"}]
    verdicts = {"u0": {"page": "appel", "local": "juste", "api": "a-corriger", "commentaire": "ok"}}
    local = {"u0": {"fiche": {"scrape_metadata": {"duree_s": 40}}}, "u1": {"refus": "non", "duree_s": 5}}
    api = {"u0": {"fiche": {"scrape_metadata": {"duree_s": 4}}}}
    texte = comparaison.rapport_markdown(infos, pages, verdicts, [("Modèle local", "local", "qwen3:8b", local, 45.0, "0 euro"),
                                                                 ("Modèle API", "api", "claude-haiku-5-5", api, 4.0, "0.001 euros")], "2026-10-14")
    assert "| Modèle local | qwen3:8b | 2 / 2 | 1 / 1 (100 %) | 1 / 1 (100 %) | 0 | 45 s | 0 euro |" in texte
    assert "| Modèle API | claude-haiku-5-5 | 1 / 2 | 1 / 1 (100 %) | 0 / 1 (0 %) | 0 | 4 s | 0.001 euros |" in texte
    assert "| 2 | Source B | [page](u1) |  | refus | - |  |" in texte


def test_rapport_markdown_compte_les_commentaires_hors_champ():
    pages = [{"url": "u0", "nom": "A", "categorie": "collectivite"}, {"url": "u1", "nom": "B", "categorie": "collectivite"}]
    verdicts = {"u0": {"page": "appel", "local": "juste", "api": None, "commentaire": "Hors champ : agriculture"},
                "u1": {"page": "appel", "local": None, "api": None, "commentaire": ""}}
    texte = comparaison.rapport_markdown({"graine": 1, "candidats": 2}, pages, verdicts,
                                         [("Modèle local", "local", "m", {}, 0.0, "0 euro"), ("Modèle API", "api", "h", {}, 0.0, "0 euro")],
                                         "2026-10-14")
    assert "question du 2026-10-14) : 1." in texte
