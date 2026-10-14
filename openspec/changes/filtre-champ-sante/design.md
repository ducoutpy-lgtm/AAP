# Design

## Context

État vérifié le 2026-10-14 au soir : registre de 1 198 sources dont 242 en « rubrique confirmée » (102 collectivités,
34 ministères, 22 fondations, 22 caisses, 19 ARS, 15 agences nationales, 10 autres, 10 établissements, 6 sociétés
savantes, 2 Europe) ; 111 de ces 242 avaient reçu du modèle le verdict « hors santé » avant d'être confirmées à
l'écran par Monsieur DUCOUT parce qu'elles publient parfois un appel du champ (exemple : agence de l'eau
Seine-Normandie, note « lien indirect avec la santé »). Le champ `perimetre` du registre (`sante`, `medico-social`,
`sante-et-medico-social`) décrit la cible visée, pas le contenu réel des pages. Passage global : 783 fiches dont
17 de l'agence de l'eau Seine-Normandie, 24 de deux DRAAF, 20 de deux préfectures, 10 de l'ANR, 8 de Bpifrance,
10 d'Admical. Fiches publiées : 194, une trentaine hors champ d'après le financeur (estimation). Question fermée
actuelle (consigne version 3) : « est-ce la fiche d'un appel ? », sans critère de champ. Validation quotidienne :
verdicts juste / à corriger / pas un AAP / passer, pas de « hors champ ». Import : `validation.statut` seule source
de fiabilité, champs humains jamais réécrits sur un document existant (lot 0).

```mermaid
flowchart LR
    T[texte d une page acceptee] --> Q[question fermee champ<br/>local ou API, consigne v4]
    Q --> F[fiche + scrape_metadata.champ]
    R[results/*.json existants] --> C[champ.py --classer<br/>retroactif, essai a blanc]
    C --> F
    F --> I[import_to_firestore.py]
    I -->|hors-champ| B[brouillon, a_corriger<br/>« hors champ (modele) »]
    I -->|sante, medico-social, social-assimile| P[publie, a verifier]
    V[validation quotidienne<br/>touche 7 hors champ] --> I
    F --> S[champ.py --rapport<br/>CHAMP.md par source]
    M[scripts/migrer_champ.py<br/>publiees hors champ -> brouillon] --> B
```

## Goals / Non-Goals

Goals : aucune fiche hors champ publiée sans verdict humain ; le champ de chaque fiche connu, avec sa raison ;
Monsieur DUCOUT peut écarter une fiche hors champ d'une touche ; les sources mixtes mesurées.
Non-Goals : changer le schéma ; requalifier les sources automatiquement ; corriger `sectorsTargeted` (suivant).

## Decisions

### Décision 1 : définition du champ en quatre réponses, plus « incertain »

- `sante` : soins, prévention, santé publique, santé mentale, addictions, recherche en santé, e-santé et numérique
  en santé, établissements de santé.
- `medico-social` : handicap, autonomie, personnes âgées, aide à domicile, protection de l'enfance, établissements
  et services médico-sociaux.
- `social-assimile` : social et solidarité (pauvreté, exclusion, insertion sociale, hébergement accompagné,
  parentalité, aidants, inclusion) et appels mixtes où la santé ou le médico-social est un des objets (sport-santé,
  culture-santé, alimentation et santé, santé-environnement).
- `hors-champ` : agriculture, économie, tourisme, patrimoine, culture générale, environnement sans objet de santé,
  énergie, numérique hors santé, recherche hors santé, éducation générale, et tout le reste.
- `incertain` : le modèle ne tranche pas ; la fiche reste « à vérifier » avec l'étiquette `champ-incertain`.
Pourquoi quatre réponses et pas oui / non : « assimilé » demandé par Monsieur DUCOUT ; une réponse graduée permet
de publier le cœur sans hésiter et de laisser l'humain trancher les cas mixtes. Liste `[A VALIDER - Monsieur DUCOUT]`,
écrite dans la consigne et dans `CHAMP.md`.

### Décision 2 : une question fermée, posée au texte de la page

La question `champ` est posée après l'acceptation (« est-ce un appel ? » vrai), sur le texte de la page, avec la
définition ci-dessus et une raison en une phrase ; réponse par schéma JSON pour le modèle local, par outil forcé
pour l'API (`extractor.py`, même mécanique que `est_aap`). Pourquoi après l'acceptation : ne pas payer la question
sur les pages refusées. Pourquoi le texte et non la fiche : le texte dit l'objet réel ; pour les fiches des
connecteurs sans texte conservé, la question est posée aux champs de la fiche (titre, financeur, description,
éligibilité), et `champ_source = "fiche"` le note.

### Décision 3 : stockage dans `scrape_metadata`, consigne version 4

`scrape_metadata.champ`, `champ_raison`, `champ_modele`, `champ_le`, `champ_source` ; `VERSION_CONSIGNE = 4`.
Pourquoi : aucun changement du schéma `AapNormalized` ni du type `AAP` (interdit sans exigence explicite) ;
`scrapeMetadata` est un champ technique que l'import réécrit à chaque passage, donc le champ suit la fiche.

### Décision 4 : classification rétroactive par un outil séparé, avec évaluation d'abord

`scraping/champ.py --classer [--fichier ...] [--moteur ollama|api] [--modele ...] [--limite N] [--dry-run]` lit
les fichiers de résultats lus par l'import (`extraction_locale.json`, connecteurs), pose la question à chaque
fiche sans champ, écrit le résultat dans le fichier (sauvegarde préalable dans `scripts/sauvegardes/`), reprise.
`--evaluer` compare les réponses sur les 50 pages de la comparaison aux commentaires « hors champ » de Monsieur
DUCOUT (référence humaine disponible sans travail supplémentaire) et affiche le taux d'accord par modèle. Ordre :
évaluation (50 pages, 0 euro en local ou 0,01 euro avec Haiku), accord sur le modèle, puis les 900 fiches.
Pourquoi un outil séparé : règle des outils séparés du projet, et la classification doit pouvoir être rejouée
quand la définition change.

### Décision 5 : règles d'import et verdict humain

À la création d'un document : `champ == hors-champ` donne `status = draft`, `validation = {a_corriger, « hors champ
(modèle) », date, par « import (champ) »}`, étiquette `hors-champ` ; `incertain` ajoute l'étiquette `champ-incertain`
sans changer le reste ; les trois autres valeurs ne changent rien. Sur un document existant, l'import ne touche
jamais `status` ni `validation` (lot 0) : d'où la migration de la décision 6. Verdict quotidien « hors champ »
(touche 7 du mode fiches) : `STATUTS_VALIDATION["hors-champ"] = "rejetee"`, commentaire « hors champ », document
archivé comme pour « pas un AAP ». Pourquoi un verdict distinct : « pas un AAP » serait faux et fausserait les
comptes.

### Décision 6 : migration unique des fiches publiées hors champ

`scripts/migrer_champ.py` : lit les fiches classées `hors-champ` dans les résultats, retrouve les documents
publiés correspondants (identifiant dérivé de l'adresse), sauvegarde JSON, `--dry-run` (compte et cinq exemples),
puis `status = draft` et `validation` a_corriger « hors champ (modèle) » après accord écrit. Pourquoi : les fiches
déjà publiées ne seront jamais modifiées par l'import, et une trentaine sont hors champ.

### Décision 7 : rapport par source, décision humaine

`champ.py --rapport` écrit `scraping/CHAMP.md` : définition du champ, répartition des réponses, part de fiches
dans le champ par source, liste des sources avec au moins cinq fiches et moins de 20 % dans le champ, avec leur
`perimetre` et leurs notes du registre. Aucune modification du registre : Monsieur DUCOUT décide source par
source, avec l'outil de relecture existant.

## Risks / Trade-offs

- Le modèle se trompe sur les cas mixtes : « incertain » et le verdict humain restent le dernier mot ; l'évaluation
  sur les 50 pages donne une mesure avant de classer 900 fiches.
- Deux modèles possibles (local, Haiku) : réponses différentes ; le modèle utilisé est enregistré dans la fiche.
- Le passage global continue avec la consigne version 3 jusqu'à sa fin : ses fiches sont classées par l'outil
  rétroactif, pas par la chaîne.
- Classification en local pendant le passage global : file d'attente Ollama, lenteur ; à lancer après sa fin.

## Open Questions

- Liste du champ (décision 1) et place de l'insertion par l'emploi, de la jeunesse et du logement : `social-assimile`
  ou `hors-champ` `[A VALIDER - Monsieur DUCOUT]`.
- Modèle de la classification rétroactive : local (0 euro, lent) ou Haiku (0,20 euro, minutes) `[A VALIDER]`.
