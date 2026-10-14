# Proposal

## Why

Monsieur DUCOUT trouve une source manquante « toutes les cinq » (UDAF, Bpifrance exclue, Fondation
Crédit Mutuel à la mauvaise adresse, annuaire des fondations abritées jamais dépouillé). Cause
vérifiée dans les changements de registre du 2026-10-09 : le registre a été constitué de listes
connues et de mémoire, jamais à partir d'annuaires de référence avec un total. Sans dénominateur,
personne ne pouvait dire ce qui manquait. Le registre compte 848 sources dont 46 fondations, alors
que le Registre national des fonds et fondations (RNF, ministère de l'Intérieur, données ouvertes,
mise à jour du 2026-10-01) recense 4 072 fonds et fondations actifs, dont 664 fondations reconnues
d'utilité publique ou d'entreprise à domaine santé ou social.

## What Changes

- Un inventaire des familles d'émetteurs pouvant financer des appels à projets, à manifestation
  d'intérêt ou à candidatures en santé et médico-social, avec pour chacune : l'annuaire de
  référence, le total, la couverture actuelle du registre, la vague de traitement (`design.md`).
  Validé par Monsieur DUCOUT avant toute saisie.
- Règle nouvelle du registre : une famille n'est « couverte » que si son annuaire est nommé et son
  taux de couverture affiché dans `REGISTRE_SOURCES.md` (entrées du registre / total de l'annuaire).
- Première vague, décidée par Monsieur DUCOUT : les 664 fondations reconnues d'utilité publique et
  d'entreprise, actives, dont le domaine d'intérêt général ou l'objet social évoque la santé, le
  social, le médical, le handicap ou l'autonomie. L'extrait du RNF est versionné dans
  `scraping/sources/annuaires/`. Le RNF ne donne pas les sites web : chaque fondation entre au
  registre (statut « identifiée ») dès que son site est trouvé, par recherche web outillée, et les
  fondations sans site trouvé restent listées comme manquantes avec leur nombre. Pourquoi : le
  format du registre exige une adresse, et une adresse devinée serait une invention.
- Outil `scraping/annuaires.py` : extrait filtré, rapprochement par SIRET et nom avec les entrées
  existantes (pas de doublon), taux de couverture ; découverte et qualification inchangées ensuite.

## Capabilities

### New Capabilities

Aucune.

### Modified Capabilities

- `registre-sources` : familles adossées à des annuaires de référence avec taux de couverture ;
  première vague des fondations du RNF.

## Impact

- Nouveaux : `scraping/annuaires.py`, `scraping/sources/annuaires/` (extrait RNF, inventaire des
  familles), tests.
- Modifiés : `scraping/registre.py` (taux de couverture dans la vue), `registre.json`,
  `REGISTRE_SOURCES.md`, README scraping, CHANGELOGs, CLAUDE.md, REPRISE.md, feuille de route.
- Coût : zéro euro pour les annuaires (données ouvertes). La recherche des sites web dépend du
  changement `recherche-page-aap-par-source` : moteur gratuit d'abord ; si une clé d'API de
  recherche devient nécessaire, son coût est chiffré et soumis à Monsieur DUCOUT avant usage.
  Temps machine : 664 recherches espacées, environ deux heures ; puis découverte et qualification
  locales, plusieurs heures en tâche de fond.

## Hors périmètre

- Seconde vague : 2 661 fonds de dotation du RNF, fondations abritées (annuaire de la Fondation de
  France et autres abritantes), autres familles de l'inventaire : chacune un changement à part.
- Les agrégateurs à compte (Aides-territoires : API gratuite mais clé après inscription, à créer par
  Monsieur DUCOUT lui-même) : décision séparée.
- L'extraction des appels (étape 3).
