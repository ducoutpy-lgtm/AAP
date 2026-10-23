---
name: show-me-your-work-web
description: Journal des décisions pour un travail long dans l'application web (une ligne par décision, avec sa preuve), audité contre la conversation, puis remis avec une demande de relecture par un autre modèle.
---

# Montre ton travail (version claude.ai)

Pour un travail que Monsieur DUCOUT relit après coup, un journal des décisions lui permet de retrouver ce qui a été
décidé, pourquoi, et sur quelle preuve, sans relire toute la conversation. Un seul journal par travail, toujours au
même format.

Cette version est adaptée à claude.ai (conversations et Projets). Elle ne peut ni lire l'historique d'une session
Claude Code, ni lancer elle-même un second modèle : l'audit porte sur la conversation en cours, et la relecture
indépendante est préparée pour être faite par Monsieur DUCOUT dans une nouvelle conversation, avec un autre modèle.

## Quand l'utiliser

Quand Monsieur DUCOUT le demande (« montre ton travail », « tiens le journal des décisions »), ou pour un travail en
plusieurs étapes dont il relira le résultat plus tard : analyse de documents, rédaction d'un dossier, calculs, choix
entre plusieurs options.

## Le format

Un tableau à six colonnes, une ligne par décision :

- **ts.** Date et heure (ISO 8601).
- **phase.** L'étape ou le chantier.
- **decision.** Ce qui a été choisi ou fait, en une ligne.
- **why.** La raison, en mots simples.
- **evidence.** Ce qui le prouve, sous forme de pointeur : nom d'un fichier fourni et page ou section, adresse web
  consultée, extrait court d'un message de Monsieur DUCOUT entre guillemets avec sa date, sortie d'un calcul exécuté.
  Jamais un paragraphe.
- **result.** Le résultat ou l'état : `fait`, `vérifié`, `NON CONCLUANT`, `ouvert`, `annulé`.

Écrire chaque ligne comme on le raconterait à un collègue : en français, mots simples, actions concrètes, sans jargon.
Noter les décisions et les points de contrôle, pas chaque action. Une ligne, une décision. Ajout seulement : une
erreur se corrige par une nouvelle ligne qui remplace l'ancienne, jamais en effaçant.

## Où vit le journal

- **Si l'exécution de code est disponible** : tenir le journal dans un fichier `journal_decisions.tsv` (colonnes
  séparées par des tabulations), en ajoutant les lignes avec `scripts/log.sh` :

  ```bash
  bash scripts/log.sh journal_decisions.tsv <phase> <decision> <why> <evidence> <result>
  ```

  Le script horodate la ligne, écrit l'en-tête au premier usage, retire les tabulations et retours à la ligne
  parasites, et neutralise les cellules qu'un tableur prendrait pour une formule. À la fin, proposer le fichier au
  téléchargement.
- **Sinon** : tenir le journal comme un tableau Markdown dans la réponse finale.

Dans un Projet claude.ai, le journal ne passe pas d'une conversation à l'autre : à la fin, rappeler à Monsieur DUCOUT
qu'il peut ajouter le fichier aux connaissances du Projet pour le poursuivre dans une prochaine conversation.

## Auditer le journal contre la conversation

Avant de rendre la main, relire la conversation en cours et vérifier que le journal dit vrai :

- chaque ligne correspond à une action réellement faite dans cette conversation ; retirer les lignes inventées ou
  souhaitées ;
- la preuve de chaque ligne figure dans la conversation (fichier fourni, résultat d'un calcul, message cité) ; sinon,
  écrire `non vérifié` dans le résultat ;
- un choix, un retour en arrière ou une piste abandonnée qui a pesé sur le travail et manque au journal est un trou :
  l'ajouter.

Corriger le journal, pas le récit.

## Préparer la relecture par un autre modèle

Une auto-relecture ne remplace pas un regard neuf. Terminer la réponse par un bloc prêt à copier, que Monsieur DUCOUT
collera dans une NOUVELLE conversation après avoir choisi un AUTRE modèle dans le sélecteur de claude.ai, en y joignant
le journal et les fichiers cités en preuve :

```
Tu relis un journal de décisions produit par un autre modèle. Tu ne refais pas le travail. Pour chaque ligne,
vérifie que la preuve citée existe dans les pièces jointes et montre ce que la ligne affirme. Signale :
les preuves faibles ou absentes, les vérifications affirmées sans trace, les choix risqués après coup
(prématurés, hors du périmètre demandé), les trous qu'une lecture rapide laisserait passer.
Commence par « Relu par : <ton modèle> », puis une liste numérotée renvoyant aux lignes du journal.
« Aucun signalement » est une réponse valable.
```

Pour un travail important (dépense, document envoyé à un tiers, décision difficile à défaire), conseiller plutôt la
version Claude Code du skill (`/show-me-your-work`), qui audite l'historique et lance elle-même la relecture.

## Fin de réponse

Toute réponse d'un travail qui a produit un journal se termine par :

1. le journal (fichier à télécharger ou tableau) ;
2. une section « Points d'attention » qui commence par `Relu par : non relu (relecture à faire dans une nouvelle
   conversation)`, puis liste ce que l'audit a trouvé ;
3. le bloc de relecture prêt à copier ;
4. deux lignes : « Vérifié : ... » et « Non vérifié ou supposé : ... ».

## Origine

Adapté pour claude.ai le 2026-10-23, à la demande de Monsieur DUCOUT (nom sans le mot réservé « claude », refusé à
l'import), de la version Claude Code du dépôt AAP Santé
(`.claude/skills/show-me-your-work/`), elle-même tirée du skill `show-me-your-work` de
https://github.com/lifeofladi/pstack (commit `6f50d7fd1d64e92095009acb056307266a2ec8f7`, licence MIT, copyright 2026
Lauren Tan, fichier `LICENSE`). `scripts/log.sh` et `references/decision-log-template.tsv` sont repris sans
modification.
