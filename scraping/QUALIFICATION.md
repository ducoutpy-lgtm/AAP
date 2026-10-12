# Qualification des sources

Généré le 2026-10-12 par `python scraping/qualification.py --rapport`. Verdict calculé à partir des
réponses du modèle local Ollama sur la page de rubrique gardée par `decouverte.py` ; sondage manuel ci-dessous.

**270 sources qualifiées sur 847 : 127 rubrique confirmée, 1 PDF seulement, 133 hors santé, 5 pas d'AAP, 4 à vérifier ; 577 sources sans page gardée (à vérifier).**

## Sondage manuel

31 verdicts relus sur la page d'origine : 26 accords, 5 désaccords (83 % d'accord).

| Source | Verdict du modèle | Verdict relu | Page |
|---|---|---|---|
| Directions.fr – appels à projet | rubrique confirmée | à vérifier | [page](https://www.directions.fr/appels-a-projet/) |
| Conseil départemental Gard | hors santé | rubrique confirmée | [page](https://www.gard.fr/information/appel-a-projets) |
| Interreg Sudoe | hors santé | rubrique confirmée | [page](https://interreg-sudoe.eu/fr/4eme-appel-a-projets/) |
| Fondation Le Souffle | hors santé | à vérifier | [page](https://www.lesouffle.org/appels-projets-recherche) |
| Ministère de l'Enseignement supérieur et de la Recherche | hors santé | à vérifier | [page](https://www.enseignementsup-recherche.gouv.fr/fr/appel-projets-appel-candidatures) |

## Par famille

| Famille | Qualifiées | rubrique confirmée | PDF seulement | hors santé | pas d'AAP | à vérifier | Sans page |
|---|---|---|---|---|---|---|---|
| ars | 19 | 19 | 0 | 0 | 0 | 0 | 0 |
| ministere | 46 | 5 | 0 | 38 | 0 | 3 | 104 |
| caisse-nationale | 23 | 8 | 0 | 14 | 1 | 0 | 243 |
| agence-nationale | 17 | 6 | 0 | 11 | 0 | 0 | 17 |
| fondation | 23 | 16 | 0 | 7 | 0 | 0 | 19 |
| europe | 5 | 0 | 0 | 5 | 0 | 0 | 8 |
| collectivite | 111 | 54 | 0 | 52 | 4 | 1 | 119 |
| societe-savante | 6 | 5 | 0 | 1 | 0 | 0 | 12 |
| etablissement | 10 | 7 | 0 | 3 | 0 | 0 | 21 |
| centrale-achat | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| autre | 10 | 7 | 1 | 2 | 0 | 0 | 30 |

## Sources confirmées

| Source | Famille | Forme | AAP visibles | Rubrique |
|---|---|---|---|---|
| Directions.fr – appels à projet | autre | html | 120 | [page](https://www.directions.fr/appels-a-projet/) |
| FHF Hauts-de-France – appels à projets | autre | html | 32 | [page](https://www.fhf-hdf.fr/appels-a-projets/) |
| IReSP | agence-nationale | html | 23 | [page](https://iresp.net/financements/programmes-et-appels/appel-a-projets-clos/) |
| Promotion Santé Occitanie – appels à projets | autre | html | 20 | [page](https://promotion-sante-occitanie.org/soutenir-vos-projets/veille-des-appels-a-projet/) |
| Fondation pour la Recherche Médicale (FRM) | fondation | html | 16 | [page](https://www.frm.org/fr/espace-chercheurs-aap-clotures) |
| Conseil départemental Maine-et-Loire | collectivite | html | 16 | [page](https://www.maine-et-loire.fr/aides-et-services/professionnels/appels-a-projets) |
| ARS Grand Est | ars | html | 15 | [page](https://www.grand-est.ars.sante.fr/liste-appels-projet-candidature) |
| Portail national des ARS | ars | html | 15 | [page](https://www.ars.sante.fr/liste-appels-projet-candidature-nationale) |
| Loiret – appels à projets | collectivite | html | 15 | [page](https://www.loiret.fr/mon-departement/les-appels-projets-du-departement) |
| Ville de Paris – appels à projets | collectivite | html | 15 | [page](https://www.paris.fr/appels-a-projets) |
| Conseil départemental Guadeloupe | collectivite | html | 15 | [page](https://www.cg971.fr/category/appel-a-projet/) |
| Conseil départemental Loiret | collectivite | html | 15 | [page](https://www.loiret.fr/mon-departement/les-appels-projets-du-departement) |
| ARS Bourgogne-Franche-Comté | ars | html | 14 | [page](https://www.bourgogne-franche-comte.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Nouvelle-Aquitaine | ars | html | 14 | [page](https://www.nouvelle-aquitaine.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Provence-Alpes-Côte d'Azur | ars | html | 14 | [page](https://www.paca.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Pays de la Loire | ars | html | 14 | [page](https://www.pays-de-la-loire.ars.sante.fr/liste-appels-projet-candidature) |
| Fondation de France – appels à projets des fondations abritées | fondation | html | 14 | [page](https://www.fondationdefrance.org/fr/appels-a-projets-fa) |
| Fondation de France – annuaire des fondations abritées | fondation | html | 14 | [page](https://www.fondationdefrance.org/fr/appels-a-projets) |
| Conseil départemental Indre-et-Loire | collectivite | html | 14 | [page](https://www.touraine.fr/services/espace-pros/appels-a-projets.html) |
| Conseil régional Grand Est | collectivite | html | 14 | [page](https://www.grandest.fr/aides/) |
| Conseil régional Occitanie | collectivite | html | 14 | [page](https://www.laregion.fr/Les-aides-et-appels-a-projets) |
| Fondation de France | fondation | html | 13 | [page](https://www.fondationdefrance.org/fr/appels-a-projets) |
| FIRAH | fondation | html | 13 | [page](https://www.firah.org/fr/laureats-des-appels-a-projets-precedents.html) |
| Fondation Crédit Mutuel Alliance Fédérale | fondation | html | 13 | [page](https://www.fondationdefrance.org/fr/appels-a-projets-fa) |
| ARS Centre-Val de Loire | ars | html | 12 | [page](https://www.centre-val-de-loire.ars.sante.fr/liste-appels-projet-candidature) |
| Institut national du cancer (INCa) | agence-nationale | html | 12 | [page](https://www.cancer.fr/professionnels-de-la-recherche/appels-a-projets-et-a-candidatures/nos-appels-a-projets) |
| Société Française de Dermatologie | societe-savante | html | 12 | [page](https://www.sfdermato.org/page-46-resultats-des-appels-a-projet-et-bourses-sfd) |
| Conseil départemental Pyrénées-Atlantiques | collectivite | html | 12 | [page](https://www.le64.fr/vous-souhaitez/les-appels-projets-en-cours) |
| Conseil départemental Ain | collectivite | html | 12 | [page](https://www.ain.fr/solutions/liste-des-appels-a-projet-du-departement-de-lain/) |
| GIRCI Méditerranée | etablissement | html | 12 | [page](https://gircimediterranee.fr/appel-a-projet) |
| Cancéropôle Est – appels à projets | etablissement | html | 12 | [page](https://www.canceropole-est.org/la-recherche-au-sein-du-canceropole-est/soutien-a-la-recherche/resultats-des-appels-a-projets-du-canceropole-est/) |
| ARS Île-de-France | ars | html | 11 | [page](https://www.iledefrance.ars.sante.fr/liste-appels-projet-candidature) |
| Conseil départemental Creuse | collectivite | mixte | 11 | [page](https://www.creuse.fr/Appels-a-projets-candidatures-55) |
| Conseil départemental Hautes-Pyrénées | collectivite | html | 11 | [page](https://www.hautespyrenees.fr/aides-et-subventions/appels-a-projets/) |
| Maison départementale des personnes handicapées (MDPH) - Hautes-Pyrénées | collectivite | html | 11 | [page](https://www.hautespyrenees.fr/aides-et-subventions/appels-a-projets/) |
| ARS Bretagne | ars | html | 10 | [page](https://www.bretagne.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Auvergne-Rhône-Alpes | ars | html | 10 | [page](https://www.auvergne-rhone-alpes.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Normandie | ars | html | 10 | [page](https://www.normandie.ars.sante.fr/liste-appels-projet-candidature) |
| Fondation Médéric Alzheimer | fondation | html | 10 | [page](https://www.fondation-mederic-alzheimer.org/appels-a-projets/) |
| Fondation de l'Avenir | fondation | html | 10 | [page](https://www.fondationdelavenir.org/chercheurs/appels-a-candidatures/) |
| Plateforme nationale pour la recherche sur la fin de vie | societe-savante | html | 10 | [page](https://www.plateforme-recherche-findevie.fr/articles) |
| Conseil départemental Hérault | collectivite | html | 10 | [page](https://herault.fr/TPL_CODE/TPL_AIDEPROJETLISTE/321-guide-des-aides-et-appels-a-projet.htm) |
| Conseil départemental Charente-Maritime | collectivite | html | 10 | [page](https://la.charente-maritime.fr/informations-officielles/appels-projets) |
| Conseil départemental Haute-Marne | collectivite | html | 10 | [page](https://haute-marne.fr/l-institution/appel-a-projets-et-a-manifestation/) |
| Conseil départemental Haute-Garonne | collectivite | html | 10 | [page](https://www.haute-garonne.fr/appels-projetscandidatures-en-cours) |
| Conseil départemental Cantal | collectivite | html | 10 | [page](https://www.cantal.fr/le-conseil-departemental/les-appels-a-projets/) |
| Cancéropôle Grand Ouest – appels à projets | etablissement | html | 10 | [page](https://www.canceropole-grandouest.com/appel-projets/) |
| ARS Hauts-de-France | ars | html | 9 | [page](https://www.hauts-de-france.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Mayotte | ars | html | 9 | [page](https://www.mayotte.ars.sante.fr/appels-projets-candidature-manifestation-dinteret) |
| Finistère – appels à projets | collectivite | html | 9 | [page](https://www.finistere.fr/le-conseil-departemental/appel-a-projets/) |
| Conseil départemental Finistère | collectivite | html | 9 | [page](https://www.finistere.fr/le-conseil-departemental/appel-a-projets/) |
| Conseil départemental Ille-et-Vilaine | collectivite | html | 9 | [page](https://www.ille-et-vilaine.fr/appels-projet) |
| Conseil départemental Bouches-du-Rhône | collectivite | html | 8 | [page](https://departement13.fr/mon-departement/ladministration/les-appels-projets-departementaux) |
| Conseil départemental Tarn-et-Garonne | collectivite | html | 8 | [page](https://www.tarnetgaronne.fr/) |
| Conseil départemental Val-d'Oise | collectivite | html | 8 | [page](https://www.valdoise.fr/108-appels-a-projets.htm) |
| CNSA (Caisse nationale de solidarité pour l'autonomie) | caisse-nationale | html | 7 | [page](https://www.cnsa.fr/appels-projets) |
| ARS Guadeloupe | ars | html | 7 | [page](https://www.guadeloupe.ars.sante.fr/liste-appels-projet-candidature) |
| ARS La Réunion | ars | html | 7 | [page](https://www.lareunion.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Guyane | ars | html | 7 | [page](https://www.guyane.ars.sante.fr/liste-appels-projet-candidature) |
| Appelaprojets.org | autre | html | 7 | [page](https://www.appelaprojets.org/appelprojet) |
| Inserm | agence-nationale | html | 7 | [page](https://pro.inserm.fr/) |
| Fondation Orange | fondation | html | 7 | [page](https://www.fondationorange.com/fr/le-calendrier-des-appels-projets) |
| Ville de Paris – politique de la ville | collectivite | html | 7 | [page](https://www.paris.fr/pages/repondre-a-un-appel-a-projets-5412) |
| Conseil départemental Haute-Savoie | collectivite | html | 7 | [page](https://hautesavoie.fr/le-departement/enquetes-publiques-appels-a-projets/) |
| Collectivité territoriale de Martinique | collectivite | mixte | 7 | [page](https://www.collectivitedemartinique.mq/appels-a-projet/) |
| Caisse de sécurité sociale (CSSM) de Mayotte - accueil de Mamoudzou | caisse-nationale | html | 7 | [page](https://www.cssm.fr/page/appels-a-projets-prevention-sante-2026) |
| GIRCI Grand Ouest | etablissement | html | 7 | [page](https://www.chu-hugo.fr/transitions/appels-a-projets/) |
| Fondation de l'AP-HP | etablissement | html | 6 | [page](https://www.fondationaphp.fr/nos-appels-a-projets/) |
| Conseil départemental Morbihan | collectivite | html | 6 | [page](https://www.morbihan.fr/le-conseil-departemental/appels-a-projets) |
| Conseil départemental Puy-de-Dôme | collectivite | html | 6 | [page](https://www.puy-de-dome.fr/appels-a-projets.html) |
| GIRCI SOHO (Sud-Ouest Outre-Mer Hospitalier) | etablissement | html | 6 | [page](https://www.girci-soho.fr/) |
| Uriopss Hauts-de-France | autre | html | 6 | [page](https://www.uriopss-hdf.fr/actualites) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Centre-Val de Loire | ministere | html | 6 | [page](https://centre-val-de-loire.dreets.gouv.fr/Marches-publics-et-appels-a-projets) |
| Société Française d'Étude et de Traitement de la Douleur (SFETD) | societe-savante | html | 5 | [page](https://www.sfetd-douleur.org/prix-et-appel-doffre/) |
| Conseil départemental Jura | collectivite | html | 5 | [page](https://www.jura.fr/appels-a-projets/) |
| Conseil départemental Var | collectivite | html | 5 | [page](https://var.fr/home/-/asset_publisher/GFXyOm7YlV2U/content/les-appels-a-projet/maximized?p_r_p_assetEntryId=1624415&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U_redirect=https%3A%2F%2Fvar.fr%2Fhome%3Fp_p_id%3Dcom_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U%26p_p_lifecycle%3D0%26p_p_state%3Dnormal%26p_p_mode%3Dview%26p_r_p_assetEntryId%3D1624415%26_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U_cur%3D0%26p_r_p_resetCur%3Dfalse) |
| Conseil départemental La Réunion | collectivite | html | 5 | [page](https://www.departement974.fr/avis-appels-projets-enquetes-publiques) |
| Conseil départemental Somme | collectivite | html | 5 | [page](https://www.somme.fr/departement/votre-departement/linstitution/les-appels-a-projets/) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Nord-Picardie | caisse-nationale | html | 5 | [page](https://www.carsat-hdf.fr/home/partenaires/partenaires-de-l-action-sociale/appel-a-projet.html) |
| Agence du numérique en santé (ANS) | agence-nationale | html | 4 | [page](https://esante.gouv.fr/lagence/appels-a-projets) |
| Fondation des Hôpitaux | fondation | html | 4 | [page](https://appel-a-projet.fondationhopitaux.fr/) |
| ARS Occitanie | ars | html | 4 | [page](https://www.occitanie.ars.sante.fr/liste-appels-projet-candidature) |
| Conseil départemental Gers | collectivite | html | 4 | [page](https://www.gers.fr/aides-infos-pratiques/appels-a-projets-et-candidatures) |
| Société Française de Médecine d'Urgence (SFMU) | societe-savante | html | 3 | [page](https://www.sfmu.org/fr/la-recherche/appel-a-projet/) |
| ARS Corse | ars | html | 3 | [page](https://www.corse.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Martinique | ars | html | 3 | [page](https://www.martinique.ars.sante.fr/liste-appels-projet-candidature) |
| France Alzheimer | fondation | html | 3 | [page](https://www.francealzheimer.org/nos-actions-nos-missions/soutien-a-recherche/les-appels-a-projets-france-alzheimer/) |
| Société Francophone du Diabète (SFD) | societe-savante | html | 3 | [page](https://www.sfdiabete.org/medical/la-recherche/allocations-de-recherche-et-prix) |
| Conseil départemental Haute-Vienne | collectivite | html | 3 | [page](https://www.haute-vienne.fr/votre-conseil-departemental/appels-a-projets-du-departement) |
| Conseil départemental Eure | collectivite | html | 3 | [page](https://eureennormandie.fr/accueil/le-departement/nos-appels-a-projets/) |
| Mairie de Marseille | collectivite | html | 3 | [page](https://www.marseille.fr/economie/commerce/appels-manifestation-d-interet-de-la-ville-de-marseille) |
| Deux-Sèvres – appels à projets | collectivite | html | 2 | [page](https://www.deux-sevres.fr/services-en-ligne/tous-les-appels-projets) |
| Conseil départemental Pyrénées-Orientales | collectivite | html | 2 | [page](https://www.ledepartement66.fr/dossier/les-appels-a-projets/) |
| Conseil départemental Manche | collectivite | html | 2 | [page](https://www.manche.fr/les-appels-a-projets/) |
| Conseil départemental Charente | collectivite | html | 2 | [page](https://www.lacharente.fr/actualite/appel-a-projets) |
| Conseil départemental Deux-Sèvres | collectivite | html | 2 | [page](https://www.deux-sevres.fr/services-en-ligne/tous-les-appels-projets) |
| Mairie de Reims | collectivite | html | 2 | [page](https://www.reims.fr/) |
| Mairie de Villeurbanne | collectivite | html | 2 | [page](https://www.villeurbanne.fr/) |
| Maison de l'Autonomie (MDA) - Alpes-Maritimes | collectivite | html | 2 | [page](https://mda.departement06.fr/appel-projets) |
| Essonne – Commission des financeurs | collectivite | html | 1 | [page](https://demarche.numerique.gouv.fr/commencer/appel-a-projet-commission-des-financeurs-de-la-pre) |
| Conseil départemental Essonne | collectivite | html | 1 | [page](https://www.essonne.fr/appel-projets-candidatures) |
| Ministère de la Culture – Culture, santé, handicap et dépendance | ministere | html | 1 | [page](https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/appels-a-projets-candidatures/culture-sante-handicap-et-dependance) |
| Direction générale du Trésor – FASEP santé | ministere | html | 1 | [page](https://www.tresor.economie.gouv.fr/Articles/2026/06/25/appel-a-projets-fasep-2026-solutions-innovantes-pour-le-developpement-et-la-modernisation-des-systemes-de-sante) |
| Carsat Nord-Est – AAP des partenaires | caisse-nationale | html | 1 | [page](https://www.carsat-nordest.fr/home/partenaires/etre-partenaire-de-l-action-soci/appels-a-projets-des-partenaires/appel-a-projets-prevention-confe.html) |
| Fondation APICIL | fondation | html | 1 | [page](https://www.fondation-apicil.org/appel-a-projets/) |
| Fondation Malakoff Humanis Handicap | fondation | html | 1 | [page](https://newsroom.malakoffhumanis.com/actualites/la-fondation-malakoff-humanis-handicap-lance-un-appel-a-projet-pour-soutenir-les-innovations-technologiques-et-numeriques-permettant-de-favoriser-lacces-a-lemploi-et-a-la-sante-des-personnes-en-situation-de-handicap-e6dd-63a59.html) |
| Métropole de Lyon – Commission des financeurs | collectivite | html | 1 | [page](https://commissiondesfinanceurs.grandlyon.com/) |
| Collectivité européenne d'Alsace – Commission des financeurs | collectivite | html | 1 | [page](https://www.alsace.eu/actualites/appel-a-projets-2026-commission-financeurs) |
| ANSM | agence-nationale | html | 1 | [page](https://ansm.sante.fr/actualites/renouvellement-du-comite-dinterface-avec-les-associations-de-patients-appel-a-candidatures-ouvert-jusquau-30-septembre-2026) |
| Health Data Hub | agence-nationale | html | 1 | [page](https://health-data-hub.fr/aap-gd4h) |
| Fondation AÉSIO | fondation | html | 1 | [page](https://fondation.aesio.fr/actualites/appel-projets-reponses-questions-frequentes) |
| Fondation Force | fondation | html | 1 | [page](https://fondation-force.fr/appel-a-projets-2026-2/) |
| Fondation Paralysie Cérébrale | fondation | html | 1 | [page](https://fondationparalysiecerebrale.org/appels-a-projets/) |
| GIRCI Île-de-France | etablissement | html | 1 | [page](https://girci-idf.fr/projets/appel-a-projets-recherche-en-soins-apreso-2026/) |
| Conseil territorial de Saint-Pierre-et-Miquelon | collectivite | html | 1 | [page](https://www.spm-ct975.fr/actualite/service-daccompagnement-medico-social-pour-adultes-en-situation-de-handicap/) |
| Conseil départemental Sarthe | collectivite | html | 1 | [page](https://www.sarthe.fr/departement-sarthe/solidarite-autonomie/appels-projets) |
| Conseil départemental Alpes-de-Haute-Provence | collectivite | html | 1 | [page](https://www.mondepartement04.fr/insertion/appel-a-projets-pdi) |
| Conseil départemental Lozère | collectivite | html | 1 | [page](https://lozere.fr/lamenagement-du-territoire/developpement-economique/appels-projets.html) |
| Mairie de Orléans | collectivite | html | 1 | [page](https://www.orleans.fr/actualites/detail/contrat-de-ville-appel-a-projets) |
| Caisse générale de sécurité sociale (CGSS) - Guadeloupe | caisse-nationale | html | 1 | [page](https://www.cgss-guadeloupe.fr/18-actualites/actualites-assures/344-appel-a-projet-de-la-conference-des-financeurs-2026-2027.html) |
| Mutualité sociale agricole (MSA) Bourgogne - accueil d'Autun | caisse-nationale | html | 1 | [page](https://bourgogne.msa.fr/lfp/appel-projets-msa-solidaire/2026) |
| Caisse générale de sécurité sociale (CGSS) - Guyane | caisse-nationale | html | 1 | [page](https://www.cgss-guyane.fr/appel-a-projets/appel-a-projet-fnpeis-2026/) |
| Mutualité sociale agricole (MSA) Berry-Touraine - accueil de Blois | caisse-nationale | html | 1 | [page](https://berry-touraine.msa.fr/lfp/appel-a-projets) |
| Fédération Addiction | autre | html | 1 | [page](https://www.federationaddiction.fr/actualites/publics/femmes/lancement-de-lappel-a-candidatures-pour-faire-partie-du-groupe-de-travail-femmes-addictions/) |
| Uriopss PACA-Corse | autre | pdf | 1 | [page](https://www.uriopss-pacac.fr/actualites/recensement-des-appels-projets-0) |
| Admical | autre | html | 1 | [page](https://admical.org/actualit%C3%A9s/la-fondation-dentreprise-ocirp-lance-son-appel-projets-lieux-alternatifs-du-prendre-soin) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Occitanie | ministere | html | 1 | [page](https://occitanie.dreets.gouv.fr/) |
| DGOS – programmes de recherche hospitalière (PHRC, PHRIP, PREPS, PRME) | ministere | html | 0 | [page](https://sante.gouv.fr/systeme-de-sante/innovation-et-recherche/l-innovation-et-la-recherche-clinique/appels-a-projets/programmes-recherche) |

## Sources à vérifier à la main

| Source | Raison | Page |
|---|---|---|
| Préfecture - Rhône | FileNotFoundError: [Errno 2] No such file or directory: 'C:\\Users\\pierr\\Documents\\Projets Claude Code\\AAP\\scraping\\decouverte\\prefecture-rhone\\rubrique.html' | [page](https://www.rhone.gouv.fr/) |
| Préfecture - Morbihan | FileNotFoundError: [Errno 2] No such file or directory: 'C:\\Users\\pierr\\Documents\\Projets Claude Code\\AAP\\scraping\\decouverte\\prefecture-morbihan\\rubrique.html' | [page](https://www.morbihan.gouv.fr/Publications/Appels-a-manifestation-d-interet/Ouverture-de-l-appel-a-manifestation-d-interet-2021-pour-la-labellisation-Point-conseil-budget) |
| Direction de l'économie, de l'emploi, du travail et des solidarités (DEETS) - Guadeloupe | La page web de l'organisme DEETS Guadeloupe ne présente pas d'appels à projets, candidatures, manifestations d'intérêt, bourses ou subventions ouverts ou clos. Elle est une page d'information sur la gestion des cookies. | [page](https://guadeloupe.deets.gouv.fr/) |
| Maison départementale des personnes handicapées (MDPH) - Moselle | La page web de la Maison départementale des personnes handicapées de Moselle ne présente pas d'appel à projets, appel à candidatures, appel à manifestation d'intérêt, bourse ou subvention auquel on peut candidater. Elle est une page d'information sur les services offerts par l'organisme. | [page](https://www.moselle.fr/jcms/pl_14027/fr/maison-departementale-des-personnes-handicapees) |
