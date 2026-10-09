# Design

## Context

Voir proposal.md. L'annuaire de l'administration (API DILA, déjà utilisée pour les collectivités)
expose un type d'organisme par code (`caf`, `cpam`, `prefecture`, `ddets`, `draf`...), avec le site
web de chaque antenne. Les CAF et CPAM ont des centaines d'antennes mais un site par département :
on dédoublonne par nom de domaine.

## Goals / Non-Goals

**Goals :** couverture locale exhaustive, zéro dépense, même outil et même format qu'avant.
**Non-Goals :** pas de recherche de la rubrique AAP de chaque organisme (connecteurs futurs).

## Decisions

### Décision 1 : réutiliser l'annuaire DILA, un organisme par domaine

Même méthode que pour les collectivités ; le dédoublonnage par domaine évite 812 lignes CAF pour
une centaine de sites réels. Catégories : CAF, CPAM, Carsat, MSA en `caisse-nationale` ;
préfectures, DREETS, DDETS, DRAAF en `ministere` ; MDPH en `collectivite`.

### Décision 2 : fédérations, presse et plateformes en catégorie « autre »

Ce ne sont pas des financeurs mais des relais ; les garder dans le registre permet au futur moteur
de découverte de les surveiller.

## Risks / Trade-offs

- [Beaucoup de sites officiels sans rubrique AAP] → notes explicites « rubrique à préciser ».
- [Contrôle des pages long (plus de 600 sources)] → exécuté en arrière-plan, une fois.
