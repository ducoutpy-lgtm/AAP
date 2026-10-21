# Tasks

Jour 5 du plan MVP. Règles : coût supposé écrit et accepté avant tout appel au modèle ; aucun `git push`, aucun
archivage sans demande ; déploiement de la fonction après accord ; la clé Anthropic n'est jamais affichée.

Coût supposé (écrit avant tout appel) : `claude-haiku-5-5`, 0,10 dollar le million de tokens en entrée, 0,50 en
sortie ; un PDF vaut 1 500 à 3 000 tokens par page ; dossier de 20 pages : 0,006 euro ; de 60 pages : 0,02 euro ;
tests de la session : 0,03 euro au plus ; plafond mensuel de la fonction : 5 euros.

- [ ] 5.1 Fonction `preremplirCandidature`, dépendance, export, compilation (`npm run build` dans `functions/`) ;
  `utils/prefill.ts` et test ; formulaire (bouton, lecture, pré-remplissage, pièce jointe) ; règle `coutsIa` ;
  `.secret.local` pour les émulateurs. Fait quand : build des fonctions, `npm test`, lint, build verts.
- [ ] 5.2 Accord de Monsieur DUCOUT sur le coût, puis essai sur les émulateurs (fonction émulée, un PDF de test) :
  champs remplis, ligne `coutsIa`, coût réel collé ici.
- [ ] 5.3 Accord, secret `ANTHROPIC_API_KEY` posé par Monsieur DUCOUT (`firebase functions:secrets:set`), déploiement
  `firebase deploy --only functions:preremplirCandidature`, essai sur le vrai projet.
- [ ] 5.4 Documentation (`docs/resume_application_web_2026-10.md`, `app/README.md`, `CHANGELOG.md`, `CLAUDE.md`,
  `REPRISE.md`, `docs/PLAN_MVP_2026-10-20.md`).
- [ ] 5.5 Monsieur DUCOUT dépose un vrai dossier : au moins quatre champs sur six justes sans retouche.
