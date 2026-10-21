# Proposal

## Why

Le 2026-10-21, le contrôle des vingt sites de Monsieur DUCOUT a montré trois sources inscrites mais jamais lues par la
veille parce que la découverte ne reconnaît que des mots-clés français dans le texte ou l'adresse d'un lien :
HaDEA (EU4Health : 25 appels « calls for proposals » en anglais, 0 retenu), le point de contact national Horizon Europe
(sujets « HORIZON-HLTH-2027-... », 0 retenu) et le portail appelsprojetsrecherche.fr (liens « Lire la suite » vers
`/appel/<id>`, 0 retenu). Décision de Monsieur DUCOUT : « améliorer les mots-clés, c'est-à-dire en ajouter ».

## What Changes

- Ajout de mots-clés anglais à la liste `MOTS` de `decouverte.py` (« call for proposals », « calls for proposals »,
  « call-for-proposal », « calls-proposals », « funding opportunities », « grant ») et de codes de programmes européens
  (« horizon-hlth », « eu4h »).
- Ajout des jetons d'adresse « appel », « appels », « call », « calls » à `TOKENS` : un lien dont l'adresse contient
  `/appel/` ou `/call/` compte comme un appel même si son texte est « Lire la suite ». Pourquoi des jetons d'adresse :
  les portails génèrent des libellés génériques, mais leurs adresses sont parlantes.
- Les seuils (deux liens pour une rubrique) et la qualification des sources sont inchangés : un mot-clé de plus ne fait
  que proposer une page, la qualification et la relecture tranchent toujours.
- Hors périmètre : pages dynamiques sans liens (portail Funding and Tenders), sites qui refusent le robot (info.gouv.fr),
  déroulement des boutons « Afficher plus ».

## Capabilities

### Modified Capabilities

- `decouverte-rubriques-aap` : la notation des liens SHALL reconnaître les libellés anglais et les adresses `/appel/`,
  `/call/`.

## Impact

- Code : `scraping/decouverte.py` (deux listes), `scraping/tests/test_decouverte.py` (un test).
- Coût : zéro euro. Redécouverte des trois sources comme preuve.
