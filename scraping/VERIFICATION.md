# Vérification des fiches assistée par le modèle

Changement OpenSpec `verification-assistee-haiku`. Rapport du 2026-10-15. Consigne version 1.
Un champ est douteux quand la fiche contredit la page (faux), invente une valeur (fabriqué) ou en oublie une
(manquant). Ce rapport ne vaut pas relecture humaine : la mention « relue » est réservée aux verdicts de
Monsieur DUCOUT, qui relit d'abord les fiches douteuses.

Fiches vérifiées : 283 ; sans doute : 129 ; douteuses : 154 ; pages qui ne décrivent pas un appel précis selon le modèle : 39.

## Verdicts par champ

| Champ | Juste | Faux | Fabriqué | Manquant | Vide | Incertain |
|---|---|---|---|---|---|---|
| titre | 257 | 2 | 1 | 0 | 0 | 23 |
| financeur | 228 | 3 | 1 | 0 | 0 | 51 |
| date_ouverture | 159 | 19 | 22 | 0 | 22 | 61 |
| date_cloture | 138 | 5 | 0 | 18 | 87 | 35 |
| montant_min | 11 | 3 | 0 | 1 | 247 | 21 |
| montant_max | 31 | 7 | 1 | 0 | 223 | 21 |
| enveloppe_globale | 3 | 2 | 0 | 14 | 244 | 20 |
| territoire | 195 | 4 | 0 | 0 | 6 | 78 |
| description | 136 | 131 | 0 | 0 | 0 | 16 |

## Part de fiches douteuses par source

| Source | Vérifiées | Douteuses | Part |
|---|---|---|---|
| fondation_de_france | 22 | 13 | 59 % |
| ars-pays-de-la-loire | 11 | 8 | 72 % |
| ars-grand-est | 12 | 7 | 58 % |
| ars-ile-de-france | 8 | 6 | 75 % |
| ars-centre-val-de-loire | 8 | 5 | 62 % |
| canceropole-grand-ouest-appels-a-projets | 8 | 5 | 62 % |
| inserm | 7 | 5 | 71 % |
| ars-hauts-de-france | 9 | 4 | 44 % |
| ars-guyane | 7 | 4 | 57 % |
| ars-la-reunion | 7 | 4 | 57 % |
| conseil-departemental-pyrenees-atlantiques | 6 | 4 | 66 % |
| societe-francaise-de-medecine-d-urgence-sfmu | 4 | 4 | 100 % |
| girci-grand-ouest | 4 | 4 | 100 % |
| ars-normandie | 11 | 3 | 27 % |
| conseil-regional-la-reunion | 9 | 3 | 33 % |
| ars-nouvelle-aquitaine | 8 | 3 | 37 % |
| ars-mayotte | 6 | 3 | 50 % |
| cnsa | 4 | 3 | 75 % |
| ars-corse | 3 | 3 | 100 % |
| region-ile-de-france-aides-et-appels-a-projets | 3 | 3 | 100 % |
| conseil-departemental-hautes-pyrenees | 3 | 3 | 100 % |
| conseil-regional-grand-est | 3 | 3 | 100 % |
| ars-bourgogne-franche-comte | 11 | 2 | 18 % |
| ars-auvergne-rhone-alpes | 7 | 2 | 28 % |
| ars-occitanie | 3 | 2 | 66 % |
| ars-guadeloupe | 3 | 2 | 66 % |
| caisse-d-assurance-retraite-et-de-la-sante-au-travail-carsat-languedoc-roussillon | 3 | 2 | 66 % |
| fondation-des-hopitaux | 3 | 2 | 66 % |
| fondation-mederic-alzheimer | 3 | 2 | 66 % |
| finistere-appels-a-projets | 3 | 2 | 66 % |
| conseil-departemental-essonne | 3 | 2 | 66 % |
| fondation-de-france | 2 | 2 | 100 % |
| fondation-arc | 2 | 2 | 100 % |
| ministere-de-l-enseignement-superieur-et-de-la-recherche | 2 | 2 | 100 % |
| ville-de-paris-appels-a-projets | 2 | 2 | 100 % |
| ars-provence-alpes-cote-d-azur | 8 | 1 | 12 % |
| ars-bretagne | 5 | 1 | 20 % |
| portail-national-des-ars | 4 | 1 | 25 % |
| ars-martinique | 3 | 1 | 33 % |
| institut-national-du-cancer-inca | 3 | 1 | 33 % |
| conseil-departemental-val-d-oise | 3 | 1 | 33 % |
| mutualite-sociale-agricole-msa-sud-aquitaine-accueil-de-saint-pierre-du-mont | 2 | 1 | 50 % |
| institut-de-france-fondations | 2 | 1 | 50 % |
| agence-du-numerique-en-sante-ans | 2 | 1 | 50 % |
| agence-de-l-eau-loire-bretagne | 2 | 1 | 50 % |
| rhone-appels-a-candidatures-prevention | 2 | 1 | 50 % |
| conseil-departemental-la-reunion | 2 | 1 | 50 % |
| conseil-departemental-ain | 2 | 1 | 50 % |
| ars_idf | 1 | 1 | 100 % |
| ars_idf_local | 1 | 1 | 100 % |
| caisse-d-assurance-retraite-et-de-la-sante-au-travail-carsat-nord-picardie | 1 | 1 | 100 % |
| mutualite-sociale-agricole-msa-beauce-coeur-de-loire-accueil-de-chartres | 1 | 1 | 100 % |
| fondation-de-l-avenir | 1 | 1 | 100 % |
| prefecture-rhone | 1 | 1 | 100 % |
| interreg-sudoe | 1 | 1 | 100 % |
| essonne-commission-des-financeurs | 1 | 1 | 100 % |
| metropole-de-lyon-commission-des-financeurs | 1 | 1 | 100 % |
| conseil-departemental-herault | 1 | 1 | 100 % |
| conseil-departemental-var | 1 | 1 | 100 % |
| conseil-departemental-ille-et-vilaine | 1 | 1 | 100 % |
| conseil-departemental-haute-savoie | 1 | 1 | 100 % |
| conseil-departemental-savoie | 1 | 1 | 100 % |
| conseil-departemental-correze | 1 | 1 | 100 % |
| conseil-departemental-gers | 3 | 0 | 0 % |
| fhf-hauts-de-france-appels-a-projets | 2 | 0 | 0 % |
| appelaprojets-org | 2 | 0 | 0 % |
| agence-de-l-eau-seine-normandie | 1 | 0 | 0 % |
| prefecture-morbihan | 1 | 0 | 0 % |
| direction-regionale-de-l-alimentation-de-l-agriculture-et-de-la-foret-draaf-bourgogne-franche-comte-siege-de-dijon | 1 | 0 | 0 % |
| fondation-de-l-ap-hp | 1 | 0 | 0 % |
| girci-mediterranee | 1 | 0 | 0 % |
| uriopss-hauts-de-france | 1 | 0 | 0 % |
| promotion-sante-occitanie-appels-a-projets | 1 | 0 | 0 % |
| admical | 1 | 0 | 0 % |
| loiret-appels-a-projets | 1 | 0 | 0 % |
| conseil-departemental-pyrenees-orientales | 1 | 0 | 0 % |
| mairie-de-brest | 1 | 0 | 0 % |

## Fiches douteuses, à relire en premier

| Source | Titre | Champs douteux (verdict, valeur lue sur la page) | Adresse |
|---|---|---|---|
| fondation-arc | 55th Fondation ARC Léopold Griffuel Awards | date_ouverture (fabrique) ; date_cloture (manquant, page : 2026-09-21) ; montant_min (manquant, page : 200000) ; description (faux) | https://www.fondation-arc.org/appels-a-projets/55th-fondation-arc-leopold-griffuel-awards/ |
| ars-corse | Renforcement de l’offre en psychiatrie périnatale et psychiatrie de l’ | montant_max (faux, page : 350000) ; enveloppe_globale (manquant, page : 350000) ; description (faux) | https://www.corse.ars.sante.fr/renforcement-de-loffre-en-psychiatrie-perinatale-et-psychiatrie-de-lenfant-et-de-ladolescent-2026 |
| ars-corse | ESMS numérique 2026 - Enfance en situation de handicap et protection d | montant_min (faux, page : 21000) ; montant_max (faux, page : 36000) ; description (faux) | https://www.corse.ars.sante.fr/esms-numerique-2026-enfance-en-situation-de-handicap-et-protection-de-lenfance-0 |
| ars-corse | Sécurisation des établissements de santé en corse | montant_max (faux) ; enveloppe_globale (manquant, page : 25000000) ; description (faux) | https://www.corse.ars.sante.fr/securisation-des-etablissements-de-sante-en-corse-2 |
| ars-bourgogne-franche-comte | AAC - Dispositif « Parcours Hab’ » Jura et Haute-Saône | date_ouverture (faux, page : 2026-10-01) ; date_cloture (faux, page : 2026-10-15) ; description (faux) | https://www.bourgogne-franche-comte.ars.sante.fr/aac-dispositif-parcours-hab-jura-et-haute-saone |
| ars-occitanie | MNPEA 2026 – Renforcement de l'offre de psychiatrie périnatale et de p | montant_max (fabrique) ; enveloppe_globale (faux, page : 10000000 € national, dont 750000 € pour l'Occitanie) ; description (faux) | https://www.occitanie.ars.sante.fr/mnpea-2026-renforcement-de-loffre-de-psychiatrie-perinatale-et-de-psychiatrie-de-lenfant-et-de |
| ars-guyane | Fonds amorçage Recherche «Guyane Santé 2030» | date_ouverture (faux, page : 2024-03-30) ; enveloppe_globale (manquant, page : 3000000) ; description (faux) | https://www.guyane.ars.sante.fr/fonds-amorcage-recherche-guyane-sante-2030 |
| caisse-d-assurance-retraite-et-de-la-sante-au-travail-carsat-languedoc-roussillon | Appel à projets « Innovation et Silver autonomie » - 2e édition | date_ouverture (faux, page : 2026-11-06) ; territoire (faux, page : Aude, Gard, Hérault, Lozère, Pyrénées-Orientales) ; description (faux) | https://www.carsat-lr.fr/home/partenaires/actualites-partenaire/toutes%20les%20actualites/aap-innov-autonomie.details-actualite.html |
| institut-de-france-fondations | Appel à projets 'Equipements de recherche' 2027 - Fondation Lefoulon D | montant_max (faux, page : 500000) ; enveloppe_globale (manquant, page : 1000000) ; description (faux) | https://fondations.institutdefrance.fr/aap-equipement-fondation-lefoulon-delalande-2027-1 |
| agence-de-l-eau-loire-bretagne | APPEL À PROJETS 2026 : PAIEMENTS POUR SERVICES ENVIRONNEMENTAUX (PSE)  | date_ouverture (faux) ; montant_max (faux, page : 40000000) ; enveloppe_globale (manquant, page : 40000000) | https://aides-redevances.eau-loire-bretagne.fr/home/aides/appels-a-projets-1/aap-paiements-pour-services-environnementaux-pse.html |
| canceropole-grand-ouest-appels-a-projets | AAC Journée Scientifique Cancer-Cerveau-Cognition | financeur (faux, page : Autre Cancéropôle) ; date_ouverture (fabrique) ; territoire (faux, page : national) | https://www.canceropole-grandouest.com/appel-projets/aac-journee-scientifique-cancer-cerveau-cognition/ |
| interreg-sudoe | 4ème appel à projets Interreg Sudoe : agir face aux incendies et au vi | montant_max (faux) ; enveloppe_globale (manquant, page : 10000000) ; description (faux, page : Budget : 4 000 000 € pour les incendies et 1 000 000 € pour le vieillissement ; dotation FEDER affichée de 10 000 000 €. Un seul projet structurant sera programmé par priorité (2 au total).) | https://interreg-sudoe.eu/fr/4eme-appel-a-projets/ |
| region-ile-de-france-aides-et-appels-a-projets | Programme de sensibilisation sur l'Histoire de la Shoah et sur les val | date_ouverture (faux) ; date_cloture (manquant, page : 2027-06-30) ; description (faux) | https://www.iledefrance.fr/aides-et-appels-a-projets/programme-de-sensibilisation-sur-lhistoire-de-la-shoah-et-sur-les-valeurs-de-la-republique |
| region-ile-de-france-aides-et-appels-a-projets | Sensibilisation lycéens développement durable- Groupe SOS : AlimenTaSa | date_ouverture (faux) ; date_cloture (manquant, page : 2027-06-30) ; description (faux) | https://www.iledefrance.fr/aides-et-appels-a-projets/sensibilisation-lyceens-developpement-durable-groupe-sos-alimentasante-alimentation-durable |
| conseil-departemental-ille-et-vilaine | Appel à projets pour la création de 37 places d’hébergement permanent  | date_ouverture (fabrique) ; date_cloture (faux, page : 2026-09-25) ; description (faux) | https://www.ille-et-vilaine.fr/les-aides-du-departement/appel-projets-medico-sociaux-portant-creation-dans-le-departement-dille-et |
| conseil-departemental-hautes-pyrenees | APPEL A CANDIDATURES 2026 : ATTRIBUTION D’UNE DOTATION COMPLÉMENTAIRE  | date_ouverture (fabrique) ; montant_min (faux) ; description (faux) | https://www.hautespyrenees.fr/aides-et-subventions/appels-a-projets/appel-a-candidatures-2026-attribution-dune-dotation-complementaire-aux-services-autonomie-a-domicile-sad/ |
| fondation_de_france | Recherche fondamentale et translationnelle sur le cancer : étude des r | date_ouverture (fabrique) ; date_cloture (manquant) ; description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/cancer-etude-de-la-resistance-aux-traitements |
| fondation_de_france | Vieillir acteur et citoyen de son territoire | date_ouverture (fabrique) ; date_cloture (manquant) ; description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/vieillir-acteur-et-citoyen-de-son-territoire |
| ars_idf_local | Contrat d'Allocation d'Études - Campagne 2026 | date_ouverture (fabrique) ; date_cloture (faux, page : 2026-10-16) | https://www.iledefrance.ars.sante.fr/contrat-dallocation-detudes-campagne-2026 |
| ars-ile-de-france | Dispositifs pour favoriser les admissions directes en hospitalisation  | enveloppe_globale (manquant, page : 910000) ; description (faux) | https://www.iledefrance.ars.sante.fr/dispositifs-pour-favoriser-les-admissions-directes-en-hospitalisation-domicile-had-en-lien-avec-le |
| ars-ile-de-france | Contrat d’Allocation d’Études - Campagne 2026 | date_ouverture (faux, page : 2025-04-02) ; description (faux, page : L'ARS IDF lance son 7ème appel à candidatures du Contrat d'Allocation d'Études (CAE) ; les établissements sanitaires et ESMS PDS peuvent verser une allocation forfaitaire aux étudiants en dernière année, en contrepartie d'un engagement de 18 mois ; à titre expérimental, 36 mois pour les établissements sanitaires dès l'avant-dernière année. L'ARS prend en charge 50% du coût total.) | https://www.iledefrance.ars.sante.fr/contrat-dallocation-detudes-campagne-2026 |
| ars-centre-val-de-loire | Dispositifs d’astreinte infirmier diplômé d'état (IDE) de nuit | territoire (faux, page : Centre-Val de Loire (6 départements)) ; description (faux) | https://www.centre-val-de-loire.ars.sante.fr/dispositifs-dastreinte-infirmier-diplome-detat-ide-de-nuit |
| ars-grand-est | Création d'une équipe mobile santé mentale dans les QPV - 67 | territoire (faux, page : Bas-Rhin) ; description (faux) | https://www.grand-est.ars.sante.fr/creation-dune-equipe-mobile-sante-mentale-dans-les-qpv-67 |
| cnsa | Investissement en habitat inclusif - 2026 | enveloppe_globale (manquant, page : 10500000) ; description (faux) | https://www.cnsa.fr/appels-projets/investissement-en-habitat-inclusif-2026 |
| societe-francaise-de-medecine-d-urgence-sfmu | Bourse de Recherche et de Mobilité | date_ouverture (fabrique) ; description (faux) | https://www.sfmu.org/fr/la-recherche/bourse/ |
| ars-hauts-de-france | Représentants des usagers en Commissions des usagers (CDU) des établis | date_ouverture (faux) ; description (faux) | https://www.hauts-de-france.ars.sante.fr/representants-des-usagers-en-commissions-des-usagers-cdu-des-etablissements-de-sante-2025-2028 |
| ars-normandie | Financement d’équipements à destination des professionnels exerçant da | date_ouverture (faux, page : 2026-08-05) ; description (faux) | https://www.normandie.ars.sante.fr/financement-dequipements-destination-des-professionnels-exercant-dans-les-etablissements-medico-0 |
| ars-normandie | Renforcement régional de l’offre en psychiatrie de l’enfant et de l’ad | enveloppe_globale (manquant, page : 1684408) ; description (faux) | https://www.normandie.ars.sante.fr/renforcement-regional-de-loffre-en-psychiatrie-de-lenfant-et-de-ladolescent-pour-lannee-2026 |
| ars-pays-de-la-loire | Déploiement de la mission centre de ressources territorial pour les pe | enveloppe_globale (faux, page : 200000000) ; description (faux) | https://www.pays-de-la-loire.ars.sante.fr/deploiement-de-la-mission-centre-de-ressources-territorial-pour-les-personnes-agees-maine-et-loire |
| ars-guyane | AAP "psychiatrie périnatale et pédopsychiatrie 2026" | montant_max (faux, page : 200000) ; enveloppe_globale (manquant, page : 200000) | https://www.guyane.ars.sante.fr/aap-psychiatrie-perinatale-et-pedopsychiatrie-2026 |
| ars-guyane | Recherche Santé Environnement «Guyane Santé 2030» | enveloppe_globale (manquant, page : 3000000) ; description (faux) | https://www.guyane.ars.sante.fr/recherche-sante-environnement-guyane-sante-2030 |
| portail-national-des-ars | CRSA de Mayotte : représentants des associations agréées d'usagers du  | date_ouverture (faux, page : 2026-10-05) ; description (faux) | https://www.mayotte.ars.sante.fr/crsa-de-mayotte-representants-des-associations-agreees-dusagers-du-systeme-de-sante |
| caisse-d-assurance-retraite-et-de-la-sante-au-travail-carsat-nord-picardie | Soutien à l’autonomie des locataires du parc social (clôturé) | date_ouverture (fabrique) ; date_cloture (manquant, page : 2026-06-19) | https://www.carsat-hdf.fr/home/partenaires/partenaires-de-l-action-sociale/appel-a-projet/soutien-a-l-autonomie-des-loca-1.html |
| caisse-d-assurance-retraite-et-de-la-sante-au-travail-carsat-languedoc-roussillon | Appel à projets « Innovation et Silver autonomie » | date_ouverture (faux, page : 2026-11-06) ; date_cloture (manquant, page : 2026-10-30) | https://www.carsat-lr.fr/home/partenaires/actualites-partenaire/toutes%20les%20actualites/aap-innov-autonomie.html |
| mutualite-sociale-agricole-msa-sud-aquitaine-accueil-de-saint-pierre-du-mont | L'appel à projets en faveur des aidants familiaux | date_cloture (manquant, page : 2026-07-31) ; description (faux, page : Résumé fidèle : soutien financier pour des initiatives en faveur des aidants familiaux (information, formations, soutien psychologique, accompagnement, répit, etc.), avec la page annonçant 3 dates limites mais n'en listant que deux : 31 janvier 2026 et 31 juillet 2026.) | https://sudaquitaine.msa.fr/lfp/web/msa-sud-aquitaine/appel-%C3%A0-projets-aidants-familiaux |
| fondation-des-hopitaux | Fonds d'Aide d'Urgence Social 2026 | date_cloture (faux, page : 2027-10-01) ; description (faux) | https://appel-a-projet.fondationhopitaux.fr/fonds-daide-durgence-social-2024-1 |
| agence-du-numerique-en-sante-ans | Extension de l’Appel à Projets « Adoption des Innovations » | date_ouverture (faux) ; date_cloture (manquant, page : 2026-11-30) | https://esante.gouv.fr/extension-de-l-appel-projets-adoption-des-innovations |
| inserm | Technologies de rupture en cancérologie (TREK) | date_ouverture (faux, page : 2026-10-01) ; description (faux) | https://pro.inserm.fr/rubriques/appels-a-projets/strategie-decennale-cancer-2021-2030/technologies-de-rupture-en-cancerologie-trek |
| ministere-de-l-enseignement-superieur-et-de-la-recherche | Appel à candidatures pour la co-présidence du comité mixte du programm | titre (fabrique) ; description (faux) | https://www.enseignementsup-recherche.gouv.fr/fr/appel-candidatures-pour-la-co-presidence-du-comite-mixte-du-programme-de-cooperation-scientifique-et-101411 |
| societe-francaise-de-medecine-d-urgence-sfmu | Appel à projet - IRU 2028 | date_ouverture (fabrique) ; description (faux) | https://www.sfmu.org/fr/la-recherche/la-recherche/initiative-recherche-urgence/ |
| societe-francaise-de-medecine-d-urgence-sfmu | Appel à projet - IRU 2028 | date_ouverture (fabrique) ; description (faux) | https://www.sfmu.org/la-recherche/la-recherche/initiative-recherche-urgence/ |
| girci-grand-ouest | Jeune Chercheur Mobilité (JCM) | date_cloture (manquant, page : 2026-05-04) ; description (faux) | https://www.chu-hugo.fr/jeune-chercheur-mobilite-jcm/ |
| girci-grand-ouest | AAP FHU (Fédérations Hospitalo-Universitaires) | date_cloture (faux, page : 2026-06-15) ; description (faux, page : Appel à projets du GCS HUGO pour labelliser 8 Fédérations Hospitalo-Universitaires (FHU) interrégionales (Bretagne, Centre-Val de Loire, Pays de la Loire), visant à renforcer la synergie entre soins, enseignement et recherche.) | https://www.chu-hugo.fr/aap-fhu/ |
| girci-grand-ouest | PHRC-Interrégional | enveloppe_globale (manquant, page : 2520000) ; description (faux) | https://www.chu-hugo.fr/phrc-interregional/ |
| canceropole-grand-ouest-appels-a-projets | Fondation Maladies Rares : Appel à projets GRI France – « GRI-related  | date_ouverture (fabrique) ; date_cloture (manquant, page : 2027-01-07) | https://www.canceropole-grandouest.com/appel-projets/fondation-maladies-rares-appel-a-projets-gri-france-gri-related-disorders/ |
| essonne-commission-des-financeurs | Appel à projet Commission des financeurs de la prévention de la perte  | date_ouverture (fabrique) ; description (faux) | https://demarche.numerique.gouv.fr/commencer/appel-a-projet-commission-des-financeurs-de-la-pre#contenu |
| rhone-appels-a-candidatures-prevention | Appel à manifestation d'intérêt 2027 CPOM SAD | montant_min (faux, page : incertain) ; description (faux) | https://www.rhone.fr/jcms/pl01_2125377/fr/appel-a-manifestation-d-interet-2027-cpom-sad |
| region-ile-de-france-aides-et-appels-a-projets | Programme Numérique responsable "Mieux comprendre pour mieux utiliser" | date_ouverture (faux) ; date_cloture (manquant, page : 2027-06-30) | https://www.iledefrance.fr/aides-et-appels-a-projets/programme-numerique-responsable-mieux-comprendre-pour-mieux-utiliser-avec-lassociation-e-enfance |
| conseil-departemental-var | Aides aux associations - Téléservices | financeur (faux, page : Var) ; description (faux) | https://teleservices.var.fr/aides-aux-associations |
| conseil-departemental-haute-savoie | Appel à projet Service d’Accompagnement Médico-Social pour Adultes Han | date_ouverture (faux) ; date_cloture (manquant, page : 2026-11-22) | https://hautesavoie.fr/le-departement/enquetes-publiques-appels-a-projets/appels-a-projets/appel-a-projet-service-daccompagnement-medico-social-pour-adultes-handicapes-samsah/ |
| conseil-departemental-savoie | Appel à projets Commission des Financeurs pour la Prévention de la Per | date_ouverture (fabrique) ; description (faux) | https://www.savoie.fr/web/sw_180135/appel-a-projets-commission-des-financeurs-pour-la-prevention-de-la-perte-d-autonomie-2027-2029 |
| conseil-departemental-correze | Actions collectives de prévention de la perte d'autonomie en faveur de | date_ouverture (fabrique) ; description (faux) | https://www.correze.fr/le-departement/les-appels-projets/les-appels-projets-autonomie |
| conseil-departemental-hautes-pyrenees | APPEL A PROJETS : INVESTISSEMENT EN FAVEUR DES ETABLISSEMENTS MEDICO-S | date_ouverture (fabrique) ; description (faux) | https://www.hautespyrenees.fr/aides-et-subventions/appels-a-projets/appel-a-projets-investissement-en-faveur-des-etablissements-medico-sociaux-ems-volet-2-travaux-deconomie-denergie-et-projets-structurants/ |
| conseil-departemental-pyrenees-atlantiques | APPEL A PROJETS CREATION DE DISPOSITIFS EXPERIMENTAUX DE 9 A 12 PLACES | financeur (faux) ; description (faux) | https://www.le64.fr/appel-projets-creation-de-dispositifs-experimentaux-de-9-12-places-dhebergement-pour-des-jeunes |
| conseil-departemental-pyrenees-atlantiques | APPEL À PROJETS CULTURE SENIORS 2027 | date_ouverture (faux, page : 2025-09-22) ; description (faux) | https://le64.fr/appel-projets-culture-seniors-2027 |
| conseil-departemental-val-d-oise | Appel à projets 2027 - Prévention de la perte d'autonomie | date_ouverture (fabrique) ; description (faux) | https://www.valdoise.fr/annuaire/2554/294-libelle.htm |
| conseil-departemental-essonne | Appel à projet mildeca 2025 - communes | titre (faux, page : Appel à projet mildeca 2025 - communes) ; description (faux) | https://www.essonne.gouv.fr/Media/Fichiers/PUBLICATIONS/Autres-publications/Appels-a-projet/Appel-a-projet-MILDECA-2025-communes |
| conseil-regional-grand-est | Aide à l’équipement d’hébergements pour femmes victimes de violences e | financeur (fabrique) ; description (faux) | https://www.grandest.fr/appel-a-projet/hebergement-femmes-victimes-violences/ |
| fondation_de_france | Appel à initiatives : proches aidants de personnes âgées | date_ouverture (fabrique) ; description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/appel-a-initiatives-proches-aidants-de-personnes-agees |
| fondation_de_france | Prix de l'œil | date_ouverture (fabrique) ; description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/prix-de-l-oeil |
| fondation_de_france | Programme handicap – Soutien aux pratiques inclusives | date_ouverture (fabrique) ; description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/personnes-handicapees-soutien-aux-pratiques-inclusives |
| ars_idf | Contrat d'Allocation d'Études - Campagne 2026 | description (faux) | https://www.iledefrance.ars.sante.fr/contrat-dallocation-detudes-campagne-2026 |
| ars-ile-de-france | Devenir volontaire au sein des Commissions Départementales des Soins P | description (faux) | https://www.iledefrance.ars.sante.fr/devenir-volontaire-au-sein-des-commissions-departementales-des-soins-psychiatriques-de-la-region |
| ars-ile-de-france | Renforcement de l’offre en psychiatrie périnatale et psychiatrie de l’ | enveloppe_globale (manquant, page : 1800000) | https://www.iledefrance.ars.sante.fr/renforcement-de-loffre-en-psychiatrie-perinatale-et-psychiatrie-de-lenfant-et-de-ladolescent-1 |
| ars-ile-de-france | Recrutement de médecins coordonnateurs pour les injonctions de soins | description (faux) | https://www.iledefrance.ars.sante.fr/recrutement-de-medecins-coordonnateurs-pour-les-injonctions-de-soins |
| ars-ile-de-france | ESMS numérique 2026 - enfance en situation de handicap et protection d | description (faux) | https://www.iledefrance.ars.sante.fr/esms-numerique-2026-enfance-en-situation-de-handicap-et-protection-de-lenfance |
| ars-auvergne-rhone-alpes | Création de 22 places en Service d’Accompagnement Médico-Social pour A | description (faux) | https://www.auvergne-rhone-alpes.ars.sante.fr/creation-de-22-places-en-service-daccompagnement-medico-social-pour-adultes-handicapes-samsah-pour |
| ars-auvergne-rhone-alpes | Création d'une Equipe Mobile d'Accès à la Scolarisation (EMAS) dans la | description (faux) | https://www.auvergne-rhone-alpes.ars.sante.fr/creation-dune-equipe-mobile-dacces-la-scolarisation-emas-dans-la-drome |
| ars-bourgogne-franche-comte | AAC - Médecins coordonnateurs pour les injonctions de soins | description (faux) | https://www.bourgogne-franche-comte.ars.sante.fr/aac-medecins-coordonnateurs-pour-les-injonctions-de-soins-0 |
| ars-bretagne | Commission régionale de l’activité libérale : appel à candidature pour | description (faux) | https://www.bretagne.ars.sante.fr/commission-regionale-de-lactivite-liberale-appel-candidature-pour-le-representant-des-usagers |
| ars-centre-val-de-loire | Le parcours coordonné renforcé (PCR) « enfance protégée » en région Ce | description (faux) | https://www.centre-val-de-loire.ars.sante.fr/le-parcours-coordonne-renforce-pcr-enfance-protegee-en-region-centre-val-de-loire-2e-vague |
| ars-centre-val-de-loire | Création de deux équipes mobiles dédiée aux personnes en situation de  | description (faux) | https://www.centre-val-de-loire.ars.sante.fr/creation-de-deux-equipes-mobiles-dediee-aux-personnes-en-situation-de-handicap-vieillissantes-en |
| ars-centre-val-de-loire | France 2030 : réduire les inégalités d’accès aux soins grâce à des sol | description (faux) | https://www.centre-val-de-loire.ars.sante.fr/france-2030-reduire-les-inegalites-dacces-aux-soins-grace-des-solutions-innovantes |
| ars-centre-val-de-loire | Appel à projets 2026 pour la sécurisation des établissements de santé  | enveloppe_globale (manquant, page : 2000000) | https://www.centre-val-de-loire.ars.sante.fr/appel-projets-2026-pour-la-securisation-des-etablissements-de-sante-en-region-centre-val-de-loire |
| ars-grand-est | Renforcement de l’offre en psychiatrie périnatale, de l’enfant et de l | description (faux) | https://www.grand-est.ars.sante.fr/renforcement-de-loffre-en-psychiatrie-perinatale-de-lenfant-et-de-ladolescent |
| ars-grand-est | Porteur du Centre de Santé et de Médiation en Santé Sexuelle (CSMSS) d | description (faux) | https://www.grand-est.ars.sante.fr/porteur-du-centre-de-sante-et-de-mediation-en-sante-sexuelle-csmss-de-strasbourg |
| ars-grand-est | Articulation des filières gériatriques avec les filières de soins spéc | titre (faux, page : Articulation des filières gériatriques avec les filières de soins spécialisés et experts - filières AVC et ostéoporose) | https://www.grand-est.ars.sante.fr/articulation-des-filieres-geriatriques-avec-les-filieres-de-soins-specialises-et-experts-filieres |
| ars-grand-est | Création d’un Centre Ressources régional du Trouble Déficit de l’Atten | description (faux) | https://www.grand-est.ars.sante.fr/creation-dun-centre-ressources-regional-du-trouble-deficit-de-lattention-avec-ou-sans-hyperactivite |
| ars-grand-est | Plateforme d’accompagnement et de répit 2026 – département de la Mosel | description (faux) | https://www.grand-est.ars.sante.fr/plateforme-daccompagnement-et-de-repit-2026-departement-de-la-moselle |
| ars-grand-est | Accompagnement du volet immobilier des MSP en région Grand Est via le  | description (faux) | https://www.grand-est.ars.sante.fr/accompagnement-du-volet-immobilier-des-msp-en-region-grand-est-le-fmis |
| cnsa | Mobilisation pour l’habitat intermédiaire | description (faux) | https://www.cnsa.fr/appels-projets/mobilisation-pour-lhabitat-intermediaire |
| societe-francaise-de-medecine-d-urgence-sfmu | PARAMED – Membre du comité Web – Refonte du site web | date_cloture (manquant, page : 2026-04-30) | https://www.sfmu.org/fr/la-sfmu/conseil-d-administration/2014bis/ |
| ars-hauts-de-france | Appel à candidatures - Personnalités qualifiées - Conseil de surveilla | description (faux) | https://www.hauts-de-france.ars.sante.fr/personnalites-qualifiees-conseil-de-surveillance |
| ars-hauts-de-france | Création de 2 dispositifs Handibloc en établissement de santé | description (faux) | https://www.hauts-de-france.ars.sante.fr/creation-de-2-dispositifs-handibloc-en-etablissement-de-sante |
| ars-hauts-de-france | Mise en place du dispositif d’astreinte mutualisée d’IDE de nuit | description (faux) | https://www.hauts-de-france.ars.sante.fr/mise-en-place-du-dispositif-dastreinte-mutualisee-dide-de-nuit |
| ars-normandie | Conseil de surveillance (CS) des établissements de santé : désignation | description (faux) | https://www.normandie.ars.sante.fr/conseil-de-surveillance-cs-des-etablissements-de-sante-designation-des-representants-des-usagers-ru |
| ars-nouvelle-aquitaine | Appel à projets 2027 - Culture et Santé | description (faux) | https://www.nouvelle-aquitaine.ars.sante.fr/appel-projets-2027-culture-et-sante |
| ars-nouvelle-aquitaine | Appel à Candidature 2025 - Renouvellement des représentants des usager | description (faux) | https://www.nouvelle-aquitaine.ars.sante.fr/appel-candidature-2025-renouvellement-des-representants-des-usagers-au-sein-des-commissions-des |
| ars-nouvelle-aquitaine | Appel à manifestation d’intérêt (AMI) 2026 - Programme « ESMS Numériqu | description (faux) | https://www.nouvelle-aquitaine.ars.sante.fr/appel-manifestation-dinteret-ami-2026-programme-esms-numerique-en-nouvelle-aquitaine-derniere |
| ars-occitanie | Création d’un centre d’action médico-sociale précoce (CAMSP) pour enfa | description (faux) | https://www.occitanie.ars.sante.fr/haute-garonne-31-creation-dun-centre-daction-medico-sociale-precoce-camsp-pour-enfant-de-0-6-ans |
| ars-pays-de-la-loire | Démarche de reconnaissance contractuelle des Lits Identifiés de Soins  | description (faux) | https://www.pays-de-la-loire.ars.sante.fr/demarche-de-reconnaissance-contractuelle-des-lits-identifies-de-soins-palliatifs-lisp-2026-en-pays |
| ars-pays-de-la-loire | Appel à projet pour la création d'un établissement d'hébergement pour  | description (faux) | https://www.pays-de-la-loire.ars.sante.fr/appel-projet-pour-la-creation-dun-etablissement-dhebergement-pour-personnes-agees-dependantes-ehpad |
| ars-pays-de-la-loire | Appel à projet ESMS Numérique à destination des structures des champs  | description (faux) | https://www.pays-de-la-loire.ars.sante.fr/appel-projet-esms-numerique-destination-des-structures-des-champs-ph-enfance-et-protection-de |
| ars-pays-de-la-loire | Renforcer l'engagement des acteurs du premier recours dans des actions | description (faux) | https://www.pays-de-la-loire.ars.sante.fr/renforcer-lengagement-des-acteurs-du-premier-recours-dans-des-actions-de-prevention-de-proximite |
| ars-pays-de-la-loire | Réalisation de prestations de suppléance à domicile dérogatoires au dr | description (faux) | https://www.pays-de-la-loire.ars.sante.fr/realisation-de-prestations-de-suppleance-domicile-derogatoires-au-droit-du-travail-relayage |
| ars-pays-de-la-loire | Mesure de solidarité territoriale : engagement volontaire de médecins  | description (faux) | https://www.pays-de-la-loire.ars.sante.fr/mesure-de-solidarite-territoriale-engagement-volontaire-de-medecins-generalistes-exercant-dans-des |
| ars-pays-de-la-loire | Labellisation « hôpital de proximité » | description (faux) | https://www.pays-de-la-loire.ars.sante.fr/labellisation-hopital-de-proximite |
| ars-provence-alpes-cote-d-azur | Recrutement de professionnels relais dans le cadre du dispositif des i | description (faux) | https://www.paca.ars.sante.fr/recrutement-de-professionnels-relais-dans-le-cadre-du-dispositif-des-injonctions-therapeutiques |
| ars-guadeloupe | AAC / Financement du soutien psychologique des personnes en situation  | description (faux) | https://www.guadeloupe.ars.sante.fr/aac-financement-du-soutien-psychologique-dans-les-centres-d-hebergement-et-lieux-d-accueil |
| ars-guadeloupe | Deuxième fenêtre de dépôt 2026 - Demande d'autorisations d'activités d | description (faux) | https://www.guadeloupe.ars.sante.fr/deuxieme-fenetre-de-depot-2026-demande-dautorisations-dactivites-de-soins-et-dequipements-materiels |
| ars-guyane | Appel à candidatures – Déploiement d’une Mission Territoriale d’Expert | date_ouverture (faux, page : 2026-10-09) | https://www.guyane.ars.sante.fr/appel-candidatures-deploiement-dune-mission-territoriale-dexpertise-et-dinformation-en |
| ars-martinique | France 2030 – Offre innovante en santé délocalisée et télémédecine | description (faux) | https://www.martinique.ars.sante.fr/france-2030-offre-innovante-en-sante-delocalisee-et-telemedecine |
| ars-mayotte | Création de 2 centres médico-psycho-pédagogiques (CMPP) sur le territo | description (faux) | https://www.mayotte.ars.sante.fr/appel-projet-relatif-la-creation-de-2-centres-medico-psycho-pedagogiques-cmpp-sur-le-territoire-de |
| ars-mayotte | AAC - création d’une plateforme de coordination et d’orientation (PCO) | description (faux) | https://www.mayotte.ars.sante.fr/aac-creation-dune-plateforme-de-coordination-et-dorientation-pco |
| ars-mayotte | Création d'un Pôle d'appui à la scolarité (PAS) - Mamoudzou et Petite- | description (faux) | https://www.mayotte.ars.sante.fr/creation-dun-pole-dappui-la-scolarite-pas-mamoudzou-et-petite-terre |
| ars-la-reunion | Labellisation France Santé : Cabinets médicaux pluriprofessionnels hor | description (faux) | https://www.lareunion.ars.sante.fr/labellisation-france-sante-cabinets-medicaux-pluriprofessionnels-hors-maisons-de-sante-pluri |
| ars-la-reunion | Transports sanitaires bariatriques | description (faux) | https://www.lareunion.ars.sante.fr/transports-sanitaires-bariatriques |
| ars-la-reunion | Déploiement de la prévention primaire dans les établissements de santé | description (faux) | https://www.lareunion.ars.sante.fr/deploiement-de-la-prevention-primaire-dans-les-etablissements-de-sante-de-la-reunion |
| ars-la-reunion | Permanence des soins en établissement de santé : astreinte régionale S | description (faux) | https://www.lareunion.ars.sante.fr/permanence-des-soins-en-etablissement-de-sante-astreinte-regionale-soins-palliatifs |
| cnsa | Expérimenter pour accompagner l’évolution de l’offre médico-sociale et | description (faux) | https://www.cnsa.fr/appels-projets/experimenter-pour-accompagner-levolution-de-loffre-medico-sociale-et-ladaptation-2026 |
| mutualite-sociale-agricole-msa-beauce-coeur-de-loire-accueil-de-chartres | Appel à Projets Jeunes - MSA Beauce Coeur de Loire | description (faux) | https://bcl.msa.fr/lfp/appel-a-projets-jeunes?p_p_id=com_liferay_journal_content_web_portlet_JournalContentPortlet_INSTANCE_dgrrk7aY3qBE&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_com_liferay_journal_content_web_portlet_JournalContentPortlet_INSTANCE_dgrrk7aY3qBE_read_more=3 |
| fondation-de-france | Étude des interactions inter-organes dans divers contextes physiopatho | date_cloture (manquant) | https://www.fondationdefrance.org/fr/appels-a-projets/etude-interactions-inter-organes |
| fondation-de-france | Solidarité Mayotte : axes d’intervention de la Fondation de France et  | description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/solidarite-mayotte-axes-dintervention-de-la-fondation-de-france |
| fondation-des-hopitaux | AAP Bien etre des soignants - fortes chaleurs | description (faux) | https://appel-a-projet.fondationhopitaux.fr/campagne-info?view=programme&cid=73 |
| fondation-mederic-alzheimer | Appel à candidatures : Communication scientifique 2026 | description (faux) | https://www.fondation-mederic-alzheimer.org/project/appel-a-candidatures-communication-scientifique-2026/ |
| fondation-mederic-alzheimer | Université d’Automne des Jeunes Chercheurs 2026 : Appel à candidatures | date_ouverture (faux, page : 2026-03-17) | https://www.fondation-mederic-alzheimer.org/project/appel-a-candidatures-uajc-edition-2026/ |
| fondation-de-l-avenir | Prix de l'innovation Troubles des conduites alimentaires | description (faux) | https://www.fondationdelavenir.org/appel-projet/prix-de-linnovation-de-la-fondation-sandrine-castellotti-3/ |
| fondation-arc | 4e Prix de thèse Oberling-Haguenau Fondation ARC | description (faux) | https://www.fondation-arc.org/appels-a-projets/4e-prix-de-these-oberling-haguenau-fondation-arc/ |
| institut-national-du-cancer-inca | Réduire les expositions dans les établissements accueillant des jeunes | description (faux) | https://www.cancer.fr/professionnels-de-la-recherche/appels-a-projets-et-a-candidatures/nos-appels-a-projets/zeroexpo27 |
| inserm | Apports de la physique, de la chimie et des sciences de l’ingénieur à  | description (faux) | https://pro.inserm.fr/rubriques/appels-a-projets/strategie-decennale-cancer-2021-2030/apports-de-la-physique-de-la-chimie-et-des-sciences-de-lingenieur-a-loncologie-psci |
| inserm | Apports des mathématiques et de l’informatique à l’oncologie (MIC) | description (faux) | https://pro.inserm.fr/rubriques/appels-a-projets/strategie-decennale-cancer-2021-2030/apports-a-loncologie-des-mathematiques-et-de-linformatique-mic |
| inserm | Appel d’offres Atip-Avenir 2027 | description (faux) | https://pro.inserm.fr/rubriques/appels-a-projets/programmes-de-linserm/atip-avenir/atip-avenir-2027 |
| inserm | Programme Atip-Avenir | description (faux) | https://pro.inserm.fr/rubriques/appels-a-projets/programmes-de-linserm/atip-avenir/le-programme-atip-avenir |
| ministere-de-l-enseignement-superieur-et-de-la-recherche | appel-projets-stic-math-et-climat-amsud-2026 | description (faux) | https://www.enseignementsup-recherche.gouv.fr/fr/appel-projets-stic-math-et-climat-amsud-2026-104194 |
| prefecture-rhone | Appel à candidatures CFPA Rhône 2027 | description (faux) | https://www.rhone.fr/jcms/tl1_2008817/fr/jcms/pl01_2205672/fr/appel-a-candidatures-cfpa-rhone-2027 |
| girci-grand-ouest | Appel à projets Recherche en Simulation | description (faux) | https://www.chu-hugo.fr/recherche-en-simulation/ |
| canceropole-grand-ouest-appels-a-projets | Fondations Maladies Rares : Appel à projets AFMF – Fanconi anaemia | date_cloture (manquant, page : 2027-01-07) | https://www.canceropole-grandouest.com/appel-projets/fondations-maladies-rares-appel-a-projets-afmf-fanconi-anaemia/ |
| canceropole-grand-ouest-appels-a-projets | AAC PROGRAMME D’ACCÉLÉRATION MATWIN | date_ouverture (fabrique) | https://www.canceropole-grandouest.com/appel-projets/aac-programme-dacceleration-matwin/ |
| canceropole-grand-ouest-appels-a-projets | Inserm/GIP Arronax – AAC : Bourses de thèse en médecine nucléaire | description (faux) | https://www.canceropole-grandouest.com/appel-projets/inserm-gip-arronax-aac-bourses-de-these-en-medecine-nucleaire/ |
| finistere-appels-a-projets | Requalification de 35 places d’EHPAD en places pour personnes handicap | description (faux) | https://www.finistere.fr/appel-a-projets/requalification-de-35-places-dehpad-en-places-pour-personnes-handicapees-vieillissantes/ |
| finistere-appels-a-projets | Creation de 60 places de service d'accompagnement à la vie sociale en  | description (faux) | https://www.finistere.fr/appel-a-projets/creation-de-60-places-de-service-daccompagnement-a-la-vie-sociale-en-finistere/ |
| metropole-de-lyon-commission-des-financeurs | Webinaire appel à projet 2027 | description (faux) | https://commissiondesfinanceurs.grandlyon.com/webinaire-appel-a-projet-2027/ |
| ville-de-paris-appels-a-projets | Appel à projets « Quartier santé de QJ » | description (faux) | https://www.paris.fr/pages/appel-a-projets-quartier-sante-28842 |
| ville-de-paris-appels-a-projets | Appel à projets Santé mondiale, accès aux soins et lutte contre le sid | description (faux) | https://www.paris.fr/pages/appel-a-projets-sante-mondiale-acces-aux-soins-et-lutte-contre-le-sida-36692 |
| conseil-departemental-herault | Attribution d'une dotation complémentaires aux services autonomie à do | description (faux) | https://herault.fr/aideProjet/106/321-attribution-d-une-dotation-complementaires-aux-services-autonomie-a-domicile-pour-le-financement-d-actions-ameliorant-la-qualite-de-service-rendu-a-l-usager.htm |
| conseil-departemental-la-reunion | Calendrier prévisionnel d'appel à projet conjoint pour les services au | date_ouverture (faux, page : 2026-08-28) | https://www.departement974.fr/actualite/calendrier-previsionnel-dappel-projet-conjoint-pour-les-services-autonomie-domicile-2026 |
| conseil-departemental-hautes-pyrenees | APPEL À PROJETS 2027 POUR LA PRÉVENTION DE LA PERTE D’AUTONOMIE DANS L | description (faux) | https://www.hautespyrenees.fr/aides-et-subventions/appels-a-projets/appel-a-projets-2027-pour-la-prevention-de-la-perte-dautonomie-dans-les-hautes-pyrenees/ |
| conseil-departemental-pyrenees-atlantiques | APPEL À CANDIDATURES 2025 – ATTRIBUTION D’UNE AIDE FINANCIÈRE DE SOUTI | description (faux) | https://www.le64.fr/appel-candidatures-2025-attribution-dune-aide-financiere-de-soutien-la-mobilite-et-aux-temps-de |
| conseil-departemental-pyrenees-atlantiques | APPEL À PROJETS DISPOSITIFS RÉPIT | description (faux) | https://le64.fr/appel-projets-dispositifs-repit |
| conseil-departemental-ain | [Appel à projets] Création d’un établissement d’accueil médicalisé pou | description (faux) | https://www.ain.fr/appel-a-projets-service-accueil-autisme/ |
| conseil-departemental-essonne | Mildeca 2026 | description (faux) | https://www.essonne.gouv.fr/Media/Fichiers/PUBLICATIONS/Autres-publications/Appels-a-projet/MILDECA-2026 |
| conseil-regional-grand-est | Soutien aux émergences Arts Visuels | description (faux) | https://www.grandest.fr/vos-aides-regionales/appel-a-projets-soutien-aux-emergences-arts-visuels/ |
| conseil-regional-grand-est | AMI Territoires pilotes – Urbanisme Favorable à la Santé | description (faux) | https://www.grandest.fr/appel-a-projet/ami-territoires-pilotes/ |
| conseil-regional-la-reunion | Appel à candidature pour la participation au salon Vivatech 2026 | description (faux) | https://regionreunion.com/aides-services/appels-a-projets/actualite/toute-l-actualite/article/appel-a-candidature-pour-la-participation-au-salon-vivatech-2026 |
| conseil-regional-la-reunion | AMI - Environnement, protection et valorisation de la biodiversité, ob | description (faux) | https://regionreunion.com/aides-services/appels-a-projets/aides-services/appels-a-projets/article/ami-environnement-protection-et-valorisation-de-la-biodiversite-observation-restauration-des-milieux |
| conseil-regional-la-reunion | appel à projets lespasscles | description (faux) | https://regionreunion.com/aides-services/appels-a-projets/aides-services/appels-a-projets/article/appel-a-projets-lespasscles-2922 |
| fondation_de_france | Appel à initiatives handicap PACA-Corse 2026 | description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/appel-a-iniatiatives-handicap-paca-corse-2026 |
| fondation_de_france | Santé des jeunes : soutenir les jeunes en souffrance psychique | date_cloture (manquant) | https://www.fondationdefrance.org/fr/appels-a-projets/sante-des-jeunes-soutenir-les-jeunes-en-souffrance-psychique |
| fondation_de_france | Prix de la recherche médicale de la Fondation de France/Jean Valade 20 | date_cloture (manquant) | https://www.fondationdefrance.org/fr/appels-a-projets/prix-de-la-recherche-medicale-de-la-fondation-de-france-jean-valade |
| fondation_de_france | Recherche sur les maladies neurodégénératives : Étude des « agrégopath | description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/recherche-sur-les-maladies-neurodegeneratives-etude-des-agregopathies-dans-les-maladies-neurodegeneratives |
| fondation_de_france | Maladies psychiques : accès aux soins et vie sociale | description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/maladies-psychiques-acces-aux-soins-et-vie-sociale |
| fondation_de_france | Intervenir en France – Programme Solidarité Migrants | date_ouverture (fabrique) | https://www.fondationdefrance.org/fr/appels-a-projets/intervenir-en-france |
| fondation_de_france | Aide à la mobilité internationale de médecins et de pharmaciens | description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/aide-a-la-mobilite-internationale-de-medecins-et-de-pharmaciens |
| fondation_de_france | Etre soutenu par la Fondation de France (Appels à projets, bourses et  | description (faux) | https://www.fondationdefrance.org/fr/appels-a-projets/etre-soutenu-par-la-fondation-de-france-old |
