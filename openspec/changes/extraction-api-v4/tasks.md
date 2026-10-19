# Tasks

Décision de Monsieur DUCOUT du 2026-10-19 : « garde la V3, crée la V4 avec modèle API payant, tu dois toujours me donner
le coût supposé avant de lancer des appels à l'API ». Règles : devis écrit et accord avant chaque lancement, plafond
cumulé 5 euros, aucun `git push`, aucun archivage sans demande. V3 conservée sous l'étiquette Git `v3-local`.

## 1. Outil

- [ ] 1.1 `echantillon.extraire_api` : paramètres `fiches` et `metadonnees` ; `extraction_locale.py` : `--moteur`,
  `--plafond`, `--dry-run`, sortie `results/extraction_api.json`, devis. Fait quand : pytest scraping vert ; essai à
  blanc collé (devis complet) ; journal des coûts inchangé.
- [ ] 1.2 Essai réel limité (`--limite 5`) après accord, coût réel collé, cinq fiches relues par la session (champ,
  version 4, moteur api).

## 2. Passage global

- [ ] 2.1 Devis du passage complet collé ici, accord écrit de Monsieur DUCOUT, lancement, bilan (fiches, refus, échecs,
  durée, coût réel lu dans le journal).
- [ ] 2.2 Contrôle des fiches API par `verification.py` (devis puis accord), décision du modèle appliquée
  (`appliquer_controle.py`, essai à blanc puis accord), import, compte des fiches publiées collé.

## 3. Documentation et vérification

- [ ] 3.1 README scraping, README racine, CHANGELOGs, CLAUDE.md (décision V4, état d'avancement), REPRISE.md,
  `docs/FLUX_DONNEES.md`, `docs/FEUILLE_DE_ROUTE.md`, rapport section 8.
- [ ] 3.2 Monsieur DUCOUT ouvre `/aap/search` et constate le nombre d'appels publiés, et relit `tasks.md` (coûts réels).
