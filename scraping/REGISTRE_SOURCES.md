# Registre des sources d'appels à projets

Généré le 2026-10-09 par `python scraping/registre.py --tableau` à partir de
`scraping/sources/registre.json` (fichier de vérité : corriger le JSON, pas ce tableau).

**334 sources : 4 opérationnelle, 300 page vérifiée, 30 identifiée.**

## ARS régionales (19)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| ARS Auvergne-Rhône-Alpes | sante-et-medico-social | page vérifiée |  | [page](https://www.auvergne-rhone-alpes.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Bourgogne-Franche-Comté | sante-et-medico-social | page vérifiée |  | [page](https://www.bourgogne-franche-comte.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Bretagne | sante-et-medico-social | page vérifiée |  | [page](https://www.bretagne.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Centre-Val de Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.centre-val-de-loire.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Corse | sante-et-medico-social | opérationnelle | ars_corse | [page](https://www.corse.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | 2 AAP en juin 2026. Fichiers joints refusés en accès direct (403). |
| ARS Grand Est | sante-et-medico-social | page vérifiée |  | [page](https://www.grand-est.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Guadeloupe | sante-et-medico-social | page vérifiée |  | [page](https://www.guadeloupe.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Guyane | sante-et-medico-social | page vérifiée |  | [page](https://www.guyane.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Hauts-de-France | sante-et-medico-social | page vérifiée |  | [page](https://www.hauts-de-france.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS La Réunion | sante-et-medico-social | page vérifiée |  | [page](https://www.lareunion.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Martinique | sante-et-medico-social | page vérifiée |  | [page](https://www.martinique.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Mayotte | sante-et-medico-social | page vérifiée |  | [page](https://www.mayotte.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Normandie | sante-et-medico-social | page vérifiée |  | [page](https://www.normandie.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Nouvelle-Aquitaine | sante-et-medico-social | page vérifiée |  | [page](https://www.nouvelle-aquitaine.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Occitanie | sante-et-medico-social | page vérifiée |  | [page](https://www.occitanie.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Pays de la Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.pays-de-la-loire.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Provence-Alpes-Côte d'Azur | sante-et-medico-social | page vérifiée |  | [page](https://www.paca.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Même système de site que l'ARS Île-de-France : connecteur générique prévu. |
| ARS Île-de-France | sante-et-medico-social | opérationnelle | ars_idf, ars_idf_local | [page](https://www.iledefrance.ars.sante.fr/liste-appels-projet-candidature) | 2026-10-09 (200) | Connecteur de référence pour toutes les ARS (même système de site). Variante ars_idf_local (fichiers via httpx). |
| Portail national des ARS | sante-et-medico-social | page vérifiée |  | [page](https://www.ars.sante.fr/liste-appels-projet-candidature-nationale) | 2026-10-09 (200) | Liste nationale des appels à projets et à candidatures publiée pour l'ensemble des ARS. |

## Ministères et services de l'État (8)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| Article 51 – expérimentations innovation en santé | sante | page vérifiée |  | [page](https://sante.gouv.fr/systeme-de-sante/parcours-des-patients-et-des-usagers/article-51-lfss-2018-innovations-organisationnelles-pour-la-transformation-du-systeme-de-sante/) | 2026-10-09 (200) | Appels à manifestation d'intérêt du dispositif article 51. Adresse à confirmer. |
| DGOS – programmes de recherche hospitalière (PHRC, PHRIP, PREPS, PRME) | sante | page vérifiée |  | [page](https://sante.gouv.fr/systeme-de-sante/innovation-et-recherche/l-innovation-et-la-recherche-clinique/appels-a-projets/) | 2026-10-09 (200) | Campagne annuelle DGOS via la plateforme Innovarc ; lettres d'intention en décembre. Adresse à confirmer. |
| Direction générale du Trésor – FASEP santé | sante | page vérifiée |  | [page](https://www.tresor.economie.gouv.fr/Articles/2026/06/25/appel-a-projets-fasep-2026-solutions-innovantes-pour-le-developpement-et-la-modernisation-des-systemes-de-sante) | 2026-10-09 (200) | AAP innovation en santé à l'export ; page d'un AAP précis, rubrique générale à trouver. |
| Gouvernement (info.gouv.fr) | sante-et-medico-social | identifiée |  | [page](https://www.info.gouv.fr/) | 2026-10-09 (403) | Refuse les requêtes simples (403) : à contrôler avec un navigateur. Annonces d'AAP nationaux (santé mentale, accès aux soins, France 2030). Pas de rubrique dédiée : page à préciser. |
| Ministère de l'Enseignement supérieur et de la Recherche | sante | identifiée |  | [page](https://www.enseignementsup-recherche.gouv.fr/fr/appels-projets-appels-candidatures) | 2026-10-09 (403) | Appels à projets et à candidatures du ministère de la Recherche (adresse à confirmer). |
| Ministère de la Culture – Culture, santé, handicap et dépendance | sante-et-medico-social | page vérifiée |  | [page](https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/appels-a-projets-candidatures/culture-sante-handicap-et-dependance) | 2026-10-09 (200) | AAP Culture-Santé copilotés avec les ARS et les DRAC. |
| Ministère de la Santé (sante.gouv.fr) | sante-et-medico-social | page vérifiée |  | [page](https://sante.gouv.fr/) | 2026-10-09 (200) | Pas de rubrique AAP identifiée : les AAP nationaux sont relayés par le portail des ARS et info.gouv.fr. Page à préciser. |
| Présidence de la République (elysee.fr) | sante-et-medico-social | page vérifiée |  | [page](https://www.elysee.fr/) | 2026-10-09 (200) | Cité par Monsieur DUCOUT. Aucune rubrique AAP connue ; relais d'annonces seulement. |

## Caisses nationales (6)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| Agirc-Arrco – action sociale | medico-social | page vérifiée |  | [page](https://www.agirc-arrco.fr/action-sociale/) | 2026-10-09 (200) | AAP autonomie / prévention. Adresse à confirmer. |
| Assurance Maladie (CNAM, ameli) | sante | identifiée |  | [page](https://www.assurance-maladie.ameli.fr/qui-sommes-nous/notre-fonctionnement/financement) | 2026-10-09 (403) | Refuse les requêtes simples (403) : à contrôler avec un navigateur. Fonds d'action sanitaire et sociale (AAP 2026), fonds de lutte contre les addictions, AAP prévention relayés par les CPAM. |
| Assurance Retraite (CNAV) | medico-social | page vérifiée |  | [page](https://www.lassuranceretraite.fr/) | 2026-10-09 (200) | Aucune rubrique AAP nationale : les AAP « bien vieillir » passent par les Carsat et les commissions des financeurs. |
| CNSA (Caisse nationale de solidarité pour l'autonomie) | medico-social | opérationnelle | cnsa | [page](https://www.cnsa.fr/appels-projets) | 2026-10-09 (200) | 3 AAP en juin 2026. Finance aussi les conférences des financeurs départementales. |
| Carsat Nord-Est – AAP des partenaires | medico-social | page vérifiée |  | [page](https://www.carsat-nordest.fr/home/partenaires/etre-partenaire-de-l-action-soci/appels-a-projets-des-partenaires.html) | 2026-10-09 (200) | Relais des AAP des commissions des financeurs (54, 55, Aube, Vosges). |
| MSA (Caisse centrale) | sante-et-medico-social | page vérifiée |  | [page](https://www.msa.fr/lfp/actions-partenaires/sante-medico-social) | 2026-10-09 (200) | Rubrique Santé et médico-social des actions partenaires ; pas de page AAP dédiée identifiée. |

## Agences et opérateurs nationaux (34)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| ADEME | sante-et-medico-social | identifiée |  | [page](https://agirpourlatransition.ademe.fr/) | 2026-10-09 (403) | Refuse les requêtes simples sur le catalogue (403) ; lien indirect : air, bâtiments, thèses. |
| ANACT | sante-et-medico-social | page vérifiée |  | [page](https://www.anact.fr/mots-cles/appel-projets) | 2026-10-09 (200) | Conditions de travail, usure professionnelle (établissements de santé éligibles). |
| ANAH | medico-social | page vérifiée |  | [page](https://www.anah.gouv.fr/) | 2026-10-09 (200) | Adaptation du logement au vieillissement ; rubrique AAP à préciser. |
| ANAP | sante-et-medico-social | page vérifiée |  | [page](https://www.anap.fr/s/article/appel-a-projets-achats-innovants) | 2026-10-09 (200) | AAP Achats innovants (France 2030, avec DGOS et AIS) ; pas de rubrique générale identifiée. |
| ANCT | sante-et-medico-social | page vérifiée |  | [page](https://anct.gouv.fr/) | 2026-10-09 (200) | Cohésion des territoires ; rubrique AAP à préciser. |
| ANDRA | sante-et-medico-social | page vérifiée |  | [page](https://www.andra.fr/nos-expertises/recherche-et-developpement/appels-a-projets) | 2026-10-09 (200) | Cité par Monsieur DUCOUT : déchets radioactifs (dont médicaux). Adresse à confirmer. |
| ANR | sante | page vérifiée |  | [page](https://anr.fr/fr/appels-a-projets/) | 2026-10-09 (200) | Programme de recherche en santé publique et appels thématiques. |
| ANSES – programme PNR-EST | sante | page vérifiée |  | [page](https://www.anses.fr/fr) | 2026-10-09 (200) | PNR-EST annoncé dans les actualités ; rubrique AAP à préciser. |
| ANSM | sante | page vérifiée |  | [page](https://ansm.sante.fr/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| ASNR (sûreté nucléaire et radioprotection) | sante | page vérifiée |  | [page](https://www.asnr.fr/) | 2026-10-09 (200) | Radioprotection médicale ; rubrique AAP à préciser. |
| Agefiph | medico-social | page vérifiée |  | [page](https://innovation.agefiph.fr) | 2026-10-09 (200) | Site Innovation et recherche : AAP innovation, recherche, Handinnov. |
| Agence de l'eau Adour-Garonne | sante-et-medico-social | page vérifiée |  | [page](https://eau-grandsudouest.fr/) | 2026-10-09 (200) | Lien indirect avec la santé ; rubrique AAP à préciser. |
| Agence de l'eau Artois-Picardie | sante-et-medico-social | page vérifiée |  | [page](https://www.eau-artois-picardie.fr/les-appels-projets-de-lagence-de-leau) | 2026-10-09 (200) | Lien indirect avec la santé. |
| Agence de l'eau Loire-Bretagne | sante-et-medico-social | page vérifiée |  | [page](https://aides-redevances.eau-loire-bretagne.fr/home/aides/appels-a-projets-1.html) | 2026-10-09 (200) | Lien indirect avec la santé. |
| Agence de l'eau Rhin-Meuse | sante-et-medico-social | page vérifiée |  | [page](https://www.eau-rhin-meuse.fr/actualites/appel-projets) | 2026-10-09 (200) | Lien indirect avec la santé. |
| Agence de l'eau Rhône Méditerranée Corse | sante-et-medico-social | page vérifiée |  | [page](https://www.eaurmc.fr/) | 2026-10-09 (200) | Lien indirect avec la santé ; rubrique AAP à préciser. |
| Agence de l'eau Seine-Normandie | sante-et-medico-social | page vérifiée |  | [page](https://www.eau-seine-normandie.fr/appels_a_projets) | 2026-10-09 (200) | Lien indirect avec la santé (eau, micropolluants, médicaments). |
| Agence de la biomédecine | sante | page vérifiée |  | [page](https://www.agence-biomedecine.fr/) | 2026-10-09 (200) | Rubrique appels d'offres recherche à préciser. |
| Agence du numérique en santé (ANS) | sante-et-medico-social | page vérifiée |  | [page](https://esante.gouv.fr/lagence/appels-a-projets) | 2026-10-09 (200) | AAP numérique en santé et médico-social (Adoption des innovations, Mon espace santé en ESMS). |
| Banque des Territoires | sante-et-medico-social | page vérifiée |  | [page](https://www.banquedesterritoires.fr/dispositifs-nationaux) | 2026-10-09 (200) | Dispositifs nationaux (AMI, AAP) ; pas de page AAP dédiée identifiée. |
| Bpifrance – France 2030 | sante | page vérifiée |  | [page](https://www.bpifrance.fr/nos-appels-a-projets-concours) | 2026-10-09 (200) | AAP France 2030 : santé numérique, santé mentale, dispositifs médicaux. |
| CNRS | sante | page vérifiée |  | [page](https://www.cnrs.fr/fr) | 2026-10-09 (200) | Rubrique AAP à préciser ; filtrer sciences de la vie. |
| EHESP | sante | page vérifiée |  | [page](https://www.ehesp.fr/recherche/) | 2026-10-09 (200) | École des hautes études en santé publique ; rubrique AAP à préciser. |
| FIPHFP | medico-social | page vérifiée |  | [page](https://www.fiphfp.fr/actualites-et-evenements/actualites) | 2026-10-09 (200) | AAP handicap dans la fonction publique. |
| Fonds national pour la science ouverte | sante | page vérifiée |  | [page](https://www.ouvrirlascience.fr/) | 2026-10-09 (200) | Lien indirect ; rubrique AAP à préciser. |
| Haute Autorité de Santé (HAS) | sante | page vérifiée |  | [page](https://www.has-sante.fr/jcms/r_1482317/fr/contribuer-aux-travaux-de-la-has) | 2026-10-09 (200) | Surtout des appels à candidatures (groupes de travail), parfois des AAP (PROMs). |
| Health Data Hub | sante | page vérifiée |  | [page](https://www.health-data-hub.fr/nos-appels-projets) | 2026-10-09 (200) | AAP données de santé (dont santé-environnement avec l'Anses). |
| INRS | sante-et-medico-social | page vérifiée |  | [page](https://www.inrs.fr/) | 2026-10-09 (200) | Santé au travail ; rubrique AAP à préciser. |
| IReSP | sante | page vérifiée |  | [page](https://iresp.net/financements/programmes-et-appels/) | 2026-10-09 (200) | AAP de recherche en santé publique (avec CNSA, CNAM, Inserm). |
| Inserm | sante | page vérifiée |  | [page](https://pro.inserm.fr) | 2026-10-09 (200) | Espace Inserm Pro ; rubrique AAP à préciser. |
| Institut Pasteur | sante | identifiée |  | [page](https://www.pasteur.fr/fr/recherche) | 2026-10-09 (403) | Rubrique AAP à préciser. |
| Institut national du cancer (INCa) | sante | page vérifiée |  | [page](https://www.cancer.fr/professionnels-de-la-recherche/appels-a-projets-et-a-candidatures/nos-appels-a-projets) | 2026-10-09 (200) | Oubli signalé par Monsieur DUCOUT : AAP recherche (PHRC-K, PRT-K), prévention, Plan Zéro Exposition. |
| Santé publique France | sante | page vérifiée |  | [page](https://www.santepubliquefrance.fr/les-actualites) | 2026-10-09 (200) | AAP missions nationales de surveillance ; pas de rubrique dédiée. |
| Établissement français du sang (EFS) | sante | page vérifiée |  | [page](https://www.efs.sante.fr/) | 2026-10-09 (200) | Rubrique AAP à préciser (recherche transfusionnelle). |

## Fondations et fonds privés (42)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| AFM-Téléthon | sante | page vérifiée |  | [page](https://www.afm-telethon.fr/fr/espace-professionnels-de-sante-et-chercheurs) | 2026-10-09 (200) | Espace chercheurs : appels d'offres. |
| FIRAH | medico-social | page vérifiée |  | [page](https://www.firah.org/appels-a-projets.html) | 2026-10-09 (200) | Recherche appliquée sur le handicap. Adresse à confirmer. |
| Fondation AG2R La Mondiale | sante-et-medico-social | page vérifiée |  | [page](https://www.projets-fondation.ag2rlamondiale.fr/fr/) | 2026-10-09 (200) | Plateforme de dépôt des projets de la Fondation ; un AAP par an (santé, précarité, éducation). |
| Fondation APICIL | sante | page vérifiée |  | [page](https://www.fondation-apicil.org/appel-a-projets/) | 2026-10-09 (200) | Douleur et santé psychique ; appel permanent douleur. |
| Fondation ARC | sante | page vérifiée |  | [page](https://www.fondation-arc.org/chercheurs/appels-a-projets) | 2026-10-09 (200) | Recherche sur le cancer. Adresse à confirmer. |
| Fondation ARSEP (sclérose en plaques) | sante | page vérifiée |  | [page](https://www.arsep.org/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Fondation Alzheimer | sante | page vérifiée |  | [page](https://fondation-alzheimer.org/appels-a-projets/) | 2026-10-09 (200) | Adresse à confirmer. |
| Fondation Arsène | sante | identifiée |  | [page](https://www.fondation-arsene.org/) | 2026-10-09 (None) | Bourse Théodore (pédiatrie). Rubrique à préciser. |
| Fondation AÉSIO | sante-et-medico-social | page vérifiée |  | [page](https://fondation.aesio.fr/soumettre-un-projet) | 2026-10-09 (200) | Santé, prévention. |
| Fondation Bettencourt Schueller | sante | page vérifiée |  | [page](https://www.fondationbs.org/fr/sciences-de-la-vie) | 2026-10-09 (200) | Sciences de la vie. Adresse à confirmer. |
| Fondation Caisse d'Épargne Hauts-de-France | sante-et-medico-social | page vérifiée |  | [page](https://www.caisse-epargne.fr/hauts-de-france/plus-solidaire/) | 2026-10-09 (200) | AAP santé et sport-santé régionaux ; chaque Caisse d'Épargne régionale a son fonds. |
| Fondation Crédit Agricole Solidarité et Développement | sante-et-medico-social | page vérifiée |  | [page](https://www.fondation-ca-solidaritedeveloppement.org/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Fondation Crédit Mutuel Alliance Fédérale | sante-et-medico-social | page vérifiée |  | [page](https://www.fondationdefrance.org/fr/appels-a-projets-fa) | 2026-10-09 (200) | Abritée par la Fondation de France ; voir calendrier des fondations abritées. |
| Fondation Cœur & Recherche | sante | identifiée |  | [page](https://www.fondation-coeur-recherche.org/) | 2026-10-09 (None) | AAP Cœur et Climat, Cœur et Obésité. Rubrique à préciser. |
| Fondation FondaMental | sante | page vérifiée |  | [page](https://www.fondation-fondamental.org/) | 2026-10-09 (200) | Psychiatrie ; rubrique AAP à préciser. |
| Fondation Force | sante | page vérifiée |  | [page](https://fondation-force.fr/appel-a-projets-2026-2/) | 2026-10-09 (200) | Page d'un AAP précis ; rubrique à préciser. |
| Fondation Groupe Pasteur Mutualité | sante | page vérifiée |  | [page](https://www.gpm.fr/) | 2026-10-09 (200) | Bourses recherche ; rubrique à préciser. |
| Fondation Hôpital Saint-Joseph (Marseille) | sante | page vérifiée |  | [page](https://www.hopital-saint-joseph.fr/) | 2026-10-09 (200) | Rubrique fondation à préciser. |
| Fondation Jérôme Lejeune | sante | page vérifiée |  | [page](https://www.fondationlejeune.org/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Fondation Korian pour le Bien-Vieillir | medico-social | identifiée |  | [page](https://www.fondation-korian.com/) | 2026-10-09 (None) | Site injoignable le 2026-10-09 (délai dépassé) : à recontrôler. Rubrique AAP à préciser. |
| Fondation Le Souffle | sante | page vérifiée |  | [page](https://www.lesouffle.org/appels-projets-2025) | 2026-10-09 (200) | Fondation du souffle (maladies respiratoires) ; page datée. |
| Fondation MACSF | sante | page vérifiée |  | [page](https://www.macsf.fr/fondation-macsf) | 2026-10-09 (200) | Innovation, solidarité, formation des soignants ; deux AAP par an (dates 2019-2020 trouvées, à confirmer). |
| Fondation Maladies Rares | sante | page vérifiée |  | [page](https://fondation-maladiesrares.org/appels-a-projets/) | 2026-10-09 (200) | Adresse à confirmer. |
| Fondation Malakoff Humanis Handicap | medico-social | page vérifiée |  | [page](https://newsroom.malakoffhumanis.com/appel-a-projets.html) | 2026-10-09 (200) | Page des AAP de la newsroom : handicap (sport, éducation, accès à la santé, Hanvol). |
| Fondation Mutuelle Générale | sante-et-medico-social | page vérifiée |  | [page](https://www.lamutuellegenerale.fr/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Fondation Médéric Alzheimer | medico-social | page vérifiée |  | [page](https://www.fondation-mederic-alzheimer.org/appels-a-projets) | 2026-10-09 (200) | Interventions non médicamenteuses, recherche. Adresse à confirmer. |
| Fondation Orange | sante-et-medico-social | page vérifiée |  | [page](https://www.fondationorange.com/) | 2026-10-09 (200) | Autisme, santé numérique ; rubrique AAP à préciser. |
| Fondation Paralysie Cérébrale | sante | page vérifiée |  | [page](https://www.fondationparalysiecerebrale.org/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Fondation Roche | sante | identifiée |  | [page](https://www.fondation-roche.org/) | 2026-10-09 (None) | Rubrique AAP à préciser. |
| Fondation Sanofi | sante | page vérifiée |  | [page](https://www.sanofi.com/fr) | 2026-10-09 (200) | Rubrique fondation à préciser. |
| Fondation Vaincre Alzheimer | sante | page vérifiée |  | [page](https://www.vaincrealzheimer.org/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Fondation de France | sante-et-medico-social | opérationnelle | fondation_de_france | [page](https://www.fondationdefrance.org/fr/appels-a-projets) | 2026-10-09 (200) | Source du POC (64 AAP en juin 2026). Abrite de nombreuses fondations ; pagination par offset. |
| Fondation de France – annuaire des fondations abritées | sante-et-medico-social | page vérifiée |  | [page](https://www.fondationdefrance.org/fr/annuaire-des-fondations) | 2026-10-09 (200) | Annuaire filtrable (santé, recherche médicale, personnes âgées, handicap) : à parcourir pour découvrir d'autres fondations. |
| Fondation de France – appels à projets des fondations abritées | sante-et-medico-social | page vérifiée |  | [page](https://www.fondationdefrance.org/fr/appels-a-projets-fa) | 2026-10-09 (200) | Calendrier des AAP des fondations abritées (Christine Goudot, Lumière, Jardins au Cœur du Soin, Mustela, Castorama...). Source à scraper. |
| Fondation de l'Avenir | sante | page vérifiée |  | [page](https://www.fondationdelavenir.org/chercheurs/appels-a-candidatures/) | 2026-10-09 (200) | Recherche médicale appliquée, accès aux soins, isolement des personnes âgées. |
| Fondation des Hôpitaux | sante-et-medico-social | page vérifiée |  | [page](https://appel-a-projet.fondationhopitaux.fr/) | 2026-10-09 (200) | Plateforme dédiée : EHPAD, gériatrie, enfants hospitalisés. |
| Fondation nehs | sante | identifiée |  | [page](https://www.fondation-nehs.com/deposer-un-projet/) | 2026-10-09 (None) | Site injoignable le 2026-10-09 (délai dépassé) : à recontrôler. Prendre soin de l'humain dans la santé ; AAP ponctuels. |
| Fondation pour la Recherche Médicale (FRM) | sante | page vérifiée |  | [page](https://www.frm.org/fr/programmes) | 2026-10-09 (200) | Programmes et appels à projets pour les chercheurs. |
| France Alzheimer | medico-social | page vérifiée |  | [page](https://www.francealzheimer.org/chercheurs/appels-projets/) | 2026-10-09 (200) | Adresse à confirmer. |
| Fédération Française de Cardiologie | sante | identifiée |  | [page](https://www.fedecardio.org/la-recherche/comment-financer-mon-projet/) | 2026-10-09 (403) | Bourses et grands projets. |
| Institut de France – fondations | sante-et-medico-social | page vérifiée |  | [page](https://www.institutdefrance.fr/vous-avez-un-projet-une-de-nos-fondations-peut-le-soutenir/) | 2026-10-09 (200) | Plusieurs fondations abritées (recherche médicale, handicap). |
| Ligue contre le cancer | sante | page vérifiée |  | [page](https://www.ligue-cancer.net/nos-missions/les-actions-de-soutien-de-la-ligue) | 2026-10-09 (200) | Actions de soutien et appels à projets recherche. |

## Programmes européens (6)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| EIT Health | sante | page vérifiée |  | [page](https://eithealth.eu/get-involved/new-call-opportunities/) | 2026-10-09 (200) | Appels ouverts EIT Health (innovation en santé). |
| FSE+ France | sante-et-medico-social | page vérifiée |  | [page](https://fse.gouv.fr/les-appels-a-projets) | 2026-10-09 (200) | Appels locaux (départements, régions) : santé mentale, accès aux soins. |
| HaDEA – EU4Health | sante | page vérifiée |  | [page](https://hadea.ec.europa.eu/calls-proposals_en) | 2026-10-09 (200) | Agence exécutive santé et numérique de la Commission européenne. |
| Horizon Europe – Cluster Santé (PCN France) | sante | page vérifiée |  | [page](https://www.horizon-europe.gouv.fr/appels/sante) | 2026-10-09 (200) | Point de contact national : appels du cluster 1 Santé. |
| Interreg Sudoe | sante | page vérifiée |  | [page](https://interreg-sudoe.eu/fr/futurs-appels-a-projets/) | 2026-10-09 (200) | Projets stratégiques accès aux soins (Sud-Ouest européen). |
| Portail Funding & Tenders (Commission européenne) | sante | page vérifiée |  | [page](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/calls-for-proposals) | 2026-10-09 (200) | Référentiel officiel de tous les appels européens ; application dynamique, scraping difficile. |

## Collectivités territoriales (179)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| Bordeaux Métropole – appels à projets | sante-et-medico-social | page vérifiée |  | [page](https://www.bordeaux-metropole.fr/actualites) | 2026-10-09 (200) | Contrat de ville, pacte des solidarités. |
| Collectivité de Corse | sante-et-medico-social | page vérifiée |  | [page](https://www.isula.corsica) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Collectivité européenne d'Alsace | sante-et-medico-social | page vérifiée |  | [page](https://www.alsace.eu) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Collectivité européenne d'Alsace – Commission des financeurs | medico-social | page vérifiée |  | [page](https://www.alsace.eu/actualites/appel-a-projets-2026-commission-financeurs) | 2026-10-09 (200) | CFPPA 67-68. |
| Collectivité territoriale de Guyane | sante-et-medico-social | page vérifiée |  | [page](https://www.ctguyane.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Collectivité territoriale de Martinique | sante-et-medico-social | page vérifiée |  | [page](https://www.collectivitedemartinique.mq/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil de Paris | sante-et-medico-social | page vérifiée |  | [page](https://www.paris.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Ain | sante-et-medico-social | page vérifiée |  | [page](https://www.ain.fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Aisne | sante-et-medico-social | page vérifiée |  | [page](https://www.aisne.com/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Allier | sante-et-medico-social | page vérifiée |  | [page](https://www.allier.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Alpes-Maritimes | sante-et-medico-social | page vérifiée |  | [page](https://www.departement06.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Alpes-de-Haute-Provence | sante-et-medico-social | page vérifiée |  | [page](https://www.mondepartement04.fr/accueil) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Ardennes | sante-et-medico-social | page vérifiée |  | [page](https://www.cd08.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Ardèche | sante-et-medico-social | page vérifiée |  | [page](https://www.ardeche.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Ariège | sante-et-medico-social | page vérifiée |  | [page](https://ariege.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Aube | sante-et-medico-social | page vérifiée |  | [page](https://www.aube.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Aude | sante-et-medico-social | page vérifiée |  | [page](https://www.aude.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Aveyron | sante-et-medico-social | page vérifiée |  | [page](https://aveyron.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Bouches-du-Rhône | sante-et-medico-social | page vérifiée |  | [page](https://www.departement13.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Calvados | sante-et-medico-social | page vérifiée |  | [page](https://www.calvados.fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Cantal | sante-et-medico-social | page vérifiée |  | [page](https://www.cantal.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Charente | sante-et-medico-social | page vérifiée |  | [page](https://www.lacharente.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Charente-Maritime | sante-et-medico-social | page vérifiée |  | [page](https://la.charente-maritime.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Cher | sante-et-medico-social | page vérifiée |  | [page](https://www.departement18.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Corrèze | sante-et-medico-social | page vérifiée |  | [page](https://www.correze.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Creuse | sante-et-medico-social | page vérifiée |  | [page](https://www.creuse.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Côte-d'Or | sante-et-medico-social | page vérifiée |  | [page](https://www.cotedor.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Côtes-d'Armor | sante-et-medico-social | page vérifiée |  | [page](https://cotesdarmor.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Deux-Sèvres | sante-et-medico-social | page vérifiée |  | [page](https://www.deux-sevres.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Dordogne | sante-et-medico-social | page vérifiée |  | [page](https://www.dordogne.fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Doubs | sante-et-medico-social | page vérifiée |  | [page](https://www.doubs.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Drôme | sante-et-medico-social | page vérifiée |  | [page](https://www.ladrome.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Essonne | sante-et-medico-social | page vérifiée |  | [page](https://www.essonne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Eure | sante-et-medico-social | page vérifiée |  | [page](https://eureennormandie.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Eure-et-Loir | sante-et-medico-social | identifiée |  | [page](https://eurelien.fr/) | 2026-10-09 (None) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Finistère | sante-et-medico-social | page vérifiée |  | [page](https://www.finistere.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Gard | sante-et-medico-social | page vérifiée |  | [page](https://www.gard.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Gers | sante-et-medico-social | page vérifiée |  | [page](https://www.gers.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Gironde | sante-et-medico-social | page vérifiée |  | [page](https://www.gironde.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Guadeloupe | sante-et-medico-social | page vérifiée |  | [page](https://www.cg971.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Haute-Garonne | sante-et-medico-social | page vérifiée |  | [page](https://www.haute-garonne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Haute-Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.hauteloire.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Haute-Marne | sante-et-medico-social | page vérifiée |  | [page](https://haute-marne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Haute-Savoie | sante-et-medico-social | page vérifiée |  | [page](https://www.hautesavoie.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Haute-Saône | sante-et-medico-social | page vérifiée |  | [page](https://www.haute-saone.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Haute-Vienne | sante-et-medico-social | page vérifiée |  | [page](https://www.haute-vienne.fr/votre-conseil-departemental) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Hautes-Alpes | sante-et-medico-social | page vérifiée |  | [page](https://www.hautes-alpes.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Hautes-Pyrénées | sante-et-medico-social | page vérifiée |  | [page](https://www.hautespyrenees.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Hauts-de-Seine | sante-et-medico-social | page vérifiée |  | [page](https://www.hauts-de-seine.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Hérault | sante-et-medico-social | page vérifiée |  | [page](https://herault.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Ille-et-Vilaine | sante-et-medico-social | page vérifiée |  | [page](https://www.ille-et-vilaine.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Indre | sante-et-medico-social | page vérifiée |  | [page](https://www.indre.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Indre-et-Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.touraine.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Isère | sante-et-medico-social | page vérifiée |  | [page](https://www.isere.fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Jura | sante-et-medico-social | page vérifiée |  | [page](https://www.jura.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental La Réunion | sante-et-medico-social | page vérifiée |  | [page](https://www.departement974.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Landes | sante-et-medico-social | identifiée |  | [page](https://www.landes.fr/) | 2026-10-09 (403) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Loir-et-Cher | sante-et-medico-social | page vérifiée |  | [page](https://www.departement41.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.loire.fr/jcms/lw_1299656/fr/accueil) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Loire-Atlantique | sante-et-medico-social | page vérifiée |  | [page](https://www.loire-atlantique.fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Loiret | sante-et-medico-social | page vérifiée |  | [page](https://www.loiret.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Lot | sante-et-medico-social | page vérifiée |  | [page](https://www.lot.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Lot-et-Garonne | sante-et-medico-social | page vérifiée |  | [page](https://www.lotetgaronne.fr/accueil) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Lozère | sante-et-medico-social | page vérifiée |  | [page](https://lozere.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Maine-et-Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.maine-et-loire.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Manche | sante-et-medico-social | page vérifiée |  | [page](https://www.manche.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Marne | sante-et-medico-social | page vérifiée |  | [page](https://www.marne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Mayenne | sante-et-medico-social | page vérifiée |  | [page](https://www.lamayenne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Mayotte | sante-et-medico-social | identifiée |  | [page](https://www.cg976.fr/) | 2026-10-09 (None) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Meurthe-et-Moselle | sante-et-medico-social | page vérifiée |  | [page](https://www.meurthe-et-moselle.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Meuse | sante-et-medico-social | page vérifiée |  | [page](https://www.meuse.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Morbihan | sante-et-medico-social | page vérifiée |  | [page](https://www.morbihan.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Moselle | sante-et-medico-social | page vérifiée |  | [page](https://www.moselle.fr/jcms/dlmnd_5083/fr/toute-l-info?portal=j_206) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Nièvre | sante-et-medico-social | page vérifiée |  | [page](https://nievre.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Nord | sante-et-medico-social | page vérifiée |  | [page](https://lenord.fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Oise | sante-et-medico-social | identifiée |  | [page](https://www.oise.fr/) | 2026-10-09 (403) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Orne | sante-et-medico-social | page vérifiée |  | [page](https://www.orne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Pas-de-Calais | sante-et-medico-social | page vérifiée |  | [page](https://www.pasdecalais.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Puy-de-Dôme | sante-et-medico-social | page vérifiée |  | [page](https://www.puy-de-dome.fr/conseil-departemental-du-puy-de-dome.html) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Pyrénées-Atlantiques | sante-et-medico-social | page vérifiée |  | [page](https://www.le64.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Pyrénées-Orientales | sante-et-medico-social | page vérifiée |  | [page](https://www.ledepartement66.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Rhône | sante-et-medico-social | page vérifiée |  | [page](https://www.rhone.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Sarthe | sante-et-medico-social | page vérifiée |  | [page](https://www.sarthe.fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Savoie | sante-et-medico-social | page vérifiée |  | [page](https://www.savoie.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Saône-et-Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.saoneetloire.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Seine-Maritime | sante-et-medico-social | page vérifiée |  | [page](https://www.seinemaritime.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Seine-Saint-Denis | sante-et-medico-social | page vérifiée |  | [page](https://seinesaintdenis.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Seine-et-Marne | sante-et-medico-social | page vérifiée |  | [page](https://www.seine-et-marne.fr/fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Somme | sante-et-medico-social | page vérifiée |  | [page](https://www.somme.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Tarn | sante-et-medico-social | page vérifiée |  | [page](https://www.tarn.fr/accueil) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Tarn-et-Garonne | sante-et-medico-social | page vérifiée |  | [page](https://www.tarnetgaronne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Territoire de Belfort | sante-et-medico-social | identifiée |  | [page](https://www.territoiredebelfort.fr) | 2026-10-09 (None) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Val-d'Oise | sante-et-medico-social | page vérifiée |  | [page](https://www.valdoise.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Val-de-Marne | sante-et-medico-social | page vérifiée |  | [page](https://www.valdemarne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Var | sante-et-medico-social | identifiée |  | [page](https://www.var.fr/) | 2026-10-09 (403) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Vaucluse | sante-et-medico-social | page vérifiée |  | [page](https://www.vaucluse.fr/accueil-3.html) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Vendée | sante-et-medico-social | page vérifiée |  | [page](https://www.vendee.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Vienne | sante-et-medico-social | page vérifiée |  | [page](https://www.lavienne86.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Vosges | sante-et-medico-social | page vérifiée |  | [page](https://www.vosges.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Yonne | sante-et-medico-social | page vérifiée |  | [page](https://www.yonne.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil départemental Yvelines | sante-et-medico-social | page vérifiée |  | [page](https://www.yvelines.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional  Hauts-de-France | sante-et-medico-social | page vérifiée |  | [page](https://www.hautsdefrance.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Auvergne-Rhône-Alpes | sante-et-medico-social | page vérifiée |  | [page](https://www.auvergnerhonealpes.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Bourgogne-Franche-Comté | sante-et-medico-social | page vérifiée |  | [page](https://www.bourgognefranchecomte.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Bretagne | sante-et-medico-social | identifiée |  | [page](https://www.bretagne.bzh/) | 2026-10-09 (403) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Centre-Val de Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.centre-valdeloire.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Grand Est | sante-et-medico-social | page vérifiée |  | [page](https://www.grandest.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Guadeloupe | sante-et-medico-social | page vérifiée |  | [page](https://www.regionguadeloupe.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional La Réunion | sante-et-medico-social | identifiée |  | [page](https://regionreunion.com/) | 2026-10-09 (403) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Normandie | sante-et-medico-social | identifiée |  | [page](https://www.normandie.fr/) | 2026-10-09 (403) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Nouvelle-Aquitaine | sante-et-medico-social | page vérifiée |  | [page](https://www.nouvelle-aquitaine.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Occitanie | sante-et-medico-social | page vérifiée |  | [page](https://www.laregion.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Pays de la Loire | sante-et-medico-social | page vérifiée |  | [page](https://www.paysdelaloire.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Provence-Alpes-Côte d'Azur | sante-et-medico-social | page vérifiée |  | [page](https://www.maregionsud.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil régional Île-de-France | sante-et-medico-social | page vérifiée |  | [page](https://www.iledefrance.fr/) | 2026-10-09 (200) | AAP régionaux (santé, formation, innovation). Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil territorial de Saint-Barthélemy | sante-et-medico-social | page vérifiée |  | [page](https://www.comstbarth.fr) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil territorial de Saint-Martin | sante-et-medico-social | identifiée |  | [page](https://www.comstmartin.fr/) | 2026-10-09 (523) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Conseil territorial de Saint-Pierre-et-Miquelon | sante-et-medico-social | page vérifiée |  | [page](http://www.spm-ct975.fr/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Deux-Sèvres – appels à projets | medico-social | page vérifiée |  | [page](https://www.deux-sevres.fr/services-en-ligne/tous-les-appels-projets) | 2026-10-09 (200) | CFPPA 79. |
| Drôme – Commission des financeurs | medico-social | page vérifiée |  | [page](https://www.ladrome.fr/annonces/commission-des-financeurs-de-la-prevention-de-la-perte-dautonomie/) | 2026-10-09 (200) | CFPPA 26. |
| Essonne – Commission des financeurs | medico-social | page vérifiée |  | [page](https://demarche.numerique.gouv.fr/commencer/appel-a-projet-commission-des-financeurs-de-la-pre) | 2026-10-09 (200) | Prévention de la perte d'autonomie (CFPPA 91). Département d'ARCADIA. |
| Finistère – appels à projets | medico-social | page vérifiée |  | [page](https://www.finistere.fr/le-conseil-departemental/appel-a-projets/) | 2026-10-09 (200) | CFPPA 29. |
| Gouvernement de Nouvelle-Calédonie | sante-et-medico-social | page vérifiée |  | [page](https://gouv.nc/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Gouvernement de la Polynésie française | sante-et-medico-social | page vérifiée |  | [page](https://www.presidence.pf/) | 2026-10-09 (200) | CFPPA et AAP du Département. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Hauts-de-Seine – appels à projets | medico-social | page vérifiée |  | [page](https://www.hauts-de-seine.fr/mon-departement/les-hauts-de-seine/le-conseil-departemental/les-appels-a-projet) | 2026-10-09 (200) | CFPPA 92 et autres AAP du Département. |
| Loiret – appels à projets | medico-social | page vérifiée |  | [page](https://www.loiret.fr/mon-departement/les-appels-projets-du-departement) | 2026-10-09 (200) | CFPPA 45. |
| Mairie de Aix-en-Provence | sante-et-medico-social | page vérifiée |  | [page](https://www.aixenprovence.fr) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Amiens | sante-et-medico-social | page vérifiée |  | [page](https://www.amiens.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Angers | sante-et-medico-social | page vérifiée |  | [page](https://www.angers.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Annecy | sante-et-medico-social | page vérifiée |  | [page](https://www.annecy.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Besançon | sante-et-medico-social | page vérifiée |  | [page](https://www.besancon.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Bordeaux | sante-et-medico-social | page vérifiée |  | [page](https://www.bordeaux.fr) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Brest | sante-et-medico-social | page vérifiée |  | [page](https://brest.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Caen | sante-et-medico-social | identifiée |  | [page](https://caen.fr/) | 2026-10-09 (None) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Cayenne | sante-et-medico-social | page vérifiée |  | [page](https://ville-cayenne.com/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Clermont-Ferrand | sante-et-medico-social | page vérifiée |  | [page](https://clermont-ferrand.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Dijon | sante-et-medico-social | page vérifiée |  | [page](https://www.dijon.fr) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Fort-de-France | sante-et-medico-social | page vérifiée |  | [page](https://www.fortdefrance.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Grenoble | sante-et-medico-social | page vérifiée |  | [page](https://www.grenoble.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Le Havre | sante-et-medico-social | page vérifiée |  | [page](https://www.lehavre.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Le Mans | sante-et-medico-social | page vérifiée |  | [page](https://www.lemans.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Lille | sante-et-medico-social | page vérifiée |  | [page](https://www.lille.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Limoges | sante-et-medico-social | identifiée |  | [page](https://www.limoges.fr/) | 2026-10-09 (403) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Lyon | sante-et-medico-social | page vérifiée |  | [page](https://www.lyon.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Marseille | sante-et-medico-social | page vérifiée |  | [page](https://www.marseille.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Metz | sante-et-medico-social | page vérifiée |  | [page](https://metz.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Montpellier | sante-et-medico-social | page vérifiée |  | [page](https://www.montpellier.fr) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Mulhouse | sante-et-medico-social | page vérifiée |  | [page](https://www.mulhouse.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Nancy | sante-et-medico-social | page vérifiée |  | [page](https://www.nancy.fr/accueil) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Nantes | sante-et-medico-social | page vérifiée |  | [page](https://metropole.nantes.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Nice | sante-et-medico-social | page vérifiée |  | [page](https://www.nice.fr/fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Nîmes | sante-et-medico-social | page vérifiée |  | [page](https://www.nimes.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Orléans | sante-et-medico-social | page vérifiée |  | [page](https://www.orleans.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Perpignan | sante-et-medico-social | page vérifiée |  | [page](https://www.mairie-perpignan.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Reims | sante-et-medico-social | page vérifiée |  | [page](https://www.reims.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Rennes | sante-et-medico-social | page vérifiée |  | [page](https://metropole.rennes.fr) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Rouen | sante-et-medico-social | page vérifiée |  | [page](https://rouen.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Saint-Denis-de-La-Réunion | sante-et-medico-social | page vérifiée |  | [page](https://www.saintdenis.re/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Saint-Étienne | sante-et-medico-social | page vérifiée |  | [page](https://www.saint-etienne.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Strasbourg | sante-et-medico-social | page vérifiée |  | [page](https://www.strasbourg.eu/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Toulon | sante-et-medico-social | page vérifiée |  | [page](https://www.toulon.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Toulouse | sante-et-medico-social | page vérifiée |  | [page](https://metropole.toulouse.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Tours | sante-et-medico-social | page vérifiée |  | [page](https://www.tours.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Mairie de Villeurbanne | sante-et-medico-social | page vérifiée |  | [page](https://www.villeurbanne.fr/) | 2026-10-09 (200) | Grande ville. Site officiel (annuaire de l'administration) : rubrique AAP à préciser. |
| Montpellier Méditerranée Métropole – contrat de ville | sante-et-medico-social | page vérifiée |  | [page](https://contratdeville.montpellier3m.fr/appel-a-projets) | 2026-10-09 (200) | Plateforme Dauphin. |
| Métropole Aix-Marseille-Provence – contrat de ville | sante-et-medico-social | page vérifiée |  | [page](https://ampmetropole.fr/missions/cohesion-sociale-et-insertion/vous-avez-un-projet-en-faveur-de-la-cohesion-sociale-la-metropole-vous-soutient/) | 2026-10-09 (200) | Thème « préserver sa santé ». |
| Métropole de Lyon – Commission des financeurs | medico-social | page vérifiée |  | [page](https://commissiondesfinanceurs.grandlyon.com/) | 2026-10-09 (200) | CFPPA de la métropole. |
| Nantes Métropole – appels à projets | sante-et-medico-social | page vérifiée |  | [page](https://metropole.nantes.fr/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Rhône – appels à candidatures prévention | medico-social | page vérifiée |  | [page](https://www.rhone.fr/jcms/tl1_2008815/fr/appels-a-candidatures-actions-collectives-de-prevention-a-destination-des-personnes-agees) | 2026-10-09 (200) | CFPPA 69. |
| Région Normandie – Culture, santé et médico-social | sante-et-medico-social | identifiée |  | [page](https://www.normandie.fr/appel-projets-culture-sante-et-medico-social) | 2026-10-09 (403) | Refuse les requêtes simples (403) : à contrôler avec un navigateur. AAP conjoint Région, ARS, DRAC. |
| Région Île-de-France – aides et appels à projets | sante-et-medico-social | page vérifiée |  | [page](https://www.iledefrance.fr/aides-et-appels-a-projets) | 2026-10-09 (200) | Adresse à confirmer ; filtrer santé. |
| Seine-Saint-Denis – Commission des financeurs | medico-social | page vérifiée |  | [page](https://ressources.seinesaintdenis.fr/Commission-des-Financeurs-de-la-Prevention-de-la-Perte-d-Autonomie-de-la-Seine) | 2026-10-09 (200) | CFPPA 93. |
| Ville de Lille – santé | sante-et-medico-social | identifiée |  | [page](https://www.lille.fr/Votre-Mairie/Lille-en-bref/Une-ville-attentive-a-chacun/La-sante) | 2026-10-09 (401) | Quatre AAP santé annuels. |
| Ville de Lyon – appel à projets santé | sante-et-medico-social | identifiée |  | [page](https://www.polville.lyon.fr/ressources-documents-projets/demandes-de-subvention/sante-appel-projets-2026) | 2026-10-09 (403) | Contrat local de santé. |
| Ville de Montpellier – appels à projets | sante-et-medico-social | page vérifiée |  | [page](https://www.montpellier.fr/vie-quotidienne/vivre-ici/appels-a-projets-en-cours) | 2026-10-09 (200) | Adresse à confirmer. |
| Ville de Paris – appels à projets | sante-et-medico-social | page vérifiée |  | [page](https://www.paris.fr/appels-a-projets) | 2026-10-09 (200) | Adresse à confirmer ; CFPPA 75 et santé. |
| Ville de Paris – politique de la ville | sante-et-medico-social | page vérifiée |  | [page](https://www.paris.fr/pages/appel-a-projets-politique-de-la-ville-2027-36298) | 2026-10-09 (200) | AAP annuel avec volet santé. |
| Ville de Strasbourg – santé publique | sante-et-medico-social | page vérifiée |  | [page](https://www.strasbourg.eu/enjeux-sante-publique-actions-projets) | 2026-10-09 (200) | AAP annuel santé environnementale. |
| Ville de Toulouse – appels à projets | sante-et-medico-social | page vérifiée |  | [page](https://www.toulouse.fr/) | 2026-10-09 (200) | Rubrique AAP à préciser. |

## Sociétés savantes et fédérations médicales (18)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| Plateforme nationale pour la recherche sur la fin de vie | sante-et-medico-social | page vérifiée |  | [page](https://www.plateforme-recherche-findevie.fr/articles) | 2026-10-09 (200) | Relais des AAP soins palliatifs (DGOS, régions). |
| SOFMER (médecine physique et de réadaptation) | sante | identifiée |  | [page](https://www.sofmer.com/index.php) | 2026-10-09 (302) | Bourses ; rubrique à préciser. |
| Société Francophone de Néphrologie, Dialyse et Transplantation (SFNDT) | sante | page vérifiée |  | [page](https://www.sfndt.org/vie-de-la-societe/bourses-prix-et-allocations) | 2026-10-09 (200) | Subventions de recherche. |
| Société Francophone du Diabète (SFD) | sante | page vérifiée |  | [page](https://www.sfdiabete.org/medical/la-recherche/allocations-de-recherche-et-prix) | 2026-10-09 (200) | Allocations de recherche et prix. |
| Société Française d'Accompagnement et de soins Palliatifs (SFAP) | sante-et-medico-social | page vérifiée |  | [page](https://www.sfap.org/appel-a-candidatures/) | 2026-10-09 (200) | Prix, appels à candidatures. |
| Société Française d'Anesthésie et de Réanimation (SFAR) | sante | page vérifiée |  | [page](https://sfar.org/bourses-recherche) | 2026-10-09 (200) | Bourses et contrats de recherche. |
| Société Française d'Hygiène Hospitalière (SF2H) | sante | page vérifiée |  | [page](https://www.sf2h.net/actualites.html) | 2026-10-09 (200) | Bourses ; relais d'AAP par la commission recherche. |
| Société Française d'Étude et de Traitement de la Douleur (SFETD) | sante | page vérifiée |  | [page](https://www.sfetd-douleur.org/prix-et-appel-doffre/) | 2026-10-09 (200) | Prix et appels d'offres. |
| Société Française de Cardiologie (SFC) | sante | page vérifiée |  | [page](https://www.sfcardio.fr/page/bourses-sfc) | 2026-10-09 (200) | Bourses annuelles. |
| Société Française de Dermatologie | sante | page vérifiée |  | [page](https://www.sfdermato.org/bourses-et-appels-d-offres/appels-a-projets-et-bourses-sfd.html) | 2026-10-09 (200) | Appels d'offres semestriels. |
| Société Française de Gériatrie et Gérontologie (SFGG) | sante-et-medico-social | page vérifiée |  | [page](https://sfgg.org/actualites/appels-a-participation-bourses-et-prix/) | 2026-10-09 (200) | Bourses, prix, relais d'AAP. |
| Société Française de Médecine d'Urgence (SFMU) | sante | page vérifiée |  | [page](https://www.sfmu.org/fr/la-recherche/appel-a-projet/) | 2026-10-09 (200) | Trois AAP par an (recherche, mobilité). |
| Société Française de Neurologie | sante | page vérifiée |  | [page](https://www.sf-neuro.org/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Société Française de Psychiatrie de l'Enfant et de l'Adolescent | sante | page vérifiée |  | [page](https://sfpeada.fr/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Société Française de Pédiatrie (SFP) | sante | page vérifiée |  | [page](https://www.sfpediatrie.com/recherche/prix-recherche-bourses) | 2026-10-09 (200) | Prix et bourses. |
| Société Française de Recherche et Médecine du Sommeil (SFRMS) | sante | page vérifiée |  | [page](https://www.sfrms-sommeil.org/bourses-et-recherche/bourses-recherche/) | 2026-10-09 (200) | Bourses recherche. |
| Société Française de Rhumatologie | sante | page vérifiée |  | [page](https://sfr.larhumatologie.fr/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Société Française de Santé Publique (SFSP) | sante | page vérifiée |  | [page](https://www.sfsp.fr/) | 2026-10-09 (200) | Relais d'AAP ; rubrique à préciser. |

## Hôpitaux, groupes et fondations hospitalières (10)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| AP-HM (Marseille) | sante | page vérifiée |  | [page](https://fr.ap-hm.fr/) | 2026-10-09 (200) | Rubrique recherche / AAP à préciser. |
| AP-HP – recherche (postes d'accueil, AAP internes) | sante | identifiée |  | [page](https://recherche.aphp.fr/) | 2026-10-09 (None) | Rubrique AAP à préciser. |
| FHF – Fédération hospitalière de France | sante-et-medico-social | page vérifiée |  | [page](https://www.fhf.fr/) | 2026-10-09 (200) | Relais national d'AAP ; rubrique à préciser (FHF HdF déjà listée). |
| Fondation Elsan | sante | page vérifiée |  | [page](https://www.elsan.care/fr/groupe) | 2026-10-09 (200) | Rubrique fondation à préciser. |
| Fondation Ramsay Santé | sante | page vérifiée |  | [page](https://fondation-ramsaysante.com/) | 2026-10-09 (200) | Site de la fondation ; rubrique AAP à préciser. |
| Fondation de l'AP-HP | sante | page vérifiée |  | [page](https://www.fondationaphp.fr/nos-appels-a-projets/) | 2026-10-09 (200) | Coup de Pouce, prix, AAP internes AP-HP. |
| GIRCI Île-de-France | sante | page vérifiée |  | [page](https://girci-idf.fr/projets/) | 2026-10-09 (200) | Recherche en soins (APRESO) ; les 7 GIRCI régionaux publient des AAP. |
| Hospices Civils de Lyon | sante | identifiée |  | [page](https://www.chu-lyon.fr/recherche) | 2026-10-09 (None) | Rubrique AAP à préciser. |
| Hôpital Robert-Debré (AP-HP) – veille des appels à projets | sante | identifiée |  | [page](https://robertdebre.aphp.fr/appels-a-projets/) | 2026-10-09 (403) | Veille d'AAP recherche tenue par un hôpital ; source agrégatrice utile. |
| Vivalto Santé – fondation | sante | page vérifiée |  | [page](https://www.vivalto-sante.com/) | 2026-10-09 (200) | Groupe privé ; rubrique AAP à préciser. |

## Centrales d'achat et groupements hospitaliers (4)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| CAIH (Centrale d'achat de l'informatique hospitalière) | sante | page vérifiée |  | [page](https://www.caih-sante.org/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| Resah | sante | page vérifiée |  | [page](https://resah.fr/) | 2026-10-09 (200) | Achat public d'innovation, relais France 2030 ; rubrique à préciser. |
| UGAP | sante | page vérifiée |  | [page](https://www.ugap.fr/) | 2026-10-09 (200) | Rubrique AAP à préciser. |
| UniHA | sante | page vérifiée |  | [page](https://www.uniha.org/actualites) | 2026-10-09 (200) | AAP achats publics innovants (avec ANAP, CAIH), trophées InitIAtive. |

## Autres émetteurs (8)

| Source | Périmètre | Statut | Connecteur | Page des AAP | Dernier contrôle | Notes |
|---|---|---|---|---|---|---|
| Aides-territoires | sante-et-medico-social | page vérifiée |  | [page](https://aides-territoires.beta.gouv.fr/aides/) | 2026-10-09 (200) | Agrégateur public des aides aux collectivités et acteurs locaux ; filtrer santé. |
| Appelaprojets.org | sante-et-medico-social | page vérifiée |  | [page](https://www.appelaprojets.org/) | 2026-10-09 (200) | Plateforme agrégatrice généraliste. |
| Ascodocpsy – appels à projets psychiatrie | sante | page vérifiée |  | [page](https://www.ascodocpsy.org/les-essentiels-en-psychiatrie/appels-a-projets/) | 2026-10-09 (200) | Veille AAP en psychiatrie et santé mentale. |
| Directions.fr – appels à projet | medico-social | page vérifiée |  | [page](https://www.directions.fr/appels-a-projet/) | 2026-10-09 (200) | Agrégateur des AAP de création et transformation d'ESMS (partie réservée aux abonnés). |
| FHF Hauts-de-France – appels à projets | sante-et-medico-social | page vérifiée |  | [page](https://www.fhf-hdf.fr/appels-a-projets/) | 2026-10-09 (200) | Fédération hospitalière : relais des AAP ouverts aux établissements publics de la région. |
| Fehap | sante-et-medico-social | page vérifiée |  | [page](https://www.fehap.fr/) | 2026-10-09 (200) | Fédération du privé solidaire ; rubrique AAP à préciser. |
| Nexem – veille des appels à projets | medico-social | page vérifiée |  | [page](https://nexem.fr/nos-publications-et-actualites) | 2026-10-09 (200) | Veille mensuelle des AAP du secteur social et médico-social. |
| Uniopss | medico-social | page vérifiée |  | [page](https://www.uniopss.asso.fr/) | 2026-10-09 (200) | Union des acteurs du social et médico-social ; rubrique AAP à préciser. |
