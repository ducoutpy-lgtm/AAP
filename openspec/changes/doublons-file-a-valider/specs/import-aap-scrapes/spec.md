# import-aap-scrapes Specification (delta)

## ADDED Requirements

### Requirement: Doublons dans la file à valider

`scripts/doublons.py --file` SHALL comparer les fiches publiées et les brouillons « proposee », SHALL apparier deux
fiches de même titre et même financeur, de même code de programme européen, ou de même date de clôture avec au moins
la moitié de leurs mots distinctifs en commun, et SHALL proposer pour chaque groupe la fiche à garder. Il SHALL n'écrire
que le rapport `docs/DOUBLONS.md`, jamais la base.

#### Scenario: Appel repris par plusieurs relais

- **WHEN** Monsieur DUCOUT lance `python scripts/doublons.py --file`
- **THEN** `docs/DOUBLONS.md` contient un groupe « Première Usine » avec les fiches de Bpifrance et de Lyonbiopôle
  (clôture le 6 avril 2027), et propose de garder celle de Bpifrance

#### Scenario: Appel européen relayé

- **WHEN** une fiche relayée porte « HORIZON-HLTH-2027-01-DISEASE-08 » dans son titre et le connecteur européen a lu cet
  appel
- **THEN** les deux sont dans le même groupe et la fiche du connecteur est proposée à garder

#### Scenario: Deux appels différents au titre proche

- **WHEN** deux fiches s'appellent « Appel à projets 2027 Émergence » mais ferment à des dates différentes
- **THEN** elles ne sont pas appariées

#### Scenario: Aucune écriture

- **WHEN** le rapport est produit
- **THEN** aucune fiche de la base n'a changé de statut ni de validation
