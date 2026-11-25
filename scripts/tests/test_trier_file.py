"""Tests du tri automatique de la file « à valider » (changement tri-automatique-file, 2026-11-18)."""
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import trier_file as t  # noqa: E402

MAINTENANT = datetime(2026, 11, 18, tzinfo=timezone.utc)


def fiche(**kw):
    # Fiche collectée : financeurId et source posés par l'import (to_app_aap)
    base = {"financeurId": "scraped", "source": "scraped", "status": "draft",
            "validation": {"statut": "proposee", "par": "claude-haiku-5-5"},
            "deadline": MAINTENANT + timedelta(days=30),
            "scrapeMetadata": {"champ": "sante", "verification": {"estUnAppel": True, "douteux": ["description"]}}}
    base.update(kw)
    return base


def test_fiche_sure_sans_motif():
    assert t.motifs_de_doute(fiche(), MAINTENANT) == []
    assert t.motifs_de_doute(fiche(deadline=None), MAINTENANT) == []  # sans date : publiée avec la mention habituelle


def test_motifs_de_doute():
    sm = lambda **k: {"champ": "sante", "verification": {"estUnAppel": True, "douteux": []}, **k}  # noqa: E731
    assert t.motifs_de_doute(fiche(scrapeMetadata={"champ": "sante"}), MAINTENANT) == ["jamais contrôlée"]
    assert t.motifs_de_doute(fiche(scrapeMetadata=sm(verification={"estUnAppel": False, "douteux": []})), MAINTENANT) == ["pas un appel selon le contrôle"]
    assert t.motifs_de_doute(fiche(scrapeMetadata=sm(verification={"estUnAppel": True, "douteux": ["date_cloture", "description"]})), MAINTENANT) == ["doute du contrôle : date_cloture"]
    assert t.motifs_de_doute(fiche(scrapeMetadata=sm(champ="incertain")), MAINTENANT) == ["champ incertain"]
    assert t.motifs_de_doute(fiche(scrapeMetadata=sm(champ="hors-champ")), MAINTENANT) == ["hors champ"]
    assert t.motifs_de_doute(fiche(deadline=MAINTENANT - timedelta(days=1)), MAINTENANT) == ["appel clos"]


def test_decisions_doublons_puis_tri():
    file = [("garde", fiche()), ("double", fiche()), ("douteuse", fiche(scrapeMetadata={"champ": "incertain"})),
            ("relue", fiche(validation={"statut": "proposee", "par": "Monsieur DUCOUT"}))]
    groupes = [[file[0], file[1]]]
    d = t.decisions(file, groupes, lambda g: ("garde", "source officielle"), MAINTENANT)
    assert d["double"] == ("rejeter", "doublon de garde (source officielle)")
    assert d["garde"] == ("publier", "")
    assert d["douteuse"][0] == "laisser" and "champ incertain" in d["douteuse"][1]
    assert "relue" not in d



def test_une_fiche_archivee_ou_cloturee_a_la_main_n_entre_pas_dans_le_tri():
    """corrections-chaine-du-lundi 1.1 (2026-11-22) : « Archiver » et « Clôturer » de /admin/aaps ne changent que le
    statut ; la fiche garde « Proposée » et le tri la republiait. Elle ne doit ni être traitée ni servir de référence
    à un groupe de doublons."""
    import trier_file as t
    docs = [("brouillon", {"status": "draft", "validation": {"statut": "proposee"}}),
            ("publiee-proposee", {"status": "published", "validation": {"statut": "proposee"}}),
            ("archivee", {"status": "archived", "validation": {"statut": "proposee"}}),
            ("cloturee", {"status": "closed", "validation": {"statut": "proposee"}}),
            ("validee", {"status": "published", "validation": {"statut": "validee"}})]
    fiches, file = t.selection(docs)
    assert [i for i, _ in file] == ["brouillon", "publiee-proposee"]
    assert [i for i, _ in fiches] == ["brouillon", "publiee-proposee", "validee"]



def test_un_rapprochement_par_ricochet_ne_rejette_pas():
    """corrections-chaine-du-lundi 1.7 (2026-11-22) : les groupes se forment par ricochet (A ~ C, C ~ B) ; B, qui ne
    ressemble pas directement à la fiche gardée A (axes différents), était rejetée. Elle reste à relire."""
    from datetime import datetime, timezone

    import trier_file as t
    maintenant = datetime(2026, 11, 22, tzinfo=timezone.utc)
    a = ("axe3", {"title": "Appel à projets Axe 3 : coordination et appui", "financeurName": "CFPPA du Nord",
                  "status": "published", "validation": {"statut": "validee"}})
    b = ("axe5", {"title": "Appel à projets Axe 5 : actions collectives", "financeurName": "CFPPA du Nord",
                  "status": "draft", "validation": {"statut": "proposee"}})
    dec = t.decisions([b], [[a, b]], lambda g: ("axe3", "déjà publiée"), maintenant)
    assert dec["axe5"][0] != "rejeter"



def test_un_appel_saisi_par_un_financeur_reste_toujours_a_valider():
    """Plan niveau A, lot 1.2 (décision « Validation admin » du 2026-11-24) : le tri automatique ne publie jamais un
    appel saisi par un financeur, même sans autre doute ; seul l'administrateur le valide."""
    from datetime import datetime, timezone

    import trier_file as t
    fiche = {"source": "manual", "status": "published", "validation": {"statut": "proposee"},
             "scrapeMetadata": {"verification": {"estUnAppel": True, "douteux": []}, "champ": "sante"}}
    assert "saisi par un financeur" in t.motifs_de_doute(fiche, datetime(2026, 11, 24, tzinfo=timezone.utc))


def test_un_appel_de_financeur_sans_champ_source_reste_a_valider():
    """Relecture du 2026-11-25 (constat 6) : un appel créé par le SDK sans le champ `source` passait la règle de création
    et le tri le publiait. Il se reconnaît aussi à son financeurId (l'uid du financeur, jamais « scraped »)."""
    sans_source = fiche(financeurId="uid-financeur", scrapeMetadata={"champ": "sante",
                                                                      "verification": {"estUnAppel": True, "douteux": []}})
    del sans_source["source"]
    assert "saisi par un financeur" in t.motifs_de_doute(sans_source, MAINTENANT)
    assert t.decisions([("x", sans_source)], [], lambda g: ("", ""), MAINTENANT)["x"][0] == "laisser"


def test_un_appel_de_financeur_pris_pour_un_doublon_n_est_pas_archive():
    """Relecture du 2026-11-25 (constat 16) : un financeur saisit l'appel que la collecte a déjà publié ; le tri le
    rejetait comme doublon (archived, rejetee) sans que l'administrateur l'ait vu. Il reste à relire."""
    commun = {"title": "Appel à projets prévention des chutes", "financeurName": "ARS Normandie",
              "deadline": MAINTENANT + timedelta(days=30)}
    publiee = ("https-site-fr-aap", fiche(**commun, status="published",
                                          validation={"statut": "validee", "par": "claude-haiku-5-5"}))
    saisi = ("Xyz123", {**commun, "financeurId": "uid-financeur", "source": "manual", "status": "draft",
                        "validation": {"statut": "proposee", "par": ""}})
    dec = t.decisions([saisi], [[publiee, saisi]], lambda g: ("https-site-fr-aap", "déjà publiée"), MAINTENANT)
    assert dec["Xyz123"][0] == "laisser"
    assert "saisi par un financeur" in dec["Xyz123"][1] and "https-site-fr-aap" in dec["Xyz123"][1]


def test_cloture_comptee_en_jours_du_calendrier():
    """Relecture du 2026-11-25 (constat 22, décision 38 du 2026-11-24) : un appel qui clôt aujourd'hui (minuit UTC) reste
    ouvert tout son dernier jour, comme dans l'import, l'application et le courriel ; il est clos le lendemain."""
    maintenant = datetime(2026, 11, 30, 9, 0, tzinfo=timezone.utc)
    jour_meme = datetime(2026, 11, 30, tzinfo=timezone.utc)
    assert "appel clos" not in t.motifs_de_doute(fiche(deadline=jour_meme), maintenant)
    assert "appel clos" in t.motifs_de_doute(fiche(deadline=jour_meme - timedelta(days=1)), maintenant)
