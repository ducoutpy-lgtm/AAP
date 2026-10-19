"""Tests des fonctions pures de l'échantillon d'extraction (sans réseau, sans Ollama)."""
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import echantillon  # noqa: E402


def test_choisir_rubriques_une_par_famille_la_plus_riche():
    resultats = {"a": {"id": "a", "categorie": "ars", "statut": "rubrique-trouvee", "nb_liens_aap": 5},
                 "b": {"id": "b", "categorie": "ars", "statut": "rubrique-trouvee", "nb_liens_aap": 9},
                 "c": {"id": "c", "categorie": "fondation", "statut": "aucune-rubrique", "nb_liens_aap": 0},
                 "d": {"id": "d", "categorie": "europe", "statut": "rubrique-trouvee", "nb_liens_aap": 1}}
    assert [r["id"] for r in echantillon.choisir_rubriques(resultats, ["ars", "fondation", "europe"])] == ["b", "d"]


def test_liens_a_lire_mieux_notes_sans_doublon():
    liens = [{"href": "u1", "score": 1}, {"href": "u2", "score": 4}, {"href": "u2", "score": 4}, {"href": "u3", "score": 2},
             {"href": "https://x.fr/cahier.PDF?v=1", "score": 9}]
    assert [l["href"] for l in echantillon.liens_a_lire(liens, maximum=2)] == ["u2", "u3"]


def test_nettoyer_texte_compacte_et_borne():
    assert echantillon.nettoyer_texte("  a  \n\n\n\n b \n") == "a\n\nb"
    assert len(echantillon.nettoyer_texte("x" * 100, maximum=10)) == 10


def test_valider_fiche_complete_url_et_financeur():
    brut = {"titre": "AAP test", "financeur": "", "description": "d", "eligibilite": [], "pieces_attendues": [],
            "categories_etablissement": [], "date_cloture": "2026-12-31"}
    fiche = echantillon.valider_fiche(brut, "https://x.fr/aap", "ARS Test")
    assert fiche.url_source == "https://x.fr/aap" and fiche.financeur == "ARS Test"


def test_valider_fiche_refuse_un_montant_texte():
    brut = {"titre": "AAP", "financeur": "F", "description": "d", "montant_max": "dix mille"}
    with pytest.raises(Exception):
        echantillon.valider_fiche(brut, "https://x.fr", "F")


def test_estimer_cout():
    e = echantillon.estimer_cout(caracteres=4_000_000, nb_fiches=1000)  # 1 M tokens d'entrée
    attendu = (3.0 + 1000 * 1662 / 1e6 * 15.0) * 0.95
    assert e["tokens_entree"] == 1_000_000 and e["euros"] == round(attendu, 2)


def test_rapport_compte_les_fiches_justes():
    sorties = {"ollama": [{"url_source": "https://a.fr/1", "scrape_metadata": {"source": "a", "duree_s": 12}},
                          {"url_source": "https://a.fr/2", "scrape_metadata": {"source": "a", "duree_s": 8}}]}
    controle = {"https://a.fr/1": {"ollama": {"titre": True, "financeur": True, "date_cloture": True, "montant": True}},
                "https://a.fr/2": {"ollama": {"titre": True, "financeur": False, "date_cloture": True, "montant": True}}}
    texte = echantillon.rapport(sorties, controle, None, [{"url": "https://a.fr/2", "raison": "liste"}])
    assert "| ollama | 2 | 2 | 1 | 1 | 20 s | 0 euro | seuil non atteint |" in texte
    assert "| a | [page](https://a.fr/2) | oui | oui non oui oui |" in texte
    assert "jugées hors sujet" in texte and ": 1." in texte
    assert "au moins 20 fiches justes" in texte


def test_nom_de_fichier_par_modele():
    assert echantillon.nom_modele("mistral:7b-instruct") == "mistral-7b-instruct"
    assert echantillon.fichier_sortie("ollama", "qwen3:8b").name == "echantillon_ollama_qwen3-8b.json"
    assert echantillon.cle_controle("ollama", "qwen3:8b") == "ollama_qwen3-8b"
    assert echantillon.cle_controle("claude_code", "x") == "claude_code_auto"  # la colonne relue à la main reste intacte


def test_ecarts_format_et_neutralisation():
    brut = {"titre": "AAP", "financeur": "Non spécifié", "date_cloture": "20 Septembre 2026", "date_ouverture": None,
            "montant_min": None, "montant_max": "10 000", "enveloppe_globale": "oui"}
    ecarts = echantillon.ecarts_format(brut)
    assert [e.split(" ")[0] for e in ecarts] == ["date_cloture", "montant_max", "enveloppe_globale", "financeur"]
    assert "20 Septembre 2026" in ecarts[0]
    corrige = echantillon.neutraliser(brut, ecarts)
    assert corrige["date_cloture"] is None and corrige["montant_max"] is None and corrige["enveloppe_globale"] is None
    assert corrige["financeur"] == ""  # sera remplacé par le nom de la rubrique
    assert echantillon.ecarts_format({"financeur": "CNSA", "date_cloture": "2026-10-15", "montant_max": 150000,
                                      "enveloppe_globale": "10,5 millions d'euros"}) == []
    assert echantillon.ecarts_format({"financeur": "CNSA", "date_cloture": "2026-02-30"})  # date impossible


def test_nombre_dans():
    assert echantillon.nombre_dans("10,5 millions d'euros (7 M pour...)") == 10_500_000
    assert echantillon.nombre_dans("6,58 millions d'euros de FEDER") == 6_580_000
    assert echantillon.nombre_dans("22,3 M€") == 22_300_000
    assert echantillon.nombre_dans("400 000 €") == 400_000
    assert echantillon.nombre_dans("6000000") == 6_000_000
    assert echantillon.nombre_dans(None) is None and echantillon.nombre_dans("oui") is None


def test_comparer_fiche_contre_la_reference():
    reference = {"titre": "Appel à projets général 2023 (FIRAH)", "financeur": "FIRAH (Fondation internationale de la recherche appliquée sur le handicap)",
                 "date_cloture": "2023-03-20", "montant_min": None, "montant_max": None, "enveloppe_globale": None}
    produite = {"titre": "Appel à projets général - 2023", "financeur": "FIRAH", "date_cloture": "2023-03-20",
                "montant_min": None, "montant_max": None, "enveloppe_globale": None}
    assert echantillon.comparer_fiche(produite, reference) == {"titre": True, "financeur": True, "date_cloture": True, "montant": True}
    assert echantillon.comparer_fiche(reference, reference) == {"titre": True, "financeur": True, "date_cloture": True, "montant": True}
    autre = {**produite, "financeur": "Agence régionale de santé", "date_cloture": None, "enveloppe_globale": "oui"}
    assert echantillon.comparer_fiche(autre, reference) == {"titre": True, "financeur": False, "date_cloture": False, "montant": True}
    assert echantillon.comparer_fiche({**produite, "montant_max": 150000}, reference)["montant"] is False
    assert echantillon.verdict_seuil(20, 2) == "seuil atteint" and echantillon.verdict_seuil(19, 0) == "seuil non atteint"
    # Même montant dans un autre champ : juste ; montant manquant : faux
    assert echantillon.comparer_fiche({**produite, "montant_max": 400000}, {**reference, "enveloppe_globale": "400 000 euros"})["montant"] is True
    assert echantillon.comparer_fiche({**produite, "montant_max": 150000},
                                      {**reference, "montant_max": 150000, "enveloppe_globale": "10,5 millions d'euros"})["montant"] is False


def test_comparer_fiche_accepte_une_valeur_confirmee_par_la_page():
    page = ("Appel à projets général 2024\nClôture de la réception des lettres d'intention : lundi 25 mars 2024.\n"
            "Clôture de la réception des dossiers complets : Lundi 23 septembre 2024 inclus à minuit.")
    reference = {"titre": "Appel à projets de recherche appliquée 2024 - Général (FIRAH)", "financeur": "FIRAH", "date_cloture": "2024-03-25"}
    produite = {"titre": "Appel à projets général 2024", "financeur": "FIRAH", "date_cloture": "2024-09-23"}
    sans_page = echantillon.comparer_fiche(produite, reference)
    assert sans_page["titre"] is True  # mots communs majoritaires
    assert sans_page["date_cloture"] is False  # autre échéance que la référence, page inconnue
    avec_page = echantillon.comparer_fiche(produite, reference, page)
    assert avec_page["titre"] is True and avec_page["date_cloture"] is True  # échéance confirmée par la page
    assert echantillon.comparer_fiche({"titre": "Réforme des redevances 2025", "financeur": "FIRAH", "date_cloture": None},
                                      reference, page)["titre"] is False
    assert echantillon.comparer_fiche({**produite, "date_cloture": "2024-10-06"}, reference, page)["date_cloture"] is False
    assert echantillon.date_dans_texte("2026-11-08", "Date limite : 8 novembre 2026") is True
    assert echantillon.date_dans_texte("2026-11-08", "Date limite : 08/11/2026") is True


# ---------------------------------------------------------------- moteur api (lot 0, instruction 17), sans aucun appel

def test_adresses_echantillon_reference_et_hors_sujet():
    ref = [{"url_source": "https://a"}, {"url_source": "https://b"}]
    non = [{"url": "https://b"}, {"url": "https://c"}]
    assert echantillon.adresses_echantillon(ref, non) == {"https://a", "https://b", "https://c"}


def test_cout_cumule_lit_le_journal_par_modele(tmp_path):
    import json
    journal = tmp_path / "couts.jsonl"
    journal.write_text("\n".join(json.dumps(l) for l in [
        {"model": "claude-haiku-5-5", "cost_eur_approx": 0.010},
        {"model": "claude-sonnet-4-6", "cost_eur_approx": 0.500},
        {"model": "claude-haiku-5-5", "cost_eur_approx": 0.005}]) + "\n", encoding="utf-8")
    assert abs(echantillon.cout_cumule("claude-haiku-5-5", journal) - 0.015) < 1e-9
    assert echantillon.cout_cumule("inconnu", journal) == 0.0
    assert echantillon.cout_cumule("claude-haiku-5-5", tmp_path / "absent.jsonl") == 0.0


def test_estimation_plafond_et_noms_de_sortie():
    tarifs = {"entree": 0.10, "sortie": 0.50}
    estimation = echantillon.estimation_appel_euros(4000, tarifs)  # un texte de 4 000 caractères
    assert 0 < estimation < 0.01
    assert echantillon.plafond_atteint(4.999, estimation, 5.0) is True  # 4,999 + ~0,001 > 5
    assert echantillon.plafond_atteint(0.0, estimation, 5.0) is False
    assert echantillon.fichier_sortie("api", "claude-haiku-5-5").name == "echantillon_api_claude-haiku-5-5.json"
    assert echantillon.cle_controle("api", "claude-haiku-5-5") == "api_claude-haiku-5-5"


def test_tarifs_par_modele_dans_extractor():
    import extractor
    assert extractor.cout_usd("claude-haiku-5-5", 1_000_000, 0) == 0.10
    assert extractor.cout_usd("claude-haiku-5-5", 0, 1_000_000) == 0.50
    assert extractor.cout_usd("claude-sonnet-4-6", 1_000_000, 1_000_000) == 18.0
    with pytest.raises(ValueError, match="tarif inconnu"):
        extractor.cout_usd("modele-sans-tarif", 1, 1)


def test_fiches_par_adresse_lit_toutes_les_rubriques_sans_doublon(tmp_path, monkeypatch):
    # Lot 0 (2026-10-14) : les cinq textes FIRAH n'étaient plus lus parce que la rubrique n'était plus retenue par
    # famille ; les textes de l'échantillon sont désormais trouvés par adresse, un texte par adresse.
    monkeypatch.setattr(echantillon, "DOSSIER", tmp_path)
    for rubrique, nom, url in [("a", "1", "https://x/aap-1"), ("b", "2", "https://x/aap-2"),
                               ("b", "3", "https://x/hors-echantillon"), ("b", "4", "https://x/aap-1")]:
        dossier = tmp_path / rubrique / "fiches"
        dossier.mkdir(parents=True, exist_ok=True)
        (dossier / f"{nom}.txt").write_text(url + "\ntexte", encoding="utf-8")
    resultats = {"a": {"id": "a", "nom": "A"}, "b": {"id": "b", "nom": "B"}, "c": {"id": "c", "nom": "sans dossier"}}
    fiches = echantillon.fiches_par_adresse(resultats, {"https://x/aap-1", "https://x/aap-2"})
    assert [(r["id"], c.name) for r, c in fiches] == [("a", "1.txt"), ("b", "2.txt")]


def test_extraire_accepte_une_liste_explicite_de_textes(tmp_path, monkeypatch):
    # Comparaison sur 50 pages : extraire() reçoit la liste des textes au lieu de lire les rubriques ; le modèle
    # local est remplacé par une fonction qui refuse tout, aucun appel réel.
    chemin = tmp_path / "decouverte" / "src" / "fiches" / "a.txt"
    chemin.parent.mkdir(parents=True)
    chemin.write_text("https://x/page-a\nlien\n\ntexte de la page", encoding="utf-8")
    monkeypatch.setattr(echantillon, "ICI", tmp_path)
    monkeypatch.setattr(echantillon, "RESULTS", tmp_path / "results")
    monkeypatch.setattr(echantillon, "appeler_ollama", lambda *a, **k: {"est_aap": False, "raison": "pas un appel"})
    sortie = tmp_path / "results" / "comparaison_ollama_test.json"
    echantillon.extraire([], "ollama", "test", None, chemin_sortie=sortie, fiches=[({"id": "src", "nom": "Source"}, chemin)])
    refus = json.loads(sortie.with_name(sortie.stem + "_non_aap.json").read_text(encoding="utf-8"))
    assert [r["url"] for r in refus] == ["https://x/page-a"] and not sortie.exists()


def test_extraire_api_accepte_adresses_et_fichier_de_sortie(tmp_path, monkeypatch):
    # Même chose pour le moteur api : adresses et fichier de sortie explicites ; la question fermée est remplacée
    # par une fonction qui refuse, donc aucun appel payant et aucune ligne dans le journal.
    import extractor
    chemin = tmp_path / "decouverte" / "src" / "fiches" / "b.txt"
    chemin.parent.mkdir(parents=True)
    chemin.write_text("https://x/page-b\nlien\n\ntexte de la page", encoding="utf-8")
    monkeypatch.setattr(echantillon, "ICI", tmp_path)
    monkeypatch.setattr(echantillon, "DOSSIER", tmp_path / "decouverte")
    monkeypatch.setattr(echantillon, "RESULTS", tmp_path / "results")
    monkeypatch.setattr(echantillon, "cout_cumule", lambda *a, **k: 0.0)
    monkeypatch.setattr(extractor, "est_un_aap", lambda *a, **k: {"est_aap": False, "raison": "pas un appel"})
    sortie = tmp_path / "results" / "comparaison_api_test.json"
    echantillon.extraire_api({"src": {"id": "src", "nom": "Source"}}, "claude-haiku-5-5", None, 5.0,
                             adresses={"https://x/page-b"}, chemin_sortie=sortie)
    refus = json.loads(sortie.with_name(sortie.stem + "_non_aap.json").read_text(encoding="utf-8"))
    assert [r["url"] for r in refus] == ["https://x/page-b"] and not sortie.exists()


FICHE_BRUTE = {"titre": "Appel santé mentale", "financeur": "ARS Test", "description": "Soutien aux CMP.",
               "date_ouverture": "2026-01-10", "date_cloture": "2026-12-31", "montant_min": None, "montant_max": 50000,
               "enveloppe_globale": None, "eligibilite": [], "pieces_attendues": [], "territoire": "Bretagne",
               "categories_etablissement": ["psychiatrie"]}


def test_extraire_pose_la_question_du_champ_apres_l_extraction(tmp_path, monkeypatch):
    # filtre-champ-sante 5.1 (consigne 4) : trois réponses du modèle local dans l'ordre (est_aap, fiche, champ) ;
    # la fiche produite porte son champ et la version 4, sans classement rétroactif.
    chemin = tmp_path / "decouverte" / "src" / "fiches" / "c.txt"
    chemin.parent.mkdir(parents=True)
    chemin.write_text("https://x/page-c\nlien\n\ntexte de la page", encoding="utf-8")
    monkeypatch.setattr(echantillon, "ICI", tmp_path)
    monkeypatch.setattr(echantillon, "RESULTS", tmp_path / "results")
    reponses = iter([{"est_aap": True, "raison": "appel"}, FICHE_BRUTE, {"champ": "Santé", "raison": "santé mentale"}])
    appels = []
    def faux_ollama(modele, messages, schema):
        appels.append(messages[0]["content"][:40])
        return next(reponses)
    monkeypatch.setattr(echantillon, "appeler_ollama", faux_ollama)
    sortie = tmp_path / "results" / "extraction_test.json"
    echantillon.extraire([], "ollama", "test", None, chemin_sortie=sortie, metadonnees={"a_verifier": True},
                         fiches=[({"id": "src", "nom": "Source"}, chemin)])
    [fiche] = json.loads(sortie.read_text(encoding="utf-8"))
    meta = fiche["scrape_metadata"]
    assert meta["champ"] == "sante" and meta["champ_raison"] == "santé mentale" and meta["champ_modele"] == "test"
    assert meta["champ_source"] == "page" and meta["version_consigne"] == 4 and meta["a_verifier"] is True
    assert len(appels) == 3 and appels[2].startswith(echantillon.CONSIGNE_CHAMP[:40])


def test_echec_de_la_question_du_champ_ne_perd_pas_la_fiche(monkeypatch):
    def plante(*a, **k):
        raise ConnectionError("Ollama injoignable")
    monkeypatch.setattr(echantillon, "poser_question_champ", plante)
    meta = echantillon.question_champ_sans_echec("ollama", "test", "texte", "https://x", "src")
    assert meta["champ"] == "incertain" and meta["champ_raison"].startswith("échec : ConnectionError")


def test_extraire_api_pose_la_question_du_champ(tmp_path, monkeypatch):
    # Moteur api : troisième appel (extractor.champ_aap) remplacé par une fonction locale, aucun appel payant.
    import extractor
    chemin = tmp_path / "decouverte" / "src" / "fiches" / "d.txt"
    chemin.parent.mkdir(parents=True)
    chemin.write_text("https://x/page-d\nlien\n\ntexte de la page", encoding="utf-8")
    monkeypatch.setattr(echantillon, "ICI", tmp_path)
    monkeypatch.setattr(echantillon, "DOSSIER", tmp_path / "decouverte")
    monkeypatch.setattr(echantillon, "RESULTS", tmp_path / "results")
    monkeypatch.setattr(echantillon, "cout_cumule", lambda *a, **k: 0.0)
    monkeypatch.setattr(extractor, "est_un_aap", lambda *a, **k: {"est_aap": True, "raison": "appel"})
    monkeypatch.setattr(extractor, "extract_aap", lambda *a, **k: dict(FICHE_BRUTE))
    monkeypatch.setattr(extractor, "champ_aap", lambda *a, **k: {"champ": "medico-social", "raison": "EHPAD"})
    sortie = tmp_path / "results" / "comparaison_api_test2.json"
    echantillon.extraire_api({"src": {"id": "src", "nom": "Source"}}, "claude-haiku-5-5", None, 5.0,
                             adresses={"https://x/page-d"}, chemin_sortie=sortie)
    [fiche] = json.loads(sortie.read_text(encoding="utf-8"))
    assert fiche["scrape_metadata"]["champ"] == "medico-social" and fiche["scrape_metadata"]["version_consigne"] == 4
