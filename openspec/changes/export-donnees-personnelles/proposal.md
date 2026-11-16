# Proposal

## Why

Semaine 4 du plan (« droits RGPD »). La page Confidentialité (`app/src/pages/legal/ConfidentialitePage.tsx`, section
« Vos droits ») annonce les droits d'accès et de portabilité, exercés aujourd'hui seulement par courriel au DPO
(Monsieur DUCOUT, contact@arcadiaco.fr). Un compte doit pouvoir obtenir lui-même une copie de ses données, dans un format
lisible par une machine (RGPD, articles 15 et 20).

## What Changes

- Sur `/profil`, carte « Mes données personnelles » : bouton « Télécharger mes données » qui produit un fichier JSON
  `mes-donnees-aap-sante-AAAA-MM-JJ.json`, construit dans le navigateur. Pourquoi dans le navigateur : les fonctions
  serveur ne sont pas déployées (facturation Blaze non ouverte) ; les règles Firestore laissent déjà chaque compte lire
  ses propres documents.
- Contenu : compte de connexion (adresse, date de création, dernière connexion, fournisseurs), document `users`, profil
  de structure, candidatures déposées, recherches sauvegardées, favoris, notifications, messages envoyés et reçus,
  paiements, appels publiés par un financeur. Chaque partie illisible est notée « non lue » avec le motif, sans arrêter
  l'export. Les dates sont écrites en ISO 8601.
- Ce que le compte ne lit pas (journal des actions, retours de test, messages du formulaire de contact) est annoncé dans
  le fichier et à l'écran : communiqué sur demande au DPO. Pourquoi : les règles du chantier `suivi-testeurs` réservent ces
  collections à l'administrateur, choix validé que ce changement ne remet pas en cause.
- Page Confidentialité : une phrase renvoie au bouton.
- Suppression du compte en libre-service : hors périmètre, décision demandée (question 25 de `docs/A_VALIDER.md`) car elle
  touche aux candidatures vues par les financeurs et à la durée de conservation.
- Aucune règle Firestore modifiée, aucun coût.

## Capabilities

### New Capabilities

- `droits-rgpd` : export des données personnelles en libre-service.
