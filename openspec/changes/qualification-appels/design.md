# Design

## Contexte

Le contrôle (`verification.py`) relit déjà chaque fiche publiable à côté du texte de sa page avec un outil à verdicts
fermés, un plafond et un journal des coûts ; l'import protège les champs humains et applique la décision du modèle.
Le schéma `AapNormalized` ne change pas (interdit sans exigence) : la qualification vit dans `scrape_metadata`, comme
la vérification.

## Décisions

1. **Même mécanique que le contrôle** : `qualifier_fiches.py` reprend `a_verifier` (périmètre), `texte_pour_classement`
   (texte de la page), `_appeler` (outil forcé, reprise, journal). Pourquoi : outil éprouvé, coûts suivis au même
   endroit.
2. **Valeurs fermées** partagées entre Python (`DESTINATAIRES`, `TYPES_APPEL`, `OBJETS`) et l'application
   (`utils/qualification.ts`) ; `OBJETS` reprend les identifiants des objets de projet du profil candidat, pour le
   rapprochement du jour 4.
3. **Pas deux fois le même appel** : les adresses des fichiers API et connecteurs sont écartées du passage local.
4. **Import** : `appliquer_qualification(doc, item)` pure ; `qualification.par` = modèle ou « Monsieur DUCOUT » ;
   `document_a_envoyer` protège `qualification` quand `par` est Monsieur DUCOUT (même règle que `validation`).
   Hors champ par la qualification : même traitement que `champ_en_attente` (brouillon, à corriger).
5. **Application** : `qualification.destinataires` prime sur `structureTypeEligible` et sur l'heuristique des
   critères dans `aQuiSAdresse` ; filtre « tous » inclus par construction ; fenêtre « Qualifier » dans
   `ManageAAPsPage` avec le composant `Modal`.

## Risques

- Les destinataires sont lus sur la page : quand la page ne dit rien, « tous » est la réponse attendue du modèle, pas
  une invention. Mesure : vingt fiches tirées au sort relues par Monsieur DUCOUT.
- Deux passes de qualification (API et locale) pourraient diverger pour un même appel : évité par la règle 3.
