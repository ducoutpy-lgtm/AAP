# Mesure d'exactitude des fiches (pilote)

Changement `mesure-exactitude-30-fiches`. Fiches tirées par `exactitude.py --tirer` (graine 20261116), comparées par la session au texte source que le modèle a lu. Zéro euro.

- 110 / 120 champs justes (91,7 %)
- Dates inventées : 0
- Conclusion : seuil atteint (90 % au moins et aucune date inventée)

| Champ | Justes | Total | Part |
|---|---|---|---|
| titre | 30 | 30 | 100,0 % |
| financeur | 24 | 30 | 80,0 % |
| date_cloture | 29 | 30 | 96,7 % |
| montant | 27 | 30 | 90,0 % |

## Écarts

- financeur (faux) : https://gerontopolesud.fr/recherche/appel-manifestation-dinteret-les-olympiades-silver-geek-2026-2027 ; Silver Geek, en partenariat avec AG2R LA MONDIALE, poursuit le développement des Olympiades ; texte : Silver Geek (avec AG2R LA MONDIALE) porte l'appel, Gérontopôle Sud n'est que le diffuseur
- montant (faux) : https://gerontopolesud.fr/recherche/appel-manifestation-dinteret-les-olympiades-silver-geek-2026-2027 ; Pour la région Nouvelle-Aquitaine : 6 structures sélectionnées ; texte : aucun montant en euros, le nombre de structures retenues n'est pas une enveloppe financière
- financeur (faux) : https://lyonbiopole.com/appel-a-projet/horizon-hlth-2027-01-disease-08 ; Commission européenne, programme HORIZON EUROPE ; texte : appel de la Commission européenne, Lyonbiopôle n'est qu'un relais d'accompagnement
- financeur (faux) : https://lyonbiopole.com/appel-a-projet/horizon-hlth-2027-01-disease-05 ; Commission européenne, programme HORIZON EUROPE ; texte : appel de la Commission européenne, Lyonbiopôle n'est qu'un relais d'accompagnement
- montant (faux) : https://appel-a-projet.fondationhopitaux.fr/ameliorer-le-quotidien-des-personnes-agees---2025-1 ; Le coût global du projet devra être supérieur à 2 000 euros ; texte : 2 000 € est un seuil de coût global du projet, pas un minimum d'aide ; plafonds : 5 000 € activités, 20 000 € véhicules (max 20000 correct)
- financeur (faux) : https://lyonbiopole.com/appel-a-projet/horizon-hlth-2027-02-disease-01 ; Commission européenne, programme HORIZON EUROPE ; texte : appel de la Commission européenne, Lyonbiopôle n'est qu'un relais d'accompagnement
- montant (faux) : https://gerontopolesud.fr/recherche/appel-projets-fondation-des-hopitaux-ameliorer-le-quotidien-des-personnes-agees ; un coût total du projet d'au moins 4 000 € ; texte : 4 000 € est un seuil de coût total, pas un minimum d'aide ; plafonds d'aide : 10 000 € activités, 15 000 € minibus
- financeur (faux) : https://lyonbiopole.com/appel-a-projet/horizon-hlth-2027-01-envhlth-missclima-03 ; Commission européenne, programme HORIZON EUROPE ; texte : appel de la Commission européenne, Lyonbiopôle n'est qu'un relais d'accompagnement
- date_cloture (faux) : https://www.departement18.fr/Appel-a-manifestation-d-interet-SAD ; mobilisable à cet effet jusqu'au 31/12/2026 ; texte : 31/12/2026 est la fin de mobilisation des crédits, aucune date limite de dépôt n'est donnée
- financeur (faux) : https://gerontopolesud.fr/recherche/appel-projets-france-active-linnovation-sociale-pour-le-maintien-domicile-des-personnes ; France Active et ses partenaires lancent l'appel à projets "Bien vieillir" ; texte : France Active, Gérontopôle Sud n'est que le diffuseur

## Dix fiches à relire par Monsieur DUCOUT (les dix premières du tirage)

1. https://gerontopolesud.fr/recherche/appel-candidatures-handilab-2026-les-start-de-lautonomie-et-de-laccessibilite-numerique
2. https://gerontopolesud.fr/recherche/appel-manifestation-dinteret-les-olympiades-silver-geek-2026-2027
3. https://www.fondationhopitaux.fr/lutter-contre-lisolement-des-personnes-agees-lappel-a-projets-2026-est-lance/
4. https://lyonbiopole.com/appel-a-projet/microbiote-intestinal
5. https://lyonbiopole.com/appel-a-projet/horizon-hlth-2027-01-disease-08
6. https://www.canceropole-idf.fr/aap/emergence-2027-1/
7. https://www.hautes-alpes.fr/nos-actions/autonomie/la-commission-des-financeurs/prevention-de-la-perte-dautonomie/appel-aux-initiatives-dactions-de-prevention-2027/
8. https://lyonbiopole.com/appel-a-projet/horizon-hlth-2027-01-disease-05
9. https://www.ctguyane.fr/appel-a-projet-annuel-de-la-commission-des-financeurs-de-la-prevention-de-la-perte-dautonomie-pour-lannee-2026-2/
10. https://artsconvergences.com/prix-video/

<!-- Fin du calcul. La suite est écrite à la main ; exactitude.py --rapport la garde. -->

## Analyse (écrite à la main)

Méthode et limites (2026-11-16) : verdicts écrits par un sous-agent de la session (modèle Sonnet) contre le texte source ;
la session en a contrôlé six dans les textes (dates de la Guyane, du Cher et de la Loire, montant du Cher, financeur et
montant de Silver Geek), tous concordants. La date du Cher (31/12/2026, fin de mobilisation des crédits) est comptée
« faux » et non « inventée » : la date figure dans le texte. Texte de la Guyane contradictoire (30 mai dans les
modalités, 15 juin dans le calendrier) : 30 mai jugé juste. Les six financeurs faux sont tous des relais (Lyonbiopôle
pour la Commission européenne, Gérontopôle Sud pour Silver Geek et France Active) : 20 % des fiches, au-dessus du seuil
de 10 % du critère « Effort de relecture » du pilote.

Après l'import (vérifié le 2026-11-16 en appliquant `financeurs.financeur_reel_du_relais` aux six noms, comme le fait
`scripts/import_to_firestore.py` pour une source relais) : les quatre appels Horizon Europe de Lyonbiopôle affichent
« Commission européenne » (trois) ou « Horizon Europe – Cluster Santé (PCN France) » (un) ; les deux du Gérontopôle Sud
restent au nom du relais (Silver Geek et France Active absents du référentiel). Financeur affiché juste : 28 / 30 ;
champs justes tels qu'affichés : 114 / 120 (95,0 %). Non relu dans la base elle-même.
