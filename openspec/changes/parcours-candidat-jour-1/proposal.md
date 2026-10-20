# Proposal

## Why

Jour 1 du plan MVP (`docs/PLAN_MVP_2026-10-20.md`, validé par Monsieur DUCOUT : « l'ordre me va, commence le
jour 1 »). Son parcours du 2026-10-20 a montré des impasses : fiche d'appel avec des compteurs sans intérêt
(« Candidatures : 0 », « Territoires : 1 ») et des identifiants bruts (« ile-de-france », « sante »), tableau de bord
candidat à zéro partout et « Complétez votre profil » alors qu'il vient de le faire, clic sur une candidature vers une
page inexistante, liste des candidatures sans vue par étape.

## What Changes

- **Fiche d'appel** : en-tête à trois cases (montant, dates avec jours restants et statut, territoire en clair), carte
  « À qui s'adresse cet appel » (types d'établissement éligibles tels que lus, critères d'éligibilité), thématiques et
  territoires en libellés ; compteurs de candidatures et de territoires retirés.
- **Tableau de bord candidat** : chiffres réels (appels pour sa structure, échéances sous 30 jours, candidatures,
  recherches sauvegardées), liste « Appels pour votre structure » (sa région ou national, ouverts, clôture la plus
  proche d'abord, cinq au plus, lien vers la recherche déjà filtrée), ses dernières candidatures, bienvenue au nom de
  la structure.
- **Détail d'une candidature** (`/candidature/:id`) : statut et historique, projet, budget, pièces jointes, retour du
  financeur, lien vers l'appel.
- **Mes candidatures en colonnes** : Envoyée, En cours d'examen, Complément demandé, Acceptée, Refusée (transposition
  du tableau en colonnes de helloDarwin) ; chaque carte ouvre le détail.
- **Fonctions pures testées** (`utils/candidat.ts`) : montant lisible, « à qui s'adresse », appels pour un profil,
  échéances proches, répartition en colonnes.
- **Hors périmètre** : le champ « à qui s'adresse » extrait par le modèle (jour 2 : aujourd'hui la carte montre ce que
  les fiches portent déjà), favoris, pièces jointes des fiches de la veille (jour 2).

## Capabilities

### New Capabilities

- `parcours-candidat` : fiche, tableau de bord, détail et suivi des candidatures pour un candidat.

## Impact

- Code : `utils/candidat.ts` et test, `pages/porteur/AapDetailPage.tsx`, `PorteurDashboard.tsx`,
  `MyApplicationsPage.tsx`, `ApplicationDetailPage.tsx` (nouvelle), `App.tsx` (une route).
- Données : lectures seulement (`aap`, `applications`, `savedSearches`, `porteurProfiles`). Coût : zéro euro.
