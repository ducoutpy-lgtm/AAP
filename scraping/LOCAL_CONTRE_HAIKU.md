# Contrôle et qualification : modèle local contre Haiku

Changement `lecture-pdf-locale`, tâche 2.1 (voie A « tout local », choisie par Monsieur DUCOUT le 2026-11-19). Mesure du
2026-11-19, de 12 h 13 à 12 h 42, zéro euro.

## Méthode

20 fiches tirées (graine 20261119) parmi les 442 de `results/extraction_api.json` déjà contrôlées et qualifiées par
`claude-haiku-5-5` ; leurs verdicts sont retirés dans une copie de travail, puis `verification.py --moteur ollama` et
`qualifier_fiches.py --moteur ollama` (modèle `qwen3:8b`) les refont. Les outils en retiennent 14 (les autres ne sont
plus à traiter, par exemple closes) ; le contrôle local a abouti pour 13, la qualification pour 14. Les vrais fichiers
de résultats ne sont pas touchés.

## Résultats

| Point comparé | Accord | Lecture |
|---|---|---|
| Contrôle : la page est-elle un appel ? | 13 / 13 | Identique |
| Contrôle : au moins un doute (hors description) | 8 / 13 | Le local signale 5 doutes que Haiku n'avait pas ; il ne manque aucun doute de Haiku (0 / 13) |
| Qualification : type d'appel | 14 / 14 | Identique |
| Qualification : champ (santé, médico-social, hors champ) | 10 / 14 | 4 écarts |
| Qualification : destinataires | 4 / 14 | Les deux qualifient largement, mais différemment (le local répond souvent « toute structure ») |
| Qualification : objets financés | 2 / 14 | Désaccord presque complet |
| Durée moyenne | 45 s par contrôle, 41 s par qualification | Environ 1 min 30 par fiche, contre quelques secondes pour Haiku |

## Ce que cela veut dire

- Le contrôle local peut servir au tri automatique : il ne laisse passer aucun doute relevé par Haiku. Il est plus
  prudent, donc il enverra davantage de fiches dans la file de Monsieur DUCOUT (ici 5 sur 13 de plus), jamais moins.
- La qualification locale n'améliore pas les recommandations (question 29 (b)) : destinataires et objets restent
  larges et ne concordent pas avec ceux de Haiku. Requalifier les fiches en local ne réglerait pas le problème mesuré par
  le tirage du 2026-11-19 ; il faudrait d'abord resserrer la consigne de qualification, puis mesurer de nouveau.
- Pour 400 PDF, compter environ 10 heures de carte graphique pour le contrôle et la qualification, en plus de
  l'extraction (environ 5 heures, estimation d'octobre) : une à deux nuits.

Échantillon de 14 fiches : ces chiffres sont indicatifs, pas une mesure précise.
