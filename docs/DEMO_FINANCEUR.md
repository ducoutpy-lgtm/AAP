# Démonstration financeur en dix minutes

Jour 6 du plan MVP (changement `financeur-vendable`, 2026-10-21). À jouer sur les émulateurs du PC
(`app/emulateurs_dev.cmd`, application sur http://localhost:3001) avec le compte financeur de test de
`scripts/semer_emulateurs.py`. Chaque étape indique ce qui doit s'afficher ; la colonne « Joué par la session » donne
ce que la session a lu le 2026-10-21 (lecture de page, pas de capture).

| Minute | Étape | Ce qui doit s'afficher | Joué par la session le 2026-10-21 |
|---|---|---|---|
| 0 | Sans compte, ouvrir `/financeurs` (menu « Financeurs ») | Trois bénéfices, les chiffres comptés dans l'application (établissements inscrits, appels suivis, financeurs, sites), le tarif financeur avec la mention « paiement non ouvert » | OK : « 4 établissements inscrits, 4 appels suivis, 2 financeurs, 1 site » (émulateur), « 14 jours d'essai gratuit, puis 99,99 € par mois » |
| 1 | Se connecter avec financeur@test.local | Tableau de bord : appels publiés 2 (1 brouillon), candidatures reçues 4 (1 à traiter), acceptées 1, vues 43 ; liste des appels avec clôture ; dernières candidatures avec leur statut ; prochaine échéance | OK, chiffres identiques |
| 3 | Menu « Candidatures reçues » | Cinq colonnes (reçue, en examen, présélectionnée, acceptée, refusée), les quatre candidatures semées chacune dans sa colonne, montant et date sur chaque carte | OK : 1 / 1 / 0 / 1 / 1 |
| 4 | Cliquer la carte « Ateliers équilibre et marche aux Lilas » | Page d'évaluation : dossier, budget 18 000 €, score, commentaire, boutons Mettre en examen, Pré-sélectionner, Accepter, Rejeter | OK |
| 5 | Cliquer « Pré-sélectionner », revenir aux colonnes | La carte est passée dans « Présélectionnée » | Non joué par la session (décision laissée à Monsieur DUCOUT) |
| 6 | Menu « Mes appels » | Trois appels, nombre de candidatures compté (2, 2, 0), bouton « Candidatures » qui ouvre la liste de l'appel | OK : liens `/aap/test-fin-1/candidatures` et `/aap/test-fin-2/candidatures` |
| 7 | Menu « Nouvel appel » | Formulaire en cinq étapes (présentation, critères et territoires, budget et date limite, contact, récapitulatif), enregistrement en brouillon puis publication | Non joué par la session (formulaire inchangé par ce changement) |
| 9 | Menu « Statistiques » | Totaux, vues, taux de conversion, candidatures par mois, taux d'acceptation et de refus | OK : 3 appels, 4 candidatures, 43 vues, acceptation 25 % |
| 10 | Retour à `/financeurs`, bouton « Créer mon compte financeur » | Inscription financeur | Lien présent |

Points connus, hors de ce changement : le paiement n'est pas branché (tarifs provisoires), le formulaire propose des
secteurs génériques (pas la liste santé), pas d'envoi de pièces jointes par le financeur.

Sur le vrai projet, les chiffres de `/financeurs` n'apparaissent qu'après le déploiement de la règle
`statistiquesPubliques` et un passage de `scripts/publier_chiffres.py` (fin de `veille.cmd`), tous deux sur accord de
Monsieur DUCOUT.
