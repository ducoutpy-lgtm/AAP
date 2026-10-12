# Extraction sur échantillon : comparaison des moteurs

Généré par `python scraping/echantillon.py --rapport`. Contrôle manuel : pour chaque fiche, titre, financeur, date de clôture et montant comparés à la page d'origine (`results/controle_echantillon.json`).

## Récapitulatif par moteur

| Moteur | Fiches produites | Fiches contrôlées | Fiches justes (4/4) | Temps total | Coût |
|---|---|---|---|---|---|
| ollama | 41 | 41 | 9 | 1767 s | 0 euro |
| claude_code | 24 | 24 | 24 | 0 s | 0 euro |
| api_anthropic (estimation, aucun appel) | 45 | - | - | - | 1.19 euros (99.07 euros pour 3748 liens) |

Pages lues par la session et jugées hors sujet (liste, présentation, page sans rapport) : 21. Le moteur Ollama, lui, produit une fiche pour chaque page, y compris celles-là : voir la colonne « hors sujet » ci-dessous.

## Détail par fiche

T = titre, F = financeur, D = date de clôture, M = montant ; oui / non / vide = non contrôlé.

| Source | Fiche | Hors sujet | ollama T F D M | claude_code T F D M |
|---|---|---|---|---|
| cnsa | [page](https://www.cnsa.fr/appels-projets/appel-projets-de-recherche-analyse-des-politiques-de-lautonomie-apolau) |  | oui oui oui oui | oui oui oui oui |
| cnsa | [page](https://www.cnsa.fr/appels-projets/esms-numerique-appel-projets-national-2025) |  | oui non oui non | oui oui oui oui |
| cnsa | [page](https://www.cnsa.fr/appels-projets/esms-numerique-appels-projets-regionaux-2025) |  | oui oui oui non | oui oui oui oui |
| cnsa | [page](https://www.cnsa.fr/appels-projets/investissement-en-habitat-inclusif-2026) |  | oui oui oui non | oui oui oui oui |
| cnsa | [page](https://www.cnsa.fr/appels-projets/mobilisation-pour-lhabitat-intermediaire) |  | oui oui oui oui | oui oui oui oui |
| ministere-de-la-culture-culture-sante-handicap-et-dependance | [page](https://www.culture.gouv.fr/Thematiques/Developpement-culturel/Le-developpement-culturel-en-France/Culture-et-Sante) | oui | non non non non | non produite ou non contrôlée |
| ministere-de-la-culture-culture-sante-handicap-et-dependance | [page](https://www.culture.gouv.fr/content/search?refinementList%5Btaxonomy_theme_id%5D%5B0%5D=210) | oui | non non non non | non produite ou non contrôlée |
| ministere-de-la-culture-culture-sante-handicap-et-dependance | [page](https://www.culture.gouv.fr/content/search?refinementList%5Btaxonomy_theme_id%5D%5B0%5D=253) | oui | non non non non | non produite ou non contrôlée |
| agence-de-l-eau-artois-picardie | [page](https://www.eau-artois-picardie.fr/aides-et-redevances-prix-de-leau/la-facture-deau-expliquee) | oui | non non non non | non produite ou non contrôlée |
| agence-de-l-eau-artois-picardie | [page](https://www.eau-artois-picardie.fr/aides-et-redevances-prix-de-leau/le-prix-des-services-de-leau) | oui | non non non non | non produite ou non contrôlée |
| agence-de-l-eau-artois-picardie | [page](https://www.eau-artois-picardie.fr/aides-et-redevances-redevances/controles-techniques-des-elements-de-lassiette-des-redevances) | oui | non non non non | non produite ou non contrôlée |
| agence-de-l-eau-artois-picardie | [page](https://www.eau-artois-picardie.fr/aides-et-redevances-redevances/reforme-des-redevances-2025) | oui | non non non non | non produite ou non contrôlée |
| agence-de-l-eau-artois-picardie | [page](https://www.eau-artois-picardie.fr/la-jeunesse-pour-leau-appel-projets/appel-manifestation-dinteret-2026-faire-emerger-des-projets?qt-related_content=0) |  | oui oui non oui | oui oui oui oui |
| fhf-hauts-de-france-appels-a-projets | [page](https://www.fhf-hdf.fr/2025/12/19/financer-sa-transition-ecologique-les-appels-a-projets-recenses-par-lanap/) | oui | non non non non | non produite ou non contrôlée |
| fhf-hauts-de-france-appels-a-projets | [page](https://www.fhf-hdf.fr/2026/03/11/aap-dgos-anap-alimentation-durable-en-etablissements-de-sante-10-mai-2026/) |  | oui oui non oui | oui oui oui oui |
| fhf-hauts-de-france-appels-a-projets | [page](https://www.fhf-hdf.fr/2026/06/03/appel-a-projets-2026-vers-un-hopital-alzheimer-friendly-20-septembre-2026/) |  | oui oui non oui | oui oui oui oui |
| fhf-hauts-de-france-appels-a-projets | [page](https://www.fhf-hdf.fr/2026/06/09/aap-fondation-des-hopitaux-2026-ameliorer-le-quotidien-des-personnes-agees-24-septembre/) |  | oui oui non oui | oui oui oui oui |
| fhf-hauts-de-france-appels-a-projets | [page](https://www.fhf-hdf.fr/2026/09/08/aac-prix-qualite-2026-de-lars-hauts-de-france-8-novembre-2026/) |  | oui oui oui oui | oui oui oui oui |
| firah | [page](https://www.firah.org/fr/appel-a-projets-general-2021.html) |  | oui oui non non | oui oui oui oui |
| firah | [page](https://www.firah.org/fr/appel-a-projets-general-2022.html) |  | oui oui oui non | oui oui oui oui |
| firah | [page](https://www.firah.org/fr/appel-a-projets-general-2023.html) |  | oui oui oui oui | oui oui oui oui |
| firah | [page](https://www.firah.org/fr/appel-a-projets-general-2024.html) |  | oui oui oui non | oui oui oui oui |
| firah | [page](https://www.firah.org/fr/appel-a-projets-general-2025.html) |  | oui oui non oui | oui oui oui oui |
| region-ile-de-france-aides-et-appels-a-projets | [page](https://www.iledefrance.fr/aides-et-appels-a-projets/appel-candidature-au-label-patrimoine-dinteret-regional-en-faveur-du-patrimoine-non-protege) |  | oui oui oui oui | oui oui oui oui |
| region-ile-de-france-aides-et-appels-a-projets | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=public%3A241) | oui | non non non non | non produite ou non contrôlée |
| region-ile-de-france-aides-et-appels-a-projets | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=public%3A244) | oui | non non non non | non produite ou non contrôlée |
| region-ile-de-france-aides-et-appels-a-projets | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=public%3A247) | oui | non non non non | non produite ou non contrôlée |
| region-ile-de-france-aides-et-appels-a-projets | [page](https://www.iledefrance.fr/aides-et-appels-a-projets?f%5B0%5D=public%3A250) | oui | non non non non | non produite ou non contrôlée |
| interreg-rhin-superieur | [page](https://www.interreg-rhin-sup.eu/appel-a-projets-multi-thematique-2025/) |  | oui oui oui non | oui oui oui oui |
| interreg-rhin-superieur | [page](https://www.interreg-rhin-sup.eu/decouvrir-le-programme/un-programme-europeen-pour-le-territoire-du-rhin-superieur/) | oui | non non non non | non produite ou non contrôlée |
| interreg-rhin-superieur | [page](https://www.interreg-rhin-sup.eu/vous-avez-une-idee-de-projet/appel-a-projets-2024/) |  | oui oui oui oui | oui oui oui oui |
| interreg-rhin-superieur | [page](https://www.interreg-rhin-sup.eu/vous-avez-une-idee-de-projet/appel-a-projets-offensive-sciences-2024/) |  | non produite ou non contrôlée | oui oui oui oui |
| interreg-rhin-superieur | [page](https://www.interreg-rhin-sup.eu/vous-avez-une-idee-de-projet/le-calendrier-de-nos-appels-a-projets/) | oui | non non non non | non produite ou non contrôlée |
| ars-normandie | [page](https://www.normandie.ars.sante.fr/appel-candidatures-deploiement-du-dentobus-dans-lorne) |  | oui oui oui oui | oui oui oui oui |
| ars-normandie | [page](https://www.normandie.ars.sante.fr/appel-projet-esms-numerique-2026) |  | oui non non oui | oui oui oui oui |
| ars-normandie | [page](https://www.normandie.ars.sante.fr/appels-candidatures-referent-handicap-territorial-departements-du-calvados-de-la-manche-et-de-lorne) |  | oui oui oui oui | oui oui oui oui |
| ars-normandie | [page](https://www.normandie.ars.sante.fr/bilans-aap-2025-financement-dequipements-destination-des-professionnels-exercant-dans-les) | oui | non non non non | non produite ou non contrôlée |
| ars-normandie | [page](https://www.normandie.ars.sante.fr/calendriers-des-appels-projets-medico-sociaux) | oui | non non non non | non produite ou non contrôlée |
| societe-francaise-de-medecine-d-urgence-sfmu | [page](https://www.sfmu.org/fr/la-recherche/bourse/) |  | non produite ou non contrôlée | oui oui oui oui |
| societe-francaise-de-medecine-d-urgence-sfmu | [page](https://www.sfmu.org/fr/la-recherche/br_thematique/) |  | oui oui oui oui | oui oui oui oui |
| societe-francaise-de-medecine-d-urgence-sfmu | [page](https://www.sfmu.org/fr/la-sfmu/conseil-d-administration/2014bis/) | oui | non non non non | non produite ou non contrôlée |
| societe-francaise-de-medecine-d-urgence-sfmu | [page](https://www.sfmu.org/fr/recherche/advanced) | oui | non non non non | non produite ou non contrôlée |
| societe-francaise-de-medecine-d-urgence-sfmu | [page](https://www.sfmu.org/fr/vie-professionnelle/outils-professionnels/protocoles-de-soins/aide_cognitive/) | oui | non non non non | non produite ou non contrôlée |
