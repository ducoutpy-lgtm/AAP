# alertes-courriel Specification

## Purpose

Que la veille prévienne par courriel : l'administrateur de ce qu'il a à contrôler, chaque candidat des appels qui le
concernent. Vérifiable par Monsieur DUCOUT en lisant les courriels reçus (ou écrits à blanc).

## Requirements

### Requirement: Boîte d'envoi

`scraping/courriel.py` SHALL envoyer par SMTP avec les variables de `scraping/.env` (hôte, port, utilisateur, mot de
passe d'application, expéditeur, adresse de l'administrateur). Sans configuration, ou avec `--dry-run`, le courriel
SHALL être écrit dans `scraping/logs/courriels/` (destinataire, objet, corps) au lieu d'être envoyé. Le mot de passe
SHALL n'apparaître dans aucun journal ni aucun compte rendu.

#### Scenario: Courriel de test

- WHEN Monsieur DUCOUT a renseigné `scraping/.env` et lance `python courriel.py --test`
- THEN il reçoit « AAP Santé : courriel de test » dans la boîte de `COURRIEL_ADMIN`.

### Requirement: Bilan hebdomadaire de l'administrateur

`alertes.py --admin` SHALL composer un courriel avec : sources relues et en erreur, liens vus, nouveaux et disparus
(d'après `VEILLE.md`), fiches nouvelles en base depuis sept jours et parmi elles les validées par le modèle, fiches à
contrôler, fiches publiées, et le lien `<url>/admin/aaps?validation=proposee`.

#### Scenario: Après la veille

- WHEN la veille du lundi se termine
- THEN Monsieur DUCOUT reçoit « AAP Santé : veille du <date>, N fiches à contrôler » et le lien ouvre la liste
  filtrée.

### Requirement: Appels de la semaine pour les candidats

`alertes.py --candidats` SHALL, pour chaque candidat au profil complet dont la préférence « courriel » n'est pas
désactivée, retenir les fiches visibles publiées depuis sept jours, de sa région ou nationales, ouvertes à sa famille
de structure (ou à toute structure), non closes, clôture la plus proche d'abord ; le courriel SHALL lister dix appels
au plus (titre, financeur, montant, clôture, lien), dire combien d'autres restent, et rappeler comment ne plus
recevoir ces courriels. Un candidat sans appel SHALL recevoir un courriel court qui le dit.

#### Scenario: Candidat associatif de Normandie

- WHEN un candidat dont le profil est une association de Normandie reçoit son courriel
- THEN il n'y voit que des appels de Normandie ou nationaux, ouverts aux structures privées non lucratives ou à
  toute structure, publiés dans la semaine.

### Requirement: Logique testée sans réseau

Lecture de `VEILLE.md`, sélection des fiches d'un candidat, composition des deux courriels et écriture à blanc SHALL
être des fonctions testées par pytest.
