"""Comparaison de deux moteurs d'extraction sur 50 pages jamais traitées (changement OpenSpec
comparaison-moteurs-50-pages, demande de Monsieur DUCOUT du 2026-10-14).

Pourquoi : l'échantillon de 45 textes mesure l'extraction sur des pages choisies à la main ; ici les pages sont
tirées au sort parmi les textes collectés que le passage local n'a jamais traités, les deux moteurs les traitent
à neuf par la même chaîne, et Monsieur DUCOUT juge chaque page et chaque fiche.

Usage (depuis scraping/, environnement ../.venv) :
  python comparaison.py --tirer [--nombre 50] [--graine 2026]        # sources/comparaison_pages.json (reproductible)
  python comparaison.py --extraire-local --modele qwen3:8b [--limite N]   # 0 euro, results/comparaison_ollama_<modele>.json
  python comparaison.py --extraire-api --modele claude-haiku-5-5 [--limite N] [--plafond 5]   # après accord écrit
  python comparaison.py --juger [--port 8766]                        # écran de jugement, verdicts dans sources/
  python comparaison.py --rapport                                    # COMPARAISON.md

Aucun appel payant sans --extraire-api, lui-même soumis à l'accord écrit de Monsieur DUCOUT et au plafond.
"""
from __future__ import annotations

import argparse
import json
import random
import sys
import unicodedata
from collections import Counter
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
import echantillon  # noqa: E402
import extraction_locale  # noqa: E402

ICI = Path(__file__).resolve().parent
PAGES = ICI / "sources" / "comparaison_pages.json"
VERDICTS = ICI / "sources" / "verdicts_comparaison.json"
RAPPORT = ICI / "COMPARAISON.md"
NOMBRE, GRAINE, PORT = 50, 2026, 8766
MODELE_API_DEFAUT = "claude-haiku-5-5"
VERDICTS_PAGE = ("appel", "pas-un-appel")
VERDICTS_FICHE = ("juste", "a-corriger")

PAGE = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Comparaison des moteurs</title>
<style>
 body{font-family:system-ui,sans-serif;margin:0;padding:.6rem 1rem;color:#222;height:100vh;box-sizing:border-box;display:flex;flex-direction:column}
 h1{font-size:1.1rem;margin:0 0 .3rem} .barre{color:#555;margin-bottom:.5rem;font-size:.9rem}
 .colonnes{display:flex;gap:1rem;flex:1;min-height:0}
 .texte{flex:3;overflow:auto;white-space:pre-wrap;border:1px solid #bbb;padding:.5rem;font-size:.85rem;background:#fafafa}
 .droite{flex:3;overflow:auto;min-width:0}
 .moteurs{display:flex;gap:.8rem;margin-top:.5rem} .moteur{flex:1;border:1px solid #ddd;padding:.4rem;border-radius:4px}
 .moteur h2{font-size:.95rem;margin:.2rem 0}
 table{border-collapse:collapse;width:100%;margin:.3rem 0} td{border:1px solid #ddd;padding:.2rem .4rem;vertical-align:top;font-size:.85rem}
 td:first-child{width:7rem;color:#555}
 button{margin:.15rem .3rem .15rem 0;padding:.35rem .6rem;cursor:pointer} button.on{background:#2a7;color:#fff;border-color:#2a7}
 .refus{color:#a33;font-style:italic} .absent{color:#888;font-style:italic}
 .actions{margin-top:.5rem} #commentaire{width:100%;box-sizing:border-box;margin-bottom:.3rem}
</style></head><body>
<h1>Comparaison des moteurs : jugement de Monsieur DUCOUT</h1>
<div class="barre" id="barre"></div>
<div class="colonnes">
 <div class="texte" id="texte"></div>
 <div class="droite">
  <div><a id="lien" href="#" target="_blank" rel="noopener">Ouvrir la page officielle</a> <span id="source"></span></div>
  <div class="actions">Cette page : <button id="b-appel" onclick="choisir('page','appel')">1. C'est un appel à projets</button>
   <button id="b-pas" onclick="choisir('page','pas-un-appel')">2. Ce n'est pas un appel</button></div>
  <div class="moteurs" id="moteurs"></div>
  <div class="actions"><input id="commentaire" placeholder="Commentaire (facultatif)">
   <button onclick="enregistrer()">Enregistrer (Entrée)</button> <button onclick="aller(1)">Suivante sans juger</button>
   <button onclick="aller(-1)">Précédente</button></div>
 </div>
</div>
<script>
let etat, i = 0, choix = {};
const CHAMPS = [['titre','Titre'],['financeur','Financeur'],['date_cloture','Clôture'],['montant_min','Montant min'],
  ['montant_max','Montant max'],['enveloppe_globale','Enveloppe'],['territoire','Territoire'],['description','Description']];
function esc(s){ return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
async function charger(){ etat = await (await fetch('/api/etat')).json();
  i = etat.pages.findIndex(p => !etat.verdicts[p.url]); if(i < 0) i = 0; afficher(); }
function bloc(cle){ const p = etat.pages[i]; const r = etat[cle][p.url];
  const titre = cle === 'local' ? 'Modèle local (' + etat.modeles.local + ')' : 'Modèle API (' + etat.modeles.api + ')';
  let h = '<h2>' + titre + '</h2>';
  if(!r) h += '<div class="absent">Pas encore traitée par ce moteur</div>';
  else if(r.refus !== undefined) h += '<div class="refus">Refusée : ' + esc(r.refus || '(sans raison)') + '</div>';
  else { h += '<table>' + CHAMPS.map(([c, l]) => '<tr><td>' + l + '</td><td>' + esc(String(r.fiche[c] ?? '')).slice(0, 400) + '</td></tr>').join('') + '</table>';
    h += '<button id="b-' + cle + '-juste" onclick="choisir(\\'' + cle + '\\',\\'juste\\')">' + (cle === 'local' ? '3' : '5') + '. Fiche juste</button>';
    h += '<button id="b-' + cle + '-a-corriger" onclick="choisir(\\'' + cle + '\\',\\'a-corriger\\')">' + (cle === 'local' ? '4' : '6') + '. Fiche à corriger</button>'; }
  return '<div class="moteur">' + h + '</div>'; }
async function afficher(){ const p = etat.pages[i]; const v = etat.verdicts[p.url] || {}; choix = {page: v.page, local: v.local, api: v.api};
  document.getElementById('barre').textContent = 'Page ' + (i + 1) + ' / ' + etat.pages.length + ' ; ' + Object.keys(etat.verdicts).length
    + ' jugées ; ' + (v.page ? 'verdict enregistré : ' + v.page : 'sans verdict');
  document.getElementById('lien').href = p.url;
  document.getElementById('source').textContent = ' ' + p.nom + ' (' + p.categorie + ') : ' + p.url;
  document.getElementById('commentaire').value = v.commentaire || '';
  document.getElementById('moteurs').innerHTML = bloc('local') + bloc('api');
  marquer();
  document.getElementById('texte').textContent = 'Chargement du texte...';
  const t = await (await fetch('/api/texte?url=' + encodeURIComponent(p.url))).json();
  document.getElementById('texte').textContent = t.texte; }
function marquer(){ for (const b of document.querySelectorAll('button[id^=b-]')) b.classList.remove('on');
  for (const [k, v] of Object.entries(choix)) if(v){ const b = document.getElementById(k === 'page' ? (v === 'appel' ? 'b-appel' : 'b-pas') : 'b-' + k + '-' + v); if(b) b.classList.add('on'); } }
function choisir(cle, valeur){ choix[cle] = valeur; marquer(); }
async function enregistrer(){ const p = etat.pages[i];
  if(!choix.page){ alert('Dire d abord si la page est un appel à projets ou non.'); return; }
  for (const cle of ['local', 'api']) { const r = etat[cle][p.url];
    if(choix.page === 'appel' && r && r.fiche && !choix[cle]){ alert('Juger la fiche du moteur ' + cle + ' (juste ou à corriger).'); return; }
    if(!(r && r.fiche)) choix[cle] = null; }
  const corps = {url: p.url, page: choix.page, local: choix.local || null, api: choix.api || null, commentaire: document.getElementById('commentaire').value};
  const rep = await fetch('/api/verdict', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(corps)});
  if(!rep.ok){ alert('Verdict refusé par le serveur : ' + await rep.text()); return; }
  etat.verdicts[p.url] = corps; aller(1); }
function aller(d){ i = (i + d + etat.pages.length) % etat.pages.length; afficher(); }
document.addEventListener('keydown', e => { if(e.target.id === 'commentaire' && e.key !== 'Enter') return;
  const m = {'1': ['page', 'appel'], '2': ['page', 'pas-un-appel'], '3': ['local', 'juste'], '4': ['local', 'a-corriger'],
    '5': ['api', 'juste'], '6': ['api', 'a-corriger']}[e.key];
  if(m) choisir(m[0], m[1]); else if(e.key === 'Enter') enregistrer(); });
charger();
</script></body></html>
"""


# ---------------------------------------------------------------- fonctions pures (testées)

def _normaliser(chemin: str) -> str:
    return chemin.replace("\\", "/")


def tirer_pages(candidats: list[dict], nombre: int, graine: int) -> list[dict]:
    """Tirage reproductible : quota par famille au prorata (plus forts restes), puis tirage dans chaque famille.

    Pourquoi au prorata : un tirage simple serait dominé par les familles les plus nombreuses ; pourquoi une graine :
    la même liste à chaque exécution, donc un fichier versionnable et un jugement rejouable.
    """
    if not candidats or nombre <= 0:
        return []
    nombre = min(nombre, len(candidats))
    par_famille: dict[str, list[dict]] = {}
    for c in candidats:
        par_famille.setdefault(c["categorie"], []).append(c)
    quotas = {f: nombre * len(l) / len(candidats) for f, l in par_famille.items()}
    alloue = {f: int(q) for f, q in quotas.items()}
    restes = sorted(quotas, key=lambda f: (-(quotas[f] - alloue[f]), f))
    for f in restes[:nombre - sum(alloue.values())]:
        alloue[f] += 1
    alea = random.Random(graine)
    tirage: list[dict] = []
    for f in sorted(par_famille):
        liste = sorted(par_famille[f], key=lambda c: c["url"])
        tirage.extend(alea.sample(liste, min(alloue[f], len(liste))))
    return tirage


def scores_des_liens(sources: list[dict]) -> dict[str, int]:
    """Score de découverte de chaque lien (mots d'appel à projets dans le texte du lien ou l'adresse) ; 0 = navigation."""
    scores: dict[str, int] = {}
    for s in sources:
        chemin = echantillon.DOSSIER / s["id"] / "liens.json"
        if chemin.exists():
            for lien in json.loads(chemin.read_text(encoding="utf-8"))["liens"]:
                scores.setdefault(lien["href"], int(lien.get("score") or 0))
    return scores


def sans_accents(texte: str) -> str:
    return unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode().lower()


def candidats_jamais_traites(sources: list[dict], fiches: list[dict], refus: list[dict], echecs: list[dict],
                             exclues: set[str], score_min: int = 0, scores: dict[str, int] | None = None,
                             mots: list[str] | None = None) -> list[dict]:
    """Textes collectés des sources données, jamais traités par le passage local et hors des adresses exclues.

    Un texte est « traité » s'il figure dans les fiches, les refus ou les échecs (par fichier ou par adresse) ;
    une adresse n'est gardée qu'une fois. score_min écarte les liens de navigation (score 0 : menus du site),
    constat du 2026-10-14 : 18 des 50 pages du premier tirage en étaient. mots : le texte de la page doit contenir
    au moins un de ces mots (sans accents ni majuscules), ce qui écarte menus et contrôles anti-robot sans dépendre
    du score du lien (les titres d'appels des ARS n'ont souvent aucun mot-clé dans le lien).
    """
    traites = {_normaliser(f["scrape_metadata"]["fichier"]) for f in fiches} | {_normaliser(r["fichier"]) for r in refus} \
        | {_normaliser(e["fichier"]) for e in echecs}
    adresses_traitees = {f["url_source"] for f in fiches} | {r["url"] for r in refus}
    mots_normalises = [sans_accents(m) for m in (mots or [])]
    candidats, vues = [], set()
    for s in sources:
        for chemin in sorted((echantillon.DOSSIER / s["id"] / "fiches").glob("*.txt")):
            rel = _normaliser(str(chemin.relative_to(echantillon.DOSSIER.parent)))
            url, texte = echantillon.lire_fiche(chemin)
            if rel in traites or url in adresses_traitees or url in exclues or url in vues:
                continue
            if scores is not None and scores.get(url, 0) < score_min:
                continue
            if mots_normalises and not any(m in sans_accents(texte) for m in mots_normalises):
                continue
            vues.add(url)
            candidats.append({"url": url, "source": s["id"], "nom": s["nom"], "categorie": s.get("categorie", ""), "fichier": rel})
    return candidats


def repartition(pages: list[dict]) -> str:
    compte = Counter(p["categorie"] for p in pages)
    return ", ".join(f"{f} {n}" for f, n in sorted(compte.items(), key=lambda kv: (-kv[1], kv[0])))


def resultats_moteur(fiches: list[dict], refus: list[dict]) -> dict[str, dict]:
    """Adresse -> {"fiche": ...} ou {"refus": raison, "duree_s": ...} ; une fiche l'emporte sur un refus."""
    resultats = {f["url_source"]: {"fiche": f} for f in fiches}
    for r in refus:
        resultats.setdefault(r["url"], {"refus": r.get("raison", ""), "duree_s": r.get("duree_s")})
    return resultats


def duree_totale(resultats: dict[str, dict]) -> float:
    total = 0.0
    for r in resultats.values():
        total += float((r["fiche"]["scrape_metadata"].get("duree_s") if "fiche" in r else r.get("duree_s")) or 0)
    return total


def mesures(pages: list[dict], verdicts: dict, resultats: dict[str, dict], cle: str) -> dict:
    """Repérage, qualité et fabrications d'un moteur sur les pages jugées (design, décision 5)."""
    juges = [p for p in pages if p["url"] in verdicts]
    appels = [p for p in juges if verdicts[p["url"]]["page"] == "appel"]

    def a_fiche(p: dict) -> bool:
        return "fiche" in resultats.get(p["url"], {})

    return {"traitees": sum(1 for p in pages if p["url"] in resultats), "jugees": len(juges), "appels": len(appels),
            "reperage": sum(1 for p in juges if (verdicts[p["url"]]["page"] == "appel") == a_fiche(p)),
            "qualite": sum(1 for p in appels if a_fiche(p) and verdicts[p["url"]].get(cle) == "juste"),
            "fabrications": sum(1 for p in juges if verdicts[p["url"]]["page"] == "pas-un-appel" and a_fiche(p))}


def cout_journal(urls: set[str], modele: str, journal: Path = echantillon.JOURNAL_COUTS) -> tuple[int, float]:
    """Appels et euros du journal des coûts pour ce modèle, sur ces adresses seulement (l'échantillon est exclu)."""
    appels, total = 0, 0.0
    if not journal.exists():
        return 0, 0.0
    for ligne in journal.read_text(encoding="utf-8").splitlines():
        if not ligne.strip():
            continue
        d = json.loads(ligne)
        if d.get("model") == modele and d.get("url") in urls:
            appels += 1
            total += float(d.get("cost_eur_approx") or 0)
    return appels, total


def verdict_invalide(donnees: dict, adresses: dict) -> str | None:
    if donnees.get("url") not in adresses:
        return "adresse hors liste"
    if donnees.get("page") not in VERDICTS_PAGE:
        return "verdict de page manquant"
    for cle in ("local", "api"):
        if donnees.get(cle) not in VERDICTS_FICHE + (None,):
            return f"verdict {cle} invalide"
    return None


def pourcent(n: int, d: int) -> str:
    return f"{100 * n / d:.0f} %" if d else "-"


def rapport_markdown(infos: dict, pages: list[dict], verdicts: dict, moteurs: list[tuple], aujourdhui: str) -> str:
    """moteurs : (libellé, clé de verdict, modèle, résultats, durée en secondes, texte du coût)."""
    lignes = [f"# Comparaison de deux moteurs sur {len(pages)} pages jamais traitées", "",
              f"Changement OpenSpec `comparaison-moteurs-50-pages`. Rapport du {aujourdhui}. Tirage : graine {infos.get('graine')}, "
              f"{infos.get('candidats')} textes candidats (jamais traités par le passage local, hors échantillon), répartition "
              f"{repartition(pages)}. Jugement de Monsieur DUCOUT : {sum(1 for p in pages if p['url'] in verdicts)} pages sur {len(pages)} ; "
              f"pages commentées « hors champ » (appels hors santé et médico-social, question du 2026-10-14) : "
              f"{sum(1 for p in pages if 'hors champ' in (verdicts.get(p['url'], {}).get('commentaire') or '').lower())}.",
              "",
              "Repérage = décisions justes sur les pages jugées (fiche produite sur une page jugée « appel », refus sur une page "
              "jugée « pas un appel »). Qualité = fiches jugées justes parmi les pages jugées « appel » (page sans fiche ou fiche "
              "à corriger = fausse). Fabrications = fiches produites sur des pages jugées « pas un appel ». Durées locales mesurées "
              "pendant le passage global (file d'attente Ollama) : indicatives. Le modèle local a une seconde chance sur les "
              "écarts de format, pas le modèle API.",
              "", "| Moteur | Modèle | Pages traitées | Repérage | Qualité | Fabrications | Durée | Coût |",
              "|---|---|---|---|---|---|---|---|"]
    for libelle, cle, modele, resultats, duree, cout in moteurs:
        m = mesures(pages, verdicts, resultats, cle)
        lignes.append(f"| {libelle} | {modele} | {m['traitees']} / {len(pages)} | {m['reperage']} / {m['jugees']} "
                      f"({pourcent(m['reperage'], m['jugees'])}) | {m['qualite']} / {m['appels']} ({pourcent(m['qualite'], m['appels'])}) "
                      f"| {m['fabrications']} | {duree:.0f} s | {cout} |")
    lignes += ["", "## Pages", "", "| # | Source | Page | Verdict page | Local | API | Commentaire |", "|---|---|---|---|---|---|---|"]

    def etat(resultats: dict, p: dict, cle: str) -> str:
        r = resultats.get(p["url"])
        if r is None:
            return "-"
        return "refus" if "refus" in r else "fiche " + (verdicts.get(p["url"], {}).get(cle) or "")

    local, api = moteurs[0][3], moteurs[1][3]
    for k, p in enumerate(pages, 1):
        v = verdicts.get(p["url"], {})
        lignes.append(f"| {k} | {p['nom'][:40]} | [page]({p['url']}) | {v.get('page', '')} | {etat(local, p, 'local')} | "
                      f"{etat(api, p, 'api')} | {(v.get('commentaire') or '').replace('|', '/')} |")
    return "\n".join(lignes) + "\n"


# ---------------------------------------------------------------- étapes

def sortie_locale() -> Path:
    return extraction_locale.SORTIE


def tirer(nombre: int, graine: int, familles: list[str] | None = None, ids: list[str] | None = None,
          score_min: int = 0, inclure_traites: bool = False, mots: list[str] | None = None) -> None:
    """Tirage. familles et ids restreignent les sources (second tirage du 2026-10-14 : financeurs de la santé,
    demande de Monsieur DUCOUT) ; score_min écarte les liens de navigation ; inclure_traites ne retire pas les
    pages déjà vues par le passage global (les deux moteurs repassent dessus à neuf de toute façon)."""
    sources = extraction_locale.rubriques()
    if familles or ids:
        sources = [s for s in sources if s.get("categorie") in (familles or []) or s["id"] in (ids or [])]
    if inclure_traites:
        fiches, refus, echecs = [], [], []
    else:
        fiches = echantillon._charger_liste(sortie_locale())
        refus = echantillon._charger_liste(sortie_locale().with_name(sortie_locale().stem + "_non_aap.json"))
        echecs = echantillon._charger_liste(sortie_locale().with_name(sortie_locale().stem + ".errors.json"))
    exclues = echantillon.adresses_echantillon(echantillon._charger_liste(echantillon.REFERENCE),
                                               echantillon._charger_liste(echantillon.NON_AAP))
    candidats = candidats_jamais_traites(sources, fiches, refus, echecs, exclues, score_min, scores_des_liens(sources), mots)
    pages = tirer_pages(candidats, nombre, graine)
    contenu = {"graine": graine, "nombre": len(pages), "candidats": len(candidats), "familles": familles or [],
               "ids": ids or [], "score_min": score_min, "inclure_traites": inclure_traites, "mots": mots or [], "pages": pages}
    inchange = PAGES.exists() and json.loads(PAGES.read_text(encoding="utf-8")) == contenu
    if not inchange:
        PAGES.parent.mkdir(exist_ok=True)
        PAGES.write_text(json.dumps(contenu, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(candidats)} textes jamais traités ({repartition(candidats)})")
    print(f"{len(pages)} pages tirées, graine {graine} ({repartition(pages)}) -> {PAGES.name}"
          + (" (inchangé)" if inchange else ""))


def charger_infos() -> dict:
    if not PAGES.exists():
        raise SystemExit(f"Lancer d'abord --tirer : {PAGES} absent.")
    return json.loads(PAGES.read_text(encoding="utf-8"))


def charger_pages() -> list[dict]:
    return charger_infos()["pages"]


def charger_verdicts() -> dict:
    return json.loads(VERDICTS.read_text(encoding="utf-8")) if VERDICTS.exists() else {}


def charger_resultats(moteur: str, modele: str) -> dict[str, dict]:
    base = echantillon.RESULTS / f"comparaison_{moteur}_{echantillon.nom_modele(modele)}.json"
    return resultats_moteur(echantillon._charger_liste(base), echantillon._charger_liste(base.with_name(base.stem + "_non_aap.json")))


def extraire_local(modele: str, limite: int | None) -> None:
    pages = charger_pages()
    fiches = [({"id": p["source"], "nom": p["nom"], "categorie": p["categorie"]}, ICI / p["fichier"]) for p in pages]
    sortie = echantillon.RESULTS / f"comparaison_ollama_{echantillon.nom_modele(modele)}.json"
    echantillon.extraire([], "ollama", modele, limite, chemin_sortie=sortie, metadonnees={"comparaison": True}, fiches=fiches)


def extraire_api(modele: str, limite: int | None, plafond: float) -> None:
    pages = charger_pages()
    resultats = {s["id"]: s for s in extraction_locale.rubriques()}
    sortie = echantillon.RESULTS / f"comparaison_api_{echantillon.nom_modele(modele)}.json"
    echantillon.extraire_api(resultats, modele, limite, plafond, adresses={p["url"] for p in pages}, chemin_sortie=sortie)


def fabriquer_gestionnaire(pages: list[dict], modeles: dict):
    adresses = {p["url"]: p for p in pages}

    class Gestionnaire(BaseHTTPRequestHandler):
        def _repondre(self, code: int, corps: bytes, type_contenu: str) -> None:
            self.send_response(code)
            self.send_header("Content-Type", type_contenu)
            self.send_header("Content-Length", str(len(corps)))
            self.end_headers()
            self.wfile.write(corps)

        def do_GET(self) -> None:  # noqa: N802 (nom imposé par http.server)
            chemin = urlparse(self.path).path
            if chemin == "/":
                self._repondre(200, PAGE.encode("utf-8"), "text/html; charset=utf-8")
            elif chemin == "/api/etat":
                corps = {"pages": pages, "modeles": modeles, "local": charger_resultats("ollama", modeles["local"]),
                         "api": charger_resultats("api", modeles["api"]), "verdicts": charger_verdicts()}
                self._repondre(200, json.dumps(corps, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")
            elif chemin == "/api/texte":
                url = (parse_qs(urlparse(self.path).query).get("url") or [""])[0]
                if url not in adresses:  # le serveur ne lit que les textes de la liste
                    self._repondre(400, b"adresse hors liste", "text/plain")
                    return
                texte = echantillon.lire_fiche(ICI / adresses[url]["fichier"])[1][:8000]
                self._repondre(200, json.dumps({"texte": texte}, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")
            else:
                self._repondre(404, b"introuvable", "text/plain")

        def do_POST(self) -> None:  # noqa: N802
            if urlparse(self.path).path != "/api/verdict":
                self._repondre(404, b"introuvable", "text/plain")
                return
            taille = int(self.headers.get("Content-Length") or 0)
            donnees = json.loads(self.rfile.read(taille) or b"{}")
            erreur = verdict_invalide(donnees, adresses)
            if erreur:
                self._repondre(400, erreur.encode("utf-8"), "text/plain; charset=utf-8")
                return
            verdicts = charger_verdicts()
            verdicts[donnees["url"]] = {"page": donnees["page"], "local": donnees.get("local"), "api": donnees.get("api"),
                                        "commentaire": (donnees.get("commentaire") or "").strip(),
                                        "date": datetime.now().strftime("%Y-%m-%d %H:%M")}
            VERDICTS.parent.mkdir(exist_ok=True)
            VERDICTS.write_text(json.dumps(verdicts, ensure_ascii=False, indent=1), encoding="utf-8")
            print(f"  {donnees['page']:13} local={donnees.get('local') or '-':10} api={donnees.get('api') or '-':10} {donnees['url'][:70]}", flush=True)
            self._repondre(200, b'{"ok": true}', "application/json")

        def log_message(self, *args) -> None:  # silence du journal HTTP
            pass

    return Gestionnaire


def juger(port: int, modele_local: str, modele_api: str) -> None:
    pages = charger_pages()
    serveur = ThreadingHTTPServer(("127.0.0.1", port), fabriquer_gestionnaire(pages, {"local": modele_local, "api": modele_api}))
    print(f"Jugement des {len(pages)} pages : ouvrir http://localhost:{port} ; {len(charger_verdicts())} déjà jugées ; "
          f"verdicts dans {VERDICTS.name}. Ctrl+C pour arrêter.", flush=True)
    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        pass


def rapport(modele_local: str, modele_api: str) -> None:
    infos, verdicts = charger_infos(), charger_verdicts()
    pages = infos["pages"]
    local, api = charger_resultats("ollama", modele_local), charger_resultats("api", modele_api)
    appels, euros = cout_journal({p["url"] for p in pages}, modele_api)
    moteurs = [("Modèle local", "local", modele_local, local, duree_totale(local), "0 euro"),
               ("Modèle API", "api", modele_api, api, duree_totale(api), f"{euros:.3f} euros ({appels} appels, journal des coûts)")]
    RAPPORT.write_text(rapport_markdown(infos, pages, verdicts, moteurs, datetime.now().strftime("%Y-%m-%d")), encoding="utf-8")
    for libelle, cle, modele, resultats, _, _ in moteurs:
        m = mesures(pages, verdicts, resultats, cle)
        print(f"{libelle} ({modele}) : {m['traitees']} traitées, repérage {m['reperage']}/{m['jugees']}, "
              f"qualité {m['qualite']}/{m['appels']}, fabrications {m['fabrications']}")
    print(f"Rapport écrit : {RAPPORT.name}")


# ---------------------------------------------------------------- entrée

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--tirer", action="store_true")
    parser.add_argument("--nombre", type=int, default=NOMBRE)
    parser.add_argument("--graine", type=int, default=GRAINE)
    parser.add_argument("--familles", help="avec --tirer : familles du registre, séparées par des virgules (ex. ars,fondation)")
    parser.add_argument("--ids", help="avec --tirer : identifiants de sources à ajouter, séparés par des virgules")
    parser.add_argument("--score-min", type=int, default=0, help="avec --tirer : score minimal du lien (3 = lien d'appel)")
    parser.add_argument("--inclure-traites", action="store_true", help="avec --tirer : ne pas écarter les pages déjà vues par le passage global")
    parser.add_argument("--mots", help="avec --tirer : mots dont l'un au moins doit figurer dans le texte de la page, séparés par des virgules")
    parser.add_argument("--extraire-local", action="store_true")
    parser.add_argument("--extraire-api", action="store_true", help="après accord écrit de Monsieur DUCOUT")
    parser.add_argument("--modele", default=extraction_locale.MODELE_DEFAUT, help="modèle de --extraire-local ou --extraire-api")
    parser.add_argument("--limite", type=int)
    parser.add_argument("--plafond", type=float, default=echantillon.PLAFOND_EUROS)
    parser.add_argument("--juger", action="store_true")
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--rapport", action="store_true")
    parser.add_argument("--modele-local", default=extraction_locale.MODELE_DEFAUT, help="pour --juger et --rapport")
    parser.add_argument("--modele-api", default=MODELE_API_DEFAUT, help="pour --juger et --rapport")
    args = parser.parse_args()
    if args.tirer:
        tirer(args.nombre, args.graine, familles=args.familles.split(",") if args.familles else None,
              ids=args.ids.split(",") if args.ids else None, score_min=args.score_min, inclure_traites=args.inclure_traites,
              mots=[m.strip() for m in args.mots.split(",")] if args.mots else None)
    if args.extraire_local:
        extraire_local(args.modele, args.limite)
    if args.extraire_api:
        extraire_api(args.modele, args.limite, args.plafond)
    if args.juger:
        juger(args.port, args.modele_local, args.modele_api)
    if args.rapport:
        rapport(args.modele_local, args.modele_api)
    if not any([args.tirer, args.extraire_local, args.extraire_api, args.juger, args.rapport]):
        parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
