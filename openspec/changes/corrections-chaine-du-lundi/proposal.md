# Proposal

## Why

La chaîne du lundi doit tourner seule et sans faute avant la fin de l'abonnement de Monsieur DUCOUT, le 29/11/2026
(consigne relayée par la séance de pilotage le 2026-11-22 : « aap et parti ok »). Cette chaîne comprend la veille de
8 h, l'import, le tri, les courriels et la chaîne des PDF de 23 h. Une relecture en lecture seule (trois relecteurs,
puis un vérificateur chargé de réfuter chaque signalement) a confirmé 10 défauts le 2026-11-21 ; ils sont détaillés
dans `signalements.json`.

## What Changes

Une correction par défaut, chacune précédée d'un test pytest qui échoue :

- limites de durée des tâches : courriels et chiffres avant le modèle local ; au plus 40 textes par veille et 60 PDF par
  nuit ; une limite qui porte sur les textes encore à faire (décision « Ordre des étapes » du 2026-11-22) ;
- tri de la file : seuls les brouillons « Proposée » sont traités, jamais une fiche archivée ou clôturée à la main ;
- import `--a-valider` : les champs d'une fiche validée en base ne sont jamais réécrits ;
- courriel du lundi : fenêtre comptée depuis le dernier envoi réussi ; un échec du bilan de l'administrateur n'empêche
  pas l'envoi aux candidats ;
- défauts moyens et bas : champ « incertain » après un échec, doublons par édition et par transitivité, mention de
  désabonnement, journal muet.

Hors périmètre : la qualité du modèle local, le réglage des tâches Windows (non modifié : décision « Ordre des étapes »)
et tout déploiement. Les règles et l'hébergement ne bougent pas : ce changement ne touche que `scraping/` et `scripts/`.

Coût : zéro euro, sans Ollama (tests seulement).

## Capabilities

### Modified Capabilities

- `veille-autonome` : chaîne du lundi bornée dans le temps et fiable.
