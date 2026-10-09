# Tasks

## 1. Outil et format

- [x] 1.1 Créer `scraping/registre.py` (`--verifier-format`, `--verifier-pages`, `--tableau`) et `scraping/sources/registre.json` avec les 5 sources existantes en `operationnelle`. Fait quand : `--verifier-format` affiche « Registre valide : 5 sources ».
- [x] 1.2 Tests `scraping/tests/test_registre.py` : format valide, source incomplète refusée, tableau généré avec décompte (sans réseau). Fait quand : `pytest scraping/tests/test_registre.py -q` vert.

## 2. Constitution du registre (zéro dépense)

- [x] 2.1 Les 17 ARS régionales : nom, domaine, page des AAP (même structure de site que l'ARS Île-de-France). Fait quand : 17 lignes en catégorie `ars`, pages contrôlées.
- [x] 2.2 Caisses, agences et ministères : CNSA, CNAM (ameli), CNAV, ministère de la Santé (sante.gouv), Santé publique France, ANAP, ANS, HAS, Matignon, Élysée, et autres trouvés par recherche web. Fait quand : chaque ligne a une page des AAP ou une note expliquant l'absence de rubrique.
- [x] 2.3 Fondations : Fondation de France (déjà couverte) et liste des fondations abritées ou indépendantes qui financent la santé ou le médico-social (recherche web). Fait quand : au moins 10 fondations avec page vérifiée.
- [x] 2.4 Europe et collectivités : programmes européens santé (EU4Health, Horizon Europe santé, FSE+, Interreg), régions et premiers départements (conférences des financeurs CNSA). Fait quand : au moins 5 lignes `europe` et 5 lignes `collectivite`, pages contrôlées.
- [x] 2.5 `registre.py --verifier-pages` puis `--tableau`. Fait quand : décompte d'au moins 40 sources en « page vérifiée » ou mieux, liste « à revoir » lue et annotée.

- [x] 2.6 (ajoutée à la relecture de Monsieur DUCOUT) Étendre le registre : ministère de la Recherche, agences de l'État même à lien indirect (agences de l'eau, ANDRA, ADEME, ANSES...), INCa, fondations supplémentaires (dont calendrier des fondations abritées de la Fondation de France), sociétés savantes, hôpitaux et fondations hospitalières, centrales d'achat, toutes les régions et tous les départements et 39 grandes villes via l'annuaire officiel de l'administration (DILA). Fait quand : registre à 334 sources, pages contrôlées.

## 3. Documentation et vérification finale

- [x] 3.1 `scraping/README.md` (section registre et commandes), `scraping/CHANGELOG.md`, `CLAUDE.md` (avancement, ordre des changements suivants). Fait quand : fichiers relus.
- [x] 3.2 Relecture du tableau par Monsieur DUCOUT : sources à ajouter, à retirer, catégories à corriger ; corrections reportées dans le JSON. Fait quand : Monsieur DUCOUT valide le registre comme point de départ.

## Workflow follow-up

- Archiver après 3.2.
- Changement suivant : connecteur générique ARS (collecte gratuite, extraction sur une ARS d'abord).
