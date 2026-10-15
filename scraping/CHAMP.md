# Champ santé et médico-social des fiches

Changement OpenSpec `filtre-champ-sante`. Rapport du 2026-10-15. Définition décidée par Monsieur DUCOUT le 2026-10-14 (consigne posée aux modèles, version 4) :

> Tu lis le texte d'une page web d'un organisme français qui décrit un appel à projets, un appel à candidatures, une bourse ou un prix. Réponds en JSON. champ : « sante » si l'objet de l'appel est la santé (soins, prévention, santé publique, santé mentale, addictions, recherche en santé, e-santé) ou si le bénéficiaire est un établissement de santé, hôpital ou clinique, quel que soit l'objet (numérique, cybersécurité comme CaRE, ANS ou ANSSI, logiciels, audits, rénovation, investissement immobilier, équipements, qualité, attractivité et formation des professionnels de santé) ; « medico-social » si l'objet est le handicap, l'autonomie ou le grand âge, ou si le bénéficiaire est un établissement ou service médico-social (EHPAD, SSIAD, IME, ESAT, services à domicile), quel que soit l'objet ; « hors-champ » pour le social sans dimension sanitaire (insertion par l'emploi, jeunesse, logement, pauvreté, parentalité, protection de l'enfance hors établissement médico-social), l'agriculture, l'économie, le tourisme, le patrimoine, la culture, le sport, l'environnement, l'énergie, le numérique hors établissements de santé, la recherche hors santé, l'éducation et tout le reste ; un appel mixte (culture et santé, sport sur ordonnance) est dans le champ seulement si un établissement de santé ou médico-social en est bénéficiaire ou si la santé en est l'objet ; « incertain » si le texte ne permet pas de trancher. raison : une phrase en français.

Fiches lues dans les fichiers de l'import : 1191. Répartition : hors-champ 547, sante 367, medico-social 223, incertain 54.

## Part dans le champ par source

| Source | Famille | Fiches | Classées | Dans le champ | Part |
|---|---|---|---|---|---|
| fhf-hauts-de-france-appels-a-projets | autre | 87 | 87 | 84 | 97 % |
| fondation_de_france |  | 64 | 64 | 28 | 44 % |
| conseil-departemental-guadeloupe | collectivite | 35 | 35 | 9 | 26 % |
| region-ile-de-france-aides-et-appels-a-projets | collectivite | 28 | 28 | 2 | 7 % |
| cnsa | caisse-nationale | 23 | 23 | 23 | 100 % |
| inserm | agence-nationale | 21 | 21 | 20 | 95 % |
| conseil-departemental-ain | collectivite | 19 | 19 | 8 | 42 % |
| ars_idf |  | 18 | 18 | 18 | 100 % |
| ars_idf_local |  | 18 | 18 | 18 | 100 % |
| conseil-departemental-pyrenees-atlantiques | collectivite | 18 | 18 | 7 | 39 % |
| agence-de-l-eau-seine-normandie | agence-nationale | 17 | 17 | 1 | 6 % |
| conseil-regional-la-reunion | collectivite | 16 | 16 | 0 | 0 % |
| ville-de-paris-appels-a-projets | collectivite | 16 | 16 | 3 | 19 % |
| ars-normandie | ars | 15 | 15 | 14 | 93 % |
| conseil-departemental-maine-et-loire | collectivite | 15 | 15 | 3 | 20 % |
| fondation-de-france-appels-a-projets-des-fondations-abritees | fondation | 15 | 15 | 4 | 27 % |
| institut-national-du-cancer-inca | agence-nationale | 15 | 15 | 15 | 100 % |
| ars-bourgogne-franche-comte | ars | 14 | 14 | 14 | 100 % |
| ars-grand-est | ars | 14 | 14 | 14 | 100 % |
| girci-mediterranee | etablissement | 14 | 14 | 14 | 100 % |
| ars-nouvelle-aquitaine | ars | 13 | 13 | 13 | 100 % |
| ars-pays-de-la-loire | ars | 13 | 13 | 13 | 100 % |
| ars-provence-alpes-cote-d-azur | ars | 13 | 13 | 13 | 100 % |
| direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-bourgogne-franche-comte-siege-de-dijon | ministere | 13 | 13 | 0 | 0 % |
| fondation-arc | fondation | 13 | 13 | 13 | 100 % |
| conseil-departemental-la-reunion | collectivite | 12 | 12 | 2 | 17 % |
| conseil-departemental-vosges | collectivite | 12 | 12 | 2 | 17 % |
| direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-bourgogne-franche-comte | ministere | 12 | 12 | 0 | 0 % |
| fse-france | europe | 12 | 12 | 0 | 0 % |
| loiret-appels-a-projets | collectivite | 12 | 12 | 4 | 33 % |
| ars-ile-de-france | ars | 11 | 11 | 11 | 100 % |
| direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-centre-val-de-loire | ministere | 11 | 11 | 0 | 0 % |
| admical | autre | 10 | 10 | 3 | 30 % |
| anr | agence-nationale | 10 | 10 | 0 | 0 % |
| ars-centre-val-de-loire | ars | 10 | 10 | 10 | 100 % |
| canceropole-grand-ouest-appels-a-projets | etablissement | 10 | 10 | 8 | 80 % |
| conseil-departemental-hautes-pyrenees | collectivite | 10 | 10 | 3 | 30 % |
| fondation-mederic-alzheimer | fondation | 10 | 10 | 9 | 90 % |
| prefecture-cote-d-or | ministere | 10 | 10 | 2 | 20 % |
| prefecture-seine-maritime | ministere | 10 | 10 | 1 | 10 % |
| appelaprojets-org | autre | 9 | 9 | 2 | 22 % |
| ars-auvergne-rhone-alpes | ars | 9 | 9 | 9 | 100 % |
| ars-hauts-de-france | ars | 9 | 9 | 9 | 100 % |
| collectivite-territoriale-de-guyane | collectivite | 9 | 9 | 0 | 0 % |
| fondation-de-france | fondation | 9 | 9 | 4 | 44 % |
| fondation-de-l-avenir | fondation | 9 | 9 | 8 | 89 % |
| mairie-de-toulon | collectivite | 9 | 9 | 0 | 0 % |
| rhone-appels-a-candidatures-prevention | collectivite | 9 | 9 | 2 | 22 % |
| agence-de-l-eau-rhin-meuse | agence-nationale | 8 | 8 | 0 | 0 % |
| ars-bretagne | ars | 8 | 8 | 8 | 100 % |
| ars-mayotte | ars | 8 | 8 | 8 | 100 % |
| bpifrance-france-2030 | agence-nationale | 8 | 8 | 0 | 0 % |
| conseil-departemental-val-d-oise | collectivite | 8 | 8 | 4 | 50 % |
| conseil-regional-occitanie | collectivite | 8 | 8 | 0 | 0 % |
| direction-de-l-alimentation-de-l-agriculture-et-de-la-foret-daaf-martinique | ministere | 8 | 8 | 0 | 0 % |
| direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-grand-est-site-de-metz | ministere | 8 | 8 | 1 | 12 % |
| direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-pays-de-la-loire | ministere | 8 | 8 | 0 | 0 % |
| prefecture-aveyron | ministere | 8 | 8 | 2 | 25 % |
| ars-guyane | ars | 7 | 7 | 7 | 100 % |
| ars-la-reunion | ars | 7 | 7 | 7 | 100 % |
| conseil-departemental-ille-et-vilaine | collectivite | 7 | 7 | 3 | 43 % |
| conseil-departemental-pyrenees-orientales | collectivite | 7 | 7 | 1 | 14 % |
| direction-departementale-de-l-emploi-du-travail-et-des-solidarites-ddets-bouches-du-rhone | ministere | 7 | 7 | 0 | 0 % |
| direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-bretagne | ministere | 7 | 7 | 0 | 0 % |
| direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-occitanie-siege-de-toulouse | ministere | 7 | 7 | 0 | 0 % |
| finistere-appels-a-projets | collectivite | 7 | 7 | 4 | 57 % |
| girci-grand-ouest | etablissement | 7 | 7 | 7 | 100 % |
| ars-guadeloupe | ars | 6 | 6 | 6 | 100 % |
| conseil-departemental-essonne | collectivite | 6 | 6 | 1 | 17 % |
| conseil-regional-centre-val-de-loire | collectivite | 6 | 6 | 0 | 0 % |
| fondation-orange | fondation | 6 | 6 | 0 | 0 % |
| mutualite-sociale-agricole-msa-grand-est-accueil-de-sarrebourg | caisse-nationale | 6 | 6 | 4 | 67 % |
| prefecture-ille-et-vilaine | ministere | 6 | 6 | 0 | 0 % |
| conseil-departemental-haute-savoie | collectivite | 5 | 5 | 1 | 20 % |
| conseil-departemental-herault | collectivite | 5 | 5 | 2 | 40 % |
| conseil-departemental-mayotte | collectivite | 5 | 5 | 0 | 0 % |
| conseil-regional-guadeloupe | collectivite | 5 | 5 | 0 | 0 % |
| direction-departementale-de-l-emploi-du-travail-et-des-solidarites-ddets-ille-et-vilaine | ministere | 5 | 5 | 0 | 0 % |
| direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-centre-val-de-loire | ministere | 5 | 5 | 0 | 0 % |
| mairie-de-brest | collectivite | 5 | 5 | 1 | 20 % |
| promotion-sante-occitanie-appels-a-projets | autre | 5 | 5 | 1 | 20 % |
| societe-francaise-de-medecine-d-urgence-sfmu | societe-savante | 5 | 5 | 5 | 100 % |
| societe-francophone-du-diabete-sfd | societe-savante | 5 | 5 | 4 | 80 % |
| caisse-d-assurance-retraite-et-de-la-sante-au-travail-carsat-nord-picardie | caisse-nationale | 4 | 4 | 3 | 75 % |
| carsat-nord-est-aap-des-partenaires | caisse-nationale | 4 | 4 | 4 | 100 % |
| conseil-departemental-gers | collectivite | 4 | 4 | 3 | 75 % |
| direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-hauts-de-france | ministere | 4 | 4 | 0 | 0 % |
| direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-nouvelle-aquitaine | ministere | 4 | 4 | 0 | 0 % |
| firah | fondation | 4 | 4 | 2 | 50 % |
| fondation-de-l-ap-hp | etablissement | 4 | 4 | 3 | 75 % |
| fondation-des-hopitaux | fondation | 4 | 4 | 3 | 75 % |
| fonds-national-pour-la-science-ouverte | agence-nationale | 4 | 4 | 0 | 0 % |
| le-compte-asso-subventions-de-l-etat | autre | 4 | 4 | 0 | 0 % |
| mutualite-sociale-agricole-msa-sud-aquitaine-accueil-de-saint-pierre-du-mont | caisse-nationale | 4 | 4 | 3 | 75 % |
| portail-national-des-ars | ars | 4 | 4 | 4 | 100 % |
| prefecture-morbihan | ministere | 4 | 4 | 1 | 25 % |
| agence-de-l-eau-loire-bretagne | agence-nationale | 3 | 3 | 1 | 33 % |
| ars-corse | ars | 3 | 3 | 3 | 100 % |
| ars-martinique | ars | 3 | 3 | 3 | 100 % |
| ars-occitanie | ars | 3 | 3 | 3 | 100 % |
| caisse-d-assurance-retraite-et-de-la-sante-au-travail-carsat-languedoc-roussillon | caisse-nationale | 3 | 3 | 3 | 100 % |
| caisse-generale-de-securite-sociale-cgss-guyane | caisse-nationale | 3 | 3 | 3 | 100 % |
| collectivite-territoriale-de-martinique | collectivite | 3 | 3 | 0 | 0 % |
| conseil-departemental-correze | collectivite | 3 | 3 | 1 | 33 % |
| conseil-departemental-savoie | collectivite | 3 | 3 | 1 | 33 % |
| conseil-departemental-val-de-marne | collectivite | 3 | 3 | 0 | 0 % |
| conseil-regional-grand-est | collectivite | 3 | 3 | 0 | 0 % |
| direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-auvergne-rhone-alpes-site-de-lyon | ministere | 3 | 3 | 0 | 0 % |
| direction-regionale-et-interdepartementale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-drieets-unite-departementale-de-paris | ministere | 3 | 3 | 0 | 0 % |
| institut-de-france-fondations | fondation | 3 | 3 | 1 | 33 % |
| mairie-de-amiens | collectivite | 3 | 3 | 0 | 0 % |
| mairie-de-nice | collectivite | 3 | 3 | 0 | 0 % |
| mairie-de-reims | collectivite | 3 | 3 | 0 | 0 % |
| ministere-de-l-enseignement-superieur-et-de-la-recherche | ministere | 3 | 3 | 0 | 0 % |
| mutualite-sociale-agricole-msa-nouvelle-aquitaine-accueil-de-libourne | caisse-nationale | 3 | 3 | 3 | 100 % |
| mutualite-sociale-agricole-msa-sud-champagne-accueil-de-troyes | caisse-nationale | 3 | 3 | 1 | 33 % |
| prefecture-manche | ministere | 3 | 3 | 0 | 0 % |
| prefecture-rhone | ministere | 3 | 3 | 0 | 0 % |
| agence-de-l-eau-artois-picardie | agence-nationale | 2 | 2 | 0 | 0 % |
| agence-du-numerique-en-sante-ans | agence-nationale | 2 | 2 | 2 | 100 % |
| ars_corse |  | 2 | 2 | 2 | 100 % |
| avise | autre | 2 | 2 | 0 | 0 % |
| conseil-departemental-alpes-maritimes | collectivite | 2 | 2 | 2 | 100 % |
| conseil-departemental-yvelines | collectivite | 2 | 2 | 0 | 0 % |
| deux-sevres-appels-a-projets | collectivite | 2 | 2 | 2 | 100 % |
| dgos-programmes-de-recherche-hospitaliere-phrc-phrip-preps-prme | ministere | 2 | 2 | 2 | 100 % |
| direction-generale-de-la-cohesion-des-populations-dgcopop-guyane | ministere | 2 | 2 | 0 | 0 % |
| direction-generale-du-tresor-fasep-sante | ministere | 2 | 2 | 0 | 0 % |
| fondation-aesio | fondation | 2 | 2 | 2 | 100 % |
| fondation-malakoff-humanis-handicap | fondation | 2 | 2 | 1 | 50 % |
| interreg-sudoe | europe | 2 | 2 | 0 | 0 % |
| mairie-de-marseille | collectivite | 2 | 2 | 0 | 0 % |
| mairie-de-villeurbanne | collectivite | 2 | 2 | 0 | 0 % |
| mutualite-sociale-agricole-msa-beauce-coeur-de-loire-accueil-de-chartres | caisse-nationale | 2 | 2 | 0 | 0 % |
| mutualite-sociale-agricole-msa-picardie-accueil-de-laon | caisse-nationale | 2 | 2 | 0 | 0 % |
| societe-francaise-de-geriatrie-et-gerontologie-sfgg | societe-savante | 2 | 2 | 2 | 100 % |
| uriopss-hauts-de-france | autre | 2 | 2 | 1 | 50 % |
| ansm | agence-nationale | 1 | 1 | 1 | 100 % |
| conseil-departemental-gard | collectivite | 1 | 1 | 0 | 0 % |
| conseil-departemental-gironde | collectivite | 1 | 1 | 0 | 0 % |
| conseil-departemental-haute-garonne | collectivite | 1 | 1 | 0 | 0 % |
| conseil-departemental-lozere | collectivite | 1 | 1 | 1 | 100 % |
| conseil-departemental-mayenne | collectivite | 1 | 1 | 0 | 0 % |
| conseil-departemental-pas-de-calais | collectivite | 1 | 1 | 0 | 0 % |
| conseil-departemental-territoire-de-belfort | collectivite | 1 | 1 | 0 | 0 % |
| conseil-departemental-var | collectivite | 1 | 1 | 0 | 0 % |
| conseil-departemental-yonne | collectivite | 1 | 1 | 0 | 0 % |
| direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-occitanie | ministere | 1 | 1 | 0 | 0 % |
| drome-commission-des-financeurs | collectivite | 1 | 1 | 0 | 0 % |
| essonne-commission-des-financeurs | collectivite | 1 | 1 | 1 | 100 % |
| fondation-credit-agricole-solidarite-et-developpement | fondation | 1 | 1 | 0 | 0 % |
| fondation-force | fondation | 1 | 1 | 1 | 100 % |
| mairie-de-rennes | collectivite | 1 | 1 | 0 | 0 % |
| maison-de-l-autonomie-mda-alpes-maritimes | collectivite | 1 | 1 | 1 | 100 % |
| metropole-aix-marseille-provence-contrat-de-ville | collectivite | 1 | 1 | 0 | 0 % |
| metropole-de-lyon-commission-des-financeurs | collectivite | 1 | 1 | 1 | 100 % |
| ministere-de-la-culture-culture-sante-handicap-et-dependance | ministere | 1 | 1 | 0 | 0 % |
| mutualite-sociale-agricole-msa-alpes-vaucluse-accueil-d-avignon | caisse-nationale | 1 | 1 | 0 | 0 % |
| mutualite-sociale-agricole-msa-berry-touraine-accueil-de-blois | caisse-nationale | 1 | 1 | 1 | 100 % |
| mutualite-sociale-agricole-msa-occitanie-accueil-de-carcassonne | caisse-nationale | 1 | 1 | 0 | 0 % |
| plateforme-nationale-pour-la-recherche-sur-la-fin-de-vie | societe-savante | 1 | 1 | 1 | 100 % |
| ville-de-paris-politique-de-la-ville | collectivite | 1 | 1 | 0 | 0 % |

## Sources à revoir (au moins 5 fiches classées, moins de 20 % dans le champ)

Décision humaine, source par source, avec l'outil de relecture ; le registre n'est pas modifié par cet outil.

- `region-ile-de-france-aides-et-appels-a-projets` (collectivite, périmètre `sante-et-medico-social`) : 2 fiches dans le champ sur 28 classées (7 %). Notes du registre : Adresse à confirmer ; filtrer santé..
- `agence-de-l-eau-seine-normandie` (agence-nationale, périmètre `sante-et-medico-social`) : 1 fiches dans le champ sur 17 classées (6 %). Notes du registre : Lien indirect avec la santé (eau, micropolluants, médicaments)..
- `conseil-regional-la-reunion` (collectivite, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 16 classées (0 %). Notes du registre : AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. Adresse corrigée par Monsieur DUCOUT le 2026-10-13 (ancienne : https://regionreunion.com/)..
- `ville-de-paris-appels-a-projets` (collectivite, périmètre `sante-et-medico-social`) : 3 fiches dans le champ sur 16 classées (19 %). Notes du registre : Adresse à confirmer ; CFPPA 75 et santé..
- `direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-bourgogne-franche-comte-siege-de-dijon` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 13 classées (0 %). Notes du registre : DRAAF : Alimentation, nutrition, précarité alimentaire. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `conseil-departemental-la-reunion` (collectivite, périmètre `sante-et-medico-social`) : 2 fiches dans le champ sur 12 classées (17 %). Notes du registre : CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `conseil-departemental-vosges` (collectivite, périmètre `sante-et-medico-social`) : 2 fiches dans le champ sur 12 classées (17 %). Notes du registre : CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-bourgogne-franche-comte` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 12 classées (0 %). Notes du registre : DREETS : Insertion, pauvreté, hébergement, FSE+. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `fse-france` (europe, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 12 classées (0 %). Notes du registre : Appels locaux (départements, régions) : santé mentale, accès aux soins..
- `direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-centre-val-de-loire` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 11 classées (0 %). Notes du registre : DRAAF : Alimentation, nutrition, précarité alimentaire. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `anr` (agence-nationale, périmètre `sante`) : 0 fiches dans le champ sur 10 classées (0 %). Notes du registre : Programme de recherche en santé publique et appels thématiques. ; rubrique relue le 2026-10-12 : https://anr.fr/fr/appels/.
- `prefecture-seine-maritime` (ministere, périmètre `sante-et-medico-social`) : 1 fiches dans le champ sur 10 classées (10 %). Notes du registre : Préfecture : AAP politique de la ville, addictions, égalité, intégration, pauvreté. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `collectivite-territoriale-de-guyane` (collectivite, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 9 classées (0 %). Notes du registre : AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. Adresse corrigée par Monsieur DUCOUT le 2026-10-13 (ancienne : https://www.ctguyane.fr/)..
- `mairie-de-toulon` (collectivite, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 9 classées (0 %). Notes du registre : Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `agence-de-l-eau-rhin-meuse` (agence-nationale, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 8 classées (0 %). Notes du registre : Lien indirect avec la santé..
- `bpifrance-france-2030` (agence-nationale, périmètre `sante`) : 0 fiches dans le champ sur 8 classées (0 %). Notes du registre : AAP France 2030 : santé numérique, santé mentale, dispositifs médicaux..
- `conseil-regional-occitanie` (collectivite, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 8 classées (0 %). Notes du registre : AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `direction-de-l-alimentation-de-l-agriculture-et-de-la-foret-daaf-martinique` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 8 classées (0 %). Notes du registre : DRAAF : Alimentation, nutrition, précarité alimentaire. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-grand-est-site-de-metz` (ministere, périmètre `sante-et-medico-social`) : 1 fiches dans le champ sur 8 classées (12 %). Notes du registre : DRAAF : Alimentation, nutrition, précarité alimentaire. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-pays-de-la-loire` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 8 classées (0 %). Notes du registre : DREETS : Insertion, pauvreté, hébergement, FSE+. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `conseil-departemental-pyrenees-orientales` (collectivite, périmètre `sante-et-medico-social`) : 1 fiches dans le champ sur 7 classées (14 %). Notes du registre : CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `direction-departementale-de-l-emploi-du-travail-et-des-solidarites-ddets-bouches-du-rhone` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 7 classées (0 %). Notes du registre : DDETS : AAP départementaux insertion, hébergement, solidarités. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-bretagne` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 7 classées (0 %). Notes du registre : DRAAF : Alimentation, nutrition, précarité alimentaire. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-occitanie-siege-de-toulouse` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 7 classées (0 %). Notes du registre : DRAAF : Alimentation, nutrition, précarité alimentaire. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `conseil-departemental-essonne` (collectivite, périmètre `sante-et-medico-social`) : 1 fiches dans le champ sur 6 classées (17 %). Notes du registre : CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. Adresse corrigée par Monsieur DUCOUT le 2026-10-13 (ancienne : https://www.essonne.fr/)..
- `conseil-regional-centre-val-de-loire` (collectivite, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 6 classées (0 %). Notes du registre : AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. ; rubrique relue le 2026-10-12 : https://www.centre-valdeloire.fr/appels-projet Adresse corrigée par Monsieur DUCOUT le 2026-10-13 (ancienne : https://www.centre-valdeloire.fr/)..
- `fondation-orange` (fondation, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 6 classées (0 %). Notes du registre : Autisme, santé numérique ; rubrique AAP à préciser..
- `prefecture-ille-et-vilaine` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 6 classées (0 %). Notes du registre : Préfecture : AAP politique de la ville, addictions, égalité, intégration, pauvreté. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `conseil-departemental-mayotte` (collectivite, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 5 classées (0 %). Notes du registre : CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. ; rubrique relue le 2026-10-12 : https://www.mayotte.fr/services-en-ligne/opportunites/appels-a-projets Adresse corrigée par Monsieur DUCOUT le 2026-10-13 (ancienne : https://www.cg976.fr/)..
- `conseil-regional-guadeloupe` (collectivite, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 5 classées (0 %). Notes du registre : AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. Adresse corrigée par Monsieur DUCOUT le 2026-10-13 (ancienne : https://www.regionguadeloupe.fr/)..
- `direction-departementale-de-l-emploi-du-travail-et-des-solidarites-ddets-ille-et-vilaine` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 5 classées (0 %). Notes du registre : DDETS : AAP départementaux insertion, hébergement, solidarités. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
- `direction-regionale-de-l-economie-de-l-emploi-du-travail-et-des-solidarites-dreets-centre-val-de-loire` (ministere, périmètre `sante-et-medico-social`) : 0 fiches dans le champ sur 5 classées (0 %). Notes du registre : DREETS : Insertion, pauvreté, hébergement, FSE+. Site officiel (annuaire de l'administration) : rubrique AAP à préciser..
