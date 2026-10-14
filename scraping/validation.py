"""Validation manuelle des fiches extraites, dans le navigateur de Monsieur DUCOUT (essai du 2026-10-13).

Usage :
  python validation.py --fichier results/echantillon_ollama_qwen3-8b.json [--port 8765]

Ouvre ensuite http://localhost:8765 dans n'importe quel navigateur. Pour chaque fiche : les champs proposés
par le modèle, un extrait du texte de la page gardée, un lien vers la page officielle, et quatre boutons
(AAP juste / AAP à corriger / pas un AAP / passer, touches 1 à 4). Les verdicts sont écrits dans
results/validation_manuelle.json (clé : adresse de la page), rejouables et relus par le rapport.

Pourquoi un serveur local et pas une page statique : le verdict doit être écrit sur le disque du poste,
sans service extérieur ; la bibliothèque standard suffit.
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import requests

from qualification import texte_sans_balises
from registre import adresse_aap

ICI = Path(__file__).resolve().parent
RESULTS = ICI / "results"
# Verdicts sur les fiches : fichier versionne dans sources/ (decision humaine, jamais ecrit par un outil automatique),
# lu par scripts/import_to_firestore.py (changement organisation-donnees-validees). Cle = adresse de l'appel.
SORTIE = ICI / "sources" / "verdicts_fiches.json"
ANCIENNE_SORTIE = RESULTS / "validation_manuelle.json"
VERDICTS = ("aap-juste", "aap-a-corriger", "pas-un-aap", "passer", "liste-d-aap", "appel-permanent",
            "bonne-page", "mauvaise-page", "page-morte", "hors-champ")  # les quatre derniers : mode « pages » (page gardée d'une source)
ENTETES = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AAP-Sante-validation/0.1", "Accept-Language": "fr"}

PAGE = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Validation des fiches</title>
<style>
 body{font-family:system-ui,sans-serif;margin:0;padding:.6rem 1rem;color:#222;height:100vh;box-sizing:border-box;display:flex;flex-direction:column}
 h1{font-size:1.1rem;margin:0 0 .3rem} .barre{color:#555;margin-bottom:.5rem;font-size:.9rem}
 .colonnes{display:flex;gap:1rem;flex:1;min-height:0}
 .gauche{flex:3;display:flex;flex-direction:column;min-width:0} .droite{flex:2;overflow:auto;min-width:0}
 iframe{flex:1;width:100%;border:1px solid #bbb;background:#fff}
 table{border-collapse:collapse;width:100%;margin:.3rem 0 .8rem} td{border:1px solid #ddd;padding:.3rem .5rem;vertical-align:top}
 td:first-child{width:7rem;color:#555;background:#fafafa}
 .extrait{white-space:pre-wrap;background:#f6f6f6;border:1px solid #ddd;padding:.6rem;max-height:40vh;overflow:auto;font-size:.85rem}
 .boutons{display:flex;gap:.5rem;flex-wrap:wrap;margin:.6rem 0}
 button{font-size:.95rem;padding:.5rem .8rem;border:1px solid #888;border-radius:6px;background:#fff;cursor:pointer}
 button.ok{background:#e6f4ea} button.corr{background:#fff4e0} button.non{background:#fde8e8}
 input{font-size:.95rem;padding:.4rem;width:100%;box-sizing:border-box}
 .fin{font-size:1.1rem;color:#2a7} .aide{color:#777;font-size:.85rem}
</style></head><body>
<h1>Validation des fiches extraites</h1>
<div class="barre"><span id="barre"></span> <label><input type="checkbox" id="fenetre" style="width:auto"> Pages dans une fenêtre séparée (au lieu du cadre)</label></div>
<div class="colonnes"><div class="gauche"><iframe id="cadre" title="Page officielle"></iframe></div><div class="droite" id="fiche"></div></div>
<script>
let fiches=[], verdicts={}, i=0, fenetre=null, urlFenetre='';
let modeFenetre=localStorage.getItem('modeFenetre')!=='0';  // fenêtre séparée par défaut (choix de Monsieur DUCOUT), le cadre sur demande
function ouvrirFenetre(url){fenetre=window.open(url,'aap_page_officielle','popup,width=1100,height=900'); urlFenetre=url;
 if(!fenetre){document.getElementById('ouvrir').style.display='inline';return;}
 setTimeout(()=>window.focus(),150);}
const champs=[["titre","Titre"],["financeur","Financeur"],["date_ouverture","Ouverture"],["date_cloture","Clôture"],
 ["montant_min","Montant minimal"],["montant_max","Montant maximal"],["enveloppe_globale","Enveloppe globale"],["territoire","Territoire"]];
async function charger(){const r=await fetch('/api/fiches');const d=await r.json();fiches=d.fiches;verdicts=d.verdicts;
 i=fiches.findIndex(f=>!verdicts[f.url_source]); if(i<0)i=0; afficher();}
function esc(s){return String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function afficher(){
 const faits=Object.keys(verdicts).length;
 document.getElementById('barre').textContent=`Fiche ${i+1} sur ${fiches.length} ; ${faits} verdict(s) enregistré(s). Touches : 1 à 6 comme les boutons, Entrée dans le commentaire pour l'enregistrer, flèches pour naviguer.`;
 if(!fiches.length){document.getElementById('fiche').innerHTML='<p>Aucune fiche.</p>';return;}
 const f=fiches[i]; const v=verdicts[f.url_source];
 let h=`<p><a href="${esc(f.url_source)}" target="_blank" rel="noopener">Ouvrir dans un nouvel onglet</a>`;
 h+=` <button id="ouvrir" style="display:none" onclick="ouvrirFenetre(fiches[i].url_source)">Ouvrir la fenêtre séparée</button>`;
 h+=` <span class="aide">(si le cadre de gauche reste blanc, le site refuse l'affichage intégré ; le texte ci-dessous reste lisible)</span>`;
 h+=`<br><span style="color:#777">${esc(f.scrape_metadata?.source||'')} ; ${esc(f.scrape_metadata?.modele||'')}</span></p>`;
 const page = (f.scrape_metadata?.modele||'').startsWith('page');
 const lien = (f.scrape_metadata?.modele||'').startsWith('lien') || page;
 const lignes = page ? champs.filter(([k])=>['financeur','territoire','enveloppe_globale'].includes(k)).map(([k,l])=>[k,{financeur:'Organisme',territoire:'Famille',enveloppe_globale:'Liens AAP repérés'}[k]])
  : lien ? champs.filter(([k])=>['titre','financeur'].includes(k)) : champs;
 h+='<table>'+lignes.map(([k,l])=>`<tr><td>${l}</td><td>${esc(f[k])}</td></tr>`).join('');
 if(page && f.verdict_actuel) h+=`<tr><td>Verdict actuel</td><td>${esc(f.verdict_actuel)}</td></tr><tr><td>Motif</td><td>${esc(f.motif||'')}</td></tr>`;
 if(lien && !page) h+=`<tr><td>Rubrique d'origine</td><td><a href="${esc(f.scrape_metadata.rubrique)}" target="_blank" rel="noopener">${esc(f.scrape_metadata.rubrique)}</a></td></tr>`;
 h+='</table>';
 h+=`<details open><summary>${lien?'Texte de la page (récupéré par le serveur)':'Extrait du texte de la page gardée'}</summary><div class="extrait" id="extrait">${esc(f.texte_page||f.extrait||'(texte indisponible)')}</div></details>`;
 h+=`<p><input id="com" placeholder="${page?'Adresse de la bonne page, ou commentaire':'Commentaire (champ faux, valeur attendue...)'}" value="${esc(v?.commentaire||'')}"></p>`;
 h+=`<div class="boutons">`;
 if(page){h+=`<button class="ok" onclick="envoyer('bonne-page')">1. C\\'est la page des appels de cet organisme</button>`;
  h+=`<button class="corr" onclick="envoyer('mauvaise-page')">2. Pas la bonne page (saisir la bonne adresse ci-dessus)</button>`;
  h+=`<button class="non" onclick="envoyer('page-morte')">3. Page morte, ou sans appel à projets</button>`;
  h+=`<button onclick="envoyer('passer')">4. Passer</button>`;
  h+=`<button class="non" onclick="envoyer('hors-champ')">5. Des appels, mais jamais santé ni médico-social</button>`;}
 else{h+=`<button class="ok" onclick="envoyer('aap-juste')">${lien?'1. C\\'est un appel à projets':'1. AAP, fiche juste'}</button>`;
  h+=`<button class="corr" onclick="envoyer('aap-a-corriger')">${lien?'2. AAP, mais douteux (commentaire)':'2. AAP, fiche à corriger'}</button>`;
  h+=`<button class="non" onclick="envoyer('pas-un-aap')">3. Pas un appel à projets</button>`;
  h+=`<button onclick="envoyer('passer')">4. Passer</button>`;
  if(lien){h+=`<button class="corr" onclick="envoyer('liste-d-aap')">5. Page qui recense des AAP (pas un AAP précis)</button>`;
   h+=`<button class="corr" onclick="envoyer('appel-permanent')">6. On peut candidater, sans sujet ni montant précis</button>`;}}
 h+=`<button onclick="aller(-1)">&larr; Précédente</button><button onclick="aller(1)">Suivante &rarr;</button></div>`;
 if(v) h+=`<p>Verdict enregistré : <b>${esc(v.verdict)}</b> le ${esc(v.date)}${v.commentaire?' ; '+esc(v.commentaire):''}</p>`;
 if(fiches.every(f=>verdicts[f.url_source])) h+='<p class="fin">Toutes les fiches ont un verdict. Vous pouvez fermer cette page.</p>';
 document.getElementById('fiche').innerHTML=h;
 const cadre=document.getElementById('cadre'); document.querySelector('.gauche').style.display=modeFenetre?'none':'flex';
 if(modeFenetre){ if(!fenetre||fenetre.closed||urlFenetre!==f.url_source) ouvrirFenetre(f.url_source); }
 else if(cadre.src!==f.url_source) cadre.src=f.url_source;
 if(lien && !f.texte_page) chargerTexte(f);
}
async function chargerTexte(f){
 const zone=document.getElementById('extrait'); zone.textContent='Lecture de la page en cours...';
 try{const r=await fetch('/api/apercu?url='+encodeURIComponent(f.url_source)); f.texte_page=(await r.json()).texte||'(page vide)';}
 catch(e){f.texte_page='(page non lisible par le serveur : '+e+')';}
 if(fiches[i]===f) zone.textContent=f.texte_page;
}
async function envoyer(verdict,rester){const f=fiches[i];const commentaire=document.getElementById('com').value;
 await fetch('/api/verdict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:f.url_source,verdict,commentaire,modele:f.scrape_metadata?.modele||''})});
 verdicts[f.url_source]={verdict,commentaire,date:new Date().toISOString().slice(0,16).replace('T',' ')};
 if(rester){afficher();return;}
 const suivante=fiches.findIndex((x,k)=>k>i&&!verdicts[x.url_source]); i=suivante>=0?suivante:Math.min(i+1,fiches.length-1); afficher();}
function aller(d){i=Math.max(0,Math.min(fiches.length-1,i+d));afficher();}
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'){if(e.key==='Enter')envoyer(verdicts[fiches[i].url_source]?.verdict||'passer',true);return;}
 const page=(fiches[i]?.scrape_metadata?.modele||'').startsWith('page');
 const m=(page?{'1':'bonne-page','2':'mauvaise-page','3':'page-morte','4':'passer','5':'hors-champ'}
  :{'1':'aap-juste','2':'aap-a-corriger','3':'pas-un-aap','4':'passer','5':'liste-d-aap','6':'appel-permanent'})[e.key]; if(m)envoyer(m);
 if(e.key==='ArrowLeft')aller(-1); if(e.key==='ArrowRight')aller(1);});
document.getElementById('cadre').onload=()=>window.focus();  // garde les touches 1 à 4 actives après le chargement du cadre
const caseFenetre=document.getElementById('fenetre'); caseFenetre.checked=modeFenetre;
caseFenetre.onchange=()=>{modeFenetre=caseFenetre.checked; localStorage.setItem('modeFenetre',modeFenetre?'1':'0'); if(modeFenetre) ouvrirFenetre(fiches[i].url_source); afficher();};
charger();
</script></body></html>"""


def extrait_page(fiche: dict, maximum: int = 2500) -> str:
    chemin = ICI / (fiche.get("scrape_metadata") or {}).get("fichier", "")
    if not chemin.is_file():
        return ""
    contenu = chemin.read_text(encoding="utf-8", errors="ignore")
    texte = contenu.split("\n", 2)[2] if contenu.count("\n") >= 2 else contenu  # saute l'adresse et le texte du lien
    return texte.strip()[:maximum]


def fiches_ouvertes(fiches: list[dict], aujourdhui: str) -> list[dict]:
    """Fiches encore ouvertes (clôture absente ou à venir) : celles que l'application affiche ou met en attente."""
    return [f for f in fiches if not f.get("date_cloture") or f["date_cloture"] >= aujourdhui]


def migrer_anciens_verdicts() -> None:
    """Une fois : reprend results/validation_manuelle.json dans sources/verdicts_fiches.json sans écraser un verdict."""
    if not ANCIENNE_SORTIE.exists():
        return
    anciens = json.loads(ANCIENNE_SORTIE.read_text(encoding="utf-8"))
    verdicts = charger_verdicts()
    repris = {u: v for u, v in anciens.items() if u not in verdicts}
    if repris:
        SORTIE.write_text(json.dumps({**verdicts, **repris}, ensure_ascii=False, indent=1), encoding="utf-8")
    ANCIENNE_SORTIE.rename(ANCIENNE_SORTIE.with_suffix(".json.migre"))
    print(f"{len(repris)} verdicts repris de {ANCIENNE_SORTIE.name} dans {SORTIE.name}", flush=True)


def charger_verdicts() -> dict:
    return json.loads(SORTIE.read_text(encoding="utf-8")) if SORTIE.exists() else {}


def apercu_page(url: str, maximum: int = 4000) -> str:
    """Texte visible d'une page officielle, lu par le serveur local.

    Pourquoi : beaucoup de sites publics interdisent leur affichage dans un cadre (en-tête X-Frame-Options) ;
    le texte lu par le serveur reste alors le seul aperçu possible sans ouvrir un nouvel onglet.
    """
    if url.lower().split("?")[0].endswith(FICHIERS):
        return "Fichier à télécharger : pas d'aperçu texte. Le cadre de gauche l'affiche s'il s'agit d'un PDF."
    try:
        reponse = requests.get(url, headers=ENTETES, timeout=15)
    except requests.RequestException as e:
        return f"Page non lisible par le serveur : {e.__class__.__name__}"
    if "html" not in reponse.headers.get("Content-Type", ""):
        return f"Contenu non HTML ({reponse.headers.get('Content-Type', '?')}), code {reponse.status_code}"
    reponse.encoding = reponse.apparent_encoding if reponse.encoding in (None, "ISO-8859-1") else reponse.encoding
    return texte_sans_balises(reponse.text, maximum) or f"(page sans texte visible, code {reponse.status_code})"

RELECTEUR_ECRAN = "Monsieur DUCOUT, validation à l'écran"


def appliquer_verdicts_pages(verdicts: dict, resultats: dict, registre: list[dict], relecture: dict, aujourdhui: str) -> tuple[dict, dict]:
    """Reporte les verdicts du mode « pages » (par adresse) en relectures par source (spec qualification-sources).

    Correspondance : bonne page -> rubrique confirmée (si le verdict en vigueur est autre) ; hors champ -> hors santé ;
    page morte -> à vérifier (à retrouver) ; mauvaise page avec adresse -> url_aap corrigée dans le registre (ancienne
    adresse dans les notes), rubrique confirmée, source à redécouvrir ; mauvaise page sans adresse -> à vérifier.
    Pourquoi une fonction pure : testable sans les fichiers hors Git, et le bilan rendu sert de preuve.
    """
    import re
    par_url: dict[str, list[str]] = {}
    for sid, r in resultats.items():
        if r.get("url_rubrique"):
            par_url.setdefault(r["url_rubrique"], []).append(sid)
    par_id = {s["id"]: s for s in registre}
    relecture = dict(relecture)
    bilan = {"lus": 0, "confirmees": 0, "deja_confirmees": 0, "corrigees": [], "a_retrouver": [], "hors_champ": 0,
             "sans_source": [], "ignores": 0}

    def poser(sid: str, verdict: str, motif: str, date: str) -> None:
        entree = {"verdict": verdict, "motif": motif, "date": date, "relecteur": RELECTEUR_ECRAN}
        ancienne = relecture.get(sid)
        if ancienne and ancienne.get("relecteur") != RELECTEUR_ECRAN:
            entree["relecture_precedente"] = {k: v for k, v in ancienne.items() if k != "relecture_precedente"}
        elif ancienne and ancienne.get("relecture_precedente"):
            entree["relecture_precedente"] = ancienne["relecture_precedente"]
        relecture[sid] = entree

    for url, d in verdicts.items():
        bilan["lus"] += 1
        v, com = d.get("verdict"), (d.get("commentaire") or "").strip()
        date = (d.get("date") or aujourdhui)[:10]
        suffixe = f" : {com}" if com else ""
        if v == "passer":
            bilan["ignores"] += 1
            continue
        ids = [i for i in par_url.get(url, []) if i in par_id]
        if not ids:
            bilan["sans_source"].append(url)
            continue
        for sid in ids:
            s = par_id[sid]
            en_vigueur = (s.get("qualification") or {}).get("verdict")
            if v == "bonne-page":
                if en_vigueur == "rubrique-confirmee":
                    bilan["deja_confirmees"] += 1
                else:
                    poser(sid, "rubrique-confirmee", "bonne page vue à l'écran" + suffixe, date)
                    bilan["confirmees"] += 1
            elif v == "hors-champ":
                poser(sid, "hors-sante", "hors champ à l'écran" + suffixe, date)
                bilan["hors_champ"] += 1
            elif v == "page-morte":
                poser(sid, "a-verifier", "page morte à l'écran, adresse à retrouver" + suffixe, date)
                bilan["a_retrouver"].append(sid)
            elif v == "mauvaise-page":
                urls = [u.rstrip(".,;)") for u in re.findall(r"https?://[^\s,;]+", com)]
                if not urls:
                    poser(sid, "a-verifier", "mauvaise page à l'écran, sans adresse" + suffixe, date)
                    bilan["a_retrouver"].append(sid)
                    continue
                nouvelle, ancienne = urls[0], adresse_aap(s)
                if nouvelle != ancienne:
                    # url_aap (origine) n'est pas touchee : la correction humaine vit dans url_validee.
                    s["url_validee"], s["validee_par"], s["validee_le"] = nouvelle, RELECTEUR_ECRAN, date
                    autre = f" ; autre page : {urls[1]}" if len(urls) > 1 else ""
                    s["notes"] = ((s.get("notes") or "").rstrip() + f" Adresse corrigée par Monsieur DUCOUT le {date} (ancienne : {ancienne}{autre}).").strip()
                poser(sid, "rubrique-confirmee", f"adresse donnée à l'écran : {nouvelle}", date)
                bilan["corrigees"].append((sid, ancienne, nouvelle))
    return relecture, bilan


def ecarts_redecouverte(corrigees: list[tuple[str, str, str]], resultats: dict) -> list[tuple[str, str, str]]:
    """Sources corrigées dont la page gardée n'est pas sur le domaine de l'adresse donnée (ou sans page) : à revalider."""
    ecarts = []
    for sid, _, nouvelle in corrigees:
        r = resultats.get(sid) or {}
        gardee = r.get("url_rubrique") or ""
        if not gardee or urlparse(gardee).netloc.lower() != urlparse(nouvelle).netloc.lower():
            ecarts.append((sid, nouvelle, gardee or r.get("statut", "jamais découverte")))
    return ecarts


def fabriquer_gestionnaire(fiches: list[dict]):
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
            elif chemin == "/api/fiches":
                corps = json.dumps({"fiches": fiches, "verdicts": charger_verdicts()}, ensure_ascii=False).encode("utf-8")
                self._repondre(200, corps, "application/json; charset=utf-8")
            elif chemin == "/api/apercu":
                url = (parse_qs(urlparse(self.path).query).get("url") or [""])[0]
                if url not in {f["url_source"] for f in fiches}:  # le serveur ne lit que les pages de la liste
                    self._repondre(400, b"adresse hors liste", "text/plain")
                    return
                corps = json.dumps({"texte": apercu_page(url)}, ensure_ascii=False).encode("utf-8")
                self._repondre(200, corps, "application/json; charset=utf-8")
            else:
                self._repondre(404, b"introuvable", "text/plain")

        def do_POST(self) -> None:  # noqa: N802
            if urlparse(self.path).path != "/api/verdict":
                self._repondre(404, b"introuvable", "text/plain")
                return
            taille = int(self.headers.get("Content-Length") or 0)
            donnees = json.loads(self.rfile.read(taille) or b"{}")
            if donnees.get("verdict") not in VERDICTS or not donnees.get("url"):
                self._repondre(400, b"verdict ou adresse manquants", "text/plain")
                return
            verdicts = charger_verdicts()
            verdicts[donnees["url"]] = {"verdict": donnees["verdict"], "commentaire": (donnees.get("commentaire") or "").strip(),
                                        "modele": donnees.get("modele", ""), "date": datetime.now().strftime("%Y-%m-%d %H:%M")}
            RESULTS.mkdir(exist_ok=True)
            SORTIE.write_text(json.dumps(verdicts, ensure_ascii=False, indent=1), encoding="utf-8")
            print(f"  {donnees['verdict']:15} {donnees['url'][:80]}", flush=True)
            self._repondre(200, b'{"ok": true}', "application/json")

        def log_message(self, *args) -> None:  # silence du journal HTTP
            pass

    return Gestionnaire


FICHIERS = (".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip")


def liens_des_rubriques_confirmees(source: str | None = None) -> list[dict]:
    """Les liens repérés par la découverte sur les rubriques confirmées, présentés comme des fiches à juger.

    Mode « vrais liens » demandé par Monsieur DUCOUT : la question à trancher est « ce lien est-il un appel
    à projets ? », avant toute extraction. Un lien par adresse, rubrique par rubrique, fichiers à télécharger
    signalés mais gardés.
    """
    registre = json.loads((ICI / "sources" / "registre.json").read_text(encoding="utf-8"))
    fiches, vus = [], set()
    for s in registre:
        if (s.get("qualification") or {}).get("verdict") != "rubrique-confirmee":
            continue
        if source and s["id"] != source:
            continue
        chemin = ICI / "decouverte" / s["id"] / "liens.json"
        if not chemin.exists():
            continue
        liens = json.loads(chemin.read_text(encoding="utf-8"))["liens"]
        for lien in sorted(liens, key=lambda l: -(l.get("score") or 0)):  # les plus probables d'abord
            href = lien["href"]
            if href in vus or any(c in href for c in "[]{}") or "#" in (lien.get("texte") or ""):
                continue  # gabarit non rempli par le site (ex. « [#DSR_FORM_URL_TEXT#] ») : lien cassé
            vus.add(href)
            fichier = href.lower().split("?")[0].endswith(FICHIERS)
            fiches.append({"url_source": href, "titre": " ".join((lien.get("texte") or "").split()) or "(lien sans intitulé)",
                           "financeur": s["nom"], "territoire": s.get("categorie", ""),
                           "enveloppe_globale": "fichier à télécharger" if fichier else None,
                           "scrape_metadata": {"source": s["id"], "modele": "lien repéré par la découverte", "rubrique": adresse_aap(s)},
                           "extrait": f"Rubrique d'origine : {adresse_aap(s)}\nIntitulé du lien : {lien.get('texte') or ''}\n"
                                      f"Score de la découverte : {lien.get('score', '')}\n\nOuvrir la page officielle pour juger."})
    return fiches


def pages_gardees(verdicts_registre: tuple[str, ...] = ("rubrique-confirmee",)) -> list[dict]:
    """Les pages gardées par la découverte pour les sources dont la qualification a l'un des verdicts donnés.

    Mode « pages » : la question est « est-ce bien la page des appels de cet organisme ? ». C'est la vérification
    humaine directe de l'étape 2 de la feuille de route.
    """
    registre = json.loads((ICI / "sources" / "registre.json").read_text(encoding="utf-8"))
    resultats = json.loads((ICI / "decouverte" / "resultats.json").read_text(encoding="utf-8"))
    fiches, sans_page = [], 0
    for s in registre:
        q = s.get("qualification") or {}
        if q.get("verdict") not in verdicts_registre:
            continue
        r = resultats.get(s["id"]) or {}
        url = r.get("url_rubrique")
        if not url:  # la découverte n'a rien gardé : rien à montrer, c'est la cible de la recherche web
            sans_page += 1
            continue
        motif = (q.get("relecture") or {}).get("motif") or q.get("justification") or ""
        fiches.append({"url_source": url, "titre": s["nom"], "financeur": s["nom"], "territoire": s.get("categorie", ""),
                       "enveloppe_globale": r.get("nb_liens_aap"),
                       "verdict_actuel": q.get("verdict", ""), "motif": motif,
                       "scrape_metadata": {"source": s["id"], "modele": "page gardée par la découverte", "rubrique": url},
                       "extrait": ""})
    if sans_page:
        print(f"{sans_page} sources sans page gardée, non présentées", flush=True)
    return fiches


def echantillonner(fiches: list[dict], nombre: int, graine: int = 0) -> list[dict]:
    """Première passe sur des sources différentes : un lien par rubrique, à tour de rôle, meilleur score d'abord.

    L'ordre des rubriques est tiré au sort avec une graine fixe pour que deux lancements donnent la même liste
    (les verdicts déjà enregistrés restent en face des mêmes liens).
    """
    par_source: dict[str, list[dict]] = {}
    for f in fiches:
        par_source.setdefault(f["scrape_metadata"]["source"], []).append(f)
    files = list(par_source.values())
    random.Random(graine).shuffle(files)
    choisis: list[dict] = []
    while len(choisis) < nombre and any(files):
        for file in files:
            if file and len(choisis) < nombre:
                choisis.append(file.pop(0))
    return choisis


def appliquer_pages_fichiers() -> int:
    """Option --appliquer-pages : lit les verdicts et la découverte, écrit la relecture et le registre, affiche le bilan."""
    import registre as module_registre
    from qualification import RELECTURE
    verdicts = json.loads((RESULTS / "validation_pages.json").read_text(encoding="utf-8"))
    resultats = json.loads((ICI / "decouverte" / "resultats.json").read_text(encoding="utf-8"))
    sources = module_registre.charger()
    relecture_fichier = json.loads(RELECTURE.read_text(encoding="utf-8")) if RELECTURE.exists() else {}
    entrees = {k: v for k, v in relecture_fichier.items() if not k.startswith("_")}
    relecture, bilan = appliquer_verdicts_pages(verdicts, resultats, sources, entrees, datetime.now().strftime("%Y-%m-%d"))
    erreurs = module_registre.erreurs_format(sources)
    if erreurs:
        print("Registre invalide après correction, rien n'est écrit :", *erreurs[:5], sep="\n  ", file=sys.stderr)
        return 1
    module_registre.sauver(sources)
    sortie = {k: v for k, v in relecture_fichier.items() if k.startswith("_")}
    sortie.update(relecture)
    RELECTURE.write_text(json.dumps(sortie, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{bilan['lus']} verdicts lus : {bilan['confirmees']} sources confirmées (plus {bilan['deja_confirmees']} déjà confirmées), "
          f"{len(bilan['corrigees'])} adresses corrigées, {len(bilan['a_retrouver'])} à retrouver, {bilan['hors_champ']} hors champ, "
          f"{bilan['ignores']} ignorés (passer), {len(bilan['sans_source'])} sans source")
    for url in bilan["sans_source"]:
        print(f"  sans source : {url}")
    print(f"Relecture écrite : {RELECTURE.name} ({len(relecture)} sources) ; registre écrit. Enchaîner :")
    print("  python qualification.py --registre --rapport && python registre.py --tableau")
    if bilan["corrigees"]:
        print("  ..\\.venv\\Scripts\\python decouverte.py --forcer --ids " + ",".join(sid for sid, _, _ in bilan["corrigees"]))
        ecarts = ecarts_redecouverte(bilan["corrigees"], resultats)
        print(f"Sources corrigées dont la page gardée n'est pas sur le domaine de l'adresse donnée (à revalider à l'écran après redécouverte) : {len(ecarts)}")
        for sid, nouvelle, gardee in ecarts:
            print(f"  {sid} : donnée {nouvelle} | gardée {gardee}")
    if bilan["a_retrouver"]:
        print("À retrouver (recherche web) : " + ", ".join(bilan["a_retrouver"]))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Validation manuelle des fiches dans le navigateur.")
    parser.add_argument("--fichier", default=str(RESULTS / "echantillon_ollama_qwen3-8b.json"))
    parser.add_argument("--liens", action="store_true", help="juger les vrais liens des rubriques confirmées (AAP ou non), sans extraction")
    parser.add_argument("--pages", action="store_true", help="valider la page gardée de chaque rubrique confirmée (étape 2 de la feuille de route)")
    parser.add_argument("--verdicts", default="rubrique-confirmee",
                        help="avec --pages : verdicts de qualification à présenter, séparés par des virgules (ex. hors-sante,a-verifier)")
    parser.add_argument("--source", help="avec --liens : identifiant d'une seule rubrique du registre")
    parser.add_argument("--echantillon", type=int, metavar="N",
                        help="avec --liens : première passe de N liens répartis entre les rubriques (un par rubrique à tour de rôle)")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--ouvertes", action="store_true",
                        help="avec --fichier : ne présenter que les fiches dont la clôture n'est pas passée ou est absente")
    parser.add_argument("--appliquer-pages", action="store_true",
                        help="reporter les verdicts du mode --pages dans sources/relecture_qualification.json et le registre, sans serveur")
    args = parser.parse_args()
    if args.appliquer_pages:
        return appliquer_pages_fichiers()
    global SORTIE
    if args.pages:
        SORTIE = RESULTS / "validation_pages.json"
        fiches = pages_gardees(tuple(v.strip() for v in args.verdicts.split(",")))
        chemin = Path(f"pages gardées des sources « {args.verdicts} »")
    elif args.liens:
        SORTIE = RESULTS / "validation_liens.json"  # verdicts sur les liens, à part des verdicts sur les fiches
        fiches = liens_des_rubriques_confirmees(args.source)
        if args.echantillon:
            fiches = echantillonner(fiches, args.echantillon)
        chemin = Path("rubriques confirmées du registre" + (f" ({args.source})" if args.source else "")
                      + (f", échantillon de {args.echantillon}" if args.echantillon else ""))
    else:
        chemin = Path(args.fichier)
        if not chemin.is_file():
            print(f"Fichier introuvable : {chemin}", file=sys.stderr)
            return 1
        fiches = json.loads(chemin.read_text(encoding="utf-8"))
        if args.ouvertes:
            fiches = fiches_ouvertes(fiches, datetime.now().strftime("%Y-%m-%d"))
        for f in fiches:
            f["extrait"] = extrait_page(f)
        migrer_anciens_verdicts()
    try:
        serveur = ThreadingHTTPServer(("127.0.0.1", args.port), fabriquer_gestionnaire(fiches))
    except OSError:
        print(f"Le port {args.port} est déjà pris : la validation tourne sans doute déjà. Ouvrir http://localhost:{args.port}", file=sys.stderr)
        return 1
    print(f"{len(fiches)} fiches de {chemin.name} ; verdicts dans {SORTIE.name}. Ouvrir http://localhost:{args.port} (Ctrl+C pour arrêter)", flush=True)
    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
