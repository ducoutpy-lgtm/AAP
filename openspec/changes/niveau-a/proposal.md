# Proposal

## Why

Audit en lecture seule du 2026-11-24, demandé par Monsieur DUCOUT : six auditeurs, puis contestation de chaque
problème P0 ou P1. Note actuelle : 11/20 (fonctionnel 12, code 11, tests 12, sécurité 9, UX 11, documentation 9).
Une faille P0 est confirmée : le courriel du lundi servait de relais d'envoi depuis la boîte officielle, vers une
adresse et avec un texte choisis par le compte. Le détail est dans `audit.json` (rapports des six domaines et verdicts
des vérificateurs).

Décisions de Monsieur DUCOUT du 2026-11-24, données par une question à boutons :

- tout le plan, failles d'abord ;
- validation par un administrateur avant la publication d'un appel saisi par un financeur (revient sur la décision du
  2026-10-20, « saisie à la main = visible ») ;
- bouton favori branché ;
- écran « Abonnement » gardé, avec la mention « paiement bientôt disponible ».

## What Changes

Quatre lots, une correction à la fois, chacune précédée d'un test qui échoue, puis un commit local par lot :

1. sécurité : destinataire du courriel vérifié, profil limité à ses champs de parcours, validation des appels de
   financeurs, formulaire de contact borné, liens sûrs, messagerie, dépendances vulnérables et inutilisées ;
2. chaîne du lundi : courriels en tête de veille, reprise des textes en échec, écritures JSON sans fichier coupé,
   journal des coûts à chemin fixe, chaîne des PDF qui rend compte de sa fin, import qui ne touche plus aux compteurs ni
   aux corrections, scripts d'écriture à blanc par défaut ;
3. application : messages d'erreur compréhensibles, menu sur téléphone, accessibilité, fiches non visibles fermées,
   saisie contrôlée, connexion qui attend le profil, chargement découpé, favori, page 404 ;
4. outillage, tests, documentation : ruff et mypy, Prettier, tests des pages clés, README et specs à jour.

Hors périmètre : paiement et fonctions serveur (facturation Blaze), questions 35 à 42 de `docs/A_VALIDER.md`. Aucune
mise en ligne ni poussée sans question à part, posée à la fin.

Coût : zéro euro.

## Capabilities

### Modified Capabilities

- `fiabilite-parcours`, `veille-autonome`, `consultation-aap-scrapes`.
