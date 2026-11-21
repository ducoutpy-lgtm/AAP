"""Tests de veille_payante.py (changement veille-autonome), sans réseau ni appel au modèle."""
import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import veille_payante as vp  # noqa: E402


def test_semaine_du_lundi_au_dimanche():
    assert vp.lundi_de(date(2026, 11, 13)) == date(2026, 11, 9)
    assert vp.lundi_de(date(2026, 11, 16)) == date(2026, 11, 16)


def test_depense_de_la_semaine():
    lignes = [json.dumps({"timestamp": t, "model": m, "cost_eur_approx": c}) for t, m, c in [
        ("2026-11-08T23:59:00Z", vp.MODELE, 0.30),  # dimanche : semaine précédente
        ("2026-11-09T08:10:00Z", vp.MODELE, 0.05),
        ("2026-11-12T10:00:00Z", vp.MODELE, 0.02),
        ("2026-11-12T10:00:00Z", "claude-sonnet-4-6", 1.00)]]  # autre modèle
    assert round(vp.depense_semaine(lignes, date(2026, 11, 9)), 3) == 0.07


def test_lecture_des_devis():
    assert vp.montant_devis("Devis : 60 textes restants, 175,249 caractères ; modèle claude-haiku-5-5, tarif 0.1 USD "
                            "entrée ; coût estimé 0.07 euros au plus (trois appels par texte) ; déjà dépensé 2.822 euros") == 0.07
    assert vp.montant_devis("Essai à blanc : 0 fiches à vérifier, 0.000 euros estimés ; rien n'a été écrit ni appelé.") == 0.0
    assert vp.montant_devis("Essai à blanc : 12 fiches à qualifier, 0.004 euros estimés ; rien n'a été écrit") == 0.004
    assert vp.montant_devis("sortie sans devis") is None


def test_devis_retenu_avec_marge_mesuree():
    """Le contrôle et la qualification sous-estiment leur coût (0,0003 euro par fiche annoncé, environ 0,0006 mesuré le
    2026-11-13 : arrêt au plafond après 9 fiches sur 16) ; l'extraction annonce déjà un maximum."""
    assert vp.devis_retenu("contrôle", 0.005) == 0.01 and vp.devis_retenu("qualification", 0.004) == 0.008
    assert vp.devis_retenu("extraction", 0.07) == 0.07 and vp.devis_retenu("extraction", None) is None


def test_decision_dans_la_delegation():
    assert vp.decision(0.07, depense=0.0, cumul=2.822) == (True, 2.892, "dans la délégation")
    ok, _, motif = vp.decision(0.60, depense=0.0, cumul=2.822)
    assert not ok and "semaine" in motif
    ok, _, motif = vp.decision(0.10, depense=0.45, cumul=2.822)
    assert not ok and "semaine" in motif
    ok, _, motif = vp.decision(0.10, depense=0.0, cumul=4.45)
    assert not ok and "4,50" in motif
    assert vp.decision(None, depense=0.0, cumul=2.822)[0] is False


def test_devis_lu_dans_la_sortie_d_un_script_enfant_avec_accents():
    """Constat du 2026-11-16 : la sortie à blanc du contrôle arrivait en encodage Windows (« estim�s »), le devis était
    illisible et la veille s'arrêtait au contrôle."""
    import veille_payante as v
    code, sortie = v.lancer(["-c", "print('76 fiches à vérifier, 0.031 euros estimés')"])
    assert code == 0 and "estimés" in sortie and v.montant_devis(sortie) == 0.031


# Changement veille-modele-local (2026-11-21, « Modèle local ») : extraction, contrôle et qualification par le modèle
# local par défaut, fichier à part, rien sur batterie ; l'API seulement avec --moteur api.
def test_etapes_locales_par_defaut():
    assert vp.MOTEUR == "ollama"
    etapes = vp.etapes("ollama")
    assert [n for n, _ in etapes] == ["extraction", "contrôle", "qualification"]
    assert all("api" not in commande for _, commande in etapes)
    assert "--sans-pdf" in dict(etapes)["extraction"]
    for nom in ("contrôle", "qualification"):
        assert dict(etapes)[nom][-4:] == ["--moteur", "ollama", "--fichier", vp.FICHES_VEILLE_LOCALE]
    assert vp.source_import("ollama") == "extraction_veille_locale"


def test_chemin_api_inchange_sur_demande():
    etapes = dict(vp.etapes("api"))
    assert etapes["extraction"] == ["extraction_locale.py", "--extraire", "--moteur", "api", "--sans-pdf"]
    assert etapes["contrôle"][-2:] == ["--fichier", vp.FICHES_API]
    assert vp.source_import("api") == "extraction_api"


def test_modele_local_seulement_sur_secteur():
    # ACLineStatus de Windows : 1 secteur, 0 batterie, 255 inconnu (poste fixe sans batterie : on lance)
    assert vp.local_permis(1) is True and vp.local_permis(255) is True
    assert vp.local_permis(0) is False


def _veille(monkeypatch, secteur, argv):
    appels = []
    monkeypatch.setattr(vp, "etat_secteur", lambda: secteur)
    monkeypatch.setattr(vp, "rester_eveille", lambda actif: None)
    monkeypatch.setattr(vp, "lancer", lambda arguments: (appels.append(arguments), (0, ""))[1])
    assert vp.main(argv) == 0
    return appels


def test_veille_locale_lance_les_trois_etapes_puis_l_import_et_le_tri(monkeypatch):
    appels = _veille(monkeypatch, 1, ["--reel"])
    assert [Path(a[0]).name for a in appels] == ["extraction_locale.py", "verification.py", "qualifier_fiches.py",
                                                 "import_to_firestore.py", "trier_file.py"]
    assert all("--dry-run" not in a and "--plafond" not in a for a in appels)
    assert appels[3][1:] == ["--source", "extraction_veille_locale", "--a-valider"]


def test_veille_locale_sur_batterie_reporte_tout(monkeypatch):
    assert _veille(monkeypatch, 0, ["--reel"]) == []


def test_veille_locale_a_blanc_ne_lance_rien(monkeypatch):
    assert _veille(monkeypatch, 1, []) == []
