# Proposal

## Why

`docs/DOUBLONS.md` (2026-10-28) propose de rejeter l'« Axe 3 » du Pas-de-Calais comme doublon de l'« Axe 5 » : même
financeur, même date de clôture, mots du titre proches. Ce sont deux appels distincts de la même conférence des
financeurs. Monsieur DUCOUT a demandé le 2026-11-13 (question 7, « Oui, les deux ») de corriger le rapprochement avant
que la session rejette les doublons (question 3 bis), et d'adapter un ancien test en échec (question 3 ter).

## What Changes

- `doublons.meme_appel` : deux fiches dont les titres portent chacun un numéro d'axe, de lot ou de volet différent
  (« Axe 3 », « Axe 5 ») ne sont jamais rapprochées, quelles que soient la date et les mots communs. Pourquoi une règle
  et pas un appel au modèle : le numéro est écrit dans le titre, une expression régulière suffit ; zéro euro.
- Test `test_six_orthographes_un_financeur_nom_extrait_conserve` : le nom « Département du Rhône » est désormais
  rattaché par le registre (famille des collectivités) ; le test prend un nom vraiment inconnu, ce qu'il voulait
  vérifier depuis le début.
- `docs/DOUBLONS.md` régénéré (lecture seule de la base).
- Hors périmètre : le rejet des doublons en base (question 3 bis), fait ensuite, après sauvegarde et accord de Monsieur
  DUCOUT dans la conversation.

## Capabilities

### Modified Capabilities

- `import-aap-scrapes` : rapport des doublons, axes distincts.

## Impact

- Code : `scripts/doublons.py`, `scripts/tests/test_import_to_firestore.py`.
- Données : aucune écriture en base ; `docs/DOUBLONS.md` régénéré.
- Coût : zéro euro.
