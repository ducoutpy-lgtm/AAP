# Comparaison de deux moteurs sur 50 pages jamais traitées

Changement OpenSpec `comparaison-moteurs-50-pages`. Rapport du 2026-10-14. Tirage : graine 2026, 765 textes candidats (jamais traités par le passage local, hors échantillon), répartition collectivite 50. Jugement de Monsieur DUCOUT : 50 pages sur 50 ; pages commentées « hors champ » (appels hors santé et médico-social, question du 2026-10-14) : 0.

Repérage = décisions justes sur les pages jugées (fiche produite sur une page jugée « appel », refus sur une page jugée « pas un appel »). Qualité = fiches jugées justes parmi les pages jugées « appel » (page sans fiche ou fiche à corriger = fausse). Fabrications = fiches produites sur des pages jugées « pas un appel ». Durées locales mesurées pendant le passage global (file d'attente Ollama) : indicatives. Le modèle local a une seconde chance sur les écarts de format, pas le modèle API.

| Moteur | Modèle | Pages traitées | Repérage | Qualité | Fabrications | Durée | Coût |
|---|---|---|---|---|---|---|---|
| Modèle local | qwen3:8b | 50 / 50 | 45 / 50 (90 %) | 19 / 23 (83 %) | 3 | 2501 s | 0 euro |
| Modèle API | claude-haiku-5-5 | 50 / 50 | 47 / 50 (94 %) | 19 / 23 (83 %) | 0 | 184 s | 0.030 euros (70 appels, journal des coûts) |

## Pages

| # | Source | Page | Verdict page | Local | API | Commentaire |
|---|---|---|---|---|---|---|
| 1 | Conseil départemental Oise | [page](https://oise.fr/actions/sante-social-solidarite/emploi-insertion/appels-a-projets) | appel | refus | refus |  |
| 2 | Collectivité territoriale de Guyane | [page](https://www.guyane.gouv.fr/Publications/Appels-a-Projets/2024/Planification-eologique-Modernisation-des-entreprises-d-exploitation-forestiere-en-Guyane) | appel | fiche juste | fiche juste |  |
| 3 | Drôme – Commission des financeurs | [page](https://www.ladrome.fr/mon-quotidien/numerique/travailler-autrement/) | pas-un-appel | refus | refus |  |
| 4 | Drôme – Commission des financeurs | [page](https://www.ladrome.fr/mon-quotidien/solidarites/stop-maltraitance/) | pas-un-appel | refus | refus |  |
| 5 | Ville de Paris – appels à projets | [page](https://www.paris.fr/pages/appel-a-projets-pour-l-organisation-de-marches-de-producteurs-a-paris-en-2027-35825) | appel | fiche juste | fiche juste |  |
| 6 | Conseil départemental Lozère | [page](https://lozere.fr/node/23539) | pas-un-appel | refus | refus | https://lozere.fr/lamenagement-du-territoire/developpement-economique/appels-projets.html |
| 7 | Conseil départemental Guadeloupe | [page](https://www.cg971.fr/aap-promouvoir-lintegration-sociale-des-personnes-exposees-au-risque-de-pauvrete-ou-dexclusion-sociale/) | appel | fiche juste | fiche juste |  |
| 8 | Conseil départemental Pyrénées-Orientale | [page](https://www.ledepartement66.fr/appels-a-projet-programmation-culturelle-2024-2025-de-spectacles-vivants-et-dateliers-dart-plastiques-et-visuels/) | appel | fiche a-corriger | fiche juste | https://www.ledepartement66.fr/dossier/les-appels-a-projets/ ca c'est la bonne page et la fiche du modle elocal est a corriger car il a lu le mauvais trerritoire : c'est pyrenee orientale et non pas bouches du rhone |
| 9 | Conseil départemental Mayotte | [page](https://www.mayotte.gouv.fr/Publications/Appels-a-projets/2026/Appel-a-projet-pour-les-journees-europeennes-du-patrimoine-2026) | appel | fiche juste | fiche juste |  |
| 10 | Conseil régional Occitanie | [page](https://www.laregion.fr/Prix-Claude-Nougaro-39650) | pas-un-appel | refus | refus |  |
| 11 | Région Île-de-France – aides et appels à | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=theme%3A1348) | pas-un-appel | refus | refus | ok donc cest une page qui liste des appels a projet donc il faut lire et traiter les appels a projets qui sont sur cette page |
| 12 | Conseil régional Occitanie | [page](https://www.laregion.fr/mentions-legales) | pas-un-appel | refus | refus | quand on cherche la bonne page on la trouve : https://www.laregion.fr/-tous-les-appels-a-projets- il suffit de taper sur google : region occitanie appel a projet et c'est la première page |
| 13 | Conseil régional Occitanie | [page](https://www.laregion.fr/Investir-dans-les-equipements-et-installations-de-production-d-energies-a-partir-de) | pas-un-appel | refus | refus | toujour pas la bonne page : https://www.laregion.fr/-tous-les-appels-a-projets- |
| 14 | Conseil départemental Vosges | [page](https://www.vosges.fr/donnees-personnelles/) | pas-un-appel | refus | refus | quand on recherche les bons mots clé on trouve la bonne pages : https://www.vosges.fr/mon-departement/appels-a-projets/ |
| 15 | Drôme – Commission des financeurs | [page](https://www.ladrome.fr/mon-quotidien/education/college-pour-tous/) | pas-un-appel | refus | refus | quand on recherche avec les bon mots clé on trouve la bonne page : https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/ |
| 16 | Conseil départemental Pyrénées-Atlantiqu | [page](https://www.le64.fr/favoriser-linsertion-professionnelle-des-personnes-eloignees-du-marche-du-travail) | pas-un-appel | fiche juste | refus | quand on recherche les bons mots clé on trouve la bonne page : https://le64.fr/vous-souhaitez/les-appels-projets-en-cours et effectivement haikua  raison il y a deux appel a projet differents sur la page |
| 17 | Région Île-de-France – aides et appels à | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=theme%3A589) | pas-un-appel | refus | refus |  |
| 18 | Conseil départemental Guadeloupe | [page](https://www.cg971.fr/appel-a-projets-fse-2025-ateliers-chantiers-dinsertion-guadoi1671/) | appel | fiche juste | fiche juste |  |
| 19 | Conseil départemental Pyrénées-Orientale | [page](http://www.ledepartement66.fr/?post_type=profil&p=13163) | pas-un-appel | refus | refus |  |
| 20 | Conseil départemental Maine-et-Loire | [page](https://www.maine-et-loire.fr/aides-et-services/professionnels/appels-a-projets/nature-en-ville) | appel | fiche a-corriger | fiche a-corriger |  |
| 21 | Conseil départemental Hérault | [page](https://herault.fr/328-partenaires.htm) | pas-un-appel | refus | refus |  |
| 22 | Mairie de Rennes | [page](https://metropole.rennes.fr/appels-a-projets-partenariats-et-cooperations/aides-de-leurope-pour-le-territoire/) | pas-un-appel | fiche a-corriger | refus | rien a voir le modele local a du melanger plusieurs fiches |
| 23 | Conseil départemental Essonne | [page](https://www.essonne.gouv.fr/info-cookies) | pas-un-appel | refus | refus |  |
| 24 | Conseil départemental Pyrénées-Atlantiqu | [page](https://le64.fr/ouverture-du-teleservice-demande-de-subvention-autonomie-prevention-de-la-perte-dautonomie-0) | appel | fiche juste | fiche juste |  |
| 25 | Région Île-de-France – aides et appels à | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=theme%3A616) | pas-un-appel | refus | refus |  |
| 26 | Conseil départemental Gard | [page](https://aidescd30.gard.fr/) | pas-un-appel | refus | refus |  |
| 27 | Conseil départemental Seine-et-Marne | [page](https://www.seine-et-marne.fr/fr/appels-projet-subventions/festivals-et-manifestations-culturelles-et-artistiques) | appel | refus | refus | c'est un appel a projet |
| 28 | Conseil départemental Savoie | [page](https://www.savoie.fr/web/sw_180135/appel-a-projets-commission-des-financeurs-pour-la-prevention-de-la-perte-d-autonomie-2027-2029) | pas-un-appel | fiche a-corriger | refus | plusieurs appels a projet |
| 29 | Collectivité territoriale de Guyane | [page](https://www.guyane.gouv.fr/Publications/Appels-a-Projets/2024/Appel-a-projet-DILCRAH) | appel | fiche juste | fiche juste |  |
| 30 | Conseil régional Centre-Val de Loire | [page](https://www.centre-valdeloire.fr/appels-projet/projeunes-donne-vie-tes-projets-de-lycee) | appel | fiche juste | fiche juste |  |
| 31 | Région Île-de-France – aides et appels à | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=public%3A229) | pas-un-appel | refus | refus |  |
| 32 | Collectivité territoriale de Martinique | [page](https://www.collectivitedemartinique.mq/appels_a_projets/appel-a-projets-parcours-de-la-3eme-chance-accompagner-les-jeunes-vers-une-reinsertion-durable/) | appel | fiche juste | fiche juste |  |
| 33 | Région Île-de-France – aides et appels à | [page](https://www.iledefrance.fr/aides-et-appels-a-projets/concours-deloquence-sur-la-citoyennete-avec-lassociation-trouve-ta-voix) | appel | fiche juste | fiche juste |  |
| 34 | Région Île-de-France – aides et appels à | [page](https://www.iledefrance.fr/aides-et-appels-a-projets/parentalite-ouverture-socio-culturelle-et-scolarite-pour-les-enfants-en-difficulte) | appel | fiche juste | fiche juste |  |
| 35 | Région Île-de-France – aides et appels à | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=public%3A166) | pas-un-appel | refus | refus |  |
| 36 | Conseil départemental Yvelines | [page](https://www.yvelines.fr/mon-departement/appels-a-projets-subventions/appel-a-projets-fse-insertion-des-jeunes-acces-emploi-des-jeunes-yvelinois/) | appel | fiche juste | fiche juste |  |
| 37 | Drôme – Commission des financeurs | [page](https://www.ladrome.fr/mon-quotidien/sports/le-sport-dans-la-drome/) | pas-un-appel | refus | refus |  |
| 38 | Mairie de Orléans | [page](https://www.orleans.fr/actualites?tx_news_pi1%5BoverwriteDemand%5D%5Bcategories%5D=5&cHash=7485d4459d69ab9103f864df8c397e49) | pas-un-appel | refus | refus |  |
| 39 | Conseil départemental Haute-Savoie | [page](https://hautesavoie.fr/rentree-des-classes-les-nouveaux-eleves-de-6e-accueillis-par-les-conseillers-departementaux/) | pas-un-appel | refus | refus |  |
| 40 | Conseil départemental Val-d'Oise | [page](https://www.valdoise.fr/annuaire/2548/294-libelle.htm) | appel | fiche juste | fiche juste |  |
| 41 | Conseil départemental Hautes-Pyrénées | [page](https://www.hautespyrenees.fr/aides-et-subventions/appels-a-projets/appel-a-projets-poles-touristiques-des-hautes-pyrenees/) | appel | fiche juste | fiche juste |  |
| 42 | Conseil départemental Hérault | [page](https://herault.fr/aideProjet/181/321-appel-a-projets-paysages-en-mouvement-pour-une-residence-de-territoire-dans-le-geoparc-terres-d-herault-residence-artistique-en-college-2027-arts-visuels.htm) | appel | fiche juste | fiche juste |  |
| 43 | Conseil régional Occitanie | [page](https://www.laregion.fr/Recrutement-de-medecins-generalistes-pour-le-Centre-de-Sante-de-Ma-Region-a-Lacaune) | pas-un-appel | refus | refus |  |
| 44 | Conseil régional Occitanie | [page](https://www.laregion.fr/Europe-en-Occitanie-39538) | pas-un-appel | refus | refus |  |
| 45 | Conseil départemental Gers | [page](https://www.gers.fr/aides-infos-pratiques/appels-a-projets-et-candidatures/appel-a-projets-pdi-2027-42305) | appel | fiche juste | fiche juste |  |
| 46 | Région Île-de-France – aides et appels à | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=theme%3A658) | pas-un-appel | refus | refus |  |
| 47 | Conseil régional La Réunion | [page](https://regionreunion.com/aides-services/appels-a-projets/aides-services/appels-a-projets/article/appel-a-manifestation-d-interet-valorisation-agricole-de-la-propriete-regionale-du-grand-stella) | appel | fiche juste | refus |  |
| 48 | Ville de Paris – appels à projets | [page](https://www.paris.fr/pages/appel-a-projets-paris-solidarites-internationales-anciennement-solidev-2027-36706) | appel | fiche juste | fiche juste |  |
| 49 | Conseil départemental Somme | [page](https://www.somme.fr/services/loisirs-et-sports/) | pas-un-appel | refus | refus |  |
| 50 | Conseil départemental Val-de-Marne | [page](https://www.valdemarne.fr/le-conseil-departemental/appel-a-candidatures-restauration-ambulante-dans-les-parcs-departementaux) | appel | fiche juste | fiche juste |  |
