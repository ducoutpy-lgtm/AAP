# Proposal

## Why

Le 2026-10-28, 46 des 113 fiches de la file « à valider » de Monsieur DUCOUT affichent pour financeur le relais qui les
a publiées (Lyonbiopôle, cancéropôles, Atlanpole, Biotech Santé Bretagne). Trois cas :
1. l'appel est celui du relais (Émergence du Cancéropôle Nord-Ouest, AMI du Gérontopôle Sud) : le nom est juste ;
2. le modèle a lu le vrai financeur et l'a mis entre parenthèses après le relais : « Lyonbiopôle … (appel émis par la
   Commission européenne …) », « (France 2030 – Bpifrance pour la sélection) », « (appel émis par l'INCa …) » ;
3. rien n'indique le vrai financeur (FEDER chez Lyonbiopôle, EIT Health chez Biotech Santé Bretagne).
Cause du cas 2 : `financeurs.canonique` essaie le nom sans parenthèses avant le contenu des parenthèses ; il trouve le
relais et s'arrête. Lot A3 du pilote (critère « effort de relecture »).

## What Changes

- `financeurs.financeur_reel_du_relais` : quand la fiche vient d'une source `relais: true` et que le nom extrait se
  rattache au relais lui-même, chercher dans les parenthèses un financeur connu de la table canonique (nom ou variante
  entier, le plus long gagne, mots trop généraux écartés) ; l'import l'affiche à la place du relais. Pourquoi une règle et
  pas un appel au modèle : le modèle a déjà écrit le vrai financeur, il suffit de le lire ; zéro euro, déterministe.
- `scripts/corriger_financeur_relais.py` : applique la même règle aux fiches déjà en base de la file « à valider »
  (brouillons « proposee » seulement, jamais une fiche relue), sauvegarde avant écriture, essai à blanc par défaut, et
  liste les fiches du cas 3 pour correction à la main.
- Hors périmètre : cas 3 (pas d'information dans le texte) ; consigne d'extraction (le modèle écrit déjà le vrai
  financeur entre parenthèses) ; ajout de financeurs au référentiel.

## Capabilities

### Modified Capabilities

- `import-aap-scrapes` : financeur réel d'un appel publié par un relais.

## Impact

- Code : `scraping/financeurs.py`, `scripts/import_to_firestore.py`, `scripts/corriger_financeur_relais.py`, tests.
- Coût : zéro euro.
