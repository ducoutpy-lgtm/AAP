"""Filtres déterministes appliqués avant le modèle (changement selection-des-appels, 2026-11-26).

Pourquoi des règles fixes plutôt que le modèle : une page anti-robot porte le titre et la date de l'appel, et le modèle
en tirait une fiche vide (Grand Est) ; une consultation de marché public ressemble à un appel à manifestation d'intérêt
(Métropole Aix-Marseille, « 24 avenue du Prado »). Ces cas se reconnaissent à des phrases précises, sans coût.

    page_bloquee(texte)         -> « page anti-robot », « accès refusé » ou None
    marche_public(url, texte)   -> motif ou None
    fiche_a_exclure(url, desc)  -> « page bloquée », « marché public » ou None (import)
"""
from __future__ import annotations

import re
import unicodedata
from urllib.parse import urlparse


def normaliser(texte: str) -> str:
    """Minuscules sans accents, apostrophes droites, espaces simples : « N’êtes » et « n'etes » se comparent."""
    # Apostrophes redressées AVANT le passage en ASCII, qui les effacerait (contre-vérification du 2026-11-26)
    droites = (texte or "").replace("’", "'").replace("‘", "'").replace("ʼ", "'")
    sans = unicodedata.normalize("NFKD", droites).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", sans.lower())


# Phrases relevées dans les 25 textes bloqués du 2026-11-26 (écran du Grand Est, de la Corse, d'Atlanpole ; pages
# « Accès refusé » de la Lozère, de Bordeaux et de la préfecture de Côte-d'Or). Le simple mot « CAPTCHA » n'en fait pas
# partie : il figure au pied des formulaires de vraies pages ; « pas un robot » non plus (bandeau des cookies de Health
# Data Hub, case « Je ne suis pas un robot » d'un formulaire du Gers : faux positifs de l'essai à blanc du 2026-11-26).
# Écran d'attente de Cloudflare (« Just a moment... Verifying you are human ») : il peut se lever seul.
ANTI_ROBOT = ("pas un bot", "bots malveillants", "verification de securite en cours", "verifying you are human",
              "checking if the site connection is secure")
# Blocage ferme, qui ne se lève pas en attendant : dont l'écran Cloudflare « Sorry, you have been blocked » (37 textes de
# La Réunion, du ministère de l'Enseignement supérieur et de la Somme, contre-vérification du 2026-11-26).
ACCES_REFUSE = ("vous n'etes pas autorise(e) a acceder a cette page", "vous n'etes pas autorise a acceder a cette page",
                "vous n'avez pas acces a cette page", "vous n'avez pas le droit d'acceder a cette zone",
                "you have been blocked", "cloudflare ray id")
# Paraphrases du modèle dans les descriptions déjà produites (« un écran de vérification de sécurité (protection
# anti-bots) », « Page bloquée par Cloudflare ») : lues seulement à l'import, sur la description d'une fiche.
DESCRIPTION_BLOQUEE = ANTI_ROBOT + ACCES_REFUSE + ("anti-bot", "ecran de verification de securite", "cloudflare")


def page_bloquee(texte: str) -> str | None:
    t = normaliser(texte)
    if any(m in t for m in ANTI_ROBOT):
        return "page anti-robot"
    if any(m in t for m in ACCES_REFUSE):
        return "accès refusé"
    return None


# Plateformes d'achat public (profils d'acheteur) : morceaux du nom d'hôte. « demarches. » n'en est pas un.
PLATEFORMES = ("marchespublics.", "marches-publics.", "achatpublic.", "marches-securises.", "maximilien.fr", "boamp.fr")
# Marques d'une consultation ; deux distinctes sont exigées, car un vrai appel peut citer un « règlement de consultation ».
MARQUES_CONSULTATION = (
    ("remise des plis",),
    ("reglement de consultation", "reglement de la consultation"),
    ("dossier de consultation des entreprises",),
    ("pouvoir adjudicateur",),
    ("telecharger le rc",),
    ("acceder a la consultation",),
)


def plateforme_d_achat(url: str) -> bool:
    hote = (urlparse(url or "").hostname or "").lower()
    return any(p in hote for p in PLATEFORMES)


def marche_public(url: str, texte: str) -> str | None:
    if plateforme_d_achat(url):
        return "marché public (plateforme d'achat public)"
    t = normaliser(texte)
    # Un appel à projets du code de l'action sociale peut passer par le profil d'acheteur et en reprendre le vocabulaire
    # (Mayenne) : un texte qui s'annonce appel à projets ou à candidatures dès ses premières lignes n'est pas jugé ici.
    if re.search(r"appels? a (projets?|candidatures?)", normaliser((texte or "")[:500])):
        return None
    marques = sum(1 for variantes in MARQUES_CONSULTATION if any(v in t for v in variantes))
    marques += bool(re.search(r"\bmapa\b", t))  # marché à procédure adaptée
    return "marché public (consultation)" if marques >= 2 else None


def fiche_a_exclure(url: str, description: str) -> str | None:
    """Motif pour lequel l'import n'écrit pas une fiche déjà produite, ou None."""
    if plateforme_d_achat(url):
        return "marché public"
    t = normaliser(description)
    if any(m in t for m in DESCRIPTION_BLOQUEE):
        return "page bloquée"
    return None
