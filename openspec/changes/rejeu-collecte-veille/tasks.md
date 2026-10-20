# Tasks

Lot 2 du rapport de critique (rejeu, péremption, rapport de veille) ; accord de Monsieur DUCOUT des 2026-10-19 et
2026-10-20. Rejeu à zéro euro ; extraction des textes nouveaux soumise à devis et accord ; aucun `git push`, aucun
archivage sans demande ; migrations après essai à blanc et sauvegarde.

## 1. Outil de rejeu

- [ ] 1.1 `scraping/rejeu.py` : fonctions pures `comparer_liens`, `marquer_fiches`, `rapport_markdown` testées ;
  `--relire [--ids] [--limite]`, `--collecter`, `--marquer`, `--rapport`. Fait quand : pytest scraping vert.
- [ ] 1.2 Rejeu réel sur les vingt premières sources confirmées (ARS, portail des ARS, CNSA) : journal collé (sources
  relues, erreurs, nouveaux, disparus), textes nouveaux collectés, fiches marquées, `VEILLE.md` écrit.

## 2. Import et péremption

- [ ] 2.1 `import_to_firestore.py` : `derniereVueLe` depuis `vue_rubrique_le`, `absences` ; type `AAP` ; test. Import à
  blanc puis réel, compte collé.
- [ ] 2.2 `scripts/perimer_fiches.py` (essai à blanc, sauvegarde, accord) et test de la fonction pure. Exécution réelle
  seulement quand une fiche atteindra deux absences (pas avant le second rejeu).

## 3. Extraction des textes nouveaux

- [ ] 3.1 Devis `extraction_locale.py --extraire --moteur api --dry-run` collé ; après accord, extraction, contrôle
  (devis), import, décision du modèle ; compte des appels publiés collé.

## 4. Lancement et documentation

- [ ] 4.1 `scraping/veille.cmd` (relire, collecter, marquer, rapport, devis affiché) ; décision de planification laissée
  à Monsieur DUCOUT.
- [ ] 4.2 README scraping, README racine, CHANGELOGs, CLAUDE.md, REPRISE.md, `docs/FLUX_DONNEES.md`,
  `docs/FEUILLE_DE_ROUTE.md` (étape 4), rapport section 8.
- [ ] 4.3 Monsieur DUCOUT lit `VEILLE.md` et rejoue le scénario « vingt émetteurs » de la spec.
