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

## Chaîne de traitement et état réel

| Étape | Outil | État |
|---|---|---|
| 1. Registre des émetteurs (qui publie des AAP) | `scraping/registre.py`, `sources/registre.json` | 847 sources ; 657 adresses répondent. "Page vérifiée" veut dire que l'adresse répond, pas qu'elle contient des AAP. |
| 2. Découverte des rubriques (où ils publient) | `scraping/decouverte.py`, `DECOUVERTE.md` | 270 rubriques candidates et 3 748 liens candidats, repérés par mots-clés, NON vérifiés. Pages gardées dans `scraping/decouverte/` (hors Git). |
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

## Où en est le projet (mis à jour le 2026-10-12, nuit)

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
- **Tâche suivante : changement « second tour d'extraction Ollama avec seuil »** (à proposer avec `/opsx:propose`) :
  question préalable « est-ce un appel à projets ? » avant d'extraire, contrôle strict des formats (dates AAAA-MM-JJ,
  montants entiers) avec nouvelle demande au modèle en cas d'écart, essai de Qwen 27B à côté de mistral 7b (un seul
  modèle à la fois sur la carte graphique), mesure contre les 24 fiches de référence de `results/echantillon_claude_code.json`,
  seuil fixé par Monsieur DUCOUT avant le tour (proposition : 20 fiches justes sur 24). L'API Anthropic n'est retenue
  que si le seuil n'est pas atteint ; son coût sur les 155 rubriques confirmées reste à estimer dans ce cas.
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

## Phrase à écrire au début de la prochaine session (ouverte dans le dossier AAP)

"Lis REPRISE.md, dis-moi la tâche suivante et propose le changement du second tour d'extraction Ollama avec seuil."

## Commandes utiles (depuis `AAP/scraping`, environnement `../.venv`)

```bash
../.venv/Scripts/python -m pytest tests -q
../.venv/Scripts/python qualification.py --qualifier      # reprend où il s'est arrêté
../.venv/Scripts/python qualification.py --registre --rapport
../.venv/Scripts/python echantillon.py --extraire --moteur ollama
openspec validate <changement> ; openspec archive <changement> --yes
```
