"""Extraction structuree d un AAP via Claude (tool use).

On envoie le texte d une fiche AAP a Claude, on lui impose un schema d outil
qui garantit un JSON valide. C est la brique qui remplace la logique fragile
de parsers HTML specifiques a chaque source.

Lot 0 (rapport du 2026-10-14, instruction 17) : le modele est un parametre des fonctions (defaut MODEL), les
tarifs forment une table par modele (le journal des couts reste exact quel que soit le modele), et une question
fermee « est-ce la fiche d un appel ? » (est_un_aap) permet la mesure sur l echantillon avec le meme protocole que
le modele local. Un modele sans tarif connu est refuse avant tout appel.
"""
from __future__ import annotations

import os
import time
from pathlib import Path

from anthropic import Anthropic, APIStatusError, APIConnectionError, RateLimitError

from utils import append_jsonl, utc_now_iso

# Modele surchargable via env pour faciliter les tests de regression.
MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# Tarifs publics (USD / million de tokens), a reverifier a chaque facturation. Sonnet 4.6 : modele des connecteurs.
# Haiku 5.5 et Sonnet 5.5 : candidats de la mesure sur l echantillon, prix lus le 2026-10-14 sur
# platform.claude.com/docs/en/about-claude/pricing (Haiku 5.5 : tarif des requetes de 100 000 tokens au plus,
# jamais depasse ici puisque le texte est borne a MAX_TEXT_CHARS).
TARIFS_USD_PAR_MTOK = {
    "claude-sonnet-4-6": {"entree": 3.0, "sortie": 15.0, "cache_ecriture": 3.75, "cache_lecture": 0.30},
    "claude-sonnet-5-5": {"entree": 2.0, "sortie": 10.0, "cache_ecriture": 2.50, "cache_lecture": 0.10},
    "claude-haiku-5-5": {"entree": 0.10, "sortie": 0.50, "cache_ecriture": 0.125, "cache_lecture": 0.01},
}
# Anciens noms (Sonnet 4.x) conserves pour la documentation et les estimations.
PRICE_INPUT_USD_PER_MTOK = TARIFS_USD_PAR_MTOK["claude-sonnet-4-6"]["entree"]
PRICE_OUTPUT_USD_PER_MTOK = TARIFS_USD_PAR_MTOK["claude-sonnet-4-6"]["sortie"]
PRICE_CACHE_WRITE_USD_PER_MTOK = TARIFS_USD_PAR_MTOK["claude-sonnet-4-6"]["cache_ecriture"]
PRICE_CACHE_READ_USD_PER_MTOK = TARIFS_USD_PAR_MTOK["claude-sonnet-4-6"]["cache_lecture"]
EURO_PAR_DOLLAR = 0.92  # taux arrondi du journal des couts (cost_eur_approx)

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


def cout_usd(model: str, input_tokens: int, output_tokens: int, cache_write: int = 0, cache_read: int = 0) -> float:
    """Cout d un appel aux tarifs du modele (fonction pure). Modele sans tarif : erreur, avant tout appel."""
    if model not in TARIFS_USD_PAR_MTOK:
        raise ValueError(f"tarif inconnu pour le modele {model} : l ajouter a TARIFS_USD_PAR_MTOK (extractor.py) avant tout appel")
    t = TARIFS_USD_PAR_MTOK[model]
    return (input_tokens * t["entree"] + output_tokens * t["sortie"]
            + cache_write * t["cache_ecriture"] + cache_read * t["cache_lecture"]) / 1_000_000


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

# Question fermee posee avant l extraction par le moteur api de l echantillon : meme forme que pour le modele local
# (echantillon.py, CONSIGNE_EST_AAP, passee en consigne systeme), pour que la comparaison des moteurs soit loyale.
EST_AAP_TOOL = {
    "name": "est_aap",
    "description": "Dit si le texte est la fiche d un appel a projets precis auquel on peut candidater.",
    "input_schema": {
        "type": "object",
        "properties": {
            "est_aap": {"type": "boolean", "description": "true si la page est la fiche d UN appel precis"},
            "raison": {"type": "string", "description": "Une phrase en francais"},
        },
        "required": ["est_aap", "raison"],
    },
}

# Question fermee du champ (filtre-champ-sante) : meme consigne que le modele local (echantillon.CONSIGNE_CHAMP).
CHAMP_TOOL = {
    "name": "champ",
    "description": "Dit de quel champ releve l appel : sante, medico-social, hors-champ ou incertain.",
    "input_schema": {
        "type": "object",
        "properties": {
            "champ": {"type": "string", "enum": ["sante", "medico-social", "hors-champ", "incertain"]},
            "raison": {"type": "string", "description": "Une phrase en francais"},
        },
        "required": ["champ", "raison"],
    },
}


SYSTEM_PROMPT = (
    "Tu es un extracteur de donnees d appels a projets (AAP) pour le secteur "
    "sante et medico-social francais. Tu n inventes aucune donnee : si une "
    "information n est pas ecrite sur la page, tu retournes null ou liste vide. "
    "Tu conserves le texte de description dans son integralite, sans paraphrase "
    "ni resume."
)


def _appeler(model: str, system_text: str, tool: dict, user_content: str, max_tokens: int,
             source: str, url: str, etape: str) -> dict:
    """Un appel qui force l outil donne, avec reprise sur erreurs transitoires et une ligne dans le journal des couts.

    Le tarif du modele est verifie avant l appel : un modele inconnu n est jamais facture a l aveugle.
    """
    cout_usd(model, 0, 0)
    client = _get_client()

    # Retry avec backoff exponentiel sur erreurs transitoires
    # (529 overloaded, 429 rate limit, erreurs reseau)
    resp = None
    last_err: Exception | None = None
    for attempt in range(4):
        try:
            # cache_control sur le dernier tool : le schema sera mis en cache pour les appels suivants du meme run.
            cached_tool = {**tool, "cache_control": {"type": "ephemeral"}}
            resp = client.messages.create(
                model=model,
                max_tokens=max_tokens,
                system=[
                    {
                        "type": "text",
                        "text": system_text,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                tools=[cached_tool],
                tool_choice={"type": "tool", "name": tool["name"]},
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
    cost = cout_usd(model, in_tok, out_tok, cache_write, cache_read)

    append_jsonl(COST_LOG_FILE, {
        "timestamp": utc_now_iso(),
        "source": source,
        "url": url,
        "model": model,
        "etape": etape,
        "input_tokens": in_tok,
        "output_tokens": out_tok,
        "cache_creation_tokens": cache_write,
        "cache_read_tokens": cache_read,
        "cost_usd": round(cost, 6),
        "cost_eur_approx": round(cost * EURO_PAR_DOLLAR, 6),
    })

    for block in resp.content:
        if block.type == "tool_use" and block.name == tool["name"]:
            return dict(block.input)

    raise RuntimeError(f"Claude n a pas produit d appel a l outil {tool['name']}.")


def extract_aap(
    text: str,
    url: str,
    financeur_hint: str = "",
    source: str = "",
    model: str | None = None,
) -> dict:
    """Appelle Claude pour extraire un AAP a partir du texte d une page.

    Retourne le dict conforme au schema EXTRACTION_TOOL (sans url_source ni fichiers).
    Leve une RuntimeError si aucune extraction n a pu etre produite.
    Effet de bord : log une ligne JSONL dans logs/extraction_costs.jsonl
    avec les tokens consommes et le cout estime aux tarifs du modele (MODEL par defaut).
    """
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
    return _appeler(model or MODEL, SYSTEM_PROMPT, EXTRACTION_TOOL, user_content, 8192, source, url, "extraction")


def est_un_aap(text: str, url: str, consigne: str, source: str = "", model: str | None = None) -> dict:
    """Question fermee « est-ce la fiche d un appel a projets ? » : {est_aap: bool, raison: str}.

    consigne : la consigne systeme (CONSIGNE_EST_AAP de echantillon.py), identique a celle du modele local.
    """
    user_content = (
        f"URL source : {url}\n\n"
        f"Texte de la page :\n"
        f"-----\n"
        f"{text[:MAX_TEXT_CHARS]}\n"
        f"-----\n\n"
        f"Reponds en appelant l outil est_aap."
    )
    return _appeler(model or MODEL, consigne, EST_AAP_TOOL, user_content, 1024, source, url, "est_aap")


def champ_aap(text: str, url: str, consigne: str, source: str = "", model: str | None = None) -> dict:
    """Question fermee « de quel champ releve cet appel ? » : {champ: str, raison: str} (filtre-champ-sante).

    consigne : CONSIGNE_CHAMP de echantillon.py, identique a celle du modele local.
    """
    user_content = (
        f"URL source : {url}\n\n"
        f"Texte de la page :\n"
        f"-----\n"
        f"{text[:MAX_TEXT_CHARS]}\n"
        f"-----\n\n"
        f"Reponds en appelant l outil champ."
    )
    return _appeler(model or MODEL, consigne, CHAMP_TOOL, user_content, 1024, source, url, "champ")
