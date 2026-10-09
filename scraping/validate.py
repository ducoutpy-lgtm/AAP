"""Genere un rapport HTML de validation pour un fichier results/*.json.

Usage :
  python validate.py --source fondation_de_france
  # puis ouvrir : validation_reports/fondation_de_france.html

Le rapport affiche pour chaque AAP :
  - les champs extraits a gauche
  - un iframe de la page source a droite
  - des pastilles de qualite auto-calculees (champ manquant, trop court, etc.)

Objectif : Monsieur DUCOUT (ou un admin ARCADIA) relit les 13 AAP en 10 min
et detecte immediatement les problemes d extraction.
"""
from __future__ import annotations

import argparse
import html
import json
from pathlib import Path

RESULTS_DIR = Path("results")
REPORTS_DIR = Path("validation_reports")


def _badge(ok: bool, label: str, detail: str = "") -> str:
    cls = "ok" if ok else "ko"
    suffix = f" <small>{html.escape(detail)}</small>" if detail else ""
    return f'<span class="badge {cls}">{html.escape(label)}{suffix}</span>'


def _quality_checks(aap: dict) -> tuple[list[str], int]:
    """Renvoie une liste de badges HTML et un score /10."""
    badges: list[str] = []
    score = 0

    titre = aap.get("titre", "") or ""
    badges.append(_badge(len(titre) >= 10, "titre", f"{len(titre)} car."))
    score += 1 if len(titre) >= 10 else 0

    desc = aap.get("description", "") or ""
    badges.append(_badge(len(desc) >= 500, "description", f"{len(desc)} car."))
    score += 2 if len(desc) >= 2000 else (1 if len(desc) >= 500 else 0)

    date_c = aap.get("date_cloture")
    badges.append(_badge(bool(date_c), "date_cloture", date_c or "absente"))
    score += 1 if date_c else 0

    has_amount = aap.get("montant_max") or aap.get("montant_min") or aap.get("enveloppe_globale")
    badges.append(_badge(bool(has_amount), "montant", str(has_amount) if has_amount else "absent"))
    score += 1 if has_amount else 0

    elig = aap.get("eligibilite") or []
    badges.append(_badge(len(elig) >= 2, "eligibilite", f"{len(elig)} items"))
    score += 2 if len(elig) >= 3 else (1 if len(elig) >= 1 else 0)

    pieces = aap.get("pieces_attendues") or []
    badges.append(_badge(len(pieces) >= 1, "pieces", f"{len(pieces)} items"))
    score += 1 if len(pieces) >= 1 else 0

    territoire = aap.get("territoire")
    badges.append(_badge(bool(territoire), "territoire", territoire or "absent"))
    score += 1 if territoire else 0

    fichiers = aap.get("fichiers_joints") or []
    badges.append(_badge(True, "fichiers", f"{len(fichiers)} joint(s)"))
    score += 1 if len(fichiers) >= 1 else 0

    return badges, score


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="utf-8">
<title>Validation {source}</title>
<style>
  body {{ font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background:#f5f5f7; color:#222 }}
  header {{ background:#0b3d91; color:white; padding:18px 24px; position:sticky; top:0; z-index:10 }}
  header h1 {{ margin:0; font-size:20px }}
  header .meta {{ font-size:13px; opacity:0.85; margin-top:4px }}
  .toc {{ background:white; padding:12px 24px; border-bottom:1px solid #ddd; font-size:13px }}
  .toc a {{ display:inline-block; margin:2px 8px 2px 0; padding:3px 8px; background:#e8eef7; border-radius:4px; color:#0b3d91; text-decoration:none }}
  .aap {{ background:white; margin:16px 24px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.08); padding:20px; display:grid; grid-template-columns: 1fr 1fr; gap:20px }}
  .aap h2 {{ grid-column:1/3; margin:0 0 8px 0; font-size:17px; color:#0b3d91 }}
  .aap h2 .score {{ float:right; font-size:13px; padding:4px 10px; border-radius:20px }}
  .score.high {{ background:#d4edda; color:#155724 }}
  .score.mid  {{ background:#fff3cd; color:#856404 }}
  .score.low  {{ background:#f8d7da; color:#721c24 }}
  .badges {{ grid-column:1/3; margin-bottom:10px }}
  .badge {{ display:inline-block; padding:3px 8px; margin:2px; border-radius:4px; font-size:12px }}
  .badge.ok {{ background:#d4edda; color:#155724 }}
  .badge.ko {{ background:#f8d7da; color:#721c24 }}
  .badge small {{ opacity:0.75 }}
  .left dl {{ margin:0 }}
  .left dt {{ font-weight:600; color:#555; margin-top:10px; font-size:12px; text-transform:uppercase; letter-spacing:0.5px }}
  .left dd {{ margin:4px 0 0 0; white-space:pre-wrap; word-wrap:break-word; font-size:13px }}
  .left .desc {{ max-height:320px; overflow:auto; background:#fafafa; padding:10px; border-radius:4px; border:1px solid #eee }}
  .left ul {{ margin:4px 0; padding-left:20px; font-size:13px }}
  .right {{ border:1px solid #ddd; border-radius:4px; overflow:hidden; min-height:600px; position:sticky; top:80px; align-self:start; height:calc(100vh - 120px) }}
  .right iframe {{ width:100%; height:100%; border:0 }}
  .right .url {{ padding:6px 10px; background:#f0f0f0; font-size:12px; word-break:break-all }}
  .right .url a {{ color:#0b3d91 }}
  .files a {{ display:block; font-size:12px; color:#0b3d91; text-decoration:none; margin:2px 0 }}
</style></head>
<body>
<header>
  <h1>Validation scraping : {source}</h1>
  <div class="meta">{n_aap} AAP extraits &middot; moyenne qualite : {avg_score}/10</div>
</header>
<div class="toc">
  <strong>Navigation :</strong>
  {toc}
</div>
{body}
</body></html>
"""


def render(source: str) -> Path:
    src_file = RESULTS_DIR / f"{source}.json"
    if not src_file.exists():
        raise SystemExit(f"Fichier introuvable : {src_file}")

    data: list[dict] = json.loads(src_file.read_text(encoding="utf-8"))
    REPORTS_DIR.mkdir(exist_ok=True)

    cards: list[str] = []
    toc: list[str] = []
    total_score = 0

    for i, aap in enumerate(data, start=1):
        badges, score = _quality_checks(aap)
        total_score += score
        score_cls = "high" if score >= 8 else ("mid" if score >= 5 else "low")

        titre = html.escape(aap.get("titre", "(sans titre)"))
        short_titre = titre[:70] + ("..." if len(titre) > 70 else "")
        toc.append(f'<a href="#aap-{i}">{i}. {short_titre} ({score}/10)</a>')

        desc = html.escape(aap.get("description", "") or "")
        url_source = aap.get("url_source", "")

        elig_html = "".join(f"<li>{html.escape(e)}</li>" for e in (aap.get("eligibilite") or []))
        pieces_html = "".join(f"<li>{html.escape(p)}</li>" for p in (aap.get("pieces_attendues") or []))
        cats_html = ", ".join(html.escape(c) for c in (aap.get("categories_etablissement") or [])) or "<em>aucune</em>"

        files_html = "".join(
            f'<a href="{html.escape(f.get("url",""))}" target="_blank">{html.escape(f.get("filename",""))}</a>'
            for f in (aap.get("fichiers_joints") or [])
        ) or "<em>aucun</em>"

        card = f"""
<div class="aap" id="aap-{i}">
  <h2>{i}. {titre}<span class="score {score_cls}">{score}/10</span></h2>
  <div class="badges">{' '.join(badges)}</div>
  <div class="left">
    <dl>
      <dt>Financeur</dt><dd>{html.escape(aap.get('financeur',''))}</dd>
      <dt>Dates</dt><dd>Ouverture : {aap.get('date_ouverture') or '—'} &nbsp;|&nbsp; Cloture : <strong>{aap.get('date_cloture') or '—'}</strong></dd>
      <dt>Montants</dt><dd>Min : {aap.get('montant_min') or '—'} &nbsp;|&nbsp; Max : {aap.get('montant_max') or '—'} &nbsp;|&nbsp; Enveloppe : {html.escape(str(aap.get('enveloppe_globale') or '—'))}</dd>
      <dt>Territoire</dt><dd>{html.escape(str(aap.get('territoire') or '—'))}</dd>
      <dt>Categories etablissement</dt><dd>{cats_html}</dd>
      <dt>Eligibilite ({len(aap.get('eligibilite') or [])})</dt><dd><ul>{elig_html or '<em>vide</em>'}</ul></dd>
      <dt>Pieces attendues ({len(aap.get('pieces_attendues') or [])})</dt><dd><ul>{pieces_html or '<em>vide</em>'}</ul></dd>
      <dt>Fichiers joints</dt><dd class="files">{files_html}</dd>
      <dt>Description ({len(aap.get('description') or '')} car.)</dt><dd class="desc">{desc}</dd>
    </dl>
  </div>
  <div class="right">
    <div class="url"><strong>Page source :</strong> <a href="{html.escape(url_source)}" target="_blank">{html.escape(url_source)}</a></div>
    <iframe src="{html.escape(url_source)}" loading="lazy" sandbox="allow-same-origin allow-scripts"></iframe>
  </div>
</div>
"""
        cards.append(card)

    avg = round(total_score / max(len(data), 1), 1)
    out = HTML_TEMPLATE.format(
        source=source,
        n_aap=len(data),
        avg_score=avg,
        toc="".join(toc),
        body="".join(cards),
    )
    target = REPORTS_DIR / f"{source}.html"
    target.write_text(out, encoding="utf-8")
    return target


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    args = ap.parse_args()
    path = render(args.source)
    print(f"Rapport genere : {path.resolve()}")
    print(f"Ouvrir : file:///{path.resolve().as_posix()}")


if __name__ == "__main__":
    main()
