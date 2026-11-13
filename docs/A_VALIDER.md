# Questions en attente de Monsieur DUCOUT

La session écrit ici ce qui demande sa décision et continue sur autre chose. Il répond quand il veut ; une question
tranchée est déplacée en bas avec sa réponse et sa date.

## Ouvertes

3. (2026-10-27) Relire la file « Proposée, non relue » de `/admin/aaps` (121 fiches au 2026-11-13, même nombre que le
   2026-10-28, dont 24 appels européens de santé du connecteur Funding & Tenders, titres en anglais). Les appels signalés
   urgents le 2026-10-28 (novap, Idéa'Dom, Émergence du Cancéropôle Nord-Ouest, CGSS Martinique, CFPPA Aisne) sont clos
   depuis le 30 et le 31 octobre. À sa charge.
5. (2026-10-23) Démonstration financeur complète (`docs/DEMO_FINANCEUR.md`) et ouverture de la facturation Blaze. À sa
   charge. Les testeurs et les mentions légales sont tranchés (voir en bas).
9. (2026-10-28) Vérification 5.1 du changement `famille-conferences-des-financeurs` : ligne « Conférences des
   financeurs » de `scraping/REGISTRE_SOURCES.md` et fiches CFPPA dans `/admin/aaps`. À sa charge.
11. (2026-11-13) Netlify : arrêter les constructions du site `teal-twilight-a7fcf3` (décision prise, voir en bas). À
   faire par lui dans Netlify (Project configuration > Build & deploy > Continuous deployment > Build settings >
   Configure > Stopped builds).

## Tranchées

| Date | Question | Réponse |
|---|---|---|
| 2026-10-28 | Délégation et petit budget de pilote | Accordés dans la conversation (« oui »), pour cette session |
| 2026-10-28 | 10. Les 47 `url_validee` posées par la session au lot B1 | « Oui, corrige », puis « Marqueur propre » : champ `page_ciblee` (changement `page-ciblee-par-la-session`), 47 sources migrées sans perte de lecture, Landes, Oise et Seine-Saint-Denis « à vérifier » |
| 2026-11-13 | 11. Crédits Netlify consommés par les poussées (site `jazzy-tarsier-6499a9`, 15 crédits par déploiement, 300 par mois) | « Oui, pousse » : constructions arrêtées par Monsieur DUCOUT dans Netlify ; poussées vers GitHub reprises |
| 2026-11-13 | 12. Les 25 autres `url_validee` posées par une session « à confirmer à l'écran » (27 et 28 octobre) | « Oui, migre-les » : 25 sources migrées vers `page_ciblee`, 0 écart de lecture ; plus aucune `url_validee` « à confirmer » au registre ; les 4 adresses posées avec son accord du 2026-10-21 restent telles quelles |
| 2026-11-13 | 4. Redéployer l'hébergement et les règles depuis `app` | « Oui, mets en ligne » : déploiement fait le 2026-11-13 à 14 h 49 depuis la séance de pilotage (`firebase deploy --only hosting,firestore:rules`, « Deploy complete! ») ; `/documents/ars_corse/media_141914.pdf` ne renvoie plus de PDF et la page d'accueil sert la compilation du jour ; tâche 2.1 de `pieces-jointes-hors-ligne` revérifiée par la session (réponse `text/html`) ; `/aap/search` affiche « 378 appels à projets » vers 15 h 45, lui étant connecté |
| 2026-11-13 | 1. Délégation (budget de pilote, imports en « à valider », commit et push en fin de changement) | « Oui, permanente » (choix à cocher, séance de pilotage). Effet seulement quand Monsieur DUCOUT l'aura écrite lui-même dans `CLAUDE.md` ; d'ici là, son accord est demandé comme d'habitude |
| 2026-11-13 | 2. Critères de réussite du pilote (`docs/PILOTE_MVP.md`) | « Oui, tels quels ». À faire par la session : bilan du pilote (2026-10-28 au 2026-11-11) contre les cinq seuils, et chiffrage du passage à l'échelle |
| 2026-11-13 | 3 bis. Doublons (`docs/DOUBLONS.md`) | « La séance, avec sauvegarde » : après la correction du rapprochement par numéro d'axe, la session rejette les doublons avec une sauvegarde préalable et lui remet la liste ; jamais l'« Axe 3 » du Pas-de-Calais. Écriture en base confirmée par lui dans la conversation avant exécution |
| 2026-11-13 | 3 ter et 7. Ancien test en échec, rapprochement des doublons par numéro d'axe | « Oui, les deux » |
| 2026-11-13 | 6. Courriel récapitulatif de la veille chaque lundi depuis contact@arcadiaco.fr | « Oui » |
| 2026-11-13 | 8. Lecture des appels publiés seulement en PDF | « Oui, avec devis » : changement OpenSpec, bibliothèque `pypdf`, devis écrit et accepté avant tout appel au modèle |
| 2026-11-13 | 11 (suite). Site Netlify `teal-twilight-a7fcf3` (version d'avril) | « Arrêter les constructions », à faire par lui dans Netlify |
| 2026-11-13 | 5. Testeurs | « Pas de test, on continue comme ça pour le moment, la plateforme n'est pas assez développée pour soumettre au test » : aucune invitation ; la prochaine livraison est du développement |
| 2026-11-13 | 5. Mentions légales encore « à valider » | Mesure d'audience : « Oui, aucun outil » pendant le test (mentions à retirer dans Mentions légales et Confidentialité) ; durées de conservation : « Oui, je confirme » ; tarifs et résiliation : « Tarifs provisoires » (aucun paiement pendant le test, résiliation fixée à l'ouverture du paiement) ; clause de litige : « Garder pour le test » (relecture par un conseil avant l'ouverture du paiement) ; emplacement des comptes et des fichiers vérifié le 2026-11-13 (comptes de connexion aux États-Unis, base en Union européenne `eur3`, stockage de fichiers aux États-Unis `US-CENTRAL1`, vide), texte proposé. Pages pas encore modifiées dans le code au 2026-11-13 ; mise en ligne sur son accord |

Les réponses du 2026-11-13 (questions 1, 2, 3 bis, 3 ter, 5, 6, 7, 8, 11) ont été données par choix à cocher dans la
séance de pilotage des projets et transmises à la session AAP par cette séance.
