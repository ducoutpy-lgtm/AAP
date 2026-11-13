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
