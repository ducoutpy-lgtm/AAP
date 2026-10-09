# Proposal

## Why

Le cahier des charges fait du scraping la pierre angulaire du projet : sans couverture complète
des émetteurs d'appels à projets santé et médico-social, la plateforme n'a pas de valeur. Or, avant
de scraper, il faut savoir qui publie : aujourd'hui, 5 sources sont couvertes et aucune liste des
sources à viser n'existe. Monsieur DUCOUT l'a formulé le 2026-10-09 : « déjà identifier les sources
qui publient des appels à projets, et ensuite les scraper ». Le registre est le point de départ de
tous les connecteurs suivants et le tableau de bord de l'avancement, source par source.

## What Changes

- Un registre unique des sources (`scraping/sources/registre.json`) : pour chaque source, nom,
  catégorie, page où les AAP sont publiés, périmètre (santé, médico-social, les deux), statut
  d'avancement (identifiée, page vérifiée, connecteur testé, opérationnelle), connecteur associé
  s'il existe, notes.
- Un outil `scraping/registre.py` qui vérifie que chaque page répond encore (code HTTP, date de
  contrôle) et produit une vue lisible `scraping/REGISTRE_SOURCES.md` (tableau par catégorie) que
  Monsieur DUCOUT relit et corrige.
- Première constitution du registre, sans aucune dépense : listes institutionnelles connues
  (17 ARS, caisses nationales, ministères, Fondation de France et fondations abritées, programmes
  européens, collectivités) complétées par des recherches web menées depuis la session Claude Code.
  Cible : au moins 40 sources dont la page est vérifiée.
- Les 5 connecteurs existants sont rattachés à leur ligne du registre (statut « opérationnelle »).

## Capabilities

### New Capabilities
- `registre-sources` : inventaire des émetteurs d'AAP, vérification de leurs pages et suivi de
  l'état de chaque connecteur.

### Modified Capabilities
(aucune)

## Impact

- Nouveaux : `scraping/sources/registre.json`, `scraping/registre.py`, `scraping/REGISTRE_SOURCES.md`,
  `scraping/tests/test_registre.py`.
- Aucune modification des connecteurs existants, du schéma `AapNormalized`, de l'import ni de
  l'application.
- Documentation : `scraping/README.md`, `scraping/CHANGELOG.md`, `CLAUDE.md` (avancement).

## Hors périmètre

- Écrire ou tester des connecteurs : objet des changements suivants (d'abord un connecteur
  générique pour les 17 ARS, puis une source ou famille de sources à la fois).
- Lire la boîte de veille (alertes Google, projet VeilleEsante) : prévu dans un changement
  ultérieur, une fois le registre en place.
- Collecter automatiquement de nouvelles sources en continu (moteur de découverte) : vision à
  plus long terme ; ici, la découverte est faite une fois, à la main et par recherche web.
- Tout appel à l'API Anthropic.

## Coût estimé

- API Anthropic : 0 euro. Firebase : rien.
- Temps : environ 3 à 4 heures, dont la recherche web des sources et la relecture par Monsieur
  DUCOUT.
