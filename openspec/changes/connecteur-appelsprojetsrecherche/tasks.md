# Tasks

Décision de Monsieur DUCOUT du 2026-10-21 (« 1 oui »). Zéro euro jusqu'au devis du classement du champ. Règles :
aucun `git push`, aucun archivage sans demande.

- [x] 1.1 Fonctions pures `fiche_depuis_ligne` (ligne CSV -> `AapNormalized`, dates ISO, ligne vide ignorée) et
  `resume(fiches)` (compteurs), testées dans `tests/test_portail_recherche.py` sur trois lignes d'exemple. Fait quand :
  pytest vert, sortie collée. (Fait le 2026-10-21 : « 3 passed in 0.25s ».)
- [x] 1.2 `portail_recherche.py` : téléchargement, écriture de `results/appelsprojetsrecherche.json`, message en cas
  d'échec sans toucher au fichier précédent. Fait quand : exécution réelle, compteurs collés (lignes lues, fiches,
  ouvertes). (Fait le 2026-10-21 : « 125 lignes lues, 125 fiches écrites (0 ignorées), 52 encore ouvertes » ; ANR 55, INCa 18,
  ADEME 11, ANRS-MIE 7.)
- [ ] 1.3 Classement du champ par Haiku sur accord (`champ.py --classer --moteur api --dry-run` puis réel), contrôle et
  qualification des fiches ouvertes (devis), import. Fait quand : devis et coût réel collés, « ZEROEXPO » visible
  dans l'essai à blanc de l'import avec le financeur INCa. (En cours le 2026-10-21 : classement fait, devis 0,021 euro
  sous les 0,03 acceptés, réel 0,022 : santé 57, hors champ 65, incertain 3 ; 26 ouvertes en santé. Contrôle et
  qualification des 28 fiches ouvertes : devis 0,015 euro, en attente d'accord ; import ensuite.)
- [x] 1.4 `veille.cmd` : appel du script avant l'import ; README scraping, CHANGELOG, CLAUDE.md, REPRISE.md. (Fait le 2026-10-21.)
- [ ] 2.1 Vérification par Monsieur DUCOUT : il ouvre la recherche de l'application, filtre par financeur INCa et
  retrouve ZEROEXPO avec sa date de clôture.
