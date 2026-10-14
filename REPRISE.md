# Reprise du projet AAP Santé (écrit le 2026-10-12, à lire au début de chaque session)

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
| 5. Import dans l'application | `scripts/import_to_firestore.py` | OK : 95 AAP en base (89 des 5 connecteurs historiques + 6 de l'échantillon), visibles dans "Rechercher des AAP" SANS compte depuis le 2026-10-13 (changement `consultation-aap-sans-compte`), pièces jointes servies depuis le PC. |
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
  Monsieur DUCOUT en attente) : `scraping/validation.py`, deux raccourcis sur son bureau (« Validation des pages des
  sources » : les 155 pages gardées, port 8788 ; « Validation manuelle des AAP » : échantillon de 60 liens, un par
  source, port 8787). Verdicts dans `results/validation_pages.json` et `results/validation_liens.json` (34 verdicts sur
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

## Phrase à écrire au début de la prochaine session (ouverte dans le dossier AAP)

"Lis REPRISE.md. Donne-moi le bilan de mes verdicts dans results/validation_pages.json et results/validation_liens.json
(sources vérifiées, pas de supposition), puis ce qui reste à décider (vérification 2.1 de l'outil, grille de critères,
moteur d'extraction 3.2), et attends."

## Commandes utiles (depuis `AAP/scraping`, environnement `../.venv`)

```bash
../.venv/Scripts/python -m pytest tests -q
../.venv/Scripts/python qualification.py --qualifier      # reprend où il s'est arrêté
../.venv/Scripts/python qualification.py --registre --rapport
../.venv/Scripts/python echantillon.py --extraire --moteur ollama
../.venv/Scripts/python extraction_locale.py --bilan                        # avancement du passage local
../.venv/Scripts/python extraction_locale.py --extraire --modele qwen3:8b   # reprend où il s'est arrêté
../.venv/Scripts/python ../scripts/import_to_firestore.py --source extraction_locale   # depuis AAP/, import d'un lot
openspec validate <changement> ; openspec archive <changement> --yes
```
