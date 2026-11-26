# Sélection des appels : pages bloquées, marchés publics, hors champ, relais

## Pourquoi

Le 2026-11-26, Monsieur DUCOUT a relevé dans l'application des fiches qui ne sont pas des appels à projets de son champ
(« refais un travail sur la qualification sélection des AAP », puis « Oui, corrige ») :

- des descriptions qui reprennent l'écran anti-robot du site source (« Vérification de sécurité en cours ... vous n'êtes
  pas un bot ») : 25 textes collectés sont des pages bloquées (9 du Grand Est, Corse, Atlanpole, Oise, Lozère...), dont 9
  ont donné une fiche ; une est en ligne, validée par le modèle (« AMI Territoires pilotes – Urbanisme Favorable à la
  Santé ») ;
- un marché public pris pour un appel (« AMI ... 24 avenue du Prado – 2026K19 », site des marchés publics de la
  Métropole Aix-Marseille, procédure MAPA, « remise des plis ») : 7 fiches viennent de ce site ;
- des appels hors champ (forêts, grands fonds marins, décarbonation industrielle, LEADER) placés dans sa file « à
  corriger » au lieu d'être écartés ;
- des relais affichés comme financeurs (« Medicen Paris Region – appels à projets (dans le cadre du plan France 2030) »,
  « Biotech Santé Bretagne ») : un pôle de compétitivité relaie, il ne finance pas.

Causes vérifiées dans le code : la collecte ne rejette qu'un texte de moins de 200 caractères et ne relit jamais un texte
enregistré ; rien n'écarte les plateformes d'achat public ; l'import met un appel hors champ « à corriger » ; la règle des
relais ne trouve le financeur réel que s'il est cité entre parenthèses ET connu du référentiel (« France 2030 » ne l'est
pas) ; un ré-import réécrit le champ et le financeur corrigés par la relecture du 2026-11-26.

## Ce qui change

1. Collecte : une page anti-robot ou « accès refusé » est relue après une attente ; si elle reste bloquée, rien n'est
   enregistré (la veille suivante réessaie).
2. Extraction : un texte bloqué est mis de côté sans appel au modèle (dossier `_bloquees/`, relu par la collecte suivante) ;
   un marché public est refusé sans appel au modèle.
3. Import : une fiche dont l'adresse est une plateforme d'achat public, ou dont la description décrit une page bloquée,
   n'est pas importée.
4. Import : un appel classé hors champ par le modèle (champ ou qualification), sans verdict de Monsieur DUCOUT, est
   rejeté et archivé d'office (« hors champ (modèle), écartée d'office ») ; il ne va plus dans sa file.
5. Import : un relais n'est jamais affiché comme financeur. Le programme « France 2030 » cité par le relais devient le
   financeur ; à défaut, la fiche d'un relais pur (pôle de compétitivité, gérontopôle, agrégateur) affiche « Financeur à
   préciser (relayé par ...) », sans changer son statut. Un cancéropôle (catégorie établissement) garde ses propres
   appels. Révisé après la contre-vérification du 2026-11-26 : la première version passait la fiche nouvelle « à
   corriger » mais laissait publiée la fiche déjà en base ; une seule règle, qui n'ajoute rien à la file.
   `[À VALIDER — Monsieur DUCOUT : afficher « Financeur à préciser » plutôt que de dépublier]`
6. Import : les corrections de la relecture (champ, financeur) sont lues dans `scraping/sources/corrections_fiches.json`
   et l'emportent sur le modèle à chaque import.
7. Administration : valider une fiche classée hors champ demande une confirmation qui le dit.
8. Consigne du modèle (version 5) : marchés publics, pages bloquées et exemples hors champ de Monsieur DUCOUT ; un relais
   n'est pas le financeur.
9. Nettoyage : `scripts/nettoyer_selection.py`, essai à blanc par défaut ; local (textes bloqués mis de côté, entrées
   retirées des résultats, sauvegarde) et base (fiches bloquées et marchés publics archivés, financeur des relais
   corrigé), écriture réelle seulement sur l'accord de Monsieur DUCOUT, après sauvegarde.

## Hors périmètre

- Consommation des lectures Firestore (quota gratuit épuisé le 2026-11-26) : changement à part.
- Reclassement des fiches déjà en base par le modèle : non ; seules les règles ci-dessus s'appliquent.

## Coût estimé

Zéro euro : aucun appel au modèle payant ; règles déterministes et tests. Nettoyage de la base : une lecture de la
collection `aap` (environ 1 100 lectures) et quelques dizaines d'écritures, après la remise à zéro du quota.

## Risques

- Un appel de santé classé hors champ par erreur est archivé sans passer par la file : il reste visible dans
  l'administration (filtre « Rejetée ») et la relecture peut le corriger par `corrections_fiches.json`.
- Le vocabulaire des marchés publics peut apparaître dans un vrai appel : deux marques distinctes sont exigées, ou une
  adresse de plateforme d'achat public. `[À VALIDER — Monsieur DUCOUT : liste des plateformes et des marques]`
- Les relais « purs » sont définis par la catégorie du registre (tout relais sauf « etablissement »).
  `[À VALIDER — Monsieur DUCOUT]`
