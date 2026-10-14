"""Filtre du champ santé et médico-social (changement OpenSpec filtre-champ-sante, instruction 26 du rapport de
critique ; définition décidée par Monsieur DUCOUT le 2026-10-14).

Pourquoi : la chaîne choisit des sources, jamais des appels ; les sources mixtes (collectivités, préfectures, agences)
produisent des fiches hors champ que rien n'écarte. Cet outil pose la question du champ aux fiches existantes, évalue
le modèle contre les verdicts de Monsieur DUCOUT et mesure la part de chaque source dans le champ.

Usage (depuis scraping/, environnement ../.venv) :
  python champ.py --classer --dry-run                        # fiches à classer par fichier, coût estimé, rien d'écrit
  python champ.py --classer [--moteur ollama|api] [--modele ...] [--limite N] [--fichier results/x.json ...]
  python champ.py --evaluer [--fichier ...]                  # contre sources/verdicts_champ.json (adresse -> champ)
  python champ.py --rapport                                  # CHAMP.md : répartition, part dans le champ par source

Aucun appel payant sans --moteur api, lui-même soumis à l'accord écrit de Monsieur DUCOUT et au plafond cumulé.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
from collections import Counter
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import echantillon  # noqa: E402
from echantillon import CHAMPS, CONSIGNE_CHAMP, SCHEMA_CHAMP, normaliser_champ  # noqa: E402

ICI = Path(__file__).resolve().parent
VERDICTS_CHAMP = ICI / "sources" / "verdicts_champ.json"
RAPPORT = ICI / "CHAMP.md"
SAUVEGARDES = ICI.parent / "scripts" / "sauvegardes"
REGISTRE = ICI / "sources" / "registre.json"
MODELE_LOCAL_DEFAUT, MODELE_API_DEFAUT = "qwen3:8b", "claude-haiku-5-5"
# Mêmes exclusions que scripts/import_to_firestore.py (load_results) : on classe ce que l'import lit.
IGNORES = ("echantillon_", "controle_", "validation_", "comparaison_")
DANS_LE_CHAMP = ("sante", "medico-social")
TOKENS_PAR_CARACTERE, TOKENS_CONSIGNE, TOKENS_SORTIE = 1.3 / 4, 400, 150
SECONDES_PAR_FICHE_LOCALE = 20


# ---------------------------------------------------------------- fonctions pures (testées)

def fichiers_de_l_import(dossier: Path | None = None) -> list[Path]:
    """Les fichiers de résultats que lit l'import global."""
    dossier = dossier or echantillon.RESULTS
    return [p for p in sorted(dossier.glob("*.json"))
            if not p.name.endswith(".errors.json") and not p.stem.startswith(IGNORES) and not p.stem.endswith("_non_aap")]


def texte_pour_classement(fiche: dict, racine: Path | None = None) -> tuple[str, str]:
    """(texte, origine) : le texte collecté de la page s'il existe encore, sinon les champs de la fiche."""
    rel = (fiche.get("scrape_metadata") or {}).get("fichier")
    if rel:
        chemin = (racine or ICI) / rel.replace("\\", "/")
        if chemin.exists():
            texte = echantillon.lire_fiche(chemin)[1]
            return (texte.split("\n", 1)[1] if "\n" in texte else texte).strip(), "page"  # saute le texte du lien
    parties = [f"Titre : {fiche.get('titre') or ''}", f"Financeur : {fiche.get('financeur') or ''}",
               f"Description : {fiche.get('description') or ''}",
               "Éligibilité : " + " ; ".join(fiche.get("eligibilite") or []),
               "Établissements : " + " ; ".join(fiche.get("categories_etablissement") or [])]
    return "\n".join(parties), "fiche"


def estimation_euros(caracteres: int, modele: str) -> float:
    """Coût d'une question par le moteur api, au tarif du modèle (tarif inconnu : exception, jamais d'appel à l'aveugle)."""
    import extractor
    return extractor.cout_usd(modele, int(caracteres * TOKENS_PAR_CARACTERE) + TOKENS_CONSIGNE, TOKENS_SORTIE) * extractor.EURO_PAR_DOLLAR


def a_classer(fiches: list[dict]) -> list[dict]:
    return [f for f in fiches if not (f.get("scrape_metadata") or {}).get("champ")]


def evaluer_pur(fiches: list[dict], verdicts: dict) -> dict:
    """Accord entre le champ du modèle et le verdict de Monsieur DUCOUT (adresse -> champ), fonction pure.

    Deux comptes : accord exact (même valeur) et accord dans / hors champ (ce qui décide de la publication)."""
    attendu = {u: (v.get("champ") if isinstance(v, dict) else v) for u, v in verdicts.items()}
    comparables = [f for f in fiches if f.get("url_source") in attendu and (f.get("scrape_metadata") or {}).get("champ")]
    exacts = sum(1 for f in comparables if f["scrape_metadata"]["champ"] == attendu[f["url_source"]])
    desaccords = []
    for f in comparables:
        modele, humain = f["scrape_metadata"]["champ"], attendu[f["url_source"]]
        if (modele in DANS_LE_CHAMP) != (humain in DANS_LE_CHAMP):
            desaccords.append({"url": f["url_source"], "modele": modele, "verdict": humain,
                               "raison": f["scrape_metadata"].get("champ_raison", "")})
    return {"comparables": len(comparables), "accords_exacts": exacts,
            "accords_dans_hors": len(comparables) - len(desaccords), "desaccords": desaccords}


def rapport_markdown(fiches: list[dict], registre: dict[str, dict], aujourdhui: str, seuil: float = 0.2,
                     minimum: int = 5) -> str:
    """CHAMP.md : définition, répartition des réponses, part dans le champ par source, sources à revoir."""
    repartition = Counter((f.get("scrape_metadata") or {}).get("champ") or "non classe" for f in fiches)
    par_source: dict[str, Counter] = {}
    for f in fiches:
        meta = f.get("scrape_metadata") or {}
        c = par_source.setdefault(meta.get("source") or "?", Counter())
        c["fiches"] += 1
        if meta.get("champ") in DANS_LE_CHAMP:
            c["dans"] += 1
        if meta.get("champ"):
            c["classees"] += 1
    lignes = [f"# Champ santé et médico-social des fiches", "",
              f"Changement OpenSpec `filtre-champ-sante`. Rapport du {aujourdhui}. Définition décidée par Monsieur DUCOUT le "
              "2026-10-14 (consigne posée aux modèles, version 4) :", "", f"> {CONSIGNE_CHAMP}", "",
              f"Fiches lues dans les fichiers de l'import : {len(fiches)}. Répartition : "
              + ", ".join(f"{k} {n}" for k, n in sorted(repartition.items(), key=lambda kv: (-kv[1], kv[0]))) + ".", "",
              "## Part dans le champ par source", "", "| Source | Famille | Fiches | Classées | Dans le champ | Part |",
              "|---|---|---|---|---|---|"]
    a_revoir = []
    for source, c in sorted(par_source.items(), key=lambda kv: (-kv[1]["fiches"], kv[0])):
        s = registre.get(source, {})
        part = c["dans"] / c["classees"] if c["classees"] else None
        lignes.append(f"| {source} | {s.get('categorie', '')} | {c['fiches']} | {c['classees']} | {c['dans']} | "
                      f"{'' if part is None else f'{100 * part:.0f} %'} |")
        if c["classees"] >= minimum and part is not None and part < seuil:
            a_revoir.append((source, s, c, part))
    lignes += ["", f"## Sources à revoir (au moins {minimum} fiches classées, moins de {100 * seuil:.0f} % dans le champ)", "",
               "Décision humaine, source par source, avec l'outil de relecture ; le registre n'est pas modifié par cet outil.", ""]
    if not a_revoir:
        lignes.append("Aucune.")
    for source, s, c, part in a_revoir:
        lignes.append(f"- `{source}` ({s.get('categorie', '')}, périmètre `{s.get('perimetre', '')}`) : {c['dans']} fiches dans le "
                      f"champ sur {c['classees']} classées ({100 * part:.0f} %). Notes du registre : {s.get('notes') or 'aucune'}.")
    return "\n".join(lignes) + "\n"


# ---------------------------------------------------------------- étapes

def poser_la_question(moteur: str, modele: str, texte: str, url: str, source: str) -> dict:
    if moteur == "api":
        import extractor
        return extractor.champ_aap(texte, url, CONSIGNE_CHAMP, source=source, model=modele)
    page = f"URL source : {url}\n\nTexte de la page :\n{texte}"
    return echantillon.appeler_ollama(modele, [{"role": "system", "content": CONSIGNE_CHAMP},
                                               {"role": "user", "content": page}], SCHEMA_CHAMP)


def classer(fichiers: list[Path], moteur: str, modele: str, limite: int | None, plafond: float, dry_run: bool) -> int:
    if moteur == "api":
        echantillon.charger_env()
        import extractor
        extractor.cout_usd(modele, 0, 0)  # tarif connu, sinon exception avant tout appel
    total, total_est = 0, 0.0
    for chemin in fichiers:
        fiches = echantillon._charger_liste(chemin)
        restantes = a_classer(fiches)
        est = sum(estimation_euros(len(texte_pour_classement(f)[0]), modele) for f in restantes) if moteur == "api" else 0.0
        detail = f", {est:.3f} euros estimés" if moteur == "api" else f", environ {len(restantes) * SECONDES_PAR_FICHE_LOCALE // 60} min en local"
        print(f"{chemin.name} : {len(fiches)} fiches, {len(restantes)} à classer{detail}")
        total += len(restantes)
        total_est += est
    if dry_run:
        print(f"Essai à blanc : {total} fiches à classer" + (f", {total_est:.3f} euros estimés" if moteur == "api" else "")
              + " ; rien n'a été écrit.")
        return 0
    faites, dossier = 0, SAUVEGARDES / f"champ_{datetime.now().strftime('%Y-%m-%d_%H%M')}"
    for chemin in fichiers:
        fiches = echantillon._charger_liste(chemin)
        if not a_classer(fiches):
            continue
        dossier.mkdir(parents=True, exist_ok=True)
        shutil.copy2(chemin, dossier / chemin.name)  # sauvegarde avant la première écriture
        for f in a_classer(fiches):
            if limite is not None and faites >= limite:
                break
            if moteur == "api" and echantillon.cout_cumule(modele) >= plafond:
                print(f"Plafond {plafond:.2f} euros atteint pour {modele} : arrêt, fiches déjà classées conservées.")
                return 1
            texte, origine = texte_pour_classement(f)
            url, source = f.get("url_source", ""), (f.get("scrape_metadata") or {}).get("source", "")
            t0 = time.time()
            try:
                champ, raison = normaliser_champ(poser_la_question(moteur, modele, texte, url, source))
            except Exception as err:
                print(f"  échec {url[:70]} {type(err).__name__}: {str(err).splitlines()[0][:80]}")
                continue
            f.setdefault("scrape_metadata", {}).update({"champ": champ, "champ_raison": raison, "champ_modele": modele,
                                                        "champ_le": time.strftime("%Y-%m-%dT%H:%M:%S"), "champ_source": origine})
            faites += 1
            echantillon._ecrire_json(chemin, fiches)  # à chaque fiche : un arrêt ne perd rien, la relance reprend
            print(f"  [{faites}] {champ:13} {time.time() - t0:5.1f}s  {(f.get('titre') or '')[:60]}")
        if limite is not None and faites >= limite:
            break
    print(f"{faites} fiches classées" + (f" ; coût cumulé de {modele} : {echantillon.cout_cumule(modele):.3f} euros" if moteur == "api" else "")
          + (f" ; sauvegardes dans {dossier}" if faites else ""))
    return 0


def evaluer(fichiers: list[Path]) -> int:
    if not VERDICTS_CHAMP.exists():
        print(f"Aucun verdict : {VERDICTS_CHAMP} absent (adresse -> sante, medico-social ou hors-champ).")
        return 1
    verdicts = json.loads(VERDICTS_CHAMP.read_text(encoding="utf-8"))
    fiches = [f for chemin in fichiers for f in echantillon._charger_liste(chemin)]
    par_modele: dict[str, list[dict]] = {}
    for f in fiches:
        meta = f.get("scrape_metadata") or {}
        if meta.get("champ"):
            par_modele.setdefault(meta.get("champ_modele", "?"), []).append(f)
    for modele, lot in sorted(par_modele.items()):
        r = evaluer_pur(lot, verdicts)
        print(f"{modele} : {r['comparables']} fiches comparées, {r['accords_exacts']} accords exacts, "
              f"{r['accords_dans_hors']} accords dans / hors champ")
        for d in r["desaccords"]:
            print(f"  modèle {d['modele']:13} verdict {d['verdict']:13} {d['url'][:60]} | {d['raison'][:80]}")
    return 0


def rapport() -> None:
    registre = {s["id"]: s for s in json.loads(REGISTRE.read_text(encoding="utf-8"))}
    fiches = [f for chemin in fichiers_de_l_import() for f in echantillon._charger_liste(chemin)]
    RAPPORT.write_text(rapport_markdown(fiches, registre, datetime.now().strftime("%Y-%m-%d")), encoding="utf-8")
    print(f"Rapport écrit : {RAPPORT.name} ({len(fiches)} fiches)")


# ---------------------------------------------------------------- entrée

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--classer", action="store_true")
    parser.add_argument("--evaluer", action="store_true")
    parser.add_argument("--rapport", action="store_true")
    parser.add_argument("--fichier", nargs="*", help="fichiers de résultats (défaut : ceux que lit l'import)")
    parser.add_argument("--moteur", default="ollama", choices=["ollama", "api"])
    parser.add_argument("--modele", help=f"défaut : {MODELE_LOCAL_DEFAUT} en local, {MODELE_API_DEFAUT} pour api")
    parser.add_argument("--limite", type=int, help="nombre de fiches à classer au plus (essai)")
    parser.add_argument("--plafond", type=float, default=echantillon.PLAFOND_EUROS)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    fichiers = [Path(f) for f in args.fichier] if args.fichier else fichiers_de_l_import()
    modele = args.modele or (MODELE_API_DEFAUT if args.moteur == "api" else MODELE_LOCAL_DEFAUT)
    if args.classer:
        return classer(fichiers, args.moteur, modele, args.limite, args.plafond, args.dry_run)
    if args.evaluer:
        return evaluer(fichiers)
    if args.rapport:
        rapport()
        return 0
    parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
