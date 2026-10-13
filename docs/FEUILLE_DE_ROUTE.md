# Feuille de route AAP Santé

Document de pilotage pour Monsieur DUCOUT (ARCADIA SASU). Mis à jour le 2026-10-13 ; à relire et
compléter à chaque reprise de session, en même temps que `REPRISE.md`. Les huit grandes étapes sont
celles énoncées par Monsieur DUCOUT ; l'état est celui constaté dans le dépôt, pas une estimation.

```mermaid
flowchart LR
    classDef fait fill:#E1F5EE,stroke:#0F6E56,color:#085041
    classDef encours fill:#FAEEDA,stroke:#854F0B,color:#633806
    classDef afaire fill:#F1EFE8,stroke:#5F5E5A,color:#444441

    S1["1. Sources<br/>847 émetteurs"]:::fait
    S2["2. Pages des AAP<br/>155 rubriques confirmées"]:::fait
    S3["3. Extraction<br/>moteur à décider"]:::encours
    S4["4. Veille<br/>à concevoir"]:::afaire
    S5["5. Base consolidée<br/>95 AAP en base"]:::encours
    S6["6. Consultation<br/>sans compte"]:::fait
    S7["7. Comptes clients<br/>connexion à revoir"]:::encours
    S8["8. Financeurs<br/>codé, non testé"]:::afaire

    S1 --> S2 --> S3 --> S4
    S4 --> S5 --> S6 --> S7 --> S8
```

Légende : vert = fait, orange = en cours, gris = à faire.

## État par étape

| Étape | État | Ce qui existe | Ce qui manque |
|---|---|---|---|
| 1. Récupérer le fichier des sources | Fait | `scraping/sources/registre.json` : 847 émetteurs, 657 adresses qui répondent, outil `registre.py`, vue `REGISTRE_SOURCES.md` | Mise à jour périodique du registre (non planifiée) |
| 2. Identifier les pages des AAP | Fait | Découverte (`decouverte.py`, 270 rubriques), qualification par le modèle local puis relecture manuelle tracée (`relecture_qualification.json`) : 155 rubriques confirmées, 20 à vérifier à la main | 577 sources sans page gardée (préfectures qui bloquent le robot, sites sans rubrique repérée) ; les 20 « à vérifier » |
| 3. Scraper les données | En cours | 5 connecteurs historiques (105 AAP) ; échantillon de 45 textes mesuré avec trois moteurs (`ECHANTILLON.md`) ; second tour local : qwen3:8b 16 fiches justes sur 21, mistral 7b 15 sur 23, seuil de 20 non atteint ; outil de validation manuelle `validation.py` en essai | Décision du moteur par Monsieur DUCOUT (modèle local, troisième tour, ou API Anthropic après estimation) ; passage global sur les 155 rubriques ; lecture des PDF |
| 4. Surveiller les nouveaux AAP | À faire | Principe validé : garder les pages, comparer chaque jour, ne re-traiter que ce qui change | Tout le code ; dépend de l'étape 3 |
| 5. Base consolidée des AAP | En cours | Firestore `aapi-11bc3`, collection `aap`, 95 AAP dédoublonnés par signature, import rejouable (`scripts/import_to_firestore.py`) | Consolidation après le passage global ; stockage des pièces jointes en ligne (forfait Blaze refusé pour l'instant) |
| 6. Application de consultation | Fait (preuve) | Recherche par mot, filtres secteur, territoire, budget ; fiche complète, pièces jointes, mention « Clôturé » ; consultation sans compte depuis le 2026-10-13 | Favoris, alertes, export, filtres fins (type d'établissement) |
| 7. Comptes clients | En cours | Inscription avec essai de 14 jours, connexion par e-mail, rôles porteur / financeur / admin | Redirection défectueuse après connexion, bouton Google inactif, Stripe non branché, fonctions serveur non déployées |
| 8. Espace financeurs | À faire | Pages codées en avril : publication d'AAP, candidatures, évaluation, statistiques | Non testé depuis la reprise ; fonctions serveur non déployées |

## Chemin critique

La ligne du haut commande tout : tant que l'extraction (étape 3) n'est pas tranchée, la veille (4) et la
consolidation (5) attendent. Les étapes 7 et 8 peuvent avancer en parallèle, mais ne servent à rien sans
la base. L'ordre de travail retenu avec Monsieur DUCOUT : terminer l'étape 3 à coût nul ou chiffré, puis
le passage global, puis la veille.

## Décisions structurantes (rappel)

- Zéro dépense sans accord explicite ; tout est testé en local avant déploiement.
- « Lentement et sûrement sur Ollama » (2026-10-13) : un modèle local est mesuré contre un seuil fixé à
  l'avance avant tout appel payant.
- Les appels à projets sont publics : consultation sans compte ; le compte ne sert qu'aux actions.
- Chaque évolution passe par un changement OpenSpec, validé par Monsieur DUCOUT, puis archivé.

## Historique des mises à jour

- 2026-10-13 : création, après les changements `relecture-qualification`, `extraction-echantillon-aap`,
  `consultation-aap-sans-compte` et le second tour d'extraction.
