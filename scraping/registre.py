"""Registre des sources d'appels a projets (spec openspec/specs/registre-sources).

Un seul fichier de verite, sources/registre.json, et trois commandes :

  python registre.py --verifier-format   # le fichier est-il complet et coherent ?
  python registre.py --verifier-pages    # chaque page repond-elle encore ? (requetes HTTP simples)
  python registre.py --tableau           # ecrit REGISTRE_SOURCES.md, la vue lisible

Pourquoi un outil a part : regle du POC, un outil = une responsabilite (run.py, validate.py,
analyze_costs.py, debug_page.py ne sont pas fusionnes). Bibliotheque standard uniquement, pour
que l'outil tourne sans l'environnement complet du scraping.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

ICI = Path(__file__).resolve().parent
REGISTRE = ICI / "sources" / "registre.json"
TABLEAU = ICI / "REGISTRE_SOURCES.md"

CHAMPS = ("id", "nom", "categorie", "url_aap", "perimetre", "statut", "connecteur", "notes",
          "derniere_verification", "code_http")
CATEGORIES = ("ars", "ministere", "caisse-nationale", "agence-nationale", "fondation", "europe",
              "collectivite", "societe-savante", "etablissement", "centrale-achat", "autre")
PERIMETRES = ("sante", "medico-social", "sante-et-medico-social")
STATUTS = ("identifiee", "page-verifiee", "connecteur-teste", "operationnelle")

LIBELLES_CATEGORIES = {
    "ars": "ARS régionales",
    "ministere": "Ministères et services de l'État",
    "caisse-nationale": "Caisses nationales",
    "agence-nationale": "Agences et opérateurs nationaux",
    "fondation": "Fondations et fonds privés",
    "europe": "Programmes européens",
    "collectivite": "Collectivités territoriales",
    "societe-savante": "Sociétés savantes et fédérations médicales",
    "etablissement": "Hôpitaux, groupes et fondations hospitalières",
    "centrale-achat": "Centrales d'achat et groupements hospitaliers",
    "autre": "Autres émetteurs",
}
LIBELLES_STATUTS = {
    "identifiee": "identifiée",
    "page-verifiee": "page vérifiée",
    "connecteur-teste": "connecteur testé",
    "operationnelle": "opérationnelle",
}

# En-tete navigateur : certains sites institutionnels refusent les clients sans User-Agent.
EN_TETES = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36",
            "Accept-Language": "fr-FR,fr;q=0.9"}


def charger(chemin: Path = REGISTRE) -> list[dict]:
    with chemin.open(encoding="utf-8") as fh:
        return json.load(fh)


def sauver(sources: list[dict], chemin: Path = REGISTRE) -> None:
    chemin.write_text(json.dumps(sources, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def erreurs_format(sources: list[dict]) -> list[str]:
    """Liste les anomalies ; vide si le registre est valide."""
    erreurs: list[str] = []
    ids: set[str] = set()
    for i, s in enumerate(sources):
        ref = s.get("id") or f"(source n°{i + 1})"
        for champ in CHAMPS:
            if champ not in s:
                erreurs.append(f"{ref} : champ manquant « {champ} »")
        for champ in ("id", "nom", "categorie", "url_aap", "perimetre", "statut"):
            if not s.get(champ):
                erreurs.append(f"{ref} : champ vide « {champ} »")
        if s.get("categorie") and s["categorie"] not in CATEGORIES:
            erreurs.append(f"{ref} : catégorie inconnue « {s['categorie']} »")
        if s.get("perimetre") and s["perimetre"] not in PERIMETRES:
            erreurs.append(f"{ref} : périmètre inconnu « {s['perimetre']} »")
        if s.get("statut") and s["statut"] not in STATUTS:
            erreurs.append(f"{ref} : statut inconnu « {s['statut']} »")
        if s.get("url_aap") and not str(s["url_aap"]).startswith("http"):
            erreurs.append(f"{ref} : url_aap n'est pas une adresse http(s)")
        if s.get("id") in ids:
            erreurs.append(f"{ref} : identifiant en double")
        ids.add(s.get("id"))
    return erreurs


def code_http(url: str, delai: float = 40.0) -> int | None:
    """Code HTTP de la page, None si le site ne repond pas."""
    requete = urllib.request.Request(url, headers=EN_TETES)
    try:
        with urllib.request.urlopen(requete, timeout=delai) as reponse:
            return reponse.status
    except urllib.error.HTTPError as err:
        return err.code
    except (urllib.error.URLError, TimeoutError, OSError):
        return None


def verifier_pages(sources: list[dict], aujourdhui: str, pause: float = 1.0, sonde=code_http) -> list[dict]:
    """Controle chaque page, met a jour le registre et retourne les sources en erreur."""
    en_erreur: list[dict] = []
    for s in sources:
        code = sonde(s["url_aap"])
        s["code_http"] = code
        s["derniere_verification"] = aujourdhui
        if code == 200:
            if s["statut"] == "identifiee":
                s["statut"] = "page-verifiee"
        else:
            en_erreur.append(s)
        print(f"  {str(code or 'sans réponse'):>12}  {s['nom']}")
        time.sleep(pause)
    return en_erreur


def decompte(sources: list[dict]) -> str:
    parts = []
    for statut in reversed(STATUTS):
        n = sum(1 for s in sources if s["statut"] == statut)
        if n:
            parts.append(f"{n} {LIBELLES_STATUTS[statut]}")
    return f"{len(sources)} sources : " + ", ".join(parts)


def tableau(sources: list[dict], aujourdhui: str) -> str:
    lignes = ["# Registre des sources d'appels à projets", "",
              f"Généré le {aujourdhui} par `python scraping/registre.py --tableau` à partir de",
              "`scraping/sources/registre.json` (fichier de vérité : corriger le JSON, pas ce tableau).", "",
              f"**{decompte(sources)}.**", ""]
    for categorie in CATEGORIES:
        groupe = [s for s in sources if s["categorie"] == categorie]
        if not groupe:
            continue
        lignes += [f"## {LIBELLES_CATEGORIES[categorie]} ({len(groupe)})", "",
                   "| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |",
                   "|---|---|---|---|---|---|---|"]
        for s in sorted(groupe, key=lambda x: x["nom"]):
            controle = f"{s['derniere_verification']} ({s['code_http']})" if s.get("derniere_verification") else ""
            lignes.append(f"| {s['nom']} | {s['perimetre']} | {LIBELLES_STATUTS[s['statut']]} | "
                          f"{s.get('connecteur') or ''} | [page]({s['url_aap']}) | {controle} | {s.get('notes', '')} |")
        lignes.append("")
    return "\n".join(lignes)


def main() -> int:
    parser = argparse.ArgumentParser(description="Registre des sources d'AAP.")
    parser.add_argument("--verifier-format", action="store_true", help="contrôle la structure du registre")
    parser.add_argument("--verifier-pages", action="store_true", help="interroge chaque page et met à jour le registre")
    parser.add_argument("--tableau", action="store_true", help="écrit REGISTRE_SOURCES.md")
    args = parser.parse_args()
    if not (args.verifier_format or args.verifier_pages or args.tableau):
        parser.print_help()
        return 2

    sources = charger()
    erreurs = erreurs_format(sources)
    if erreurs:
        print("Registre invalide :", file=sys.stderr)
        for e in erreurs:
            print("  - " + e, file=sys.stderr)
        return 1
    if args.verifier_format:
        print(f"Registre valide : {len(sources)} sources")

    aujourdhui = date.today().isoformat()
    if args.verifier_pages:
        print(f"Contrôle des {len(sources)} pages :")
        en_erreur = verifier_pages(sources, aujourdhui)
        sauver(sources)
        print(f"{len(sources) - len(en_erreur)} pages OK, {len(en_erreur)} en erreur")
        if en_erreur:
            print("À revoir :")
            for s in en_erreur:
                print(f"  - {s['nom']} ({s['code_http'] or 'sans réponse'}) : {s['url_aap']}")

    if args.tableau:
        TABLEAU.write_text(tableau(sources, aujourdhui), encoding="utf-8")
        print(f"Tableau écrit : {TABLEAU.name} ({decompte(sources)})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
