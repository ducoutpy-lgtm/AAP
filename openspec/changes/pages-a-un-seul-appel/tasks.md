# Tasks

Demande de Monsieur DUCOUT du 2026-10-27 (« dis-moi si tu les avais identifiés, et si non pourquoi, et ensuite corrige
pourquoi »). Zéro euro jusqu'à la tâche 3.1. Règles : aucun `git push`, aucun appel payant sans devis accepté.

- [x] 1.1 Tests rouges dans `tests/test_decouverte.py` et `tests/test_registre.py` (la veille n'a pas de fonction pure
  propre : elle appelle `decouverte.retenir`, testée) : page validée à un seul lien retenue avec `seuil=1` et refusée
  avec le défaut ; lien de la page d'appel ; contrôle de `page_appel`. Fait quand : pytest rouge collé. (Fait le
  2026-10-27 : « 3 failed, 17 passed » ; `AttributeError` sur `reglages` et `retenir`, « assert 0 == 2 » pour le registre.)
- [x] 1.2 Code : `choisir_rubrique(..., minimum)`, `reglages`, `lien_page_appel`, `retenir`, `traiter_source` (seuil et
  page d'appel, écrits dans `liens.json`), `rejeu.relire_source` (mêmes réglages lus dans `liens.json`),
  `registre.erreurs_format`. Fait quand : tous les tests de `scraping/tests` verts, sortie collée. (Fait le 2026-10-27 :
  « 132 passed in 8.54s ».)
- [x] 2.1 Registre : `url_validee` de `fehap` = `https://novap.fehap.fr/` ; source `gerondif` (page de l'appel Tubbe,
  `page_appel: true`) ; source `fondation-beatrice-denys` en « identifiée » ; qualification « rubrique-confirmee » des
  deux premières avec la mention de la demande de Monsieur DUCOUT. Fait quand : `registre.py --verifier-format` valide.
  (Fait le 2026-10-27 : « Registre valide : 1202 sources ».)
- [x] 2.2 Découverte `decouverte.py --ids fehap,gerondif,anap --forcer --garder-depart` : statuts et liens collés. (Fait
  le 2026-10-27 : « rubrique-trouvee » pour les trois, un lien chacune : appel à candidatures 2026 de novap, page Tubbe
  elle-même, Achats innovants de l'ANAP ; `liens.json` porte `seuil: 1` et, pour Gérond'if, `page_appel: true`.)
- [x] 2.3 Veille et collecte `rejeu.py --relire --collecter --ids fehap,gerondif,anap` : nombre de textes nouveaux collé
  (zéro euro). (Fait le 2026-10-27 : « 3 sources relues, 0 ignorées » (l'ANAP n'est plus écartée pour « moins de
  deux ») ; « 2 pages lues » : novap (1 646 caractères, 10 000 euros par lauréat, 31 octobre) et Tubbe (10 059
  caractères, 6 novembre) ; devis `--dry-run` : 2 textes, coût estimé 0,00 euro arrondi, cumul Haiku 2,321 euros.)
- [x] 3.1 Devis de l'extraction des textes nouveaux par Haiku, accord de Monsieur DUCOUT, passage avec `--plafond`,
  import en brouillon puis contrôle. (Fait le 2026-10-27, accord : « extraction des 2 textes avec --plafond, puis
  contrôle et qualification (chacun avec son devis dans une enveloppe de 3 centimes), import en brouillon ».
  Extraction `--plafond 2.331` : 2 fiches, cumul 2,321 -> 2,326 euros. Contrôle (devis 0,001, `--plafond 2.327`) :
  0 douteux, cumul 2,328, soit un millième au-delà du devis et du plafond (le plafond s'appuie sur l'estimation avant
  chaque appel). Qualification (devis 0,001, `--plafond 2.329`) : cumul 2,329. Total 0,008 euro. La règle d'import
  aurait publié les deux fiches (validées par le modèle) : import des deux seules fiches, statut forcé en brouillon à la
  demande de Monsieur DUCOUT, par les fonctions de `scripts/import_to_firestore.py` : « 2 crees », relues en base
  `draft`, validation `validee` : `scraped-5412e94e90e4556d` (novap, clôture 2026-10-31) et `scraped-57e8d5bfa26af4e6`
  (Tubbe, clôture 2026-11-06).)
- [x] 3.2 Relais de la Fondation Béatrice Denys (demande de Monsieur DUCOUT du 2026-10-27) : sources
  `turenne-groupe-actualites`, `canceropole-clara`, `canceropole-paca`, `eurasante`, `biotech-sante-bretagne` en rubrique
  confirmée avec leur page de liste ; note de `fondation-beatrice-denys` mise à jour. Fait quand : registre valide.
  (Fait le 2026-10-27 : « Registre valide : 1207 sources » ; aucune de ces pages ni la FRM ne publie encore l'édition
  2026-2027, contrôle au navigateur. Découverte : CLARA 61 liens, PACA 12, Eurasanté 24, Biotech Santé Bretagne 10,
  Turenne « aucune-rubrique ». Turenne n'aurait jamais été relue : test `test_page_validee_sans_appel_gardee_pour_la_veille`
  rouge (« 1 failed »), puis `decouverte.fichier_de_liens` : 133 tests verts ; redécouverte de Turenne : `liens.json`
  écrit avec une liste vide.)
- [x] 3.3 Découverte des cinq relais (`--forcer --garder-depart`) puis veille et collecte : statuts, nombre de liens et
  de textes collés ; devis de l'extraction affiché, rien de lancé sans accord. (Fait le 2026-10-27 : « 4 sources relues,
  1 ignorées » (Turenne relue, « aucun lien d'appel lisible », et non plus « pas de liens.json ») ; « 107 pages lues »
  (CLARA 61, Eurasanté 24, PACA 12, Biotech Santé Bretagne 10 ; 25 liens mentionnent 2026 ou 2027) ; devis `--dry-run` :
  107 textes, 304 330 caractères, 0,13 euro au plus, cumul Haiku 2,329 euros.)
- [x] 3.4 Extraction des textes des relais, après accord sur le devis de 3.3 (`--plafond` = cumul + devis), puis contrôle
  et qualification avec leur devis, import. (Fait le 2026-10-27. Second accord : « J'accepte jusqu'à 0,02 euro : fin du
  contrôle (11 fiches, --plafond 2.426) puis qualification (27 fiches, --plafond 2.440), puis import en brouillon sans
  la fiche Béatrice Denys 2025-2026 ». Contrôle : « 11 fiches vérifiées », cumul 2,426. Qualification : « 27 fiches
  qualifiées », cumul 2,433. Coût total des relais 0,104 euro. Import (fonctions de `scripts/import_to_firestore.py`,
  limité aux cinq relais, brouillon forcé) : essai à blanc « 34 retenues, clos 44, exclue 1, 25 que la règle aurait
  publiées, déjà en base 0 », puis « 34 crees », relus en base « draft : 34 ». Premier accord : « J'accepte le devis de 0,13 euro :
  extraction des 107 textes des relais avec --plafond 2.459, puis contrôle et qualification chacun avec son devis,
  import en brouillon ». Extraction : « 1057 réussites (79 nouvelles) », 28 pages refusées, cumul 2,329 -> 2,411 euros
  (0,082 réel). Contrôle : devis 27 fiches 0,009 euro, `--plafond 2.420` : arrêt au plafond après 16 fiches (cumul
  2,420), le devis sous-estime ; reste 11 fiches (nouveau devis 0,003) et la qualification (27 fiches, devis 0,008),
  en attente d'accord. La fiche « AAP Fondation Béatrice Denys 2025-2026 » (CLARA) est l'édition close, sans date lue.)
- [x] 3.5 Fiche Fondation Béatrice Denys 2026-2027 saisie à la main (demande de Monsieur DUCOUT, PDF officiel du 22 octobre
  2026 transmis par lui ; la page refer-rythmo qu'il citait est l'édition 2025-2026, close le 21 novembre 2025). Fiche
  construite par les fonctions de l'import, lien vers la page de la fondation sur le site de la FRM, brouillon,
  validation « proposee » : `scraped-1e89be200d1014a7`, « 1 cree(s) », relue en base (draft, proposee, clôture
  2026-11-22). Constat : les 34 + 2 fiches importées plus tôt portent « validee » (modèle) en brouillon, hors de sa file
  « à valider » ; sur son accord (« passe les 27 brouillons du jour validés par le modèle (dont novap et Tubbe) en
  Proposée, non relue, avec une sauvegarde avant »), sauvegarde `scripts/sauvegardes/proposees_2026-10-27_1607.json`
  puis passage : « Relus en base : draft, proposee (27 fiches) » ; base : 28 fiches « proposee », toutes en brouillon.
- [x] 4.1 Documentation (faite le 2026-10-27) : `scraping/README.md`, `scraping/CHANGELOG.md`, `docs/FEUILLE_DE_ROUTE.md` (chantier « Pages à
  un seul appel »), `CLAUDE.md`, `REPRISE.md`.
- [ ] 5.1 Vérification par Monsieur DUCOUT : il relance la commande de 2.2 et lit « rubrique-trouvee » pour la FEHAP
  et Gérond'if, puis retrouve les appels novap et Tubbe en brouillon dans `/admin/aaps` et les publie (bouton « Publier »)
  ou les rejette.
