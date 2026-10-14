# Changelog

Toutes les modifications notables du dépôt AAP Santé sont documentées ici (format Keep a Changelog, en
français). Le journal propre au volet scraping reste dans `scraping/CHANGELOG.md`.

## [Non publié]

### Modifié
- Organisation des données validées (changement `organisation-donnees-validees`, 2026-10-14, suite à
  `docs/AUDIT_DONNEES_2026-10-14.md`) : identifiant Firestore dérivé de l'adresse de l'appel (341 documents
  migrés), décisions humaines (`status`, `validation`) jamais réécrites par l'import, verdicts de
  `scraping/sources/verdicts_fiches.json` appliqués, fiches sans date en brouillon, adresse validée distincte
  de l'adresse d'origine dans le registre. Schéma des flux : `docs/FLUX_DONNEES.md`.

### Ajouté
- Extraction locale globale (changement `extraction-locale-globale`, 2026-10-13 soir) : `scraping/extraction_locale.py`
  extrait avec `qwen3:8b` les pages des 242 rubriques validées (2 395 adresses web uniques), fiches marquées
  « à vérifier » ; l'import pose l'étiquette `a-verifier` et l'application affiche le badge « À vérifier ».
- Verdicts de Monsieur DUCOUT sur les 257 pages reportés au registre (`validation.py --appliquer-pages`, changement
  `recherche-page-aap-par-source`), 50 adresses corrigées et redécouvertes (`decouverte.py --garder-depart`) ; vague 1 des
  fondations terminée (365 / 664, 1 198 sources) ; famille PLIE ajoutée à l'inventaire.
- Registre : vague 1 poursuivie par la recherche web de la session (203 fondations, 100 sites inscrits), 1 123 sources,
  couverture 298 / 664 ; agrégateur Fimeco Walter Allinial ajouté (deux pages) ; veille URIOPSS PACA-Corse exploitée
  (10 financeurs ajoutés, 1 133 sources).
- Registre : 172 fondations de la vague 1 créées (1 022 sources), couverture mesurée 191 / 664 en tête de `REGISTRE_SOURCES.md` ;
  recherche des sites par l'API Tavily (clés du projet Scrapling, limite de plan atteinte après 191).
- Changement OpenSpec `registre-par-annuaires` (2026-10-13) : familles d'émetteurs adossées à des annuaires de référence avec taux de
  couverture ; première vague = 664 fondations reconnues d'utilité publique et d'entreprise à domaine santé-social, extraites du
  Registre national des fonds et fondations (`scraping/annuaires.py`, `scraping/sources/annuaires/`).
- Registre : source UDAF de l'Essonne ajoutée (848 sources) ; famille UDAF (96 sites listés par l'UNAF) à étudier.
- Outil de validation manuelle des pages et des liens dans le navigateur de Monsieur DUCOUT (changement OpenSpec
  `validation-manuelle-aap`, 2026-10-13, vérification 2.1 par Monsieur DUCOUT en attente) ; brouillon de changement
  `recherche-page-aap-par-source` (recherche web de la page des appels de chaque source). Règle « Preuve avant
  affirmation » ajoutée dans `CLAUDE.md`. Feuille de route : étape 2 repassée « à valider à la main ».
- Second tour d'extraction par le modèle local (changement OpenSpec `extraction-ollama-second-tour`, 2026-10-13, en
  attente de la décision de Monsieur DUCOUT) : question fermée avant extraction, contrôle des formats, contrôle
  automatique contre les fiches de référence, seuil de décision. Résultat : mistral 7b 15 fiches justes sur 23 et
  13 fabriquées ; qwen3:8b 16 sur 21 et 1 fabriquée ; seuil (20 et 2) non atteint. Détail dans `scraping/ECHANTILLON.md`.
- Consultation des AAP sans compte (changement OpenSpec `consultation-aap-sans-compte`, 2026-10-13) : règle Firestore
  « lecture publique des AAP publiés » déployée sur `aapi-11bc3`, routes « Rechercher des AAP » et fiche sorties de la
  zone protégée, lien « Voir les appels à projets » sur l'accueil ; « Candidater » et favori renvoient vers la
  connexion sans compte. Les appels à projets sont des informations publiques ; le compte ne sert qu'aux actions.
- Relecture manuelle de la qualification (changement OpenSpec `relecture-qualification`, 2026-10-12) : fichier versionné
  `scraping/sources/relecture_qualification.json` appliqué par `qualification.py` par-dessus les verdicts du modèle (verdict
  du modèle conservé, section « Relecture manuelle » dans `QUALIFICATION.md`). 60 pages relues sans IA ; bilan : 155 rubriques
  confirmées (127 avant), 88 hors santé, 6 sans AAP, 20 à vérifier.
- Extraction sur échantillon (`extraction-echantillon-aap`, 2026-10-12) : extraction Ollama terminée (41 fiches sur 45 en une
  heure environ, dont trois délais dépassés de dix minutes), contrôle des fiches et rapport `scraping/ECHANTILLON.md`
  (Ollama 9 fiches justes sur 41, session 24 sur 24, API estimée 99 euros pour 3 748 liens) ; 6 fiches validées importées
  dans Firestore (95 AAP scrapés en base).
- `scripts/import_to_firestore.py` : l'import global ignore les fichiers `echantillon_*.json` et `controle_*.json`
  (import de l'échantillon seulement par `--source`), pour ne jamais verser en base des fiches non contrôlées.
- Qualification des sources (changement OpenSpec `qualification-des-sources`, 2026-10-12) : 270 rubriques relues par
  le modèle local, 127 confirmées comme publiant des appels à projets santé ; verdict dans le registre et `scraping/QUALIFICATION.md`.
- Échantillon d'extraction (`extraction-echantillon-aap`, en attente) : 24 fiches produites par la session, coût API estimé.
- `REPRISE.md` à la racine : résumé du projet et consigne de reprise pour chaque nouvelle session.
- Robot de découverte des rubriques appels à projets (changement OpenSpec `decouverte-rubriques-aap`,
  2026-10-09) : 847 sources explorées sans IA, 268 rubriques trouvées, 3744 liens d'AAP gardés en local
  pour l'extraction à venir. Rapport `scraping/DECOUVERTE.md`.
- Registre des sources, seconde extension (changement OpenSpec `registre-des-sources-2`, 2026-10-09) : 847
  sources, 657 pages vérifiées ; caisses et services de l'État locaux, IHU, GIRCI, Europe régionale, fédérations,
  plateformes de dépôt, sur la liste de Monsieur DUCOUT.
- Registre des sources (changement OpenSpec `registre-des-sources`, 2026-10-09) : 334 émetteurs d'AAP
  inventoriés dans `scraping/sources/registre.json` (régions, départements et grandes villes via l'annuaire
  officiel de l'administration), 304 pages vérifiées, outil `scraping/registre.py`,
  vue `scraping/REGISTRE_SOURCES.md`. Aucune dépense.
- Pièces jointes des AAP scrapés (changement OpenSpec `pieces-jointes-aap`, 2026-10-09) : section
  « Pièces jointes » sur la fiche et compteur « N pièces jointes » sur les cartes de la recherche ;
  champ optionnel `scrapeMetadata` déclaré sur le type `AAP`. Les fichiers déjà téléchargés par le
  scraping (93 sur 109) sont servis depuis le PC en développement (`app/public/documents` ->
  `scraping/downloads`, lien de jonction ignoré par Git), car les ARS refusent l'accès direct
  (« Forbidden ») ; les autres gardent leur lien d'origine. Envoi vers Firebase Storage codé mais
  désactivé (`--vers-storage`, nécessite le forfait Blaze : compte de facturation fermé).
- Démo de bout en bout (changement OpenSpec `demo-aap-scrapes-visibles`, 2026-10-09) : 89 AAP scrapés
  importés dans Firestore et visibles dans l'application ; procédure de rejeu dans le README (section 4).
- `app/src/utils/deadline.ts` : helper partagé « jours restants » ; mention « Clôturé » dans la liste et la
  fiche d'un AAP dont la date de clôture est passée.
- `scripts/import_to_firestore.py` : fusion des doublons entre sources avant écriture ; dépendances fixées
  (`google-cloud-firestore`, `grpcio` 1.74.0).

### Corrigé
- `app/src/pages/porteur/SearchAapPage.tsx` : la recherche par mot ne filtrait jamais (condition sur le
  financeur toujours vraie, parenthèse manquante).

### Connu, non corrigé (hors périmètre de la démo)
- À l'inscription, un message d'erreur s'affiche après la création réussie du compte (étape d'envoi de
  l'e-mail de vérification) ; la page de connexion ne redirige pas quand l'utilisateur est déjà connecté.
- `npm run lint` ne peut pas tourner : aucune configuration ESLint dans `app/`.
