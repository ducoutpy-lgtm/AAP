# Proposal

## Why

Le robot de découverte a trouvé 270 "rubriques" et 3 748 "liens d'AAP", mais ces chiffres sont des
candidats repérés par mots-clés, pas des appels à projets vérifiés : l'échantillon du 2026-10-12 a
montré que 21 pages sur 45 n'en étaient pas (listes, pages de présentation, facturation d'eau).
Monsieur DUCOUT l'a relevé : on ne peut pas dire combien de sources publient réellement des appels
à projets tant qu'on ne l'a pas vérifié source par source. Cette vérification doit précéder toute
extraction, sinon on tourne en rond.

## What Changes

- Un outil `scraping/qualification.py` qui, pour chaque source dont une rubrique a été trouvée,
  relit la page gardée en local et répond à trois questions : la page liste-t-elle des appels à
  projets ? sous quelle forme (pages web, PDF, les deux) ? concernent-ils la santé ou le
  médico-social ? La réponse est donnée par le modèle local Ollama (gratuit), à partir du texte de
  la page, sous forme de JSON contraint.
- Un verdict par source écrit dans le registre, dans un nouveau champ `qualification` :
  `rubrique-confirmee`, `pdf-seulement`, `hors-sante`, `pas-d-aap`, `a-verifier`. Le champ
  `statut` existant ne change pas.
- Un sondage manuel : la session relit au moins 30 verdicts (tirés dans chaque famille) et note
  son accord dans un fichier ; le rapport indique le taux d'accord, pour savoir si l'on peut se
  fier au modèle local sur le reste.
- Un rapport `scraping/QUALIFICATION.md` : décompte des verdicts par famille, liste des sources
  confirmées, liste des sources à vérifier à la main.
- Les 376 sources "aucune rubrique" et les 201 bloquées ou en erreur ne sont pas qualifiées ici
  (pas de page gardée) : elles restent "a-verifier" et sont comptées comme telles.

## Capabilities

### New Capabilities

- `qualification-sources` : verdict vérifié par source sur la présence d'appels à projets, sondage
  manuel et rapport.

### Modified Capabilities

Aucune. Le registre garde son format (champ ajouté, champs existants inchangés) ; le schéma
`AapNormalized` n'est pas concerné.

## Impact

- Nouveaux fichiers : `scraping/qualification.py`, `scraping/tests/test_qualification.py`,
  `scraping/QUALIFICATION.md`, `scraping/decouverte/qualification.json` (ignoré par Git).
- Modifié : `scraping/sources/registre.json` (champ `qualification`), `REGISTRE_SOURCES.md`.
- Coût : zéro euro. Temps machine Ollama : environ 10 à 15 secondes par page, soit une heure
  pour 270 pages. Temps de travail : 2 à 3 heures.

## Hors périmètre

- L'extraction des fiches (changement `extraction-echantillon-aap`, en attente).
- La lecture des PDF : on note seulement qu'une source publie en PDF.
- La qualification des sources sans rubrique trouvée (il faudra d'abord garder leur page).
