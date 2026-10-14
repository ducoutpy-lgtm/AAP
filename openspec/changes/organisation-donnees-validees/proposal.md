# Proposal

## Why

L'audit du 2026-10-14 (`docs/AUDIT_DONNEES_2026-10-14.md`) a montré trois risques d'écrasement de décisions
humaines : l'import réécrit tous les champs d'un document Firestore existant, dont le statut (une fiche
archivée par Monsieur DUCOUT redevient publiée au lot suivant) ; les verdicts donnés sur les fiches
(`results/validation_manuelle.json`) ne sont lus par aucun outil ; dans le registre, l'adresse corrigée à
l'écran remplace l'adresse d'origine sans marque. S'y ajoute une clé de dédoublonnage calculée sur le texte
produit par l'IA, qui crée des doublons entre moteurs (cas ESMS Numérique 2026).

Décisions de Monsieur DUCOUT (2026-10-14) : une fiche jugée « pas un appel » est archivée, pas supprimée ;
l'identifiant des documents change maintenant, tant qu'il n'y a pas d'utilisateur ; les fiches sans date de
clôture restent en attente de validation humaine.

## What Changes

- Registre : nouveau champ `url_validee` (avec `validee_par`, `validee_le`) pour l'adresse donnée à l'écran ;
  `url_aap` redevient l'adresse d'origine. Les outils lisent `adresse_aap(source)` (`url_validee` sinon
  `url_aap`) et seul `validation.py --appliquer-pages` écrit `url_validee`. Migration une fois des 42 entrées
  « Adresse corrigée par Monsieur DUCOUT ».
- Verdicts sur les fiches : écrits dans `sources/verdicts_fiches.json` (versionné, clé = adresse de l'appel) ;
  l'ancien `results/validation_manuelle.json` est migré. Le raccourci ne présente que les fiches ouvertes.
- Import : identifiant `scraped-<sha1(url_source)[:16]>` (stable, indépendant du moteur) ; pour un document
  existant, `status`, `publishedAt` et le bloc `validation` ne sont jamais réécrits ; lecture des verdicts :
  `pas-un-aap` -> `status: archived`, `aap-juste` -> étiquette `a-verifier` retirée et champs métier protégés,
  `aap-a-corriger` -> étiquette gardée et commentaire porté. Bloc `validation` {statut, commentaire, date} et
  `scrapeMetadata.moteur` / `modele` écrits dans le document. Fiches sans date de clôture importées en
  `status: draft` (invisibles sans abonnement) avec `validation.statut = a_corriger`.
- Migration des documents existants : suppression des documents `scraped-<signature>` puis réimport sous le
  nouvel identifiant (script rejouable, essai à blanc d'abord).
- Fiches du modèle local : `scrape_metadata.produite_le` et `version_consigne`.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `registre-sources` : adresse validée distincte de l'adresse d'origine.
- `import-aap-scrapes` : identifiant stable, protection des décisions humaines, lecture des verdicts.

## Impact

- Modifié : `scripts/import_to_firestore.py`, `scraping/registre.py`, `scraping/decouverte.py`,
  `scraping/validation.py`, `scraping/echantillon.py`, `scraping/sources/registre.json` (migration),
  `scraping/validation_fiches.cmd`, README, CHANGELOGs, CLAUDE.md, REPRISE.md.
- Nouveau : `scraping/sources/verdicts_fiches.json`, `scripts/tests/test_import_to_firestore.py`,
  `scripts/migrer_identifiants.py`.
- Coût : zéro euro. Écritures Firestore : environ 450 (suppressions puis créations), dans la part gratuite.

## Hors périmètre

- Verdicts sur les pages rattachés à l'identifiant de l'émetteur (problème I3 de l'audit) : changement suivant.
- Blocs `proposition` / `affichage` séparés dans Firestore : l'application lit les champs à plat ; on protège
  d'abord, on restructure ensuite si le besoin se confirme.
- Rangement de `results/` en sous-dossiers (M4).
