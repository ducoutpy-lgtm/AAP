# Proposal

## Why

Le 2026-10-15, 307 des 308 fiches publiées n'ont été relues par personne ; le lot 1 demande que le visiteur sache ce
qui est relu et que Monsieur DUCOUT valide les fiches, à raison d'une fiche à la fois dans l'outil de validation. À ce
rythme, 308 fiches représentent des jours. Devis calculé sur les textes réels (2 708 caractères par page en moyenne) :
un contrôle de chaque fiche par `claude-haiku-5-5` coûte 0,03 centime par fiche, soit 0,10 euro pour les fiches
publiées. Monsieur DUCOUT a accepté (« 1 ok ») à condition que la mention « relue » reste réservée à ses verdicts.

## What Changes

- Outil `scraping/verification.py` : pour chaque fiche publiable (champ santé, médico-social ou incertain, encore
  ouverte), le modèle relit la fiche à côté du texte de sa page et donne un verdict par champ (titre, financeur,
  dates, montants, territoire, description) : juste, faux (avec la valeur lue sur la page), fabriqué (valeur absente de
  la page), manquant (valeur oubliée), vide, incertain ; il dit aussi si la page décrit bien un appel précis. Essai à
  blanc avec coût estimé, plafond cumulé, écriture après chaque fiche dans `scrape_metadata.verification`, sauvegarde,
  rapport `VERIFICATION.md` (verdicts par champ, part douteuse par source, liste des fiches douteuses).
- `extractor.py` : outil `verification` et fonction `verifier_fiche`, journal des coûts (étape `verification`).
- Outil de validation (`validation.py --fiches`) : les fiches douteuses passent en tête et l'écran affiche les champs
  douteux avec la valeur lue sur la page, sous la mention « ce contrôle ne remplace pas votre verdict ».
- Import : résumé du contrôle dans `scrapeMetadata.verification` (modèle, date, champs douteux) ; aucune règle de
  publication ni de statut ne change, `validation.statut` reste la seule source de fiabilité.

## Capabilities

### New Capabilities

- `verification-fiches` : contrôle des fiches par le modèle, ordre de relecture, résumé dans la base.

## Impact

- Nouveaux : `scraping/verification.py`, `scraping/tests/test_verification.py`, `scraping/VERIFICATION.md`.
- Modifiés : `scraping/extractor.py`, `scraping/validation.py`, `scripts/import_to_firestore.py` et ses tests,
  `app/src/types/index.ts` (champ optionnel dans `scrapeMetadata`).
- Coût : 0,10 euro estimé pour les fiches publiées, plafond cumulé 5 euros, coût réel lu dans le journal.

## Hors périmètre

- Toute correction automatique des fiches ; tout changement de la mention « relue » ou des statuts.
