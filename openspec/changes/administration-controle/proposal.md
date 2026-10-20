# Proposal

## Why

Retours de Monsieur DUCOUT du 2026-10-20 : l'espace administrateur doit être l'endroit où il voit combien de candidats
(établissements) et de financeurs utilisent l'outil, combien d'abonnements, combien d'appels publiés, et surtout les
fiches à contrôler : il clique, il contrôle, il valide, et la fiche est publiée. Il refuse qu'une fiche non contrôlée
soit visible des candidats (« si elles n'ont pas été contrôlées, pourquoi sont-elles publiées ? ») : la décision du
2026-10-14 (publier les fiches proposées avec un badge « à vérifier ») est annulée. Enfin, côté candidat, les filtres
Source et Relecture n'ont pas de sens.

## What Changes

- **Recherche publique limitée aux fiches contrôlées** : seules les fiches validées (par Monsieur DUCOUT ou par le
  contrôle du modèle) ou saisies à la main par un financeur sont visibles ; les filtres Source et Relecture
  disparaissent de la recherche.
- **Import** : une fiche nouvelle que le modèle n'a pas validée entre en brouillon, plus en publié. Les fiches déjà
  en base ne sont pas touchées par l'import (règle existante) : une opération unique `scripts/depublier_non_controlees.py`
  (essai à blanc, sauvegarde, accord) repasse en brouillon les fiches publiées sans contrôle (26 proposées, 8 à
  corriger au 2026-10-20 matin).
- **Administration** : tableau de bord avec compteurs candidats, financeurs, abonnements actifs et essais, appels
  publiés, et une carte « Fiches à contrôler » qui ouvre la liste filtrée ; sur la liste, boutons « Valider et
  publier », « Rejeter », « Modifier » (l'administrateur peut ouvrir le formulaire de modification de toute fiche) ;
  le filtre de validation se lit dans l'adresse pour que la carte et l'e-mail futur y mènent directement.
- **Hors périmètre** (changement suivant, question posée) : l'e-mail hebdomadaire après la veille (« 15 nouveaux, 10
  validés automatiquement, 5 à valider ») demande une boîte d'envoi ; la fusion des financeurs en doublon et les
  agences de l'eau ; les nouveaux champs de qualification (à qui s'adresse l'appel).

## Capabilities

### New Capabilities

- `administration-controle` : contrôle des fiches depuis l'application, compteurs d'administration.

### Modified Capabilities

- `import-aap-scrapes` : une fiche sans validation entre en brouillon.
- `consultation-aap-scrapes` : la recherche publique ne montre que les fiches contrôlées.

## Impact

- Code : `scripts/import_to_firestore.py` (règle de publication, test), `scripts/depublier_non_controlees.py`
  (nouveau), `app/src/utils/relecture.ts` (`visiblePubliquement`, test), `SearchAapPage`, `AdminDashboard`,
  `ManageAAPsPage`, `EditAapPage`.
- Données : `aap.validation` et `aap.status` écrits par l'administrateur depuis l'application (règle Firestore déjà
  déployée : l'administrateur met à jour tout appel) ; les verdicts pris dans l'application ne sont pas recopiés dans
  `scraping/sources/verdicts_fiches.json`, l'import ne réécrit jamais `validation` ni `status` d'un document existant.
- Coût : zéro euro.
