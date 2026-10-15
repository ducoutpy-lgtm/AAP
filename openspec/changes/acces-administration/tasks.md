# Tasks

Demande de Monsieur DUCOUT du 2026-10-15 (« le lien http://localhost:3000/admin ne fonctionne pas, fais ce qu'il faut »).
Règle « Preuve avant affirmation ». Aucun mot de passe saisi par la session ; le compte est créé par Monsieur DUCOUT
lui-même avec le script.

## 1. Accès

- [x] 1.1 `scripts/creer_admin.py` : essai à blanc, création ou promotion idempotente, fonction pure `profil_admin`
  testée. Fait quand : pytest scripts vert ; essai à blanc collé. (Fait le 2026-10-15 : pytest scripts 22 verts dont
  `test_profil_admin_impose_le_role_et_garde_le_reste` ; essai à blanc : « Aucun compte Firebase Auth pour l'adresse de
  Monsieur DUCOUT : il sera cree sans mot de passe ; Profil users existant : aucun ; Apres : role « admin », profil
  complet, pas d'essai ni d'abonnement ; Essai a blanc : rien n'a ete ecrit ». Constats préalables : fournisseur Google
  désactivé dans Firebase, connexion e-mail et mot de passe activée, domaines autorisés localhost et firebaseapp.)
- [x] 1.2 Page `/reset-password` et route publique ; lint et build verts ; page relue dans le navigateur. (Fait le
  2026-10-15 : lint et build verts ; page ouverte dans le navigateur de la session : titre « Mot de passe oublié », un
  champ, bouton « Envoyer le lien », aucune erreur de console.)
- [x] 1.3 Monsieur DUCOUT lance le script, demande l'e-mail de réinitialisation, choisit son mot de passe, se connecte
  et ouvre `/admin`. Fait quand : il confirme voir le tableau de bord. (Fait le 2026-10-15 à 10 h 30 : « ça y est je suis
  connecté je vois l'admin ».)

## 2. Suivi de la validation (instruction 12)

- [ ] 2.1 `ManageAAPsPage.tsx` : compteurs et filtre par `validation.statut` (proposee, a_corriger, validee,
  rejetee), affichage de `validation.commentaire`. Fait quand : lint et build verts, compteurs égaux à ceux de la
  base (mesure en lecture seule collée).

## 3. Documentation et vérification

- [ ] 3.1 README de l'application, CHANGELOG racine, CLAUDE.md, REPRISE.md, rapport section 8. Fait quand : relus.
- [ ] 3.2 Monsieur DUCOUT rejoue les scénarios de la spec.
