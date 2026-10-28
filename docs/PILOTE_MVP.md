# Pilote MVP : critères de réussite et journal des dépenses

Décidé par Monsieur DUCOUT le 2026-10-28 (ARCADIA SASU). Ses mots : « tester avec un petit budget pour voir si ça
fonctionne bien ; si ça fonctionne bien, alors on déploie pour que ça scrape tous les AAP santé, mette à jour tout seul
et fasse de la qualité ; là je n'aurai pas de problème à payer des API car mon produit sera commercialisable et surtout
testable en MVP ».

## 1. Critères de réussite (proposés par la session, à valider par Monsieur DUCOUT)

Durée : du 2026-10-28 au 2026-11-11 (deux veilles du lundi : 2 et 9 novembre). Budget du pilote : 0,50 euro par semaine
de dépenses Haiku, arrêt et accord demandé avant 4,50 euros de cumul (plafond cumulé du projet : 5 euros).

| Critère | Mesure | Seuil |
|---|---|---|
| Couverture | Panel d'appels de santé repérés hors du robot (publications que Monsieur DUCOUT transmet, appels listés par un agrégateur indépendant) : part présente dans la base dans les 7 jours suivant leur publication | 80 % au moins |
| Exactitude | Tirage de 30 fiches importées pendant le pilote, comparées à leur page par la session (dont 10 relues par Monsieur DUCOUT) : titre, financeur, date limite, montant | 90 % de champs justes, aucune date inventée |
| Autonomie | Veille du lundi de bout en bout (relecture, collecte, extraction, contrôle, qualification, import en « à valider ») sans intervention | les deux lundis |
| Coût | Coût Haiku par fiche ouverte importée | 0,01 euro au plus (0,0035 le 2026-10-28) |
| Effort de relecture | Part des fiches de la file avec doublon ou financeur remplacé par le relais | moins de 10 % |

Point de départ (2026-10-28) : panel = trois appels transmis le 2026-10-27 ; deux trouvés par le robot après correction
(novap, Tubbe), un saisi à la main (Fondation Béatrice Denys, sans page web).

## 2. Après le pilote

La session chiffre le passage à l'échelle à partir des coûts mesurés : toutes les sources du registre (1 230 au
2026-10-28), veille hebdomadaire automatique, contrôle qualité ; Monsieur DUCOUT décide du budget.

## 3. Journal des dépenses (Haiku, claude-haiku-5-5)

| Date | Commande | Devis | Réel | Cumul après |
|---|---|---|---|---|
| 2026-10-28 | Avant le pilote : relais régionaux, extraction, contrôle et qualification (accord explicite) | 0,28 | 0,224 | 2,657 |
| 2026-10-28 | Qualification de 22 fiches européennes (perdue : le connecteur réécrivait son fichier, corrigé) | 0,007 | 0,006 | 2,663 |
| 2026-10-28 | Qualification de 24 fiches européennes (connecteur Funding & Tenders) | 0,007 | 0,006 | 2,669 |

Semaine du 2026-10-26 (pilote) : 0,012 euro sur 0,50.
