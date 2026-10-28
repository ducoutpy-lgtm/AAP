# Design

## Constat (2026-10-28)

Première découverte des 18 pages : 14 retenues, mais plusieurs relais avec un seul lien alors qu'ils listent bien plus
d'appels (Kozh Ensemble : 32 liens dans le contenu, dont 22 vers d'autres sites ; Atlanpole régionaux : 39, dont 32).
Cause : `decouverte.liens_aap` et `liens_contenu` ne gardent que les liens du même site (`meme_site`), règle qui écarte
menus, partenaires et réseaux sociaux. Un relais renvoie justement vers la page du financeur.

## Décisions

1. **Champ explicite `relais: true`** au registre, plutôt qu'une règle générale pour toute page validée. Pourquoi : sur
   une page de liste d'ARS, des liens vers d'autres sites (partenaires, ministère) ajouteraient des textes à extraire,
   donc du coût, sans gain ; le relais est un choix humain, comme `page_appel`.
2. **Même notation** : un lien hors site n'est gardé que s'il est noté comme un appel (`score_lien` au moins 3) ou, sur
   une page dont l'adresse est une rubrique d'appels, s'il est dans le contenu principal avec un texte d'au moins douze
   caractères. Les fichiers (PDF) restent écartés plus loin par la collecte (`extraction_locale.liens_web`).
3. **La veille relit le réglage** dans `liens.json` (`hors_site`), comme `seuil` et `page_appel`.
4. Gain secondaire : la fiche est extraite depuis la page du financeur, avec son nom et son lien officiel, et non depuis
   le résumé du relais (cas I3-2026-INV2a du 2026-10-27).

## Risques

- Un relais peut pointer vers des pages générales (« Nos aides ») : la question fermée de l'extraction les refuse ; le
  devis compte ces textes avant toute dépense.
- Une même page de financeur relayée par plusieurs sources n'est collectée et extraite qu'une fois (adresse unique dans
  `extraction_locale.liens_par_source`).
