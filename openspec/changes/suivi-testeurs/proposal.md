# Proposal

## Why

Jour 4 du plan MVP (`docs/PLAN_MVP_2026-10-20.md`). Monsieur DUCOUT veut voir, depuis son espace administrateur,
qui s'est inscrit et ce que chacun fait : « il faut que moi, du côté admin, j'arrive à voir ce qu'ils sont en train
de faire, comment ça fonctionne ». Aujourd'hui l'administration montre des comptes et des compteurs globaux, mais
aucune trace des actions des testeurs.

## What Changes

- **Journal des actions** : l'application écrit une ligne dans la collection `journal` à chaque action qui compte
  (connexion, recherche avec ses filtres, fiche ouverte, recherche sauvegardée, candidature envoyée, appel publié) :
  compte, rôle, action, cible, date. Pourquoi côté application : aucune fonction serveur n'est déployée ; une écriture
  par action est négligeable.
- **Page « Testeurs »** (`/admin/testeurs`) : un compte par ligne (adresse, rôle, structure, inscription, dernière
  connexion, nombre de connexions, recherches, fiches ouvertes, candidatures), le détail des dernières actions d'un
  compte au clic, et les chiffres d'usage de la semaine en tête (comptes actifs, connexions, recherches, fiches,
  candidatures). Entrée « Testeurs » dans le menu de l'administrateur et carte sur le tableau de bord.
- **Règle Firestore** : un compte connecté crée ses propres lignes de journal, seul l'administrateur les lit ;
  déploiement après accord.
- **Hors périmètre** : statistiques par appel (vues, taux de candidature : jour 6), export, purge automatique du
  journal (à prévoir avec la politique de conservation RGPD : la ligne « journal des actions, conservation douze
  mois » sera ajoutée à la politique de confidentialité).

## Capabilities

### New Capabilities

- `suivi-testeurs` : journal des actions et page Testeurs.

## Impact

- Code : `utils/journal.ts` et test (actions, libellés, résumé par compte, chiffres de la semaine),
  `services/journalService.ts` (écriture), appels dans `AuthContext` (connexion), `SearchAapPage`, `AapDetailPage`,
  `SavedSearchesPage`, `ApplicationFormPage`, `CreateAapPage` ; `pages/admin/TesteursPage.tsx`, route, menu,
  tableau de bord administrateur ; `firestore.rules` ; politique de confidentialité (une ligne).
- Données : collection `journal` (nouvelle). RGPD : données de connexion et d'usage, finalité suivi du test,
  conservation douze mois, DPO Monsieur DUCOUT.
- Coût : zéro euro.
