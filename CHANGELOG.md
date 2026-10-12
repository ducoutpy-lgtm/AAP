# Changelog

Toutes les modifications notables du dépôt AAP Santé sont documentées ici (format Keep a Changelog, en
français). Le journal propre au volet scraping reste dans `scraping/CHANGELOG.md`.

## [Non publié]

### Ajouté
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
