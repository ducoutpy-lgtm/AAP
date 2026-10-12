# Qualification des sources

Généré le 2026-10-12 par `python scraping/qualification.py --rapport`. Verdict calculé à partir des
réponses du modèle local Ollama sur la page de rubrique gardée par `decouverte.py` ; sondage manuel ci-dessous.

**270 sources qualifiées sur 847 : 155 rubrique confirmée, 1 PDF seulement, 88 hors santé, 6 pas d'AAP, 20 à vérifier ; 577 sources sans page gardée (à vérifier).**

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

70 verdicts corrigés à la relecture (fichier `sources/relecture_qualification.json`) ; le verdict du modèle est conservé. Les décomptes ci-dessus et ci-dessous utilisent le verdict relu.

| Source | Verdict du modèle | Verdict relu | Motif | Page |
|---|---|---|---|---|
| ANR | hors santé | rubrique confirmée | page des appels en cours indiquée par Monsieur DUCOUT (anr.fr/fr/appels) : PEPR Psychiatrie de précision, appel générique 2027 | [page](https://anr.fr/fr/rechercher-un-ancien-appel-a-projets/) |
| IReSP | rubrique confirmée | rubrique confirmée | programmes Autonomie, Addictions, MESSIDORE ; la page gardée listait les appels clos | [page](https://iresp.net/financements/programmes-et-appels/appel-a-projets-clos/) |
| Bpifrance – France 2030 | hors santé | hors santé | industrie, clusters Eureka, espace de données | [page](https://www.bpifrance.fr/nos-appels-a-projets-concours) |
| Fondation pour la Recherche Médicale (FRM) | rubrique confirmée | à vérifier | cas limite à trancher : programmes de recherche en biologie et santé, mais seule la page des appels clôturés est connue, page des appels en cours à retrouver | [page](https://www.frm.org/fr/espace-chercheurs-aap-clotures) |
| FIRAH | rubrique confirmée | rubrique confirmée | quatre appels de recherche appliquée sur le handicap en 2026 ; la page gardée listait les lauréats | [page](https://www.firah.org/fr/laureats-des-appels-a-projets-precedents.html) |
| Fondation Maladies Rares | hors santé | rubrique confirmée | appels à projets conjoints maladies rares (MASFD, GRI, AFMF) ; la page gardée datait de 2019 | [page](https://fondation-maladiesrares.org/appels-a-projets-2019-de-fondation/) |
| Fondation ARC | hors santé | rubrique confirmée | douze appels de recherche sur le cancer : recherche médicale | [page](https://www.fondation-arc.org/appels-a-projets/) |
| Interreg Sudoe | hors santé | rubrique confirmée | appel ciblant le vieillissement de la population (autonomie), relevé au sondage | [page](https://interreg-sudoe.eu/fr/4eme-appel-a-projets/) |
| Hauts-de-Seine – appels à projets | hors santé | rubrique confirmée | fonds de mobilité pour les services d'aide à domicile : médico-social | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) |
| Rhône – appels à candidatures prévention | hors santé | rubrique confirmée | AMI CPOM services autonomie à domicile 2027, appel à candidatures conférence des financeurs 2027 | [page](https://www.rhone.fr/jcms/tl1_2008811/fr/appels-a-projets) |
| Drôme – Commission des financeurs | hors santé | à vérifier | liste des appels non rendue pour le robot : ouvrir à la main | [page](https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/) |
| Région Île-de-France – aides et appels à projets | hors santé | à vérifier | cas limite à trancher : guichet régional de 347 aides par public et thématique, la santé y figure (ex. AlimenTaSanté) mais noyée | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) |
| Ministère de l'Enseignement supérieur et de la Recherche | hors santé | hors santé | coopérations internationales, prix Joliot-Curie, contrats doctoraux handicap (accès des étudiants, pas de santé) | [page](https://www.enseignementsup-recherche.gouv.fr/fr/appel-projets-appel-candidatures) |
| ANSES – programme PNR-EST | hors santé | hors santé | AMI techniques (vaccins faune sauvage, génotypage) ; page du programme PNR-EST non trouvée | [page](https://www.anses.fr/fr/appels-et-consultations/avis-appel-manifestation-interet) |
| Inserm | rubrique confirmée | rubrique confirmée | appels Horizon 2050 et équipements en cancérologie : recherche médicale | [page](https://pro.inserm.fr/) |
| Fondation Le Souffle | hors santé | rubrique confirmée | bourses et appels à projets de recherche en santé respiratoire ; le modèle n'avait lu que la liste des cookies | [page](https://www.lesouffle.org/appels-projets-recherche) |
| Fondation Alzheimer | hors santé | rubrique confirmée | prix Joël Ménard pour jeunes médecins chercheurs : recherche médicale | [page](https://www.fondation-alzheimer.org/je-suis-chercheur/financement-de-projets/les-prix-de-la-fondation/) |
| Société Française de Gériatrie et Gérontologie (SFGG) | hors santé | rubrique confirmée | prix Chaffoteaux : recherche en gériatrie | [page](https://sfgg.org/actualites/appels-a-participation-bourses-et-prix/prix-chaffoteaux/) |
| Métropole Aix-Marseille-Provence – contrat de ville | hors santé | hors santé | contrat de ville, projet alimentaire territorial, locaux et immobilier | [page](https://ampmetropole.fr/metropole/concertations-et-appels-a-projets/appels-a-projets-et-a-manifestation-dinteret/) |
| Conseil départemental Meurthe-et-Moselle | hors santé | à vérifier | page vide pour le robot : ouvrir à la main | [page](https://www.meurthe-et-moselle.fr/appels-projets) |
| Conseil départemental Gard | hors santé | rubrique confirmée | activité physique adaptée et isolement des personnes âgées, relevé au sondage | [page](https://www.gard.fr/information/appel-a-projets) |
| Conseil départemental Doubs | hors santé | à vérifier | page vide pour le robot : ouvrir à la main | [page](https://www.doubs.fr/le-departement/appel-a-projets-a-candidatures-ou-appel-a-manifestation-dinteret/) |
| Conseil départemental Hauts-de-Seine | hors santé | rubrique confirmée | même page que Hauts-de-Seine appels à projets : services d'aide à domicile | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) |
| Conseil départemental Saône-et-Loire | hors santé | pas d'AAP | article sur le téléservice de demande d'aide 2027, aucun appel listé | [page](https://www.saoneetloire.fr/actualite/appels-a-projets-2027/) |
| Conseil départemental Allier | hors santé | rubrique confirmée | AMI habitat inclusif 2026, création de places en lieux de vie et d'accueil | [page](https://www.allier.fr/285-appels-a-projets.htm) |
| Conseil départemental Moselle | hors santé | rubrique confirmée | services autonomie à domicile, proches aidants, « Avec ma santé », isolement des seniors | [page](https://www.moselle.fr/jcms/dlmnd_5083/fr/toute-l-info?portal=j_206) |
| Conseil départemental Yonne | hors santé | rubrique confirmée | AMI 2027-2029 prévention de la perte d'autonomie, avis d'appel à projet social et médico-social | [page](https://www.yonne.fr/aides-et-services/publics-demandeur-de-subvention/) |
| Conseil départemental Vosges | hors santé | rubrique confirmée | appel commission des financeurs 2026, dotation aux services autonomie à domicile | [page](https://www.vosges.fr/mon-departement/appels-a-projets/) |
| Conseil départemental Tarn-et-Garonne | rubrique confirmée | rubrique confirmée | appels prévention santé et remobilisation, création de 35 places d'accueil et d'hébergement, CDCA ; site refuse le robot | [page](https://www.tarnetgaronne.fr/) |
| Conseil départemental Drôme | hors santé | à vérifier | même page : liste non rendue pour le robot : ouvrir à la main | [page](https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/) |
| Conseil départemental Hautes-Alpes | hors santé | à vérifier | page vide pour le robot : ouvrir à la main | [page](https://www.hautes-alpes.fr/le-departement/appels-a-candidatures/) |
| Conseil départemental Aube | hors santé | à vérifier | page vide pour le robot : ouvrir à la main | [page](https://www.aube.fr/le-departement/budget-et-documents-reglementaires/appels-a-projets/) |
| Conseil départemental Territoire de Belfort | hors santé | rubrique confirmée | appel commission des financeurs de la prévention de la perte d'autonomie 2026 | [page](https://www.territoiredebelfort.fr/appels-projets) |
| Conseil départemental Savoie | hors santé | rubrique confirmée | appel commission des financeurs 2027-2029 | [page](https://www.savoie.fr/web/dxx_5094/a-l-essentiel?subCategory_Th%E9matiques=dsw_36626) |
| Conseil départemental Rhône | hors santé | rubrique confirmée | même page : AMI CPOM services autonomie à domicile 2027, conférence des financeurs 2027 | [page](https://www.rhone.fr/jcms/tl1_2008811/fr/appels-a-projets) |
| Conseil départemental Corrèze | hors santé | à vérifier | cas limite à trancher : rubriques dédiées Autonomie et Action sociale visibles par leur nom, contenu non lisible par le robot | [page](https://www.correze.fr/) |
| Conseil départemental Alpes-Maritimes | hors santé | rubrique confirmée | appels Santé Innovation, Seniors, commission des financeurs 2027, syndrome de Diogène | [page](https://www.departement06.fr/appels-projets-solidarite-sociale) |
| Conseil départemental Seine-et-Marne | hors santé | hors santé | culture, sport, para-sport | [page](https://www.seine-et-marne.fr/fr/appels-projet-subventions) |
| Conseil départemental Gironde | hors santé | hors santé | ventes immobilières, conseil des jeunes, concours citoyenneté | [page](https://www.gironde.fr/linstitution/appels-projets) |
| Conseil départemental Mayenne | hors santé | rubrique confirmée | appel commission des financeurs, accueil de mineurs et jeunes majeurs | [page](https://www.lamayenne.fr/page/appels-projet) |
| Conseil départemental Pas-de-Calais | hors santé | hors santé | soutien à la filière halieutique | [page](https://www.pasdecalais.fr/appels-projets-et-appels-candidatures-et-manifestation-dinteret) |
| Conseil départemental Orne | hors santé | rubrique confirmée | appel à candidatures commission des financeurs Orne, dotation qualité des services autonomie | [page](https://www.orne.fr/services/marches-publics-enquete-publique-aap-ami/appels-projets-appel-manifestation-dinteret) |
| Conseil départemental Mayotte | hors santé | à vérifier | cas limite à trancher : rubrique AAP, AMI, AAC du Département-Région, vide au 2026-10-12 | [page](https://www.mayotte.fr/) |
| Conseil départemental Yvelines | hors santé | hors santé | FSE insertion des jeunes, AMI occupation du domaine public | [page](https://www.yvelines.fr/appels-a-projets-subventions/) |
| Conseil départemental Aude | hors santé | rubrique confirmée | appels isolement social des seniors, #moisenior 2027, places pour mineurs non accompagnés | [page](https://www.aude.fr/repondre-un-appel-projet-appel-candidatures) |
| Conseil départemental Tarn | hors santé | rubrique confirmée | appel commission des financeurs de la prévention de la perte d'autonomie visible dans les actualités | [page](https://www.tarn.fr/accueil) |
| Conseil départemental Val-de-Marne | hors santé | à vérifier | cas limite à trancher : appel 2026 pour 222 mesures d'accueil de mineurs de l'ASE (établissements sociaux, pas médico-sociaux) | [page](https://www.valdemarne.fr/le-conseil-departemental/les-appels-a-projets) |
| Conseil régional Île-de-France | hors santé | à vérifier | cas limite à trancher : même page, guichet régional de 347 aides où la santé est noyée | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) |
| Conseil régional Centre-Val de Loire | hors santé | hors santé | Humain et Tech, diversification, formation, vie étudiante, recherche générale | [page](https://www.centre-valdeloire.fr/appels-projet/recherche-et-innovation-campagne-2026-des-appels-projets) |
| Mairie de Bordeaux | hors santé | hors santé | prix des jeunes associations ; page du CCAS presque vide | [page](https://www.bordeaux.fr/appels-projets) |
| Mairie de Reims | rubrique confirmée | hors santé | appels culturels et postes à pourvoir | [page](https://www.reims.fr/) |
| Mairie de Villeurbanne | rubrique confirmée | hors santé | foodtrucks, marchés, cité éducative | [page](https://www.villeurbanne.fr/) |
| Caisse générale de sécurité sociale (CGSS) - Martinique | hors santé | rubrique confirmée | ateliers Bienvenue à la retraite : prévention inter-régimes du bien vieillir | [page](https://cgss-martinique.fr/appel-a-projets-ateliers-bienvenue-a-la-retraite/) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Normandie | hors santé | rubrique confirmée | appel accompagner le passage à la retraite : prévention du bien vieillir | [page](https://www.carsat-normandie.fr/home/partenaires/actualites-partenaire/toutes%20les%20actualites/appel-a-projets-accompagner-les.details-actualite.html) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Languedoc-Roussillon | hors santé | rubrique confirmée | appel « Innovation et Silver autonomie » | [page](https://www.carsat-lr.fr/home.html) |
| Caisse nationale d’assurance vieillesse (Cnav) Assurance retraite Île-de-France | hors santé | rubrique confirmée | appel « bien-vieillir » : prévention de la perte d'autonomie | [page](https://www.lassuranceretraite-idf.fr/home/partenaire/soutenir-financierement-les-projets/appels-a-projets.html) |
| Mutualité sociale agricole (MSA) Occitanie - accueil de Carcassonne | hors santé | hors santé | appel Grandir en milieu rural (jeunesse) | [page](https://grandsud.msa.fr/lfp/appel-projet-ass) |
| Mutualité sociale agricole (MSA) Nouvelle-Aquitaine - accueil de Libourne | hors santé | rubrique confirmée | appel 2026 en faveur des aidants, répit parental | [page](https://gironde.msa.fr/lfp/appels-a-projets) |
| Mutualité sociale agricole (MSA) Grand Est - accueil de Sarrebourg | hors santé | rubrique confirmée | appel à projets Bien-être psychologique (Label Vie) | [page](https://lorraine.msa.fr/lfp) |
| Mutualité sociale agricole (MSA) - Meurthe-et-Moselle - accueil de Vandœuvre-lès-Nancy | hors santé | rubrique confirmée | même page : appel à projets Bien-être psychologique (Label Vie) | [page](https://lorraine.msa.fr/lfp) |
| Direction départementale de l'emploi, du travail et des solidarités (DDETS) - Isère | hors santé | à vérifier | liste non rendue pour le robot (filtre Solidarités : 3 appels) : ouvrir à la main | [page](https://auvergne-rhone-alpes.dreets.gouv.fr/appels-projets) |
| IHU Méditerranée Infection | hors santé | rubrique confirmée | appel MI2 2026 : innovation en infectiologie | [page](https://ihu-medinfection.com/appel-a-projet-aap-mi2-2026/) |
| GIRCI Est | hors santé | à vérifier | liste des appels non rendue pour le robot : ouvrir à la main | [page](https://girci-est.fr/appels-a-projets/) |
| France Life Imaging / réseaux thématiques de recherche | hors santé | rubrique confirmée | appels de recherche en imagerie médicale | [page](https://francelifeimaging.fr/) |
| Cancéropôle Est – appels à projets | rubrique confirmée | rubrique confirmée | appel générique 2027, PLBIO, bourses ; la page gardée listait les résultats | [page](https://www.canceropole-est.org/la-recherche-au-sein-du-canceropole-est/soutien-a-la-recherche/resultats-des-appels-a-projets-du-canceropole-est/) |
| GIRCI SOHO (Sud-Ouest Outre-Mer Hospitalier) | rubrique confirmée | rubrique confirmée | appels interrégionaux APITHEM et APIRES (recherche en soins) | [page](https://www.girci-soho.fr/) |
| Avise | hors santé | hors santé | agenda d'appels de tiers (innovation sociale, finance durable) | [page](https://www.avise.org/) |
| Le Compte Asso (subventions de l'État) | hors santé | hors santé | FDVA, mentorat, solidarité internationale | [page](https://associations.gouv.fr/appels-projets) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Occitanie | rubrique confirmée | à vérifier | délai dépassé ; un appel à candidatures mandataires judiciaires vu : ouvrir à la main | [page](https://occitanie.dreets.gouv.fr/) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Nouvelle-Aquitaine | hors santé | à vérifier | cas limite à trancher : appel 2026 lutte contre la précarité menstruelle (santé publique, financeur hors santé) | [page](https://nouvelle-aquitaine.dreets.gouv.fr/Marches-publics-et-appels-a-projets) |

## Par famille

| Famille | Qualifiées | rubrique confirmée | PDF seulement | hors santé | pas d'AAP | à vérifier | Sans page |
|---|---|---|---|---|---|---|---|
| ars | 19 | 19 | 0 | 0 | 0 | 0 | 0 |
| ministere | 46 | 4 | 0 | 36 | 0 | 6 | 104 |
| caisse-nationale | 23 | 15 | 0 | 7 | 1 | 0 | 243 |
| agence-nationale | 17 | 7 | 0 | 10 | 0 | 0 | 17 |
| fondation | 23 | 19 | 0 | 3 | 0 | 1 | 19 |
| europe | 5 | 1 | 0 | 4 | 0 | 0 | 8 |
| collectivite | 111 | 68 | 0 | 26 | 5 | 12 | 119 |
| societe-savante | 6 | 6 | 0 | 0 | 0 | 0 | 12 |
| etablissement | 10 | 9 | 0 | 0 | 0 | 1 | 21 |
| centrale-achat | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| autre | 10 | 7 | 1 | 2 | 0 | 0 | 30 |

## Sources confirmées

| Source | Famille | Forme | AAP visibles | Rubrique |
|---|---|---|---|---|
| Directions.fr – appels à projet | autre | html | 120 | [page](https://www.directions.fr/appels-a-projet/) |
| FHF Hauts-de-France – appels à projets | autre | html | 32 | [page](https://www.fhf-hdf.fr/appels-a-projets/) |
| Conseil départemental Yonne | collectivite | html | 32 | [page](https://www.yonne.fr/aides-et-services/publics-demandeur-de-subvention/) |
| IReSP | agence-nationale | html | 23 | [page](https://iresp.net/financements/programmes-et-appels/appel-a-projets-clos/) |
| Promotion Santé Occitanie – appels à projets | autre | html | 20 | [page](https://promotion-sante-occitanie.org/soutenir-vos-projets/veille-des-appels-a-projet/) |
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
| Fondation ARC | fondation | html | 12 | [page](https://www.fondation-arc.org/appels-a-projets/) |
| Institut national du cancer (INCa) | agence-nationale | html | 12 | [page](https://www.cancer.fr/professionnels-de-la-recherche/appels-a-projets-et-a-candidatures/nos-appels-a-projets) |
| Société Française de Dermatologie | societe-savante | html | 12 | [page](https://www.sfdermato.org/page-46-resultats-des-appels-a-projet-et-bourses-sfd) |
| Conseil départemental Pyrénées-Atlantiques | collectivite | html | 12 | [page](https://www.le64.fr/vous-souhaitez/les-appels-projets-en-cours) |
| Conseil départemental Ain | collectivite | html | 12 | [page](https://www.ain.fr/solutions/liste-des-appels-a-projet-du-departement-de-lain/) |
| GIRCI Méditerranée | etablissement | html | 12 | [page](https://gircimediterranee.fr/appel-a-projet) |
| Cancéropôle Est – appels à projets | etablissement | html | 12 | [page](https://www.canceropole-est.org/la-recherche-au-sein-du-canceropole-est/soutien-a-la-recherche/resultats-des-appels-a-projets-du-canceropole-est/) |
| ARS Île-de-France | ars | html | 11 | [page](https://www.iledefrance.ars.sante.fr/liste-appels-projet-candidature) |
| ANR | agence-nationale | html | 11 | [page](https://anr.fr/fr/rechercher-un-ancien-appel-a-projets/) |
| Conseil départemental Vosges | collectivite | html | 11 | [page](https://www.vosges.fr/mon-departement/appels-a-projets/) |
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
| Conseil départemental Moselle | collectivite | html | 10 | [page](https://www.moselle.fr/jcms/dlmnd_5083/fr/toute-l-info?portal=j_206) |
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
| Conseil départemental Mayenne | collectivite | html | 9 | [page](https://www.lamayenne.fr/page/appels-projet) |
| Rhône – appels à candidatures prévention | collectivite | html | 8 | [page](https://www.rhone.fr/jcms/tl1_2008811/fr/appels-a-projets) |
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
| Conseil départemental Allier | collectivite | html | 7 | [page](https://www.allier.fr/285-appels-a-projets.htm) |
| Conseil départemental Haute-Savoie | collectivite | html | 7 | [page](https://hautesavoie.fr/le-departement/enquetes-publiques-appels-a-projets/) |
| Conseil départemental Rhône | collectivite | html | 7 | [page](https://www.rhone.fr/jcms/tl1_2008811/fr/appels-a-projets) |
| Collectivité territoriale de Martinique | collectivite | mixte | 7 | [page](https://www.collectivitedemartinique.mq/appels-a-projet/) |
| Caisse de sécurité sociale (CSSM) de Mayotte - accueil de Mamoudzou | caisse-nationale | html | 7 | [page](https://www.cssm.fr/page/appels-a-projets-prevention-sante-2026) |
| GIRCI Grand Ouest | etablissement | html | 7 | [page](https://www.chu-hugo.fr/transitions/appels-a-projets/) |
| Fondation de l'AP-HP | etablissement | html | 6 | [page](https://www.fondationaphp.fr/nos-appels-a-projets/) |
| Conseil départemental Gard | collectivite | html | 6 | [page](https://www.gard.fr/information/appel-a-projets) |
| Conseil départemental Morbihan | collectivite | html | 6 | [page](https://www.morbihan.fr/le-conseil-departemental/appels-a-projets) |
| Conseil départemental Puy-de-Dôme | collectivite | html | 6 | [page](https://www.puy-de-dome.fr/appels-a-projets.html) |
| Conseil départemental Savoie | collectivite | html | 6 | [page](https://www.savoie.fr/web/dxx_5094/a-l-essentiel?subCategory_Th%E9matiques=dsw_36626) |
| Conseil départemental Tarn | collectivite | html | 6 | [page](https://www.tarn.fr/accueil) |
| GIRCI SOHO (Sud-Ouest Outre-Mer Hospitalier) | etablissement | html | 6 | [page](https://www.girci-soho.fr/) |
| Uriopss Hauts-de-France | autre | html | 6 | [page](https://www.uriopss-hdf.fr/actualites) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Centre-Val de Loire | ministere | html | 6 | [page](https://centre-val-de-loire.dreets.gouv.fr/Marches-publics-et-appels-a-projets) |
| Société Française d'Étude et de Traitement de la Douleur (SFETD) | societe-savante | html | 5 | [page](https://www.sfetd-douleur.org/prix-et-appel-doffre/) |
| Conseil départemental Jura | collectivite | html | 5 | [page](https://www.jura.fr/appels-a-projets/) |
| Conseil départemental Var | collectivite | html | 5 | [page](https://var.fr/home/-/asset_publisher/GFXyOm7YlV2U/content/les-appels-a-projet/maximized?p_r_p_assetEntryId=1624415&_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U_redirect=https%3A%2F%2Fvar.fr%2Fhome%3Fp_p_id%3Dcom_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U%26p_p_lifecycle%3D0%26p_p_state%3Dnormal%26p_p_mode%3Dview%26p_r_p_assetEntryId%3D1624415%26_com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet_INSTANCE_GFXyOm7YlV2U_cur%3D0%26p_r_p_resetCur%3Dfalse) |
| Conseil départemental La Réunion | collectivite | html | 5 | [page](https://www.departement974.fr/avis-appels-projets-enquetes-publiques) |
| Conseil départemental Somme | collectivite | html | 5 | [page](https://www.somme.fr/departement/votre-departement/linstitution/les-appels-a-projets/) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Nord-Picardie | caisse-nationale | html | 5 | [page](https://www.carsat-hdf.fr/home/partenaires/partenaires-de-l-action-sociale/appel-a-projet.html) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Languedoc-Roussillon | caisse-nationale | html | 5 | [page](https://www.carsat-lr.fr/home.html) |
| Mutualité sociale agricole (MSA) Nouvelle-Aquitaine - accueil de Libourne | caisse-nationale | html | 5 | [page](https://gironde.msa.fr/lfp/appels-a-projets) |
| France Life Imaging / réseaux thématiques de recherche | etablissement | html | 5 | [page](https://francelifeimaging.fr/) |
| Agence du numérique en santé (ANS) | agence-nationale | html | 4 | [page](https://esante.gouv.fr/lagence/appels-a-projets) |
| Fondation des Hôpitaux | fondation | html | 4 | [page](https://appel-a-projet.fondationhopitaux.fr/) |
| ARS Occitanie | ars | html | 4 | [page](https://www.occitanie.ars.sante.fr/liste-appels-projet-candidature) |
| Conseil départemental Gers | collectivite | html | 4 | [page](https://www.gers.fr/aides-infos-pratiques/appels-a-projets-et-candidatures) |
| Conseil départemental Aude | collectivite | html | 4 | [page](https://www.aude.fr/repondre-un-appel-projet-appel-candidatures) |
| Société Française de Médecine d'Urgence (SFMU) | societe-savante | html | 3 | [page](https://www.sfmu.org/fr/la-recherche/appel-a-projet/) |
| ARS Corse | ars | html | 3 | [page](https://www.corse.ars.sante.fr/liste-appels-projet-candidature) |
| ARS Martinique | ars | html | 3 | [page](https://www.martinique.ars.sante.fr/liste-appels-projet-candidature) |
| France Alzheimer | fondation | html | 3 | [page](https://www.francealzheimer.org/nos-actions-nos-missions/soutien-a-recherche/les-appels-a-projets-france-alzheimer/) |
| Société Francophone du Diabète (SFD) | societe-savante | html | 3 | [page](https://www.sfdiabete.org/medical/la-recherche/allocations-de-recherche-et-prix) |
| Conseil départemental Haute-Vienne | collectivite | html | 3 | [page](https://www.haute-vienne.fr/votre-conseil-departemental/appels-a-projets-du-departement) |
| Conseil départemental Eure | collectivite | html | 3 | [page](https://eureennormandie.fr/accueil/le-departement/nos-appels-a-projets/) |
| Conseil départemental Territoire de Belfort | collectivite | html | 3 | [page](https://www.territoiredebelfort.fr/appels-projets) |
| Conseil départemental Orne | collectivite | html | 3 | [page](https://www.orne.fr/services/marches-publics-enquete-publique-aap-ami/appels-projets-appel-manifestation-dinteret) |
| Mairie de Marseille | collectivite | html | 3 | [page](https://www.marseille.fr/economie/commerce/appels-manifestation-d-interet-de-la-ville-de-marseille) |
| Deux-Sèvres – appels à projets | collectivite | html | 2 | [page](https://www.deux-sevres.fr/services-en-ligne/tous-les-appels-projets) |
| Conseil départemental Hauts-de-Seine | collectivite | html | 2 | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) |
| Conseil départemental Pyrénées-Orientales | collectivite | html | 2 | [page](https://www.ledepartement66.fr/dossier/les-appels-a-projets/) |
| Conseil départemental Manche | collectivite | html | 2 | [page](https://www.manche.fr/les-appels-a-projets/) |
| Conseil départemental Charente | collectivite | html | 2 | [page](https://www.lacharente.fr/actualite/appel-a-projets) |
| Conseil départemental Deux-Sèvres | collectivite | html | 2 | [page](https://www.deux-sevres.fr/services-en-ligne/tous-les-appels-projets) |
| Mutualité sociale agricole (MSA) Grand Est - accueil de Sarrebourg | caisse-nationale | html | 2 | [page](https://lorraine.msa.fr/lfp) |
| Mutualité sociale agricole (MSA) - Meurthe-et-Moselle - accueil de Vandœuvre-lès-Nancy | caisse-nationale | html | 2 | [page](https://lorraine.msa.fr/lfp) |
| Maison de l'Autonomie (MDA) - Alpes-Maritimes | collectivite | html | 2 | [page](https://mda.departement06.fr/appel-projets) |
| Essonne – Commission des financeurs | collectivite | html | 1 | [page](https://demarche.numerique.gouv.fr/commencer/appel-a-projet-commission-des-financeurs-de-la-pre) |
| Conseil départemental Essonne | collectivite | html | 1 | [page](https://www.essonne.fr/appel-projets-candidatures) |
| Ministère de la Culture – Culture, santé, handicap et dépendance | ministere | html | 1 | [page](https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/appels-a-projets-candidatures/culture-sante-handicap-et-dependance) |
| Direction générale du Trésor – FASEP santé | ministere | html | 1 | [page](https://www.tresor.economie.gouv.fr/Articles/2026/06/25/appel-a-projets-fasep-2026-solutions-innovantes-pour-le-developpement-et-la-modernisation-des-systemes-de-sante) |
| Carsat Nord-Est – AAP des partenaires | caisse-nationale | html | 1 | [page](https://www.carsat-nordest.fr/home/partenaires/etre-partenaire-de-l-action-soci/appels-a-projets-des-partenaires/appel-a-projets-prevention-confe.html) |
| Fondation APICIL | fondation | html | 1 | [page](https://www.fondation-apicil.org/appel-a-projets/) |
| Fondation Malakoff Humanis Handicap | fondation | html | 1 | [page](https://newsroom.malakoffhumanis.com/actualites/la-fondation-malakoff-humanis-handicap-lance-un-appel-a-projet-pour-soutenir-les-innovations-technologiques-et-numeriques-permettant-de-favoriser-lacces-a-lemploi-et-a-la-sante-des-personnes-en-situation-de-handicap-e6dd-63a59.html) |
| Interreg Sudoe | europe | html | 1 | [page](https://interreg-sudoe.eu/fr/4eme-appel-a-projets/) |
| Hauts-de-Seine – appels à projets | collectivite | html | 1 | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) |
| Métropole de Lyon – Commission des financeurs | collectivite | html | 1 | [page](https://commissiondesfinanceurs.grandlyon.com/) |
| Collectivité européenne d'Alsace – Commission des financeurs | collectivite | html | 1 | [page](https://www.alsace.eu/actualites/appel-a-projets-2026-commission-financeurs) |
| ANSM | agence-nationale | html | 1 | [page](https://ansm.sante.fr/actualites/renouvellement-du-comite-dinterface-avec-les-associations-de-patients-appel-a-candidatures-ouvert-jusquau-30-septembre-2026) |
| Health Data Hub | agence-nationale | html | 1 | [page](https://health-data-hub.fr/aap-gd4h) |
| Fondation AÉSIO | fondation | html | 1 | [page](https://fondation.aesio.fr/actualites/appel-projets-reponses-questions-frequentes) |
| Fondation Force | fondation | html | 1 | [page](https://fondation-force.fr/appel-a-projets-2026-2/) |
| Fondation Paralysie Cérébrale | fondation | html | 1 | [page](https://fondationparalysiecerebrale.org/appels-a-projets/) |
| Fondation Alzheimer | fondation | html | 1 | [page](https://www.fondation-alzheimer.org/je-suis-chercheur/financement-de-projets/les-prix-de-la-fondation/) |
| Société Française de Gériatrie et Gérontologie (SFGG) | societe-savante | html | 1 | [page](https://sfgg.org/actualites/appels-a-participation-bourses-et-prix/prix-chaffoteaux/) |
| GIRCI Île-de-France | etablissement | html | 1 | [page](https://girci-idf.fr/projets/appel-a-projets-recherche-en-soins-apreso-2026/) |
| Conseil territorial de Saint-Pierre-et-Miquelon | collectivite | html | 1 | [page](https://www.spm-ct975.fr/actualite/service-daccompagnement-medico-social-pour-adultes-en-situation-de-handicap/) |
| Conseil départemental Sarthe | collectivite | html | 1 | [page](https://www.sarthe.fr/departement-sarthe/solidarite-autonomie/appels-projets) |
| Conseil départemental Alpes-de-Haute-Provence | collectivite | html | 1 | [page](https://www.mondepartement04.fr/insertion/appel-a-projets-pdi) |
| Conseil départemental Lozère | collectivite | html | 1 | [page](https://lozere.fr/lamenagement-du-territoire/developpement-economique/appels-projets.html) |
| Mairie de Orléans | collectivite | html | 1 | [page](https://www.orleans.fr/actualites/detail/contrat-de-ville-appel-a-projets) |
| Caisse générale de sécurité sociale (CGSS) - Martinique | caisse-nationale | html | 1 | [page](https://cgss-martinique.fr/appel-a-projets-ateliers-bienvenue-a-la-retraite/) |
| Caisse d'assurance retraite et de la santé au travail (Carsat) - Normandie | caisse-nationale | html | 1 | [page](https://www.carsat-normandie.fr/home/partenaires/actualites-partenaire/toutes%20les%20actualites/appel-a-projets-accompagner-les.details-actualite.html) |
| Caisse générale de sécurité sociale (CGSS) - Guadeloupe | caisse-nationale | html | 1 | [page](https://www.cgss-guadeloupe.fr/18-actualites/actualites-assures/344-appel-a-projet-de-la-conference-des-financeurs-2026-2027.html) |
| Caisse nationale d’assurance vieillesse (Cnav) Assurance retraite Île-de-France | caisse-nationale | html | 1 | [page](https://www.lassuranceretraite-idf.fr/home/partenaire/soutenir-financierement-les-projets/appels-a-projets.html) |
| Mutualité sociale agricole (MSA) Bourgogne - accueil d'Autun | caisse-nationale | html | 1 | [page](https://bourgogne.msa.fr/lfp/appel-projets-msa-solidaire/2026) |
| Caisse générale de sécurité sociale (CGSS) - Guyane | caisse-nationale | html | 1 | [page](https://www.cgss-guyane.fr/appel-a-projets/appel-a-projet-fnpeis-2026/) |
| Mutualité sociale agricole (MSA) Berry-Touraine - accueil de Blois | caisse-nationale | html | 1 | [page](https://berry-touraine.msa.fr/lfp/appel-a-projets) |
| IHU Méditerranée Infection | etablissement | html | 1 | [page](https://ihu-medinfection.com/appel-a-projet-aap-mi2-2026/) |
| Fédération Addiction | autre | html | 1 | [page](https://www.federationaddiction.fr/actualites/publics/femmes/lancement-de-lappel-a-candidatures-pour-faire-partie-du-groupe-de-travail-femmes-addictions/) |
| Uriopss PACA-Corse | autre | pdf | 1 | [page](https://www.uriopss-pacac.fr/actualites/recensement-des-appels-projets-0) |
| Admical | autre | html | 1 | [page](https://admical.org/actualit%C3%A9s/la-fondation-dentreprise-ocirp-lance-son-appel-projets-lieux-alternatifs-du-prendre-soin) |
| Fondation Maladies Rares | fondation | html | 0 | [page](https://fondation-maladiesrares.org/appels-a-projets-2019-de-fondation/) |
| DGOS – programmes de recherche hospitalière (PHRC, PHRIP, PREPS, PRME) | ministere | html | 0 | [page](https://sante.gouv.fr/systeme-de-sante/innovation-et-recherche/l-innovation-et-la-recherche-clinique/appels-a-projets/programmes-recherche) |
| Fondation Le Souffle | fondation | html | 0 | [page](https://www.lesouffle.org/appels-projets-recherche) |
| Conseil départemental Alpes-Maritimes | collectivite | html | 0 | [page](https://www.departement06.fr/appels-projets-solidarite-sociale) |

## Sources à vérifier à la main

| Source | Raison | Page |
|---|---|---|
| Fondation pour la Recherche Médicale (FRM) | cas limite à trancher : programmes de recherche en biologie et santé, mais seule la page des appels clôturés est connue, page des appels en cours à retrouver | [page](https://www.frm.org/fr/espace-chercheurs-aap-clotures) |
| Drôme – Commission des financeurs | liste des appels non rendue pour le robot : ouvrir à la main | [page](https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/) |
| Région Île-de-France – aides et appels à projets | cas limite à trancher : guichet régional de 347 aides par public et thématique, la santé y figure (ex. AlimenTaSanté) mais noyée | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) |
| Conseil départemental Meurthe-et-Moselle | page vide pour le robot : ouvrir à la main | [page](https://www.meurthe-et-moselle.fr/appels-projets) |
| Conseil départemental Doubs | page vide pour le robot : ouvrir à la main | [page](https://www.doubs.fr/le-departement/appel-a-projets-a-candidatures-ou-appel-a-manifestation-dinteret/) |
| Conseil départemental Drôme | même page : liste non rendue pour le robot : ouvrir à la main | [page](https://www.ladrome.fr/categorie_annonce/annonce_appel_a_projet/) |
| Conseil départemental Hautes-Alpes | page vide pour le robot : ouvrir à la main | [page](https://www.hautes-alpes.fr/le-departement/appels-a-candidatures/) |
| Conseil départemental Aube | page vide pour le robot : ouvrir à la main | [page](https://www.aube.fr/le-departement/budget-et-documents-reglementaires/appels-a-projets/) |
| Conseil départemental Corrèze | cas limite à trancher : rubriques dédiées Autonomie et Action sociale visibles par leur nom, contenu non lisible par le robot | [page](https://www.correze.fr/) |
| Conseil départemental Mayotte | cas limite à trancher : rubrique AAP, AMI, AAC du Département-Région, vide au 2026-10-12 | [page](https://www.mayotte.fr/) |
| Conseil départemental Val-de-Marne | cas limite à trancher : appel 2026 pour 222 mesures d'accueil de mineurs de l'ASE (établissements sociaux, pas médico-sociaux) | [page](https://www.valdemarne.fr/le-conseil-departemental/les-appels-a-projets) |
| Conseil régional Île-de-France | cas limite à trancher : même page, guichet régional de 347 aides où la santé est noyée | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) |
| Préfecture - Rhône | FileNotFoundError: [Errno 2] No such file or directory: 'C:\\Users\\pierr\\Documents\\Projets Claude Code\\AAP\\scraping\\decouverte\\prefecture-rhone\\rubrique.html' | [page](https://www.rhone.gouv.fr/) |
| Préfecture - Morbihan | FileNotFoundError: [Errno 2] No such file or directory: 'C:\\Users\\pierr\\Documents\\Projets Claude Code\\AAP\\scraping\\decouverte\\prefecture-morbihan\\rubrique.html' | [page](https://www.morbihan.gouv.fr/Publications/Appels-a-manifestation-d-interet/Ouverture-de-l-appel-a-manifestation-d-interet-2021-pour-la-labellisation-Point-conseil-budget) |
| Direction départementale de l'emploi, du travail et des solidarités (DDETS) - Isère | liste non rendue pour le robot (filtre Solidarités : 3 appels) : ouvrir à la main | [page](https://auvergne-rhone-alpes.dreets.gouv.fr/appels-projets) |
| Direction de l'économie, de l'emploi, du travail et des solidarités (DEETS) - Guadeloupe | La page web de l'organisme DEETS Guadeloupe ne présente pas d'appels à projets, candidatures, manifestations d'intérêt, bourses ou subventions ouverts ou clos. Elle est une page d'information sur la gestion des cookies. | [page](https://guadeloupe.deets.gouv.fr/) |
| Maison départementale des personnes handicapées (MDPH) - Moselle | La page web de la Maison départementale des personnes handicapées de Moselle ne présente pas d'appel à projets, appel à candidatures, appel à manifestation d'intérêt, bourse ou subvention auquel on peut candidater. Elle est une page d'information sur les services offerts par l'organisme. | [page](https://www.moselle.fr/jcms/pl_14027/fr/maison-departementale-des-personnes-handicapees) |
| GIRCI Est | liste des appels non rendue pour le robot : ouvrir à la main | [page](https://girci-est.fr/appels-a-projets/) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Occitanie | délai dépassé ; un appel à candidatures mandataires judiciaires vu : ouvrir à la main | [page](https://occitanie.dreets.gouv.fr/) |
| Direction régionale de l'économie, de l'emploi, du travail et des solidarités (DREETS) - Nouvelle-Aquitaine | cas limite à trancher : appel 2026 lutte contre la précarité menstruelle (santé publique, financeur hors santé) | [page](https://nouvelle-aquitaine.dreets.gouv.fr/Marches-publics-et-appels-a-projets) |
