# Proposal

## Why

Semaine 2 du plan de quatre semaines (« continue avec la semaine 2 », Monsieur DUCOUT, 2026-11-13) : « le candidat trouve
ses appels ». La page `/recommandations` existe depuis avril mais ne sert à rien : ses règles comparent des secteurs qui
valent toujours « santé, social », cherchent un territoire « National » que l'import n'écrit jamais (il écrit « france »),
inventent un budget (`teamSize * 10000`), montrent des fiches non contrôlées et des appels clos, et affichent « Infinity
jours » pour un appel sans date. Un profil créé par le parcours d'intégration n'obtient probablement aucune recommandation.

## What Changes

- `app/src/utils/recommandations.ts` (fonction pure, testée) : chaque appel publié, contrôlé et non clos est comparé au
  profil : région (la sienne, nationale, ou écarté), statut juridique contre « à qui s'adresse l'appel » (qualification),
  type d'établissement contre les catégories lues, objets du projet, champ santé ou médico-social. Chaque appel retenu
  dit pourquoi (raisons) et ce qui reste à vérifier (réserves). Pourquoi des règles et pas un score en pourcentage :
  Monsieur DUCOUT doit pouvoir juger chaque recommandation ; une donnée fermée qui contredit le profil écarte l'appel,
  pour viser 18 recommandations pertinentes sur 20.
- `RecommendationsPage.tsx` réécrite sur ces règles : raisons en clair, réserves, bandeau « Complétez votre profil »
  quand la région, le statut ou le type d'établissement manquent.
- Choix par défaut, à valider par Monsieur DUCOUT : GCS rangé en public et privé non lucratif ; exercice coordonné sans
  statut déduit ; un appel qui ne cite que d'autres types d'établissement est écarté ; un appel national vaut moins de
  points qu'un appel de la région (1 contre 3) : il n'est recommandé que si d'autres éléments concordent, et passe après
  les appels régionaux à concordance égale ; seuil de recommandation à 3 points, à régler sur le tirage de vingt.
- Hors périmètre : carte « Recommandés pour vous » du tableau de bord ; liste des régions d'outre-mer dans la page Mon
  profil (signalée) ; enrichissement des fiches non qualifiées.

## Capabilities

### New Capabilities

- `recommandations-candidat` : recommandations depuis le profil, avec raisons.

## Impact

- Code : `app/src/utils/recommandations.ts` et son test, `app/src/pages/porteur/RecommendationsPage.tsx`,
  `scripts/semer_emulateurs.py` (appels de test sur `territoriesEligible`, pour le parcours joué).
- Coût : zéro euro. Mise en ligne sur accord de Monsieur DUCOUT.
