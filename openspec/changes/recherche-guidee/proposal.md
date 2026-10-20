# Proposal

## Why

La page de recherche `/aap/search` filtre déjà par thématique, territoire, financeur, source, relecture et budget, mais
elle ne dit pas le poids de ce qu'elle montre (combien d'euros annoncés), n'affiche pas les filtres actifs autrement
que dans les listes, ne connaît que « ouvert » ou « clôturé », ne se partage pas par son adresse et ne tient pas compte
du profil de la personne connectée. Le relevé helloDarwin (`docs/parcours_hellodarwin_2026-10.md`, sections 2 et
2 ter) montre ces mécaniques ; Monsieur DUCOUT a validé le point 3 et demandé d'étudier les filtres. Ce changement
porte le premier groupe, celui qui se calcule avec les champs déjà présents dans les fiches. Le second groupe (statut
de l'établissement éligible, type d'appel, objet, publics, dépenses) demande d'enrichir l'extraction et fera un
changement séparé, avec devis.

## What Changes

- **Compteur avec montants** : « N appels à projets, M euros annoncés (K fiches chiffrées) », recalculé à chaque
  filtre. Montant d'une fiche = budget total s'il existe, sinon budget maximal.
- **Étiquettes des filtres actifs** au-dessus de la liste, chacune retirable d'une croix, plus « Effacer tout ».
- **Statut à quatre valeurs** : ouvert, bientôt clôturé (30 jours ou moins), clôturé, date non précisée, calculé à
  partir de la date de clôture ; pastille de statut sur chaque carte.
- **Filtres dans l'adresse de la page** : une recherche se partage par son lien ; bouton « Copier le lien ».
- **« Initialiser à mon profil »** pour un porteur connecté : territoire de sa région. Pourquoi seulement la région
  pour l'instant : c'est le seul champ du profil comparable à un champ des fiches aujourd'hui ; les autres viendront
  avec le second groupe.
- **Appels nationaux inclus** quand un territoire est choisi : un appel ouvert à toute la France est éligible dans
  chaque région. Pourquoi : le filtre « Normandie » cachait jusqu'ici les appels nationaux, ce qui trompe un porteur.
- **Fiches consultées** : onglet « Consultées » listant les dernières fiches ouvertes sur ce poste (mémoire du
  navigateur, vingt au plus). Pourquoi le navigateur et non la base : simple commodité d'un poste, pas une donnée du
  compte.
- **Hors périmètre** : nouveaux champs d'extraction (second groupe), filtre par département, champ de recherche dans
  la liste des financeurs, pagination.

## Capabilities

### New Capabilities

- `recherche-guidee` : compteur, étiquettes, statut, adresse partageable, initialisation au profil, fiches consultées.

### Modified Capabilities

- `consultation-aap-scrapes` : le filtre Territoire inclut les appels nationaux.

## Impact

- Code : `utils/recherche.ts` et son test (fonctions pures), `pages/porteur/SearchAapPage.tsx`,
  `pages/porteur/AapDetailPage.tsx` (une ligne : mémoriser la fiche consultée).
- Données : aucune écriture. Coût : zéro euro.
