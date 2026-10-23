---
name: show-me-your-work
description: "Tenir un journal des décisions relisible pour un travail long ou mené sans surveillance : un fichier TSV, une ligne par décision (quoi, pourquoi, preuve, résultat), audité contre l'historique de la session puis relu par un autre modèle. Local par défaut. Pour /show-me-your-work, les travaux en plusieurs étapes, ou ce que Monsieur DUCOUT relit après coup."
disable-model-invocation: true
---

# Montre ton travail

Pour un travail que Monsieur DUCOUT relit après coup, un journal des décisions lui permet de retrouver ce qui a été
décidé, pourquoi, et sur quelle preuve, sans refaire le travail ni lire tout l'historique de la session. Un seul
journal par travail, toujours au même format, pour qu'une session suivante le retrouve.

Ce journal complète la règle « Preuve avant affirmation » du projet (CLAUDE.md) : il ne remplace pas les deux lignes
« Vérifié » et « Non vérifié ou supposé » de chaque compte rendu.

## Le format

Un fichier TSV (colonnes séparées par des tabulations), une ligne par décision. Pourquoi TSV : GitHub l'affiche en
tableau triable, un tableur l'ouvre directement, et une ligne s'ajoute en une commande. Chaque cellule tient sur une
ligne. La preuve est un pointeur, pas un paragraphe.

Copier `references/decision-log-template.tsv` (la ligne d'en-tête) pour démarrer un journal vide. Colonnes :

- **ts.** Date et heure ISO 8601. L'axe du temps.
- **phase.** L'étape ou le chantier (registre, découverte, extraction, application, mise en ligne...).
- **decision.** Ce qui a été choisi ou fait, en une ligne.
- **why.** La raison, en mots simples. Si une règle du projet l'a dictée, la dire en clair (« coût écrit et accepté
  avant l'appel »), pas en jargon.
- **evidence.** Un lien ou un chemin qui le prouve : empreinte de commit, `fichier:ligne`, fichier de sauvegarde,
  sortie de commande enregistrée, capture. Jamais un paragraphe.
- **result.** Le résultat ou l'état : `tests verts`, `annulé`, `0 incohérence`, `NON CONCLUANT`, `ouvert`.

Exemple, à titre d'illustration seulement (ne pas recopier ces lignes dans un vrai journal) :

```
ts	phase	decision	why	evidence	result
2026-10-21T10:04:41Z	registre	adresse ANR posée sur la page des appels en cours	la découverte avait gardé l'archive des appels clos	commit 0f77d69	17 liens, PEPR PROPSY trouvé
2026-10-21T16:07:38Z	application	tableau de bord financeur relu sur les émulateurs avant de le livrer	un parcours connecté se joue d'abord sur les émulateurs	docs/DEMO_FINANCEUR.md	7 étapes sur 9 lues, 2 laissées à Monsieur DUCOUT
```

## Écrire une ligne

Écrire chaque ligne comme on raconterait à un collègue ce qu'on a fait : en français, mots simples, actions
concrètes, sans formules creuses ni jargon. Monsieur DUCOUT doit comprendre chaque ligne sans la décoder.

Utiliser l'outil fourni pour que les lignes restent bien formées (sous Windows, par l'outil Bash, qui est Git Bash) :

```bash
bash .claude/skills/show-me-your-work/scripts/log.sh <journal> <phase> <decision> <why> <evidence> <result>
```

Il horodate la ligne, écrit l'en-tête au premier usage, retire les tabulations et retours à la ligne parasites, et
préfixe d'une apostrophe toute cellule qui commence par `=`, `+`, `-` ou `@`, pour qu'un tableur n'exécute pas une
formule à l'ouverture du fichier. Un journal reconstitué après coup peut porter la date réelle de chaque décision
(date du commit) plutôt que l'heure d'écriture : appliquer alors le même nettoyage des cellules.

Noter les décisions et les points de contrôle, pas chaque action : un choix entre deux voies, une étape terminée avec
sa vérification, un retour en arrière et sa cause, un blocage, une correction. Pour une boucle, une ligne par tour.
Laisser de côté le trivial et l'évident.

## Où il vit

Par défaut, le journal est un document de travail, pas un fichier versionné : `.audit/<date>_<sujet>.tsv` à la racine
du dépôt (dossier ignoré par Git). La plupart des travaux n'ont pas besoin d'une trace versionnée ; le journal local
garde quand même le travail honnête et peut être jeté ensuite.

Le versionner seulement si le travail est assez lourd pour que la confiance doive être montrée plutôt que supposée :
migration de la base, ré-import global, passage d'extraction payant, mise en ligne.

## Règles

- Une ligne, une décision ou un point de contrôle. Si elle ne tient pas sur une ligne, la décision n'est pas encore nette.
- Ajout seulement. Une erreur se corrige par une nouvelle ligne qui remplace l'ancienne. Ne jamais modifier ni effacer.
- Préférer une preuve produite par un script versionné (test, essai à blanc, rapport) à une manipulation ponctuelle,
  pour que Monsieur DUCOUT puisse la rejouer.

## Auditer le journal contre l'historique de la session

À la fin du travail, avant de rendre la main, vérifier que le journal dit vrai. Chez Claude Code, l'historique de la
session est un fichier `.jsonl` dans `~/.claude/projects/<dossier du projet>/` (pour AAP Santé :
`~/.claude/projects/C--Users-pierr-Documents-Projets-Claude-Code-AAP/`) ; la session en cours est le fichier modifié le
plus récemment. Ne jamais ouvrir les dossiers des autres projets : ils contiennent des conversations sans rapport.

Ces fichiers pèsent des dizaines de mégaoctets : ne jamais les lire en entier. Chercher dedans, ligne par ligne du
journal, la trace de ce qu'elle affirme (empreinte de commit, nom de fichier, sortie de commande citée), avec `grep -c`
ou `grep -o` bornés.

- Chaque ligne correspond à une action réelle. Retirer les lignes inventées ou souhaitées.
- La preuve de chaque ligne existe et montre ce que la ligne affirme (`git show --stat <empreinte>`, fichier présent).
- Un choix, un retour en arrière ou une piste abandonnée qui a pesé sur le travail et manque au journal est un trou :
  l'ajouter.
- Retirer le remplissage. Une ligne que personne ne contrôlerait n'a pas sa place.

Corriger le journal, pas le récit. Si le travail a divergé de ce qu'une ligne affirme, c'est la ligne qui est fausse.

## Relecture par un autre modèle

Avant de rendre la main, lancer un sous-agent (outil Agent) sur un autre modèle que celui qui a fait le travail.
Chez Claude Code, les sous-agents sont tous des modèles Claude : choisir un modèle différent avec le paramètre `model`
(par exemple `sonnet` si le travail a été fait par Opus ou Fable, `opus` s'il a été fait par Sonnet). Un sous-agent part
d'un contexte vierge : c'est ce regard neuf qui compte, pas seulement le changement de modèle. L'auto-relecture ne
suffit pas.

Lui donner le chemin du journal, l'emplacement de l'historique et la consigne de ne pas le lire en entier. Il lit le
journal et les preuves, puis signale ce à quoi Monsieur DUCOUT doit faire attention. Il ne refait pas le travail :

- décisions notées avec une preuve faible ou absente ;
- vérifications sautées, ou affirmées sans trace dans l'historique ;
- choix qui paraissent risqués après coup (prématurés, hors du périmètre demandé, qui masquent un symptôme) ;
- trous qu'une lecture rapide laisserait passer.

Tout compte rendu d'un travail qui a produit un journal se termine par une section « Points d'attention », avant les
lignes « Vérifié » et « Non vérifié ou supposé ». Elle commence par `Relu par : <modèle>` sur sa propre ligne, puis
liste chaque signalement en renvoyant à des lignes ou à des moments précis. « Aucun signalement » est une réponse
valable ; le nom du modèle, lui, est obligatoire.

Cette relecture consomme des jetons : la lancer une fois par travail, à la fin, pas à chaque ligne.

## Relire le journal

Lire de haut en bas, suivre les pointeurs de preuve, vérifier par sondage. GitHub affiche un TSV versionné en
tableau ; dans un terminal, `column -s$'\t' -t .audit/<fichier>.tsv`. Une ligne dont la preuve ne mène nulle part,
ou dont le résultat n'est pas vérifié, est un trou que l'audit vient de trouver.

## Combiner avec les autres skills

Les autres skills du projet (OpenSpec notamment) peuvent renvoyer leur trace ici plutôt que d'en inventer une : le
citer par son nom et le laisser porter le format, sans recopier les colonnes.

## Origine et adaptation

- Source : skill `show-me-your-work` du dépôt https://github.com/lifeofladi/pstack, version figée au commit
  `6f50d7fd1d64e92095009acb056307266a2ec8f7` (27 août 2026), licence MIT (copyright 2026 Lauren Tan, fichier `LICENSE`).
  Texte d'origine conservé dans `SKILL.original.md` pour comparaison.
- Fichiers repris sans modification : `scripts/log.sh` (empreinte SHA-256
  `1601bc18f9aba0af3f5d6375e4f2d5dc6102334d1bca935026c0e3547cdadbbf`), `references/decision-log-template.tsv`.
- Adaptations du 2026-10-23, demandées par Monsieur DUCOUT (« copie-le et adapte-le à Claude Code ») : texte traduit en
  français ; emplacement de l'historique propre à Claude Code (au lieu du dossier `agent-transcripts/` de Cursor) et
  recherche ciblée au lieu d'une lecture intégrale ; relecture par un autre modèle Claude (les sous-agents de Claude Code
  n'offrent pas d'autre famille de modèles) ; renvois aux skills `unslop` et `encode-lessons-in-structure`, absents
  ici, remplacés par la règle en clair ; journal rangé dans `.audit/`, ignoré par Git ; lien avec la règle « Preuve avant
  affirmation » du projet.
- Contenu contrôlé avant copie : aucun caractère invisible, aucune commande réseau ni suppression dans le script.
