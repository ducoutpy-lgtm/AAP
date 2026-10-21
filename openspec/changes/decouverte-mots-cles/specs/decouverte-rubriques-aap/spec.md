# decouverte-rubriques-aap Specification (delta)

## ADDED Requirements

### Requirement: Mots-clés anglais et adresses parlantes

La notation d'un lien SHALL donner au moins 3 points à un libellé anglais d'appel (« call for proposals », « calls for
proposals »), à un code de programme européen de santé (« HORIZON-HLTH », « EU4H ») et à une adresse dont un segment
est `appel`, `appels`, `call` ou `calls`, même si le texte du lien est générique (« Lire la suite »).

#### Scenario: Lien anglais

- **WHEN** un lien s'intitule « Call for proposals: EU4Health 2026 » vers `/calls-proposals/eu4h-2026`
- **THEN** sa note est au moins 3 et il compte comme un lien d'appel

#### Scenario: Lien « Lire la suite » vers /appel/

- **WHEN** un lien s'intitule « Lire la suite » vers `https://www.appelsprojetsrecherche.fr/appel/1-anr-2002`
- **THEN** sa note est au moins 3

#### Scenario: Redécouverte de HaDEA

- **WHEN** Monsieur DUCOUT lance `python scraping/decouverte.py --ids hadea-eu4health --forcer --garder-depart`
- **THEN** le terminal affiche « rubrique trouvée » avec un nombre de liens d'appel supérieur à 0
