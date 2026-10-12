"""Qualification des sources : la rubrique trouvée liste-t-elle vraiment des appels à projets ?

Usage :
  python qualification.py --qualifier [--limite N] [--ids a,b] [--forcer] [--modele mistral:7b-instruct]
  python qualification.py --registre     # écrit le champ "qualification" dans sources/registre.json et REGISTRE_SOURCES.md
  python qualification.py --rapport      # écrit QUALIFICATION.md

Le modèle local Ollama lit le texte de la page gardée par decouverte.py et répond à des questions
fermées (JSON contraint). Le verdict est calculé par ce script, pas par le modèle. Aucun appel
à l'API Anthropic.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
import urllib.request
from collections import Counter
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import registre as registre_module  # noqa: E402

ICI = Path(__file__).resolve().parent
DOSSIER = ICI / "decouverte"
RESULTATS_DECOUVERTE = DOSSIER / "resultats.json"
QUALIFICATION = DOSSIER / "qualification.json"
SONDAGE = DOSSIER / "sondage_qualification.json"
RAPPORT = ICI / "QUALIFICATION.md"

OLLAMA_URL = "http://localhost:11434/api/chat"
MAX_CARACTERES = 8000
LIENS_RICHES = 10  # au-delà, un "aucun AAP" du modèle devient "a-verifier" plutôt que "pas-d-aap"

VERDICTS = ["rubrique-confirmee", "pdf-seulement", "hors-sante", "pas-d-aap", "a-verifier"]
LIBELLES = {"rubrique-confirmee": "rubrique confirmée", "pdf-seulement": "PDF seulement", "hors-sante": "hors santé",
            "pas-d-aap": "pas d'AAP", "a-verifier": "à vérifier"}

SCHEMA = {
    "type": "object",
    "properties": {
        "liste_aap": {"type": "boolean"},
        "nb_aap": {"type": "integer"},
        "forme": {"type": "string", "enum": ["html", "pdf", "mixte"]},
        "sante_medico_social": {"type": "boolean"},
        "justification": {"type": "string"},
    },
    "required": ["liste_aap", "nb_aap", "forme", "sante_medico_social", "justification"],
}

CONSIGNE = (
    "Tu lis le texte d'une page web d'un organisme français. Réponds en JSON. "
    "liste_aap : true si la page liste ou présente au moins un appel à projets, appel à candidatures, "
    "appel à manifestation d'intérêt, bourse ou subvention auquel on peut candidater (ouvert ou clos) ; "
    "false si c'est une page d'information, de résultats de recherche, d'actualités générales, de tarifs "
    "ou de présentation sans appel. nb_aap : nombre d'appels distincts visibles. forme : html si les appels "
    "sont décrits sur des pages web, pdf s'ils ne sont accessibles qu'en documents à télécharger, mixte sinon. "
    "sante_medico_social : true si au moins un appel concerne la santé, le médico-social, le handicap, "
    "l'autonomie, les personnes âgées, la prévention de la perte d'autonomie (conférence ou commission des financeurs), "
    "la recherche médicale, les établissements de soins ou médico-sociaux. justification : une phrase en français."
)

BLOCS = re.compile(r"<(script|style|noscript|header|nav|footer|aside|svg)\b.*?</\1\s*>", re.S | re.I)
BALISES = re.compile(r"<[^>]+>")


# ---------------------------------------------------------------- fonctions pures

def texte_sans_balises(page: str, maximum: int = MAX_CARACTERES) -> str:
    """Texte visible approximatif : zones de navigation et scripts retirés, balises supprimées."""
    texte = BLOCS.sub(" ", page)
    texte = re.sub(r"<br\s*/?>|</(p|div|li|h[1-6]|tr|article|section)>", "\n", texte, flags=re.I)
    texte = html.unescape(BALISES.sub(" ", texte))
    lignes = [re.sub(r"[ \t\xa0]+", " ", l).strip() for l in texte.splitlines()]
    texte = re.sub(r"\n{2,}", "\n", "\n".join(l for l in lignes if l))
    return texte[:maximum]


def calculer_verdict(reponse: dict, nb_liens_notes: int = 0) -> str:
    if not reponse.get("liste_aap"):
        return "a-verifier" if nb_liens_notes >= LIENS_RICHES else "pas-d-aap"
    if not reponse.get("sante_medico_social"):
        return "hors-sante"
    if reponse.get("forme") == "pdf":
        return "pdf-seulement"
    return "rubrique-confirmee"


def appliquer_registre(sources: list[dict], qualification: dict, aujourdhui: str) -> int:
    """Écrit le champ qualification de chaque source ; retourne le nombre de verdicts reportés."""
    reportes = 0
    for s in sources:
        q = qualification.get(s["id"])
        if q:
            s["qualification"] = {"verdict": q["verdict"], "date": q["date"], "justification": q.get("justification", "")}
            reportes += 1
        else:
            s["qualification"] = {"verdict": "a-verifier", "date": aujourdhui, "justification": "pas de page gardée par la découverte"}
    return reportes


def rapport(qualification: dict, sources: list[dict], sondage: dict, aujourdhui: str) -> str:
    par_id = {s["id"]: s for s in sources}
    verdicts = Counter(q["verdict"] for q in qualification.values())
    sans_page = len(sources) - len(qualification)
    lignes = ["# Qualification des sources", "",
              f"Généré le {aujourdhui} par `python scraping/qualification.py --rapport`. Verdict calculé à partir des",
              "réponses du modèle local Ollama sur la page de rubrique gardée par `decouverte.py` ; sondage manuel ci-dessous.", "",
              f"**{len(qualification)} sources qualifiées sur {len(sources)} : "
              + ", ".join(f"{verdicts.get(v, 0)} {LIBELLES[v]}" for v in VERDICTS)
              + f" ; {sans_page} sources sans page gardée (à vérifier).**", ""]
    sondage = {i: s for i, s in sondage.items() if not i.startswith("_")}  # la clé "_note" est un commentaire
    if sondage:
        accords = sum(1 for s in sondage.values() if s.get("accord") is True)
        desaccords = [(i, s) for i, s in sondage.items() if s.get("accord") is False]
        lignes += ["## Sondage manuel", "",
                   f"{len(sondage)} verdicts relus sur la page d'origine : {accords} accords, {len(desaccords)} désaccords "
                   f"({100 * accords // max(len(sondage), 1)} % d'accord).", ""]
        if desaccords:
            lignes += ["| Source | Verdict du modèle | Verdict relu | Page |", "|---|---|---|---|"]
            for i, s in desaccords:
                q = qualification.get(i, {})
                lignes.append(f"| {par_id.get(i, {}).get('nom', i)} | {LIBELLES.get(q.get('verdict'), '')} | "
                              f"{LIBELLES.get(s.get('verdict_relu'), s.get('verdict_relu', ''))} | [page]({q.get('url', '')}) |")
            lignes.append("")
    lignes += ["## Par famille", "", "| Famille | Qualifiées | " + " | ".join(LIBELLES[v] for v in VERDICTS) + " | Sans page |",
               "|---|---|" + "---|" * (len(VERDICTS) + 1)]
    for categorie in registre_module.CATEGORIES:
        groupe = [s for s in sources if s["categorie"] == categorie]
        if not groupe:
            continue
        qs = [qualification[s["id"]] for s in groupe if s["id"] in qualification]
        c = Counter(q["verdict"] for q in qs)
        lignes.append(f"| {categorie} | {len(qs)} | " + " | ".join(str(c.get(v, 0)) for v in VERDICTS) + f" | {len(groupe) - len(qs)} |")
    lignes += ["", "## Sources confirmées", "", "| Source | Famille | Forme | AAP visibles | Rubrique |", "|---|---|---|---|---|"]
    for i, q in sorted(qualification.items(), key=lambda kv: -kv[1].get("nb_aap", 0)):
        if q["verdict"] in ("rubrique-confirmee", "pdf-seulement"):
            s = par_id.get(i, {})
            lignes.append(f"| {s.get('nom', i)} | {s.get('categorie', '')} | {q.get('forme', '')} | {q.get('nb_aap', '')} | [page]({q['url']}) |")
    lignes += ["", "## Sources à vérifier à la main", "", "| Source | Raison | Page |", "|---|---|---|"]
    for i, q in qualification.items():
        if q["verdict"] == "a-verifier":
            lignes.append(f"| {par_id.get(i, {}).get('nom', i)} | {q.get('justification') or q.get('erreur', '')} | [page]({q['url']}) |")
    return "\n".join(lignes) + "\n"


# ---------------------------------------------------------------- Ollama

def appeler_ollama(modele: str, nom: str, url: str, texte: str) -> dict:
    corps = {"model": modele, "stream": False, "format": SCHEMA, "options": {"temperature": 0, "num_ctx": 8192},
             "messages": [{"role": "system", "content": CONSIGNE},
                          {"role": "user", "content": f"Organisme : {nom}\nAdresse : {url}\n\nTexte de la page :\n{texte}"}]}
    requete = urllib.request.Request(OLLAMA_URL, data=json.dumps(corps).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(requete, timeout=600) as reponse:
        return json.loads(json.loads(reponse.read())["message"]["content"])


def charger(chemin: Path) -> dict:
    return json.loads(chemin.read_text(encoding="utf-8")) if chemin.exists() else {}


def qualifier(resultats: dict, modele: str, limite: int | None, ids: set[str] | None, forcer: bool) -> None:
    qualification = charger(QUALIFICATION)
    a_faire = [r for r in resultats.values() if r["statut"] == "rubrique-trouvee"
               and (ids is None or r["id"] in ids) and (forcer or r["id"] not in qualification)][:limite]
    debut = time.time()
    for i, r in enumerate(a_faire, 1):
        page = DOSSIER / r["id"] / "rubrique.html"
        entree = {"id": r["id"], "url": r["url_rubrique"], "modele": modele, "date": date.today().isoformat(),
                  "nb_liens_notes": r["nb_liens_aap"]}
        try:
            texte = texte_sans_balises(page.read_text(encoding="utf-8"))
            reponse = appeler_ollama(modele, r["nom"], r["url_rubrique"], texte)
            entree.update({k: reponse.get(k) for k in ("liste_aap", "nb_aap", "forme", "sante_medico_social", "justification")})
            entree["verdict"] = calculer_verdict(reponse, r["nb_liens_aap"])
        except Exception as err:
            entree["verdict"] = "a-verifier"
            entree["erreur"] = type(err).__name__ + ": " + str(err).splitlines()[0][:160]
        qualification[r["id"]] = entree
        QUALIFICATION.write_text(json.dumps(qualification, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"[{i}/{len(a_faire)}] {entree['verdict']:19} {r['nom'][:45]:45} {(entree.get('justification') or entree.get('erreur', ''))[:70]}")
    print(f"{len(a_faire)} sources qualifiées en {time.time() - debut:.0f} s ({modele})")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--qualifier", action="store_true")
    parser.add_argument("--limite", type=int)
    parser.add_argument("--ids", help="identifiants séparés par des virgules")
    parser.add_argument("--forcer", action="store_true", help="requalifier même si déjà fait")
    parser.add_argument("--modele", default="mistral:7b-instruct")
    parser.add_argument("--registre", action="store_true", help="reporter les verdicts dans le registre et REGISTRE_SOURCES.md")
    parser.add_argument("--rapport", action="store_true")
    args = parser.parse_args()
    aujourdhui = date.today().isoformat()

    if args.qualifier:
        resultats = json.loads(RESULTATS_DECOUVERTE.read_text(encoding="utf-8"))
        ids = {i.strip() for i in args.ids.split(",")} if args.ids else None
        qualifier(resultats, args.modele, args.limite, ids, args.forcer)
    if args.registre:
        sources = registre_module.charger()
        n = appliquer_registre(sources, charger(QUALIFICATION), aujourdhui)
        registre_module.sauver(sources)
        registre_module.TABLEAU.write_text(registre_module.tableau(sources, aujourdhui), encoding="utf-8")
        print(f"{n} verdicts reportés dans le registre, {len(sources) - n} sources « à vérifier » ; REGISTRE_SOURCES.md régénéré")
    if args.rapport:
        sources = registre_module.charger()
        RAPPORT.write_text(rapport(charger(QUALIFICATION), sources, charger(SONDAGE), aujourdhui), encoding="utf-8")
        print(f"Rapport écrit : {RAPPORT.name}")
    if not any([args.qualifier, args.registre, args.rapport]):
        parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
