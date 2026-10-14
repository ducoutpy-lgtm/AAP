# Proposal

## Why

Constat du 2026-10-14 (section 8 du rapport de critique, validé par Monsieur DUCOUT) : la chaîne choisit des
sources, jamais des appels. Les sources spécialisées (ARS, CNSA, INCa, fondations de santé) donnent des fiches
dans le champ ; les sources mixtes gardées en « rubrique confirmée » (102 collectivités, préfectures, DRAAF,
agences de l'eau, Bpifrance, ANR, Admical) donnent tout ce qu'elles publient. Le passage global compte déjà des
dizaines de fiches hors champ, et une trentaine des 194 fiches publiées le sont d'après le financeur. Aucune
étape ne pose la question du champ, et la validation quotidienne n'a pas de verdict pour l'écarter proprement.
Instruction 26, lot 1, première brique.

## What Changes

- Définition écrite du champ en quatre réponses, `sante`, `medico-social`, `social-assimile` (social, solidarité,
  appels mixtes où la santé est un des objets), `hors-champ`, plus `incertain` `[A VALIDER - Monsieur DUCOUT]`.
- Question fermée `champ` dans la chaîne d'extraction, après l'acceptation d'une page, moteur local et moteur API ;
  réponse et raison dans `scrape_metadata`, consigne version 4, schéma `AapNormalized` inchangé.
- Outil `scraping/champ.py` : classification rétroactive des fiches existantes (environ 900) avec essai à blanc,
  évaluation préalable sur les 50 pages de la comparaison (commentaires « hors champ » de Monsieur DUCOUT comme
  référence), rapport `CHAMP.md` par source.
- Import : une fiche `hors-champ` entre en brouillon, à corriger, commentaire « hors champ (modèle) », étiquette
  `hors-champ` ; `incertain` reçoit l'étiquette `champ-incertain` ; jamais publiée sans verdict.
- Validation quotidienne : verdict « hors champ » (touche 7), reporté à l'import comme rejet.
- Migration unique des fiches publiées hors champ vers le brouillon : sauvegarde, essai à blanc, accord écrit.
- Registre : part de fiches dans le champ par source, sources presque sans fiche dans le champ listées pour
  décision humaine, sans exclusion automatique.

## Capabilities

### New Capabilities

- `filtre-champ-sante` : définition, question fermée, classification rétroactive, évaluation, verdict humain,
  rapport par source.

### Modified Capabilities

- `import-aap-scrapes` : fiche hors champ en brouillon, verdict « hors champ » rejeté, migration des publiées.

## Impact

- Nouveaux : `scraping/champ.py`, ses tests, `scraping/CHAMP.md`, `scripts/migrer_champ.py`. Modifiés :
  `echantillon.py`, `extractor.py`, `extraction_locale.py`, `validation.py`, import et ses tests, documentation.
- Coût : classification d'environ 900 fiches par le modèle local (0 euro, quatre à cinq heures) ou par
  `claude-haiku-5-5` (environ 0,20 euro, moins de 0,50 euro avec marge, quelques minutes) ; évaluation sur 50 pages
  0,01 euro avec Haiku. Modèle `[A VALIDER - Monsieur DUCOUT]`, aucun appel sans accord écrit. Nouvelles
  extractions : une question de plus par page acceptée. Migration : moins de 50 mises à jour. Temps : deux sessions.

## Hors périmètre

- Le schéma `AapNormalized` et le type `AAP` : le champ vit dans `scrape_metadata` et `scrapeMetadata`.
- Le remplacement de `sectorsTargeted = ["sante", "social"]` (constat P3) : changement suivant.
- La requalification automatique des sources ; les lots 2 à 5.
