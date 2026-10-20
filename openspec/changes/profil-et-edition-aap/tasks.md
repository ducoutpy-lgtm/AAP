# Tasks

Décision de Monsieur DUCOUT du 2026-10-20 (« on peut continuer sur l'appli »). Zéro euro. Règles : aucun `git push`,
aucun archivage sans demande, aucun déploiement, la session ne crée aucun compte sur le vrai projet.

## 1. Fonctions pures et tests

- [x] 1.1 `pages/financeur/aapFormulaire.ts` (`FORMULAIRE_VIDE`, `formulaireDepuisAap`, `donneesDepuisFormulaire`) et
  `pages/profile/profilFormulaire.ts` (`formulairePorteurDepuisProfil`, `formulaireFinanceurDepuisProfil`), tests
  Vitest de l'aller-retour. Fait quand : `npm test` vert, compte collé. (Fait le 2026-10-20 : `npm test` « Tests 18
  passed (18) », 12 avant, 4 tests appel et 2 tests profil ajoutés.)

## 2. Modifier un appel

- [x] 2.1 `CreateAapPage` : propriété `aapExistant`, état initial depuis `formulaireDepuisAap`, sauvegarde et
  publication par `updateAap` (+ `publishAap` si brouillon), titre « Modifier l'appel à projets », retour vers la fiche ;
  `EditAapPage` (chargement, vérification de l'auteur, message sinon) ; route `/aap/:aapId/edit`. Fait quand : lint et
  build verts ; `/aap/x/edit` sans compte redirige vers `/login` (relu par la session). (Fait le 2026-10-20 : lint sans
  avertissement, build « 2265 modules transformed », `/aap/xyz/edit` sans compte -> `/login` « Connexion », aucune
  erreur console.)

## 3. Mon profil

- [x] 3.1 `CompletePorteurProfile` et `CompleteFinanceurProfile` : propriété `profilExistant` (pré-remplissage, bouton
  « Enregistrer », message « Profil enregistré », pas de redirection, logo conservé) ; `ProfilPage` (en-tête du compte,
  chargement du profil, renvoi vers `/complete-profile` si jamais complété) ; route `/profil`. Fait quand : lint et
  build verts ; `/profil` sans compte redirige vers `/login` (relu par la session). (Fait le 2026-10-20 : `/profil` sans
  compte -> `/login`, aucune erreur console ; message « Profil enregistré » en vert, logo du financeur conservé.)

## 4. Documentation et vérification

- [x] 4.1 `docs/resume_application_web_2026-10.md` (pages vides restantes : paiements et paramètres), README de
  l'application, CHANGELOG racine, CLAUDE.md (état d'avancement « pages placeholder »), REPRISE.md.
- [ ] 4.2 Monsieur DUCOUT rejoue les scénarios de la spec avec ses deux comptes de test ; erreurs rencontrées listées ici.
