# candidature-depuis-pdf Specification

## Purpose

Qu'un candidat dépose son dossier PDF et retrouve les champs de la candidature remplis, à relire plutôt qu'à saisir.
Vérifiable par Monsieur DUCOUT avec un dossier réel.

## Requirements

### Requirement: Fonction de lecture du dossier

`preremplirCandidature` SHALL exiger un compte connecté, un identifiant d'appel et un PDF (20 Mo au plus) ; appeler
`claude-haiku-5-5` avec le document et l'outil `candidature` ; renvoyer les champs lus (titre, résumé, montant
demandé, structure, calendrier, confiance, remarque) et le coût ; écrire une ligne dans `coutsIa` ; refuser l'appel
quand le cumul du mois atteint 5 euros ; traduire les erreurs du service en messages lisibles.

#### Scenario: Plafond

- WHEN la somme des coûts du mois dans `coutsIa` atteint 5 euros
- THEN la fonction répond « Plafond mensuel de lecture atteint » sans appeler le modèle.

### Requirement: Pré-remplissage dans le formulaire

L'étape « Votre projet » SHALL proposer « Déposer mon dossier PDF pour pré-remplir » ; pendant la lecture un message
SHALL l'indiquer ; à la réponse, titre, résumé et montant SHALL être remplis (sans écraser une saisie non vide sans
prévenir), la remarque du modèle affichée, et le fichier SHALL être joint d'office à l'étape « Pièces ». Un fichier
qui n'est pas un PDF SHALL être refusé avec un message.

#### Scenario: Dossier lu

- WHEN le candidat dépose un dossier PDF de dix pages
- THEN en moins d'une minute les trois champs se remplissent, la confiance et la remarque s'affichent, et le fichier
  figure dans la liste des pièces.

### Requirement: Coût écrit et plafonné

Le coût supposé par dossier SHALL être écrit dans `proposal.md` et `tasks.md` avant tout appel ; chaque appel réel
SHALL être journalisé dans `coutsIa` avec ses tokens et son coût en euros.

#### Scenario: Journal

- WHEN un dossier a été lu
- THEN `coutsIa` contient une ligne avec le compte, l'appel, les tokens et le coût.

### Requirement: Logique testée

La conversion de la réponse du modèle en champs du formulaire et la vérification du fichier (type, taille) SHALL être
des fonctions testées par Vitest ; le calcul du coût SHALL être une fonction pure de la fonction serveur.
