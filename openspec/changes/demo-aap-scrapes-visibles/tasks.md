# Tasks

## 1. Préparation Firebase (Monsieur DUCOUT, guidé pas à pas)

- [ ] 1.1 Vérifier dans la console Firebase que le projet `aapi-11bc3` est actif (Firestore et Authentication visibles). Fait quand : confirmation de Monsieur DUCOUT ; sinon, s'arrêter et basculer sur l'émulateur.
- [ ] 1.2 Créer `app/.env` à partir de `app/.env.example` avec les paramètres web du projet (console > Paramètres du projet > Vos applications). Fait quand : `git status` ne montre pas `app/.env`.
- [ ] 1.3 Générer une clé de compte de service (console > Paramètres > Comptes de service) et l'enregistrer sous `scripts/serviceAccountKey.json`. Fait quand : `git status` ne montre pas le fichier.
- [ ] 1.4 Installer Firebase CLI (`npm install -g firebase-tools`), `firebase login`, puis depuis `app/` : `firebase deploy --only firestore:rules,firestore:indexes`. Fait quand : la console montre l'index `aap (status, publishedAt)` en état « Activé ».

## 2. Import des AAP scrapés

- [ ] 2.1 Installer `firebase-admin` (`pip install -r scripts/requirements.txt`) et lancer l'essai à blanc avec et sans options ; vérifier les compteurs du spec `import-aap-scrapes`. Fait quand : « AAP lus : 105 », ignorés à 0 avec les deux options.
- [ ] 2.2 Lancer l'import réel avec `--include-expired --include-without-deadline`, puis le relancer. Fait quand : premier passage « N créés, 0 mis à jour », second passage « 0 créés, N mis à jour », N visible dans la console Firestore.
- [ ] 2.3 Corriger le script si le premier import réel révèle une erreur (type de date, champ refusé) et documenter la correction dans `scraping/CHANGELOG.md`. Fait quand : 2.2 passe sans erreur.

## 3. Affichage dans l'application

- [ ] 3.1 `cd app && npm install && npm run dev`, inscription d'un compte porteur d'essai par Monsieur DUCOUT, ouverture de « Rechercher des AAP ». Fait quand : la liste affiche des AAP scrapés (financeurs ARS, Fondation de France, CNSA).
- [ ] 3.2 Mention « Clôturé » dans `SearchAapPage.tsx` et `AapDetailPage.tsx` quand la clôture est passée (helper commun), `npm run lint` et `npm run build` sans erreur. Fait quand : un AAP clos affiche « Clôturé », un AAP ouvert affiche « N jours restants ».
- [ ] 3.3 Vérifier la fiche de l'AAP « Contrat d'Allocation d'Études - Campagne 2026 » : description, clôture 16/10/2026, critères, lien source. Fait quand : le lien ouvre la page ARS dans un nouvel onglet.

## 4. Documentation et vérification finale

- [ ] 4.1 README : section « Rejouer la démo de bout en bout » (commandes exactes, ordre, où déposer les secrets) ; CLAUDE.md : lignes « Jonction scraping -> Firestore » et « Démo bout en bout » passées à OK. Fait quand : les deux fichiers sont relus.
- [ ] 4.2 Vérification manuelle par Monsieur DUCOUT : rejouer chaque scénario WHEN / THEN des deux specs et noter OK ou ÉCHEC. Fait quand : tous OK, ou écarts listés pour un changement suivant.

## Workflow follow-up

- Archiver le changement après la vérification 4.2 (mettre à jour le tableau d'avancement du CLAUDE.md).
- Changement suivant possible : relance du scraping (données fraîches, 3 à 5 euros d'API).
