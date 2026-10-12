# Tasks

## 1. Application

- [x] 1.1 `app/src/App.tsx` : routes `/aap/search` et `/aap/:aapId` sans `ProtectedRoute`, `SubscriptionGuard` ni `RoleGuard`. Fait quand : http://localhost:3000/aap/search s'affiche sans connexion (liste vide tant que les règles ne sont pas déployées, sans erreur de redirection).
- [x] 1.2 `app/src/pages/porteur/AapDetailPage.tsx` : boutons « Candidater » et favori visibles pour tout visiteur ; sans compte, renvoi vers `/login` avec l'adresse de retour. Fait quand : le clic non connecté ouvre la connexion et le retour ramène sur la fiche.
- [x] 1.3 `app/src/pages/public/LandingPage.tsx` : lien « Voir les appels à projets » vers `/aap/search`. Fait quand : le lien est visible sans compte.
- [x] 1.4 `npm run build` sans erreur TypeScript. Fait quand : la commande termine sans erreur.

## 2. Règles Firestore

- [x] 2.1 `app/firestore.rules` : lecture de `aap` autorisée si `resource.data.status == 'published'`, conditions actuelles conservées sinon. Fait quand : la règle est relue et le fichier est valide (`firebase deploy --only firestore:rules --dry-run` ou lecture attentive).
- [x] 2.2 Déploiement des règles sur `aapi-11bc3`, après accord explicite de Monsieur DUCOUT : `cd app && firebase deploy --only firestore:rules --project aapi-11bc3`. Fait quand : la console affiche le déploiement réussi et la liste s'affiche sans compte. (Fait le 2026-10-13 : « Deploy complete », 95 AAP visibles sans compte, recherche « Dentobus » et fiche vérifiées dans le navigateur.)

## 3. Documentation et vérification

- [x] 3.1 README racine (section 4 : la démo ne demande plus de compte pour consulter), `CHANGELOG.md`, `CLAUDE.md` (état d'avancement, défauts connus), `REPRISE.md`. Fait quand : fichiers relus.
- [x] 3.2 Vérification par Monsieur DUCOUT, sans compte : liste sur `/aap/search`, recherche « Dentobus », ouverture de la fiche, clic « Candidater » menant à la connexion. Fait quand : validation.

## Workflow follow-up

- Archiver après 3.2 ; le contrôle 3.4 de `extraction-echantillon-aap` (voir les 6 fiches) se fait alors sans compte.
