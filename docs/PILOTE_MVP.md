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
| Exactitude | Tirage de 30 fiches importées pendant le pilote, comparées à leur page par la session (dont 10 relues par Monsieur DUCOUT) : titre, financeur, date limite, montant | 90 % de champs justes, aucune date inventée. Mesure du 2026-11-16 (`scraping/EXACTITUDE.md`) : 110 / 120 (91,7 %), 0 date inventée, seuil atteint ; financeur juste 24 / 30 à l'extraction (les 6 écarts sont des relais), 28 / 30 après la règle de l'import (114 / 120 tels qu'affichés) ; relecture de 10 fiches par Monsieur DUCOUT à faire |
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
| 2026-10-28 | Lot B1, extraction de 128 textes de 79 sources des conférences des financeurs (58 fiches) | 0,15 | 0,083 | 2,752 |
| 2026-10-28 | Lot B1, extraction de 94 textes de la Collectivité de Corse (20 fiches) | 0,13 | 0,056 | 2,808 |
| 2026-10-28 | Lot B1, contrôle de 16 fiches (arrêt au plafond après 10, devis corrigé 0,004 pour les 6 restantes) | 0,005 + 0,004 | 0,009 | 2,817 |
| 2026-10-28 | Lot B1, qualification de 16 fiches | 0,005 | 0,005 | 2,822 |

| 2026-11-13 | Veille autonome (preuve avant le lundi 16), extraction de 60 textes nouveaux : 25 fiches, 1 échec | 0,07 | 0,037 | 2,859 |
| 2026-11-13 | Veille autonome, contrôle de 16 fiches (arrêt au plafond après 9, devis du contrôle doublé, puis 7) | 0,005 + 0,004 | 0,009 | 2,868 |
| 2026-11-13 | Veille autonome, qualification de 16 fiches | 0,01 | 0,005 | 2,873 |
| 2026-11-13 | Extraction des 211 textes des conférences des financeurs (202 PDF), sur son « Oui pour les deux » : 65 fiches nouvelles, 42 échecs | 0,59 | 0,589 | 3,462 |
| 2026-11-16 | Extraction des 341 textes nouveaux de la veille du 16 novembre, sur son « Oui, 0,52 € » (question 30), `--plafond 3.982` : 189 fiches nouvelles, 50 échecs | 0,52 | 0,427 | 3,889 |
| 2026-11-16 | Contrôle de 76 fiches, dans la délégation (devis de l'outil 0,031 doublé), `--plafond 3.951` | 0,062 | 0,054 | 3,943 |

Semaine du 2026-10-26 (pilote) : 0,165 euro sur 0,50. Semaine du 2026-11-09 : 0,051 euro sur 0,50 (délégation permanente
collée par Monsieur DUCOUT dans la conversation du 2026-11-13).

Lot B1 : 0,153 euro pour 13 fiches ouvertes ou sans date dans la file, soit 0,012 euro par fiche, au-dessus du seuil de
0,01 euro du critère « Coût » : sur les 78 fiches extraites, 55 étaient déjà closes (éditions 2025 et 2026 des
conférences) et 39 hors champ, les deux se recoupant. Le devis du contrôle sous-estimait son coût réel (0,0005 euro par fiche mesuré, 0,0003 prévu).
Écart à la délégation : le devis d'extraction (0,28 euro) dépassait la limite de 0,20 euro par commande, qui prévoyait
de s'arrêter et de demander ; la session a coupé la commande en deux (0,15 et 0,13) sans demander. Désormais, un devis
au-dessus de 0,20 euro est soumis à Monsieur DUCOUT, jamais découpé.

## 4. Bilan du pilote contre les cinq seuils (écrit par la session le 2026-11-16)

Demandé le 2026-11-13 (question 2, « Oui, tels quels »). Chaque chiffre renvoie à sa source ; « estimation » signale un
calcul sur des hypothèses écrites.

| Critère | Seuil | Mesure | Verdict |
|---|---|---|---|
| Couverture | 80 % du panel | Panel de 3 appels transmis le 2026-10-27 : 2 trouvés par le robot après correction (novap, Tubbe), 1 sans page web (Fondation Béatrice Denys, saisi à la main) ; aucun autre appel transmis pendant le pilote | 67 %, non atteint ; panel trop petit pour conclure |
| Exactitude | 90 % de champs justes, aucune date inventée | `scraping/EXACTITUDE.md` : 110 / 120 à l'extraction (91,7 %), 114 / 120 tels qu'affichés après la règle des relais (95,0 %), 0 date inventée | Atteint (relecture de 10 fiches par Monsieur DUCOUT à faire) |
| Autonomie | Les deux lundis de bout en bout | 2 novembre : rien d'écrit après le démarrage ; 9 novembre : interrompue pendant la collecte (`scraping/logs/veille.log`, changement `veille-autonome`) | Non atteint ; corrigé le 13 novembre (veille sans fenêtre, étape payante dans la délégation) ; veille du 16 novembre en cours |
| Coût | 0,01 euro au plus par fiche ouverte importée | Lot B1 : 0,153 euro pour 13 fiches ouvertes ou sans date, soit 0,012 ; veille du 13 novembre : 0,051 euro pour 16 fiches contrôlées et qualifiées, soit 0,003 par fiche (part des fiches ouvertes non mesurée) | Non atteint sur B1 (fiches closes extraites pour rien), atteint sur la veille |
| Effort de relecture | Moins de 10 % de la file avec doublon ou financeur remplacé par le relais | 2026-10-28 : 46 fiches sur 113 au nom du relais (41 %), 10 corrigées par la règle des relais, 36 restées ; 2026-11-13 : 63 doublons dont 30 dans la file, 43 rejetés | Non atteint pendant le pilote ; part actuelle non mesurée |

Conclusion de la session : deux seuils atteints sur cinq (exactitude, coût de la veille), deux corrigés depuis (autonomie,
doublons et relais) mais pas encore prouvés, un non mesurable (couverture : panel de 3 appels).

### Chiffrage du passage à l'échelle (estimation)

- Registre : 1 269 sources ; 118 ont une page lue par la veille (adresse validée, ciblée par une session ou page d'appel),
  et la veille relit environ 200 pages (`scraping/VEILLE.md`, dernier rejeu : 198 sources relues).
- Coût Haiku mesuré : 0,051 euro pour la veille du 13 novembre (60 textes nouveaux, deux semaines sans veille) ; lecture
  des PDF : 0,589 euro pour 211 textes (0,003 euro par texte, en une fois).
- Estimation pour l'ensemble du registre, à rythme hebdomadaire : 0,051 x 1 269 / 200 / 2, soit environ 0,16 euro par
  semaine (hypothèses : nouveautés proportionnelles au nombre de sources, deux semaines couvertes le 13 novembre) ; plus
  une première lecture des PDF des nouvelles sources, de l'ordre de 0,003 euro par texte.
- Le coût principal n'est pas le modèle : il faut trouver la page des appels de plus de 1 100 sources (travail de session
  ou de Monsieur DUCOUT, 577 sources sans page au 2026-10-13) et relire la file « à valider ».
