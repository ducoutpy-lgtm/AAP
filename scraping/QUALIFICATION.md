# Qualification des sources

Généré le 2026-10-13 par `python scraping/qualification.py --rapport`. Verdict calculé à partir des
réponses du modèle local Ollama sur la page de rubrique gardée par `decouverte.py` ; sondage manuel ci-dessous.

**270 sources qualifiées sur 1133 : 242 rubrique confirmée, 0 PDF seulement, 18 hors santé, 0 pas d'AAP, 10 à vérifier ; 863 sources sans page gardée (à vérifier).**

## Sondage manuel

31 verdicts relus sur la page d'origine : 26 accords, 5 désaccords (83 % d'accord).

| Source | Verdict du modèle | Verdict relu | Page |
|---|---|---|---|
| Directions.fr – appels à projet | rubrique confirmée | à vérifier | [page](https://www.directions.fr/appels-a-projet/) |
| Conseil départemental Gard | hors santé | rubrique confirmée | [page](https://www.gard.fr/information/appel-a-projets) |
| Interreg Sudoe | hors santé | rubrique confirmée | [page](https://interreg-sudoe.eu/fr/4eme-appel-a-projets/) |
| Fondation Le Souffle | hors santé | à vérifier | [page](https://www.lesouffle.org/appels-projets-recherche) |
| Ministère de l'Enseignement supérieur et de la Recherche | hors santé | à vérifier | [page](https://www.enseignementsup-recherche.gouv.fr/fr/appel-projets-appel-candidatures) |

## Relecture manuelle

166 verdicts corrigés à la relecture (fichier `sources/relecture_qualification.json`) ; le verdict du modèle est conservé. Les décomptes ci-dessus et ci-dessous utilisent le verdict relu.

| Source | Verdict du modèle | Verdict relu | Motif | Page |
|---|---|---|---|---|
| Conseil départemental Essonne | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.essonne.gouv.fr/Media/Fichiers/PUBLICATIONS/Autres-publications/Appels-a-projet | [page](https://www.essonne.fr/appel-projets-candidatures) |
| ANR | hors santé | rubrique confirmée | page des appels en cours indiquée par Monsieur DUCOUT (anr.fr/fr/appels) : PEPR Psychiatrie de précision, appel générique 2027 | [page](https://anr.fr/fr/rechercher-un-ancien-appel-a-projets/) |
| IReSP | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://iresp.net/financements/programmes-et-appels/ | [page](https://iresp.net/financements/programmes-et-appels/appel-a-projets-clos/) |
| Fondation Malakoff Humanis Handicap | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://newsroom.malakoffhumanis.com/appel-a-projets.html | [page](https://newsroom.malakoffhumanis.com/actualites/la-fondation-malakoff-humanis-handicap-lance-un-appel-a-projet-pour-soutenir-les-innovations-technologiques-et-numeriques-permettant-de-favoriser-lacces-a-lemploi-et-a-la-sante-des-personnes-en-situation-de-handicap-e6dd-63a59.html) |
| Bpifrance – France 2030 | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.bpifrance.fr/nos-appels-a-projets-concours) |
| Fondation pour la Recherche Médicale (FRM) | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.frm.org/fr/programmes | [page](https://www.frm.org/fr/espace-chercheurs-aap-clotures) |
| FIRAH | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.fondation-ocirp.fr/appels-a-projets/aap/lieux-alternatifs-du-prendre-soin-des-ecosystemes-territoriaux-en-faveur-de-l-autonomie/ | [page](https://www.firah.org/fr/laureats-des-appels-a-projets-precedents.html) |
| Fondation Maladies Rares | hors santé | rubrique confirmée | adresse donnée à l'écran : https://fondation-maladiesrares.org/le-financement-des-projets-scientifiques/ | [page](https://fondation-maladiesrares.org/appels-a-projets-2019-de-fondation/) |
| Fondation Crédit Agricole Solidarité et Développement | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.fondation-ca-solidaritedeveloppement.org/appel-a-projets/aide-sociale-a-lenfance-accompagner-les-jeunes-dans-leur-vie-dadulte/) |
| Fondation ARC | hors santé | rubrique confirmée | douze appels de recherche sur le cancer : recherche médicale | [page](https://www.fondation-arc.org/appels-a-projets/) |
| FSE+ France | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://fse.gouv.fr/les-appels-a-projets) |
| Interreg Sudoe | hors santé | rubrique confirmée | adresse donnée à l'écran : https://interreg-sudoe.eu/fr/futurs-appels-a-projets/ | [page](https://interreg-sudoe.eu/fr/4eme-appel-a-projets/) |
| Hauts-de-Seine – appels à projets | hors santé | rubrique confirmée | fonds de mobilité pour les services d'aide à domicile : médico-social | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) |
| Rhône – appels à candidatures prévention | hors santé | rubrique confirmée | AMI CPOM services autonomie à domicile 2027, appel à candidatures conférence des financeurs 2027 | [page](https://www.rhone.fr/jcms/tl1_2008811/fr/appels-a-projets) |
| Drôme – Commission des financeurs | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/) |
| Région Île-de-France – aides et appels à projets | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) |
| Ministère de l'Enseignement supérieur et de la Recherche | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.enseignementsup-recherche.gouv.fr/fr/appel-projets-appel-candidatures) |
| DGOS – programmes de recherche hospitalière (PHRC, PHRIP, PREPS, PRME) | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://sante.gouv.fr/systeme-de-sante/innovation-et-recherche/l-innovation-et-la-recherche-clinique/appels-a-projets/ | [page](https://sante.gouv.fr/systeme-de-sante/innovation-et-recherche/l-innovation-et-la-recherche-clinique/appels-a-projets/programmes-recherche) |
| ANSES – programme PNR-EST | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.anses.fr/fr/appels-et-consultations/avis-appel-manifestation-interet) |
| ANSM | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://ansm.sante.fr/vos-demarches/industriel/projet-longue-vie-aux-medicaments-sur-laugmentation-de-la-duree-de-conservation-des-medicaments | [page](https://ansm.sante.fr/actualites/renouvellement-du-comite-dinterface-avec-les-associations-de-patients-appel-a-candidatures-ouvert-jusquau-30-septembre-2026) |
| Inserm | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://pro.inserm.fr/rubriques/appels-a-projets/agenda-des-appels-a-projets | [page](https://pro.inserm.fr/) |
| Agence de l'eau Rhin-Meuse | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.eau-rhin-meuse.fr/actualites/appel-projets) |
| Agence de l'eau Seine-Normandie | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.eau-seine-normandie.fr/appels_a_projets) |
| Agence de l'eau Adour-Garonne | hors santé | hors santé | hors champ à l'écran | [page](https://eau-grandsudouest.fr/actualites/appel-projets-pse-pour-reconquete-qualite-eaux-brutes-captages-pour-eau-potable) |
| Agence de l'eau Artois-Picardie | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.eau-artois-picardie.fr/la-jeunesse-pour-leau-appel-projets/appel-manifestation-dinteret-2026-faire-emerger-des-projets) |
| Agence de l'eau Loire-Bretagne | hors santé | rubrique confirmée | adresse donnée à l'écran : https://aides-redevances.eau-loire-bretagne.fr/home/aides/appels-a-projets-1.html | [page](https://aides-redevances.eau-loire-bretagne.fr/home/aides/appels-a-projets-1/poissons-migrateurs-amphihalins-appel-a-projets-2027.html) |
| Agence de l'eau Rhône Méditerranée Corse | hors santé | hors santé | hors champ à l'écran | [page](https://www.eaurmc.fr/jcms/vmr_35832/fr/bilans-des-appels-a-projets-passes) |
| ANACT | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.anact.fr/realisations-et-projets?f%5B0%5D=realisation_advance%3A302 | [page](https://www.anact.fr/fact/appel-projets-travail-climat-aura-occitanie-paca) |
| Fonds national pour la science ouverte | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.ouvrirlascience.fr/category/fnso/appels-a-projets-fnso/) |
| Fondation Groupe Pasteur Mutualité | hors santé | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.gpm.fr/appel-a-candidature/) |
| Fondation AÉSIO | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://fondation.aesio.fr/soumettre-un-projet | [page](https://fondation.aesio.fr/actualites/appel-projets-reponses-questions-frequentes) |
| Fondation Le Souffle | hors santé | rubrique confirmée | bourses et appels à projets de recherche en santé respiratoire ; le modèle n'avait lu que la liste des cookies | [page](https://www.lesouffle.org/appels-projets-recherche) |
| Fondation Alzheimer | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.fondation-alzheimer.org/je-suis-chercheur/financement-de-projets/ | [page](https://www.fondation-alzheimer.org/je-suis-chercheur/financement-de-projets/les-prix-de-la-fondation/) |
| Institut de France – fondations | hors santé | rubrique confirmée | adresse donnée à l'écran : https://fondations.institutdefrance.fr/index.php | [page](https://fondations.institutdefrance.fr/appel-a-projets-solidarite-internationale-2026-fondation-coallia-stephane-hessel) |
| Société Française de Gériatrie et Gérontologie (SFGG) | hors santé | rubrique confirmée | adresse donnée à l'écran : https://sfgg.org/actualites/appels-a-participation-bourses-et-prix/ | [page](https://sfgg.org/actualites/appels-a-participation-bourses-et-prix/prix-chaffoteaux/) |
| Société Française de Dermatologie | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.sfdermato.org/page-18-appels-a-projets-et-bourses-sfd | [page](https://www.sfdermato.org/page-46-resultats-des-appels-a-projet-et-bourses-sfd) |
| Plateforme nationale pour la recherche sur la fin de vie | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.plateforme-recherche-findevie.fr/projets-recherche | [page](https://www.plateforme-recherche-findevie.fr/articles) |
| Ville de Montpellier – appels à projets | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets | [page](https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets) |
| Montpellier Méditerranée Métropole – contrat de ville | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets | [page](https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets) |
| Métropole Aix-Marseille-Provence – contrat de ville | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://ampmetropole.fr/metropole/concertations-et-appels-a-projets/appels-a-projets-et-a-manifestation-dinteret/) |
| Conseil départemental Meurthe-et-Moselle | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.meurthe-et-moselle.fr/appels-projets) |
| Conseil départemental Gard | hors santé | rubrique confirmée | activité physique adaptée et isolement des personnes âgées, relevé au sondage | [page](https://www.gard.fr/information/appel-a-projets) |
| Conseil départemental Doubs | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.doubs.fr/le-departement/appel-a-projets-a-candidatures-ou-appel-a-manifestation-dinteret/) |
| Conseil départemental Oise | pas d'AAP | rubrique confirmée | adresse donnée à l'écran : https://oise.fr/information/portail-des-aides-et-subventions-du-conseil-departemental-de-loise | [page](https://oise.fr/) |
| Conseil départemental Hauts-de-Seine | hors santé | rubrique confirmée | même page que Hauts-de-Seine appels à projets : services d'aide à domicile | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) |
| Conseil départemental Côtes-d'Armor | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://cotesdarmor.fr/le-departement/publications-reglementaires/appels-manifestation-d-interet) |
| Conseil départemental Saône-et-Loire | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.saoneetloire.fr/actualite/appels-a-projets-2027/) |
| Conseil départemental Allier | hors santé | rubrique confirmée | AMI habitat inclusif 2026, création de places en lieux de vie et d'accueil | [page](https://www.allier.fr/285-appels-a-projets.htm) |
| Conseil départemental Vaucluse | pas d'AAP | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.vaucluse.fr/votre-departement-307.html) |
| Conseil départemental Moselle | hors santé | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.moselle.fr/jcms/dlmnd_5083/fr/toute-l-info?portal=j_206) |
| Conseil départemental Lot | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.lot.fr/appels-projets | [page](https://www.lot.fr/appels-projets) |
| Conseil départemental Yonne | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.yonne.fr/mon-departement/les-appels-et-dispositifs-en-cours/ | [page](https://www.yonne.fr/aides-et-services/publics-demandeur-de-subvention/) |
| Conseil départemental Vosges | hors santé | rubrique confirmée | appel commission des financeurs 2026, dotation aux services autonomie à domicile | [page](https://www.vosges.fr/mon-departement/appels-a-projets/) |
| Conseil départemental Calvados | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.calvados.fr/appels-a-projets) |
| Conseil départemental Tarn-et-Garonne | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.tarn-et-garonne.gouv.fr/Publications/Appels-a-projets/2026 | [page](https://www.tarnetgaronne.fr/) |
| Conseil départemental Drôme | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/) |
| Conseil départemental Hautes-Alpes | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.hautes-alpes.fr/le-departement/appels-a-candidatures/) |
| Conseil départemental Aube | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.aube.fr/le-departement/budget-et-documents-reglementaires/appels-a-projets/) |
| Conseil territorial de Saint-Pierre-et-Miquelon | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.vivre-a-spm.fr/travailler-et-entreprendre/les-appels-a-projet/ | [page](https://www.spm-ct975.fr/actualite/service-daccompagnement-medico-social-pour-adultes-en-situation-de-handicap/) |
| Conseil départemental Haute-Savoie | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://hautesavoie.fr/le-departement/enquetes-publiques-appels-a-projets/appels-a-projets/ | [page](https://hautesavoie.fr/le-departement/enquetes-publiques-appels-a-projets/) |
| Conseil départemental Territoire de Belfort | hors santé | rubrique confirmée | appel commission des financeurs de la prévention de la perte d'autonomie 2026 | [page](https://www.territoiredebelfort.fr/appels-projets) |
| Conseil départemental Savoie | hors santé | rubrique confirmée | appel commission des financeurs 2027-2029 | [page](https://www.savoie.fr/web/dxx_5094/a-l-essentiel?subCategory_Th%E9matiques=dsw_36626) |
| Conseil départemental Rhône | hors santé | rubrique confirmée | même page : AMI CPOM services autonomie à domicile 2027, conférence des financeurs 2027 | [page](https://www.rhone.fr/jcms/tl1_2008811/fr/appels-a-projets) |
| Conseil départemental Corrèze | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.correze.fr/le-departement/les-appels-projets | [page](https://www.correze.fr/) |
| Conseil départemental Alpes-Maritimes | hors santé | rubrique confirmée | appels Santé Innovation, Seniors, commission des financeurs 2027, syndrome de Diogène | [page](https://www.departement06.fr/appels-projets-solidarite-sociale) |
| Conseil départemental Seine-et-Marne | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.seine-et-marne.fr/fr/appels-projet-subventions) |
| Conseil départemental Gironde | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.gironde.fr/linstitution/appels-projets) |
| Conseil départemental Mayenne | hors santé | rubrique confirmée | appel commission des financeurs, accueil de mineurs et jeunes majeurs | [page](https://www.lamayenne.fr/page/appels-projet) |
| Conseil départemental Pas-de-Calais | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.pasdecalais.fr/appels-projets-et-appels-candidatures-et-manifestation-dinteret) |
| Conseil départemental Orne | hors santé | rubrique confirmée | appel à candidatures commission des financeurs Orne, dotation qualité des services autonomie | [page](https://www.orne.fr/services/marches-publics-enquete-publique-aap-ami/appels-projets-appel-manifestation-dinteret) |
| Conseil départemental Mayotte | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.mayotte.gouv.fr/Publications/Appels-a-projets/2026 | [page](https://www.mayotte.fr/) |
| Conseil départemental Yvelines | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.yvelines.fr/appels-a-projets-subventions/#aap | [page](https://www.yvelines.fr/appels-a-projets-subventions/) |
| Conseil départemental Aude | hors santé | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.aude.fr/repondre-un-appel-projet-appel-candidatures) |
| Conseil départemental Tarn | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.tarn.fr/actualites/appel-a-projets-fse-osh-2026-2027 | [page](https://www.tarn.fr/accueil) |
| Conseil départemental Val-de-Marne | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.valdemarne.fr/le-conseil-departemental/les-appels-a-projets) |
| Conseil départemental Alpes-de-Haute-Provence | rubrique confirmée | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.mondepartement04.fr/insertion/appel-a-projets-pdi) |
| Gouvernement de Nouvelle-Calédonie | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://gouv.nc/actualites/01-10-2026/lancement-de-lappel-projets-du-fonds-pacifique-2027) |
| Conseil régional Île-de-France | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) |
| Conseil régional Guadeloupe | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.guadeloupe.gouv.fr/Publications/Appels-a-projets | [page](https://www.regionguadeloupe.fr/appel-a-projets) |
| Conseil régional La Réunion | pas d'AAP | rubrique confirmée | adresse donnée à l'écran : https://regionreunion.com/aides-services/appels-a-projets/ | [page](https://regionreunion.com/) |
| Conseil régional Centre-Val de Loire | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.centre-valdeloire.fr/appels-projet | [page](https://www.centre-valdeloire.fr/appels-projet/recherche-et-innovation-campagne-2026-des-appels-projets) |
| Collectivité territoriale de Guyane | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.guyane.gouv.fr/Publications/Appels-a-Projets/2024 | [page](https://www.ctguyane.fr/appel-a-candidatures-residences-croisees-france-bresil-langues-et-savoirs-autochtones-par-dela-les-frontieres/) |
| Mairie de Nice | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.nice.fr/tag/appel-a-projet/) |
| Mairie de Bordeaux | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.bordeaux.fr/appels-projets) |
| Mairie de Rennes | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://metropole.rennes.fr/appels-a-projets-partenariats-et-cooperations/) |
| Mairie de Montpellier | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets | [page](https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets) |
| Mairie de Lille | hors santé | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.lille.fr/Votre-Mairie/La-commande-publique-et-les-appels-a-manifestation-d-interet/Appels-a-manifestation-d-interet-pour-l-occupation-du-domaine-public) |
| Mairie de Toulon | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://demarches.toulon.fr/infos_demarches/appel-a-projets/) |
| Mairie de Reims | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.grandreims.fr/reimsbusiness/appels-a-projets | [page](https://www.reims.fr/) |
| Mairie de Brest | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://brest.fr/participer-agir/repondre-un-appel-projets) |
| Mairie de Villeurbanne | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.villeurbanne.fr/mon-quotidien/mon-emploi-mon-entreprise/appel-a-projets-a-candidature | [page](https://www.villeurbanne.fr/) |
| Mairie de Amiens | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.amiens.fr/Institutions/Appel-a-candidatures) |
| Mairie de Nancy | pas d'AAP | hors santé | hors champ à l'écran | [page](https://www.nancy.fr/culture/appels-a-candidature) |
| Mairie de Cayenne | hors santé | hors santé | hors champ à l'écran | [page](https://ville-cayenne.fr/evenements/appel-a-candidature-implantation-dequipements-de-telecommunication-electroniques-pylones-du-fort-ceperou/) |
| Mairie de Saint-Denis-de-La-Réunion | hors santé | hors santé | hors champ à l'écran | [page](https://www.saintdenis.re/appel-a-manifestation-d-interet-kiosque-communal) |
| Caisse générale de sécurité sociale (CGSS) - Martinique | hors santé | rubrique confirmée | ateliers Bienvenue à la retraite : prévention inter-régimes du bien vieillir | [page](https://cgss-martinique.fr/appel-a-projets-ateliers-bienvenue-a-la-retraite/) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Normandie | hors santé | rubrique confirmée | appel accompagner le passage à la retraite : prévention du bien vieillir | [page](https://www.carsat-normandie.fr/home/partenaires/actualites-partenaire/toutes%20les%20actualites/appel-a-projets-accompagner-les.details-actualite.html) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Alsace-Moselle | pas d'AAP | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.carsat-alsacemoselle.fr/home.html) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Languedoc-Roussillon | hors santé | rubrique confirmée | appel « Innovation et Silver autonomie » | [page](https://www.carsat-lr.fr/home.html) |
| Caisse nationale d’assurance vieillesse (Cnav) Assurance retraite Île-de-France | hors santé | rubrique confirmée | appel « bien-vieillir » : prévention de la perte d'autonomie | [page](https://www.lassuranceretraite-idf.fr/home/partenaire/soutenir-financierement-les-projets/appels-a-projets.html) |
| Mutualité sociale agricole (MSA) Sud-Aquitaine - accueil de Saint-Pierre-du-Mont | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://sudaquitaine.msa.fr/lfp/nos-appels-%C3%A0-projets1) |
| Mutualité sociale agricole (MSA) Occitanie - accueil de Carcassonne | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://grandsud.msa.fr/lfp/appel-projet-ass) |
| Mutualité sociale agricole (MSA) Sud-Champagne - accueil de Troyes | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://sudchampagne.msa.fr/lfp/aap) |
| Caisse générale de sécurité sociale (CGSS) - Guyane | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.cgss-guyane.fr//appel-a-projets/ | [page](https://www.cgss-guyane.fr/appel-a-projets/appel-a-projet-fnpeis-2026/) |
| Mutualité sociale agricole (MSA) Nouvelle-Aquitaine - accueil de Nontron | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://dlg.msa.fr/lfp/web/msa-dordogne-lot-et-garonne/appel-a-projet-jeune) |
| Mutualité sociale agricole (MSA) Nouvelle-Aquitaine - accueil de Libourne | hors santé | rubrique confirmée | appel 2026 en faveur des aidants, répit parental | [page](https://gironde.msa.fr/lfp/appels-a-projets) |
| Mutualité sociale agricole (MSA) Alpes-Vaucluse - accueil d'Avignon | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://alpes-vaucluse.msa.fr/lfp/l-appel-%C3%A0-projets-jeunes-apj-) |
| Mutualité sociale agricole (MSA) Grand Est - accueil de Sarrebourg | hors santé | rubrique confirmée | adresse donnée à l'écran : https://lorraine.msa.fr/lfp/partenaire-collectivite-action-sociale | [page](https://lorraine.msa.fr/lfp) |
| Mutualité sociale agricole (MSA) Picardie - accueil de Laon | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://picardie.msa.fr/lfp/appel-a-projets-jeunes) |
| Mutualité sociale agricole (MSA) Beauce Coeur-de-Loire - accueil de Chartres | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://bcl.msa.fr/lfp/appel-a-projets-jeunes) |
| Préfecture - Côte-d'Or | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.cote-dor.gouv.fr/Actions-de-l-Etat/Appels-a-projets) |
| Préfecture - Ille-et-Vilaine | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.ille-et-vilaine.gouv.fr/Publications/Appel-a-projets) |
| Mutualité sociale agricole (MSA) - Meurthe-et-Moselle - accueil de Vandœuvre-lès-Nancy | hors santé | rubrique confirmée | adresse donnée à l'écran : https://lorraine.msa.fr/lfp/partenaire-collectivite-action-sociale | [page](https://lorraine.msa.fr/lfp) |
| Préfecture - Cantal | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.cantal.fr/le-conseil-departemental/les-appels-a-projets/ | [page](https://www.cantal.gouv.fr/Actualites/Economie-Emploi/Appel-a-projets-2026-2028-pour-le-Dispositif-Local-d-Accompagnement-DLA) |
| Préfecture - Manche | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.manche.gouv.fr/Publications/Appels-a-projets) |
| Préfecture - Aveyron | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.aveyron.gouv.fr/Publications/Appels-a-projet) |
| Préfecture - Nièvre | hors santé | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.nievre.gouv.fr/Publications/Appels-a-projets/Contrat-d-engagement-jeunes-volet-Jeunes-en-rupture) |
| Préfecture - Seine-Maritime | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.seine-maritime.gouv.fr/Publications/Appels-a-projets) |
| Préfecture - Val-d'Oise | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.val-doise.gouv.fr/Publications/Appels-a-projets) |
| Préfecture - Vaucluse | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.vaucluse.fr/votre-departement/la-commande-les-enquetes-publiques-et-les-appels-a-projets-1402/appels-a-projets.html | [page](https://www.vaucluse.gouv.fr/Actions-de-l-Etat/Securite/Prevention-de-la-delinquance-et-de-la-radicalisation/Prevention-de-la-radicalisation/Appel-a-projet-2026-FIPD-radicalisation) |
| Préfecture - Rhône | à vérifier | rubrique confirmée | adresse donnée à l'écran : https://www.rhone.fr/jcms/tl1_2008817/fr/appels-a-projets | [page](https://www.rhone.gouv.fr/) |
| Haut-commissariat de la République - Nouvelle-Calédonie | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://www.nouvelle-caledonie.gouv.fr/Actions-de-l-Etat/Appels-a-projets) |
| Préfecture - Morbihan | à vérifier | rubrique confirmée | adresse donnée à l'écran : https://www.morbihan.fr/le-conseil-departemental/appels-a-projets | [page](https://www.morbihan.gouv.fr/Publications/Appels-a-manifestation-d-interet/Ouverture-de-l-appel-a-manifestation-d-interet-2021-pour-la-labellisation-Point-conseil-budget) |
| Direction départementale de l'emploi, du travail et des solidarités (DDETS) - Bouches-du-Rhône | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://paca.dreets.gouv.fr/appels-projets) |
| Direction départementale de l'emploi, du travail et des solidarités (DDETS) - Isère | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://auvergne-rhone-alpes.dreets.gouv.fr/appels-projets) |
| Direction départementale de l'emploi, du travail et des solidarités (DDETS) - Ille-et-Vilaine | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://bretagne.dreets.gouv.fr/Appels-a-projets) |
| Direction générale de la cohésion des populations (DGCOPOP) - Guyane | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://guyane.deets.gouv.fr/Appel-a-projet-FSE-Favoriser-l-acces-au-logement-et-la-prevention-des-violences) |
| Direction régionale et interdépartementale de l'économie, de l'emploi, du travail et des solidarités (DRIEETS) - Unité départementale de Paris | hors santé | rubrique confirmée | adresse donnée à l'écran : https://idf.drieets.gouv.fr/Appels-a-projets-appels-d-offres | [page](https://idf.drieets.gouv.fr/Paris) |
| Direction de l'économie, de l'emploi, du travail et des solidarités (DEETS) - La Réunion | hors santé | hors santé | hors champ à l'écran | [page](https://reunion.deets.gouv.fr/APPEL-A-CANDIDATURE-renouvellement-des-membres-des-conseils-de-familles-des) |
| Direction de l'économie, de l'emploi, du travail et des solidarités (DEETS) - Guadeloupe | à vérifier | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://guadeloupe.deets.gouv.fr/) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Occitanie - Siège de Toulouse | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://draaf.occitanie.agriculture.gouv.fr/appels-a-projets-r1452.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Grand Est - Site de Metz | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://draaf.grand-est.agriculture.gouv.fr/appels-a-projets-r22.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Centre-Val de Loire | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://draaf.centre-val-de-loire.agriculture.gouv.fr/appels-a-projets-m18.html) |
| Direction de l'alimentation, de l'agriculture et de la forêt (Daaf) - Martinique | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://daaf.martinique.agriculture.gouv.fr/appels-a-projets-consultations-r23.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Corse | hors santé | hors santé | hors champ à l'écran | [page](https://draaf.corse.agriculture.gouv.fr/appel-a-projets-le-fonds-strategique-de-la-foret-et-du-bois-fsfb-soutient-le-a2247.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Normandie - Site de Rouen | hors santé | hors santé | hors champ à l'écran | [page](https://draaf.normandie.agriculture.gouv.fr/avis-d-appel-a-candidatures-de-la-safer-a236.html) |
| Direction de l'alimentation, de l'agriculture et de la forêt (Daaf) - Mayotte | hors santé | hors santé | hors champ à l'écran | [page](https://daaf.mayotte.agriculture.gouv.fr/appel-a-projets-2024-aide-a-l-encadrement-administratif-dans-les-structures-a683.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Bretagne | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://draaf.bretagne.agriculture.gouv.fr/nos-appels-a-projets-r22.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Bourgogne-Franche-Comté - Siège de Dijon | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://draaf.bourgogne-franche-comte.agriculture.gouv.fr/aides-et-appels-a-projets-en-cours-r22.html) |
| Direction de l'alimentation, de l'agriculture et de la forêt (Daaf) - Guadeloupe | hors santé | hors santé | hors champ à l'écran | [page](https://daaf.guadeloupe.agriculture.gouv.fr/appels-a-projets-r23.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Auvergne-Rhône-Alpes - Site de Lyon | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://draaf.auvergne-rhone-alpes.agriculture.gouv.fr/liste-des-appels-a-projets-a-manifestation-d-interet-a-candidature-prets-de-a5475.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Pays de la Loire | hors santé | hors santé | hors champ à l'écran | [page](https://draaf.pays-de-la-loire.agriculture.gouv.fr/appel-a-candidature-pour-l-agrement-des-structures-de-conseil-et-d-a2188.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Nouvelle-Aquitaine - Site de Poitiers | hors santé | hors santé | hors champ à l'écran | [page](https://draaf.nouvelle-aquitaine.agriculture.gouv.fr/appels-a-projets-r209.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Provence-Alpes-Côte d'Azur | hors santé | hors santé | hors champ à l'écran | [page](https://draaf.paca.agriculture.gouv.fr/guichets-appel-a-manifestation-d-interet-et-appel-a-projets-2026-r872.html) |
| Direction régionale et interdépartementale de l'alimentation, de l'agriculture et de la forêt (DRIAAF) - Île-de-France | hors santé | hors santé | hors champ à l'écran | [page](https://driaaf.ile-de-france.agriculture.gouv.fr/appel-a-projets-fonds-hydraulique-agricole-2026-a4376.html) |
| Maison départementale des personnes handicapées (MDPH) - Moselle | à vérifier | à vérifier | page morte à l'écran, adresse à retrouver | [page](https://www.moselle.fr/jcms/pl_14027/fr/maison-departementale-des-personnes-handicapees) |
| IHU Méditerranée Infection | hors santé | rubrique confirmée | appel MI2 2026 : innovation en infectiologie | [page](https://ihu-medinfection.com/appel-a-projet-aap-mi2-2026/) |
| GIRCI Est | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://girci-est.fr/appels-a-projets/) |
| France Life Imaging / réseaux thématiques de recherche | hors santé | rubrique confirmée | appels de recherche en imagerie médicale | [page](https://francelifeimaging.fr/) |
| Cancéropôle Est – appels à projets | rubrique confirmée | rubrique confirmée | appel générique 2027, PLBIO, bourses ; la page gardée listait les résultats | [page](https://www.canceropole-est.org/la-recherche-au-sein-du-canceropole-est/soutien-a-la-recherche/resultats-des-appels-a-projets-du-canceropole-est/) |
| GIRCI SOHO (Sud-Ouest Outre-Mer Hospitalier) | rubrique confirmée | rubrique confirmée | appels interrégionaux APITHEM et APIRES (recherche en soins) | [page](https://www.girci-soho.fr/) |
| Interreg ALCOTRA (France-Italie) | hors santé | hors santé | hors champ à l'écran | [page](https://www.interreg-alcotra.eu/fr/appels-projets) |
| Interreg POCTEFA (France-Espagne-Andorre) | hors santé | hors santé | hors champ à l'écran | [page](https://www.poctefa.eu/fr/appels-a-projets/) |
| Interreg Rhin Supérieur | hors santé | hors santé | hors champ à l'écran | [page](https://www.interreg-rhin-sup.eu/appel-a-projets-mobilites-transfrontalieres/) |
| Fédération Addiction | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://www.federationaddiction.fr/actualites/projets/ | [page](https://www.federationaddiction.fr/actualites/publics/femmes/lancement-de-lappel-a-candidatures-pour-faire-partie-du-groupe-de-travail-femmes-addictions/) |
| Uriopss PACA-Corse | PDF seulement | rubrique confirmée | bonne page vue à l'écran | [page](https://www.uriopss-pacac.fr/actualites/recensement-des-appels-projets-0) |
| Admical | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://admical.org/categories-articles/les-appels-projets | [page](https://admical.org/actualit%C3%A9s/la-fondation-dentreprise-ocirp-lance-son-appel-projets-lieux-alternatifs-du-prendre-soin) |
| Avise | hors santé | rubrique confirmée | adresse donnée à l'écran : https://www.avise.org/actualites | [page](https://www.avise.org/) |
| Le Compte Asso (subventions de l'État) | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://associations.gouv.fr/appels-projets) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Occitanie | rubrique confirmée | rubrique confirmée | adresse donnée à l'écran : https://occitanie.dreets.gouv.fr/Appels-a-projets | [page](https://occitanie.dreets.gouv.fr/) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Nouvelle-Aquitaine | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://nouvelle-aquitaine.dreets.gouv.fr/Marches-publics-et-appels-a-projets) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Hauts-de-France | hors santé | rubrique confirmée | adresse donnée à l'écran : https://hauts-de-france.dreets.gouv.fr/Appels-a-projets-DREETS | [page](https://hauts-de-france.dreets.gouv.fr/Points-Conseil-Budget-lancement-d-un-appel-a-projets) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Grand Est | hors santé | hors santé | hors champ à l'écran | [page](https://grand-est.dreets.gouv.fr/appel-projets-label-point-conseil-budget) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Bourgogne-Franche-Comté | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://bourgogne-franche-comte.dreets.gouv.fr/appels-projets) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Normandie | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://normandie.dreets.gouv.fr/Appels-a-projets) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Pays de la Loire | hors santé | rubrique confirmée | bonne page vue à l'écran | [page](https://pays-de-la-loire.dreets.gouv.fr/Appel-a-projets) |

## Par famille

| Famille | Qualifiées | rubrique confirmée | PDF seulement | hors santé | pas d'AAP | à vérifier | Sans page |
|---|---|---|---|---|---|---|---|
| ars | 19 | 19 | 0 | 0 | 0 | 0 | 0 |
| ministere | 46 | 34 | 0 | 10 | 0 | 2 | 107 |
| caisse-nationale | 23 | 22 | 0 | 0 | 0 | 1 | 243 |
| agence-nationale | 17 | 15 | 0 | 2 | 0 | 0 | 18 |
| fondation | 23 | 22 | 0 | 0 | 0 | 1 | 294 |
| europe | 5 | 2 | 0 | 3 | 0 | 0 | 8 |
| collectivite | 111 | 102 | 0 | 3 | 0 | 6 | 119 |
| societe-savante | 6 | 6 | 0 | 0 | 0 | 0 | 12 |
| etablissement | 10 | 10 | 0 | 0 | 0 | 0 | 21 |
| centrale-achat | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| autre | 10 | 10 | 0 | 0 | 0 | 0 | 37 |

## Sources confirmées

| Source | Famille | Forme | AAP visibles | Rubrique |
|---|---|---|---|---|
| Région Île-de-France – aides et appels à projets | collectivite | html | 347 | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) |
| Conseil régional Île-de-France | collectivite | html | 347 | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) |
| Directions.fr – appels à projet | autre | html | 120 | [page](https://www.directions.fr/appels-a-projet/) |
| FHF Hauts-de-France – appels à projets | autre | html | 32 | [page](https://www.fhf-hdf.fr/appels-a-projets/) |
| Conseil départemental Yonne | collectivite | html | 32 | [page](https://www.yonne.fr/aides-et-services/publics-demandeur-de-subvention/) |
| IReSP | agence-nationale | html | 23 | [page](https://iresp.net/financements/programmes-et-appels/appel-a-projets-clos/) |
| Promotion Santé Occitanie – appels à projets | autre | html | 20 | [page](https://promotion-sante-occitanie.org/soutenir-vos-projets/veille-des-appels-a-projet/) |
| Fondation pour la Recherche Médicale (FRM) | fondation | html | 16 | [page](https://www.frm.org/fr/espace-chercheurs-aap-clotures) |
| Conseil départemental Maine-et-Loire | collectivite | html | 16 | [page](https://www.maine-et-loire.fr/aides-et-services/professionnels/appels-a-projets) |
| ARS Grand Est | ars | html | 15 | [page](https://www.grand-est.ars.sante.fr/liste-appels-projet-candidature) |
| Portail national des ARS | ars | html | 15 | [page](https://www.ars.sante.fr/liste-appels-projet-candidature-nationale) |
| Loiret – appels à projets | collectivite | html | 15 | [page](https://www.loiret.fr/mon-departement/les-appels-projets-du-departement) |
| Ville de Paris – appels à projets | collectivite | html | 15 | [page](https://www.paris.fr/appels-a-projets) |
| ANSES – programme PNR-EST | agence-nationale | html | 15 | [page](https://www.anses.fr/fr/appels-et-consultations/avis-appel-manifestation-interet) |
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
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Bourgogne-Franche-Comté - Siège de Dijon | ministere | html | 14 | [page](https://draaf.bourgogne-franche-comte.agriculture.gouv.fr/aides-et-appels-a-projets-en-cours-r22.html) |
| Fondation de France | fondation | html | 13 | [page](https://www.fondationdefrance.org/fr/appels-a-projets) |
| FIRAH | fondation | html | 13 | [page](https://www.firah.org/fr/laureats-des-appels-a-projets-precedents.html) |
| FSE+ France | europe | html | 13 | [page](https://fse.gouv.fr/les-appels-a-projets) |
| Fondation Crédit Mutuel Alliance Fédérale | fondation | html | 13 | [page](https://www.fondationdefrance.org/fr/appels-a-projets-fa) |
| ARS Centre-Val de Loire | ars | html | 12 | [page](https://www.centre-val-de-loire.ars.sante.fr/liste-appels-projet-candidature) |
| Fondation ARC | fondation | html | 12 | [page](https://www.fondation-arc.org/appels-a-projets/) |
| Institut national du cancer (INCa) | agence-nationale | html | 12 | [page](https://www.cancer.fr/professionnels-de-la-recherche/appels-a-projets-et-a-candidatures/nos-appels-a-projets) |
| Société Française de Dermatologie | societe-savante | html | 12 | [page](https://www.sfdermato.org/page-46-resultats-des-appels-a-projet-et-bourses-sfd) |
| Conseil départemental Pyrénées-Atlantiques | collectivite | html | 12 | [page](https://www.le64.fr/vous-souhaitez/les-appels-projets-en-cours) |
| Conseil départemental Ain | collectivite | html | 12 | [page](https://www.ain.fr/solutions/liste-des-appels-a-projet-du-departement-de-lain/) |
| Préfecture - Seine-Maritime | ministere | html | 12 | [page](https://www.seine-maritime.gouv.fr/Publications/Appels-a-projets) |
| Haut-commissariat de la République - Nouvelle-Calédonie | ministere | html | 12 | [page](https://www.nouvelle-caledonie.gouv.fr/Actions-de-l-Etat/Appels-a-projets) |
| GIRCI Méditerranée | etablissement | html | 12 | [page](https://gircimediterranee.fr/appel-a-projet) |
| Cancéropôle Est – appels à projets | etablissement | html | 12 | [page](https://www.canceropole-est.org/la-recherche-au-sein-du-canceropole-est/soutien-a-la-recherche/resultats-des-appels-a-projets-du-canceropole-est/) |
| ARS Île-de-France | ars | html | 11 | [page](https://www.iledefrance.ars.sante.fr/liste-appels-projet-candidature) |
| ANR | agence-nationale | html | 11 | [page](https://anr.fr/fr/rechercher-un-ancien-appel-a-projets/) |
| Conseil départemental Vosges | collectivite | html | 11 | [page](https://www.vosges.fr/mon-departement/appels-a-projets/) |
| Conseil départemental Creuse | collectivite | mixte | 11 | [page](https://www.creuse.fr/Appels-a-projets-candidatures-55) |
| Conseil départemental Hautes-Pyrénées | collectivite | html | 11 | [page](https://www.hautespyrenees.fr/aides-et-subventions/appels-a-projets/) |
| Mairie de Toulon | collectivite | html | 11 | [page](https://demarches.toulon.fr/infos_demarches/appel-a-projets/) |
| Préfecture - Côte-d'Or | ministere | html | 11 | [page](https://www.cote-dor.gouv.fr/Actions-de-l-Etat/Appels-a-projets) |
| Maison départementale des personnes handicapées (MDPH) - Hautes-Pyrénées | collectivite | html | 11 | [page](https://www.hautespyrenees.fr/aides-et-subventions/appels-a-projets/) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Bourgogne-Franche-Comté | ministere | html | 11 | [page](https://bourgogne-franche-comte.dreets.gouv.fr/appels-projets) |
| ARS Bretagne | ars | html | 10 | [page](https://www.bretagne.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Auvergne-Rhône-Alpes | ars | html | 10 | [page](https://www.auvergne-rhone-alpes.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Normandie | ars | html | 10 | [page](https://www.normandie.ars.sante.fr/liste-appels-projet-candidature) |
| Fondation Médéric Alzheimer | fondation | html | 10 | [page](https://www.fondation-mederic-alzheimer.org/appels-a-projets/) |
| Bpifrance – France 2030 | agence-nationale | html | 10 | [page](https://www.bpifrance.fr/nos-appels-a-projets-concours) |
| Fondation de l'Avenir | fondation | html | 10 | [page](https://www.fondationdelavenir.org/chercheurs/appels-a-candidatures/) |
| Agence de l'eau Seine-Normandie | agence-nationale | html | 10 | [page](https://www.eau-seine-normandie.fr/appels_a_projets) |
| Plateforme nationale pour la recherche sur la fin de vie | societe-savante | html | 10 | [page](https://www.plateforme-recherche-findevie.fr/articles) |
| Conseil départemental Hérault | collectivite | html | 10 | [page](https://herault.fr/TPL_CODE/TPL_AIDEPROJETLISTE/321-guide-des-aides-et-appels-a-projet.htm) |
| Conseil départemental Charente-Maritime | collectivite | html | 10 | [page](https://la.charente-maritime.fr/informations-officielles/appels-projets) |
| Conseil départemental Haute-Marne | collectivite | html | 10 | [page](https://haute-marne.fr/l-institution/appel-a-projets-et-a-manifestation/) |
| Conseil départemental Haute-Garonne | collectivite | html | 10 | [page](https://www.haute-garonne.fr/appels-projetscandidatures-en-cours) |
| Conseil départemental Cantal | collectivite | html | 10 | [page](https://www.cantal.fr/le-conseil-departemental/les-appels-a-projets/) |
| Préfecture - Aveyron | ministere | html | 10 | [page](https://www.aveyron.gouv.fr/Publications/Appels-a-projet) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Centre-Val de Loire | ministere | html | 10 | [page](https://draaf.centre-val-de-loire.agriculture.gouv.fr/appels-a-projets-m18.html) |
| Cancéropôle Grand Ouest – appels à projets | etablissement | html | 10 | [page](https://www.canceropole-grandouest.com/appel-projets/) |
| ARS Hauts-de-France | ars | html | 9 | [page](https://www.hauts-de-france.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Mayotte | ars | html | 9 | [page](https://www.mayotte.ars.sante.fr/appels-projets-candidature-manifestation-dinteret) |
| Finistère – appels à projets | collectivite | html | 9 | [page](https://www.finistere.fr/le-conseil-departemental/appel-a-projets/) |
| Conseil départemental Finistère | collectivite | html | 9 | [page](https://www.finistere.fr/le-conseil-departemental/appel-a-projets/) |
| Conseil départemental Ille-et-Vilaine | collectivite | html | 9 | [page](https://www.ille-et-vilaine.fr/appels-projet) |
| Conseil départemental Mayenne | collectivite | html | 9 | [page](https://www.lamayenne.fr/page/appels-projet) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Grand Est - Site de Metz | ministere | html | 9 | [page](https://draaf.grand-est.agriculture.gouv.fr/appels-a-projets-r22.html) |
| Rhône – appels à candidatures prévention | collectivite | html | 8 | [page](https://www.rhone.fr/jcms/tl1_2008811/fr/appels-a-projets) |
| Conseil départemental Bouches-du-Rhône | collectivite | html | 8 | [page](https://departement13.fr/mon-departement/ladministration/les-appels-projets-departementaux) |
| Conseil départemental Tarn-et-Garonne | collectivite | html | 8 | [page](https://www.tarnetgaronne.fr/) |
| Conseil départemental Seine-et-Marne | collectivite | html | 8 | [page](https://www.seine-et-marne.fr/fr/appels-projet-subventions) |
| Conseil départemental Val-d'Oise | collectivite | html | 8 | [page](https://www.valdoise.fr/108-appels-a-projets.htm) |
| Direction départementale de l'emploi, du travail et des solidarités (DDETS) - Bouches-du-Rhône | ministere | html | 8 | [page](https://paca.dreets.gouv.fr/appels-projets) |
| Direction de l'alimentation, de l'agriculture et de la forêt (Daaf) - Martinique | ministere | html | 8 | [page](https://daaf.martinique.agriculture.gouv.fr/appels-a-projets-consultations-r23.html) |
| CNSA (Caisse nationale de solidarité pour l'autonomie) | caisse-nationale | html | 7 | [page](https://www.cnsa.fr/appels-projets) |
| ARS Guadeloupe | ars | html | 7 | [page](https://www.guadeloupe.ars.sante.fr/liste-appels-projet-candidature) |
| ARS La Réunion | ars | html | 7 | [page](https://www.lareunion.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Guyane | ars | html | 7 | [page](https://www.guyane.ars.sante.fr/liste-appels-projet-candidature) |
| Appelaprojets.org | autre | html | 7 | [page](https://www.appelaprojets.org/appelprojet) |
| Inserm | agence-nationale | html | 7 | [page](https://pro.inserm.fr/) |
| Agence de l'eau Rhin-Meuse | agence-nationale | html | 7 | [page](https://www.eau-rhin-meuse.fr/actualites/appel-projets) |
| Fondation Orange | fondation | html | 7 | [page](https://www.fondationorange.com/fr/le-calendrier-des-appels-projets) |
| Ville de Paris – politique de la ville | collectivite | html | 7 | [page](https://www.paris.fr/pages/repondre-a-un-appel-a-projets-5412) |
| Conseil départemental Allier | collectivite | html | 7 | [page](https://www.allier.fr/285-appels-a-projets.htm) |
| Conseil départemental Haute-Savoie | collectivite | html | 7 | [page](https://hautesavoie.fr/le-departement/enquetes-publiques-appels-a-projets/) |
| Conseil départemental Rhône | collectivite | html | 7 | [page](https://www.rhone.fr/jcms/tl1_2008811/fr/appels-a-projets) |
| Collectivité territoriale de Martinique | collectivite | mixte | 7 | [page](https://www.collectivitedemartinique.mq/appels-a-projet/) |
| Mairie de Bordeaux | collectivite | html | 7 | [page](https://www.bordeaux.fr/appels-projets) |
| Caisse de sécurité sociale (CSSM) de Mayotte - accueil de Mamoudzou | caisse-nationale | html | 7 | [page](https://www.cssm.fr/page/appels-a-projets-prevention-sante-2026) |
| Préfecture - Ille-et-Vilaine | ministere | html | 7 | [page](https://www.ille-et-vilaine.gouv.fr/Publications/Appel-a-projets) |
| Préfecture - Manche | ministere | html | 7 | [page](https://www.manche.gouv.fr/Publications/Appels-a-projets) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Occitanie - Siège de Toulouse | ministere | html | 7 | [page](https://draaf.occitanie.agriculture.gouv.fr/appels-a-projets-r1452.html) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Bretagne | ministere | html | 7 | [page](https://draaf.bretagne.agriculture.gouv.fr/nos-appels-a-projets-r22.html) |
| GIRCI Grand Ouest | etablissement | html | 7 | [page](https://www.chu-hugo.fr/transitions/appels-a-projets/) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Pays de la Loire | ministere | html | 7 | [page](https://pays-de-la-loire.dreets.gouv.fr/Appel-a-projets) |
| Fondation de l'AP-HP | etablissement | html | 6 | [page](https://www.fondationaphp.fr/nos-appels-a-projets/) |
| Conseil départemental Gard | collectivite | html | 6 | [page](https://www.gard.fr/information/appel-a-projets) |
| Conseil départemental Morbihan | collectivite | html | 6 | [page](https://www.morbihan.fr/le-conseil-departemental/appels-a-projets) |
| Conseil départemental Puy-de-Dôme | collectivite | html | 6 | [page](https://www.puy-de-dome.fr/appels-a-projets.html) |
| Conseil départemental Savoie | collectivite | html | 6 | [page](https://www.savoie.fr/web/dxx_5094/a-l-essentiel?subCategory_Th%E9matiques=dsw_36626) |
| Conseil départemental Gironde | collectivite | html | 6 | [page](https://www.gironde.fr/linstitution/appels-projets) |
| Conseil départemental Pas-de-Calais | collectivite | html | 6 | [page](https://www.pasdecalais.fr/appels-projets-et-appels-candidatures-et-manifestation-dinteret) |
| Conseil départemental Tarn | collectivite | html | 6 | [page](https://www.tarn.fr/accueil) |
| Mairie de Rennes | collectivite | html | 6 | [page](https://metropole.rennes.fr/appels-a-projets-partenariats-et-cooperations/) |
| Mairie de Brest | collectivite | html | 6 | [page](https://brest.fr/participer-agir/repondre-un-appel-projets) |
| Direction départementale de l'emploi, du travail et des solidarités (DDETS) - Ille-et-Vilaine | ministere | html | 6 | [page](https://bretagne.dreets.gouv.fr/Appels-a-projets) |
| GIRCI SOHO (Sud-Ouest Outre-Mer Hospitalier) | etablissement | html | 6 | [page](https://www.girci-soho.fr/) |
| Uriopss Hauts-de-France | autre | html | 6 | [page](https://www.uriopss-hdf.fr/actualites) |
| Le Compte Asso (subventions de l'État) | autre | html | 6 | [page](https://associations.gouv.fr/appels-projets) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Centre-Val de Loire | ministere | html | 6 | [page](https://centre-val-de-loire.dreets.gouv.fr/Marches-publics-et-appels-a-projets) |
| Fonds national pour la science ouverte | agence-nationale | html | 5 | [page](https://www.ouvrirlascience.fr/category/fnso/appels-a-projets-fnso/) |
| Société Française d'Étude et de Traitement de la Douleur (SFETD) | societe-savante | html | 5 | [page](https://www.sfetd-douleur.org/prix-et-appel-doffre/) |
| Conseil départemental Jura | collectivite | html | 5 | [page](https://www.jura.fr/appels-a-projets/) |
| Conseil départemental Var | collectivite | html | 5 | [page](https://var.fr/home/-/asset_publisher/GFXyOm7YlV2U/content/les-appels-a-projet/maximized?p_r_p_assetEntryId=1624415&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U_redirect=https%3A%2F%2Fvar.fr%2Fhome%3Fp_p_id%3Dcom_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U%26p_p_lifecycle%3D0%26p_p_state%3Dnormal%26p_p_mode%3Dview%26p_r_p_assetEntryId%3D1624415%26_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U_cur%3D0%26p_r_p_resetCur%3Dfalse) |
| Conseil départemental La Réunion | collectivite | html | 5 | [page](https://www.departement974.fr/avis-appels-projets-enquetes-publiques) |
| Conseil départemental Somme | collectivite | html | 5 | [page](https://www.somme.fr/departement/votre-departement/linstitution/les-appels-a-projets/) |
| Conseil départemental Val-de-Marne | collectivite | html | 5 | [page](https://www.valdemarne.fr/le-conseil-departemental/les-appels-a-projets) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Nord-Picardie | caisse-nationale | html | 5 | [page](https://www.carsat-hdf.fr/home/partenaires/partenaires-de-l-action-sociale/appel-a-projet.html) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Languedoc-Roussillon | caisse-nationale | html | 5 | [page](https://www.carsat-lr.fr/home.html) |
| Mutualité sociale agricole (MSA) Nouvelle-Aquitaine - accueil de Libourne | caisse-nationale | html | 5 | [page](https://gironde.msa.fr/lfp/appels-a-projets) |
| France Life Imaging / réseaux thématiques de recherche | etablissement | html | 5 | [page](https://francelifeimaging.fr/) |
| Agence du numérique en santé (ANS) | agence-nationale | html | 4 | [page](https://esante.gouv.fr/lagence/appels-a-projets) |
| Fondation des Hôpitaux | fondation | html | 4 | [page](https://appel-a-projet.fondationhopitaux.fr/) |
| ARS Occitanie | ars | html | 4 | [page](https://www.occitanie.ars.sante.fr/liste-appels-projet-candidature) |
| Conseil départemental Gers | collectivite | html | 4 | [page](https://www.gers.fr/aides-infos-pratiques/appels-a-projets-et-candidatures) |
| Direction régionale de l'alimentation, de l'agriculture et de la forêt (Draaf) - Auvergne-Rhône-Alpes - Site de Lyon | ministere | html | 4 | [page](https://draaf.auvergne-rhone-alpes.agriculture.gouv.fr/liste-des-appels-a-projets-a-manifestation-d-interet-a-candidature-prets-de-a5475.html) |
| Société Française de Médecine d'Urgence (SFMU) | societe-savante | html | 3 | [page](https://www.sfmu.org/fr/la-recherche/appel-a-projet/) |
| ARS Corse | ars | html | 3 | [page](https://www.corse.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Martinique | ars | html | 3 | [page](https://www.martinique.ars.sante.fr/liste-appels-projet-candidature) |
| France Alzheimer | fondation | html | 3 | [page](https://www.francealzheimer.org/nos-actions-nos-missions/soutien-a-recherche/les-appels-a-projets-france-alzheimer/) |
| Société Francophone du Diabète (SFD) | societe-savante | html | 3 | [page](https://www.sfdiabete.org/medical/la-recherche/allocations-de-recherche-et-prix) |
| Ville de Montpellier – appels à projets | collectivite | html | 3 | [page](https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets) |
| Montpellier Méditerranée Métropole – contrat de ville | collectivite | html | 3 | [page](https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets) |
| Conseil départemental Haute-Vienne | collectivite | html | 3 | [page](https://www.haute-vienne.fr/votre-conseil-departemental/appels-a-projets-du-departement) |
| Conseil départemental Eure | collectivite | html | 3 | [page](https://eureennormandie.fr/accueil/le-departement/nos-appels-a-projets/) |
| Conseil départemental Territoire de Belfort | collectivite | html | 3 | [page](https://www.territoiredebelfort.fr/appels-projets) |
| Conseil départemental Corrèze | collectivite | html | 3 | [page](https://www.correze.fr/) |
| Conseil départemental Orne | collectivite | html | 3 | [page](https://www.orne.fr/services/marches-publics-enquete-publique-aap-ami/appels-projets-appel-manifestation-dinteret) |
| Conseil départemental Yvelines | collectivite | html | 3 | [page](https://www.yvelines.fr/appels-a-projets-subventions/) |
| Mairie de Marseille | collectivite | html | 3 | [page](https://www.marseille.fr/economie/commerce/appels-manifestation-d-interet-de-la-ville-de-marseille) |
| Mairie de Amiens | collectivite | html | 3 | [page](https://www.amiens.fr/Institutions/Appel-a-candidatures) |
| Avise | autre | html | 3 | [page](https://www.avise.org/) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Nouvelle-Aquitaine | ministere | html | 3 | [page](https://nouvelle-aquitaine.dreets.gouv.fr/Marches-publics-et-appels-a-projets) |
| Deux-Sèvres – appels à projets | collectivite | html | 2 | [page](https://www.deux-sevres.fr/services-en-ligne/tous-les-appels-projets) |
| Conseil départemental Hauts-de-Seine | collectivite | html | 2 | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) |
| Conseil départemental Côtes-d'Armor | collectivite | html | 2 | [page](https://cotesdarmor.fr/le-departement/publications-reglementaires/appels-manifestation-d-interet) |
| Conseil départemental Lot | collectivite | html | 2 | [page](https://www.lot.fr/appels-projets) |
| Conseil départemental Calvados | collectivite | html | 2 | [page](https://www.calvados.fr/appels-a-projets) |
| Conseil départemental Pyrénées-Orientales | collectivite | html | 2 | [page](https://www.ledepartement66.fr/dossier/les-appels-a-projets/) |
| Conseil départemental Manche | collectivite | html | 2 | [page](https://www.manche.fr/les-appels-a-projets/) |
| Conseil départemental Charente | collectivite | html | 2 | [page](https://www.lacharente.fr/actualite/appel-a-projets) |
| Conseil départemental Deux-Sèvres | collectivite | html | 2 | [page](https://www.deux-sevres.fr/services-en-ligne/tous-les-appels-projets) |
| Mairie de Nice | collectivite | html | 2 | [page](https://www.nice.fr/tag/appel-a-projet/) |
| Mairie de Montpellier | collectivite | html | 2 | [page](https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-candidatures-a-projets) |
| Mairie de Reims | collectivite | html | 2 | [page](https://www.reims.fr/) |
| Mairie de Villeurbanne | collectivite | html | 2 | [page](https://www.villeurbanne.fr/) |
| Mutualité sociale agricole (MSA) Grand Est - accueil de Sarrebourg | caisse-nationale | html | 2 | [page](https://lorraine.msa.fr/lfp) |
| Mutualité sociale agricole (MSA) - Meurthe-et-Moselle - accueil de Vandœuvre-lès-Nancy | caisse-nationale | html | 2 | [page](https://lorraine.msa.fr/lfp) |
| Direction régionale et interdépartementale de l'économie, de l'emploi, du travail et des solidarités (DRIEETS) - Unité départementale de Paris | ministere | html | 2 | [page](https://idf.drieets.gouv.fr/Paris) |
| Maison de l'Autonomie (MDA) - Alpes-Maritimes | collectivite | html | 2 | [page](https://mda.departement06.fr/appel-projets) |
| Essonne – Commission des financeurs | collectivite | html | 1 | [page](https://demarche.numerique.gouv.fr/commencer/appel-a-projet-commission-des-financeurs-de-la-pre) |
| Conseil départemental Essonne | collectivite | html | 1 | [page](https://www.essonne.fr/appel-projets-candidatures) |
| Ministère de la Culture – Culture, santé, handicap et dépendance | ministere | html | 1 | [page](https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/appels-a-projets-candidatures/culture-sante-handicap-et-dependance) |
| Direction générale du Trésor – FASEP santé | ministere | html | 1 | [page](https://www.tresor.economie.gouv.fr/Articles/2026/06/25/appel-a-projets-fasep-2026-solutions-innovantes-pour-le-developpement-et-la-modernisation-des-systemes-de-sante) |
| Carsat Nord-Est – AAP des partenaires | caisse-nationale | html | 1 | [page](https://www.carsat-nordest.fr/home/partenaires/etre-partenaire-de-l-action-soci/appels-a-projets-des-partenaires/appel-a-projets-prevention-confe.html) |
| Fondation APICIL | fondation | html | 1 | [page](https://www.fondation-apicil.org/appel-a-projets/) |
| Fondation Malakoff Humanis Handicap | fondation | html | 1 | [page](https://newsroom.malakoffhumanis.com/actualites/la-fondation-malakoff-humanis-handicap-lance-un-appel-a-projet-pour-soutenir-les-innovations-technologiques-et-numeriques-permettant-de-favoriser-lacces-a-lemploi-et-a-la-sante-des-personnes-en-situation-de-handicap-e6dd-63a59.html) |
| Fondation Crédit Agricole Solidarité et Développement | fondation | html | 1 | [page](https://www.fondation-ca-solidaritedeveloppement.org/appel-a-projets/aide-sociale-a-lenfance-accompagner-les-jeunes-dans-leur-vie-dadulte/) |
| Interreg Sudoe | europe | html | 1 | [page](https://interreg-sudoe.eu/fr/4eme-appel-a-projets/) |
| Hauts-de-Seine – appels à projets | collectivite | html | 1 | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) |
| Métropole de Lyon – Commission des financeurs | collectivite | html | 1 | [page](https://commissiondesfinanceurs.grandlyon.com/) |
| Collectivité européenne d'Alsace – Commission des financeurs | collectivite | html | 1 | [page](https://www.alsace.eu/actualites/appel-a-projets-2026-commission-financeurs) |
| Drôme – Commission des financeurs | collectivite | html | 1 | [page](https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/) |
| Ministère de l'Enseignement supérieur et de la Recherche | ministere | html | 1 | [page](https://www.enseignementsup-recherche.gouv.fr/fr/appel-projets-appel-candidatures) |
| ANSM | agence-nationale | html | 1 | [page](https://ansm.sante.fr/actualites/renouvellement-du-comite-dinterface-avec-les-associations-de-patients-appel-a-candidatures-ouvert-jusquau-30-septembre-2026) |
| Health Data Hub | agence-nationale | html | 1 | [page](https://health-data-hub.fr/aap-gd4h) |
| Agence de l'eau Artois-Picardie | agence-nationale | html | 1 | [page](https://www.eau-artois-picardie.fr/la-jeunesse-pour-leau-appel-projets/appel-manifestation-dinteret-2026-faire-emerger-des-projets) |
| Agence de l'eau Loire-Bretagne | agence-nationale | html | 1 | [page](https://aides-redevances.eau-loire-bretagne.fr/home/aides/appels-a-projets-1/poissons-migrateurs-amphihalins-appel-a-projets-2027.html) |
| ANACT | agence-nationale | html | 1 | [page](https://www.anact.fr/fact/appel-projets-travail-climat-aura-occitanie-paca) |
| Fondation AÉSIO | fondation | html | 1 | [page](https://fondation.aesio.fr/actualites/appel-projets-reponses-questions-frequentes) |
| Fondation Force | fondation | html | 1 | [page](https://fondation-force.fr/appel-a-projets-2026-2/) |
| Fondation Paralysie Cérébrale | fondation | html | 1 | [page](https://fondationparalysiecerebrale.org/appels-a-projets/) |
| Fondation Alzheimer | fondation | html | 1 | [page](https://www.fondation-alzheimer.org/je-suis-chercheur/financement-de-projets/les-prix-de-la-fondation/) |
| Institut de France – fondations | fondation | html | 1 | [page](https://fondations.institutdefrance.fr/appel-a-projets-solidarite-internationale-2026-fondation-coallia-stephane-hessel) |
| Société Française de Gériatrie et Gérontologie (SFGG) | societe-savante | html | 1 | [page](https://sfgg.org/actualites/appels-a-participation-bourses-et-prix/prix-chaffoteaux/) |
| GIRCI Île-de-France | etablissement | html | 1 | [page](https://girci-idf.fr/projets/appel-a-projets-recherche-en-soins-apreso-2026/) |
| Métropole Aix-Marseille-Provence – contrat de ville | collectivite | html | 1 | [page](https://ampmetropole.fr/metropole/concertations-et-appels-a-projets/appels-a-projets-et-a-manifestation-dinteret/) |
| Conseil départemental Saône-et-Loire | collectivite | html | 1 | [page](https://www.saoneetloire.fr/actualite/appels-a-projets-2027/) |
| Conseil départemental Drôme | collectivite | html | 1 | [page](https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/) |
| Conseil départemental Hautes-Alpes | collectivite | html | 1 | [page](https://www.hautes-alpes.fr/le-departement/appels-a-candidatures/) |
| Conseil territorial de Saint-Pierre-et-Miquelon | collectivite | html | 1 | [page](https://www.spm-ct975.fr/actualite/service-daccompagnement-medico-social-pour-adultes-en-situation-de-handicap/) |
| Conseil départemental Sarthe | collectivite | html | 1 | [page](https://www.sarthe.fr/departement-sarthe/solidarite-autonomie/appels-projets) |
| Conseil départemental Mayotte | collectivite | html | 1 | [page](https://www.mayotte.fr/) |
| Conseil départemental Lozère | collectivite | html | 1 | [page](https://lozere.fr/lamenagement-du-territoire/developpement-economique/appels-projets.html) |
| Gouvernement de Nouvelle-Calédonie | collectivite | html | 1 | [page](https://gouv.nc/actualites/01-10-2026/lancement-de-lappel-projets-du-fonds-pacifique-2027) |
| Conseil régional Guadeloupe | collectivite | html | 1 | [page](https://www.regionguadeloupe.fr/appel-a-projets) |
| Conseil régional Centre-Val de Loire | collectivite | html | 1 | [page](https://www.centre-valdeloire.fr/appels-projet/recherche-et-innovation-campagne-2026-des-appels-projets) |
| Collectivité territoriale de Guyane | collectivite | html | 1 | [page](https://www.ctguyane.fr/appel-a-candidatures-residences-croisees-france-bresil-langues-et-savoirs-autochtones-par-dela-les-frontieres/) |
| Mairie de Orléans | collectivite | html | 1 | [page](https://www.orleans.fr/actualites/detail/contrat-de-ville-appel-a-projets) |
| Caisse générale de sécurité sociale (CGSS) - Martinique | caisse-nationale | html | 1 | [page](https://cgss-martinique.fr/appel-a-projets-ateliers-bienvenue-a-la-retraite/) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Normandie | caisse-nationale | html | 1 | [page](https://www.carsat-normandie.fr/home/partenaires/actualites-partenaire/toutes%20les%20actualites/appel-a-projets-accompagner-les.details-actualite.html) |
| Caisse générale de sécurité sociale (CGSS) - Guadeloupe | caisse-nationale | html | 1 | [page](https://www.cgss-guadeloupe.fr/18-actualites/actualites-assures/344-appel-a-projet-de-la-conference-des-financeurs-2026-2027.html) |
| Caisse nationale d’assurance vieillesse (Cnav) Assurance retraite Île-de-France | caisse-nationale | html | 1 | [page](https://www.lassuranceretraite-idf.fr/home/partenaire/soutenir-financierement-les-projets/appels-a-projets.html) |
| Mutualité sociale agricole (MSA) Bourgogne - accueil d'Autun | caisse-nationale | html | 1 | [page](https://bourgogne.msa.fr/lfp/appel-projets-msa-solidaire/2026) |
| Mutualité sociale agricole (MSA) Sud-Aquitaine - accueil de Saint-Pierre-du-Mont | caisse-nationale | html | 1 | [page](https://sudaquitaine.msa.fr/lfp/nos-appels-%C3%A0-projets1) |
| Mutualité sociale agricole (MSA) Occitanie - accueil de Carcassonne | caisse-nationale | html | 1 | [page](https://grandsud.msa.fr/lfp/appel-projet-ass) |
| Mutualité sociale agricole (MSA) Sud-Champagne - accueil de Troyes | caisse-nationale | html | 1 | [page](https://sudchampagne.msa.fr/lfp/aap) |
| Caisse générale de sécurité sociale (CGSS) - Guyane | caisse-nationale | html | 1 | [page](https://www.cgss-guyane.fr/appel-a-projets/appel-a-projet-fnpeis-2026/) |
| Mutualité sociale agricole (MSA) Nouvelle-Aquitaine - accueil de Nontron | caisse-nationale | html | 1 | [page](https://dlg.msa.fr/lfp/web/msa-dordogne-lot-et-garonne/appel-a-projet-jeune) |
| Mutualité sociale agricole (MSA) Alpes-Vaucluse - accueil d'Avignon | caisse-nationale | html | 1 | [page](https://alpes-vaucluse.msa.fr/lfp/l-appel-%C3%A0-projets-jeunes-apj-) |
| Mutualité sociale agricole (MSA) Berry-Touraine - accueil de Blois | caisse-nationale | html | 1 | [page](https://berry-touraine.msa.fr/lfp/appel-a-projets) |
| Mutualité sociale agricole (MSA) Picardie - accueil de Laon | caisse-nationale | html | 1 | [page](https://picardie.msa.fr/lfp/appel-a-projets-jeunes) |
| Mutualité sociale agricole (MSA) Beauce Coeur-de-Loire - accueil de Chartres | caisse-nationale | html | 1 | [page](https://bcl.msa.fr/lfp/appel-a-projets-jeunes) |
| Préfecture - Cantal | ministere | html | 1 | [page](https://www.cantal.gouv.fr/Actualites/Economie-Emploi/Appel-a-projets-2026-2028-pour-le-Dispositif-Local-d-Accompagnement-DLA) |
| Préfecture - Val-d'Oise | ministere | html | 1 | [page](https://www.val-doise.gouv.fr/Publications/Appels-a-projets) |
| Préfecture - Vaucluse | ministere | pdf | 1 | [page](https://www.vaucluse.gouv.fr/Actions-de-l-Etat/Securite/Prevention-de-la-delinquance-et-de-la-radicalisation/Prevention-de-la-radicalisation/Appel-a-projet-2026-FIPD-radicalisation) |
| Direction générale de la cohésion des populations (DGCOPOP) - Guyane | ministere | html | 1 | [page](https://guyane.deets.gouv.fr/Appel-a-projet-FSE-Favoriser-l-acces-au-logement-et-la-prevention-des-violences) |
| IHU Méditerranée Infection | etablissement | html | 1 | [page](https://ihu-medinfection.com/appel-a-projet-aap-mi2-2026/) |
| GIRCI Est | etablissement | html | 1 | [page](https://girci-est.fr/appels-a-projets/) |
| Fédération Addiction | autre | html | 1 | [page](https://www.federationaddiction.fr/actualites/publics/femmes/lancement-de-lappel-a-candidatures-pour-faire-partie-du-groupe-de-travail-femmes-addictions/) |
| Uriopss PACA-Corse | autre | pdf | 1 | [page](https://www.uriopss-pacac.fr/actualites/recensement-des-appels-projets-0) |
| Admical | autre | html | 1 | [page](https://admical.org/actualit%C3%A9s/la-fondation-dentreprise-ocirp-lance-son-appel-projets-lieux-alternatifs-du-prendre-soin) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Occitanie | ministere | html | 1 | [page](https://occitanie.dreets.gouv.fr/) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Hauts-de-France | ministere | html | 1 | [page](https://hauts-de-france.dreets.gouv.fr/Points-Conseil-Budget-lancement-d-un-appel-a-projets) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Normandie | ministere | html | 1 | [page](https://normandie.dreets.gouv.fr/Appels-a-projets) |
| Fondation Maladies Rares | fondation | html | 0 | [page](https://fondation-maladiesrares.org/appels-a-projets-2019-de-fondation/) |
| DGOS – programmes de recherche hospitalière (PHRC, PHRIP, PREPS, PRME) | ministere | html | 0 | [page](https://sante.gouv.fr/systeme-de-sante/innovation-et-recherche/l-innovation-et-la-recherche-clinique/appels-a-projets/programmes-recherche) |
| Fondation Le Souffle | fondation | html | 0 | [page](https://www.lesouffle.org/appels-projets-recherche) |
| Conseil départemental Meurthe-et-Moselle | collectivite | html | 0 | [page](https://www.meurthe-et-moselle.fr/appels-projets) |
| Conseil départemental Doubs | collectivite | html | 0 | [page](https://www.doubs.fr/le-departement/appel-a-projets-a-candidatures-ou-appel-a-manifestation-dinteret/) |
| Conseil départemental Oise | collectivite | html | 0 | [page](https://oise.fr/) |
| Conseil départemental Aube | collectivite | html | 0 | [page](https://www.aube.fr/le-departement/budget-et-documents-reglementaires/appels-a-projets/) |
| Conseil départemental Alpes-Maritimes | collectivite | html | 0 | [page](https://www.departement06.fr/appels-projets-solidarite-sociale) |
| Conseil régional La Réunion | collectivite | html | 0 | [page](https://regionreunion.com/) |
| Préfecture - Rhône | ministere |  |  | [page](https://www.rhone.gouv.fr/) |
| Préfecture - Morbihan | ministere |  |  | [page](https://www.morbihan.gouv.fr/Publications/Appels-a-manifestation-d-interet/Ouverture-de-l-appel-a-manifestation-d-interet-2021-pour-la-labellisation-Point-conseil-budget) |
| Direction départementale de l'emploi, du travail et des solidarités (DDETS) - Isère | ministere | html | 0 | [page](https://auvergne-rhone-alpes.dreets.gouv.fr/appels-projets) |

## Sources à vérifier à la main

| Source | Raison | Page |
|---|---|---|
| Fondation Groupe Pasteur Mutualité | page morte à l'écran, adresse à retrouver | [page](https://www.gpm.fr/appel-a-candidature/) |
| Conseil départemental Vaucluse | page morte à l'écran, adresse à retrouver | [page](https://www.vaucluse.fr/votre-departement-307.html) |
| Conseil départemental Moselle | page morte à l'écran, adresse à retrouver | [page](https://www.moselle.fr/jcms/dlmnd_5083/fr/toute-l-info?portal=j_206) |
| Conseil départemental Aude | page morte à l'écran, adresse à retrouver | [page](https://www.aude.fr/repondre-un-appel-projet-appel-candidatures) |
| Conseil départemental Alpes-de-Haute-Provence | page morte à l'écran, adresse à retrouver | [page](https://www.mondepartement04.fr/insertion/appel-a-projets-pdi) |
| Mairie de Lille | page morte à l'écran, adresse à retrouver | [page](https://www.lille.fr/Votre-Mairie/La-commande-publique-et-les-appels-a-manifestation-d-interet/Appels-a-manifestation-d-interet-pour-l-occupation-du-domaine-public) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Alsace-Moselle | page morte à l'écran, adresse à retrouver | [page](https://www.carsat-alsacemoselle.fr/home.html) |
| Préfecture - Nièvre | page morte à l'écran, adresse à retrouver | [page](https://www.nievre.gouv.fr/Publications/Appels-a-projets/Contrat-d-engagement-jeunes-volet-Jeunes-en-rupture) |
| Direction de l'économie, de l'emploi, du travail et des solidarités (DEETS) - Guadeloupe | page morte à l'écran, adresse à retrouver | [page](https://guadeloupe.deets.gouv.fr/) |
| Maison départementale des personnes handicapées (MDPH) - Moselle | page morte à l'écran, adresse à retrouver | [page](https://www.moselle.fr/jcms/pl_14027/fr/maison-departementale-des-personnes-handicapees) |
