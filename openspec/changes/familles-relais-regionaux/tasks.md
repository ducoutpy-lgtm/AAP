# Tasks

Décision de Monsieur DUCOUT du 2026-10-28 (« oui pousse mais continue surtout »), après le changement
`pages-a-un-seul-appel`. Zéro euro jusqu'à 3.1. Règles : aucun push sans accord, aucun appel payant sans devis accepté.

- [x] 1.1 Listes de référence : cancéropôles (7, brochure INCa), pôles santé (6, annuaire des pôles), gérontopôles
  (liste de l'Union des gérontopôles de France) ; sites trouvés et pages d'appels vérifiées au navigateur. Fait quand :
  liste collée. (Fait le 2026-10-28 : cancéropôles Île-de-France, Grand Sud-Ouest (kgso.fr), Nord-Ouest lus au
  navigateur ; gérontopôles et pôles par un agent de recherche (lecture des pages), puis découverte au navigateur. L'Union
  publie sa liste (https://uniondesgerontopoles.fr/les-gerontopoles/, 12 gérontopôles, plus La Réunion et la
  Martinique : 14). Sans page suivie : BioValley France (appels réservés aux membres), gérontopôles Centre-Val de Loire et
  Hauts-de-France (aucune page d'appels), La Réunion et Martinique (aucun site).)
- [x] 1.2 Registre et `familles.json` mis à jour, trois extraits CSV avec `id_registre`. Fait quand :
  `registre.py --verifier-format` valide et `--tableau` affiche les trois lignes de couverture. (Fait le 2026-10-28 :
  23 sources ajoutées dont 18 avec page suivie (Atlanpole en deux pages), « Registre valide : 1230 sources » ;
  couverture « Cancéropôles 7 / 7 (100 %) », « Pôles de compétitivité santé 6 / 6 (100 %) », « Gérontopôles 14 / 14
  (100 %) » ; famille « Recherche » renommée sans les cancéropôles, total estimé 37 -> 30.)
- [x] 1.3 Relais vers les sites des financeurs (constat de la première découverte, `design.md`) : tests rouges
  (`relais` gardé hors site, source ordinaire inchangée, contrôle du champ), puis code (`decouverte`, `rejeu`,
  `registre`), puis `relais: true` sur les relais. Fait quand : tous les tests verts, sortie collée. (Fait le 2026-10-28 :
  première découverte 14 pages retenues sur 18, Kozh Ensemble 1 lien, Atlanpole régionaux 1 ; rouge « 3 failed, 20
  passed » ; vert « 135 passed » ; `relais: true` sur 22 sources ; seconde découverte : Kozh 20 liens dont
  fondationdomicile.fr, Atlanpole régionaux 16, nationaux 7, Biotech Santé Bretagne 19 ; trois délais dépassés relancés
  (Sud 10, Pays de la Loire 3, Grand Est sans appel ce jour).)
- [x] 2.1 Découverte (`--forcer --garder-depart`), veille et collecte des nouveaux membres : statuts et nombre de textes
  collés. (Fait le 2026-10-28 : découverte en 1.3 ; `rejeu.py --relire --collecter` sur les 22 relais : « 170 pages
  lues » ; textes trop courts ignorés : 11 sur 12 chez Eurobiomed (pages de détail chargées par script ou réservées),
  quelques-uns ailleurs.)
- [x] 2.2 Devis de l'extraction affiché, rien de lancé. (Fait le 2026-10-28 : « 170 textes restants, 652 410
  caractères ; coût estimé 0.22 euros au plus ; déjà dépensé 2.433 euros » ; même devis sans filtre : aucun autre texte
  en attente.)
- [x] 3.1 Après accord : extraction, contrôle et qualification avec `--plafond`, import en brouillon avec la validation
  « proposee » (file « à valider » de Monsieur DUCOUT). (Fait le 2026-10-28, accord « Oui, 0,28 euro » : extraction
  `--plafond 2.653`, « 102 nouvelles », 68 pages refusées, cumul 2,433 -> 2,603 ; contrôle (devis 0,019, réserve 0,04,
  `--plafond 2.643`) « 53 fiches vérifiées », cumul 2,639 ; qualification (devis 0,017, `--plafond 2.663`) « 53 fiches
  qualifiées », cumul 2,657 ; total 0,224 euro. Import des seules fiches nouvelles des 22 relais (fonctions de
  `scripts/import_to_firestore.py`, édition 2025-2026 Béatrice Denys exclue) : « 71 créés », relus « draft, proposee :
  64 ; archived, rejetee : 7 » ; 38 déjà en base non touchées, 71 closes écartées. Base : 856 fiches, 92 « proposee ».)
- [x] 4.1 Documentation : `scraping/README.md`, `scraping/CHANGELOG.md`, `CLAUDE.md`, `REPRISE.md`.
- [ ] 5.1 Vérification par Monsieur DUCOUT : il lit les trois lignes de couverture de `REGISTRE_SOURCES.md` et relit
  les fiches importées dans `/admin/aaps`.
