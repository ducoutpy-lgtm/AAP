"""Vérification des fiches assistée par le modèle (changement OpenSpec verification-assistee-haiku, 2026-10-15).

Pourquoi : 307 des 308 fiches publiées le 2026-10-15 n'ont été relues par personne ; relire 308 fiches à la main
demande des jours. Le modèle relit chaque fiche à côté du texte de sa page et dit, champ par champ, si la valeur est
juste, fausse, fabriquée (absente de la page) ou manquante, avec la valeur lue sur la page quand elle existe. Monsieur
DUCOUT relit d'abord les fiches douteuses, puis un échantillon des autres ; la mention « relue » reste réservée à son
verdict (décision du 2026-10-15 : « 1 ok », devis 0,10 euro pour les 308 fiches publiées).

Usage (depuis scraping/, environnement ../.venv) :
  python verification.py --verifier --dry-run                 # fiches à vérifier, coût estimé, rien d'écrit ni d'appelé
  python verification.py --verifier [--modele claude-haiku-5-5] [--limite N] [--plafond 5] [--fichier ...]
  python verification.py --rapport                            # VERIFICATION.md : doutes par champ, par source, liste

Règles : modèle, prix et coût estimé écrits avant tout appel ; plafond cumulé (5 euros) ; écriture après chaque fiche
dans scrape_metadata.verification ; sauvegarde des fichiers avant la première écriture.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import time
from collections import Counter
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import echantillon  # noqa: E402
from champ import DANS_LE_CHAMP, fichiers_de_l_import, texte_pour_classement  # noqa: E402
from extractor import CHAMPS_VERIFIES, VERDICTS_VERIFICATION  # noqa: E402

ICI = Path(__file__).resolve().parent
RAPPORT = ICI / "VERIFICATION.md"
SAUVEGARDES = ICI.parent / "scripts" / "sauvegardes"
MODELE_DEFAUT = "claude-haiku-5-5"
VERSION_CONSIGNE = 1
# Un champ est douteux quand la fiche contredit la page, invente une valeur ou en oublie une.
DOUTEUX = ("faux", "fabrique", "manquant")
CHAMPS_INCLUS = DANS_LE_CHAMP + ("incertain",)  # fiches vérifiées : celles que l'application publie
# Estimation : 1 token pour 3,5 caractères de texte, 900 tokens de consigne et de fiche, 400 tokens de réponse.
TOKENS_PAR_CARACTERE, TOKENS_CONSIGNE, TOKENS_SORTIE = 1 / 3.5, 900, 400

CONSIGNE_VERIFICATION = (
    "Tu relis la fiche d'un appel à projets produite par un extracteur automatique, à côté du texte de la page web "
    "d'origine. Pour chaque champ de la fiche, compare avec la page et réponds par l'outil verification : "
    "« juste » si la valeur de la fiche correspond à la page (formulation différente acceptée, dates équivalentes, "
    "montant identique) ; « faux » si la page donne une autre valeur, que tu indiques dans correction ; « fabrique » si "
    "la fiche donne une valeur que la page ne contient pas, correction vide ; « manquant » si la fiche est vide alors que "
    "la page donne la valeur, que tu indiques dans correction ; « vide » si la fiche est vide et que la page ne dit rien ; "
    "« incertain » si le texte ne permet pas de trancher. Dates au format AAAA-MM-JJ dans correction, montants en euros "
    "sans espace ni symbole. Pour description : « juste » si elle résume fidèlement la page sans rien ajouter, « faux » si "
    "elle contient une affirmation absente de la page ou contraire à la page. Dis aussi si la page décrit bien UN appel "
    "précis auquel on peut candidater (est_un_appel). Une raison courte en français par champ. Tu n'inventes rien : en cas "
    "de doute, réponds « incertain »."
)


# ---------------------------------------------------------------- fonctions pures (testées)

def fiche_resumee(fiche: dict) -> dict:
    """Les seuls champs vérifiés, tels que la fiche les porte (envoyés au modèle et comparés à la page)."""
    return {nom: fiche.get(nom) for nom in CHAMPS_VERIFIES}


def normaliser_verification(reponse: dict | None, modele: str, origine: str, maintenant: str) -> dict:
    """Réponse du modèle ramenée à une forme sûre : un verdict connu par champ (inconnu ou absent -> incertain)."""
    champs_recus = (reponse or {}).get("champs") or {}
    champs: dict[str, dict] = {}
    if not isinstance(champs_recus, dict):
        champs_recus = {}
    for nom in CHAMPS_VERIFIES:
        c = champs_recus.get(nom)
        if not isinstance(c, dict):  # le modele a parfois repondu la seule valeur du verdict (« juste ») au lieu de l objet
            c = {"verdict": c} if isinstance(c, str) else {}
        verdict = c.get("verdict") if c.get("verdict") in VERDICTS_VERIFICATION else "incertain"
        correction = c.get("correction")
        champs[nom] = {"verdict": verdict, "correction": str(correction).strip() if correction not in (None, "") else None,
                       "raison": str(c.get("raison") or "").strip()}
    est = (reponse or {}).get("est_un_appel")
    return {"modele": modele, "le": maintenant, "version_consigne": VERSION_CONSIGNE, "source_texte": origine,
            "est_un_appel": est if isinstance(est, bool) else None,
            "remarque": str((reponse or {}).get("remarque") or "").strip(), "champs": champs,
            "douteux": [nom for nom in CHAMPS_VERIFIES if champs[nom]["verdict"] in DOUTEUX]}


def douteux(fiche: dict) -> list[str]:
    """Champs douteux d'une fiche vérifiée (liste vide si non vérifiée ou sans doute)."""
    return list(((fiche.get("scrape_metadata") or {}).get("verification") or {}).get("douteux") or [])


# Décision du modèle (demande de Monsieur DUCOUT du 2026-10-15, midi : « je pense que je t'avais demandé d'utiliser
# Haiku pour contrôler et valider toutes ces fiches ») : le contrôle vaut relecture. Une fiche sans doute, ou dont les
# doutes portent sur des champs que la page permet de corriger (dates, montants), est validée au nom du modèle avec
# ses corrections ; une page qui ne décrit pas un appel est rejetée ; un doute sur le titre, le financeur ou le
# territoire reste à relire par Monsieur DUCOUT. La description n'est pas bloquante (nuances de formulation).
CHAMPS_DATES = ("date_ouverture", "date_cloture")
CHAMPS_MONTANTS = ("montant_min", "montant_max", "enveloppe_globale")
CHAMPS_NON_BLOQUANTS = ("description",)
MOTIF_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
MOTIF_MONTANT = re.compile(r"^\d[\d\s]*$")


def decision_du_modele(fiche: dict) -> dict | None:
    """Ce que le contrôle du modèle décide pour une fiche : None si non contrôlée, sinon
    {statut: validee | rejetee | a_corriger, corrections: {champ: valeur ou None}, a_relire: [champs], commentaire}."""
    ver = (fiche.get("scrape_metadata") or {}).get("verification")
    if not ver:
        return None
    if ver.get("est_un_appel") is False:
        return {"statut": "rejetee", "corrections": {}, "a_relire": [],
                "commentaire": "la page ne décrit pas un appel précis (contrôle du modèle)"}
    corrections, a_relire = {}, []
    for nom in ver.get("douteux") or []:
        if nom in CHAMPS_NON_BLOQUANTS:
            continue
        champ = (ver.get("champs") or {}).get(nom) or {}
        verdict, correction = champ.get("verdict"), (champ.get("correction") or "").strip()
        if nom in CHAMPS_DATES:
            if MOTIF_DATE.match(correction):
                corrections[nom] = correction
            elif verdict in ("faux", "fabrique"):
                corrections[nom] = None  # valeur contredite ou inventée, sans valeur lisible : retirée
            elif verdict == "manquant":
                a_relire.append(nom)
        elif nom in CHAMPS_MONTANTS:
            if MOTIF_MONTANT.match(correction):
                nombre = int(re.sub(r"\s", "", correction))
                corrections[nom] = str(nombre) if nom == "enveloppe_globale" else nombre
            elif verdict in ("faux", "fabrique"):
                corrections[nom] = None
            elif verdict == "manquant":
                a_relire.append(nom)
        else:
            a_relire.append(nom)
    if a_relire:
        statut, texte = "a_corriger", "à relire : " + ", ".join(a_relire)
    else:
        statut, texte = "validee", "aucun doute" if not corrections else ""
    if corrections:
        detail = ", ".join(f"{k} -> {v if v is not None else 'retiré'}" for k, v in corrections.items())
        texte = (texte + " ; " if texte else "") + "corrigé d'après la page : " + detail
    return {"statut": statut, "corrections": corrections, "a_relire": a_relire,
            "commentaire": texte + " (contrôle du modèle)"}


def appliquer_corrections(fiche: dict, decision: dict | None) -> dict:
    """Copie de la fiche avec les corrections décidées (valeurs lues sur la page par le modèle)."""
    if not decision or not decision["corrections"]:
        return fiche
    corrigee = dict(fiche)
    corrigee.update(decision["corrections"])
    return corrigee


def restantes_a_relire(fiches: list[dict]) -> list[dict]:
    """Fiches que Monsieur DUCOUT doit encore relire : dans le champ (les hors champ sont déjà écartées) et dont le
    contrôle du modèle n'a pas tranché (non contrôlée, ou à corriger)."""
    retenues = []
    for f in fiches:
        if (f.get("scrape_metadata") or {}).get("champ") == "hors-champ":
            continue
        d = decision_du_modele(f)
        if d and d["statut"] in ("validee", "rejetee"):
            continue
        retenues.append(f)
    return retenues


def a_verifier(fiches: list[dict], aujourdhui: str) -> list[dict]:
    """Fiches à vérifier : dans le champ ou incertaines, encore ouvertes, pas encore vérifiées avec cette consigne."""
    retenues = []
    for f in fiches:
        meta = f.get("scrape_metadata") or {}
        if meta.get("champ") not in CHAMPS_INCLUS:
            continue
        if f.get("date_cloture") and f["date_cloture"] < aujourdhui:
            continue
        if (meta.get("verification") or {}).get("version_consigne") == VERSION_CONSIGNE:
            continue
        retenues.append(f)
    return retenues


def estimation_euros(caracteres: int, modele: str) -> float:
    """Coût d'une vérification au tarif du modèle (tarif inconnu : exception, jamais d'appel à l'aveugle)."""
    import extractor
    return extractor.cout_usd(modele, int(caracteres * TOKENS_PAR_CARACTERE) + TOKENS_CONSIGNE, TOKENS_SORTIE) * extractor.EURO_PAR_DOLLAR


def bilan(fiches: list[dict]) -> dict:
    """Comptes d'un lot de fiches : vérifiées, sans doute, douteuses, verdicts par champ, part douteuse par source."""
    verifiees = [f for f in fiches if (f.get("scrape_metadata") or {}).get("verification")]
    par_champ = {nom: Counter() for nom in CHAMPS_VERIFIES}
    par_source: dict[str, Counter] = {}
    for f in verifiees:
        v = f["scrape_metadata"]["verification"]
        for nom in CHAMPS_VERIFIES:
            par_champ[nom][v["champs"].get(nom, {}).get("verdict", "incertain")] += 1
        c = par_source.setdefault(f["scrape_metadata"].get("source") or "?", Counter())
        c["verifiees"] += 1
        c["douteuses"] += bool(v.get("douteux"))
    douteuses = [f for f in verifiees if douteux(f)]
    return {"verifiees": len(verifiees), "douteuses": len(douteuses), "sans_doute": len(verifiees) - len(douteuses),
            "pas_un_appel": sum(1 for f in verifiees if f["scrape_metadata"]["verification"].get("est_un_appel") is False),
            "par_champ": par_champ, "par_source": par_source, "liste_douteuses": douteuses}


def rapport_markdown(fiches: list[dict], aujourdhui: str) -> str:
    b = bilan(fiches)
    lignes = ["# Vérification des fiches assistée par le modèle", "",
              f"Changement OpenSpec `verification-assistee-haiku`. Rapport du {aujourdhui}. Consigne version {VERSION_CONSIGNE}.",
              "Un champ est douteux quand la fiche contredit la page (faux), invente une valeur (fabriqué) ou en oublie une",
              "(manquant). Ce rapport ne vaut pas relecture humaine : la mention « relue » est réservée aux verdicts de",
              "Monsieur DUCOUT, qui relit d'abord les fiches douteuses.", "",
              f"Fiches vérifiées : {b['verifiees']} ; sans doute : {b['sans_doute']} ; douteuses : {b['douteuses']} ; "
              f"pages qui ne décrivent pas un appel précis selon le modèle : {b['pas_un_appel']}.", "",
              "## Verdicts par champ", "", "| Champ | Juste | Faux | Fabriqué | Manquant | Vide | Incertain |", "|---|---|---|---|---|---|---|"]
    for nom in CHAMPS_VERIFIES:
        c = b["par_champ"][nom]
        lignes.append(f"| {nom} | {c['juste']} | {c['faux']} | {c['fabrique']} | {c['manquant']} | {c['vide']} | {c['incertain']} |")
    lignes += ["", "## Part de fiches douteuses par source", "", "| Source | Vérifiées | Douteuses | Part |", "|---|---|---|---|"]
    for source, c in sorted(b["par_source"].items(), key=lambda x: (-x[1]["douteuses"], -x[1]["verifiees"])):
        lignes.append(f"| {source} | {c['verifiees']} | {c['douteuses']} | {100 * c['douteuses'] // max(c['verifiees'], 1)} % |")
    lignes += ["", "## Fiches douteuses, à relire en premier", "",
               "| Source | Titre | Champs douteux (verdict, valeur lue sur la page) | Adresse |", "|---|---|---|---|"]
    for f in sorted(b["liste_douteuses"], key=lambda f: -len(douteux(f))):
        v = f["scrape_metadata"]["verification"]
        detail = " ; ".join(f"{nom} ({v['champs'][nom]['verdict']}" + (f", page : {v['champs'][nom]['correction']}" if v["champs"][nom].get("correction") else "") + ")"
                            for nom in douteux(f))
        lignes.append(f"| {f['scrape_metadata'].get('source', '')} | {(f.get('titre') or '')[:70].replace('|', '/')} | {detail.replace('|', '/')} | {f.get('url_source', '')} |")
    return "\n".join(lignes) + "\n"


# ---------------------------------------------------------------- appels et écriture

def verifier(fichiers: list[Path], modele: str, limite: int | None, plafond: float, dry_run: bool) -> int:
    echantillon.charger_env()
    import extractor
    extractor.cout_usd(modele, 0, 0)  # tarif connu, sinon exception avant tout appel
    aujourdhui = datetime.now().strftime("%Y-%m-%d")
    total, total_est = 0, 0.0
    for chemin in fichiers:
        fiches = echantillon._charger_liste(chemin)
        restantes = a_verifier(fiches, aujourdhui)
        est = sum(estimation_euros(len(texte_pour_classement(f)[0]), modele) for f in restantes)
        print(f"{chemin.name} : {len(fiches)} fiches, {len(restantes)} à vérifier, {est:.3f} euros estimés")
        total += len(restantes)
        total_est += est
    print(f"Modèle {modele}, tarif {extractor.TARIFS_USD_PAR_MTOK[modele]} USD par million de tokens (entrée, sortie), "
          f"cumul déjà dépensé {echantillon.cout_cumule(modele):.3f} euros, plafond {plafond:.2f} euros.")
    if dry_run:
        print(f"Essai à blanc : {total} fiches à vérifier, {total_est:.3f} euros estimés ; rien n'a été écrit ni appelé.")
        return 0
    faites, dossier = 0, SAUVEGARDES / f"verification_{datetime.now().strftime('%Y-%m-%d_%H%M')}"
    for chemin in fichiers:
        fiches = echantillon._charger_liste(chemin)
        if not a_verifier(fiches, aujourdhui):
            continue
        dossier.mkdir(parents=True, exist_ok=True)
        shutil.copy2(chemin, dossier / chemin.name)  # sauvegarde avant la première écriture
        for f in a_verifier(fiches, aujourdhui):
            if limite is not None and faites >= limite:
                break
            if echantillon.cout_cumule(modele) >= plafond:
                print(f"Plafond {plafond:.2f} euros atteint pour {modele} : arrêt, fiches déjà vérifiées conservées.")
                return 1
            texte, origine = texte_pour_classement(f)
            url, source = f.get("url_source", ""), (f.get("scrape_metadata") or {}).get("source", "")
            t0 = time.time()
            try:
                reponse = extractor.verifier_fiche(texte, fiche_resumee(f), url, CONSIGNE_VERIFICATION, source, modele)
                v = normaliser_verification(reponse, modele, origine, time.strftime("%Y-%m-%dT%H:%M:%S"))
            except Exception as err:  # une fiche en echec n arrete pas le lot : elle reste a verifier a la relance
                print(f"  échec {url[:70]} {type(err).__name__}: {str(err).splitlines()[0][:80]}")
                continue
            f.setdefault("scrape_metadata", {})["verification"] = v
            faites += 1
            echantillon._ecrire_json(chemin, fiches)  # à chaque fiche : un arrêt ne perd rien, la relance reprend
            print(f"  [{faites}] {len(v['douteux'])} douteux {time.time() - t0:5.1f}s  {(f.get('titre') or '')[:50]}"
                  + (f"  <- {', '.join(v['douteux'])}" if v["douteux"] else ""))
        if limite is not None and faites >= limite:
            break
    print(f"{faites} fiches vérifiées ; coût cumulé de {modele} : {echantillon.cout_cumule(modele):.3f} euros"
          + (f" ; sauvegardes dans {dossier}" if faites else ""))
    return 0


def rapport() -> None:
    fiches = [f for chemin in fichiers_de_l_import() for f in echantillon._charger_liste(chemin)]
    RAPPORT.write_text(rapport_markdown(fiches, datetime.now().strftime("%Y-%m-%d")), encoding="utf-8")
    b = bilan(fiches)
    print(f"Rapport écrit : {RAPPORT.name} ({b['verifiees']} fiches vérifiées, {b['douteuses']} douteuses)")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--verifier", action="store_true")
    parser.add_argument("--rapport", action="store_true")
    parser.add_argument("--fichier", nargs="*", help="fichiers de résultats (défaut : ceux que lit l'import)")
    parser.add_argument("--modele", default=MODELE_DEFAUT)
    parser.add_argument("--limite", type=int, help="nombre de fiches à vérifier au plus (essai)")
    parser.add_argument("--plafond", type=float, default=echantillon.PLAFOND_EUROS)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    fichiers = [Path(f) for f in args.fichier] if args.fichier else fichiers_de_l_import()
    if args.verifier:
        return verifier(fichiers, args.modele, args.limite, args.plafond, args.dry_run)
    if args.rapport:
        rapport()
        return 0
    parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
