"""Annuaires de référence du registre des sources (changement OpenSpec registre-par-annuaires).

Pourquoi : le registre a été constitué de listes connues, sans total de référence ; personne ne pouvait
dire ce qui manquait. Chaque famille est désormais adossée à un annuaire officiel, et le registre
n'entre une source qu'avec une adresse réellement trouvée (jamais devinée).

Usage :
  python annuaires.py --rnf <opendata-donnees-fonds-fondations.zip ou .csv>
      Écrit sources/annuaires/rnf_fondations_sante_social.csv : fondations reconnues d'utilité publique (FRUP)
      et fondations d'entreprise (FE), actives, dont le domaine d'intérêt général ou l'objet social évoque la
      santé, le social, le médical, le handicap, l'autonomie ou le vieillissement.

Source du RNF : Registre national des fonds et fondations, ministère de l'Intérieur, données ouvertes
(data.gouv.fr, jeu « Fichiers relatifs aux Registre national des fonds et fondations (RNF) »), mensuel.
"""
from __future__ import annotations

import argparse
import csv
import io
import re
import sys
import zipfile
from pathlib import Path

ICI = Path(__file__).resolve().parent
DOSSIER = ICI / "sources" / "annuaires"
EXTRAIT_RNF = DOSSIER / "rnf_fondations_sante_social.csv"

TYPES_VAGUE_1 = ("FRUP", "FE")  # vague 1 décidée par Monsieur DUCOUT ; les fonds de dotation (FDD) viendront ensuite
CRITERE_SANTE_SOCIAL = re.compile(r"sant|social|m[ée]dic|handicap|autonom|vieill", re.I)
COLONNES_EXTRAIT = ("numero_rnf", "titre", "type_organisme", "siret", "code_postal", "ville",
                    "domaine_interet_general", "site_trouve", "id_registre")


def lire_rnf(chemin: Path) -> list[dict]:
    """Lignes du fichier RNF (zip contenant un CSV, ou CSV direct), séparateur détecté."""
    if chemin.suffix.lower() == ".zip":
        with zipfile.ZipFile(chemin) as z:
            nom = next(n for n in z.namelist() if n.lower().endswith(".csv"))
            brut = z.read(nom)
    else:
        brut = chemin.read_bytes()
    texte = brut.decode("utf-8-sig", errors="replace")
    separateur = ";" if texte[:2000].count(";") > texte[:2000].count(",") else ","
    return list(csv.DictReader(io.StringIO(texte), delimiter=separateur))


def filtrer_vague_1(lignes: list[dict]) -> list[dict]:
    """FRUP et FE actives dont le domaine ou l'objet évoque la santé ou le social (filtre large, volontairement)."""
    retenues = []
    for l in lignes:
        if l.get("etat") != "Active" or l.get("type_organisme") not in TYPES_VAGUE_1:
            continue
        if not CRITERE_SANTE_SOCIAL.search((l.get("domaine_interet_general") or "") + " " + (l.get("objet_social") or "")):
            continue
        retenues.append({c: (l.get(c) or "").strip() for c in COLONNES_EXTRAIT if c not in ("site_trouve", "id_registre")}
                        | {"site_trouve": "", "id_registre": ""})
    return retenues


def ecrire_extrait(retenues: list[dict], chemin: Path = EXTRAIT_RNF) -> None:
    chemin.parent.mkdir(parents=True, exist_ok=True)
    with chemin.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLONNES_EXTRAIT, delimiter=";")
        w.writeheader()
        w.writerows(sorted(retenues, key=lambda l: l["titre"]))


MOTS_VIDES = {"fondation", "fondations", "d", "de", "du", "des", "la", "le", "les", "l", "et", "pour", "entreprise", "entreprises", "fonds",
              "groupe", "france", "francaise", "francais"}


def normaliser_nom(nom: str) -> str:
    """Minuscules sans accents ni ponctuation, sans les mots creux (« fondation », « de », « d'entreprise »...)."""
    import unicodedata
    texte = unicodedata.normalize("NFKD", nom or "").encode("ascii", "ignore").decode().lower()
    mots = [m for m in re.split(r"[^a-z0-9]+", texte) if m and m not in MOTS_VIDES]
    return " ".join(mots)


def rapprocher(extrait: list[dict], registre: list[dict]) -> tuple[list[tuple[dict, dict]], list[tuple[dict, dict]]]:
    """Correspondances sûres (noms normalisés égaux) et douteuses (un nom contenu dans l'autre), sans trancher les douteuses."""
    par_nom = {}
    for s in registre:
        par_nom.setdefault(normaliser_nom(s["nom"]), []).append(s)
    sures, douteuses = [], []
    for l in extrait:
        n = normaliser_nom(l["titre"])
        if not n:
            continue
        if n in par_nom:
            sures.append((l, par_nom[n][0]))
            continue
        mots_n = set(n.split())
        for m, sources in par_nom.items():
            mots_m = set(m.split())
            petit = mots_n if len(mots_n) <= len(mots_m) else mots_m
            # tous les mots du nom le plus court sont dans l'autre, et au moins un mot long (évite « air » dans « mairie »)
            if petit and petit <= mots_n and petit <= mots_m and max(map(len, petit)) >= 5:
                douteuses.append((l, sources[0]))
    return sures, douteuses


def verifier_site(url: str, titre: str = "") -> str | None:
    """Motif de refus, ou None si le site répond (code 200) et cite un mot significatif du nom de la fondation.

    Pourquoi le mot du nom : une adresse qui répond mais parle d'autre chose serait une fausse source (homonyme) ;
    on exige qu'un mot de cinq lettres au moins du nom apparaisse dans la page (sans accents ni majuscules).
    """
    import requests
    try:
        from recherche_web import ENTETES  # en-tête de navigateur : des sites refusent les clients inconnus (code 403)
        r = requests.get(url, headers=ENTETES, timeout=20)
    except requests.RequestException as e:
        return f"pas de réponse ({e.__class__.__name__})"
    if r.status_code != 200:
        return f"code {r.status_code}"
    mots = [m for m in normaliser_nom(titre).split() if len(m) >= 5] or [m for m in normaliser_nom(titre).split() if len(m) >= 4]
    if mots and not any(m in normaliser_nom(r.text) for m in mots):
        return f"la page ne cite aucun mot du nom ({', '.join(mots[:4])})"
    return None


def inscrire_sites(extrait: list[dict], candidats: dict, sonde=verifier_site) -> tuple[int, list[tuple[str, str]]]:
    """Inscrit les sites vérifiés dans la colonne site_trouve ; renvoie (nombre inscrits, refus [(numéro, motif)])."""
    par_numero = {l["numero_rnf"]: l for l in extrait}
    inscrits, refus = 0, []
    for numero, url in candidats.items():
        l = par_numero.get(numero)
        if l is None:
            refus.append((numero, "numéro RNF absent de l'extrait")); continue
        if l["site_trouve"]:
            refus.append((numero, f"site déjà inscrit : {l['site_trouve']}")); continue
        if not str(url).startswith("http"):
            refus.append((numero, "adresse non http")); continue
        motif = sonde(url, l.get("titre", ""))
        if motif:
            refus.append((numero, motif)); continue
        l["site_trouve"] = url
        inscrits += 1
    return inscrits, refus


def identifiant(titre: str, existants: set[str]) -> str:
    base = "fondation-" + "-".join(normaliser_nom(titre).split()) if normaliser_nom(titre) else "fondation-sans-nom"
    ident, n = base, 2
    while ident in existants:
        ident, n = f"{base}-{n}", n + 1
    return ident


def integrer(extrait: list[dict], registre: list[dict]) -> list[dict]:
    """Crée une entrée (statut identifiée) par ligne ayant un site trouvé et pas d'identifiant ; remplit id_registre."""
    from datetime import date
    existants = {s["id"] for s in registre}
    nouvelles = []
    for l in extrait:
        if not l["site_trouve"] or l["id_registre"]:
            continue
        ident = identifiant(l["titre"], existants)
        existants.add(ident)
        entree = {"id": ident, "nom": l["titre"].title() if l["titre"].isupper() else l["titre"], "categorie": "fondation",
                  "url_aap": l["site_trouve"], "perimetre": "sante-et-medico-social", "statut": "identifiee", "connecteur": "",
                  "notes": f"RNF {l['numero_rnf']} ({l['type_organisme']}, {l['ville']}) ; domaine : {l['domaine_interet_general']}. "
                           f"Entrée créée le {date.today().isoformat()} (changement registre-par-annuaires, vague 1) ; site trouvé par recherche web, vérifié (200).",
                  "derniere_verification": date.today().isoformat(), "code_http": 200}
        registre.append(entree)
        l["id_registre"] = ident
        nouvelles.append(entree)
    return nouvelles


def lire_extrait(chemin: Path = EXTRAIT_RNF) -> list[dict]:
    with chemin.open(encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f, delimiter=";"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Annuaires de référence du registre des sources.")
    parser.add_argument("--rnf", metavar="FICHIER", help="fichier RNF (zip ou csv) : écrit l'extrait de la vague 1")
    parser.add_argument("--rapprocher", action="store_true",
                        help="rapproche l'extrait des entrées du registre par nom normalisé ; remplit id_registre pour les correspondances sûres")
    parser.add_argument("--sites", metavar="FICHIER_JSON",
                        help="inscrit des sites trouvés {numero_rnf: adresse} après vérification (réponse HTTP 200), sans écraser un site déjà inscrit")
    parser.add_argument("--integrer", action="store_true",
                        help="crée au registre (statut identifiée) une entrée par fondation ayant un site trouvé et pas d'identifiant")
    parser.add_argument("--chercher", type=int, metavar="N",
                        help="cherche par Tavily le site des N premières fondations sans site ni identifiant (ordre : santé explicite d'abord), "
                             "inscrit les sites dont le domaine porte le nom après vérification, journalise le reste dans results/recherche_sites.jsonl")
    args = parser.parse_args()
    if args.chercher:
        import json, time
        import recherche_web
        journal = ICI / "results" / "recherche_sites.jsonl"
        journal.parent.mkdir(exist_ok=True)
        deja = {json.loads(l)["numero_rnf"] for l in journal.read_text(encoding="utf-8").splitlines() if l.strip()} if journal.exists() else set()
        extrait = lire_extrait()
        ordre = [l.split("\t")[0] for l in (DOSSIER / "file_recherche_sites.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
        par_numero = {l["numero_rnf"]: l for l in extrait}
        a_faire = [par_numero[n] for n in ordre if n in par_numero and not par_numero[n]["site_trouve"] and not par_numero[n]["id_registre"] and n not in deja][:args.chercher]
        inscrits, incertains, echecs = 0, 0, 0
        with journal.open("a", encoding="utf-8") as f:
            for l in a_faire:
                requete = f"{l['titre']} {l['ville'].split(' ')[0]} site officiel"
                try:
                    res = recherche_web.chercher_tavily(requete)
                except recherche_web.RefusMoteur as e:
                    print(f"ARRÊT : {e}", file=sys.stderr)
                    break
                except Exception as e:  # noqa: BLE001 (une erreur réseau ne doit pas perdre le lot)
                    echecs += 1
                    f.write(json.dumps({"numero_rnf": l["numero_rnf"], "titre": l["titre"], "erreur": e.__class__.__name__}, ensure_ascii=False) + "\n")
                    continue
                site = recherche_web.site_officiel(res, l["titre"])
                motif = verifier_site(site, l["titre"]) if site else "aucun domaine portant le nom"
                # un site qui répond 403 existe mais refuse les robots (protection) : le domaine porte le nom, on l'inscrit en le notant
                statut = "inscrit" if site and (not motif or motif == "code 403") else "incertain"
                if statut == "inscrit":
                    l["site_trouve"] = site
                    inscrits += 1
                else:
                    incertains += 1
                f.write(json.dumps({"numero_rnf": l["numero_rnf"], "titre": l["titre"], "ville": l["ville"], "statut": statut, "site": site, "motif": motif,
                                    "resultats": [r["url"] for r in res[:6]]}, ensure_ascii=False) + "\n")
                print(f"  {statut:9} {l['titre'][:55]:55} {site or ''} {('(' + motif + ')') if motif else ''}")
                time.sleep(1.0)
        ecrire_extrait(extrait)
        print(f"{inscrits} sites inscrits, {incertains} incertains (journal {journal.name}), {echecs} erreurs ; "
              f"{sum(1 for l in extrait if not l['site_trouve'] and not l['id_registre'])} fondations restantes")
        return 0
    if args.sites:
        import json
        candidats = json.loads(Path(args.sites).read_text(encoding="utf-8"))
        extrait = lire_extrait()
        inscrits, refus = inscrire_sites(extrait, candidats)
        ecrire_extrait(extrait)
        print(f"{inscrits} sites inscrits ; {len(refus)} refusés :")
        for numero, motif in refus:
            print(f"  {numero} : {motif}")
        sans = sum(1 for l in extrait if not l["site_trouve"] and not l["id_registre"])
        print(f"{sans} fondations encore sans site ni identifiant")
        return 0
    if args.integrer:
        import json
        chemin = ICI / "sources" / "registre.json"
        registre = json.loads(chemin.read_text(encoding="utf-8"))
        extrait = lire_extrait()
        nouvelles = integrer(extrait, registre)
        chemin.write_text(json.dumps(registre, ensure_ascii=False, indent=1), encoding="utf-8")
        ecrire_extrait(extrait)
        print(f"{len(nouvelles)} entrées créées au registre ({len(registre)} sources) ; "
              f"{sum(1 for l in extrait if not l['site_trouve'] and not l['id_registre'])} fondations sans site trouvé")
        return 0
    if args.rapprocher:
        import json
        registre = json.loads((ICI / "sources" / "registre.json").read_text(encoding="utf-8"))
        extrait = lire_extrait()
        sures, douteuses = rapprocher(extrait, registre)
        for l, s in sures:
            l["id_registre"] = s["id"]
        ecrire_extrait(extrait)
        print(f"{len(sures)} correspondances sûres (id_registre rempli), {len(douteuses)} douteuses à trancher par Monsieur DUCOUT :")
        for l, s in sures:
            print(f"  SÛRE     {l['titre'][:50]:50} = {s['id']}")
        for l, s in douteuses:
            print(f"  DOUTEUSE {l['titre'][:50]:50} ~ {s['id']} ({s['nom'][:40]})")
        return 0
    if not args.rnf:
        parser.print_help()
        return 2
    lignes = lire_rnf(Path(args.rnf))
    actives = sum(1 for l in lignes if l.get("etat") == "Active")
    retenues = filtrer_vague_1(lignes)
    if EXTRAIT_RNF.exists():  # on conserve les colonnes déjà remplies à la main (site trouvé, identifiant)
        anciennes = {l["numero_rnf"]: l for l in csv.DictReader(EXTRAIT_RNF.open(encoding="utf-8"), delimiter=";")}
        for l in retenues:
            a = anciennes.get(l["numero_rnf"])
            if a:
                l["site_trouve"], l["id_registre"] = a.get("site_trouve", ""), a.get("id_registre", "")
    ecrire_extrait(retenues)
    frup = sum(1 for l in retenues if l["type_organisme"] == "FRUP")
    fe = sum(1 for l in retenues if l["type_organisme"] == "FE")
    print(f"{len(retenues)} fondations retenues ({frup} RUP, {fe} d'entreprise) sur {actives} actives ; écrit {EXTRAIT_RNF.relative_to(ICI)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
