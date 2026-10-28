# Design

## Constat (2026-10-28)

- La veille et la collecte ne lisent que les sources dont la qualification vaut « rubrique-confirmee »
  (`extraction_locale.sources_confirmees`) ; 79 des sources de collectivités départementales sont « a-verifier » et ne
  sont donc jamais relues.
- La collecte écarte les liens vers des fichiers (`FICHIERS_IGNORES` d'`echantillon.py` : `.pdf`, `.doc`, ...). Or
  plusieurs départements publient l'appel CFPPA comme un cahier des charges en PDF lié depuis leur rubrique (Gard,
  Puy-de-Dôme, Creuse, Orne, Eure, Mayenne vus dans `liens.json`).

## Décisions

1. **Recherche par agents de recherche web**, 2 à 3 recherches par département, page candidate ouverte pour vérifier la
   mention de la conférence et d'un appel ; aucune adresse inventée ; résultat en JSON (code, page stable, type,
   page de l'édition, édition, date de clôture, preuve). Pourquoi : 75 départements, trop pour le navigateur un par un ;
   la découverte, ensuite, relit chaque page retenue au navigateur et sert de seconde vérification.
2. **Préférer une page stable** : rubrique « appels à projets » du département, puis page permanente de la conférence,
   puis seulement la page de l'édition en cours (réglage `page_appel` pour qu'elle soit gardée comme un lien). Pourquoi :
   la veille relit la même adresse chaque semaine ; une page d'édition change d'adresse chaque année.
3. **Règle d'inscription au registre**, dans cet ordre :
   - la source du département liste déjà l'appel CFPPA (lien repéré dans son `liens.json`) et est en rubrique
     confirmée : `id_registre` = cette source, rien d'autre ;
   - la page stable est la rubrique « appels à projets » du département et sa source n'a pas d'`url_validee` : l'adresse
     y est posée (`validee_par` = « session Claude Code (recherche web, lot B1), à confirmer à l'écran par Monsieur
     DUCOUT »), la qualification passe en « rubrique-confirmee » avec un bloc `relecture` qui en donne le motif (le
     verdict du modèle reste dans `verdict_modele`) ;
   - sinon : source dédiée `<departement>-commission-des-financeurs` (nom « <Département> – Conférence des financeurs
     (CFPPA) », catégorie `collectivite`, périmètre `medico-social`), comme les six sources dédiées existantes.
   Une adresse validée par Monsieur DUCOUT n'est jamais remplacée, et la source d'un département déjà suivie par la
   veille (rubrique confirmée avec `liens.json`) n'est pas redirigée : une source dédiée est créée. Pourquoi : une même
   page suivie par deux sources produirait des fiches en double ; une rubrique du département sert aussi ses autres
   appels, qu'une redirection ferait perdre.
   Une page inscrite dont la recherche n'a pas vu l'appel ce jour (rubrique vide, page qui ne s'ouvre pas) est suivie par
   la veille mais ne compte pas dans la couverture : sa ligne garde un `id_registre` vide et le motif.
4. **Métropole de Lyon** : ligne propre (`69M`), sa conférence est distincte de celle du Rhône. Alsace : les lignes 67
   et 68 pointent vers la même source si la Collectivité européenne d'Alsace publie un seul appel ; même règle pour la
   Corse (2A, 2B).
5. **PDF** : compter, ne pas lire. La lecture des PDF changerait la collecte de toutes les sources (doublons entre
   cahier des charges et dossier de candidature, textes longs donc coût) : elle mérite son propre changement, décidé sur
   la mesure.

## Risques

- Une page trouvée par la recherche peut être vieille (édition 2024) : l'édition et la date de clôture sont notées ; la
  veille dira si une édition nouvelle apparaît.
- Un département peut ne publier l'appel que par un relais (Carsat, MSA, démarches simplifiées) : noté en motif ; la
  source relais existante est rattachée si elle est suivie.
