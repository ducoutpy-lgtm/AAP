# Tasks

Instruction 11 du rapport de critique (lot 1), accord de Monsieur DUCOUT du 2026-10-19 (« 1 : ok »). Zéro euro. Règles :
aucun `git push`, aucun archivage sans demande, ré-import réel après essai à blanc.

## 1. Code

- [x] 1.1 `app/src/utils/relecture.ts` (`mentionRelecture`, `estRelue`, `dateExtraction`), type `AAP`
  (`scrapeMetadata.extraitLe`), import (`extraitLe`) et test. Fait quand : pytest scripts vert. (Fait le 2026-10-19 :
  pytest scripts 26 verts.)
- [x] 1.2 `SearchAapPage.tsx` : mention, date, lien « Annonce officielle », filtre « Relecture » ; `AapDetailPage.tsx` :
  mention, date, lien en évidence dans l'en-tête. Fait quand : lint et build verts ; écran relu par la session
  (mention « Contrôlée par le modèle » visible, filtre « relues seulement » égal au compte des fiches validées publiées).
  (Fait le 2026-10-19 : lint et build verts ; `/aap/search` relu par la session : 20 mentions « Contrôlée par le modèle »,
  20 liens « Annonce officielle » et des mentions « Non relue » sur la première page ; filtre « Fiches relues ou
  contrôlées seulement » : « 231 AAP disponibles », égal aux 231 fiches validées de la base ; « Informations extraites le »
  absent tant que `extraitLe` n'est pas en base (2.1).)

## 2. Données

- [ ] 2.1 Ré-import à blanc puis réel (pose `extraitLe`), fait avec l'import des fiches V4 (`extraction-api-v4` 2.2) pour
  n'importer qu'une fois. Fait quand : sorties collées, date visible sur une fiche.

## 3. Documentation et vérification

- [ ] 3.1 README de l'application, README racine, CHANGELOG racine, CLAUDE.md, REPRISE.md, `docs/FLUX_DONNEES.md`,
  rapport section 8.
- [ ] 3.2 Monsieur DUCOUT ouvre `/aap/search`, voit la mention et la date sur une fiche, active le filtre « relues
  seulement » et ouvre un lien officiel depuis la liste.
