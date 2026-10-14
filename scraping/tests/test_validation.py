"""Tests des fonctions pures de validation.py (spec validation-manuelle-aap)."""
import json

import validation


def _fiche(source: str, n: int) -> dict:
    return {"url_source": f"https://{source}.fr/lien-{n}", "scrape_metadata": {"source": source}}


def test_echantillonner_un_lien_par_source_a_tour_de_role():
    fiches = [_fiche("a", 1), _fiche("a", 2), _fiche("b", 1), _fiche("b", 2), _fiche("c", 1)]
    choisis = validation.echantillonner(fiches, 3)
    assert len(choisis) == 3
    assert {f["scrape_metadata"]["source"] for f in choisis} == {"a", "b", "c"}  # une source par lien
    assert all(f["url_source"].endswith("lien-1") for f in choisis)  # le meilleur score de chaque source d'abord
    assert validation.echantillonner(fiches, 3) == choisis  # même liste à chaque lancement (graine fixe)


def test_echantillonner_depasse_le_nombre_de_sources():
    fiches = [_fiche("a", 1), _fiche("a", 2), _fiche("b", 1)]
    choisis = validation.echantillonner(fiches, 10)
    assert len(choisis) == 3  # tous les liens, sans doublon ni plantage


def test_liens_casses_ecartes(tmp_path, monkeypatch):
    # Un registre d'une source confirmée et sa liste de liens, dont un gabarit non rempli (cas Fondation APICIL).
    monkeypatch.setattr(validation, "ICI", tmp_path)
    (tmp_path / "sources").mkdir()
    (tmp_path / "sources" / "registre.json").write_text(json.dumps([
        {"id": "apicil", "nom": "Fondation APICIL", "categorie": "fondation", "url_aap": "https://www.fondation-apicil.org/appel-a-projets/",
         "qualification": {"verdict": "rubrique-confirmee"}}]), encoding="utf-8")
    (tmp_path / "decouverte" / "apicil").mkdir(parents=True)
    (tmp_path / "decouverte" / "apicil" / "liens.json").write_text(json.dumps({"liens": [
        {"href": "https://www.fondation-apicil.org/appel-a-projets/[", "texte": "[#DSR_FORM_URL_TEXT#]", "score": 9},
        {"href": "https://www.fondation-apicil.org/aap-douleur", "texte": "Appel à projets douleur", "score": 3},
        {"href": "https://www.fondation-apicil.org/aap-douleur", "texte": "doublon", "score": 1}]}), encoding="utf-8")
    fiches = validation.liens_des_rubriques_confirmees()
    assert [f["url_source"] for f in fiches] == ["https://www.fondation-apicil.org/aap-douleur"]
    assert fiches[0]["titre"] == "Appel à projets douleur"
    assert fiches[0]["scrape_metadata"]["modele"].startswith("lien")


def test_pages_gardees_une_fiche_par_rubrique_confirmee(tmp_path, monkeypatch):
    monkeypatch.setattr(validation, "ICI", tmp_path)
    (tmp_path / "sources").mkdir()
    (tmp_path / "decouverte").mkdir()
    (tmp_path / "sources" / "registre.json").write_text(json.dumps([
        {"id": "fdf", "nom": "Fondation de France", "categorie": "fondation", "url_aap": "https://www.fondationdefrance.org",
         "qualification": {"verdict": "rubrique-confirmee"}},
        {"id": "autre", "nom": "Autre", "categorie": "x", "url_aap": "https://autre.fr", "qualification": {"verdict": "hors-sante"}}]),
        encoding="utf-8")
    (tmp_path / "decouverte" / "resultats.json").write_text(json.dumps({
        "fdf": {"url_rubrique": "https://www.fondationdefrance.org/fr/appels-a-projets", "nb_liens_aap": 20}}), encoding="utf-8")
    fiches = validation.pages_gardees()
    assert len(fiches) == 1
    assert fiches[0]["url_source"] == "https://www.fondationdefrance.org/fr/appels-a-projets"  # l'adresse gardée par la découverte
    assert fiches[0]["enveloppe_globale"] == 20
    assert fiches[0]["scrape_metadata"]["modele"].startswith("page")


def test_pages_gardees_sources_exclues_avec_motif(tmp_path, monkeypatch):
    # Cas Bpifrance : exclue « hors santé » par le modèle puis par la relecture ; une autre source exclue sans page gardée.
    monkeypatch.setattr(validation, "ICI", tmp_path)
    (tmp_path / "sources").mkdir()
    (tmp_path / "decouverte").mkdir()
    (tmp_path / "sources" / "registre.json").write_text(json.dumps([
        {"id": "bpifrance", "nom": "Bpifrance", "categorie": "agence-nationale", "url_aap": "https://www.bpifrance.fr/nos-appels-a-projets-concours",
         "qualification": {"verdict": "hors-sante", "justification": "appels industriels",
                           "relecture": {"motif": "industrie, clusters Eureka, espace de données"}}},
        {"id": "sans-page", "nom": "Sans page", "categorie": "autre", "url_aap": "https://sans-page.fr",
         "qualification": {"verdict": "a-verifier", "justification": "rien"}},
        {"id": "ok", "nom": "Confirmée", "categorie": "autre", "url_aap": "https://ok.fr", "qualification": {"verdict": "rubrique-confirmee"}}]),
        encoding="utf-8")
    (tmp_path / "decouverte" / "resultats.json").write_text(json.dumps({
        "bpifrance": {"url_rubrique": "https://www.bpifrance.fr/nos-appels-a-projets-concours", "nb_liens_aap": 10},
        "sans-page": {"url_rubrique": None, "nb_liens_aap": 0},
        "ok": {"url_rubrique": "https://ok.fr/aap", "nb_liens_aap": 3}}), encoding="utf-8")
    fiches = validation.pages_gardees(("hors-sante", "a-verifier"))
    assert [f["scrape_metadata"]["source"] for f in fiches] == ["bpifrance"]  # la confirmée est hors liste, la sans page est ignorée
    assert fiches[0]["verdict_actuel"] == "hors-sante"
    assert fiches[0]["motif"] == "industrie, clusters Eureka, espace de données"  # le motif de la relecture prime sur celui du modèle


def _registre_min():
    return [{"id": "bpi", "nom": "Bpifrance", "url_aap": "https://www.bpifrance.fr/", "qualification": {"verdict": "hors-sante"}},
            {"id": "inserm", "nom": "Inserm", "url_aap": "https://www.inserm.fr/", "notes": "", "qualification": {"verdict": "rubrique-confirmee"}},
            {"id": "mort", "nom": "Morte", "url_aap": "https://morte.fr/", "qualification": {"verdict": "a-verifier"}},
            {"id": "deja", "nom": "Deja", "url_aap": "https://deja.fr/", "qualification": {"verdict": "rubrique-confirmee"}}]


def test_appliquer_verdicts_pages_correspondance_et_adresse():
    resultats = {"bpi": {"url_rubrique": "https://www.bpifrance.fr/aap"}, "inserm": {"url_rubrique": "https://www.inserm.fr/vieux"},
                 "mort": {"url_rubrique": "https://morte.fr/x"}, "deja": {"url_rubrique": "https://deja.fr/aap"}}
    verdicts = {"https://www.bpifrance.fr/aap": {"verdict": "bonne-page", "commentaire": "", "date": "2026-10-13 15:00"},
                "https://www.inserm.fr/vieux": {"verdict": "mauvaise-page", "commentaire": "https://pro.inserm.fr/agenda et https://autre.fr/", "date": "2026-10-13 15:01"},
                "https://morte.fr/x": {"verdict": "page-morte", "commentaire": "", "date": "2026-10-13"},
                "https://deja.fr/aap": {"verdict": "bonne-page", "commentaire": "", "date": "2026-10-13"},
                "https://inconnue.fr/": {"verdict": "hors-champ", "commentaire": "", "date": "2026-10-13"},
                "https://deja.fr/passer": {"verdict": "passer", "commentaire": "", "date": "2026-10-13"}}
    registre = _registre_min()
    relecture_avant = {"bpi": {"verdict": "hors-sante", "motif": "relu sur texte", "date": "2026-10-12", "relecteur": "session"}}
    relecture, bilan = validation.appliquer_verdicts_pages(verdicts, resultats, registre, relecture_avant, "2026-10-13")
    assert relecture["bpi"]["verdict"] == "rubrique-confirmee" and relecture["bpi"]["relecteur"] == validation.RELECTEUR_ECRAN
    assert relecture["bpi"]["relecture_precedente"]["motif"] == "relu sur texte"  # relecture antérieure conservée
    assert relecture["bpi"]["date"] == "2026-10-13"
    inserm = next(s for s in registre if s["id"] == "inserm")
    # l'adresse d'origine reste, la correction humaine vit dans url_validee (organisation-donnees-validees)
    assert inserm["url_aap"] == "https://www.inserm.fr/" and inserm["url_validee"] == "https://pro.inserm.fr/agenda"
    assert inserm["validee_par"] == validation.RELECTEUR_ECRAN and inserm["validee_le"] == "2026-10-13"
    assert "ancienne : https://www.inserm.fr/" in inserm["notes"] and "autre page : https://autre.fr/" in inserm["notes"]
    assert relecture["inserm"]["verdict"] == "rubrique-confirmee"
    assert bilan["corrigees"] == [("inserm", "https://www.inserm.fr/", "https://pro.inserm.fr/agenda")]
    assert relecture["mort"]["verdict"] == "a-verifier" and bilan["a_retrouver"] == ["mort"]
    assert "deja" not in relecture and bilan["deja_confirmees"] == 1  # déjà confirmée : rien à écrire
    assert bilan["sans_source"] == ["https://inconnue.fr/"] and bilan["ignores"] == 1
    assert relecture_avant == {"bpi": {"verdict": "hors-sante", "motif": "relu sur texte", "date": "2026-10-12", "relecteur": "session"}}
    # écart de redécouverte : la page gardée de l'Inserm est encore sur l'ancien domaine
    assert validation.ecarts_redecouverte(bilan["corrigees"], resultats) == [("inserm", "https://pro.inserm.fr/agenda", "https://www.inserm.fr/vieux")]
    assert validation.ecarts_redecouverte(bilan["corrigees"], {"inserm": {"url_rubrique": "https://pro.inserm.fr/agenda2"}}) == []


def test_migrer_verdicts_sauvegarde_copie_sans_ecraser_et_renomme(tmp_path, monkeypatch):
    """Lot 0, instruction 7 : essai a blanc sans ecriture, puis sauvegarde, fusion sans ecraser, renommage des anciens."""
    import json
    import validation
    ancien_pages, nouveau_pages = tmp_path / "results" / "validation_pages.json", tmp_path / "sources" / "verdicts_pages.json"
    ancien_liens, nouveau_liens = tmp_path / "results" / "validation_liens.json", tmp_path / "sources" / "verdicts_liens.json"
    ancien_pages.parent.mkdir()
    nouveau_pages.parent.mkdir()
    ancien_pages.write_text(json.dumps({"https://a": {"verdict": "bonne-page"}, "https://b": {"verdict": "page-morte"}}), encoding="utf-8")
    nouveau_pages.write_text(json.dumps({"https://b": {"verdict": "bonne-page"}}), encoding="utf-8")  # plus recent : a garder
    ancien_liens.write_text(json.dumps({"https://l": {"verdict": "aap-juste"}}), encoding="utf-8")
    monkeypatch.setattr(validation, "ANCIENS_VERDICTS", {ancien_pages: nouveau_pages, ancien_liens: nouveau_liens})
    monkeypatch.setattr(validation, "SAUVEGARDES", tmp_path / "sauvegardes")
    assert validation.migrer_verdicts(dry_run=True) == 0
    assert ancien_pages.exists() and not nouveau_liens.exists()  # l'essai a blanc n'ecrit rien
    assert validation.migrer_verdicts(dry_run=False) == 0
    assert json.loads(nouveau_pages.read_text(encoding="utf-8")) == {"https://a": {"verdict": "bonne-page"}, "https://b": {"verdict": "bonne-page"}}
    assert json.loads(nouveau_liens.read_text(encoding="utf-8")) == {"https://l": {"verdict": "aap-juste"}}
    assert not ancien_pages.exists() and ancien_pages.with_suffix(".json.migre").exists()
    assert len(list((tmp_path / "sauvegardes").glob("verdicts_*/validation_*.json"))) == 2
