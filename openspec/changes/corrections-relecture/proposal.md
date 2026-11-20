# Proposal

## Why

Consigne relayée par la séance de pilotage le 2026-11-20 au soir (« Non, tout brûler ») : un tour de recherche de
défauts dans l'application, avec un test qui échoue avant chaque correction. Six relecteurs ont lu toute l'application,
chacun sur une partie, sans rien modifier : 35 signalements, soit 29 une fois les doublons retirés. Chaque signalement a
ensuite été soumis à deux vérificateurs indépendants : l'un a cherché à le réfuter en suivant le code pas à pas,
l'autre en vérifiant s'il était voulu ou déjà connu (specs, `docs/A_VALIDER.md`, `CHANGELOG.md`). 21 défauts ont été
confirmés par les deux, 8 ont été écartés. Les plus graves :

- enregistrer « Mon profil » efface les textes réutilisables ;
- la fenêtre « Préciser mon profil » efface le site et la présentation déjà saisis ;
- la page des candidatures d'un appel est toujours vide pour le financeur ;
- le bouton « Modifier » de l'administration renvoie l'administrateur sur `/admin`.

## What Changes

Une correction par défaut, dans l'ordre de gravité. Pour chacune, un test (Vitest, test de règles sur l'émulateur,
ou reproduction sur les émulateurs quand le défaut tient à Firebase) échoue d'abord, puis la correction le fait passer :

- profil et liste « Démarrer » : écritures fusionnées, qui ne touchent que les champs saisis ;
- candidatures d'un appel : requête bornée au financeur connecté ;
- route d'édition ouverte à l'administrateur ; une date de clôture vide donne une échéance nulle ;
- candidature refusée sur un appel clos ;
- écran d'erreur réinitialisé au changement de page ;
- action groupée de l'administration alignée sur les boutons unitaires ;
- règles des candidatures et des appels bornées (champs modifiables, statuts possibles) ;
- défauts mineurs d'affichage : détail d'une candidature suivie hors de l'application, pièces non déposées, retour à la
  recherche avec ses filtres, calendrier, prochaine échéance, suppression du compte.

Pourquoi ce périmètre : chaque correction touche un seul écran ou une seule règle, et reste vérifiable par Monsieur
DUCOUT sans compétence technique.

Hors périmètre, car ces points demandent une décision de Monsieur DUCOUT (`REPRISE.md`) :

- compteur de vues : l'alimenter ou retirer l'affichage ;
- case « Se souvenir de moi » : la brancher ou la retirer ;
- thématique des appels saisis par un financeur (correspondance avec `sectorsTargeted`, à reporter dans le courriel du
  lundi) ;
- comptage du jour de clôture outre-mer (règle commune à l'import, à l'application et au courriel) ;
- clôture d'un appel par son financeur.

Hors périmètre également : les 8 signalements écartés, ainsi que tout déploiement. Les règles et l'hébergement ne sont
mis en ligne que sur accord écrit de Monsieur DUCOUT.

Coût : zéro euro (aucun appel payant), environ deux heures de session.

## Capabilities

### New Capabilities

- `fiabilite-parcours` : les parcours candidat, financeur et administrateur ne perdent ni ne réécrivent de données à
  tort, et n'affichent pas d'écran vide à tort.
