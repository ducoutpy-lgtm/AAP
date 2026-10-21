# Proposal

## Why

Jour 5 du plan MVP. Retour de Monsieur DUCOUT du 2026-10-20 : « pourquoi est-ce que j'ai pas un outil sur lequel je
mets un gros PDF, l'outil il va lire le PDF et me remplir tous les champs ? L'objectif, c'est de gagner du temps. » Le
formulaire de candidature a été réduit à trois étapes ; il reste à le remplir depuis le dossier du candidat.

## What Changes

- **Fonction serveur `preremplirCandidature`** (Cloud Functions, région europe-west1) : reçoit le PDF du candidat et
  l'appel visé, l'envoie au modèle `claude-haiku-5-5` comme document avec un outil à champs fermés (titre, résumé,
  montant demandé, structure, calendrier, confiance, ce qui manque), journalise le coût dans `coutsIa`, refuse quand
  le cumul du mois atteint 5 euros. Pourquoi une fonction : la clé Anthropic reste sur le serveur ; pourquoi Haiku :
  décision du 2026-10-19 (plafond 5 euros).
- **Formulaire** : à l'étape « Votre projet », un bouton « Déposer mon dossier PDF pour pré-remplir » ; le fichier est
  lu, les champs se remplissent, le candidat relit et corrige ; le fichier est déjà joint à l'étape « Pièces ».
- **Coût supposé par dossier** (écrit avant tout appel) : un PDF compte environ 1 500 à 3 000 tokens par page ; à
  0,10 dollar le million en entrée et 0,50 en sortie, un dossier de 20 pages revient à 0,006 euro environ, un dossier
  de 60 pages à 0,02 euro. Les tests de la session : deux à trois appels, 0,03 euro au plus. Plafond mensuel de la
  fonction : 5 euros.
- **Hors périmètre** : fichiers Word (le modèle lit le PDF seulement : message demandant un PDF), lecture des pièces
  demandées par le financeur, déploiement des autres fonctions (Stripe, alertes : seule `preremplirCandidature` est
  déployée).

## Capabilities

### New Capabilities

- `candidature-depuis-pdf` : pré-remplissage de la candidature par lecture du dossier.

## Impact

- Code : `app/functions/src/ia/preremplirCandidature.ts`, `functions/package.json` (`@anthropic-ai/sdk`, Node 20),
  `functions/src/index.ts`, `app/src/pages/porteur/ApplicationFormPage.tsx`, `app/src/utils/prefill.ts` et test,
  `firestore.rules` (collection `coutsIa` : lecture administrateur, écriture par le serveur seulement).
- Secrets : `ANTHROPIC_API_KEY` en secret Cloud Functions (saisi par Monsieur DUCOUT par `firebase functions:secrets:set`),
  copie locale `functions/.secret.local` pour les émulateurs (ignorée par Git).
- Déploiement : `firebase deploy --only functions:preremplirCandidature` après accord (première fonction déployée ;
  forfait Blaze actif).
- Coût : voir ci-dessus ; journal dans `coutsIa`, visible de l'administrateur.
