# Proposal

## Why

Jour 6 du plan MVP (`docs/PLAN_MVP_2026-10-20.md`) : « Financeur vendable ». Le financeur est celui à qui l'on vend ;
or l'inventaire du 2026-10-21 montre un espace financeur qui ne tient pas une démonstration : tableau de bord aux
chiffres figés à zéro et listes vides, lien « Voir toutes » vers une route inexistante, bouton « Candidatures » de
« Mes appels » cassé, candidatures en simple liste, tarifs écrits deux fois (accueil et configuration), promesses
d'une « préqualification automatique » et d'un « scoring » qui n'existent pas, aucune page publique qui s'adresse aux
financeurs, et aucun appel ni candidature semés pour le compte financeur de test. Décision de Monsieur DUCOUT :
« 2 oui ».

## What Changes

- **Page publique `/financeurs`** : à qui elle sert (ARS, caisses, fondations, collectivités), trois bénéfices tenus
  (publication en cinq étapes, candidatures reçues et suivies, audience d'établissements qualifiés), chiffres réels
  lus dans un document public `statistiquesPubliques/accueil` (établissements inscrits, appels suivis, financeurs
  distincts, date de mise à jour) écrit par `scripts/publier_chiffres.py` à la fin de la veille. Pourquoi un document
  écrit par script : les règles Firestore interdisent la lecture publique des comptes, et il n'y a pas de fonction
  serveur déployée. Tarif financeur affiché depuis `config/stripe.ts`, seule source des montants (l'accueil cesse de
  les recopier) ; mention « tarif provisoire, paiement non ouvert ».
- **Accueil** : les promesses non tenues (préqualification automatique, scoring, analytics) sont remplacées par ce
  que l'application fait ; carte « Je finance des projets » renvoyant vers `/financeurs`.
- **Tableau de bord financeur réel** : ses appels (brouillons, publiés, clos), candidatures reçues par statut, vues
  cumulées, dernières candidatures, prochaine échéance ; liens corrigés (`/candidatures-recues`,
  `/aap/:id/candidatures`).
- **Candidatures reçues en colonnes** : nouvelle page `/candidatures-recues` (toutes ses candidatures, une colonne par
  statut : reçue, en examen, présélectionnée, acceptée, refusée), entrée de menu « Candidatures reçues ». Le type
  `ApplicationStatus` gagne `shortlisted`, déjà utilisé par les pages.
- **Compteur de candidatures** : `applicationsCount` incrémenté à l'envoi d'une candidature.
- **Semis des émulateurs** : trois appels du compte financeur de test, quatre candidatures du compte candidat aux
  statuts variés, pour que la démonstration de dix minutes se joue.
- Hors périmètre : paiement Stripe, envoi de pièces jointes par le financeur, refonte du formulaire en cinq étapes
  (secteurs santé à faire dans un changement dédié), messagerie.

## Capabilities

### New Capabilities

- `financeur-vendable` : page publique Financeurs avec chiffres réels, espace financeur utilisable en démonstration.

## Impact

- Code : `app/src/pages/public/FinanceursPage.tsx`, `FinanceurDashboard.tsx`, nouvelle `CandidaturesRecuesPage.tsx`,
  `LandingPage.tsx`, `menus.ts`, `App.tsx`, `types/index.ts`, `applicationService` (ou page de candidature),
  `utils/financeur.ts` testé ; `scripts/publier_chiffres.py` ; `scripts/semer_emulateurs.py` ; règle Firestore
  `statistiquesPubliques` (lecture publique, écriture interdite) à déployer par Monsieur DUCOUT.
- Coût : zéro euro.
