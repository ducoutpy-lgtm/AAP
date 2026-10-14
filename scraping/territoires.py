"""Territoire d'une fiche : régions reconnues dans un texte, déduites de l'émetteur sinon.

Changement OpenSpec `nettoyage-financeurs-territoires` (2026-10-14). Pourquoi : l'import écrivait « france » dès que le
texte du territoire n'était pas une des treize régions écrites à la lettre (243 fiches sur 420 au soir du 2026-10-14,
dont des appels d'un département ou d'une ville) ; le filtre « Territoire » de l'application était donc faux.

Règle : on reconnaît dans le texte du territoire les régions (noms actuels, abréviations, anciennes régions), les
départements (par leur nom, pas par leur numéro) et les grandes villes (table `sources/departements.json`), les
expressions les plus longues d'abord pour que « Pays de la Loire » ne devienne pas le département de la Loire. Si le
texte ne dit rien, on applique la même lecture au nom de l'émetteur (ARS Normandie -> Normandie, Loiret -> Centre-Val
de Loire) ; un émetteur d'une catégorie nationale (CNSA, ministères, agences, Europe, sociétés savantes) donne
« france » ; sinon « non-precise », affiché « Territoire non précisé ». « france » n'est jamais une valeur par défaut.

Limites connues : le nom nu « Loire » n'est pas lu comme le département (c'est presque toujours le fleuve) ; les numéros
de département ne sont pas lus (trop de confusions avec des années ou des montants) ; « Nord » seul est lu comme le
département du Nord (une fiche « Aix Nord » sera mal classée).
"""
from __future__ import annotations

import json
import re
import unicodedata
from functools import lru_cache
from pathlib import Path

ICI = Path(__file__).resolve().parent
TABLE = ICI / "sources" / "departements.json"

FRANCE = "france"
NON_PRECISE = "non-precise"

# Mots sans valeur pour comparer deux noms (« ARS de Normandie » = « ARS Normandie »).
MOTS_VIDES = frozenset("de d du des la le les l en et pour a au aux sur the of".split())
# Abréviations courantes des régions, lues dans les fiches (« ARS Paca », « FHF-HDF », « ARS NA »).
ABREVIATIONS_REGIONS = {
    "ile-de-france": ("idf", "region parisienne"),
    "hauts-de-france": ("hdf",),
    "provence-alpes-cote-d-azur": ("paca", "region sud"),
    "bourgogne-franche-comte": ("bfc",),
    "auvergne-rhone-alpes": ("ara", "aura"),
    "centre-val-de-loire": ("cvl",),
    "nouvelle-aquitaine": ("na",),
    "pays-de-la-loire": ("pdl",),
    "la-reunion": ("reunion",),
}
# Catégories du registre dont les émetteurs publient des appels nationaux quand rien ne dit le contraire.
CATEGORIES_NATIONALES = frozenset(("caisse-nationale", "ministere", "agence-nationale", "europe", "societe-savante",
                                   "centrale-achat"))
MOTS_NATIONAUX = frozenset(("france", "national", "nationale", "nationaux", "international", "internationale",
                            "europe", "europeen", "europeenne", "etranger", "outre mer", "dom", "drom"))
# Départements dont le nom nu n'est pas lu (voir les limites dans l'en-tête).
DEPARTEMENTS_NON_LUS = frozenset(("42",))


def normaliser(texte: str | None) -> str:
    """Minuscules, sans accents, sans ponctuation ni mots vides ; « agence régionale de santé » devient « ars »."""
    t = unicodedata.normalize("NFKD", texte or "").encode("ascii", "ignore").decode().lower()
    t = re.sub(r"agence regionale de (la )?sante", " ars ", t)
    t = re.sub(r"[^a-z0-9]+", " ", t)
    return " ".join(m for m in t.split() if m not in MOTS_VIDES)


@lru_cache(maxsize=1)
def table(chemin: Path = TABLE) -> dict:
    return json.loads(chemin.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def phrases(chemin: Path = TABLE) -> list[tuple[str, str]]:
    """(expression normalisée, identifiant de région), des plus longues aux plus courtes."""
    t = table(chemin)
    regions = t["regions"]
    paires: dict[str, str] = {}
    for region in regions.values():
        paires[normaliser(region.replace("-", " "))] = region
        for abrev in ABREVIATIONS_REGIONS.get(region, ()):
            paires[normaliser(abrev)] = region
    for nom, region in t["anciennes_regions"].items():
        paires.setdefault(normaliser(nom), region)
    par_code = {d["code"]: d["region"] for d in t["departements"]}
    for d in t["departements"]:
        if d["code"] not in DEPARTEMENTS_NON_LUS:
            paires.setdefault(normaliser(d["nom"]), d["region"])
    for ville, code in t["villes"].items():
        paires.setdefault(normaliser(ville), par_code[code])
    return sorted(paires.items(), key=lambda p: (-len(p[0].split()), -len(p[0]), p[0]))


def reconnaitre(texte: str | None) -> tuple[set[str], bool]:
    """Régions lues dans un texte, et si le reste du texte porte une mention nationale (fonction pure)."""
    reste = f" {normaliser(texte)} "
    trouvees: set[str] = set()
    for phrase, region in phrases():
        motif = f" {phrase} "
        if motif in reste:
            trouvees.add(region)
            reste = reste.replace(motif, " | ")
    national = any(f" {mot} " in reste for mot in MOTS_NATIONAUX)
    return trouvees, national


def regions_dans(texte: str | None) -> set[str]:
    return reconnaitre(texte)[0]


def territoire_depuis(texte: str | None, emetteur: dict | None = None) -> list[str]:
    """Identifiants de territoire d'une fiche : texte extrait d'abord, émetteur ensuite, jamais « france » par défaut.

    `emetteur` : entrée du registre (`nom`, `categorie`) ou None quand la fiche ne vient pas d'une source du registre.
    """
    regions, national = reconnaitre(texte)
    if regions:
        return sorted(regions)
    if national:
        return [FRANCE]
    if emetteur:
        regions, national = reconnaitre(emetteur.get("nom"))
        if regions:
            return sorted(regions)
        if national or emetteur.get("categorie") in CATEGORIES_NATIONALES:
            return [FRANCE]
    return [NON_PRECISE]
