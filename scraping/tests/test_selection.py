"""Tests du changement selection-des-appels (2026-11-26) : pages bloquées et marchés publics écartés avant le modèle.
Textes tirés des cas relevés par Monsieur DUCOUT (Grand Est, Lozère, Métropole Aix-Marseille). Aucun appel réel."""
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import echantillon  # noqa: E402
import filtres_pages as fp  # noqa: E402

ANTI_ROBOT = ("APPELS À PROJETS\nDATE LIMITE DE DÉPÔT :\n30/01/2027\n\nAppel à projets : Pacte Enseignement Supérieur et "
              "Compétences 2025-2029\n\nwww.grandest.fr\nVérification de sécurité en cours\n\nCe site utilise un service de "
              "sécurité pour se protéger contre les bots malveillants. Cette page s’affiche pendant que le site vérifie que "
              "vous n’êtes pas un bot.")
ACCES_REFUSE = ("territoire à énergie positive\n\nAccès refusé\nVous n'êtes pas autorisé(e) à accéder à cette page.\n"
                "Actualités\nActions\nGrand angle\nÀ votre service")
URL_PRADO = "https://marchespublics.ampmetropole.fr/?page=Entreprise.EntrepriseAdvancedSearch&AllCons&id=510860&orgAcronyme=t5y"
PRADO = ("Procédure\nCatégorie\nPublié le\nRéférence | Intitulé\nDate limite de remise des plis\nMAPA\nServices\n2026K19\n"
         "APPEL A MANIFESTATION D’INTERET OUVERT - PROPOSITION D’ACTIVITES PAR LE CANDIDAT SIS 24 AVENUE DU PRADO\n"
         "Organisme : Métropole Aix-Marseille Provence\nAccéder à la consultation\nTélécharger le RC")
APPEL_ARS = ("L'ARS Bretagne lance un appel à projets pour renforcer l'offre de soins palliatifs à domicile. Le règlement de "
             "consultation et le cahier des charges sont joints. Dépôt des dossiers avant le 31/12/2026. " * 3)


# ---------------------------------------------------------------- filtres purs

def test_page_anti_robot_et_acces_refuse_reconnues():
    assert fp.page_bloquee(ANTI_ROBOT) == "page anti-robot"
    assert fp.page_bloquee(ACCES_REFUSE) == "accès refusé"
    assert fp.page_bloquee("Vous n'avez pas accès à cette page. Vous pouvez aller à l’accueil du site.") == "accès refusé"
    assert fp.page_bloquee(APPEL_ARS) is None
    # Un formulaire protégé par un CAPTCHA n'est pas une page bloquée (cas de l'URIOPSS et d'appelaprojets.org)
    assert fp.page_bloquee("Adresse e-mail *\nCAPTCHA\nCette question sert à vérifier si vous êtes un visiteur humain") is None
    # Faux positifs relevés à l'essai à blanc du 2026-11-26 : bandeau des cookies (Health Data Hub), case d'un
    # formulaire (Gers)
    assert fp.page_bloquee("Ces cookies permettent d'assurer le bon fonctionnement du site (par exemple vérifier que le "
                           "visiteur n’est pas un robot), de réaliser des mesures d’audience.") is None
    assert fp.page_bloquee("Vérification anti-spam (obligatoire)\nVeuillez cocher la case \"Je ne suis pas un robot\"") is None
    # Page oubliée par le premier relevé : préfecture de Côte-d'Or, erreur 401
    assert fp.page_bloquee("Accès refusé\n\nErreur 401\n\nVous n'avez pas le droit d'accéder à cette zone.") == "accès refusé"
    # Contre-vérification du 2026-11-26 : écran Cloudflare (37 textes : La Réunion, ministère, Somme), blocage ferme
    cloudflare = ("Appel à projets STIC, MATH et CLIMAT AmSud 2026\n\nSorry, you have been blocked\nYou are unable to access "
                  "enseignementsup-recherche.gouv.fr\nWhy have I been blocked?\n\nPlease include the Cloudflare Ray ID found at "
                  "the bottom of this page.")
    assert fp.page_bloquee(cloudflare) == "accès refusé"
    assert fp.page_bloquee("Just a moment...\nVerifying you are human. This may take a few seconds.") == "page anti-robot"
    # Apostrophe typographique (3 474 textes sur 3 940 l'emploient)
    assert fp.page_bloquee("Vous n’êtes pas autorisé(e) à accéder à cette page.") == "accès refusé"
    assert fp.page_bloquee("Vous n’avez pas accès à cette page.") == "accès refusé"


def test_marche_public_par_plateforme_ou_par_deux_marques():
    assert fp.marche_public(URL_PRADO, "") == "marché public (plateforme d'achat public)"
    assert fp.marche_public("https://www.marches-publics.gouv.fr/x", "") is not None
    assert fp.marche_public("https://www.boamp.fr/avis/detail/26-1", "") is not None
    assert fp.marche_public("https://www.exemple.fr/consultation/1", PRADO) == "marché public (consultation)"
    # Une seule marque dans un vrai appel de l'ARS : pas un marché public
    assert fp.marche_public("https://www.bretagne.ars.sante.fr/appel", APPEL_ARS) is None
    # Appel à projets du code de l'action sociale déposé sur le profil d'acheteur (Mayenne, essai à blanc du
    # 2026-11-26) : trois marques, mais le texte s'annonce « appel à projets »
    mayenne = ("Appel à projets-accueil et accompagnement de mineurs de 0 à 18 ans\n\nLe dossier devra contenir les pièces "
               "définies au présent règlement de la consultation. La copie de sauvegarde est admise avant la clôture de la "
               "remise des plis, sur le profil d'acheteur du pouvoir adjudicateur.")
    assert fp.marche_public("https://www.lamayenne.fr/sites/lamayenne.fr/files/x.pdf", mayenne) is None
    # « démarches » n'est pas « marchés » (Toulon, Territoire de Belfort)
    assert fp.marche_public("https://demarches.toulon.fr/infos_demarches/appel-a-projets/x", "") is None
    assert fp.marche_public("https://mesdemarches.territoiredebelfort.fr/catalogue/x", "") is None


def test_fiche_a_exclure_a_l_import():
    # Descriptions réelles du Grand Est : texte brut de l'écran, ou paraphrase du modèle
    assert fp.fiche_a_exclure("https://www.grandest.fr/appel-a-projet/x/", ANTI_ROBOT) == "page bloquée"
    paraphrase = ("DATE LIMITE DE DÉPÔT : 12/11/2026. AMI Territoires pilotes – Urbanisme Favorable à la Santé. La page source "
                  "affichait uniquement un écran de vérification de sécurité (protection anti-bots) empêchant l'accès au contenu.")
    assert fp.fiche_a_exclure("https://www.grandest.fr/appel-a-projet/y/", paraphrase) == "page bloquée"
    assert fp.fiche_a_exclure(URL_PRADO, "Activité de café") == "marché public"
    assert fp.fiche_a_exclure("https://www.enseignementsup-recherche.gouv.fr/x",
                              "Page bloquée par Cloudflare en raison d'une action suspecte.") == "page bloquée"
    assert fp.fiche_a_exclure("https://www.bretagne.ars.sante.fr/appel", APPEL_ARS) is None


# ---------------------------------------------------------------- collecte : relire une page anti-robot après l'attente

class FaussePage:
    def __init__(self, textes):
        self.textes, self.attentes = list(textes), []

    async def evaluate(self, js):
        return self.textes.pop(0)

    async def wait_for_timeout(self, ms):
        self.attentes.append(ms)


def test_ecran_anti_robot_qui_se_leve_apres_l_attente():
    page = FaussePage([ANTI_ROBOT, APPEL_ARS])
    texte, motif = asyncio.run(echantillon.texte_de_la_page(page, attente_ms=10))
    assert motif is None and "soins palliatifs" in texte and page.attentes == [10]


def test_ecran_anti_robot_persistant_et_acces_refuse():
    page = FaussePage([ANTI_ROBOT, ANTI_ROBOT])
    assert asyncio.run(echantillon.texte_de_la_page(page, attente_ms=10))[1] == "page anti-robot"
    page = FaussePage([ACCES_REFUSE])  # un accès refusé ne se lève pas : pas d'attente inutile
    assert asyncio.run(echantillon.texte_de_la_page(page, attente_ms=10))[1] == "accès refusé" and page.attentes == []
    page = FaussePage([APPEL_ARS])
    assert asyncio.run(echantillon.texte_de_la_page(page, attente_ms=10)) == (echantillon.nettoyer_texte(APPEL_ARS), None)


# ---------------------------------------------------------------- extraction : rien n'est demandé au modèle

def _texte(tmp_path, nom, url, corps):
    chemin = tmp_path / "decouverte" / "src" / "fiches" / nom
    chemin.parent.mkdir(parents=True, exist_ok=True)
    chemin.write_text(echantillon.en_tete_collecte("2026-11-16T11:21:40") + f"{url}\nlien\n\n{corps}", encoding="utf-8")
    return chemin


def _sans_modele(*a, **k):
    raise AssertionError("le modèle ne doit pas être appelé")


def test_extraction_locale_met_de_cote_la_page_bloquee_et_refuse_le_marche_public(tmp_path, monkeypatch):
    bloque = _texte(tmp_path, "681eb31341.txt", "https://www.grandest.fr/appel-a-projet/pacte/", ANTI_ROBOT)
    marche = _texte(tmp_path, "aecbeb270d.txt", URL_PRADO, PRADO)
    monkeypatch.setattr(echantillon, "ICI", tmp_path)
    monkeypatch.setattr(echantillon, "RESULTS", tmp_path / "results")
    monkeypatch.setattr(echantillon, "appeler_ollama", _sans_modele)
    sortie = tmp_path / "results" / "extraction_test.json"
    rubrique = {"id": "src", "nom": "Source"}
    echantillon.extraire([], "ollama", "test", None, chemin_sortie=sortie, fiches=[(rubrique, bloque), (rubrique, marche)])
    assert not bloque.exists() and (bloque.parent / "_bloquees" / bloque.name).exists()
    refus = json.loads(sortie.with_name(sortie.stem + "_non_aap.json").read_text(encoding="utf-8"))
    assert [(r["url"], r["raison"], r["filtre"]) for r in refus] == [(URL_PRADO, "marché public (plateforme d'achat public)", True)]
    assert not sortie.exists()


def test_extraction_api_met_de_cote_la_page_bloquee_et_refuse_le_marche_public(tmp_path, monkeypatch):
    import extractor
    bloque = _texte(tmp_path, "b1.txt", "https://www.grandest.fr/appel-a-projet/x/", ANTI_ROBOT)
    marche = _texte(tmp_path, "m1.txt", URL_PRADO, PRADO)
    monkeypatch.setattr(echantillon, "ICI", tmp_path)
    monkeypatch.setattr(echantillon, "DOSSIER", tmp_path / "decouverte")
    monkeypatch.setattr(echantillon, "RESULTS", tmp_path / "results")
    monkeypatch.setattr(echantillon, "cout_cumule", lambda *a, **k: 0.0)
    monkeypatch.setattr(extractor, "est_un_aap", _sans_modele)
    sortie = tmp_path / "results" / "extraction_api_test.json"
    rubrique = {"id": "src", "nom": "Source"}
    echantillon.extraire_api({}, "claude-haiku-5-5", None, 5.0, chemin_sortie=sortie,
                             fiches=[(rubrique, bloque), (rubrique, marche)])
    assert (bloque.parent / "_bloquees" / bloque.name).exists()
    refus = json.loads(sortie.with_name(sortie.stem + "_non_aap.json").read_text(encoding="utf-8"))
    assert [r["url"] for r in refus] == [URL_PRADO]


def test_le_texte_mis_de_cote_n_est_pas_compte_comme_traite(tmp_path):
    # La collecte suivante relit l'adresse (le fichier n'existe plus) : le texte relu sera extrait normalement
    bloque = _texte(tmp_path, "z.txt", "https://www.grandest.fr/appel-a-projet/z/", ANTI_ROBOT)
    assert echantillon.filtre_avant_modele(bloque, "https://www.grandest.fr/appel-a-projet/z/", ANTI_ROBOT) == \
        ("bloquee", "page anti-robot")
    assert not bloque.exists()
    assert list((tmp_path / "decouverte" / "src" / "fiches").glob("*.txt")) == []


# ---------------------------------------------------------------- relais : l'indice donné au modèle

def test_indice_du_financeur_pour_un_relais():
    assert echantillon.indice_financeur({"nom": "ARS Bretagne"}) == "ARS Bretagne"
    indice = echantillon.indice_financeur({"nom": "Medicen Paris Region – appels à projets", "relais": True})
    assert indice.startswith("Medicen Paris Region") and "relais" in indice and "jamais" in indice


def test_les_rubriques_de_la_veille_portent_le_relais():
    # Contre-vérification : rubriques() ne recopiait pas « relais », l'indice n'arrivait jamais au modèle (registre réel)
    import extraction_locale
    par_id = {r["id"]: r for r in extraction_locale.rubriques({"medicen-paris-region", "lyonbiopole"})}
    assert par_id["medicen-paris-region"]["relais"] is True
    assert "relais" in echantillon.indice_financeur(par_id["medicen-paris-region"])


def test_consigne_version_5_et_exemples_de_monsieur_ducout():
    assert echantillon.VERSION_CONSIGNE == 5
    assert "marché public" in echantillon.CONSIGNE_EST_AAP and "anti-robot" in echantillon.CONSIGNE_EST_AAP
    for exemple in ("forêt", "grands fonds marins", "décarbonation", "LEADER", "enseignement supérieur"):
        assert exemple in echantillon.CONSIGNE_CHAMP
    assert "relais" in echantillon.CONSIGNE


def test_le_modele_local_recoit_l_indice_du_relais(tmp_path, monkeypatch):
    # Seconde contre-vérification : la veille du lundi passe par extraire (modèle local), qui ne donnait aucun indice
    chemin = _texte(tmp_path, "r.txt", "https://medicen.org/appel/premiere-usine", APPEL_ARS)
    monkeypatch.setattr(echantillon, "ICI", tmp_path)
    monkeypatch.setattr(echantillon, "RESULTS", tmp_path / "results")
    vus = []
    def faux(modele, messages, schema):
        vus.append(messages[1]["content"])
        return {"est_aap": False, "raison": "test"}
    monkeypatch.setattr(echantillon, "appeler_ollama", faux)
    rubrique = {"id": "medicen-paris-region", "nom": "Medicen Paris Region – appels à projets", "relais": True}
    echantillon.extraire([], "ollama", "test", None, chemin_sortie=tmp_path / "results" / "x.json", fiches=[(rubrique, chemin)])
    assert vus and "est un relais" in vus[0]
