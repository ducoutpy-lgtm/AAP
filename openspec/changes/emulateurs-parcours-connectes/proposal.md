# Proposal

## Why

La session ne se connecte jamais au vrai projet Firebase (règle du 2026-10-19). Résultat, constaté le 2026-10-20 :
chaque page connectée n'est vérifiée que par Monsieur DUCOUT, qui perd son temps à jouer des parcours que la session
devrait avoir joués (« pourquoi c'est moi qui le fais ? »). Décision : « oui émulateurs ».

## What Changes

- **Mode « émulateurs » de l'application** : `npm run dev:emulateurs` (port 3001, fichier `.env.emulateurs` sans
  secret, projet factice `demo-aap`) branché sur les émulateurs Firebase du PC (comptes, base, stockage), déjà
  installés pour les tests de règles. `app/emulateurs_dev.cmd` démarre tout pour Monsieur DUCOUT.
- **Comptes et données de test** : `scripts/semer_emulateurs.py` crée un candidat, un financeur, un administrateur
  (mots de passe de test écrits dans le script, valables sur ce PC seulement) et importe un échantillon d'appels par
  l'import habituel dirigé vers l'émulateur (`--projet demo-aap`, nouvelle option).
- **Usage** : la session joue chaque parcours connecté sur `http://localhost:3001` avant de le livrer, captures et
  constats dans `tasks.md` du changement concerné. Le vrai projet reste réservé aux vérifications de Monsieur DUCOUT.
- **Hors périmètre** : fonctions serveur et Stripe (non émulés), e-mails.

## Capabilities

### New Capabilities

- `emulateurs-parcours-connectes` : environnement local complet pour jouer les parcours connectés.

## Impact

- Code : `app/.env.emulateurs`, `app/package.json` (deux scripts), `app/emulateurs_dev.cmd`, `.claude/launch.json`
  (configuration `app-emulateurs`), `scripts/semer_emulateurs.py`, `scripts/import_to_firestore.py` (`--projet`).
- Données : aucune écriture sur le vrai projet (variables d'environnement d'émulateur posées avant tout import
  Firebase, identifiant de projet `demo-aap`). Coût : zéro euro.
