# Journal des modifications

Ce fichier liste les changements notables apportés au POC AAP Santé.

## [Non publié]

### Ajouté (2026-10-28, après-midi)
- `funding_tenders.py` (changement `connecteur-funding-tenders`, lot A1 du pilote) : appels européens de santé lus par
  l'interface de recherche publique du portail Funding & Tenders (pôle Santé d'Horizon Europe, mission Cancer, IHI,
  EDCTP3, EU4Health), sans navigateur ni modèle : vrai financeur, dates et montants structurés, lien officiel. Lecture
  triée par identifiant (sans tri, deux lectures différaient de 190 appels), appels au statut périmé écartés, qualification
  et contrôle repris d'une lecture à l'autre. 24 appels ouverts, qualifiés (0,006 euro) et importés en « Proposée, non
  relue ». Appelé par `veille.cmd`. Sept tests ajoutés.

### Corrigé (2026-10-28, après-midi)
- `verification.decision_du_modele` : dates et montants d'une fiche du portail européen (`moteur` = `api-portail`) ne
  sont plus retirés sur un verdict « fabriqué » du modèle, qui ne les voit pas dans la description (test ajouté).

### Ajouté (2026-10-28)
- Changement `familles-relais-regionaux` (décision de Monsieur DUCOUT : « continue surtout ») : trois familles de relais
  régionaux de la santé au registre, avec leur liste de référence et leur couverture mesurée (`sources/annuaires/
  canceropoles.csv`, `poles_sante.csv`, `gerontopoles.csv`) : cancéropôles 7 / 7, pôles de compétitivité santé 6 / 6,
  gérontopôles 14 / 14 (liste de l'Union des gérontopôles de France). 23 sources ajoutées (registre : 1 230), dont 18
  pages suivies par la veille.
- Champ `relais` au registre : la découverte et la veille gardent aussi les liens d'appel vers les sites des
  financeurs (`decouverte.liens_aap`, `liens_contenu`, `reglages`, `retenir` ; `rejeu.relire_source` ;
  contrôle dans `registre.erreurs_format`). Deux tests ajoutés, 135 verts. Kozh Ensemble passe de 1 à 20 liens,
  Atlanpole régionaux de 1 à 16.
- Sur accord (0,28 euro) : 170 textes collectés sur les 22 relais, 102 fiches extraites, 53 contrôlées et qualifiées ;
  0,224 euro réel, cumul Haiku 2,657 euros. Import des fiches nouvelles : 71 créées (64 en brouillon « Proposée, non
  relue », 7 archivées par le modèle), 71 appels clos écartés. Base : 856 fiches, 92 dans la file « à valider ».

### Corrigé (2026-10-27)
- Changement `pages-a-un-seul-appel`, après quatre publications LinkedIn transmises par Monsieur DUCOUT (novap de la
  FEHAP, Tubbe de Gérond'if, prix de la Fondation Béatrice Denys, et un don d'Amazon qui n'est pas un appel) : aucun des
  trois appels n'était connu. `decouverte.choisir_rubrique` prend un seuil ; une page validée à la main (`url_validee`)
  est retenue dès un lien d'appel au lieu de deux ; champ facultatif `page_appel` au registre (la page est elle-même
  l'appel), contrôlé par `registre.py --verifier-format` ; la veille relit ces réglages dans `liens.json`. Trois tests
  ajoutés, 132 verts.
- Registre (1 202 sources) : FEHAP pointée sur son site novap (`https://novap.fehap.fr/`) ; Gérond'if ajouté (page de
  l'appel Tubbe, `page_appel`) ; Fondation Béatrice Denys ajoutée en « identifiée » (appel diffusé en PDF seulement,
  aucune page à suivre). Redécouverte : FEHAP, Gérond'if et ANAP « rubrique-trouvee » (l'ANAP était sautée faute de
  deux liens) ; deux textes collectés (novap, Tubbe).
- Sur accord (enveloppe de 3 centimes) : extraction, contrôle (0 douteux) et qualification des deux textes par Haiku,
  0,008 euro en tout (le contrôle a coûté 0,002 pour un devis de 0,001) ; cumul Haiku 2,329 euros. Import des deux
  seules fiches en brouillon (la règle habituelle les aurait publiées) : novap (clôture 31 octobre) et Tubbe (6 novembre),
  à publier ou rejeter par Monsieur DUCOUT dans `/admin/aaps`.
- Fondation Béatrice Denys (demande de Monsieur DUCOUT : « peu importe que ce soit sur le site web en lui-même ou un
  autre site web qui relaie ») : au 2026-10-27, aucune page web ne publie l'édition 2026-2027. Cinq relais qui ont diffusé
  les éditions précédentes inscrits en rubrique confirmée (registre : 1 207 sources) : Turenne Groupe (actualités),
  Cancéropôle CLARA (61 liens), Cancéropôle PACA (12), Eurasanté (24), Biotech Santé Bretagne (10). Une page validée sans
  appel ce jour-là (Turenne) garde un `liens.json` vide pour que la veille la relise (`decouverte.fichier_de_liens`,
  test ajouté, 133 verts).
- Sur accord (devis 0,13 euro) : extraction des 107 textes des relais, 79 fiches nouvelles, 28 pages refusées, 0,082
  euro réel. Contrôle arrêté au plafond après 16 fiches sur 27 (devis 0,009 euro sous-estimé) ; cumul Haiku 2,420 euros.
  Second accord (0,02 euro) : fin du contrôle (11 fiches) et qualification (27), cumul Haiku 2,433 euros ; coût total
  des relais 0,104 euro. Import des seules fiches des relais, en brouillon : 34 créées (25 que la règle aurait
  publiées), 44 appels clos écartés, édition 2025-2026 de la Fondation Béatrice Denys exclue (close, sans date lue).
- Fiche Fondation Béatrice Denys 2026-2027 (28e prix) saisie à la main d'après le PDF officiel du 22 octobre 2026 transmis
  par Monsieur DUCOUT (aucune page web ne le publie) : brouillon, « Proposée, non relue », clôture des lettres
  d'intention le 22 novembre 2026, 80 000 à 100 000 euros.
- Les 27 brouillons du jour portaient la validation « Validée » du modèle et sortaient de la file « à valider » de
  Monsieur DUCOUT : passés en « Proposée, non relue » sur son accord (sauvegarde
  `scripts/sauvegardes/proposees_2026-10-27_1607.json`, verdict du modèle gardé dans le commentaire). File : 28 fiches.

### Ajouté (2026-10-21, après-midi)
- `portail_recherche.py` (changement `connecteur-appelsprojetsrecherche`) : fiches du portail appelsprojetsrecherche.fr
  construites depuis son export CSV, sans navigateur ni modèle ; 125 fiches, 52 ouvertes ; champ classé par Haiku
  (0,022 euro) : santé 57, hors champ 65, incertain 3 ; appelé par `veille.cmd` ; trois tests.
- Doublon Prix qualité 2026 ARS Hauts-de-France : relais FHF rejeté par verdict humain (`verdicts_fiches.json`,
  décision de Monsieur DUCOUT), fiche ARS conservée.

### Corrigé (2026-10-21, après-midi)
- `verification.decision_du_modele` : les dates d'une fiche issue d'une colonne structurée (`moteur` = `csv`) ne sont plus
  retirées sur un verdict « fabriqué » du modèle, qui ne voit que la description (test ajouté). Contrôle et qualification
  des 28 fiches ouvertes du portail faits sur accord (0,018 euro) ; import : 50 fiches créées, 23 publiées ; trois
  dates de clôture retirées à tort avant la correction, remises en base le 2026-10-21 sur accord (ZEROEXPO 24/11/2026,
  THCS 30/06/2027, surpoids et obésité 19/01/2027 ; sauvegarde `scripts/sauvegardes/dates_portail_2026-10-21.json`).
- ANAP : fil des actualités confirmé comme page de publication (un seul appel, fichier de liens posé à la main sur accord),
  appel « Achats innovants » extrait (0,002 euro) : clos le 2026-09-30, non publié. Cumul Haiku : 2,281 euros.
- `decouverte.extraire_liens` résout les adresses relatives depuis `document.baseURI` (balise `<base>` suivie comme
  par le navigateur) : les liens de la FIRAH sortaient en `/fr/fr/...` (404). Test local ajouté (changement
  `decouverte-shadow-dom`, tâche 1.5).
- Extraction FIRAH et IReSP sur accord (devis 0,04 euro, réel 0,034) : IReSP 20 fiches, toutes closes (2022 à avril 2026) ;
  FIRAH 4 fiches 2026, closes (23 mars et 5 octobre). Rien d'importable aujourd'hui ; la veille suivra les prochaines
  éditions. Cumul Haiku : 2,279 euros.
- Registre : FIRAH (l'adresse validée le 2026-10-13 pointait vers la Fondation OCIRP ; page « Déposer un projet » posée, 4 appels,
  6 liens) et IReSP (page « Appels à projets », 22 appels, 27 liens) ; constats notés pour douze autres sources de la liste
  prioritaire (pages 404, sites qui refusent le robot, listes chargées par script). Textes collectés : FIRAH 6, IReSP 26 ;
  extraction en attente de devis (0,04 euro).

### Ajouté (2026-10-21)
- `SOURCES_PRIORITAIRES.md` : trente émetteurs nationaux lus au navigateur, bilan du nombre qui alimentent la veille ;
  anomalies relevées (FIRAH pointant vers l'OCIRP, Bpifrance et ameli en 403, Anses et IReSP sans lien d'appel lu).
- Découverte : mots-clés anglais, codes HORIZON-HLTH et EU4H, jetons d'adresse `appel`, `appels`, `call`, `calls`
  (changement `decouverte-mots-cles`) ; HaDEA rubrique trouvée (20 liens, confirmée), appelsprojetsrecherche.fr 6 liens.
- ANRS : neuf textes extraits par Haiku (0,014 euro, devis 0,01 accepté), trois appels ouverts contrôlés, qualifiés
  (0,002 euro) et importés publiés.
- Registre : `anrs-mie` (ANRS Maladies infectieuses émergentes, page des appels, découverte : 9 liens, rubrique confirmée,
  textes collectés, extraction en attente de devis) et `appelsprojetsrecherche-fr` (portail commun ANR, Inserm, ANRS, Anses,
  INCa ; découverte : aucune rubrique, liens « Lire la suite » sans mot-clé), d'après la liste de vingt sites de
  Monsieur DUCOUT (recherche Perplexity) : 18 étaient déjà au registre, 11 alimentent la veille. Constats notés sur les
  sept sources inscrites sans rubrique lisible (sante.gouv.fr racine = doublon de la page DGOS ; portail européen
  dynamique ; HaDEA et Horizon Europe en anglais ou en codes, mots-clés français seulement ; info.gouv.fr refuse le
  navigateur (403) ; Banque des Territoires sans rubrique ; AP-HM : page des appels maladies rares posée en adresse validée).

### Modifié (2026-10-21)
- `decouverte.extraire_liens` lit les liens par le sélecteur de Playwright, qui traverse les shadow DOM ouverts
  (changement `decouverte-shadow-dom`, accord de Monsieur DUCOUT) : page des actualités de l'ANAP, 27 liens lus au lieu
  de 14 ; test local sans réseau. L'ANAP reste « aucune rubrique » : un seul lien d'appel sur la page.
- ANR : seize textes de la nouvelle page extraits par Haiku le 2026-10-21 sur accord (devis 0,03 euro, réel 0,0325) :
  13 fiches, une seule dans le champ (PEPR PROPSY « Psychiatrie de précision », clôture 2026-11-10), contrôlée et
  qualifiée (0,002 euro) ; les douze autres sont des appels de recherche hors santé (climat, eau, matériaux, éducation).

### Corrigé (2026-10-21)
- Adresses ANR et ANAP du registre (question de Monsieur DUCOUT : aucune fiche de ces deux agences dans l'application).
  ANR : la découverte du 2026-10-09 avait retenu l'archive « Rechercher un ancien appel à projets » (dix appels clos,
  écartés à l'import comme expirés et classés hors champ) ; `url_validee` posée sur https://anr.fr/fr/appels/ (page des
  appels en cours indiquée par Monsieur DUCOUT le 2026-10-12), redécouverte : rubrique trouvée, 17 liens dont le PEPR
  PROPSY « Psychiatrie de précision ». ANAP : l'adresse était un article unique ; `url_validee` posée sur les actualités
  (https://www.anap.fr/s/toutes-les-actualites), redécouverte : aucune rubrique (un seul lien d'appel sur la page, et le
  site Salesforce rend ses liens dans un shadow DOM que `decouverte.py` ne lit pas : 14 liens vus sur 29). Constat : l'ANAP
  publie peu d'appels en propre (7 articles sur 1 086 de son plan de site évoquent un appel), elle relaie surtout des
  appels nationaux de la DGOS déjà vus par la FHF Hauts-de-France.

### Ajouté (2026-10-20)
- Veille automatique : tâche planifiée Windows « AAP Sante - veille hebdomadaire » (lundi 8 h, `veille.cmd auto`,
  journal `logs/veille.log`) ; garde-fou `rejeu.deja_relue` (une page relue une fois par jour au plus).
- `rejeu.py` et `veille.cmd` (changement `rejeu-collecte-veille`, lot 2) : relecture des pages validées, compteurs
  `apparu_le`, `vu_le`, `absences` sur les liens, journal `rejeux.json` par source, collecte des textes nouveaux, marquage
  des fiches (`vue_rubrique_le`, `absences`), rapport `VEILLE.md`. Zéro euro ; extraction des textes nouveaux par la
  commande V4 après devis.

### Ajouté (2026-10-19)
- Dates de collecte (changement `fraicheur-dates-collecte`, lot 2, instruction 10) : ligne d'en-tête `# collecte_le` sur
  les textes collectés, `lire_fiche` compatible, `date_collecte`, `scrape_metadata.collecte_le` écrit par les deux
  moteurs, `echantillon.py --dater-collecte` (2 047 fiches datées, sauvegarde `collecte_2026-10-19_1649`).

### Modifié (2026-10-19)
- `echantillon.py` (changement `filtre-champ-sante`, tâche 5.1) : consigne version 4, la question du champ
  (`poser_question_champ`, `question_champ_sans_echec`, `metadonnees_champ`) est posée par les deux moteurs après
  l'extraction d'une page acceptée ; la fiche porte `champ`, `champ_raison`, `champ_modele`, `champ_le`, `champ_source`
  dès sa production ; un échec donne « incertain » sans perdre la fiche ; estimation API à trois appels par texte.
  `champ.py --classer` réutilise la même fonction, en rattrapage. Trois tests ajoutés (95 verts).

### Ajouté (2026-10-15)
- `verification.py` et `extractor.verifier_fiche` (changement `verification-assistee-haiku`) : contrôle de chaque fiche
  publiable par le modèle, verdict par champ (juste, faux avec valeur lue, fabriqué, manquant, vide, incertain), essai à
  blanc, plafond, sauvegarde, rapport `VERIFICATION.md` ; 283 fiches, 0,15 euro réel. `validation.py` : fiches douteuses
  en premier et bloc « Contrôle par le modèle » dans l'écran des fiches.
- `verification.decision_du_modele`, `appliquer_corrections`, `restantes_a_relire` (2026-10-15, midi, décision de
  Monsieur DUCOUT : le contrôle vaut relecture) : fiche sans doute ou corrigeable (dates, montants lus sur la page)
  validée au nom du modèle, page sans appel rejetée, doute sur titre, financeur ou territoire laissé à relire ;
  `validation.py` ne présente plus que les fiches restantes (6 sur 486).

### Modifié (2026-10-15)
- `sources/relecture_qualification.json` et registre : 35 sources dont aucune fiche n'est dans le champ santé ou
  médico-social (familles agriculture, emploi et solidarités, préfectures, agences de l'eau, mairies, plus FSE+,
  Fondation Orange, Le Compte Asso, Avise, Interreg Sudoe, DGCOPOP Guyane, FNSO et le conseil régional de La Réunion ;
  191 fiches) passent « hors-sante » sur décision de Monsieur DUCOUT : 207 rubriques confirmées au lieu de 242, le
  prochain passage ne les collecte plus. Les 65 sources sans verdict reçoivent « a-verifier » au passage de
  `qualification.py --registre`. `QUALIFICATION.md` et `REGISTRE_SOURCES.md` régénérés.
- `extraction_locale.py` : passage global terminé à 7 h 40 (2 178 textes, 1 086 fiches dont 2 à relire, 1 070 pages
  refusées, 22 échecs, 28,6 h de calcul, 0 euro).
- `champ.py` : classement du champ des 1 086 fiches du passage local par `claude-haiku-5-5` (santé 312, médico-social
  209, hors champ 513, incertain 52 ; 1 086 appels, 0,23 euro réel pour 0,21 estimé, cumul 0,37 euro) ; rapport
  `CHAMP.md` écrit (1 191 fiches, part dans le champ par source).

### Ajouté (2026-10-14 au soir)
- `financeurs.py` et `sources/financeurs.json` (changement `nettoyage-financeurs-territoires`) : table des financeurs
  canoniques construite depuis le registre (`--construire`, 1 198 financeurs, 1 964 alias, fusion sans écraser les
  alias à la main), rattachement d'un nom lu par l'IA par ses mots sans accents ni mots vides, règle « ARS de la
  région citée », rapport des noms non rattachés (`--non-rattaches` : 572 fiches rattachées sur 932).
- `territoires.py` et `sources/departements.json` : 101 départements -> région (outre-mer compris), anciennes régions et
  provinces, 61 grandes villes ; `territoire_depuis(texte, emetteur)` lit les régions du texte puis du nom de
  l'émetteur, « france » seulement pour un appel national, « non-precise » sinon. Utilisés par l'import.
- `comparaison.py` : extraction locale du second tirage arrêtée le 2026-10-14 à 22 h 50 à la 28e page sur 50, sur
  décision de Monsieur DUCOUT (carte graphique rendue au passage global) ; Haiku avait fini les 50 pages.
- `comparaison.py` : comparaison de deux moteurs sur 50 pages (tirage reproductible par famille, `--familles`, `--ids`,
  `--mots`, `--inclure-traites`, `--score-min` ; extraction locale et API sur les mêmes textes ; écran de jugement port
  8766, `comparaison_juger.cmd` ; rapport `COMPARAISON.md`). `echantillon.extraire` et `extraire_api` acceptent une liste
  de textes et un fichier de sortie.
- `champ.py` : filtre du champ santé et médico-social (`--classer` avec essai à blanc et sauvegarde, `--evaluer`,
  `--rapport`), consigne `CONSIGNE_CHAMP` et `normaliser_champ` dans `echantillon.py`, outil `champ` dans `extractor.py` ;
  `validation.py` : touche 7 « hors champ » en mode fiches.

### Modifié (lot 0 d'assainissement, 2026-10-14)
- `validation.py` : verdicts des pages et des liens dans `sources/verdicts_pages.json` et `sources/verdicts_liens.json`
  (versionnés), option `--migrer-verdicts [--dry-run]` (sauvegarde dans `scripts/sauvegardes/`, fusion sans écraser,
  anciens fichiers renommés `.json.migre`), option `--dry-run` sur `--appliquer-pages` ; raccourcis `.cmd` mis à jour.
- `extractor.py` : modèle en paramètre, table de tarifs par modèle (`TARIFS_USD_PAR_MTOK`, prix vérifiés le
  2026-10-14), question fermée `est_un_aap`, champ `etape` dans le journal des coûts ; modèle sans tarif refusé.
- `echantillon.py` : moteur `api` sur les 45 textes de l'échantillon, plafond de dépense (`--plafond`, 5 euros),
  coût réel dans le rapport ; tests des fonctions pures. Mesure du 2026-10-14 avec `claude-haiku-5-5` : 40 textes
  traités (les 5 textes FIRAH existent mais leur rubrique n'est plus retenue par la sélection par famille), puis lecture par adresse
  (`fiches_par_adresse`, toutes les rubriques découvertes, un texte par adresse) et 5 textes FIRAH mesurés : 21 fiches,
  19 justes sur 20 comparées, 1 fabriquée, 4 pages de référence refusées à tort à la question fermée, seuil 20/2 manqué
  d'une fiche, 0,03 euro pour 66 appels.
- Import (`scripts/import_to_firestore.py`) : étiquette `a-verifier` dérivée de `validation.statut`, `validation.par`,
  liste blanche des champs (`ChampInconnu`), `deadline` nulle pour une fiche sans date, écriture extraite en
  `ecrire_documents` testée sur un faux Firestore ; `scripts/migrer_echeances.py`.

### Modifié (organisation des données validées, 2026-10-14)
- Registre : `url_validee`, `validee_par`, `validee_le` à côté de `url_aap` (adresse d'origine) ; `registre.adresse_aap`
  lu par `decouverte.py`, `registre.py --verifier-pages`, `validation.py` ; 42 corrections passées migrées.
- `validation.py` : verdicts sur les fiches dans `sources/verdicts_fiches.json` (versionné), option `--ouvertes`,
  migration de `results/validation_manuelle.json` ; `validation_fiches.cmd` ne présente que les fiches ouvertes.
- `echantillon.py` : `produite_le` et `version_consigne` dans `scrape_metadata` de chaque fiche.
- Import (`scripts/import_to_firestore.py`) : identifiant dérivé de l'adresse, champs humains jamais réécrits,
  verdicts appliqués, fiches sans date en brouillon, fichiers de verdicts et pages refusées exclus de l'import
  global ; `scripts/migrer_identifiants.py` ; tests `scripts/tests/`.

### Ajouté (extraction locale globale, 2026-10-13 soir)
- `extraction_locale.py` (changement `extraction-locale-globale`, décision de Monsieur DUCOUT : modèle local, zéro euro,
  fiches à vérifier) : `--collecter` (texte de chaque lien web des 242 rubriques validées, une adresse une fois,
  2 395 adresses uniques), `--extraire --modele qwen3:8b` (chaîne de l'échantillon, sortie
  `results/extraction_locale.json` avec `a_verifier`, reprise), `--bilan`. `echantillon.extraire` accepte un chemin de
  sortie et des métadonnées ajoutées. Tests `tests/test_extraction_locale.py`.
- Import : étiquette `a-verifier` sur les fiches du modèle local ; application : badge « À vérifier » dans la liste et
  la fiche.

### Ajouté (verdicts et registre, 2026-10-13 nuit)
- `validation.py --appliquer-pages` (changement `recherche-page-aap-par-source`) : report des 257 verdicts du mode
  « pages » dans `sources/relecture_qualification.json` (relecteur « Monsieur DUCOUT, validation à l'écran ») et dans le
  registre : 64 sources confirmées, 50 adresses corrigées, 10 à retrouver, 18 hors champ ; fonction pure
  `appliquer_verdicts_pages`, test. Après `qualification.py --registre --rapport` : 242 rubriques confirmées, 18 hors santé.
- `decouverte.py --garder-depart` : la page de départ est gardée telle quelle (adresse donnée à l'écran), sans visite
  d'autres candidats. Redécouverte des 50 sources corrigées : 39 pages rafraîchies, 11 sans lien d'appel repéré
  (la page donnée est elle-même l'appel ou un formulaire) ; le navigateur piloté dépasse le délai après une trentaine de
  sources, d'où trois passages.
- Vague 1 des fondations terminée : 445 fondations traitées par la recherche web de la session (165 sites inscrits,
  271 sans site dont 62 hors champ non cherchées, 9 rapprochées d'entrées existantes), 65 entrées de plus au registre
  (1 198 sources), couverture 365 / 664 ; 22 adresses plausibles à resonder.
- Famille « PLIE et organismes intermédiaires FSE+ » dans `sources/annuaires/familles.json` (annuaire : liste des appels
  FSE+ de fse.gouv.fr), à la demande de Monsieur DUCOUT.

### Ajouté (registre, 2026-10-13 soir)
- Vague 1, suite : recherche web de la session pour 203 fondations (journal `results/recherche_sites.jsonl`, `moteur: session`,
  note par fondation), 100 sites inscrits et intégrés (1 123 sources), 8 rapprochements manuels avec des entrées existantes (7 de la session, 1 de la vague Tavily),
  un doublon supprimé (`fondation-avenir-recherche-medicale-appliquee`), couverture 298 / 664.
- Sources `fimeco-walter-allinial-aap-digital-et-numerique` et `fimeco-walter-allinial-aap-sante-maladie-et-handicap`
  (agrégateur d'AAP tenu par un cabinet comptable), ajoutées à la demande de Monsieur DUCOUT.
- Veille mensuelle des AAP de l'URIOPSS PACA-Corse (PDF SharePoint du 2026-10-01, 82 appels, 32 financeurs) transmise par
  Monsieur DUCOUT : lien noté sur `uriopss-paca-corse`, 21 financeurs déjà au registre, 10 ajoutés (FAPE EDF, Fondation
  RAJA-Marcovici, fonds A2micile, France Active PACA, Pépinière d'avenirs, Silver Valley, ministère des Sports, ASP fonds
  accessibilité, fonds IMPACT Electro Dépôt, ANDES) ; 1 133 sources.

### Ajouté (registre, 2026-10-13)
- `registre.py --tableau` : tableau « Couverture par famille » en tête de `REGISTRE_SOURCES.md` (entrées rapprochées de l'annuaire /
  total, ou « couverture non mesurée »), lu dans `sources/annuaires/familles.json`.
- Vague 1 des fondations : `annuaires.py --chercher N` (recherche Tavily, `recherche_web.py`, sélection du site par règles et
  vérification de la page) et `--integrer` : 172 fondations créées au registre (1 022 sources), couverture 191 / 664.
- Sources `prefecture-region-ile-de-france-politique-de-la-ville` (page refusant les requêtes simples, code 403, statut
  identifiée) et `ditp-modernisation-gouv-appels-a-projet` (page vérifiée), ajoutées à la demande de Monsieur DUCOUT ; 850 sources.
- Vague 1 des fondations (`annuaires.py --rapprocher`, `--sites`, `--integrer`) : 19 correspondances sûres, 35 douteuses
  tranchées « organismes à part », 16 sites trouvés et vérifiés par recherche web de la session au 2026-10-13 (630 restants).
- `annuaires.py --rnf` : extrait versionné du Registre national des fonds et fondations (vague 1 : 664 fondations RUP et
  d'entreprise actives à domaine santé-social, sur 4 072 actives), colonnes « site trouvé » et « identifiant du registre » à
  remplir sans rien deviner. Tests `tests/test_annuaires.py`.
- Source `udaf-91-essonne` (UDAF de l'Essonne, page « Appels à projets » : relais de 20 appels pour ses associations,
  dont aidants, santé mentale, handicap), ajoutée à la demande de Monsieur DUCOUT ; 848 sources. Famille UDAF à étudier :
  la page d'accueil de l'UNAF liste 96 sites d'UDAF.
- Source `fondation-credit-mutuel-alliance-federale` : adresse corrigée vers le site propre de la fondation (elle pointait sur
  la liste des fondations abritées de la Fondation de France) ; découverte et qualification à relancer sur la bonne page.

### Ajouté (validation manuelle, changement `validation-manuelle-aap`, 2026-10-13)
- `validation.py` : serveur local de validation humaine, trois modes (`--pages` : page gardée de chaque rubrique
  confirmée ; `--liens` avec `--echantillon N` et `--source` : liens repérés ; fiches extraites par défaut), page
  officielle dans une fenêtre séparée ou un cadre, texte de la page lu par le serveur, commentaire enregistré par
  Entrée, verdicts écrits à chaque clic dans `results/validation_pages.json`, `validation_liens.json` ou
  `validation_manuelle.json`, reprise au premier élément non jugé, liens cassés écartés. Lanceurs
  `validation_pages.cmd` et `validation_manuelle.cmd`. Tests `tests/test_validation.py`.
- `validation.py --pages --verdicts <liste>` : relecture des sources exclues par la qualification (hors santé, à vérifier,
  sans AAP, PDF seulement : 115 pages gardées, 577 sources sans page ignorées), verdict actuel et motif affichés,
  verdict « des appels, mais jamais santé ni médico-social ». Lanceur `validation_exclues.cmd`. Demande de Monsieur DUCOUT
  après le cas Bpifrance (exclue sur ses appels du jour).

### Ajouté (second tour d'extraction Ollama avec seuil, 2026-10-13)
- `echantillon.py` : question fermée « fiche d'un appel à projets ? » avant extraction (pages refusées gardées avec la
  raison), contrôle strict des formats avec seconde demande au modèle puis champ mis à null et marque `a_relire`, fichier
  par modèle (`results/echantillon_ollama_<modele>.json`) écrit fiche par fiche avec reprise, `--controler` (comparaison
  automatique aux 24 fiches de référence : titre, financeur, clôture, montants cités ; valeur confirmée par la page
  acceptée), seuil et verdict par modèle dans `ECHANTILLON.md`. Cinq tests ajoutés.
- Tours : mistral:7b-instruct 15 justes sur 23, 13 fabriquées ; qwen3:8b (téléchargé, 5,2 Go) 16 justes sur 21,
  1 fabriquée. Seuil de 20 justes et 2 fabriquées non atteint. Sondage du comparateur : 5/5 et 4/5.

### Ajouté (relecture de la qualification, 2026-10-12)
- `qualification.py` : fonction `appliquer_relecture`, lecture de `sources/relecture_qualification.json` lors de
  `--registre` et `--rapport`, champs `verdict_modele` et `relecture` dans le registre, section « Relecture manuelle »
  dans `QUALIFICATION.md`, motif de relecture dans la liste des sources à vérifier. Deux tests ajoutés.
- `sources/relecture_qualification.json` : 70 corrections décidées avec Monsieur DUCOUT puis 60 décisions après relecture
  des pages (sans Ollama ni API). Bilan : 155 confirmées, 1 PDF seulement, 88 hors santé, 6 sans AAP, 20 à vérifier.
  18 adresses de rubrique corrigées dans le champ `notes` du registre.
- `echantillon.py --extraire --moteur ollama` terminé : 41 fiches sur 45 (`results/echantillon_ollama.json`), 4 échecs,
  1 767 s de calcul utile et une heure au total avec les délais dépassés.
- Contrôle des fiches Ollama (`results/controle_echantillon.json`, colonne `ollama`) et rapport `ECHANTILLON.md` :
  Ollama 9 fiches justes sur 41 (19 fiches fabriquées pour des pages hors sujet, dates hors format, enveloppes « oui »),
  session 24 sur 24. Les 6 fiches validées encore ouvertes du champ santé (`results/echantillon_valides.json`) importées
  dans Firestore. README : section « Extraction sur échantillon ».

### Ajouté (qualification des sources, 2026-10-12)
- `qualification.py` : verdict par rubrique via le modèle local Ollama, champ `qualification` dans le registre,
  colonne Qualification dans `REGISTRE_SOURCES.md`, rapport `QUALIFICATION.md`. 270 rubriques qualifiées :
  127 confirmées, 1 PDF seulement, 133 hors santé, 5 sans AAP, 4 à vérifier ; sondage de 31 verdicts, 83 % d'accord.
- `echantillon.py` (changement `extraction-echantillon-aap`, en attente) : collecte du texte de 45 fiches sur 9 rubriques,
  extraction par Ollama et par la session, estimation du coût API (99 euros pour 3 748 liens), rapport `ECHANTILLON.md`.
- Dépendance : `pydantic` installé dans `.venv` (schéma `AapNormalized`).

### Ajouté (découverte des rubriques, 2026-10-09)
- `decouverte.py` : robot générique (Playwright) qui trouve la rubrique appels à projets de chaque source du
  registre et garde la page et ses liens en local. Premier passage : 847 sources, 268 rubriques,
  3744 liens d'AAP, 110 sites bloqués. Rapport `DECOUVERTE.md`. Tests `tests/test_decouverte.py`.
- Playwright et Chromium installés dans `.venv` à la racine du dépôt.

### Ajouté (registre des sources, seconde extension, 2026-10-09)
- Registre porté à 847 sources (657 pages vérifiées) : CAF et CPAM de chaque département, Carsat, MSA,
  préfectures, DREETS, DDETS, DRAAF, MDPH (annuaire DILA), CNAF et groupes de protection sociale, 12 IHU,
  6 GIRCI, cancéropôles, portail santé de la Commission européenne, fonds européens régionaux et Interreg,
  fédérations et réseaux, presse spécialisée, plateformes de dépôt. Catégories ajoutées : sociétés savantes,
  établissements, centrales d'achat.

### Ajouté (registre des sources, 2026-10-09)
- `registre.py` et `sources/registre.json` : inventaire de 334 émetteurs d'AAP (18 ARS + portail
  national, ministères, caisses, agences de l'État, fondations, sociétés savantes, hôpitaux, centrales
  d'achat, Europe, toutes les régions et tous les départements, grandes villes, agrégateurs), contrôle
  HTTP des pages, tableau `REGISTRE_SOURCES.md`. Tests `tests/test_registre.py`.

### Corrigé (jonction scripts/import_to_firestore.py, 2026-10-09)
- Premier import réel dans Firestore (projet aapi-11bc3) : 105 AAP lus, 89 documents distincts.
- Les doublons entre sources (ars_idf et ars_idf_local, même signature) sont fusionnés avant
  l'écriture : le compteur « créés » correspond désormais au nombre réel de documents.
- `scripts/requirements.txt` : ajout de `google-cloud-firestore` (firebase-admin 7 ne l'installe
  plus) et `grpcio` fixé en 1.74.0 (la 1.75+ est bloquée par Smart App Control de Windows).

### Ajouté
- Installation de Graphify (outil de cartographie de code en graphe interactif) — génère `graph.html`, `GRAPH_REPORT.md`, `graph.json`
- Mode_emploi mis à jour : statistiques réelles (23 AAP, 0,031 €/AAP, 2 sources opérationnelles), arborescence complète avec ARS IDF, glossaire enrichi (terme "403 Forbidden")

### Ajouté (sessions précédentes)
- Extraction structurée des AAP via Claude API (tool use) avec schéma `AapNormalized`
- Cache inter-runs : les AAP déjà extraits sont servis sans réinterroger Claude (économie ~95 % des appels en régime)
- Téléchargement et cache disque des pièces jointes PDF/DOCX
- Rapport de validation qualité HTML (`validate.py`) avec score /10 par champ et iframe de la page source
- Suivi de consommation API avec projections de coût (`analyze_costs.py`)
- Outil de diagnostic Playwright en mode visible (`debug_page.py`)
- Variable `FORCE_REFRESH=1` pour forcer la ré-extraction complète
- Variable `MAX_AAPS=N` pour limiter le nombre d'AAP traités par run

### Interne
- Module `utils.py` regroupant les fonctions partagées (stdout UTF-8, context Playwright, cookies, JSONL)
- Nettoyage du DOM avant envoi à Claude (retrait nav/header/footer/menu/cookies) — réduit ~30 % les tokens input
- Client `httpx` réutilisé pour les téléchargements PDF (économie TLS handshake)
- Retry exponentiel automatique sur les erreurs 429/529 de l'API Anthropic
- Prompt caching activé sur le system prompt (économie ~3× sur les runs longs)
