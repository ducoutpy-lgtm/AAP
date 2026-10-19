# Tasks

Décisions de Monsieur DUCOUT du 2026-10-19 (« on le lance », « il faut que tu rédiges tout », « les tests, il faut le
faire », MFA quand tout sera validé). Zéro euro. Règles : aucun `git push`, aucun archivage sans demande, aucun
déploiement Firebase sans accord écrit, la session ne crée aucun compte sur le vrai projet.

## 1. Dégel technique

- [x] 1.1 `App.tsx` : routes d'avant le lot 0 rétablies (plus `/reset-password`) ; `.eslintrc.cjs` et `tsconfig.json`
  sans exclusion de module ; `CalendarPage`, `RecommendationsPage`, `MyAapPage` : date de clôture nulle gérée. Fait
  quand : lint et build verts ; `/signup` affiche le formulaire et `/dashboard/porteur` renvoie vers `/login`, relus par
  la session. (Fait le 2026-10-19 : 26 `any` des pages d'avril typés (`catch (err)` avec `err instanceof Error`,
  collections lues typées `User`, `AAP`, `Application`, profil `PorteurProfile`), convertisseur `utils/dates.ts`,
  règle `exhaustive-deps` coupée pour ces pages (même motif que les commentaires existants) ; lint et build verts ;
  `/signup` : formulaire « Créer un compte » avec choix porteur ou financeur ; `/dashboard/porteur` sans compte :
  redirigé vers `/login` ; `/mentions-legales` : texte affiché.)

## 2. Règles Firestore

- [x] 2.1 `firestore.rules` : écritures des modules rouvertes (design, décision 3), tests émulateur étendus (une règle,
  un test). Fait quand : `npm run test:rules` vert, compte des tests collé. (Fait le 2026-10-19 : `npm run test:rules`
  avec JDK 21 en tête du PATH, « Tests 23 passed (23) » : 13 du lot 0 conservés ou adaptés, 10 nouveaux sur la
  création d'appel par un financeur, les profils, les candidatures, les recherches, favoris, notifications, messages,
  et l'interdiction d'écrire payments et analytics.)
- [ ] 2.2 Déploiement des règles après accord écrit (`firebase deploy --only firestore:rules`), sortie collée.

## 3. Inscription, profils, parcours

- [ ] 3.1 Inscription et profil : `/signup`, `/complete-profile`, essai 14 jours ; relus par la session sans compte
  (formulaires affichés), parcours joué par Monsieur DUCOUT avec un compte de test porteur et un compte financeur.
- [ ] 3.2 Parcours porteur : tableau de bord, candidature à un appel publié, mes candidatures, recherches sauvegardées,
  favoris, recommandations. Fait quand : Monsieur DUCOUT dépose une candidature de test et la retrouve ; erreurs
  rencontrées corrigées une à une et listées ici.
- [ ] 3.3 Espace financeur : tableau de bord, création d'un appel, mes appels, candidatures reçues, évaluation,
  statistiques. Fait quand : Monsieur DUCOUT crée un appel de test, le voit dans la recherche publique une fois publié,
  et évalue la candidature de test.
- [ ] 3.4 Messagerie, notifications, calendrier. Fait quand : un message de test échangé entre les deux comptes, le
  calendrier affiche les échéances des appels publiés.

## 4. Pages légales

- [x] 4.1 `MentionsLegalesPage`, `CguPage`, `ConfidentialitePage` rédigées (ARCADIA SASU, DPO Monsieur DUCOUT, champs
  inconnus `[À VALIDER — Monsieur DUCOUT]`), routes branchées. Fait quand : les trois pages relues par la session, lint
  et build verts. (Fait le 2026-10-19 : `src/pages/legal/` (gabarit `LegalLayout`, données `editeur.ts`), onze champs à
  valider surlignés en jaune : capital, SIREN, adresse, e-mail de contact, hébergeur définitif, région Firebase, grille
  tarifaire, clause de juridiction, durées de conservation, outil de mesure ; `/mentions-legales` relu par la session.)

## 5. Tests

- [ ] 5.1 `npm test` : Vitest, Testing Library, jsdom ; tests de `relecture.ts` et `territoires.ts`, rendu de la carte
  de recherche et de la fiche avec des données en mémoire, rendu des pages légales. Fait quand : compte des tests collé.

## 6. Documentation et vérification

- [ ] 6.1 README de l'application, README racine, CHANGELOG racine, CLAUDE.md (périmètre du MVP, état d'avancement,
  modules gelés retirés), REPRISE.md, `docs/resume_application_web_2026-10.md`, `docs/FEUILLE_DE_ROUTE.md`, rapport
  section 8.
- [ ] 6.2 Monsieur DUCOUT rejoue les scénarios de la spec et lit les pages légales (données d'entreprise à compléter).
