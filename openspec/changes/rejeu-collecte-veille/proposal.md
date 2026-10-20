# Proposal

## Why

Lot 2 « fraîcheur » du rapport de critique : la liste des appels doit rester vraie dans le temps. Les 289 appels publiés
viennent d'une collecte des 12 au 14 octobre 2026 ; rien ne détecte un appel nouveau sur une page validée, ni un appel
retiré de sa page. L'instruction 10 (dates de collecte et de dernière vue) est faite ; restent le rejeu de la collecte
sur les pages validées, la règle « non revue après deux rejeux » et le rapport de veille. Accord de Monsieur DUCOUT du
2026-10-19 (« reprends le lot 2 ») puis du 2026-10-20 (« on reprend, on y va »).

## What Changes

- **Nouvel outil `scraping/rejeu.py`**, zéro euro : relit la page validée de chaque rubrique confirmée (même lecture
  des liens que la découverte), compare aux liens connus, note sur chaque lien `apparu_le`, `vu_le` et `absences`
  (rejeux consécutifs sans le voir), journalise par source (`decouverte/<id>/rejeux.json`), puis collecte le texte des
  liens nouveaux (collecteur existant, qui saute les textes déjà présents). Une page en erreur ou sans aucun lien ne
  compte pas comme une disparition de ses appels.
- **Fiches** : `rejeu.py --marquer` reporte sur chaque fiche des fichiers de résultats `vue_rubrique_le` et `absences`
  d'après le lien correspondant ; `--rapport` écrit `scraping/VEILLE.md` (par rejeu : sources relues, erreurs, liens
  nouveaux, disparus, fiches à péremption).
- **Extraction des textes nouveaux** : la commande V4 existante (`extraction_locale.py --extraire --moteur api`), avec
  son devis, après accord ; puis contrôle, import, décision du modèle, comme le 2026-10-19.
- **Import** : `derniereVueLe` vaut `vue_rubrique_le` quand le rejeu l'a posé, sinon la date de l'import (règle du
  2026-10-19) ; `scrapeMetadata.absences` reporté.
- **Péremption** : `scripts/perimer_fiches.py` (essai à blanc, sauvegarde, accord) passe « à corriger » avec le
  commentaire « absente de sa page source depuis N rejeux » toute fiche publiée sans verdict humain dont `absences`
  vaut 2 ou plus ; une fiche validée par Monsieur DUCOUT reste intacte.
- **Lancement** : manuel, par `scraping/veille.cmd` (relecture des pages, collecte des nouveaux textes, rapport, devis
  d'extraction affiché) ; la planification Windows est laissée à une décision ultérieure.

## Capabilities

### New Capabilities

- `veille-aap` : rejeu des pages validées, journal des liens nouveaux et disparus, marquage des fiches, rapport de
  veille, péremption.

### Modified Capabilities

- `import-aap-scrapes` : `derniereVueLe` depuis le rejeu, `absences`.

## Impact

- Code : `scraping/rejeu.py` (nouveau), `scraping/veille.cmd`, `scripts/import_to_firestore.py`,
  `scripts/perimer_fiches.py` (nouveau), type `AAP`, tests.
- Données : `liens.json` enrichis (compatibles : les clés existantes ne changent pas), `rejeux.json` par source,
  fiches enrichies, documents Firestore enrichis.
- Coût : zéro pour le rejeu ; l'extraction des textes nouveaux reste soumise à devis et accord (quelques centimes par
  semaine à l'échelle observée).
- Hors périmètre : détection des pages modifiées (relecture de tous les textes), planification automatique.
