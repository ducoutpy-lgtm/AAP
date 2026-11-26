# Lecture des appels, comptes suspendus, mises à niveau, vues et messagerie

## Pourquoi

La relecture indépendante du plan niveau A (2026-11-25) a laissé cinq sujets à la décision de Monsieur DUCOUT
(questions 49 à 53 de `docs/A_VALIDER.md`). Ses réponses du 2026-11-26 (séance de pilotage, choix à cocher) :

- **49 « maintenant »** : tout compte en période d'essai lit par le kit Firebase les appels non publiés (brouillons,
  rejetés), et un visiteur un appel publié encore « Proposée ». L'écran ne les montre pas, mais les données sortent.
- **51 « registre des suspensions »** (choix du 2026-11-26, la fonction serveur demandant une facturation Firebase
  qui n'est pas ouverte) : un compte suspendu supprime son document `users` puis le recrée en essai.
- **53 oui** : `firebase` 10 et `react-router-dom` 6 portent 13 failles de production, dont 5 élevées.
- **52 oui** : le compteur de vues monte à chaque ouverture d'une fiche ; une vue par compte et par appel.
- **50 « construire »** : la page Messages lit une collection `conversations` que rien n'écrit et qu'aucune règle
  ne couvre ; elle n'affiche jamais rien.

## Ce qui change

1. **Lecture des appels** : un appel non publié, ou publié mais non visible (« Proposée », « à corriger »), n'est
   lisible que par l'administrateur et le financeur auteur. Les requêtes de liste (recherche, calendrier, tableaux de
   bord, recommandations) sont revues pour rester compatibles avec la règle. Si des fiches publiées sans bloc de
   validation existent, une migration leur ajoute ce bloc, à blanc d'abord ; l'écriture réelle attend l'accord de
   Monsieur DUCOUT.
2. **Registre des suspensions** : suspendre un compte écrit `suspensions/{uid}` (identifiant et adresse), que seul
   l'administrateur écrit ou efface ; la création d'un document `users` est refusée à un compte suspendu, par son
   identifiant ou son adresse de connexion. Rétablir un compte efface la fiche de suspension.
3. **Mises à niveau** : `firebase` 12, `react-router-dom` 7 ; tous les tests et les parcours des trois rôles rejoués
   sur les émulateurs.
4. **Vues** : la première ouverture d'une fiche par un compte ajoute une vue ; les suivantes n'en ajoutent pas.
5. **Messagerie** : un candidat et le financeur d'une de ses candidatures échangent des messages dans une
   conversation propre à cette candidature, lisible par ses deux seuls participants.

## Hors périmètre

Fonctions serveur (facturation non ouverte), paiement, notifications automatiques, pièces jointes dans la messagerie.

## Coût estimé

Zéro euro de traitement : aucun appel à un modèle payant. Mise en ligne des règles et de l'hébergement après l'accord
de Monsieur DUCOUT, gratuite (forfait actuel).

## Risques

- Règle de lecture resserrée : une requête de liste qui ne correspond plus à la règle échoue en entier (Firestore ne
  filtre pas). Chaque page de liste est rejouée sur les émulateurs.
- Mises à niveau majeures : changements d'API possibles ; aucun lot n'est commité sans tests et parcours verts.
