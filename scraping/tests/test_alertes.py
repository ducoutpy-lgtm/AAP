"""Tests des alertes par courriel (fonctions pures, sans réseau ni Firestore)."""
import sys
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from time import perf_counter

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import alertes as a  # noqa: E402
import courriel as c  # noqa: E402

MAINTENANT = datetime.now(timezone.utc)
DEPUIS = MAINTENANT - timedelta(days=7)


def test_resume_veille_lit_l_en_tete_du_rapport():
    texte = ("# Veille\n\nChangement. Rapport du 2026-10-20. Zéro euro.\n\n## Dernier rejeu\n\n"
             "- Sources relues : 198 ; en erreur ou sans lien lisible (compteurs inchangés) : 9\n"
             "- Liens vus : 2673 ; nouveaux : 184 ; disparus : 295\n")
    r = a.resume_veille(texte)
    assert r == {"sources": 198, "erreurs": 9, "vus": 2673, "nouveaux": 184, "disparus": 295, "date": "2026-10-20"}
    assert a.resume_veille("")["sources"] == 0


def test_courriel_admin_contient_les_chiffres_et_le_lien():
    sujet, texte = a.courriel_admin({"date": "2026-10-20", "sources": 198, "erreurs": 9, "vus": 2673, "nouveaux": 184, "disparus": 295},
                                    {"nouvelles": 43, "nouvelles_validees": 30, "a_controler": 304, "publiees": 248}, "https://aap.exemple.fr")
    assert "304 fiches à contrôler" in sujet
    assert "nouveaux : 184" in texte and "Fiches nouvelles en base depuis sept jours : 43" in texte
    assert "https://aap.exemple.fr/admin/aaps?validation=proposee" in texte


def fiche(**kw):
    base = {"id": "f1", "title": "Appel test", "status": "published", "validation": {"statut": "validee"},
            "publishedAt": MAINTENANT - timedelta(days=1), "territoriesEligible": ["normandie"],
            "qualification": {"destinataires": ["prive-non-lucratif"]}, "deadline": MAINTENANT + timedelta(days=30)}
    base.update(kw)
    return base


def test_fiches_nouvelles_pour_un_candidat_associatif_de_normandie():
    profil = {"structureName": "EHPAD Test", "structureType": "association", "address": {"region": "normandie"}}
    fiches = [
        fiche(id="ok"),
        fiche(id="national", territoriesEligible=["france"], deadline=MAINTENANT + timedelta(days=5)),
        fiche(id="autre-region", territoriesEligible=["bretagne"]),
        fiche(id="pas-pour-moi", qualification={"destinataires": ["public"]}),
        fiche(id="tous", qualification={"destinataires": ["tous"]}, deadline=None),
        fiche(id="vieille", publishedAt=MAINTENANT - timedelta(days=20)),
        fiche(id="non-controlee", validation={"statut": "proposee"}),
        fiche(id="close", deadline=MAINTENANT - timedelta(days=1)),
        fiche(id="brouillon", status="draft"),
    ]
    ids = [f["id"] for f in a.fiches_nouvelles_pour(profil, fiches, DEPUIS)]
    assert ids == ["national", "ok", "tous"]  # clôture la plus proche d'abord, sans date en dernier


def test_sans_region_ni_forme_connue_tout_ce_qui_est_visible_et_recent_passe():
    profil = {"structureName": "X", "structureType": "autre"}
    fiches = [fiche(id="a", territoriesEligible=["bretagne"], qualification={"destinataires": ["public"]}), fiche(id="b", status="draft")]
    assert [f["id"] for f in a.fiches_nouvelles_pour(profil, fiches, DEPUIS)] == ["a"]


def test_courriel_candidat_liste_dix_fiches_au_plus_avec_leurs_liens():
    profil = {"structureName": "EHPAD Test"}
    fiches = [fiche(id=f"f{i}", title=f"Appel {i}", budgetMax=50000, financeurName="ARS Normandie") for i in range(12)]
    sujet, texte = a.courriel_candidat(profil, fiches, "https://aap.exemple.fr")
    assert sujet == "AAP Santé : 12 nouveaux appels à projets pour EHPAD Test"
    assert a.courriel_candidat(profil, fiches[:1], "u")[0] == "AAP Santé : 1 nouvel appel à projets pour EHPAD Test"
    assert texte.count("https://aap.exemple.fr/aap/f") == 10
    assert "et 2 autres" in texte and "jusqu'à 50 000 €" in texte
    sujet_vide, texte_vide = a.courriel_candidat(profil, [], "https://aap.exemple.fr")
    assert "aucun nouvel appel" in sujet_vide and "Aucun nouvel appel" in texte_vide


def test_etat_base_compte_nouvelles_a_controler_et_publiees():
    fiches = [fiche(id="1", createdAt=MAINTENANT - timedelta(days=2)),
              fiche(id="2", createdAt=MAINTENANT - timedelta(days=2), validation={"statut": "proposee"}, status="draft"),
              fiche(id="3", createdAt=MAINTENANT - timedelta(days=30), validation={"statut": "a_corriger"}, status="draft"),
              fiche(id="4", createdAt=MAINTENANT - timedelta(days=30), validation={"statut": "rejetee"}, status="archived")]
    e = a.etat_base(fiches, DEPUIS)
    assert e == {"nouvelles": 2, "nouvelles_validees": 1, "a_controler": 2, "publiees": 1}


def test_courriel_ecrit_a_blanc_dans_un_fichier(tmp_path):
    chemin = c.ecrire_courriel("test@exemple.fr", "Objet : test", "Corps", dossier=tmp_path)
    assert chemin.exists() and chemin.read_text(encoding="utf-8").startswith("À : test@exemple.fr\nObjet : Objet : test")
    assert c.nom_fichier("a.b@c.fr", "Veille du 20/10", datetime(2026, 10, 20, 8, 0, 0)) == "2026-10-20_080000_a-b-c-fr_veille-du-20-10.txt"


# ---------------------------------------------------------------- filtrage commun (alertes-recherches-sauvegardees)

import json  # noqa: E402

CAS = json.loads((Path(__file__).resolve().parents[2] / "app" / "src" / "utils" / "cas_filtres_recherche.json").read_text(encoding="utf-8"))


def _fiche_firestore(f: dict) -> dict:
    """Fiche du fichier commun au format lu dans Firestore par alertes.py."""
    j = f["deadline_jours"]
    return {"id": f["id"], "title": f["title"], "description": f["description"], "financeurName": f["financeurName"],
            "territoriesEligible": f["territoriesEligible"],
            "deadline": None if j is None else MAINTENANT + timedelta(days=j, hours=1),
            # Sans champ : pas de bloc scrapeMetadata, comme l'adaptateur de recherche.test.ts (appel saisi à la main)
            "scrapeMetadata": {"champ": f["champ"]} if f["champ"] else None,
            "qualification": {"destinataires": f["destinataires"], "typeAppel": f["typeAppel"]},
            "budgetMin": f["budgetMin"], "budgetMax": f["budgetMax"], "sectorsTargeted": f.get("sectorsTargeted") or []}


def test_correspond_donne_les_memes_resultats_que_l_application():
    fiches = [_fiche_firestore(f) for f in CAS["fiches"]]
    for cas in CAS["cas"]:
        filtres = a.filtres_depuis_params(cas["params"])
        assert [f["id"] for f in fiches if a.correspond(f, filtres)] == cas["attendus"], cas["nom"]


# ---------------------------------------------------------------- alertes des recherches sauvegardées (tâche 3.1)

def _fiches_idf():
    return [
        fiche(id="ms1", title="Répit des aidants", territoriesEligible=["ile-de-france"], scrapeMetadata={"champ": "medico-social"}),
        fiche(id="ms2", title="Habitat inclusif", territoriesEligible=["france"], scrapeMetadata={"champ": "medico-social"},
              deadline=MAINTENANT + timedelta(days=10)),
        fiche(id="sante", title="Télémédecine", territoriesEligible=["ile-de-france"], scrapeMetadata={"champ": "sante"}),
        fiche(id="ancienne", territoriesEligible=["ile-de-france"], scrapeMetadata={"champ": "medico-social"},
              publishedAt=MAINTENANT - timedelta(days=30)),
    ]


RECHERCHE_IDF = {"name": "IDF médico-social", "params": "thematique=medico-social&territory=ile-de-france", "alertEnabled": True}


def test_section_par_recherche_active_avec_les_appels_nouveaux_qui_passent_ses_filtres():
    sections = a.sections_recherches([RECHERCHE_IDF, {**RECHERCHE_IDF, "name": "Arrêtée", "alertEnabled": False}], _fiches_idf(), DEPUIS)
    assert [(s["nom"], s["params"], [f["id"] for f in s["fiches"]]) for s in sections] == \
        [("IDF médico-social", "thematique=medico-social&territory=ile-de-france", ["ms2", "ms1"])]


def test_courriel_candidat_avec_sections_de_recherche():
    sections = a.sections_recherches([RECHERCHE_IDF, {"name": "Rien", "params": "q=introuvable", "alertEnabled": True}], _fiches_idf(), DEPUIS)
    sujet, texte = a.courriel_candidat({"structureName": "EHPAD Test"}, [], "https://aap.exemple.fr", sections=sections)
    assert sujet == "AAP Santé : 2 nouveaux appels à projets pour EHPAD Test"
    assert "Votre recherche « IDF médico-social » : 2 nouveaux appels" in texte
    assert "https://aap.exemple.fr/aap/search?thematique=medico-social&territory=ile-de-france" in texte
    assert "Votre recherche « Rien » : aucun nouvel appel cette semaine" in texte
    assert "Recherches sauvegardées" in texte
    # sans recherche active : courriel inchangé
    assert "Votre recherche" not in a.courriel_candidat({"structureName": "X"}, [], "u")[1]


# ---------------------------------------------------------------- corrections de la relecture du 2026-11-16

def test_montants_lus_comme_parsefloat():
    import math
    assert a._parse_float("50 000") == 50 and a._parse_float("1e5") == 100000 and a._parse_float(" 12.5x") == 12.5
    assert math.isnan(a._parse_float("abc")) and math.isnan(a._parse_float(""))


def test_recherche_sans_adresse_n_envoie_rien():
    vide = {"name": "Sans filtre", "alertEnabled": True}
    assert a.sections_recherches([vide], _fiches_idf(), DEPUIS) == []


def test_nom_de_recherche_sans_lien_et_raccourci():
    piege = {**RECHERCHE_IDF, "name": "Dossier incomplet, régularisez sur https://piege.example/x " + "z" * 100}
    s = a.sections_recherches([piege], _fiches_idf(), DEPUIS)[0]
    assert "piege.example" not in s["nom"] and len(s["nom"]) <= 80
    assert "piege.example" not in a.courriel_candidat({"structureName": "X"}, [], "u", sections=[s])[1]


def test_un_candidat_en_erreur_n_arrete_pas_les_suivants(monkeypatch):
    envoyes = []
    monkeypatch.setattr(a.courriel, "envoyer", lambda dest, sujet, texte, dry_run=False: envoyes.append(dest) or "envoyé")
    candidats = [({"email": "casse@x.fr"}, {"structureName": "A"}, [None]),
                 ({"email": "ok@x.fr"}, {"structureName": "B"}, [RECHERCHE_IDF])]
    lignes = a.envoyer_aux_candidats(candidats, _fiches_idf(), DEPUIS, "u", True)
    assert envoyes == ["ok@x.fr"]
    assert any("casse@x.fr" in l and "ÉCHEC" in l for l in lignes)



# corrections-chaine-du-lundi 1.3 (2026-11-22) : la fenêtre comptait sept jours depuis l'heure du passage, qui varie avec
# la durée de la veille ; un appel publié entre deux heures de passage était annoncé deux fois ou jamais.
def test_fenetre_depuis_le_dernier_envoi_reussi():
    maintenant = datetime(2026, 11, 30, 9, 30, tzinfo=timezone.utc)
    precedent = datetime(2026, 11, 23, 13, 0, tzinfo=timezone.utc)
    assert a.debut_fenetre(precedent, maintenant, 7) == precedent
    assert a.debut_fenetre(None, maintenant, 7) == maintenant - timedelta(days=7)
    assert a.debut_fenetre(maintenant + timedelta(hours=1), maintenant, 7) == maintenant - timedelta(days=7)


def test_date_du_dernier_envoi_notee_puis_relue(tmp_path):
    chemin = tmp_path / "logs" / "alertes_dernier_envoi.txt"
    assert a.lire_dernier_envoi(chemin) is None
    quand = datetime(2026, 11, 23, 13, 0, tzinfo=timezone.utc)
    a.noter_envoi(chemin, quand)
    assert a.lire_dernier_envoi(chemin) == quand
    chemin.write_text("illisible", encoding="utf-8")
    assert a.lire_dernier_envoi(chemin) is None


# corrections-chaine-du-lundi 1.4 (2026-11-22) : une erreur au courriel de l'administrateur arrêtait le script avant
# l'envoi aux candidats.
def test_echec_du_bilan_administrateur_sans_exception(monkeypatch):
    def panne(*_a, **_k):
        raise OSError("connexion refusée")
    monkeypatch.setattr(a.courriel, "envoyer", panne)
    assert a.envoyer_admin({"admin": "admin@x.fr"}, "s", "t", False).startswith("ÉCHEC")


def test_bilan_administrateur_sans_adresse_avec_boite_configuree(monkeypatch):
    appels = []
    monkeypatch.setattr(a.courriel, "envoyer", lambda *x, **k: appels.append(x) or "envoyé")
    assert "COURRIEL_ADMIN" in a.envoyer_admin({"utilisateur": "u", "admin": ""}, "s", "t", False) and appels == []
    a.envoyer_admin(None, "s", "t", False)  # boîte absente : le courriel est écrit dans logs/courriels, comme avant
    assert appels and appels[0][0] == "admin (COURRIEL_ADMIN non renseigné)"



def test_desabonnement_annonce_un_moyen_qui_existe():
    """corrections-chaine-du-lundi 1.8 (2026-11-22) : le courriel renvoyait à « Mon profil, préférences des alertes »,
    réglage qu'aucun écran n'offre ; le candidat ne pouvait pas s'opposer à l'envoi (RGPD, droit d'opposition)."""
    texte = a.courriel_candidat({"structureName": "X"}, [], "u")[1]
    assert "préférences des alertes" not in texte
    assert "Désabonnement" in texte and "répondez" in texte



def test_la_date_n_avance_que_si_un_courriel_est_vraiment_parti():
    """Relecture adverse du 2026-11-22 : la date du dernier envoi était notée même quand tous les envois avaient échoué
    ou que la boîte n'était pas configurée (courriels seulement écrits dans logs/courriels) ; la fenêtre avançait et les
    appels de la semaine n'étaient jamais annoncés."""
    assert a.envoi_reussi(["candidat x@x.fr : 2 appel(s), 0 recherche(s) en alerte ; envoyé à x@x.fr"])
    assert not a.envoi_reussi(["candidat x@x.fr : ÉCHEC SMTPException panne"])
    assert not a.envoi_reussi(["candidat x@x.fr : 1 appel(s) ; non envoyé (boîte d'envoi non configurée) : f.txt"])
    assert not a.envoi_reussi([])


def test_date_sans_fuseau_lue_en_utc(tmp_path):
    chemin = tmp_path / "dernier.txt"
    chemin.write_text("2026-11-16T10:32:00", encoding="utf-8")
    assert a.lire_dernier_envoi(chemin) == datetime(2026, 11, 16, 10, 32, tzinfo=timezone.utc)



# Plan niveau A, lot 1 (2026-11-24) : faille P0 de l'audit. users.email et structureName sont écrits librement par le
# compte ; le courriel du lundi servait de relais d'envoi depuis la boîte officielle vers l'adresse et avec le texte de
# son choix.
class _Doc:
    def __init__(self, id_, data):
        self.id, self._data, self.exists = id_, data, data is not None

    def to_dict(self):
        return dict(self._data or {})

    def get(self):
        return self


class _Requete:
    def __init__(self, docs):
        self.docs = docs

    def where(self, champ, _op, valeur):
        return _Requete([d for d in self.docs if d.to_dict().get(champ) == valeur])

    def stream(self):
        return iter(self.docs)


class _Collection(_Requete):
    def document(self, id_):
        return next((d for d in self.docs if d.id == id_), _Doc(id_, None))

    def get(self):
        return self


class _Base:
    def __init__(self, collections):
        self.collections = {k: _Collection([_Doc(i, d) for i, d in v.items()]) for k, v in collections.items()}

    def collection(self, nom):
        return self.collections.get(nom, _Collection([]))


def test_le_courriel_part_a_l_adresse_verifiee_par_firebase():
    base = _Base({
        "users": {"vrai": {"userType": "porteur", "profileComplete": True, "email": "victime@exemple.fr"},
                  "non-verifie": {"userType": "porteur", "profileComplete": True, "email": "a@exemple.fr"}},
        "porteurProfiles": {"vrai": {"structureName": "EHPAD A"}, "non-verifie": {"structureName": "EHPAD B"}},
    })
    comptes = {"vrai": ("connexion@exemple.fr", True), "non-verifie": ("a@exemple.fr", False)}
    candidats = a.lire_candidats(base, lambda uid: comptes[uid])
    assert [c["email"] for c, _, _ in candidats] == ["connexion@exemple.fr"]


def test_le_nom_de_structure_ne_porte_aucun_lien():
    sujet, texte = a.courriel_candidat({"structureName": "Gagnez 1000 euros sur http://arnaque.fr ou www.x.fr " + "x" * 200},
                                       [], "https://aapi-11bc3.web.app")
    assert "arnaque" not in sujet + texte and "www.x.fr" not in sujet + texte
    assert max(len(ligne) for ligne in sujet.splitlines()) < 160


def test_cloture_comptee_en_jours_du_calendrier():
    """Décision 38 du 2026-11-24 : un appel qui clôt aujourd'hui (minuit UTC, comme l'import l'enregistre) reste dans le
    courriel toute la journée ; avant, il en sortait dès minuit UTC passé. Même règle que l'application et l'import."""
    minuit = datetime.combine(date.today(), time(), tzinfo=timezone.utc)
    profil = {"structureName": "EHPAD Test", "structureType": "association", "address": {"region": "normandie"}}
    dernier_jour = fiche(id="dernier-jour", deadline=minuit)
    assert [f["id"] for f in a.fiches_nouvelles_pour(profil, [dernier_jour], DEPUIS)] == ["dernier-jour"]
    assert a.statut_appel(dernier_jour) == "bientot-clos"
    hier = fiche(id="hier", deadline=minuit - timedelta(days=1))
    assert a.fiches_nouvelles_pour(profil, [hier], DEPUIS) == []
    assert a.statut_appel(hier) == "clos"
    assert a.jours_avant_cloture(minuit + timedelta(days=3), date.today()) == 3


# ---------------------------------------------------------------- relecture du 2026-11-25

def test_thematique_des_secteurs_reservee_aux_appels_saisis_a_la_main():
    """Constats 1, 17 et 37 : l'import écrit sectorsTargeted ["sante", "social"] sur toute fiche collectée ; une fiche
    importée « incertain » ou pas encore classée passait en « Santé ». Décision 37 : appels saisis à la main seulement."""
    sante, non_classee = a.filtres_depuis_params("thematique=sante"), a.filtres_depuis_params("thematique=non-classee")
    for meta in ({"source": "s", "champ": "incertain"}, {"source": "s"}):
        importee = fiche(scrapeMetadata=meta, sectorsTargeted=["sante", "social"])
        assert a.correspond(importee, non_classee) and not a.correspond(importee, sante), meta
    manuelle = fiche(sectorsTargeted=["sante", "social"])
    assert a.correspond(manuelle, sante) and not a.correspond(manuelle, non_classee)


def test_nom_de_structure_sans_lien_quelle_que_soit_sa_forme():
    """Constats 12 et 45 : seules les adresses en minuscules commençant par http(s):// ou www. étaient retirées."""
    for piege in ("Http://evil.fr", "HTTPS://x.fr", "WWW.x.fr", "arnaque.fr/promo", "bit.ly/x1", "evil-promo.fr/gain",
                  "EXEMPLE.FR", "sous.domaine.exemple.fr"):
        sujet, texte = a.courriel_candidat({"structureName": f"EHPAD - gagnez sur {piege}"}, [], "https://aapi-11bc3.web.app")
        assert piege.lower() not in (sujet + texte).lower(), piege
    # Noms ordinaires gardés : sigle à points, montant, apostrophe
    for nom in ("C.H.U. de Lille", "EHPAD Les Lilas", "Fondation 1.000 sourires", "Centre Hospitalier Sud-Francilien"):
        assert a._nom_sur(nom) == nom


def test_filtre_des_liens_en_temps_lineaire():
    """Relecture du filtre des liens : le motif du domaine nu prenait un temps qui croissait comme le carré de la longueur
    du nom (« a- » répété 20 000 fois : 15,6 s), nom que le compte écrit sans limite de taille."""
    for texte in ("a-" * 50_000, "a." * 50_000 + "1", "a" * 100_000, "." * 100_000, "a.-" * 33_334):
        debut = perf_counter()
        a._nom_sur(texte)
        assert perf_counter() - debut < 1, texte[:6]
        # Le motif lui-même, sans la borne de longueur du nom
        debut = perf_counter()
        a._LIEN.sub("", texte)
        assert perf_counter() - debut < 1, texte[:6]


def test_initiales_et_abreviations_a_point_gardees():
    """Relecture du filtre des liens : un point collé à une initiale ou à une abréviation retirait des mots ; seul un nom de
    domaine dont la dernière partie est une extension connue est retiré."""
    for nom in ("EHPAD St.Joseph", "Foyer A.Lebrun", "Association J.Moulin", "Mutualité Française.Normandie",
                "UGECAM.IDF", "C.Genial - Fondation Pour La Culture Scientifique Et Technique"):
        assert a._nom_sur(nom) == nom
    for piege in ("arnaque.fr/promo", "bit.ly/x1", "sous.domaine.exemple.fr", "EXEMPLE.FR", "sante.gouv.fr",
                  "t.co/x", "exemple.online"):
        assert a._nom_sur(f"EHPAD {piege}") == "EHPAD [lien retiré]", piege
    # Points de suspension ou point collé avant le domaine
    for piege in ("Promo...arnaque.fr", "Promo.arnaque.fr", ".arnaque.fr"):
        assert "arnaque" not in a._nom_sur(f"EHPAD {piege}"), piege


def test_coupe_du_nom_sans_lien_fabrique():
    """Un mot gardé entier (« arnaque.fraude », extension inconnue) ne devient pas « arnaque.fr » cliquable quand le nom
    est coupé à 80 caractères ; un lien placé au-delà des caractères lus ne passe pas non plus."""
    propre = a._nom_sur("E" * 68 + " arnaque.fraude")
    assert "arnaque.fr" not in propre and len(propre) <= 80
    propre = a._nom_sur("https://" + "x" * 300 + " arnaque.fr/promo")
    assert "arnaque" not in propre and len(propre) <= 80


def test_parametres_de_recherche_encodes_dans_le_lien():
    """Constat 12 : les paramètres d'une recherche sauvegardée étaient collés tels quels après /aap/search?."""
    section = {"nom": "x", "params": "q=x%0A Rendez-vous sur HTTP://arnaque.fr&territory=normandie", "fiches": []}
    texte = a.courriel_candidat({"structureName": "X"}, [], "https://aapi-11bc3.web.app", sections=[section])[1]
    ligne = next(ligne for ligne in texte.splitlines() if "Voir la recherche" in ligne)
    assert "HTTP://arnaque.fr" not in texte and " " not in ligne.split("Voir la recherche : ")[1]
    assert ligne.endswith("/aap/search?q=x%0A+Rendez-vous+sur+HTTP%3A%2F%2Farnaque.fr&territory=normandie")
    # Recherche ordinaire : lien inchangé
    ordinaire = {"nom": "y", "params": "thematique=medico-social&territory=ile-de-france", "fiches": []}
    assert "/aap/search?thematique=medico-social&territory=ile-de-france\n" in a.courriel_candidat(
        {"structureName": "X"}, [], "u", sections=[ordinaire])[1]


def test_compte_a_l_adresse_illisible_note_au_journal(capsys):
    """Constat 20 : un compte dont l'adresse de connexion ne pouvait pas être lue était écarté sans aucune trace."""
    base = _Base({"users": {"panne": {"userType": "porteur", "profileComplete": True},
                            "ok": {"userType": "porteur", "profileComplete": True}},
                  "porteurProfiles": {"panne": {"structureName": "A"}, "ok": {"structureName": "B"}}})

    def connexion(uid):
        if uid == "panne":
            raise TimeoutError("délai dépassé")
        return "ok@exemple.fr", True
    candidats = a.lire_candidats(base, connexion)
    assert [c["email"] for c, _, _ in candidats] == ["ok@exemple.fr"]
    assert "candidat panne : adresse de connexion illisible (TimeoutError)" in capsys.readouterr().out


def _lancer(monkeypatch, tmp_path, envoyes, *options):
    """Lance main() comme veille.cmd, sur une base factice : une fiche publiée il y a deux jours, un candidat de
    Normandie ; les courriels partent dans `envoyes` (destinataire, sujet, texte)."""
    base = _Base({"aap": {"f1": fiche(id="f1", createdAt=MAINTENANT - timedelta(days=2),
                                      publishedAt=MAINTENANT - timedelta(days=2))}})
    candidat = ({"email": "ok@exemple.fr"}, {"structureName": "EHPAD Test", "structureType": "association",
                                             "address": {"region": "normandie"}}, [])
    monkeypatch.setattr(a, "DERNIER_ENVOI", tmp_path / "alertes_dernier_envoi.txt")
    monkeypatch.setattr(a, "VEILLE_MD", tmp_path / "VEILLE.md")
    monkeypatch.setattr(a, "_firestore", lambda: base)
    monkeypatch.setattr(a, "lire_candidats", lambda db: [candidat])
    monkeypatch.setattr(a.courriel, "charger_config", lambda: {"admin": "admin@exemple.fr"})
    monkeypatch.setattr(a.courriel, "envoyer",
                        lambda dest, sujet, texte, dry_run=False: envoyes.append((dest, sujet, texte)) or f"envoyé à {dest}")
    monkeypatch.setattr(sys, "argv", ["alertes.py", *options])
    assert a.main() == 0


def test_bilan_administrateur_compte_sept_jours_apres_le_courriel_des_candidats(monkeypatch, tmp_path):
    """Constat 15 : depuis que veille.cmd lance --candidats puis --admin à part, le bilan partait de l'envoi aux
    candidats du matin même et annonçait 0 fiche nouvelle."""
    envoyes = []
    _lancer(monkeypatch, tmp_path, envoyes, "--candidats")
    _lancer(monkeypatch, tmp_path, envoyes, "--admin")
    admin = [texte for dest, _, texte in envoyes if dest == "admin@exemple.fr"]
    assert len(admin) == 1 and "Fiches nouvelles en base depuis sept jours : 1 (dont validées par le modèle : 1)" in admin[0]


def test_relance_le_meme_jour_ne_renvoie_pas_de_courriel_vide(monkeypatch, tmp_path, capsys):
    """Constat 18 : une relance de la veille le jour même renvoyait à chaque candidat « aucun nouvel appel »."""
    envoyes = []
    _lancer(monkeypatch, tmp_path, envoyes, "--candidats")
    _lancer(monkeypatch, tmp_path, envoyes, "--candidats")
    assert [sujet for _, sujet, _ in envoyes] == ["AAP Santé : 1 nouvel appel à projets pour EHPAD Test"]
    assert "pas de courriel vide" in capsys.readouterr().out


def test_courriel_vide_envoye_lors_du_passage_hebdomadaire(monkeypatch):
    """Spécification alertes-courriel : un candidat sans appel reçoit un courriel court qui le dit (passage du lundi) ;
    seule une relance dans la journée (fenêtre de moins d'un jour) ne le renvoie pas."""
    envoyes = []
    monkeypatch.setattr(a.courriel, "envoyer", lambda dest, *_x, **_k: envoyes.append(dest) or f"envoyé à {dest}")
    candidats = [({"email": "bretagne@x.fr"}, {"structureName": "A", "address": {"region": "bretagne"}}, []),
                 ({"email": "normandie@x.fr"}, {"structureName": "B", "address": {"region": "normandie"}}, [])]
    fiches = [fiche(id="f1", territoriesEligible=["normandie"])]
    a.envoyer_aux_candidats(candidats, fiches, DEPUIS, "u", False)
    assert envoyes == ["bretagne@x.fr", "normandie@x.fr"]
    envoyes.clear()
    lignes = a.envoyer_aux_candidats(candidats, fiches, DEPUIS, "u", False, envoyer_vides=False)
    assert envoyes == ["normandie@x.fr"] and any("bretagne@x.fr" in ligne and "pas de courriel vide" in ligne for ligne in lignes)
