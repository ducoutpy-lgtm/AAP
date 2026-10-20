"""Qualification des fiches par le modèle (jour 2 du plan MVP, changement OpenSpec qualification-appels, 2026-10-20).

Pourquoi : un candidat doit savoir d'un coup d'œil à qui s'adresse un appel (établissement public, privé non
lucratif, privé lucratif...), de quel type d'appel il s'agit, quel objet de projet il finance, quand il ouvre et quelles
pièces il attend. Le texte de la page le dit presque toujours ; l'extraction ne posait pas ces questions. Le modèle
relit chaque fiche publiable à côté du texte de sa page et répond par un outil à choix fermés ; il redit aussi le champ
(santé, médico-social, hors champ) pour rattraper les appels hors santé validés à tort.

Usage (depuis scraping/, environnement ../.venv) :
  python qualifier_fiches.py --qualifier --dry-run            # fiches à qualifier, coût estimé, rien d'écrit ni d'appelé
  python qualifier_fiches.py --qualifier [--modele claude-haiku-5-5] [--limite N] [--plafond 5]

Règles : modèle, prix et coût estimé écrits avant tout appel ; plafond cumulé (5 euros) ; écriture après chaque fiche
dans scrape_metadata.qualification ; sauvegarde des fichiers avant la première écriture.
"""
from __future__ import annotations

import argparse
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import echantillon  # noqa: E402
from champ import fichiers_de_l_import, texte_pour_classement  # noqa: E402
from verification import CHAMPS_INCLUS, MOTIF_DATE, TOKENS_CONSIGNE, TOKENS_PAR_CARACTERE  # noqa: E402

ICI = Path(__file__).resolve().parent
SAUVEGARDES = ICI.parent / "scripts" / "sauvegardes"
MODELE_DEFAUT = "claude-haiku-5-5"
VERSION_CONSIGNE = 1
TOKENS_SORTIE = 300

# Valeurs fermées, partagées avec l'application (app/src/utils/qualification.ts porte les mêmes identifiants)
DESTINATAIRES = ("public", "prive-non-lucratif", "prive-lucratif", "collectivites", "recherche", "tous")
TYPES_APPEL = ("appel-a-projets", "appel-a-candidatures", "ami", "subvention", "prix", "mecenat", "autre")
OBJETS = ("creation-places", "immobilier", "equipement", "numerique", "prevention", "formation-attractivite",
          "recherche-innovation", "coordination-parcours", "qvt", "autre")
CHAMPS_SANTE = ("sante", "medico-social", "hors-champ", "incertain")

CONSIGNE_QUALIFICATION = (
    "Tu qualifies un appel à projets du secteur de la santé et du médico-social français à partir du texte de sa page. "
    "Réponds par l'outil qualification, avec des valeurs fermées. destinataires : les familles de structures qui PEUVENT "
    "candidater d'après la page : public (établissements publics de santé ou médico-sociaux, hôpitaux publics, GCS "
    "publics), prive-non-lucratif (associations, fondations, ESPIC, mutuelles), prive-lucratif (entreprises, cliniques "
    "et EHPAD commerciaux, sociétés), collectivites (communes, départements, régions, CCAS), recherche (laboratoires, "
    "universités, chercheurs), tous si la page n'exclut personne ou dit « toute structure ». type_appel : "
    "appel-a-projets, appel-a-candidatures, ami (appel à manifestation d'intérêt), subvention (aide permanente sans "
    "campagne), prix (prix, concours, trophée, bourse), mecenat (mécénat, dons, fondation d'entreprise), autre. objets : "
    "ce que l'appel finance (plusieurs possibles) parmi creation-places, immobilier, equipement, numerique, prevention, "
    "formation-attractivite, recherche-innovation, coordination-parcours, qvt (qualité de vie au travail), autre. "
    "date_ouverture : date d'ouverture des candidatures au format AAAA-MM-JJ si la page la donne, sinon null. "
    "pieces_attendues : les documents demandés au dossier, tels que la page les nomme (liste vide si rien). champ : "
    "sante si l'appel concerne les soins, la prévention ou la recherche en santé ; medico-social s'il concerne les "
    "personnes âgées, le handicap, la protection de l'enfance, la précarité ou l'autonomie ; hors-champ s'il ne concerne "
    "ni l'un ni l'autre (mécénat de compétences général, environnement, culture, sport, eau, agriculture...) ; incertain "
    "sinon. Une raison courte en français. Tu n'inventes rien : en cas de doute, choisis tous ou incertain."
)

QUALIFICATION_TOOL = {
    "name": "qualification",
    "description": "Qualifie un appel à projets : destinataires, type, objets, date d'ouverture, pièces, champ.",
    "input_schema": {
        "type": "object",
        "properties": {
            "destinataires": {"type": "array", "items": {"type": "string", "enum": list(DESTINATAIRES)}},
            "type_appel": {"type": "string", "enum": list(TYPES_APPEL)},
            "objets": {"type": "array", "items": {"type": "string", "enum": list(OBJETS)}},
            "date_ouverture": {"type": ["string", "null"], "description": "AAAA-MM-JJ ou null"},
            "pieces_attendues": {"type": "array", "items": {"type": "string"}},
            "champ": {"type": "string", "enum": list(CHAMPS_SANTE)},
            "raison": {"type": "string", "description": "Une phrase courte en français"},
        },
        "required": ["destinataires", "type_appel", "objets", "champ", "raison"],
    },
}


# ---------------------------------------------------------------- fonctions pures (testées)

def normaliser_qualification(reponse: dict | None, modele: str, maintenant: str, origine: str) -> dict:
    """Réponse du modèle ramenée à une forme sûre : valeurs hors liste écartées, date invalide mise à null."""
    r = reponse or {}
    destinataires = [d for d in (r.get("destinataires") or []) if d in DESTINATAIRES]
    if "tous" in destinataires:
        destinataires = ["tous"]
    type_appel = r.get("type_appel") if r.get("type_appel") in TYPES_APPEL else "autre"
    objets = [o for o in (r.get("objets") or []) if o in OBJETS]
    date = r.get("date_ouverture")
    date = date.strip() if isinstance(date, str) and MOTIF_DATE.match(date.strip()) else None
    pieces = [str(p).strip() for p in (r.get("pieces_attendues") or []) if str(p).strip()][:12]
    champ = r.get("champ") if r.get("champ") in CHAMPS_SANTE else "incertain"
    return {"modele": modele, "le": maintenant, "version_consigne": VERSION_CONSIGNE, "source_texte": origine,
            "destinataires": destinataires, "type_appel": type_appel, "objets": objets, "date_ouverture": date,
            "pieces_attendues": pieces, "champ": champ, "raison": str(r.get("raison") or "").strip()}


def a_qualifier(fiches: list[dict], aujourdhui: str, deja_couvertes: set[str] | None = None) -> list[dict]:
    """Fiches à qualifier : dans le champ ou incertaines, encore ouvertes ou sans date, pas encore qualifiées avec
    cette consigne. Même périmètre que le contrôle (ce que l'application peut publier). deja_couvertes : adresses
    déjà portées par un fichier prioritaire (l'import garde la version API ou connecteur plutôt que la locale), pour ne
    pas payer deux fois le même appel."""
    retenues = []
    for f in fiches:
        meta = f.get("scrape_metadata") or {}
        if meta.get("champ") not in CHAMPS_INCLUS:
            continue
        if deja_couvertes and f.get("url_source") in deja_couvertes:
            continue
        if f.get("date_cloture") and f["date_cloture"] < aujourdhui:
            continue
        if (meta.get("qualification") or {}).get("version_consigne") == VERSION_CONSIGNE:
            continue
        retenues.append(f)
    return retenues


def estimation_euros(caracteres: int, modele: str) -> float:
    import extractor
    return extractor.cout_usd(modele, int(caracteres * TOKENS_PAR_CARACTERE) + TOKENS_CONSIGNE, TOKENS_SORTIE) * extractor.EURO_PAR_DOLLAR


def bilan(fiches: list[dict]) -> dict:
    """Comptes : qualifiées, par destinataire, par type, hors champ relevés."""
    q = [f["scrape_metadata"]["qualification"] for f in fiches if (f.get("scrape_metadata") or {}).get("qualification")]
    par_dest: dict[str, int] = {}
    par_type: dict[str, int] = {}
    for x in q:
        for d in x["destinataires"] or ["(vide)"]:
            par_dest[d] = par_dest.get(d, 0) + 1
        par_type[x["type_appel"]] = par_type.get(x["type_appel"], 0) + 1
    return {"qualifiees": len(q), "par_destinataire": par_dest, "par_type": par_type,
            "hors_champ": sum(1 for x in q if x["champ"] == "hors-champ"),
            "avec_date_ouverture": sum(1 for x in q if x["date_ouverture"]),
            "avec_pieces": sum(1 for x in q if x["pieces_attendues"])}


# ---------------------------------------------------------------- appels au modèle

def adresses_prioritaires(fichiers: list[Path]) -> set[str]:
    """Adresses des fiches des fichiers autres que le passage local : la version locale d'un même appel est écartée
    par l'import, donc inutile à qualifier."""
    adresses: set[str] = set()
    for chemin in fichiers:
        if chemin.stem == "extraction_locale":
            continue
        adresses |= {f.get("url_source") for f in echantillon._charger_liste(chemin) if f.get("url_source")}
    return adresses


def couvertes_pour(chemin: Path, prioritaires: set[str]) -> set[str] | None:
    return prioritaires if chemin.stem == "extraction_locale" else None


def qualifier(fichiers: list[Path], modele: str, limite: int | None, plafond: float, dry_run: bool) -> int:
    echantillon.charger_env()
    import extractor
    extractor.cout_usd(modele, 0, 0)  # tarif connu, sinon exception avant tout appel
    aujourdhui = datetime.now().strftime("%Y-%m-%d")
    prioritaires = adresses_prioritaires(fichiers)
    total, total_est = 0, 0.0
    for chemin in fichiers:
        fiches = echantillon._charger_liste(chemin)
        restantes = a_qualifier(fiches, aujourdhui, couvertes_pour(chemin, prioritaires))
        est = sum(estimation_euros(len(texte_pour_classement(f)[0]), modele) for f in restantes)
        if restantes:
            print(f"{chemin.name} : {len(fiches)} fiches, {len(restantes)} à qualifier, {est:.3f} euros estimés")
        total += len(restantes)
        total_est += est
    print(f"Modèle {modele}, tarif {extractor.TARIFS_USD_PAR_MTOK[modele]} USD par million de tokens, "
          f"cumul déjà dépensé {echantillon.cout_cumule(modele):.3f} euros, plafond {plafond:.2f} euros.")
    if dry_run:
        print(f"Essai à blanc : {total} fiches à qualifier, {total_est:.3f} euros estimés ; rien n'a été écrit ni appelé.")
        return 0
    faites, dossier = 0, SAUVEGARDES / f"qualification_{datetime.now().strftime('%Y-%m-%d_%H%M')}"
    for chemin in fichiers:
        fiches = echantillon._charger_liste(chemin)
        couvertes = couvertes_pour(chemin, prioritaires)
        if not a_qualifier(fiches, aujourdhui, couvertes):
            continue
        dossier.mkdir(parents=True, exist_ok=True)
        shutil.copy2(chemin, dossier / chemin.name)
        for f in a_qualifier(fiches, aujourdhui, couvertes):
            if limite is not None and faites >= limite:
                break
            if echantillon.cout_cumule(modele) >= plafond:
                print(f"Plafond {plafond:.2f} euros atteint pour {modele} : arrêt, fiches déjà qualifiées conservées.")
                return 1
            texte, origine = texte_pour_classement(f)
            url, source = f.get("url_source", ""), (f.get("scrape_metadata") or {}).get("source", "")
            t0 = time.time()
            try:
                reponse = extractor.qualifier_fiche(texte, url, CONSIGNE_QUALIFICATION, QUALIFICATION_TOOL, source, modele)
                q = normaliser_qualification(reponse, modele, time.strftime("%Y-%m-%dT%H:%M:%S"), origine)
            except Exception as err:
                print(f"  échec {url[:70]} {type(err).__name__}: {str(err).splitlines()[0][:80]}")
                continue
            f.setdefault("scrape_metadata", {})["qualification"] = q
            faites += 1
            echantillon._ecrire_json(chemin, fiches)
            print(f"  [{faites}] {','.join(q['destinataires']) or '-':28s} {q['type_appel']:20s} {q['champ']:13s} {time.time() - t0:4.1f}s  {(f.get('titre') or '')[:40]}")
        if limite is not None and faites >= limite:
            break
    print(f"{faites} fiches qualifiées ; coût cumulé de {modele} : {echantillon.cout_cumule(modele):.3f} euros"
          + (f" ; sauvegardes dans {dossier}" if faites else ""))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--qualifier", action="store_true")
    parser.add_argument("--bilan", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--modele", default=MODELE_DEFAUT)
    parser.add_argument("--limite", type=int)
    parser.add_argument("--plafond", type=float, default=5.0)
    parser.add_argument("--fichier", action="append", help="fichier de résultats (défaut : ceux de l'import)")
    args = parser.parse_args()
    fichiers = [Path(f) for f in args.fichier] if args.fichier else fichiers_de_l_import()
    if args.bilan:
        fiches = [f for chemin in fichiers for f in echantillon._charger_liste(chemin)]
        print(bilan(fiches))
        return 0
    if args.qualifier:
        return qualifier(fichiers, args.modele, args.limite, args.plafond, args.dry_run)
    parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
