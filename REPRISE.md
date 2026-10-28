# Reprise du projet AAP Santé (écrit le 2026-10-12, à lire au début de chaque session)

## Où on en est au 2026-10-23 (à lire en premier)

Session du 2026-10-21 au 2026-10-23 close sur la demande de Monsieur DUCOUT (« repartir de là dans une nouvelle
conversation »). Journal des décisions de ces trois jours : `.audit/journal_2026-10-21_23.md` (local, hors Git).

**État** :
- Application en ligne depuis le 2026-10-22 : https://aapi-11bc3.web.app (Firebase Hosting, déployée par Monsieur DUCOUT).
  Les sept jours du plan MVP sont codés (`docs/PLAN_MVP_2026-10-20.md`) ; le jour 6 n'a qu'une démonstration partielle
  (six étapes sur neuf : publication d'un appel en cinq étapes et présélection jamais jouées).
- Base réelle au 2026-10-22 : 748 fiches, 362 publiées et validées, 386 archivées, 0 à trier (339 verdicts posés par
  Monsieur DUCOUT dans l'administration ; copie dans `scripts/sauvegardes/verdicts_admin_2026-10-22.json`).
- Sources : ANR, ANAP, ANRS, FIRAH, IReSP, HaDEA corrigées ou ajoutées ; portail appelsprojetsrecherche.fr lu par son
  export CSV (`scraping/portail_recherche.py`) ; 15 émetteurs sur 30 prioritaires alimentent la veille
  (`scraping/SOURCES_PRIORITAIRES.md`). Cumul Haiku : environ 2,32 euros sur 5.
- Outillage : skill `/show-me-your-work` (journal des décisions, audit, relecture par un autre modèle) dans
  `.claude/skills/` ; version claude.ai `show-me-your-work-web` importée par Monsieur DUCOUT.

**Actions en attente de Monsieur DUCOUT** :
1. Redéployer depuis `app` (retrait des pièces jointes en ligne, pages légales corrigées, taille maximale des
   retours) : `npm run build && firebase deploy --only hosting,firestore:rules --project aapi-11bc3`. Au 2026-10-23,
   une ancienne pièce jointe était encore servie en ligne : le déploiement n'avait pas eu lieu. Après, la session
   vérifie la tâche 2.1 de `openspec/changes/pieces-jointes-hors-ligne/tasks.md`.
2. Inviter trois testeurs (modèle dans `docs/MISE_EN_LIGNE.md`, section 4).
3. Jouer la démonstration financeur complète (`docs/DEMO_FINANCEUR.md`), dont la publication d'un appel.
4. Ouvrir la facturation Blaze pour déployer la fonction du jour 5 (lecture de PDF).
5. Trancher les mentions encore « à valider » des pages légales (tarifs et résiliation, durées de conservation,
   emplacement des comptes et des fichiers, mesure d'audience).

**Prochains chantiers** (`docs/FEUILLE_DE_ROUTE.md`, section « Chantiers programmés ») : pièces jointes des appels ;
recopie des verdicts de l'administration dans le fichier versionné des verdicts (proposée, pas encore décidée).

**Ajout du 2026-10-27** : quatre publications LinkedIn transmises par Monsieur DUCOUT ; aucun des trois appels de santé
n'était connu (novap de la FEHAP, Tubbe de Gérond'if, prix de la Fondation Béatrice Denys). Changement
`pages-a-un-seul-appel` ouvert et codé : une page validée à la main est retenue dès un lien d'appel, champ `page_appel`
au registre ; FEHAP, Gérond'if et ANAP retenues. Sur son accord : extraction, contrôle et qualification par Haiku
(0,008 euro, cumul 2,329 euros), import des deux fiches en brouillon. Restent : publier ou rejeter novap (clôture 31
octobre) et Tubbe (6 novembre) dans `/admin/aaps` ; familles absentes du registre (gérontopôles, cancéropôles et pôles
de compétitivité santé, fondations abritées) à décider. Fondation Béatrice Denys : aucune page web ne publie encore
l'édition 2026-2027 ; cinq relais inscrits et suivis par la veille (Turenne, cancéropôles CLARA et PACA, Eurasanté,
Biotech Santé Bretagne), 107 textes collectés ; sur ses deux accords, 79 fiches extraites, contrôlées et qualifiées
(0,104 euro, cumul Haiku 2,433 euros) ; 34 fiches ouvertes ou sans date importées en brouillon, à publier ou rejeter
dans `/admin/aaps` (doublons visibles : MATWIN, SILAB, Grands Défis). Fiche Béatrice Denys 2026-2027 saisie à la main
d'après le PDF officiel qu'il a transmis. Les 27 autres brouillons du jour (dont novap et Tubbe), d'abord marqués
« Validée » par le modèle et donc hors de sa file, sont passés en « Proposée, non relue » sur son accord : 28 fiches
dans sa file au 2026-10-27 à 16 h 07.

**Ajout du 2026-10-28** : 107 commits poussés sur GitHub (accord). Changement `familles-relais-regionaux` (« continue
surtout ») : cancéropôles 7 / 7, pôles de compétitivité santé 6 / 6, gérontopôles 14 / 14 au registre (1 230
sources) ; champ `relais` (liens vers les sites des financeurs gardés), 135 tests verts ; 170 textes collectés ; sur
son accord (0,28 euro), 102 fiches extraites, contrôle et qualification de 53, 0,224 euro réel (cumul Haiku 2,657) ;
71 fiches importées (64 en « Proposée, non relue », 7 archivées par le modèle). File « à valider » : 92 fiches (novap
ferme le samedi 31 octobre). Changement commité et poussé (39a442f).

**Pilote (2026-10-28)** : délégation accordée dans la conversation (budget 0,50 euro par semaine, imports en « à
valider », commit et push en fin de changement) ; le garde-fou refuse que la session l'écrive dans `CLAUDE.md` : à
recopier par Monsieur DUCOUT (`docs/A_VALIDER.md`, question 1). Critères et journal : `docs/PILOTE_MVP.md`. Lot A1 fait :
connecteur `connecteur-funding-tenders` (`scraping/funding_tenders.py`), 24 appels européens de santé ouverts, qualifiés
(0,006 euro, cumul Haiku 2,669) et importés : file « à valider » 116 fiches. Lot A2 fait : `scripts/doublons.py --file`
(changement `doublons-file-a-valider`), rapport `docs/DOUBLONS.md` : 47 groupes, 62 fiches à rejeter (29 dans la file).
Lot A3 fait : `financeur-reel-des-relais`, 10 fiches de la file corrigées (vrai financeur lu entre parenthèses),
36 restent au nom du relais. Suite du plan : lot B (familles Recherche, fondations abritées, conférences des
financeurs), puis lot C (veille de bout en bout).

**Règles ajoutées pendant cette session** : chaque commande payante est lancée avec `--plafond` = cumul + devis accepté
(CLAUDE.md) ; un refus de déploiement par le garde-fou ne se contourne jamais par un autre outil, la commande est remise
à Monsieur DUCOUT.

## Objectif de Monsieur DUCOUT

Prouver, en local et sans dépense, qu'il est possible de récupérer tous les appels à projets (AAP)
du secteur santé et médico-social français, de les mettre dans la plateforme (application React +
Firebase du dossier `app/`), et d'utiliser cette plateforme. Déploiement seulement après que tout
fonctionne en local. GitHub sert de trace (commit et push à chaque changement validé).

## Règles non négociables

- Zéro dépense sans accord explicite : pas de crédit API Anthropic, pas de forfait Firebase Blaze.
  Un passage global payant (10 à 15 euros) est envisageable seulement quand la chaîne est prouvée
  et son coût estimé.
- Jamais de secret dans la conversation ni dans Git (`app/.env`, `scripts/serviceAccountKey.json`
  sont ignorés par Git ; vérifier avant chaque commit).
- Push uniquement sur demande explicite ("Validé : archiver, commit et push").
- Chaque évolution passe par un changement OpenSpec (`openspec/changes/`), avec tâches cochées,
  puis archivage. Documentation à jour avant de déclarer une tâche finie.
- Expliquer le pourquoi avant le comment, en français, sans jargon, sans emojis dans les fichiers.
- Une session = un seul dossier : ouvrir la session dans `AAP`, jamais dans `Scrapling`.

Vue d'ensemble des huit grandes étapes et de leur état : `docs/FEUILLE_DE_ROUTE.md` (à tenir à jour avec ce fichier).

## Chaîne de traitement et état réel

| Étape | Outil | État |
|---|---|---|
| 1. Registre des émetteurs (qui publie des AAP) | `scraping/registre.py`, `sources/registre.json` | 847 sources ; 657 adresses répondent. "Page vérifiée" veut dire que l'adresse répond, pas qu'elle contient des AAP. |
| 2. Découverte des rubriques (où ils publient) | `scraping/decouverte.py`, `DECOUVERTE.md` | 270 rubriques candidates et 3 748 liens candidats, repérés par mots-clés, NON vérifiés. Pages gardées dans `scraping/decouverte/` (hors Git). 2026-10-13 : les 155 pages gardées des rubriques confirmées n'ont jamais été vues par un humain ; à valider par Monsieur DUCOUT avec le raccourci « Validation des pages des sources » (mode `--pages`). |
| 3. Qualification des sources (publient-ils vraiment des AAP ?) | `scraping/qualification.py`, `QUALIFICATION.md`, `sources/relecture_qualification.json` | FAIT le 2026-10-12 : 270 rubriques relues par le modèle, puis relecture manuelle (changement `relecture-qualification`) : 155 confirmées, 88 hors santé, 6 sans AAP, 20 à vérifier. Verdict relu dans le registre (champ `qualification`, verdict du modèle conservé) et `QUALIFICATION.md`. |
| 4. Extraction des fiches (page -> fiche AAP) | `scraping/echantillon.py`, `ECHANTILLON.md` | ÉCHANTILLON FAIT (changement `extraction-echantillon-aap`, validation 3.4 en attente). 45 textes, 24 fiches Claude Code justes sur 24, Ollama 9 justes sur 41, 21 pages hors sujet, API estimée 99 euros pour 3 748 liens (avant qualification). 6 fiches ouvertes du champ santé importées dans Firestore. |
| 5. Import dans l'application | `scripts/import_to_firestore.py` | OK : 95 AAP en base (89 des 5 connecteurs historiques + 6 de l'échantillon), visibles dans "Rechercher des AAP" SANS compte depuis le 2026-10-13 (changement `consultation-aap-sans-compte`), pièces jointes servies depuis le PC. 2026-10-14 soir : import réel, 420 fiches publiées, puis 10 fiches hors champ repassées en brouillon ; nuit : règles de nettoyage codées (source réelle, financeur canonique `scraping/sources/financeurs.json`, territoire déduit `scraping/territoires.py`), ré-import réel fait sur son accord : 415 publiées, 151 financeurs contre 201, « National » 108 contre 234. 2026-10-15 matin : passage global terminé (1 086 fiches), champ classé par Haiku (0,23 euro), ré-import et retrait des 147 appels hors champ publiés : 308 fiches publiées (santé 172, médico-social 106, incertain 29), 261 brouillons dont 258 hors champ. Contrôle des 283 fiches ouvertes par Haiku (0,15 euro) : 74 douteuses sur dates, montants, financeur, titre ou territoire, à relire en premier dans l'outil de validation (`scraping/VERIFICATION.md`). Midi : décision de Monsieur DUCOUT, le contrôle vaut relecture (`verification.decision_du_modele`, `scripts/appliquer_controle.py`) ; essai à blanc 231 validées, 39 rejetées, 8 à corriger ; l'outil de validation ne présente plus que 6 fiches ; exécution réelle faite à 12 h 31 sur son accord (278 fiches, sauvegarde `controle_2026-10-15_1231.json`) : 270 publiées dont 231 validées par le modèle, 39 archivées, 38 badges « à vérifier » contre 307. |
| 6. Veille des changements (re-scraper ce qui bouge) | à créer | Idée validée par Monsieur DUCOUT : passage initial lent, puis comparaison quotidienne des pages gardées. |

## Leçons apprises (ne pas refaire)

- Les mots-clés ("aides", "prix", "financement") font remonter des pages sans rapport (facture
  d'eau, résultats de recherche, listes filtrées). Il faut un tri "est-ce un AAP ?" avant
  d'extraire : c'est l'objet de la qualification.
- Beaucoup d'AAP n'existent qu'en PDF (Cancéropôle Est, ministère de la Culture) : la lecture des
  PDF sera un changement à part.
- Les 92 sites de préfectures refusent les adresses de centres de données (réseau public, VPN) et
  coupent l'adresse domestique après une rafale : y aller depuis la box, un site à la fois, avec
  pause. Ameli (CPAM) et les CAF ne publient pas d'AAP sur leurs pages départementales.
- Le modèle local Ollama (`mistral:7b-instruct`) sert d'outil de tri gratuit ; il se trompe
  parfois (sondage obligatoire). La décision "Claude API pour le produit final" n'est pas remise
  en cause.

## Où en est le projet (mis à jour le 2026-10-13, midi)

- Changement `relecture-qualification` (validé par Monsieur DUCOUT et archivé le 2026-10-12) : les 133 "hors santé" ont été relus avec
  Monsieur DUCOUT. 10 passés en confirmée sur le motif du modèle, 60 pages relues par la session (sans Ollama ni API),
  décisions validées sauf 6 cas limites laissés "à vérifier" (Val-de-Marne, DREETS Nouvelle-Aquitaine, Mayotte,
  Région Île-de-France, Corrèze, FRM) et 9 sites illisibles par le robot (Meurthe-et-Moselle, Aube, Doubs,
  Hautes-Alpes, Drôme, DDETS Isère, DREETS Occitanie, GIRCI Est) à ouvrir à la main. L'ANR est confirmée sur
  l'adresse donnée par Monsieur DUCOUT (anr.fr/fr/appels).
  Vérification 3.2 faite par Monsieur DUCOUT sur Fondation Le Souffle et ANR.
- Bilan de la qualification après relecture : 155 confirmées, 1 PDF seulement, 88 hors santé, 6 sans AAP,
  20 à vérifier ; 577 sources sans page gardée. Leçon : le modèle ne juge que la page gardée ; quand c'est une page
  d'accueil, d'archives ou un bandeau cookies (liste de cookies plus longue que les 8 000 caractères lus), le verdict
  ne vaut rien. Mécanisme : `scraping/sources/relecture_qualification.json`, appliqué par `qualification.py`.
- Changement `extraction-echantillon-aap` : tâches 3.1 à 3.3 faites le 2026-10-12 (nuit). Ollama : 9 fiches justes
  sur 41 (il fabrique une fiche pour toute page, même hors sujet ; dates hors format ; enveloppes « oui ») ; session :
  24 sur 24. 6 fiches ouvertes du champ santé importées dans Firestore (`results/echantillon_valides.json`, 95 AAP en base).
  Validé et archivé le 2026-10-13. **Décision de Monsieur DUCOUT sur le moteur : « lentement et sûrement sur
  Ollama »**, c'est-à-dire un second tour à zéro euro avant tout appel payant.
- Changement `extraction-ollama-second-tour` (2026-10-13, nuit, tâches 1.1 à 3.1 faites, **décision 3.2 de
  Monsieur DUCOUT en attente**). Seuil fixé par lui : 20 justes sur 24, 2 fabriquées au plus. Résultat
  (`scraping/ECHANTILLON.md`) : mistral 7b 15 justes sur 23, 13 fabriquées ; qwen3:8b (téléchargé, 5,2 Go) 16 justes
  sur 21, 1 fabriquée, filtre presque parfait (20 des 21 pages hors sujet refusées) mais 70 s par texte et 2 délais
  dépassés. Aucun des deux n'atteint le seuil ; qwen3:8b s'en approche (2 de ses 5 désaccords sont des formulations
  exactes jugées sévèrement, 3 sont des enveloppes financières manquées). Carte graphique : 8 Go (RTX 5060 portable) :
  les Qwen de 17 et 23 Go installés ne tiennent pas, non testés. Le comparateur automatique a été corrigé deux fois après
  sondage (échéance ou titre confirmés par la page ; montants cités quel que soit le champ) ; sondage final 5/5 et 4/5.
- **Validation manuelle** (2026-10-13, changement `validation-manuelle-aap`, tâches 1.1 à 1.3 faites, vérification 2.1 par
  Monsieur DUCOUT en attente) : `scraping/validation.py`, lanceurs `.cmd` dans `scraping/` (« Validation des pages des
  sources » : les 155 pages gardées, port 8788 ; « Validation manuelle des AAP » : échantillon de 60 liens, un par
  source, port 8787). Depuis le 2026-10-14, seul le raccourci « Validation des fiches a verifier » reste sur son bureau
  (usage quotidien), les trois autres ont été envoyés à la corbeille à sa demande. Verdicts dans `results/validation_pages.json` et `results/validation_liens.json` (déplacés dans
  `sources/verdicts_pages.json` et `sources/verdicts_liens.json` par le lot 0 du 2026-10-14 ; 34 verdicts sur
  les liens à midi ; aucun sur les pages). Ses commentaires ont déjà donné deux verdicts de plus (page qui recense des
  appels, appel permanent) et une grille de critères proposée (nature, thème, état, destinataires), non décidée.
  Leçon du jour (règle « Preuve avant affirmation » dans CLAUDE.md) : j'ai affirmé que la découverte gardait de
  mauvaises pages sans ouvrir `decouverte/resultats.json`, qui prouvait le contraire ; vérifier avant d'acquiescer.
- **Registre par annuaires** (2026-10-13 après-midi, changement `registre-par-annuaires`, tâches 1.1 à 2.3 faites, 2.1 en cours) :
  Monsieur DUCOUT trouvait une source manquante « toutes les cinq » ; cause : registre constitué de mémoire, sans annuaire de
  référence. Inventaire de 24 familles validé (`scraping/sources/annuaires/familles.json`), taux de couverture en tête de
  `REGISTRE_SOURCES.md`. Vague 1 décidée par lui : 664 fondations RUP et d'entreprise santé-social du Registre national des
  fonds et fondations (`annuaires.py`). Décisions : aucune fusion des 35 rapprochements douteux ; recherche des sites par
  l'API Tavily avec les clés du projet Scrapling (le moteur gratuit refuse, Google est fermé, Brave exige une carte).
  Résultat Tavily : 191 / 664 (172 créées), puis les deux clés ont atteint la limite de leur plan (code 432). Sur sa
  consigne « continue avec ta recherche web toi-même » (2026-10-13 soir), la session a cherché 203 fondations de plus avec
  son propre moteur de recherche (choix lu dans les résultats, chaque adresse vérifiée par la sonde code 200 + mot du nom,
  journal `results/recherche_sites.jsonl` avec `moteur: session` et une note par fondation) : 100 sites inscrits et
  intégrés (`--integrer` : 1 123 sources), 96 sans site identifiable, 8 rapprochées d'une entrée déjà au registre (7 de la session, 1 de la vague Tavily)
  (FRM, Fondation Alzheimer, Ramsay Santé, Force, Saint-Joseph Marseille, Avenir, APICIL, ARC : `id_registre` posé, un
  doublon créé par `--integrer` supprimé), 16 adresses à resonder (SSL ou connexion refusée). Couverture 298 / 664 (44 %),
  242 fondations jamais cherchées (quota de 200 recherches par tour atteint). Suite : relancer la recherche sur les 242
  (nouveau tour), resonder les 16, puis découverte et qualification sur les nouvelles entrées (tâche 3.1), validation des
  pages par Monsieur DUCOUT. Beaucoup de fondations d'entreprise n'ont que le site de l'entreprise : la découverte devra y
  chercher la page de la fondation.
  Sources ajoutées à sa demande : UDAF 91, préfecture de région IdF (politique de la ville, 403), DITP ; adresse de la
  Fondation Crédit Mutuel Alliance Fédérale corrigée ; agrégateur Fimeco Walter Allinial (pages Digital et Numérique,
  Santé Maladie et Handicap) ajouté le 2026-10-13 soir ; veille PDF des AAP de l'URIOPSS PACA-Corse (lien SharePoint,
  82 appels) : 21 de ses 32 financeurs étaient au registre, 10 ajoutés (1 133 sources).
- **Verdicts reportés** (2026-10-13 nuit, changement `recherche-page-aap-par-source`, tâches 1.1 à 2.1 faites) : Monsieur
  DUCOUT a validé à l'écran les 257 pages (146 gardées, 111 exclues) : 181 bonnes, 47 mauvaises avec adresse, 10 mortes,
  18 hors champ ; le modèle local avait exclu à tort 68 des 88 « hors santé » (préfectures, DREETS, DRAAF, MSA, départements,
  villes). `validation.py --appliquer-pages` a écrit la relecture (relecteur « Monsieur DUCOUT, validation à l'écran ») et
  corrigé 50 adresses ; `qualification.py --registre --rapport` : 242 rubriques confirmées, 18 hors santé, 873 à vérifier
  (les entrées nouvelles du registre reçoivent « à vérifier » tant qu'elles ne sont pas découvertes). Redécouverte des 50
  sources corrigées avec `decouverte.py --garder-depart` : 39 pages rafraîchies, 11 sans lien d'appel repéré (Maladies
  rares, ANSM, AÉSIO, Alzheimer, SFGG, Yonne, Saint-Pierre-et-Miquelon, Fédération Addiction, ANACT, Reims, DREETS
  Occitanie : la page donnée est l'appel lui-même ou un formulaire, à traiter à l'extraction). Attention : lancer
  `--appliquer-pages` une seule fois avant la redécouverte, les verdicts sont indexés par l'adresse de l'ancienne page.
  Reste : 10 pages mortes à retrouver (Moselle, Aude, Alpes-de-Haute-Provence, Groupe Pasteur Mutualité, Vaucluse, Lille,
  Carsat Alsace-Moselle, Nièvre, DEETS Guadeloupe, MDPH Moselle), 577 sources sans page, vérification 4.1.
- Vague 1 terminée (2026-10-13 nuit) : 445 fondations traitées par la recherche web de la session, 365 / 664 (54 %),
  1 198 sources, 22 adresses à resonder ; famille « PLIE et organismes intermédiaires FSE+ » ajoutée (annuaire :
  fse.gouv.fr, 2 100 appels FSE+ dont ceux des PLIE ; annuaire Alliance Villes Emploi réservé aux adhérents).
- Brouillon initial `recherche-page-aap-par-source` : appliquer les verdicts « mauvaise page » au
  registre, puis recherche web « nom de l'organisme appels à projets » pour les sources mal servies ou sans page,
  validation humaine avant toute entrée dans le registre. Design et tâches après les premiers verdicts sur les pages.
- Réglage fin envisagé plus tard, à partir des verdicts : exemples validés dans la consigne (niveau 1, zéro euro),
  puis réglage fin d'un modèle léger à poids ouverts au-delà de quelques centaines d'exemples (niveau 2, carte louée
  avec son accord). Pas de réglage fin des modèles Claude.
- **Tâche suivante : décision de Monsieur DUCOUT (tâche 3.2)**, trois options honnêtes : (a) qwen3:8b pour le passage
  global malgré le seuil non atteint, avec sondage humain renforcé sur les montants ; (b) un troisième tour pour gagner
  les points manquants (contexte réduit pour tenir en mémoire graphique et éviter les délais dépassés, relance des
  2 pages en délai, question dédiée sur l'enveloppe financière) ; (c) API Anthropic, après estimation du coût sur les
  155 rubriques confirmées. Puis archivage du changement.
- Changement `consultation-aap-sans-compte` (2026-10-13, validé et archivé) : la
  consultation des AAP ne demande plus de compte (règle Firestore déployée, routes ouvertes, lien sur l'accueil) ;
  vérifié sans compte : 95 AAP listés, recherche « Dentobus », fiche, « Candidater » renvoie à la connexion.
  Défauts connus laissés de côté : redirection après connexion, bouton Google (fournisseur non activé). Leçon : après
  une modification de page, si le navigateur sert une version périmée, redémarrer le serveur de développement.
- Essai de modèles de décision : Laya multilingue testé (48 % d'accord, trop sûr de lui), non retenu ; Kev écarté
  (anglais, 16 Go de mémoire graphique). Mistral 7b via Ollama reste le moteur de tri. Laya est installé dans
  `.venv` mais inutilisé.
- Changement `extraction-echantillon-aap` (en cours, 2.1 coché) : 45 textes collectés, 24 fiches Claude Code validées,
  grille de contrôle remplie pour Claude Code, estimation API faite. Extraction Ollama terminée le 2026-10-12 à
  23 h 05 : 41 fiches sur 45, 4 échecs (`scraping/results/echantillon_ollama.json` et `.errors.json`), une heure
  de calcul dont 30 minutes de délais dépassés (1 à 5 minutes par page longue : prévoir d'écrire le fichier fiche
  par fiche à l'avenir). Défauts vus dans les fiches Ollama : fiches produites pour des pages sans rapport (facture
  d'eau, formulaire de recherche), dates hors format ("20 Septembre 2026", "Pas de date"), listes de catégories
  aberrantes (SFMU). Restent : contrôle manuel des 41 fiches Ollama (grille `results/controle_echantillon.json`),
  `--rapport`, import des fiches justes dans Firestore, documentation, validation.
- Tout est commité et poussé sur GitHub (dernier push le 2026-10-12 au soir). Le dossier
  `scraping/decouverte/` et `scraping/results/` restent sur le PC (ignorés par Git).
- Règle d'exploitation d'Ollama : un seul travail à la fois sur le modèle ; ne pas lancer un autre modèle
  (Qwen 27B) ni un calcul lourd sur le processeur pendant un passage.

- **Extraction locale globale** (2026-10-13 soir, changement `extraction-locale-globale`). Décision de Monsieur DUCOUT :
  extraire les pages des 242 rubriques validées avec `qwen3:8b`, zéro euro, fiches marquées « à vérifier », risque de
  l'échantillon accepté. Outil `scraping/extraction_locale.py` (`--collecter`, `--extraire`, `--bilan`), import avec
  étiquette `a-verifier`, badge « À vérifier » dans l'application. 2 395 adresses web uniques ; 25 à 40 heures de
  calcul prévues par nuits, reprise automatique ; import par lots. Avancement : `extraction_locale.py --bilan`.

- **Organisation des données validées** (2026-10-14, changement `organisation-donnees-validees`, après l'audit
  `docs/AUDIT_DONNEES_2026-10-14.md` et le schéma `docs/FLUX_DONNEES.md`). Décisions de Monsieur DUCOUT : « pas un
  appel » = archivé ; identifiant changé maintenant ; fiches sans date en attente. Fait : import protégé (identifiant
  = adresse, `status` / `validation` jamais réécrits, verdicts de `sources/verdicts_fiches.json` appliqués), registre
  avec `url_validee`, raccourci « Validation des fiches à vérifier » (fiches ouvertes), migration de la base
  (341 documents : 194 publiés, 147 brouillons). Reste : vérification 5.1 par Monsieur DUCOUT ; verdicts sur les
  pages rattachés à l'identifiant de l'émetteur (problème I3 de l'audit), rangement de `results/` (M4).

- **Lot 0 du rapport de critique** (2026-10-14, changement `lot-0-assainissement`, rapport
  `docs/RAPPORT_CRITIQUE_AAP_SANTE_2026-10-14.md` validé par Monsieur DUCOUT, instructions 1 à 9 et 17). Fait et prouvé :
  routage réduit au MVP (`/signup` en 404, liens d'inscription retirés), configuration ESLint créée (lint vert),
  `validation.statut` seule source de fiabilité (étiquette `a-verifier` dérivée, `par`), liste blanche des champs de
  l'import, `deadline` nulle pour les fiches sans date (type `AAP` nullable, bloc `validation` dans le type), cinq tests
  de l'audit sur un faux Firestore, verdicts des pages et des liens migrés dans `sources/` le 2026-10-14 après accord
  (257 pages, 34 liens, sauvegarde dans `scripts/sauvegardes/`), règles Firestore du MVP testées sur l'émulateur
  (`npm run test:rules`, JDK 21) et déployées le 2026-10-14 après accord, moteur `api` de l'échantillon sous plafond
  (`echantillon.py --moteur api`), 141 échéances fictives passées à `null` par Monsieur DUCOUT depuis son terminal le
  2026-10-14 (contrôle « 141 deja a null » ; le classificateur de sécurité de Claude Code avait refusé la mise à jour
  groupée à la session). Mesure API faite le 2026-10-14 après accord : `claude-haiku-5-5`, 45 textes (lecture par adresse), 19 justes et
  1 fabriquée sur 20 comparées, 4 pages de référence refusées à tort, seuil 20/2 manqué d'une fiche, coût réel 0,03 euro
  (`scraping/ECHANTILLON.md`). Demande de Monsieur DUCOUT : comparaison local / Haiku sur 50 pages chacun, à cadrer
  après le lot 0 dans un changement OpenSpec dédié (section 8 du rapport). Constat hors
  lot 0 consigné dans la section 8 du rapport : les filtres territoire, secteur et budget de `/aap/search` ne
  correspondent pas aux valeurs importées (libellés contre identifiants), proposition pour le lot 1 à valider.
  État détaillé : `openspec/changes/lot-0-assainissement/tasks.md`.
- Comparaison de deux moteurs sur 50 pages jamais traitées (changement `comparaison-moteurs-50-pages`, demande de
  Monsieur DUCOUT du 2026-10-14, plan accordé) : outil `scraping/comparaison.py` écrit et testé (tirage reproductible,
  extraction locale et API sur les mêmes textes, écran de jugement sur le port 8766, rapport `COMPARAISON.md`) ; 50 pages
  tirées, toutes de la famille collectivité (seuls textes jamais traités), extraction locale `qwen3:8b` lancée le
  2026-10-14 ; en attente : accord écrit pour Haiku (0,054 euro estimé sur la longueur réelle), jugement des 50 pages par
  Monsieur DUCOUT (`comparaison_juger.cmd`), rapport. État détaillé : `openspec/changes/comparaison-moteurs-50-pages/tasks.md`.
  Suite du 2026-10-14 au soir : premier tirage (collectivités, jugé inutilisable car sans appel de santé) tout de même
  jugé et rapporté (`scraping/COMPARAISON_collectivites_2026-10-14.md` : local 45/50 repérage, 19/23 qualité, 3
  fabrications ; Haiku 47/50, 19/23, 0 fabrication, 0,03 euro) ; second tirage de 50 pages d'appels chez ARS, INCa,
  CNSA, fondations, sociétés savantes, établissements (`--familles`, `--mots`), extraction locale en cours, Haiku sur
  accord (0,03 euro), jugement à refaire.
- **Filtre du champ santé et médico-social** (changement `filtre-champ-sante`, instruction 26 validée le 2026-10-14 au
  soir) : définition décidée par Monsieur DUCOUT (santé, médico-social, hors champ, incertain ; pas de social ;
  cybersécurité et rénovation des établissements inclus), consigne et outil `scraping/champ.py` (`--classer`,
  `--evaluer`, `--rapport`), règles d'import (hors champ -> brouillon à corriger ; verdict « hors champ » touche 7 ->
  rejeté ; fiches sans date publiées, décision du soir), migrations `scripts/migrer_champ.py` et
  `scripts/publier_sans_date.py` écrites avec essais à blanc. Fait : connecteurs classés par Haiku (105 fiches, 34 hors
  champ, 0,03 euro). À faire dans l'ordre : fin du passage global, `champ.py --classer --moteur api` sur
  `extraction_locale.json` (accord donné), import réel (accord), `migrer_champ.py` (accord), `publier_sans_date.py`
  (accord), question du champ dans la chaîne (5.1), rapport `CHAMP.md`, documentation. Tout est fait au 2026-10-19
  (5.1 : consigne version 4, les deux moteurs posent la question du champ après l'extraction) ; reste la vérification
  7.1 de Monsieur DUCOUT. État détaillé : `openspec/changes/filtre-champ-sante/tasks.md`.
- Administration (changement `acces-administration`, 2026-10-15 et 2026-10-19) : compte admin créé par Monsieur DUCOUT
  (`scripts/creer_admin.py`, mot de passe par `/reset-password`), espace `/admin` ouvert ; le 2026-10-19, `/admin/aaps`
  montre les compteurs et le filtre par `validation.statut` (base : proposée 54, à corriger 245, validée 231, rejetée
  39) et, sur chaque fiche, relecteur, date et commentaire. Reste : vérification 3.2 par Monsieur DUCOUT (la page exige
  une connexion que la session ne fait pas).
- 2026-10-19, décisions de Monsieur DUCOUT : V3 (modèle local) figée sous l'étiquette Git `v3-local`, V4 par l'API
  (`extraction-api-v4`, devis 2,26 euros au plus accepté, passage lancé à 10 h 10, fichier `results/extraction_api.json`) ;
  forfait Blaze accepté (il l'active lui-même) ; connexion Google à activer par lui ; MFA à la fin. Instruction 11 faite
  (`mention-relecture-fiches` : mentions de relecture, date d'extraction, lien officiel, filtre « Relecture »). Reste
  pour la V4 : fin du passage, contrôle Haiku (devis), décision du modèle, import (pose aussi `extraitLe`). Fait à 13 h 20 :
  passage 856 fiches pour 1,33 euro, contrôle 0,13 euro, import 54 créées et 483 mises à jour, 4 hors champ retirés.
  Base au 2026-10-19, 13 h 20 : 623 documents, 289 publiées (257 validées par le modèle, 28 proposées, 8 à corriger ; moteur api 207, connecteurs 37, local 48), 44 archivées, 290 brouillons ; « 289 AAP disponibles » sur /aap/search. Point réglé à 15 h 29 : `scripts/reporter_valeurs_api.py` a reporté les valeurs API sur 183 fiches validées par le modèle
  (sauvegarde `valeurs_api_2026-10-19_1529.json`), les fiches API closes non contrôlées et les verdicts humains intouchés.
- Suivi des appels externes (2026-10-21, `suivi-couts-externes`, demande de Monsieur DUCOUT) : page `/admin/couts-ia` et
  `scripts/publier_couts.py` (journal des coûts recopié dans `coutsIa`, appelé par la veille), joués sur les émulateurs.
  Reste : déployer la règle `coutsIa`, recopier les 6 433 lignes sur le vrai projet (accord), vérification 6.4.
- Jour 5 du plan MVP (2026-10-21, `candidature-depuis-pdf`) : fonction serveur `preremplirCandidature` (Haiku, plafond
  5 euros par mois) jouée sur les émulateurs : dossier de test lu, titre, résumé et montant remplis, 0,0009 euro. Reste :
  secret `ANTHROPIC_API_KEY` posé par Monsieur DUCOUT, déploiement de la fonction (5.3), vrai dossier (5.5).
- Jour 3 clos le 2026-10-21 : boîte d'envoi contact@arcadiaco.fr configurée par Monsieur DUCOUT (mot de passe d'application dans
  `scraping/.env`), courriel de test puis bilan administrateur et courriels candidats envoyés ; la veille du lundi les enverra seule.
- Jour 4 du plan MVP (2026-10-21 matin, `suivi-testeurs`) : journal des actions (connexion, recherche, fiche, recherche
- 2026-10-21 après-midi : connecteur `scraping/portail_recherche.py` (portail appelsprojetsrecherche.fr, export CSV, 125 fiches, appelé par `veille.cmd`) ; contrôle et qualification des 28 fiches ouvertes en attente d'accord (0,015 euro), puis import.
- 2026-10-21 fin d'après-midi : jour 6 `financeur-vendable` codé et lu sur les émulateurs (`docs/DEMO_FINANCEUR.md`) ; Monsieur DUCOUT joue la démonstration, puis règle `statistiquesPubliques` et `publier_chiffres.py` sur le vrai projet sur accord.
- 2026-10-21 soir : jour 7 `mise-en-ligne-testeurs` codé et joué sur les émulateurs ; Monsieur DUCOUT remplit `app/src/pages/legal/editeur.ts`, suit `docs/MISE_EN_LIGNE.md` (déploiement par lui), invite trois testeurs.
  sauvegardée, candidature, appel) et page `/admin/testeurs`, joués sur les émulateurs ; règle Firestore `journal` écrite
  et testée, à déployer après accord de Monsieur DUCOUT (tâche 4.3), puis sa vérification (4.5).
- Jour 3 du plan MVP (2026-10-20 soir, `alertes-courriel`) : courriels hebdomadaires (bilan administrateur, appels de la
  semaine aux candidats) composés et écrits à blanc dans `scraping/logs/courriels/` ; `veille.cmd` les envoie après la
  relecture. Reste : Monsieur DUCOUT renseigne la boîte d'envoi dans `scraping/.env` (3.2), test, premier envoi réel (3.3).
- Jour 2 du plan MVP (2026-10-20 soir, `qualification-appels`) : outil de qualification, import, filtres, fiche, fenêtre
  « Qualifier » faits ; qualification réelle lancée sur accord (303 fiches, 0,087 euro) ; reste : ré-import, rejouer filtre et
  fiche sur les émulateurs, tirer vingt fiches au sort pour Monsieur DUCOUT (tâche 2.6).
- Émulateurs Firebase en place (2026-10-20 soir, `emulateurs-parcours-connectes`) : `app/emulateurs_dev.cmd` ou
  `npm run emulateurs` + `npm run dev:emulateurs` (port 3001), comptes de test de `scripts/semer_emulateurs.py` ; règle :
  tout parcours connecté est joué par la session sur les émulateurs avant livraison. Parcours candidat du jour 1 joué
  de bout en bout (candidature avec pièce). Reste : Monsieur DUCOUT lance `emulateurs_dev.cmd` une fois (tâche 1.3).
- Jour 1 du plan MVP fait le 2026-10-20 au soir (`parcours-candidat-jour-1`) : fiche en trois cases, tableau de bord candidat réel,
  détail de candidature, colonnes ; 51 tests, lint, build ; attend le parcours de Monsieur DUCOUT (tâche 1.4). Jour 2 suivant :
  qualification (à qui s'adresse l'appel, type, objet, date d'ouverture, pièces) avec devis écrit avant tout appel.
- PLAN MVP (2026-10-20, fin d'après-midi) : à la demande de Monsieur DUCOUT (« rien n'avance côté application »), le plan
  de sept jours vers un prototype présentable à des testeurs est dans `docs/PLAN_MVP_2026-10-20.md` ; il remplace l'ordre
  de travail précédent (points helloDarwin, qualification) et commence par le parcours candidat sans impasse. Le lire
  en premier à la reprise.
- Retours de Monsieur DUCOUT après son parcours de l'application (2026-10-20, après-midi) : trois changements codés,
  `navigation-et-pages-publiques` (gabarit, menus par rôle, retour, pied de page, accueil à trois cartes, cinq pages
  publiques), `administration-controle` (carte « Fiches à contrôler », valider / rejeter / modifier depuis
  `/admin/aaps`, recherche publique limitée aux fiches contrôlées, import en brouillon sans validation, script de
  dépublication en essai à blanc : 34 fiches) et rattachement des financeurs étendu (86 -> 69 noms). En attente de son
  accord : dépublication réelle des 34 fiches, ré-import pour les financeurs, déploiement de la règle `messagesContact`,
  boîte d'envoi pour l'e-mail hebdomadaire de la veille. Décisions prises : candidat = établissement qui répond,
  porteur de projet = financeur ; une fiche non contrôlée n'est jamais visible des candidats. Agences de l'eau : deux
  fiches validées par le modèle à rejeter depuis l'administration (`scraped-9b62f48e295fb0ac`, `scraped-db009b2d484f0bdc`).
- Transposition helloDarwin, points 1 à 3 (2026-10-20, après-midi, changements `parcours-integration`,
  `liste-demarrage`, `recherche-guidee`) : nouveau parcours d'intégration sur `/complete-profile` (accueil, trois
  écrans, offres à trois colonnes avec les montants de `config/stripe.ts` à valider), carte « Démarrer (n/4) » sur les
  deux tableaux de bord, recherche avec compteur de montants, étiquettes, statut, lien partageable, « Initialiser à mon
  profil », onglet « Consultées ». Preuve de la session : 39 tests, lint, build, écran `/aap/search?territory=normandie&statut=bientot-clos`
  (« 19 appels à projets totalisant 6 860 433 € annoncés (6 fiches chiffrées) », deux étiquettes, croix qui retire
  « Normandie » et réécrit l'adresse). Reste : vérification par Monsieur DUCOUT avec un compte de test neuf (tâches
  4.2, 3.2, 3.2), puis points 4 à 6 (fiche, candidatures en colonnes, paramètres) et le second groupe de filtres
  (enrichir l'extraction, devis).
- Pages Mon profil et Modifier l'appel (2026-10-20, `profil-et-edition-aap`) : `/profil` montre le compte et le formulaire
  de profil pré-rempli (« Enregistrer ») ; `/aap/:id/edit` ouvre le formulaire de création pré-rempli pour le financeur
  auteur (« Sauvegarder » garde le statut, « Publier » publie un brouillon). Restent vides : paiements et paramètres
  admin. Monsieur DUCOUT rejoue les scénarios de la spec avec ses deux comptes de test (tâche 4.2).
- Dégel de l'application complète (2026-10-19, après-midi, `degel-application-complete`, décisions de Monsieur DUCOUT :
  tout lancer, pages légales rédigées, tests faits, MFA à la fin, Blaze activé par lui, Google à activer par lui) :
  routes rétablies, lint et build verts sur tout le code, règles Firestore rouvertes (23 tests), pages légales, `npm test`
  12 tests. Reste : accord pour déployer les règles (2.2), parcours connectés à jouer par Monsieur DUCOUT avec des comptes
  de test (3.1 à 3.4), ses données d'entreprise dans `app/src/pages/legal/editeur.ts`, puis fonctions serveur quand Blaze
  est confirmé. Règles déployées à 16 h 30 sur son accord ; application renommée « AAP Santé » ; raccourci « AAP Sante »
  sur son bureau ; connexion Google activée par lui.
- Lot 2 commencé (2026-10-19, 17 h, `fraicheur-dates-collecte`, instruction 10) : en-tête daté des textes, `collecte_le`,
  `collecteLe` et `derniereVueLe` ; 2 047 fiches datées, 537 documents mis à jour ; ses six premiers verdicts atteignent
  la base (correction de l'import).
- Rejeu et veille (2026-10-20, `rejeu-collecte-veille`) : `scraping/rejeu.py` (relire, collecter, marquer, rapport),
  `veille.cmd`, `scripts/perimer_fiches.py`, import `derniereVueLe` d'après le rejeu et `absences`. Premier rejeu réel sur
  les vingt premières sources (ARS, portail des ARS, CNSA) fait ; `VEILLE.md`. Chaque lundi à 8 h, la tâche planifiée Windows
  « AAP Sante - veille hebdomadaire » lance `veille.cmd auto` (journal `scraping/logs/veille.log`, décision du 2026-10-20) ;
  ensuite : lire `VEILLE.md`, devis, accord, extraction, contrôle, import ; `perimer_fiches.py` quand une fiche atteint deux
  absences. Le 2026-10-20 : 19 textes nouveaux extraits (17 fiches créées, 15 publiées), veille lancée sur les 222 pages
  restantes.

## Phrase à écrire au début de la prochaine session (ouverte dans le dossier AAP)

"Lis REPRISE.md et openspec/changes/lot-0-assainissement/tasks.md. Donne-moi ce qui reste à faire ou à valider dans le
lot 0 (sources vérifiées, pas de supposition), puis attends mes accords."

## Commandes utiles (depuis `AAP/scraping`, environnement `../.venv`)

```bash
../.venv/Scripts/python -m pytest tests -q
../.venv/Scripts/python qualification.py --qualifier      # reprend où il s'est arrêté
../.venv/Scripts/python qualification.py --registre --rapport
../.venv/Scripts/python echantillon.py --extraire --moteur ollama
../.venv/Scripts/python extraction_locale.py --bilan                        # avancement du passage local
../.venv/Scripts/python extraction_locale.py --extraire --modele qwen3:8b   # reprend où il s'est arrêté
../.venv/Scripts/python ../scripts/import_to_firestore.py --source extraction_locale   # depuis AAP/, import d'un lot
../.venv/Scripts/python validation.py --migrer-verdicts --dry-run                       # lot 0 : fait le 2026-10-14, plus rien à migrer
../.venv/Scripts/python validation.py --appliquer-pages --dry-run                       # bilan seul, rien d'écrit
../.venv/Scripts/python echantillon.py --extraire --moteur api --modele claude-haiku-5-5 --limite 1   # fait le 2026-10-14 ; une relance saute les textes déjà traités
../.venv/Scripts/python ../scripts/migrer_echeances.py --dry-run                        # lot 0 : fait le 2026-10-14, contrôle attendu « 141 deja a null »
cd ../app && npm run lint && npm run build && npm run test:rules                        # test:rules : JDK 21 en tête du PATH
openspec validate <changement> ; openspec archive <changement> --yes
```
