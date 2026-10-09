"""Extraction structuree d un AAP via Claude (tool use).

On envoie le texte d une fiche AAP a Claude, on lui impose un schema d outil
qui garantit un JSON valide. C est la brique qui remplace la logique fragile
de parsers HTML specifiques a chaque source.
"""
from __future__ import annotations

import os
import time
from pathlib import Path

from anthropic import Anthropic, APIStatusError, APIConnectionError, RateLimitError

from utils import append_jsonl, utc_now_iso

# Modele surchargable via env pour faciliter les tests de regression.
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# Tarifs publics Sonnet 4.x (USD / million de tokens) - a reverifier a chaque facturation.
PRICE_INPUT_USD_PER_MTOK = 3.0
PRICE_OUTPUT_USD_PER_MTOK = 15.0
PRICE_CACHE_WRITE_USD_PER_MTOK = 3.75
PRICE_CACHE_READ_USD_PER_MTOK = 0.30

# Limite de contexte envoye a Claude (protection cout + context window).
MAX_TEXT_CHARS = 80_000

COST_LOG_FILE = Path("logs") / "extraction_costs.jsonl"

_client: Anthropic | None = None


def _get_client() -> Anthropic:
    global _client
    if _client is None:
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise RuntimeError(
                "ANTHROPIC_API_KEY manquante. Copier .env.example en .env et renseigner la cle."
            )
        _client = Anthropic()
    return _client


EXTRACTION_TOOL = {
    "name": "extract_aap",
    "description": (
        "Extrait les informations structurees d un appel a projets francais "
        "(sante / medico-social) depuis le contenu texte d une page web."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "titre": {"type": "string", "description": "Titre complet de l AAP"},
            "financeur": {"type": "string", "description": "Organisme qui emet l AAP"},
            "description": {
                "type": "string",
                "description": (
                    "Texte descriptif complet et detaille. NE PAS tronquer, "
                    "inclure tout le contenu pertinent : contexte, objectifs, "
                    "modalites, process de candidature."
                ),
            },
            "date_ouverture": {
                "type": ["string", "null"],
                "description": "Date d ouverture des candidatures, format YYYY-MM-DD, sinon null",
            },
            "date_cloture": {
                "type": ["string", "null"],
                "description": "Date limite de depot, format YYYY-MM-DD, sinon null",
            },
            "montant_min": {"type": ["integer", "null"], "description": "Montant min par projet en euros"},
            "montant_max": {"type": ["integer", "null"], "description": "Montant max par projet en euros"},
            "enveloppe_globale": {
                "type": ["string", "null"],
                "description": "Enveloppe totale de l AAP (texte libre, ex: '12 millions d euros')",
            },
            "eligibilite": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Liste des criteres d eligibilite (1 critere par item)",
            },
            "pieces_attendues": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Liste des pieces a fournir dans le dossier de candidature",
            },
            "territoire": {
                "type": ["string", "null"],
                "description": "Territoire concerne (region, departement, national, etc.)",
            },
            "categories_etablissement": {
                "type": "array",
                "items": {"type": "string"},
                "description": (
                    "Categories d etablissements eligibles parmi : "
                    "MCO, SSR, EHPAD, SSIAD, HAD, IME, autre. Liste vide si non precise."
                ),
            },
        },
        "required": ["titre", "financeur", "description"],
    },
}


SYSTEM_PROMPT = (
    "Tu es un extracteur de donnees d appels a projets (AAP) pour le secteur "
    "sante et medico-social francais. Tu n inventes aucune donnee : si une "
    "information n est pas ecrite sur la page, tu retournes null ou liste vide. "
    "Tu conserves le texte de description dans son integralite, sans paraphrase "
    "ni resume."
)


def extract_aap(
    text: str,
    url: str,
    financeur_hint: str = "",
    source: str = "",
) -> dict:
    """Appelle Claude pour extraire un AAP a partir du texte d une page.

    Retourne le dict conforme au schema EXTRACTION_TOOL (sans url_source ni fichiers).
    Leve une RuntimeError si aucune extraction n a pu etre produite.
    Effet de bord : log une ligne JSONL dans logs/extraction_costs.jsonl
    avec les tokens consommes et le cout estime.
    """
    client = _get_client()

    if len(text) > MAX_TEXT_CHARS:
        print(f"  [warn] texte tronque de {len(text)} a {MAX_TEXT_CHARS} chars")
    user_content = (
        f"URL source : {url}\n"
        f"Financeur probable : {financeur_hint or 'a determiner'}\n\n"
        f"Contenu de la page :\n"
        f"-----\n"
        f"{text[:MAX_TEXT_CHARS]}\n"
        f"-----\n\n"
        f"Extrait les informations de l AAP en appelant l outil extract_aap."
    )

    # Retry avec backoff exponentiel sur erreurs transitoires
    # (529 overloaded, 429 rate limit, erreurs reseau)
    resp = None
    last_err: Exception | None = None
    for attempt in range(4):
        try:
            # cache_control sur le dernier tool : le schema (~600 tokens) sera
            # mis en cache pour les appels suivants du meme run.
            cached_tool = {**EXTRACTION_TOOL, "cache_control": {"type": "ephemeral"}}
            resp = client.messages.create(
                model=MODEL,
                max_tokens=8192,
                system=[
                    {
                        "type": "text",
                        "text": SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                tools=[cached_tool],
                tool_choice={"type": "tool", "name": "extract_aap"},
                messages=[{"role": "user", "content": user_content}],
            )
            break
        except (APIStatusError, APIConnectionError, RateLimitError) as e:
            last_err = e
            status = getattr(e, "status_code", None)
            transient = (
                status in (429, 529)
                or (status is not None and 500 <= status < 600)
                or isinstance(e, APIConnectionError)
            )
            if not transient:
                print(f"  [api error non-retriable] {type(e).__name__} status={status}: {e}")
                raise
            wait = 2 ** attempt * 3  # 3, 6, 12, 24 s
            print(f"  [retry] tentative {attempt + 1}/4 dans {wait}s (status={status})")
            time.sleep(wait)
    if resp is None:
        raise RuntimeError(f"Echec apres 4 tentatives : {last_err}")

    # --- Logging cout ---
    usage = resp.usage
    in_tok = getattr(usage, "input_tokens", 0) or 0
    out_tok = getattr(usage, "output_tokens", 0) or 0
    cache_write = getattr(usage, "cache_creation_input_tokens", 0) or 0
    cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0

    cost_usd = (
        in_tok * PRICE_INPUT_USD_PER_MTOK
        + out_tok * PRICE_OUTPUT_USD_PER_MTOK
        + cache_write * PRICE_CACHE_WRITE_USD_PER_MTOK
        + cache_read * PRICE_CACHE_READ_USD_PER_MTOK
    ) / 1_000_000

    append_jsonl(COST_LOG_FILE, {
        "timestamp": utc_now_iso(),
        "source": source,
        "url": url,
        "model": MODEL,
        "input_tokens": in_tok,
        "output_tokens": out_tok,
        "cache_creation_tokens": cache_write,
        "cache_read_tokens": cache_read,
        "cost_usd": round(cost_usd, 6),
        "cost_eur_approx": round(cost_usd * 0.92, 6),
    })

    for block in resp.content:
        if block.type == "tool_use" and block.name == "extract_aap":
            return dict(block.input)

    raise RuntimeError("Claude n a pas produit d appel a l outil extract_aap.")
