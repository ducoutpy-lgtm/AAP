# Proposal

## Why

Pendant le pilote (28 octobre au 11 novembre), la veille du lundi n'est jamais allée au bout : le 2 novembre rien
n'a été écrit après le démarrage ; le 9 novembre elle a été interrompue pendant la collecte (code -1073741510, arrêt par
fermeture de la fenêtre ou Ctrl+C, `scraping/logs/veille.log`). Même complète, elle s'arrêtait à un devis : extraction,
contrôle, qualification et import attendaient une séance. Monsieur DUCOUT a rendu permanente le 2026-11-13 une
délégation : jusqu'à 0,50 euro par semaine d'appels Haiku, devis et `--plafond` obligatoires, arrêt avant 4,50 euros de
cumul, import en « à valider », jamais en « validée ». Semaine 1 du plan de quatre semaines.

## What Changes

- `scraping/veille_payante.py` : pour l'extraction, le contrôle et la qualification, devis à blanc écrit dans le
  journal, puis passage réel seulement si le devis tient dans le reste du budget de la semaine (lundi à dimanche) et
  sous 4,50 euros de cumul, avec `--plafond` = cumul + devis ; sinon l'étape et les suivantes attendent son accord, et
  le motif est écrit. Puis import des fiches nouvelles en « à valider ». Pourquoi un enchaîneur en Python et pas dans
  `veille.cmd` : le calcul du budget et la lecture des devis se testent.
- `scripts/import_to_firestore.py --a-valider` : une fiche nouvelle validée par le modèle entre en brouillon
  « proposée » (file « à valider ») ; rejetée et à corriger restent ce qu'elles sont ; les fiches existantes ne sont
  jamais réécrites (règle déjà en place).
- `scraping/veille.cmd` : étape payante dans la délégation, puis courriel du lundi après l'import (question 6,
  « Oui »).
- `scraping/veille_cachee.vbs` : lance la veille sans fenêtre, pour qu'on ne puisse plus la fermer par erreur. La tâche
  planifiée Windows n'est modifiée qu'avec l'accord de Monsieur DUCOUT.
- Hors périmètre : réveil du PC en veille ; lecture des PDF (changement à venir, question 8).

## Capabilities

### Modified Capabilities

- `import-aap-scrapes` : import en « à valider ».

### New Capabilities

- `veille-hebdomadaire` : étapes payantes dans la délégation.

## Impact

- Code : `scraping/veille_payante.py`, `scraping/veille.cmd`, `scraping/veille_cachee.vbs`,
  `scripts/import_to_firestore.py`, tests.
- Coût : au plus 0,50 euro par semaine (devis du 2026-11-13 : 0,07 euro pour 60 textes nouveaux).
