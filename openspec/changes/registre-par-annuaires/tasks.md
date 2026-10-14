# Tasks

Règle « Preuve avant affirmation » : chaque tâche n'est cochée qu'avec la preuve indiquée.
Décision de Monsieur DUCOUT du 2026-10-13 : première vague = les 664 fondations reconnues d'utilité
publique et d'entreprise du RNF à domaine santé-social.

## 1. Inventaire et annuaire

- [x] 1.1 Inventaire des familles (`design.md`) relu et validé par Monsieur DUCOUT, familles ajoutées ou
  retirées selon ses remarques. Fait quand : il dit OK ; `sources/annuaires/familles.json` écrit avec
  annuaire, adresse, date et total par famille (ou « non mesuré »). (Fait le 2026-10-13 : « ok pour l'inventaire » ;
  23 familles écrites.)
- [x] 1.2 `annuaires.py --rnf` : lecture du fichier RNF, filtre, extrait versionné. Fait quand : test
  unitaire vert sur un petit fichier RNF fabriqué ; sortie « 664 fondations retenues (409 RUP, 255
  d'entreprise) sur 4 072 actives » collée ; fichier commité dans `sources/annuaires/`. (Fait le 2026-10-13 : pytest 3 passed ; sortie « 664 fondations retenues (409 RUP, 255 d'entreprise) sur 4072 actives » ; fichier de 664 lignes écrit, commit en attente de la demande de Monsieur DUCOUT.)
- [x] 1.3 Rapprochement avec les 848 entrées (SIRET puis nom normalisé) : liste des correspondances sûres
  et des douteuses. Fait quand : la liste est soumise à Monsieur DUCOUT et ses décisions appliquées.
  (En cours le 2026-10-13 : le registre n'a pas de SIRET, rapprochement par nom normalisé seulement ; `--rapprocher` :
  19 sûres, identifiant rempli ; 35 douteuses dans `sources/annuaires/rapprochements_douteux.md`, décision du 2026-10-13 : aucune fusion, toutes créées à part.)

## 2. Sites web et entrée au registre

- [x] 2.1 Recherche du site de chaque fondation sans correspondance, par l'outil du changement
  `recherche-page-aap-par-source` (essai sur 10 fondations d'abord ; si le moteur gratuit bloque,
  coût d'une clé d'API chiffré et soumis avant usage). Fait quand : colonne « site trouvé » remplie,
  nombre de sites non trouvés affiché.
  (Essai du 2026-10-13 : le moteur gratuit (DuckDuckGo HTML, `recherche_web.py`) refuse dès la première requête
  automatique (code 202, page de défi) : écarté. La recherche web de la session fonctionne mais demande un jugement
  par résultat (annuaires d'entreprises et pages de dons en tête) : 2 sites trouvés et vérifiés sur 3 essais
  (Fondation pour l'Audition, Fondation Michelin ; ARHM sans site trouvé). Puis clés Tavily du projet Scrapling (`recherche_web.chercher_tavily`, `annuaires.py --chercher`) : 191 fondations rapprochées ou dotées d'un site vérifié au 2026-10-13 soir (dont 172 créées au registre), 28 sans site identifiable, 445 restantes ; les deux clés ont atteint la limite de leur plan (code 432). Puis recherche web de la session (consigne de Monsieur DUCOUT du 2026-10-13 soir) : 203 fondations, 100 sites inscrits et intégrés, 96 sans site, 8 rapprochées d'entrées existantes, 16 à resonder ; 298 / 664 au 2026-10-13 soir, puis fin de la vague dans la nuit : 445 fondations traitées par la session (165 sites inscrits,
  271 sans site dont 62 hors champ non cherchées, 9 déjà au registre), « 65 entrées créées au registre (1198 sources) »,
  « 365 / 664 (54 %) » en tête de REGISTRE_SOURCES.md, 22 adresses à resonder. Règles de sélection du site resserrées cinq fois après contrôle des lots (homonymes, mots géographiques, sous-domaines techniques, sigles, choix du meilleur résultat), 8 tests.)
- [x] 2.2 `annuaires.py --integrer` : entrées créées au statut « identifiée », note « RNF <numéro> »,
  `registre.py --verifier-format` sans erreur, `--verifier-pages` sur les nouvelles entrées seulement.
  Fait quand : nombre d'entrées créées et registre valide collés. (Fait le 2026-10-13 : « 172 entrées créées au registre (1022 sources) », « Registre valide : 1022 sources » ; le soir : « 100 entrées créées au registre (1123 sources) », « Registre valide : 1123 sources » ; `--verifier-pages` non relancé, les sites ont été vérifiés un par un à l'inscription.)
- [x] 2.3 Taux de couverture par famille en tête de `REGISTRE_SOURCES.md`. Fait quand : la ligne des
  fondations affiche n / 664. (Fait le 2026-10-13 : « 191 / 664 (28 %) » en tête de `REGISTRE_SOURCES.md`, `registre.py couverture()`.)

## 3. Découverte, qualification, documentation

- [ ] 3.1 `decouverte.py` puis `qualification.py` sur les nouvelles entrées (tâche de fond, plusieurs
  heures), puis relecture des pages par Monsieur DUCOUT dans l'outil de validation (mode pages).
  Fait quand : `DECOUVERTE.md` et `QUALIFICATION.md` régénérés, verdicts enregistrés.
- [ ] 3.2 Documentation : README scraping (section registre : annuaires et couverture), CHANGELOGs,
  CLAUDE.md, REPRISE.md, feuille de route (étape 1 : couverture mesurée). Fait quand : à jour.

## 4. Vérification par Monsieur DUCOUT

- [ ] 4.1 Monsieur DUCOUT rejoue « Taux de couverture visible » et « Extrait de la première vague »,
  et choisit une fondation qu'il connaît pour vérifier qu'elle est au registre ou listée « site non
  trouvé ». Fait quand : il dit OK ou décrit l'écart.
