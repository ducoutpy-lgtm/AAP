# Design

## Contexte

`AapDetailPage` affiche quatre compteurs (jours, budget en « k », candidatures, nombre de territoires) et des
identifiants bruts. `PorteurDashboard` est statique. `MyApplicationsPage` est une liste à boutons de filtre et
renvoie vers `/candidature/:id`, route absente. Les statuts d'une candidature : `draft`, `submitted`, `under_review`,
`accepted`, `rejected`, `pending_info` (type `ApplicationStatus`) ; le formulaire écrit `submitted`.

## Décisions

1. **Fonctions pures dans `utils/candidat.ts`** : `libelleMontant`, `aQuiSAdresse`, `appelsPourProfil`,
   `echeancesProches`, `COLONNES_CANDIDATURES`, `repartirCandidatures`, `LIBELLES_STATUT_CANDIDATURE`.
2. **Fiche** : la bande de compteurs devient trois cases ; la carte « À qui s'adresse » lit `structureTypeEligible`
   (catégories d'établissement lues par l'extraction) et `eligibilityCriteria` ; le champ dédié « public / privé »
   arrive au jour 2 et s'ajoutera à cette carte. Thématiques : `sante` -> Santé, `social` -> Médico-social et social.
3. **Tableau de bord** : une lecture des fiches publiées (même requête que la recherche, filtrée par
   `visiblePubliquement`), une des candidatures du compte (sans tri Firestore, comme Mes candidatures), une des
   recherches sauvegardées (`savedSearches` où `userId`), une du profil. « Appels pour votre structure » =
   `appelsPourProfil(aaps, region)` : territoire de la région ou national, non clôturés, triés par clôture la plus
   proche puis sans date.
4. **Détail d'une candidature** : page mince, lecture du document, vérification `porteurId === uid` (la règle
   Firestore refuse déjà la lecture à un autre compte, la page affiche un message au lieu d'une erreur technique).
5. **Colonnes** : `submitted` -> Envoyée, `under_review` -> En cours d'examen, `pending_info` -> Complément demandé,
   `accepted` -> Acceptée, `rejected` -> Refusée ; `draft` et valeurs inconnues (`shortlisted`) -> En cours d'examen,
   pour ne rien perdre.

## Risques

- La session ne joue pas les pages connectées : preuve par tests, lint, build ; vérification par Monsieur DUCOUT.
