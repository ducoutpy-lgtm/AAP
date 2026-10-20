"""Financeurs canoniques : un nom par financeur, quelle que soit l'orthographe extraite.

Changement OpenSpec `nettoyage-financeurs-territoires` (2026-10-14). Pourquoi : le nom du financeur était recopié tel
quel depuis chaque page ; au soir du 2026-10-14 la base comptait 203 noms pour 420 fiches, l'ARS Île-de-France seule
sous six orthographes, et le filtre « Financeur » de l'application était inutilisable.

Table `sources/financeurs.json` : { identifiant d'émetteur du registre : {"nom", "categorie", "alias": [...]} }, construite
depuis le registre (`--construire`, fusion : le nom et les alias ajoutés à la main sont conservés) et relue par l'import.
Un nom extrait est rattaché quand ses mots, sans accents ni mots vides et dans n'importe quel ordre, sont ceux d'un
alias ; un nom qui commence par « ARS » ou « Agence régionale de santé » est rattaché à l'ARS de la région qu'il cite,
ou à l'ARS émettrice de la fiche. Sinon le nom extrait reste tel quel (rapport `--non-rattaches`).

Usage (depuis scraping/) :
  python financeurs.py --construire        # écrit ou complète sources/financeurs.json depuis le registre
  python financeurs.py --non-rattaches     # noms extraits des fichiers de l'import qui restent sans nom canonique
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI))
import registre  # noqa: E402
import territoires  # noqa: E402
from territoires import normaliser  # noqa: E402

TABLE = ICI / "sources" / "financeurs.json"
# Dernier morceau d'un nom du registre qui décrit la page et non l'organisme (« – appels à projets »,
# « - accueil de Troyes ») : retiré du nom du financeur, gardé dans le nom de la source.
MOTS_DE_PAGE = frozenset(("appel", "appels", "aides", "aap", "accueil", "politique", "programmes", "annuaire", "contrat",
                          "subventions", "financement", "fondations", "veille", "candidatures"))
SEPARATEUR = re.compile(r"\s+[–—-]\s+")
# « CNSA (Caisse nationale de solidarité pour l'autonomie) » : le sigle seul suffit comme nom de financeur.
SIGLE_DEVELOPPE = re.compile(r"^([A-Z][A-Za-z0-9+-]{1,11}) \((.+)\)$")


def cle(texte: str | None) -> str:
    """Clé de comparaison : les mots normalisés, uniques, triés (« ARS de l'Essonne » = « Essonne ARS »)."""
    return " ".join(sorted(set(normaliser(texte).split())))


def nom_canonique(nom_registre: str) -> str:
    """Nom du financeur tiré du nom du registre : sans le suffixe qui décrit la page ; le sigle seul s'il est développé
    entre parenthèses."""
    morceaux = SEPARATEUR.split(nom_registre.strip())
    if len(morceaux) > 1 and set(normaliser(morceaux[-1]).split()) & MOTS_DE_PAGE:
        return " – ".join(m.strip() for m in morceaux[:-1])
    sigle = SIGLE_DEVELOPPE.match(nom_registre.strip())
    return sigle.group(1) if sigle else nom_registre.strip()


def alias_generes(nom_registre: str) -> list[str]:
    """Variantes d'écriture d'un nom du registre : sans suffixe de page, sans parenthèse, sigle à la place du
    développé (et l'inverse), abréviations de région (« ARS IDF »)."""
    variantes = {nom_registre.strip(), nom_canonique(nom_registre)}
    for v in list(variantes):
        m = re.search(r"\(([^)]*)\)", v)
        if m:
            variantes.add(re.sub(r"\s*\([^)]*\)", "", v).strip())
            variantes.add(f"{m.group(1)} {v[m.end():]}".strip())
    for v in list(variantes):
        n = f" {normaliser(v)} "
        for region, abrevs in territoires.ABREVIATIONS_REGIONS.items():
            phrase = f" {normaliser(region.replace('-', ' '))} "
            if phrase in n:
                for abrev in abrevs:
                    variantes.add(n.replace(phrase, f" {abrev} ").strip())
    return sorted(v for v in variantes if normaliser(v))


def construire(sources: list[dict], existante: dict | None = None) -> dict:
    """Table des financeurs depuis le registre, fusionnée avec la table existante (nom et alias à la main conservés)."""
    table = {k: dict(v) for k, v in (existante or {}).items()}
    for s in sources:
        entree = table.setdefault(s["id"], {"nom": nom_canonique(s["nom"]), "categorie": s.get("categorie", "")})
        entree.setdefault("nom", nom_canonique(s["nom"]))
        entree["categorie"] = s.get("categorie", entree.get("categorie", ""))
        deja = {cle(a) for a in entree.get("alias", [])}
        entree["alias"] = list(entree.get("alias", []))
        for a in alias_generes(s["nom"]):
            if cle(a) not in deja:
                entree["alias"].append(a)
                deja.add(cle(a))
    return dict(sorted(table.items()))


def charger(chemin: Path = TABLE) -> dict:
    return json.loads(chemin.read_text(encoding="utf-8")) if chemin.exists() else {}


def sauver(table: dict, chemin: Path = TABLE) -> None:
    """Une entrée par ligne : le fichier reste lisible et modifiable à la main, et un diff Git montre l'entrée changée."""
    lignes = [f" {json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)}" for k, v in table.items()]
    chemin.write_text("{\n" + ",\n".join(lignes) + "\n}\n", encoding="utf-8")


_INDEX: dict[int, tuple[dict[str, set[str]], dict[str, str]]] = {}


def _index(table: dict) -> tuple[dict[str, set[str]], dict[str, str]]:
    """(clé d'alias -> identifiants, région -> identifiant de l'ARS), calculé une fois par table."""
    if id(table) not in _INDEX:
        par_cle: dict[str, set[str]] = defaultdict(set)
        ars_par_region: dict[str, str] = {}
        for ident, e in table.items():
            for a in [e["nom"], *e.get("alias", [])]:
                par_cle[cle(a)].add(ident)
            if e.get("categorie") == "ars":
                regions = territoires.regions_dans(e["nom"])
                if len(regions) == 1:
                    ars_par_region[regions.pop()] = ident
        _INDEX[id(table)] = (dict(par_cle), ars_par_region)
    return _INDEX[id(table)]


# Séparateurs qui annoncent un cofinanceur, un partenaire ou une précision : la partie de tête est le financeur
# principal (retours de Monsieur DUCOUT du 2026-10-20 : « Fondation de France / Fondation Jean Valade »,
# « Ville de Paris – Direction de la Santé Publique », « CNSA (...) et Assurance retraite » comptaient pour trois noms).
SEPARATEURS_TETE = re.compile(r"\s+(?:[–—/-]|et|avec|, en partenariat|, avec)\s+|,\s+en partenariat\s+|,\s+avec\s+")
PARENTHESE = re.compile(r"\s*\(([^()]*)\)")
DEPARTEMENT = re.compile(r"^(?:le |la )?(?:d[ée]partement|conseil d[ée]partemental|collectivit[ée] d[ée]partementale)\s+(?:du |de la |de l'|de l’|de |des |d'|d’)?(.+)$", re.I)


def _exact(nom: str, emetteur_id: str | None, table: dict) -> str | None:
    """Rattachement par alias ou par la règle des ARS (la règle d'origine, inchangée)."""
    par_cle, ars_par_region = _index(table)
    noms = {table[i]["nom"] for i in par_cle.get(cle(nom), ())}
    if len(noms) == 1:
        return noms.pop()
    mots = normaliser(nom).split()
    if mots and mots[0] == "ars":
        regions = territoires.regions_dans(nom)
        if len(regions) == 1 and regions.copy().pop() in ars_par_region:
            return table[ars_par_region[regions.pop()]]["nom"]
        if emetteur_id in ars_par_region.values():
            return table[emetteur_id]["nom"]
    return None


GENERIQUES = frozenset(("region", "departement", "conseil departemental", "conseil regional", "collectivite", "autres", "autre",
                        "etat region", "prefecture", "ars", "caf", "le departement", "la region", "conseil general"))
CATEGORIES_EMETTEUR_FINANCEUR = frozenset(("collectivite", "ars", "caisse-nationale", "ministere", "agence-nationale"))


def nom_de_l_emetteur_si_generique(nom: str, emetteur_id: str | None, table: dict) -> str | None:
    """« Région », « Département », « Autres », « Le64 », un nom de département nu : le financeur est l'émetteur de la
    fiche quand celui-ci est une collectivité, une ARS, une caisse ou un ministère (fonction pure)."""
    e = table.get(emetteur_id or "")
    if not e or e.get("categorie") not in CATEGORIES_EMETTEUR_FINANCEUR or normaliser(e["nom"]).startswith("portail"):
        return None
    n = normaliser(nom)
    if n == "ars" and e.get("categorie") != "ars":  # « ARS » cofinanceur d'une caisse ou d'un conseil : pas l'émetteur
        return None
    if n in GENERIQUES or len(n) <= 4 or n in normaliser(e["nom"]).split() or normaliser(e["nom"]).endswith(" " + n):
        return e["nom"]
    return None


def canonique(nom_extrait: str | None, emetteur_id: str | None = None, table: dict | None = None) -> str | None:
    """Nom canonique d'un financeur extrait, ou None si rien ne le rattache (fonction pure sur la table donnée).
    Le nom trouvé au registre passe ensuite par les familles (« Mairie de Brest » -> « Ville de Brest »)."""
    trouve = _canonique_brut(nom_extrait, emetteur_id, table)
    if trouve is None:
        return None
    return famille_generique(trouve) or trouve


def _canonique_brut(nom_extrait: str | None, emetteur_id: str | None = None, table: dict | None = None) -> str | None:
    """Rattachement sans la passe des familles sur le résultat.

    Dans l'ordre : le nom tel quel ; sans ses parenthèses (« (probable, non confirmé) », « (avec le soutien de...) ») ;
    le contenu d'une parenthèse (« Agence de Santé Guadeloupe (ARS Guadeloupe) ») ; la tête avant un séparateur de
    cofinanceur ou de précision ; « Département du Gers » lu comme « Conseil départemental Gers »."""
    table = charger() if table is None else table
    nom = (nom_extrait or "").strip()
    if not nom:
        return None
    trouve = _exact(nom, emetteur_id, table)
    if trouve:
        return trouve
    sans_parentheses = PARENTHESE.sub("", nom).strip()
    if sans_parentheses and sans_parentheses != nom:
        trouve = _canonique_brut(sans_parentheses, emetteur_id, table)
        if trouve:
            return trouve
    for interieur in PARENTHESE.findall(nom):
        trouve = _exact(interieur.strip(), emetteur_id, table)
        if trouve:
            return trouve
    tete = SEPARATEURS_TETE.split(sans_parentheses or nom, maxsplit=1)[0].strip(" ,")
    if tete and tete != nom and tete != sans_parentheses:
        trouve = _canonique_brut(tete, emetteur_id, table)
        if trouve:
            return trouve
    m = DEPARTEMENT.match(sans_parentheses or nom)
    if m:
        return _exact(f"Conseil départemental {m.group(1)}", emetteur_id, table) or f"Conseil départemental {m.group(1).strip()}"
    return famille_generique(sans_parentheses or nom) or nom_de_l_emetteur_si_generique(nom, emetteur_id, table)


# Familles d'organismes hors registre (retour de Monsieur DUCOUT du 2026-10-20 soir : « BPI France en quatre
# écritures, DREETS par région, État avec et sans accent, FSE et FSE.gouv, mairie ou ville de X... on va en avoir
# 150 000 à la fin »). Règle : un nom par organisme national (le territoire est porté par la fiche, pas par le nom),
# une seule écriture pour les villes, régions et départements, et une casse propre.
FAMILLES_NATIONALES: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\bbpi ?france\b"), "Bpifrance"),
    (re.compile(r"^fondation france\b"), "Fondation de France"),
    (re.compile(r"\b(dreets|drieets|ddets|deets|direccte)\b|direction regionale economie emploi|direction economie emploi travail"), "DREETS"),
    (re.compile(r"\b(draaf|daaf|driaaf)\b|direction regionale alimentation agriculture|direction alimentation agriculture foret"), "DRAAF"),
    (re.compile(r"\bfse\b|fonds social europeen"), "Fonds social européen (FSE+)"),
    (re.compile(r"\bfeder\b|fonds europeen developpement regional"), "FEDER"),
    (re.compile(r"ministere agriculture|ministere agro"), "Ministère de l'Agriculture"),
    (re.compile(r"ministere interieur"), "Ministère de l'Intérieur"),
    (re.compile(r"ministere europe affaires etrangeres|\bmeae\b"), "Ministère de l'Europe et des Affaires étrangères"),
    (re.compile(r"ministere sante|ministere travail sante"), "Ministère de la Santé"),
    (re.compile(r"^(etat|gouvernement)( francais)?$|^etat\b|^gouvernement\b|services etat"), "État"),
    (re.compile(r"agence nationale cohesion territoires|\banct\b"), "ANCT"),
    (re.compile(r"\bademe\b"), "ADEME"),
    (re.compile(r"\bcaf\b|caisse allocations familiales"), "CAF"),
    (re.compile(r"\b(prefet|prefecture)\b"), "Préfecture"),
]
VILLE = re.compile(r"^(?:la |le )?(?:ville|mairie|commune|municipalite) (?:de la |de l'|de l’|d'|d’|du |des |de )(.+)$", re.I)
REGION = re.compile(r"^(?:la )?(?:region|conseil regional) (?:de la |de l'|de l’|d'|d’|du |des |de )?(.+)$", re.I)
PREFECTURE = re.compile(r"^(?:prefet|prefecture)(?: de la | de l'| de l’| d'| d’| du | des | de | - | – )(.+)$", re.I)


def _casse_propre(texte: str) -> str:
    """« PREFET DE L'ESSONNE » -> « Prefet de l'Essonne » : première lettre en capitale, mots vides en minuscules."""
    if not texte.isupper() or (" " not in texte.strip() and len(texte.strip()) <= 6):  # sigle (ARS, CNSA) : inchangé
        return texte.strip()
    mots = texte.strip().lower().split()
    petits = {"de", "du", "des", "la", "le", "les", "et", "en", "sur", "sous", "a", "au", "aux"}
    return " ".join(m if (i and m in petits) else (m[0].upper() + m[1:]) for i, m in enumerate(mots))


def _sans_accents_minuscules(texte: str) -> str:
    import unicodedata
    return unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode().lower().replace("’", "'")


def famille_generique(nom: str) -> str | None:
    """Nom unique d'un organisme reconnu par sa famille, ou None (fonction pure)."""
    brut = _casse_propre(nom.replace("’", "'"))
    n = normaliser(brut)
    for motif, libelle in FAMILLES_NATIONALES:
        if libelle == "Préfecture":
            m = PREFECTURE.match(_sans_accents_minuscules(brut))
            if m:
                reste = brut[len(brut) - len(m.group(1)):].strip(" -–")
                return f"Préfecture - {reste[:1].upper()}{reste[1:]}"
            continue
        if motif.search(n):
            return libelle
    m = VILLE.match(_sans_accents_minuscules(brut))
    if m:
        reste = brut[len(brut) - len(m.group(1)):].strip()
        return f"Ville d'{reste}" if _sans_accents_minuscules(reste)[:1] in "aeiouyh" else f"Ville de {reste}"
    m = REGION.match(_sans_accents_minuscules(brut))
    if m and m.group(1).strip():
        reste = brut[len(brut) - len(m.group(1)):].strip()
        return f"Conseil régional {reste}"
    return brut if brut != nom.replace("’", "'").strip() else None  # une casse corrigée compte, pas une apostrophe


def index_emetteurs(sources: list[dict]) -> dict[str, dict]:
    """Émetteur par identifiant du registre et par nom de connecteur (ars_idf -> ARS Île-de-France)."""
    idx = {s["id"]: s for s in sources}
    for s in sources:
        for c in (s.get("connecteur") or "").split(","):
            if c.strip():
                idx.setdefault(c.strip(), s)
    return idx


def emetteur_de(item: dict, source_name: str, emetteurs: dict[str, dict]) -> dict | None:
    """Entrée du registre dont vient une fiche : `scrape_metadata.source` (passage local), sinon le fichier (connecteur)."""
    source = (item.get("scrape_metadata") or {}).get("source") or source_name
    return emetteurs.get(source) or emetteurs.get(source_name)


def non_rattaches(fiches: list[tuple[str, dict]], emetteurs: dict[str, dict], table: dict) -> list[tuple[str, int, str]]:
    """(nom extrait, nombre de fiches, émetteur) des financeurs sans nom canonique, les plus fréquents d'abord."""
    compte: Counter = Counter()
    origine: dict[str, str] = {}
    for source_name, item in fiches:
        nom = (item.get("financeur") or "").strip()
        em = emetteur_de(item, source_name, emetteurs)
        if nom and canonique(nom, em["id"] if em else None, table) is None:
            compte[nom] += 1
            origine.setdefault(nom, em["nom"] if em else (item.get("scrape_metadata") or {}).get("source") or source_name)
    return [(nom, n, origine[nom]) for nom, n in compte.most_common()]


def main() -> int:
    parser = argparse.ArgumentParser(description="Financeurs canoniques (table sources/financeurs.json).")
    parser.add_argument("--construire", action="store_true", help="écrit ou complète la table depuis le registre")
    parser.add_argument("--non-rattaches", action="store_true", help="noms extraits sans nom canonique")
    args = parser.parse_args()
    sources = registre.charger()
    if args.construire:
        avant = charger()
        table = construire(sources, avant)
        sauver(table)
        print(f"{TABLE.name} : {len(table)} financeurs ({len(table) - len(avant)} nouveaux), "
              f"{sum(len(e['alias']) for e in table.values())} alias")
    if args.non_rattaches:
        import champ

        table = charger()
        emetteurs = index_emetteurs(sources)
        fiches = [(p.stem, f) for p in champ.fichiers_de_l_import() for f in json.loads(p.read_text(encoding="utf-8"))]
        restes = non_rattaches(fiches, emetteurs, table)
        total = sum(n for _, n, _ in restes)
        print(f"{len(fiches)} fiches ; {total} fiches ({len(restes)} noms) sans nom canonique, "
              f"{len(fiches) - total} rattachées")
        for nom, n, em in restes[:40]:
            print(f"{n:3d} | {nom[:70]:70s} | {em[:40]}")
    if not (args.construire or args.non_rattaches):
        parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
