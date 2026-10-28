# Questions en attente de Monsieur DUCOUT

La session écrit ici ce qui demande sa décision et continue sur autre chose. Il répond quand il veut ; une question
tranchée est déplacée en bas avec sa réponse et sa date.

## Ouvertes

1. (2026-10-28) Délégation accordée dans la conversation du 2026-10-28 (budget de pilote, imports en « à valider »,
   commit et push en fin de changement) : le garde-fou de Claude Code refuse que la session l'écrive elle-même dans
   `CLAUDE.md` ou dans un document du projet. Pour qu'elle vaille aux sessions suivantes, Monsieur DUCOUT l'inscrit
   lui-même dans `CLAUDE.md`, ou autorise la modification dans les réglages de Claude Code.
2. (2026-10-28) Valider ou modifier les critères de réussite du pilote (`docs/PILOTE_MVP.md`).
3. (2026-10-27) Relire la file « Proposée, non relue » de `/admin/aaps` (121 fiches le 2026-10-28 après le lot B1,
   dont 24 appels européens de santé du connecteur Funding & Tenders, titres en anglais) ; urgent : novap
   (clôture samedi 31 octobre), Idéa'Dom et les deux appels Émergence du Cancéropôle Nord-Ouest (30 octobre).
3 bis. (2026-10-28) Doublons : `docs/DOUBLONS.md` (régénéré après le lot B1) propose, pour 49 groupes, la fiche à
   garder ; 64 fiches à rejeter dans `/admin/aaps` (31 dans la file, 33 déjà publiées), sauf l'« Axe 3 » du
   Pas-de-Calais (question 7). Rejeter les doublons de la file d'abord allège la relecture d'un quart.
3 ter. (2026-10-28) Test ancien en échec, hors du travail du jour : `test_six_orthographes_un_financeur_nom_extrait_conserve`
   (`scripts/tests`) suppose qu'aucune source ne rattache « Département du Rhône », alors que le registre le fait ; il
   échoue déjà au 2026-10-23. Proposition : adapter le test à un nom vraiment inconnu (à faire par la session sur accord).
4. (2026-10-23) Redéployer l'hébergement et les règles depuis `app` : le site sert encore les pièces jointes
   (`/documents/ars_corse/media_141914.pdf` répond par un PDF le 2026-10-28).
5. (2026-10-23) Inviter trois testeurs, jouer la démonstration financeur, ouvrir la facturation Blaze, trancher les
   mentions légales encore « à valider ».
6. (2026-10-28) Option : courriel récapitulatif de la veille chaque lundi depuis contact@arcadiaco.fr (oui / non).
7. (2026-10-28) Lot B1 (conférences des financeurs) : 13 fiches ajoutées à la file « Proposée, non relue » (121 au
   total) ; urgentes : « Bienvenue à la Retraite » de la CGSS Martinique et « CFPPA Aisne 2027 » (clôture 30 octobre ;
   l'appel de l'Aisne est déjà publié depuis appelaprojets.org, la nouvelle fiche est un doublon). Attention : `docs/DOUBLONS.md`
   propose de rejeter l'« Axe 3 » du Pas-de-Calais comme doublon de l'« Axe 5 » ; ce sont deux appels distincts, ne pas
   le rejeter. Correction de l'appariement (numéro d'axe) à faire dans un petit changement, sur accord.
8. (2026-10-28) Appels publiés seulement en PDF : 23 des 75 départements couverts (mesure par mots-clés). Proposition :
   un changement qui lit le texte des PDF liés depuis une page suivie (bibliothèque légère `pypdf`, à installer), avec
   ses scénarios et un devis avant tout appel au modèle (oui / non).
9. (2026-10-28) Vérification 5.1 du changement `famille-conferences-des-financeurs` : ligne « Conférences des
   financeurs » de `scraping/REGISTRE_SOURCES.md` et fiches CFPPA dans `/admin/aaps`.
10. (2026-10-28) Relecture du lot B1 par un second modèle : la session a posé `url_validee` (« à confirmer à l'écran »)
   sur 47 sources, alors que ce champ est réservé aux adresses validées par Monsieur DUCOUT (`scraping/registre.py`,
   ligne 32) ; Landes et Oise (refus HTTP 403) et Seine-Saint-Denis y sont « confirmées » sans avoir été lues.
   Proposition : retirer `url_validee` des 39 sources nouvelles (leur `url_aap` porte déjà la page), porter la page
   dans `url_aap` pour les 8 sources existantes (ancienne adresse gardée dans les notes), passer Landes, Oise et
   Seine-Saint-Denis « à vérifier ». Rien n'est fait sans son accord.

## Tranchées

| Date | Question | Réponse |
|---|---|---|
| 2026-10-28 | Délégation et petit budget de pilote | Accordés dans la conversation (« oui »), pour cette session |
