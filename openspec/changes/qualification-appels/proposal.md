# Proposal

## Why

Jour 2 du plan MVP (`docs/PLAN_MVP_2026-10-20.md`). Un candidat doit savoir d'un coup d'œil si un appel lui est
ouvert (établissement public, privé non lucratif, privé lucratif...), de quel type d'appel il s'agit, ce qu'il finance,
quand il ouvre et quelles pièces il attend. Les fiches ne portent pas ces réponses, et le filtre « à qui s'adresse »
manque (retour de Monsieur DUCOUT du 2026-10-20). Son parcours du soir a aussi montré un appel hors santé (mécénat de
compétences) validé par le contrôle : la question du champ est reposée au passage.

## What Changes

- **Qualification par le modèle** (`scraping/qualifier_fiches.py`) : pour chaque fiche publiable, à choix fermés,
  destinataires (public, privé non lucratif, privé lucratif, collectivités, recherche, tous), type d'appel, objets
  financés, date d'ouverture, pièces attendues, champ (santé, médico-social, hors champ). Écrit dans
  `scrape_metadata.qualification`, sauvegarde avant écriture, plafond, journal des coûts. Coût supposé : voir tasks.md,
  écrit et accepté avant tout appel.
- **Import** : bloc `qualification` sur le document (`destinataires`, `typeAppel`, `objets`, `dateOuverture`, `par`,
  `le`), `startDate` depuis la date d'ouverture, pièces attendues reprises quand la fiche n'en avait pas, et une fiche
  que la qualification classe hors champ repasse en brouillon à corriger (sauf verdict humain). Le type `AAP` reçoit
  `qualification` (exigence explicite de la spec).
- **Application** : filtres « À qui s'adresse » et « Type d'appel » dans la recherche (étiquettes, adresse) ; fiche :
  carte « À qui s'adresse » d'après la qualification, type d'appel, objets, date d'ouverture ; administration : fenêtre
  « Qualifier » pour corriger ces valeurs à la main (écrites au nom de Monsieur DUCOUT, prioritaires sur le modèle).
- **Hors périmètre** : pièces jointes téléchargées et servies depuis la fiche pour les appels de la veille (tâche
  suivante du jour 2 si le temps le permet, sinon jour 3) ; profil candidat rapproché des destinataires (jour 4,
  recommandations).

## Capabilities

### New Capabilities

- `qualification-appels` : qualification à choix fermés, filtres et correction en administration.

### Modified Capabilities

- `import-aap-scrapes` : bloc qualification, date d'ouverture, hors champ par la qualification.

## Impact

- Code : `scraping/qualifier_fiches.py` et test, `scraping/extractor.py` (`qualifier_fiche`),
  `scripts/import_to_firestore.py` (`appliquer_qualification`, listes blanches, test), `app/src/utils/qualification.ts`
  et test, `types/index.ts`, `SearchAapPage`, `AapDetailPage`, `ManageAAPsPage`, `utils/recherche.ts`, `utils/candidat.ts`.
- Coût : qualification par Haiku, devis à blanc dans tasks.md ; le reste zéro euro.
