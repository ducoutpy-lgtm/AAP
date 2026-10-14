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


def canonique(nom_extrait: str | None, emetteur_id: str | None = None, table: dict | None = None) -> str | None:
    """Nom canonique d'un financeur extrait, ou None si rien ne le rattache (fonction pure sur la table donnée)."""
    table = charger() if table is None else table
    par_cle, ars_par_region = _index(table)
    noms = {table[i]["nom"] for i in par_cle.get(cle(nom_extrait), ())}
    if len(noms) == 1:
        return noms.pop()
    mots = normaliser(nom_extrait).split()
    if mots and mots[0] == "ars":
        regions = territoires.regions_dans(nom_extrait)
        if len(regions) == 1 and regions.copy().pop() in ars_par_region:
            return table[ars_par_region[regions.pop()]]["nom"]
        if emetteur_id in ars_par_region.values():
            return table[emetteur_id]["nom"]
    return None


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
