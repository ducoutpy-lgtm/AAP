# -*- coding: utf-8 -*-
"""
Scraper Local - Appels a Projets depuis un site HTTrack
-------------------------------------------------------
Traite un site web telecharge en local (HTTrack) :
- Lit la page liste des AAP
- Extrait le contenu de chaque page individuelle (.html ou .html.tmp)
- Envoie le texte a LM Studio pour extraction structuree
- Recense les fichiers locaux lies (PDF, Word, etc.)
- Sauvegarde en SQLite + Excel
"""
import sys, io
# Force UTF-8 output sur Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import sqlite3
import json
import os
import re
import shutil
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

from openai import OpenAI
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment

# ─── Configuration ────────────────────────────────────────────────────────────

HTTRACK_DIR  = Path(r"C:\Users\pierr\Documents\Arcadia\HTTrack\ars idf test\www.grand-est.ars.sante.fr")
SITE_BASE    = "https://www.grand-est.ars.sante.fr"
LIST_PAGE    = HTTRACK_DIR / "liste-appels-projet-candidature.html"

OUTPUT_DIR   = Path(".")          # dossier courant (scraping_aap_sante)
DB_PATH      = OUTPUT_DIR / "aap_sante.db"
EXCEL_PATH   = OUTPUT_DIR / "aap_sante.xlsx"
PDFS_DIR     = OUTPUT_DIR / "pdfs"

LM_STUDIO_URL = "http://localhost:1234/v1"

# Extensions de fichiers à recenser
FILE_EXTENSIONS = (".pdf", ".doc", ".docx", ".zip", ".xlsx", ".xls", ".odt", ".pptx")

# ─── Lecture des fichiers HTTrack ─────────────────────────────────────────────

def read_httrack_file(filepath: Path) -> str:
    """Lit un fichier .html ou .html.tmp et retourne le contenu HTML."""
    if not filepath.exists():
        return ""
    with open(filepath, "rb") as f:
        raw = f.read()

    # Les .html.tmp ont des metadonnees binaires HTTrack avant le HTML
    for marker in (b"<!DOCTYPE", b"<html", b"<HTML"):
        idx = raw.find(marker)
        if idx != -1:
            return raw[idx:].decode("utf-8", errors="replace")
    return raw.decode("utf-8", errors="replace")


def find_local_file(path: str) -> Path | None:
    """Cherche le fichier local correspondant à un href de page."""
    # href relatif ex: "mon-aap.html" ou absolu "https://..."
    if path.startswith("http"):
        parsed = urlparse(path)
        if parsed.netloc != "www.grand-est.ars.sante.fr":
            return None
        rel = parsed.path.lstrip("/")
    else:
        rel = path.lstrip("/").split("?")[0]

    # Cherche d'abord le fichier exact, puis avec .tmp
    for suffix in ("", ".tmp"):
        candidate = HTTRACK_DIR / (rel + suffix)
        if candidate.exists():
            return candidate
    return None


# ─── Extraction HTML ──────────────────────────────────────────────────────────

class _HTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text_parts = []
        self.file_links = []   # hrefs vers fichiers telechargeables
        self.page_links = []   # hrefs vers pages HTML
        self._skip = False
        self._depth = {"script": 0, "style": 0, "nav": 0, "footer": 0, "head": 0}

    def handle_starttag(self, tag, attrs):
        if tag in self._depth:
            self._depth[tag] += 1
            self._skip = True
            return
        if tag == "a":
            href = dict(attrs).get("href", "")
            if not href:
                return
            low = href.lower()
            if any(low.endswith(ext) or ext + "?" in low or "/download" in low
                   for ext in FILE_EXTENSIONS):
                self.file_links.append(href)
            elif href.startswith("/") or href.startswith("http") or href.endswith(".html"):
                self.page_links.append(href)

    def handle_endtag(self, tag):
        if tag in self._depth:
            self._depth[tag] = max(0, self._depth[tag] - 1)
            self._skip = any(v > 0 for v in self._depth.values())

    def handle_data(self, data):
        if not self._skip:
            t = data.strip()
            if t:
                self.text_parts.append(t)

    def get_text(self):
        return "\n".join(self.text_parts)


def parse_html(html: str):
    p = _HTMLParser()
    p.feed(html)
    return p.get_text(), p.file_links, p.page_links


# ─── Collecte des liens AAP depuis la page liste ──────────────────────────────

def get_aap_links() -> list[tuple[str, Path]]:
    """Retourne la liste (url_relative, fichier_local) des pages AAP individuelles."""
    html = read_httrack_file(LIST_PAGE)
    if not html:
        print(f"[ERR] Page liste introuvable : {LIST_PAGE}")
        return []

    _, _, page_links = parse_html(html)

    # Mots-cles qui indiquent une page AAP individuelle
    aap_kw = [
        "appel", "projet", "candidature", "aap", "infirmier", "numeris",
        "creation", "centre", "coordination", "habilitation", "postes",
        "representants", "urbanisme", "equipes", "comite", "parcours",
        "sante", "sante", "prevention", "environnement", "vaccination",
    ]
    # Exclusions (navigation, reseaux sociaux, etc.)
    exclude = [
        "facebook", "linkedin", "twitter", "mailto", "#", "rss",
        "sitemap", "contact", "presse", "newsletter", "recrute",
        "deposer-un-projet", "le-projet-regional",
    ]

    seen = set()
    results = []

    for href in page_links:
        low = href.lower()
        if any(ex in low for ex in exclude):
            continue
        if not any(kw in low for kw in aap_kw):
            continue
        # Normaliser
        if href.startswith("http"):
            parsed = urlparse(href)
            rel = parsed.path.lstrip("/")
        else:
            rel = href.lstrip("/").split("?")[0]
        if rel in seen or rel == "liste-appels-projet-candidature.html":
            continue
        local = find_local_file(href)
        if local:
            seen.add(rel)
            results.append((f"{SITE_BASE}/{rel}", local))

    return results


# ─── Recherche de fichiers lies ───────────────────────────────────────────────

def collect_linked_files(file_links: list[str], page_url: str) -> list[dict]:
    """
    Pour chaque href vers un fichier, cherche la copie locale.
    Retourne une liste de dicts {nom, chemin_local, url_originale}.
    """
    found = []
    seen_paths = set()

    for href in file_links:
        # Construire l'URL absolue originale
        if href.startswith("http"):
            original_url = href
        else:
            original_url = urljoin(page_url, href)

        # Chercher localement
        local = find_local_file(href)
        if local and str(local) not in seen_paths:
            seen_paths.add(str(local))
            found.append({
                "nom": local.name,
                "chemin_local": str(local),
                "url_originale": original_url,
            })
            continue

        # Cherche par ID de media dans l'URL (/media/XXXXX/)
        m = re.search(r"/media/(\d+)/", href)
        if m:
            media_id = m.group(1)
            media_dir = HTTRACK_DIR / "media" / media_id
            if media_dir.exists():
                for f in media_dir.iterdir():
                    if str(f) not in seen_paths:
                        seen_paths.add(str(f))
                        found.append({
                            "nom": f.name,
                            "chemin_local": str(f),
                            "url_originale": original_url,
                        })

    return found


def copy_files_to_output(linked_files: list[dict]) -> list[str]:
    """Copie les fichiers vers le dossier pdfs/ et retourne les nouveaux chemins."""
    PDFS_DIR.mkdir(exist_ok=True)
    copied = []
    for finfo in linked_files:
        src = Path(finfo["chemin_local"])
        if not src.exists():
            continue
        # Nettoyer le nom de fichier
        name = re.sub(r"[^\w\-_. ]", "_", src.name)[:120]
        dst = PDFS_DIR / name
        if not dst.exists():
            try:
                shutil.copy2(src, dst)
                print(f"    [PDF] Copie : {name}")
            except Exception as e:
                print(f"    [!]  Copie echouee {src.name} : {e}")
                dst = src  # utiliser le chemin original
        copied.append(str(dst))
    return copied


# ─── Extraction par LM Studio ─────────────────────────────────────────────────

def extract_with_lm_studio(text: str, url: str, fichiers: list[dict]) -> dict:
    """Envoie le texte de la page à LM Studio et retourne un dict structure."""
    fichiers_info = ""
    if fichiers:
        fichiers_info = "\n\nFichiers disponibles sur cette page :\n" + "\n".join(
            f"- {f['nom']} ({f['url_originale']})" for f in fichiers
        )

    prompt = f"""Tu es un extracteur d'information specialise dans les appels à projets français.
Analyse ce texte d'une page web et extrais les informations de l'appel à projet.

URL source : {url}
{fichiers_info}

TEXTE DE LA PAGE :
{text[:8000]}

Reponds UNIQUEMENT avec un objet JSON valide contenant exactement ces champs :
- "titre"                : nom complet de l'appel à projet
- "description"          : objectif / resume (3-5 phrases)
- "date_debut"           : date d'ouverture (format JJ/MM/AAAA, ou "" si inconnue)
- "date_fin"             : date limite de depôt (format JJ/MM/AAAA, ou "" si inconnue)
- "criteres_eligibilite" : qui peut candidater (resume detaille)
- "cahier_des_charges"   : modalites de candidature, conditions, procedure, calendrier (resume structure)
- "thematique"           : domaine(s) concerne(s) (ex: offre de soins, handicap, prevention...)
- "type"                 : type de l'appel (ex: Appel à projets, Appel à candidatures, AMI...)

Aucun texte avant ou après le JSON. Si une information est absente, utilise "".

Exemple :
{{
  "titre": "AAP Postes Partages Territoriaux 2026",
  "description": "L'ARS Grand Est soutient le recrutement d'assistants partages territoriaux...",
  "date_debut": "01/04/2026",
  "date_fin": "30/04/2026",
  "criteres_eligibilite": "Établissements publics de sante du Grand Est",
  "cahier_des_charges": "Depôt en ligne sur le portail dematerialise. Prise de poste le 2/11/2026...",
  "thematique": "offre de soins",
  "type": "Appel à candidatures"
}}"""

    try:
        client = OpenAI(base_url=LM_STUDIO_URL, api_key="lm-studio")
        response = client.chat.completions.create(
            model="local-model",
            messages=[
                {"role": "system", "content": "You are a JSON extractor. Output ONLY a valid JSON object, no explanation, no markdown."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=3000,
        )
        content = response.choices[0].message.content.strip()
        content = re.sub(r"```json\s*", "", content)
        content = re.sub(r"```\s*", "", content).strip()

        start = content.find("{")
        end   = content.rfind("}")
        if start != -1 and end != -1:
            return json.loads(content[start:end + 1])
        return json.loads(content)

    except ConnectionRefusedError:
        print("  [ERR] LM Studio inaccessible. Verifiez que le serveur est demarre sur le port 1234.")
        return {}
    except json.JSONDecodeError as e:
        print(f"  [!]  Reponse LM Studio non parseable : {e}")
        return {}
    except Exception as e:
        print(f"  [!]  Erreur LM Studio : {e}")
        return {}


# ─── Base de donnees ──────────────────────────────────────────────────────────

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS aap (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            titre                TEXT NOT NULL,
            type                 TEXT,
            description          TEXT,
            date_debut           TEXT,
            date_fin             TEXT,
            criteres_eligibilite TEXT,
            cahier_des_charges   TEXT,
            thematique           TEXT,
            url_source           TEXT NOT NULL,
            fichiers             TEXT DEFAULT '[]',
            date_ajout           TEXT NOT NULL,
            UNIQUE(titre, url_source)
        )
    """)
    conn.commit()
    conn.close()


def save_to_db(data: dict, url_source: str, fichiers: list[str]) -> bool:
    titre = (data.get("titre") or "").strip()
    if not titre or len(titre) < 5:
        return False
    conn = sqlite3.connect(DB_PATH)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    try:
        conn.execute("""
            INSERT OR REPLACE INTO aap
            (titre, type, description, date_debut, date_fin,
             criteres_eligibilite, cahier_des_charges, thematique,
             url_source, fichiers, date_ajout)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            titre,
            data.get("type", ""),
            data.get("description", ""),
            data.get("date_debut", ""),
            data.get("date_fin", ""),
            data.get("criteres_eligibilite", ""),
            data.get("cahier_des_charges", ""),
            data.get("thematique", ""),
            url_source,
            json.dumps(fichiers, ensure_ascii=False),
            now,
        ))
        changed = conn.execute("SELECT changes()").fetchone()[0] > 0
        conn.commit()
        return changed
    except Exception as e:
        print(f"  [!]  Erreur base de donnees : {e}")
        return False
    finally:
        conn.close()


# ─── Export Excel ─────────────────────────────────────────────────────────────

def export_to_excel():
    conn = sqlite3.connect(DB_PATH)
    rows = conn.execute("""
        SELECT titre, type, description, date_debut, date_fin,
               criteres_eligibilite, cahier_des_charges, thematique,
               url_source, fichiers, date_ajout
        FROM aap ORDER BY date_ajout DESC
    """).fetchall()
    total = conn.execute("SELECT COUNT(*) FROM aap").fetchone()[0]
    conn.close()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Appels à Projets"

    headers = [
        "Titre", "Type", "Description", "Date debut", "Date fin",
        "Critères d'eligibilite", "Cahier des charges", "Thematique",
        "URL source", "Fichiers", "Date d'ajout",
    ]
    fill   = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    font   = Font(color="FFFFFF", bold=True)
    center = Alignment(horizontal="center", vertical="center", wrap_text=True)

    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.fill = fill
        cell.font = font
        cell.alignment = center
    ws.row_dimensions[1].height = 25

    wrap = Alignment(vertical="top", wrap_text=True)
    for row_data in rows:
        # Derouler la liste de fichiers en texte lisible
        row_list = list(row_data)
        try:
            files = json.loads(row_list[9]) if row_list[9] else []
            row_list[9] = "\n".join(Path(f).name for f in files) if files else ""
        except Exception:
            row_list[9] = ""
        ws.append(row_list)
        ws.row_dimensions[ws.max_row].height = 60
        for cell in ws[ws.max_row]:
            cell.alignment = wrap

    col_widths = [50, 22, 70, 14, 14, 55, 80, 28, 55, 40, 18]
    for i, width in enumerate(col_widths, 1):
        ws.column_dimensions[ws.cell(1, i).column_letter].width = width

    wb.save(EXCEL_PATH)
    print(f"\n  -> Excel exporte : {EXCEL_PATH} ({total} entrees)")


# ─── Programme principal ──────────────────────────────────────────────────────

def main():
    now = datetime.now()
    print(f"\n{'='*60}")
    print(f"  Scraping Local AAP - {now.strftime('%d/%m/%Y %H:%M')}")
    print(f"  Site : {HTTRACK_DIR}")
    print(f"{'='*60}\n")

    PDFS_DIR.mkdir(exist_ok=True)
    init_db()

    # 1. Trouver toutes les pages AAP
    aap_pages = get_aap_links()
    if not aap_pages:
        print("[ERR] Aucune page AAP trouvee dans la liste.")
        return

    print(f"[INFO] {len(aap_pages)} pages AAP trouvees\n")

    total_ok = 0
    total_new = 0

    for i, (url, local_file) in enumerate(aap_pages, 1):
        print(f"[{i:02d}/{len(aap_pages)}] {local_file.name}")

        # 2. Lire le fichier local
        html = read_httrack_file(local_file)
        if not html:
            print("  [x] Fichier illisible\n")
            continue

        # 3. Parser HTML
        text, file_links, _ = parse_html(html)
        if len(text) < 100:
            print("  [x] Contenu trop court\n")
            continue

        # 4. Recenser les fichiers lies
        linked = collect_linked_files(file_links, url)
        copied_paths = copy_files_to_output(linked)

        if linked:
            print(f"  -> {len(linked)} fichier(s) associe(s)")

        # 5. Extraction LM Studio
        print("  -> Envoi a LM Studio...")
        data = extract_with_lm_studio(text, url, linked)

        if not data or not data.get("titre"):
            print("  [x] Aucune donnee extraite\n")
            continue

        # 6. Sauvegarde
        is_new = save_to_db(data, url, copied_paths)
        total_ok += 1
        if is_new:
            total_new += 1

        status = "✓ Nouveau" if is_new else "↺ Mis à jour"
        print(f"  {status} : {data['titre']}")
        if data.get("date_fin"):
            print(f"  -> Cloture : {data['date_fin']}")
        print()

    # 7. Export Excel
    print("Export Excel en cours...")
    export_to_excel()

    print(f"\n{'='*60}")
    print(f"  [OK] Termine - {now.strftime('%d/%m/%Y %H:%M')}")
    print(f"  -> {total_ok} AAP traites")
    print(f"  -> {total_new} nouveaux en base")
    print(f"  -> Fichiers dans : {PDFS_DIR}/")
    print(f"  -> Base          : {DB_PATH}")
    print(f"  -> Excel         : {EXCEL_PATH}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
