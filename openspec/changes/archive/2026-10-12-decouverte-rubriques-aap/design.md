# Design

## Context

Voir proposal.md. Les connecteurs existants utilisent Playwright avec les helpers de
`scraping/utils.py` (User-Agent navigateur, locale fr, bannière cookies). Les sites des ARS,
d'ameli et des préfectures refusent les requêtes simples mais acceptent un navigateur. Le registre
contient 847 sources dont 657 pages vérifiées.

```mermaid
flowchart LR
    R[(registre.json)] --> D[decouverte.py<br/>navigateur piloté]
    D -->|liens évoquant un AAP| C[pages candidates<br/>(3 max par site)]
    C -->|page la plus riche en liens d'AAP| P[decouverte/id/rubrique.html + liens.json]
    D --> J[(decouverte/resultats.json)]
    J -->|--rapport| M[DECOUVERTE.md]
    P -.->|changement suivant| X[extraction des AAP]
```

## Goals / Non-Goals

**Goals :** un seul robot pour toutes les sources ; mesurer honnêtement ce qu'il trouve ;
pages gardées en local pour l'extraction, comme le proposait Monsieur DUCOUT.
**Non-Goals :** pagination des listings, téléchargement des fiches d'AAP elles-mêmes, extraction.

## Decisions

### Décision 1 : repérage par mots-clés sur le texte et l'adresse des liens, sans IA

Un lien est noté selon les expressions qu'il contient (« appel à projets », « appel à
candidatures », « manifestation d'intérêt », « AMI », « AAP », « subvention », « financement »),
après suppression des accents. Une page est jugée « rubrique » par le nombre de liens bien notés
qu'elle contient. Simple, gratuit, et suffisant pour un premier tri ; l'IA n'est réservée qu'à
l'extraction.

### Décision 2 : navigateur piloté plutôt que requêtes HTTP

Seule façon de passer les sites qui bloquent les robots (ARS, ameli, préfectures). Images, polices
et vidéos bloquées pour aller vite. Un contexte neuf par source (cookies isolés).

### Décision 3 : trois candidats au plus, même site seulement

Limite l'exploration à quatre pages par source (accueil + 3) : 847 sources tiennent en une à deux
heures avec 4 pages en parallèle et un délai d'une seconde entre deux chargements d'un même site.

### Décision 4 : résultats dans un fichier à part, registre inchangé

`resultats.json` porte le statut, l'adresse de la rubrique et le nombre de liens ; le registre
garde son format vérifié par la spec. Le rapport croise les deux fichiers.

### Décision 5 : reprise par identifiant

Une source déjà présente dans `resultats.json` est ignorée sauf `--forcer` ; les interruptions
(coupure, timeout global) ne font rien perdre.

## Risks / Trade-offs

- [Faux positifs : une page « actualités » pleine de liens vers des AAP] → c'est acceptable, elle
  sert de listing ; la pagination sera traitée par le changement d'extraction.
- [Sites en JavaScript lourd ou avec consentement cookies bloquant] → helper `accept_cookies`,
  attente `networkidle` bornée ; statut « erreur » sinon.
- [Rubrique derrière un moteur de recherche interne] → non trouvée ; noté dans le rapport pour
  traitement manuel.
