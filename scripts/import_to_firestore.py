"""Import des AAP scrapes (scraping/results/*.json) dans Firestore (collection "aap").

Jonction entre le volet scraping (schema AapNormalized, scraping/schema.py) et
l'application web (type AAP, app/src/types/index.ts).

Pourquoi un script separe plutot qu'un appel direct depuis le scraper ?
  - Le scraping produit des JSON (contrat machine) ; l'ecriture en base est un acte distinct,
    rejouable, que l'on peut lancer en --dry-run pour controler avant d'ecrire.
  - On garde le principe "un outil = une responsabilite" du POC.

Pre-requis :
  pip install -r scripts/requirements.txt
  Cle de compte de service Firebase dans scripts/serviceAccountKey.json (ignoree par Git).
  Console Firebase > Parametres du projet > Comptes de service > Generer une nouvelle cle privee.

Usage :
  python scripts/import_to_firestore.py --dry-run
  python scripts/import_to_firestore.py
  python scripts/import_to_firestore.py --source fondation_de_france
  python scripts/import_to_firestore.py --include-expired   # importe aussi les AAP deja clos

Regles (changement organisation-donnees-validees, 2026-10-14) : identifiant = adresse de l'appel ; sur un
document existant, status, publishedAt et validation ne sont jamais reecrits ; les verdicts de
scraping/sources/verdicts_fiches.json pilotent le bloc validation (rejetee -> archived, validee -> badge retire
et champs metier proteges) ; une fiche sans date de cloture entre en brouillon, a corriger.

Regles ajoutees par le lot 0 (changement lot-0-assainissement, rapport du 2026-10-14) : validation.statut est la
seule source de la fiabilite d'une fiche, l'etiquette a-verifier en decoule (proposee ou a_corriger) ; validation.par
est renseigne ; seuls les champs d'une liste blanche partent vers Firestore, un champ inconnu arrete l'import a blanc
comme en reel en le nommant ; une fiche sans date de cloture recoit deadline = null (aucune date inventee).

Regles du changement nettoyage-financeurs-territoires (2026-10-14, constat de Monsieur DUCOUT : base « sale ») :
scrapeMetadata.source est l'emetteur du registre (sourceNom, fichier), financeurName est le nom canonique de
scraping/sources/financeurs.json (le nom lu par l'IA reste dans financeurExtrait), territoriesEligible est deduit du
texte puis de l'emetteur (scraping/territoires.py), « france » seulement pour un appel national, « non-precise » sinon.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESULTS_DIR = ROOT / "scraping" / "results"
DEFAULT_KEY = ROOT / "scripts" / "serviceAccountKey.json"
# Le schema des fiches (scraping/schema.py) est la source de verite des champs qu'une fiche lue peut porter.
sys.path.insert(0, str(ROOT / "scraping"))
from schema import AapNormalized  # noqa: E402
# Verdicts de Monsieur DUCOUT sur les fiches (raccourci « Validation des fiches a verifier »), cle = adresse de
# l'appel. Fichier versionne, jamais ecrit par un outil automatique (changement organisation-donnees-validees).
VERDICTS = ROOT / "scraping" / "sources" / "verdicts_fiches.json"
# Registre des emetteurs et table des financeurs canoniques (changement nettoyage-financeurs-territoires) : la source
# reelle d'une fiche est son emetteur du registre, le financeur est ramene a un nom unique, le territoire est deduit.
import financeurs  # noqa: E402
import registre  # noqa: E402
import territoires  # noqa: E402
import verification  # noqa: E402
EMETTEURS = financeurs.index_emetteurs(registre.charger())
FINANCEURS = financeurs.charger()

# Champs qu'un humain peut avoir changes dans Firestore (ecran d'administration, verdicts) : jamais reecrits
# sur un document existant. Pourquoi une liste : l'application lit les champs a plat et les regles filtrent
# sur status ; proteger par liste ne change pas la forme du document.
CHAMPS_HUMAINS = ("status", "publishedAt", "validation")
# Champs metier proteges en plus quand la fiche a ete jugee juste : une fiche validee ne bouge que par un
# nouveau verdict humain, pas par une nouvelle proposition de l'IA.
CHAMPS_METIER = ("title", "description", "deadline", "publicationDate", "budgetMin", "budgetMax", "budgetTotal",
                 "eligibilityCriteria", "requiredDocuments", "structureTypeEligible", "territoriesEligible", "tags",
                 # Jour 2 du plan MVP (qualification-appels, 2026-10-20) : bloc de qualification et date d'ouverture
                 "qualification", "startDate")
# Champs techniques ecrits par l'import, ni humains ni metier. Les trois listes forment la liste blanche des champs
# envoyes a Firestore (rapport du 2026-10-14, instruction 5) : un champ ajoute au document sans etre classe ici
# arrete l'import, a blanc comme en reel, avant toute ecriture (voir verifier_champs).
CHAMPS_TECHNIQUES = ("financeurId", "financeurName", "sectorsTargeted", "externalUrl", "source", "scrapeMetadata",
                     "views", "applicationsCount", "createdAt", "updatedAt")
CHAMPS_ENVOYES = frozenset(CHAMPS_HUMAINS + CHAMPS_METIER + CHAMPS_TECHNIQUES)
CHAMPS_FICHE = frozenset(AapNormalized.model_fields)
# Correspondance verdict du raccourci -> statut de validation du document.
STATUTS_VALIDATION = {"aap-juste": "validee", "aap-a-corriger": "a_corriger", "pas-un-aap": "rejetee",
                      "hors-champ": "rejetee"}  # verdict « hors champ » de la validation quotidienne (filtre-champ-sante)
# Statuts qui laissent l'etiquette « A verifier » : fiche jamais relue, ou relue et a corriger (instruction 3 :
# le statut de validation est la seule source de la fiabilite, quel que soit le moteur).
STATUTS_A_VERIFIER = ("proposee", "a_corriger")
RELECTEUR = "Monsieur DUCOUT"


class ChampInconnu(ValueError):
    """Un champ hors liste blanche : l'import s'arrete en le nommant plutot que de l'ecrire sans le savoir."""

# Identifiant de "financeur" pour les AAP importes automatiquement.
# Les AAP scrapes n'appartiennent a aucun compte financeur de la plateforme.
SCRAPED_FINANCEUR_ID = "scraped"

def signature(titre: str, financeur: str, date_cloture: str | None) -> str:
    """Meme formule que scraping/orchestrator.py : import idempotent."""
    base = f"{(titre or '').strip().lower()}|{(financeur or '').strip().lower()}|{date_cloture or ''}"
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]


def identifiant(url: str) -> str:
    """Identifiant Firestore stable : derive de l'adresse de l'appel, pas du texte produit par l'IA.

    Deux moteurs qui reformulent le meme appel donnent ainsi un seul document. Normalisation : domaine en
    minuscules, fragment #... et barre finale retires.
    """
    u = (url or "").strip().split("#")[0].rstrip("/")
    m = re.match(r"^(https?://[^/]+)(.*)$", u, re.I)
    if m:
        u = m.group(1).lower() + m.group(2)
    return "scraped-" + hashlib.sha1(u.encode("utf-8")).hexdigest()[:16]


def appliquer_verdict(doc: dict, verdict: dict | None) -> dict:
    """Bloc validation et consequences du verdict humain sur un document (fonction pure).

    Sans verdict, un bloc validation deja pose par l'import (fiche sans date : a_corriger) est conserve, sinon la
    fiche est « proposee ». L'etiquette a-verifier decoule du statut (instruction 3) ; « rejetee » archive.
    """
    d = dict(doc)
    v = (verdict or {}).get("verdict")
    if v in STATUTS_VALIDATION:
        d["validation"] = {"statut": STATUTS_VALIDATION[v], "commentaire": verdict.get("commentaire", ""),
                           "date": verdict.get("date", ""), "par": RELECTEUR}
    elif not d.get("validation"):
        d["validation"] = {"statut": "proposee", "commentaire": "", "date": "", "par": ""}
    statut = d["validation"]["statut"]
    d["tags"] = etiqueter(d.get("tags", []), statut)
    if statut == "rejetee":
        d["status"] = "archived"
    return d


def appliquer_decision_du_modele(doc: dict, decision: dict | None) -> dict:
    """Le controle du modele vaut relecture (demande de Monsieur DUCOUT du 2026-10-15, midi) : sur une fiche sans
    verdict humain et dans le champ, le statut decide par scraping/verification.decision_du_modele (validee,
    rejetee, a_corriger) est ecrit au nom du modele ; rejetee archive. Un verdict humain l'emporte (fonction pure)."""
    if not decision or (doc.get("validation") or {}).get("par") == RELECTEUR or "hors-champ" in doc.get("tags", []):
        return doc
    d = dict(doc)
    ver = (d.get("scrapeMetadata") or {}).get("verification") or {}
    d["validation"] = {"statut": decision["statut"], "commentaire": decision["commentaire"],
                       "date": (ver.get("le") or "")[:10], "par": ver.get("modele") or "modele"}
    d["tags"] = etiqueter(d.get("tags", []), decision["statut"])
    if decision["statut"] == "rejetee":
        d["status"] = "archived"
    return d


def publication_selon_controle(doc: dict) -> dict:
    """Une fiche nouvelle que personne n'a validee (statut proposee ou a_corriger, relecteur autre que Monsieur
    DUCOUT) entre en brouillon, jamais en publie (decision de Monsieur DUCOUT du 2026-10-20, changement
    administration-controle : seules les fiches controlees sont visibles des candidats). Fonction pure ; les documents
    deja en base gardent leur statut (champs humains jamais reecrits)."""
    v = doc.get("validation") or {}
    if doc.get("status") == "published" and v.get("statut") in STATUTS_A_VERIFIER and v.get("par") != RELECTEUR:
        d = dict(doc)
        d["status"] = "draft"
        return d
    return doc


def appliquer_qualification(doc: dict, item: dict, today: date) -> dict:
    """Qualification du modele (scraping/qualifier_fiches.py, jour 2 du plan MVP) portee sur le document (fonction
    pure) : bloc qualification (destinataires, type d'appel, objets, date d'ouverture, auteur, date), startDate depuis
    la date d'ouverture, pieces attendues reprises si la fiche n'en avait pas ; une fiche classee hors champ par la
    qualification, sans verdict humain, passe en brouillon a corriger (meme regle que le champ)."""
    q = (item.get("scrape_metadata") or {}).get("qualification")
    if not q:
        return doc
    d = dict(doc)
    d["qualification"] = {"destinataires": list(q.get("destinataires") or []), "typeAppel": q.get("type_appel") or "autre",
                          "objets": list(q.get("objets") or []), "dateOuverture": q.get("date_ouverture") or None,
                          "par": q.get("modele") or "modele", "le": (q.get("le") or "")[:10]}
    if q.get("date_ouverture"):
        ouverture = parse_date(q["date_ouverture"])
        if ouverture:
            d["startDate"] = ouverture
    if q.get("pieces_attendues") and not d.get("requiredDocuments"):
        d["requiredDocuments"] = list(q["pieces_attendues"])
    if q.get("champ") == CHAMP_HORS and (d.get("validation") or {}).get("par") != RELECTEUR:
        d["tags"] = [t for t in d.get("tags", []) if t != "hors-champ"] + ["hors-champ"]
        d["status"] = "draft"
        d["validation"] = {"statut": "a_corriger", "commentaire": "hors champ (qualification)", "date": today.isoformat(),
                           "par": "import (qualification)"}
        d["tags"] = etiqueter(d["tags"], "a_corriger")
    return d


def etiqueter(tags: list[str], statut: str) -> list[str]:
    """L'etiquette a-verifier suit le statut de validation, et rien d'autre (fonction pure)."""
    sans = [t for t in tags if t != "a-verifier"]
    return sans + ["a-verifier"] if statut in STATUTS_A_VERIFIER else sans


def verifier_champs(doc: dict, origine: str) -> None:
    """Liste blanche : toute cle du document envoye doit etre classee humaine, metier ou technique."""
    inconnus = sorted(set(doc) - CHAMPS_ENVOYES)
    if inconnus:
        raise ChampInconnu(f"champ inconnu « {inconnus[0]} » dans le document {origine} : le classer dans "
                           "CHAMPS_HUMAINS, CHAMPS_METIER ou CHAMPS_TECHNIQUES de import_to_firestore.py")


def verifier_fiche(item: dict, origine: str) -> None:
    """Une fiche lue ne porte que les champs du schema AapNormalized : un connecteur qui change de schema est signale."""
    inconnus = sorted(set(item) - CHAMPS_FICHE)
    if inconnus:
        raise ChampInconnu(f"champ inconnu « {inconnus[0]} » dans une fiche de {origine} : hors du schema AapNormalized")


def document_a_envoyer(doc: dict, existe: bool, existant: dict | None = None) -> dict:
    """Ce que l'import ecrit : tout a la creation ; sur un document existant, jamais les champs humains,
    ni les champs metier si la fiche est validee (fonction pure).

    Exception (constat du 2026-10-19 : les six premiers verdicts de Monsieur DUCOUT n'atteignaient pas la base) : quand
    le document porte un verdict humain (validation.par = RELECTEUR), ce verdict est la seule chose qui a le droit de
    changer validation et status (rejetee -> archived) ; publishedAt et les champs metier, tags compris, restent
    proteges (l'application lit la relecture dans validation, plus dans les tags, depuis le 2026-10-19)."""
    if not existe:
        return dict(doc)
    proteges = set(CHAMPS_HUMAINS)
    if doc.get("validation", {}).get("statut") == "validee":
        proteges |= set(CHAMPS_METIER)
        # La qualification (jour 2 du plan MVP) complete une fiche validee sans la contredire : elle passe toujours,
        # sauf quand une qualification a ete ecrite a la main dans l'application (par = Monsieur DUCOUT)
        proteges -= {"qualification", "startDate"}
    if (doc.get("validation") or {}).get("par") == RELECTEUR:
        proteges -= {"validation", "status"}
    if ((existant or {}).get("qualification") or {}).get("par") == RELECTEUR:
        proteges |= {"qualification", "startDate"}
    return {k: v for k, v in doc.items() if k not in proteges}


def sans_date_en_attente(doc: dict, today: date) -> dict:
    """Fiche sans date de cloture : publiee avec deadline nulle (aucune date inventee, reponse Q4 du rapport du
    2026-10-14) et l'etiquette sans-date-cloture, badge « a verifier » par le statut proposee.

    Decision de Monsieur DUCOUT du 2026-10-14 (nuit), qui remplace le brouillon impose par le lot 0 : la fiche est
    visible dans l'application avec « Date de cloture non precisee » et consideree ouverte jusqu'au 31 decembre de
    l'annee en cours, sans qu'aucune date soit inscrite dans la base."""
    d = dict(doc)
    d["deadline"] = None
    d["tags"] = [t for t in d.get("tags", []) if t != "sans-date-cloture"] + ["sans-date-cloture"]
    return d


CHAMP_HORS, CHAMP_INCERTAIN = "hors-champ", "incertain"


def champ_en_attente(doc: dict, today: date) -> dict:
    """Fiche classee hors champ par le modele (filtre-champ-sante) : brouillon a corriger, jamais publiee sans verdict ;
    « incertain » : etiquette champ-incertain seulement. Un verdict humain deja applique (validation.par = RELECTEUR)
    l'emporte toujours sur le modele (fonction pure)."""
    d = dict(doc)
    champ = (d.get("scrapeMetadata") or {}).get("champ") or ""
    tags = [t for t in d.get("tags", []) if t not in ("hors-champ", "champ-incertain")]
    if champ == CHAMP_INCERTAIN:
        tags.append("champ-incertain")
    if champ == CHAMP_HORS and (d.get("validation") or {}).get("par") != RELECTEUR:
        tags.append("hors-champ")
        d["status"] = "draft"
        d["validation"] = {"statut": "a_corriger", "commentaire": "hors champ (modele)", "date": today.isoformat(),
                           "par": "import (champ)"}
    d["tags"] = etiqueter(tags, (d.get("validation") or {}).get("statut", "proposee"))
    return d


def fusionner(mapped: list[tuple[str, dict]]) -> dict[str, dict]:
    """Un document par identifiant ; si un connecteur (API Claude) et le modele local ont produit la meme adresse,
    la version du connecteur l'emporte (fonction pure)."""
    uniques: dict[str, dict] = {}
    for sig, doc in mapped:
        actuel = uniques.get(sig)
        local_remplace_connecteur = (actuel is not None and doc["scrapeMetadata"]["moteur"] == "ollama"
                                     and actuel["scrapeMetadata"]["moteur"] != "ollama")
        if not local_remplace_connecteur:
            uniques[sig] = doc
    return uniques


def parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def parse_budget_total(enveloppe: str | None) -> int | None:
    """Extrait un montant entier d'une chaine du type '2 500 000 euros'. Retourne None si ambigu."""
    if not enveloppe:
        return None
    digits = re.findall(r"\d[\d\s .]*", enveloppe)
    if len(digits) != 1:
        return None
    try:
        return int(re.sub(r"[\s .]", "", digits[0]))
    except ValueError:
        return None


def piece_jointe(fichier: dict, doc_id: str) -> dict:
    """Entree fichiersJoints : url d'origine, nom, et chemin Storage si le fichier est sur le disque.

    Pourquoi heberger : les sites des ARS repondent 403 a tout acces direct a leurs fichiers
    (constate le 2026-10-09) ; le scraping les a deja telecharges dans scraping/downloads/.
    Le chemin uploads/aap-documents/<id>/<nom> est celui que storage.rules reserve aux comptes
    connectes avec abonnement ou essai. localPath est retire avant l'ecriture en base.
    """
    entree = {"url": fichier.get("url"), "filename": fichier.get("filename")}
    local = fichier.get("local_path")
    chemin = (ROOT / "scraping" / local) if local else None
    if chemin and chemin.exists() and entree["filename"]:
        # fichierLocal : chemin relatif a scraping/downloads, servi par l'application en mode
        # developpement via le lien app/public/documents -> scraping/downloads (demo locale, sans frais)
        entree["fichierLocal"] = chemin.relative_to(ROOT / "scraping" / "downloads").as_posix()
        entree["localPath"] = str(chemin)
        entree["_storagePath"] = f"uploads/aap-documents/{doc_id}/{entree['filename']}"
    return entree


def envoyer_fichiers(bucket, doc: dict) -> tuple[int, int]:
    """Envoie dans Storage les fichiers d'un AAP absents du bucket. Retourne (envoyes, deja presents)."""
    import mimetypes

    envoyes = presents = 0
    for entree in doc["scrapeMetadata"]["fichiersJoints"]:
        local = entree.pop("localPath", None)
        chemin_storage = entree.pop("_storagePath", None)
        if not local:
            continue
        blob = bucket.blob(chemin_storage)
        if blob.exists():
            presents += 1
        else:
            blob.upload_from_filename(local, content_type=mimetypes.guess_type(local)[0] or "application/octet-stream")
            envoyes += 1
        entree["storagePath"] = chemin_storage  # ecrit seulement une fois la copie presente dans Storage
    return envoyes, presents


def retirer_champs_internes(doc: dict) -> None:
    for entree in doc["scrapeMetadata"]["fichiersJoints"]:
        entree.pop("localPath", None)
        entree.pop("_storagePath", None)


def ecrire_documents(col, nouveau_batch, mapped: list[tuple[str, dict]], now: datetime, bucket=None) -> dict:
    """Ecrit les documents par lots de 400 (limite Firestore : 500 operations). Retourne les compteurs.

    col : la collection Firestore (ou son faux en memoire dans les tests) ; nouveau_batch : fabrique de lots
    (db.batch). Regles : creation complete ; sur un document existant, jamais les champs humains (status,
    publishedAt, validation) ni, si la fiche est validee, les champs metier.
    """
    compteurs = {"crees": 0, "mis_a_jour": 0, "envoyes": 0, "presents": 0}
    batch, pending = nouveau_batch(), 0
    for sig, doc in mapped:
        if bucket is not None:
            e, p = envoyer_fichiers(bucket, doc)
            compteurs["envoyes"] += e
            compteurs["presents"] += p
        else:
            retirer_champs_internes(doc)
        ref = col.document(sig)  # sig = identifiant stable derive de l'adresse
        snap = ref.get()
        if snap.exists:
            compteurs["mis_a_jour"] += 1
            batch.set(ref, document_a_envoyer(doc, True, snap.to_dict()), merge=True)
        else:
            compteurs["crees"] += 1
            batch.set(ref, {**doc, "createdAt": now, **({"publishedAt": now} if doc["status"] == "published" else {})})
        pending += 1
        if pending >= 400:
            batch.commit()
            batch, pending = nouveau_batch(), 0
    if pending:
        batch.commit()
    return compteurs


def to_app_aap(item: dict, source_name: str, now: datetime) -> dict | None:
    """Mappe un AapNormalized vers le type AAP de l'application. Retourne None si inexploitable."""
    titre = (item.get("titre") or "").strip()
    financeur = (item.get("financeur") or "").strip()
    if not titre or not financeur:
        return None

    deadline = parse_date(item.get("date_cloture"))
    publication = parse_date(item.get("date_ouverture"))
    # Emetteur du registre dont vient la fiche (scrape_metadata.source du passage local, ou connecteur), nom canonique
    # du financeur (None quand rien ne rattache le nom lu : il est alors garde tel quel).
    emetteur = financeurs.emetteur_de(item, source_name, EMETTEURS)
    nom_canonique = financeurs.canonique(financeur, emetteur["id"] if emetteur else None, FINANCEURS)
    # Relais (changement financeur-reel-des-relais) : « Lyonbiopôle … (appel émis par la Commission européenne) » affiche
    # le financeur cité entre parenthèses, quand le référentiel le connaît ; un appel propre au relais garde son nom.
    if emetteur and emetteur.get("relais"):
        reel = financeurs.financeur_reel_du_relais(financeur, emetteur["id"], FINANCEURS)
        if reel:
            nom_canonique = financeurs.canonique(reel, None, FINANCEURS) or reel

    tags = [source_name]
    if item.get("territoire"):
        tags.append(item["territoire"].strip())
    for cat in item.get("categories_etablissement") or []:
        tags.append(cat.strip())
    # L'etiquette a-verifier n'est plus posee ici d'apres le moteur : elle decoule du statut de validation
    # (appliquer_verdict), seule source de la fiabilite d'une fiche (lot 0, instruction 3).

    doc = {
        "financeurId": SCRAPED_FINANCEUR_ID,
        "financeurName": nom_canonique or financeur,
        "title": titre,
        "description": (item.get("description") or "").strip(),
        # Specialisation sante : tous les AAP scrapes relevent du secteur "sante" ou "social"
        # de l'application. [A VALIDER - Monsieur DUCOUT : affiner par source si besoin]
        "sectorsTargeted": ["sante", "social"],
        "territoriesEligible": territoires.territoire_depuis(item.get("territoire"), emetteur),
        "structureTypeEligible": item.get("categories_etablissement") or [],
        "budgetMin": item.get("montant_min"),
        "budgetMax": item.get("montant_max"),
        "budgetTotal": parse_budget_total(item.get("enveloppe_globale")),
        "deadline": deadline,
        "publicationDate": publication,
        "eligibilityCriteria": "\n".join(f"- {e}" for e in item.get("eligibilite") or []) or None,
        "requiredDocuments": item.get("pieces_attendues") or [],
        "externalUrl": item.get("url_source"),
        "tags": [t for t in tags if t],
        "status": "published",
        "source": "scraped",
        "scrapeMetadata": {
            # Source reelle : l'emetteur du registre quand la fiche le porte ou que le fichier est un connecteur connu ;
            # sinon le nom du fichier. Le fichier d'origine reste dans « fichier », le nom lu par l'IA dans « financeurExtrait ».
            "source": emetteur["id"] if emetteur else source_name,
            "sourceNom": emetteur["nom"] if emetteur else source_name,
            "fichier": source_name,
            "financeurExtrait": financeur,
            "signature": signature(titre, financeur, item.get("date_cloture")),
            "moteur": (item.get("scrape_metadata") or {}).get("moteur") or "connecteur",
            "modele": (item.get("scrape_metadata") or {}).get("modele") or "",
            # Champ (filtre-champ-sante) : reponse du modele a « de quel champ releve cet appel ? », avec sa raison.
            "champ": (item.get("scrape_metadata") or {}).get("champ") or "",
            "champRaison": (item.get("scrape_metadata") or {}).get("champ_raison") or "",
            "champModele": (item.get("scrape_metadata") or {}).get("champ_modele") or "",
            "enveloppeGlobale": item.get("enveloppe_globale"),
            # Date de lecture de la page par le moteur (mention-relecture-fiches) : produite_le (local, API) ou scraped_at
            "extraitLe": (item.get("scrape_metadata") or {}).get("produite_le")
            or (item.get("scrape_metadata") or {}).get("scraped_at") or "",
            # Lot 2, instruction 10 (fraicheur-dates-collecte) : date de collecte du texte, et date du dernier import ou
            # la fiche figurait dans un fichier de resultats (champ technique, reecrit a chaque import)
            "collecteLe": (item.get("scrape_metadata") or {}).get("collecte_le")
            or (item.get("scrape_metadata") or {}).get("scraped_at") or "",
            # Rejeu (rejeu-collecte-veille) : derniere vue sur la page source quand le rejeu l'a notee, sinon l'import
            "derniereVueLe": (item.get("scrape_metadata") or {}).get("vue_rubrique_le") or now.isoformat(),
            "absences": int((item.get("scrape_metadata") or {}).get("absences") or 0),
            "fichiersJoints": [
                piece_jointe(f, f"scraped-{signature(titre, financeur, item.get('date_cloture'))}")
                for f in item.get("fichiers_joints") or []
            ],
            "importedAt": now,
        },
        "views": 0,
        "applicationsCount": 0,
        "updatedAt": now,
    }
    verification = (item.get("scrape_metadata") or {}).get("verification")
    if verification:
        # Controle de la fiche par le modele (verification-assistee-haiku) : resume seulement, le detail par champ reste
        # dans les fichiers de resultats ; la mention « relue » depend du seul verdict humain (validation.statut).
        doc["scrapeMetadata"]["verification"] = {"modele": verification.get("modele", ""), "le": verification.get("le", ""),
                                                  "douteux": list(verification.get("douteux") or []),
                                                  "estUnAppel": verification.get("est_un_appel")}
    # Firestore refuse les None dans certains SDK ; on les retire pour rester propre.
    return {k: v for k, v in doc.items() if v is not None}


def load_results(source_filter: str | None) -> list[tuple[str, dict]]:
    items: list[tuple[str, dict]] = []
    for path in sorted(RESULTS_DIR.glob("*.json")):
        if path.name.endswith(".errors.json"):
            continue
        source_name = path.stem
        # Les fichiers de l'echantillon (echantillon_*.json, controle_*.json) ne sont pas des sorties
        # de connecteur : les fiches Ollama non controlees ne doivent pas partir dans la base par un
        # import global. On ne les lit que sur demande explicite (--source echantillon_claude_code).
        # Idem pour les verdicts humains (validation_*.json) et les pages refusees par le modele (*_non_aap.json) :
        # ce ne sont pas des fiches. Sans ce filtre, ils etaient comptes « incomplets » (audit du 2026-10-14, M4).
        # Idem pour les sorties de la comparaison des moteurs (comparaison_*.json, 2026-10-14) : des fiches de mesure,
        # pas des fiches a publier.
        if source_filter is None and (source_name.startswith(("echantillon_", "controle_", "validation_", "comparaison_"))
                                      or source_name.endswith("_non_aap")):
            continue
        if source_filter and source_name != source_filter:
            continue
        with path.open(encoding="utf-8") as fh:
            data = json.load(fh)
        if isinstance(data, dict):
            data = list(data.values())
        for item in data:
            items.append((source_name, item))
    return items


def main() -> int:
    parser = argparse.ArgumentParser(description="Import des AAP scrapes dans Firestore.")
    parser.add_argument("--dry-run", action="store_true", help="n'ecrit rien, affiche le resultat du mapping")
    parser.add_argument("--source", help="n'importer qu'une source (nom du fichier JSON sans extension)")
    parser.add_argument("--include-expired", action="store_true", help="importer aussi les AAP dont la cloture est passee")
    parser.add_argument("--key", default=str(DEFAULT_KEY), help="chemin de la cle de compte de service Firebase")
    parser.add_argument("--bucket", help="bucket Storage (defaut : <project_id>.firebasestorage.app)")
    parser.add_argument("--projet", help="identifiant de projet force (emulateurs : demo-aap avec FIRESTORE_EMULATOR_HOST)")
    parser.add_argument(
        "--vers-storage",
        action="store_true",
        help="envoyer aussi les pieces jointes dans Firebase Storage (necessite le forfait Blaze ; par defaut, "
        "les fichiers sont seulement references en local pour la demo sur le PC)",
    )
    args = parser.parse_args()

    if not RESULTS_DIR.exists():
        print(f"Dossier introuvable : {RESULTS_DIR}. Lancer d'abord scraping/run.py.", file=sys.stderr)
        return 1

    now = datetime.now(timezone.utc)
    today = date.today()
    raw = load_results(args.source)
    verdicts = json.loads(VERDICTS.read_text(encoding="utf-8")) if VERDICTS.exists() else {}
    mapped: list[tuple[str, dict]] = []
    skipped = {"incomplet": 0, "expire": 0}
    en_attente, hors_champ = 0, 0

    try:
        for source_name, item in raw:
            verifier_fiche(item, f"{source_name}.json")
            decision = verification.decision_du_modele(item)
            doc = to_app_aap(verification.appliquer_corrections(item, decision), source_name, now)
            if doc is None:
                skipped["incomplet"] += 1
                continue
            if "deadline" not in doc:
                # Pas de date de cloture : aucune date inventee (reponse Q4 du rapport du 2026-10-14) ; la fiche
                # entre en brouillon avec deadline nulle, en attente de la validation de Monsieur DUCOUT.
                doc = sans_date_en_attente(doc, today)
                en_attente += 1
            elif not args.include_expired and doc["deadline"].date() < today:
                skipped["expire"] += 1
                continue
            doc = appliquer_verdict(doc, verdicts.get(doc["externalUrl"]))
            doc = champ_en_attente(doc, today)
            doc = appliquer_decision_du_modele(doc, decision)
            doc = appliquer_qualification(doc, item, today)
            doc = publication_selon_controle(doc)
            hors_champ += "hors-champ" in doc["tags"]
            verifier_champs(doc, f"{doc['externalUrl']} ({source_name}.json)")
            mapped.append((identifiant(doc["externalUrl"]), doc))
    except ChampInconnu as err:
        print(f"Import arrete, rien n'est ecrit : {err}", file=sys.stderr)
        return 1

    # Deux sources peuvent livrer le meme AAP (ars_idf et ars_idf_local, connecteur et modele local) : meme
    # adresse, donc meme document Firestore. On fusionne ici pour que les compteurs affiches correspondent au
    # nombre reel de documents ecrits (le dernier lu l'emporte).
    uniques = fusionner(mapped)
    doublons = len(mapped) - len(uniques)
    mapped = list(uniques.items())

    print(f"AAP lus : {len(raw)} | a importer : {len(mapped)} (dont {doublons} doublons fusionnes, {en_attente} sans date publiees, {hors_champ} hors champ en brouillon)"
          f"| ignores : {skipped} | verdicts lus : {len(verdicts)}")
    # Mesure du nettoyage (changement nettoyage-financeurs-territoires) : noms de financeurs distincts et part des
    # fiches rattachees a un nom canonique, repartition des territoires.
    publies = [d for _, d in mapped if d["status"] == "published"]
    noms = {d["financeurName"] for d in publies}
    rattachees = sum(1 for d in publies
                     if financeurs.canonique(d["scrapeMetadata"]["financeurExtrait"], d["scrapeMetadata"]["source"], FINANCEURS))
    repartition = Counter(t for d in publies for t in d["territoriesEligible"])
    print(f"Fiches publiees : {len(publies)} | financeurs distincts : {len(noms)} ({rattachees} fiches au nom canonique) "
          f"| territoires : {dict(repartition.most_common())}")
    fichiers = [e for _, d in mapped for e in d["scrapeMetadata"]["fichiersJoints"]]
    sur_disque = [e for e in fichiers if "localPath" in e]
    print(f"Pieces jointes : {len(fichiers)} | disponibles en local (scraping/downloads) : {len(sur_disque)}"
          + (" | envoi vers Storage demande" if args.vers_storage else ""))

    if args.dry_run:
        for sig, doc in mapped[:10]:
            marque = " - a-verifier" if "a-verifier" in doc["tags"] else ""
            cloture = doc["deadline"].date() if doc.get("deadline") else "non precisee"
            print(f"  [{sig}] {doc['financeurName']} - {doc['title'][:70]} - cloture {cloture}{marque} "
                  f"- {doc['status']} - validation {doc['validation']['statut']}")
        if len(mapped) > 10:
            print(f"  ... et {len(mapped) - 10} autres")
        return 0

    key_path = Path(args.key)
    if not key_path.exists():
        print(f"Cle de compte de service introuvable : {key_path}", file=sys.stderr)
        return 1

    import firebase_admin
    from firebase_admin import credentials, firestore, storage

    # --projet (emulateurs-parcours-connectes, 2026-10-20) : avec FIRESTORE_EMULATOR_HOST, les ecritures vont dans
    # l'emulateur du PC sous cet identifiant (demo-aap), jamais dans le vrai projet
    firebase_admin.initialize_app(credentials.Certificate(str(key_path)), {"projectId": args.projet} if args.projet else None)
    db = firestore.client()
    col = db.collection("aap")
    bucket = None
    if args.vers_storage and sur_disque:
        with key_path.open(encoding="utf-8") as fh:
            project_id = json.load(fh)["project_id"]
        bucket = storage.bucket(args.bucket or f"{project_id}.firebasestorage.app")
        from google.api_core.exceptions import Forbidden

        try:
            if not bucket.exists():
                print(f"Bucket Storage introuvable : {bucket.name} (activer Storage dans la console ou passer --bucket)", file=sys.stderr)
                return 1
            bucket.blob("uploads/aap-documents/.verification").exists()
        except Forbidden as err:
            # Cas reel du 2026-10-09 : compte de facturation du projet ferme. Firebase Storage exige
            # un projet rattache a un compte de facturation (forfait Blaze), meme dans la part gratuite.
            print("Acces a Storage refuse par Google : " + str(err).split(":")[-1].strip(), file=sys.stderr)
            print("Rien n'a ete ecrit. Rattacher un compte de facturation au projet, ou relancer sans --vers-storage.", file=sys.stderr)
            return 1

    c = ecrire_documents(col, db.batch, mapped, now, bucket)
    print(f"Termine : {c['crees']} crees, {c['mis_a_jour']} mis a jour, collection 'aap'. "
          f"Pieces jointes : {c['envoyes']} envoyees dans Storage, {c['presents']} deja presentes.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
