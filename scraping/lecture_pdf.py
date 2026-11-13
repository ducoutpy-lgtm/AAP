"""Lecture des appels publiés en PDF (changement OpenSpec lecture-pdf-appels, question 8, 2026-11-13).

Pourquoi : 575 liens d'appel des rubriques confirmées pointent vers un PDF (cahier des charges, avis d'appel) que la
collecte écartait ; dans 23 départements, l'appel de la conférence des financeurs n'existe qu'en PDF. Le texte est lu
sans navigateur (httpx) avec pypdf, bibliothèque légère en pur Python ; pas de lecture optique des PDF scannés.

Garde-fous (à valider par Monsieur DUCOUT) : 20 Mo au plus par fichier, 40 premières pages ; la borne de 80 000
caractères et le seuil de 200 caractères restent ceux de la collecte (extraction_locale.collecter).
"""
from __future__ import annotations

import io
import re

import httpx

MAX_OCTETS = 20 * 1024 * 1024
MAX_PAGES = 40
ADRESSE_PDF = re.compile(r"\.pdf($|[?&#])")


def est_adresse_pdf(href: str) -> bool:
    """L'adresse désigne-t-elle un PDF (« .pdf » en fin de chemin ou dans un paramètre) ?"""
    return bool(ADRESSE_PDF.search(href.lower()))


def est_reponse_pdf(type_contenu: str, debut: bytes) -> bool:
    """Réponse PDF d'après le type annoncé, ou d'après les premiers octets (serveurs qui annoncent octet-stream)."""
    return "application/pdf" in (type_contenu or "").lower() or debut.startswith(b"%PDF-")


def texte_pdf(donnees: bytes, max_pages: int = MAX_PAGES) -> tuple[str, int]:
    """(texte des max_pages premières pages, nombre de pages) ; ("", 0) si le fichier ne se lit pas."""
    from pypdf import PdfReader

    try:
        lecteur = PdfReader(io.BytesIO(donnees))
        if lecteur.is_encrypted:
            lecteur.decrypt("")
        pages = len(lecteur.pages)
        textes = [lecteur.pages[i].extract_text() or "" for i in range(min(pages, max_pages))]
    except Exception:  # fichier abîmé, chiffré ou non PDF : rien à lire, la collecte continue
        return "", 0
    return "\n".join(textes), pages


def telecharger_pdf(url: str, client: httpx.Client, max_octets: int = MAX_OCTETS) -> bytes | None:
    """Octets du PDF, ou None : réponse en erreur, page qui n'est pas un PDF, fichier trop gros."""
    try:
        with client.stream("GET", url) as reponse:
            if reponse.status_code != 200:
                return None
            if int(reponse.headers.get("content-length") or 0) > max_octets:
                return None
            morceaux, taille = [], 0
            for morceau in reponse.iter_bytes():
                taille += len(morceau)
                if taille > max_octets:
                    return None
                morceaux.append(morceau)
            donnees = b"".join(morceaux)
            return donnees if est_reponse_pdf(reponse.headers.get("content-type", ""), donnees[:8]) else None
    except httpx.HTTPError:
        return None
