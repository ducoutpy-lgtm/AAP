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
4. (faite le 2026-11-13, voir en bas)
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
10. (tranchée le 2026-10-28, voir en bas)
11. (tranchée le 2026-11-13 pour `jazzy-tarsier-6499a9`, voir en bas) Reste : `teal-twilight-a7fcf3` (Netlify,
   version d'avril gardée en repli, reliée à GitHub) à garder, arrêter ou supprimer.
12. (tranchée le 2026-11-13, voir en bas)

## Tranchées

| Date | Question | Réponse |
|---|---|---|
| 2026-10-28 | Délégation et petit budget de pilote | Accordés dans la conversation (« oui »), pour cette session |
| 2026-10-28 | 10. Les 47 `url_validee` posées par la session au lot B1 | « Oui, corrige », puis « Marqueur propre » : champ `page_ciblee` (changement `page-ciblee-par-la-session`), 47 sources migrées sans perte de lecture, Landes, Oise et Seine-Saint-Denis « à vérifier » |
| 2026-11-13 | 11. Crédits Netlify consommés par les poussées (site `jazzy-tarsier-6499a9`, 15 crédits par déploiement, 300 par mois) | « Oui, pousse » : constructions arrêtées par Monsieur DUCOUT dans Netlify ; poussées vers GitHub reprises |
| 2026-11-13 | 12. Les 25 autres `url_validee` posées par une session « à confirmer à l'écran » (27 et 28 octobre) | « Oui, migre-les » : 25 sources migrées vers `page_ciblee`, 0 écart de lecture ; plus aucune `url_validee` « à confirmer » au registre ; les 4 adresses posées avec son accord du 2026-10-21 restent telles quelles |
| 2026-11-13 | 4. Redéployer l'hébergement et les règles depuis `app` | « Oui, mets en ligne » : déploiement fait le 2026-11-13 à 14 h 49 depuis la séance de pilotage (`firebase deploy --only hosting,firestore:rules`, « Deploy complete! ») ; `/documents/ars_corse/media_141914.pdf` ne renvoie plus de PDF et la page d'accueil sert la compilation du jour ; non vérifié : les pages après connexion et la tâche 2.1 de `pieces-jointes-hors-ligne` |
