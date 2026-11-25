## ADDED Requirements

### Requirement: Une fiche hors de la recherche est fermée par son adresse directe

La fiche d'un appel SHALL n'être affichée à un candidat que si l'appel est publié ou clôturé et visible du public
(fiche validée, ou saisie à la main sans bloc de validation). L'administrateur et le financeur auteur SHALL la lire
quel que soit son statut, pour l'aperçu. Le formulaire de candidature SHALL suivre la même règle, et une candidature
SHALL n'être possible que sur un appel publié, visible et non clos.

#### Scenario: Fiche proposée ouverte par un candidat

- **WHEN** un candidat ouvre l'adresse d'une fiche publiée mais encore « proposée »
- **THEN** la page affiche « AAP non trouvé », sans le contenu de la fiche ni bouton de candidature

#### Scenario: Aperçu par l'auteur

- **WHEN** le financeur auteur ouvre l'adresse de son appel proposé
- **THEN** la fiche s'affiche

### Requirement: La clôture se compte en jours du calendrier

Le nombre de jours avant la clôture SHALL être la différence entre le jour de clôture enregistré (minuit UTC, un jour du
calendrier) et la date du jour du visiteur. Un appel SHALL rester ouvert tout son dernier jour, en métropole comme
outre-mer. L'import et le courriel du lundi SHALL appliquer la même règle (décision 38 de Monsieur DUCOUT, 2026-11-24).

#### Scenario: Dernier jour en Martinique

- **WHEN** un candidat de Martinique ouvre, le 1er décembre à 20 h, un appel qui clôt le 1er décembre
- **THEN** la fiche compte 0 jour et n'affiche pas « Clôturé »

#### Scenario: Lendemain de la clôture

- **WHEN** il ouvre la même fiche le 2 décembre à 0 h 30
- **THEN** la fiche affiche « Clôturé »

## RENAMED Requirements

- FROM: `### Requirement: Consultation d'une fiche sans compte`
- TO: `### Requirement: Consultation d'une fiche par un compte connecté`

## MODIFIED Requirements

### Requirement: Les AAP scrapés apparaissent dans la recherche

La page « Rechercher des AAP » SHALL lister, pour un compte connecté, les AAP publiés et visibles du public (fiche
validée, ou saisie à la main sans bloc de validation), scrapés ou saisis, avec titre et nom du financeur. Depuis le
2026-10-20 (décision de Monsieur DUCOUT), un visiteur sans compte SHALL être mené à la page de connexion au lieu de la
liste.

#### Scenario: Liste après import

- **WHEN** Monsieur DUCOUT, connecté, ouvre http://localhost:3000/aap/search après un import
- **THEN** la liste affiche des AAP publiés et validés, dont le financeur est par exemple « ARS Île-de-France », « Fondation de France », « CNSA » ou « ARS Normandie »

#### Scenario: Recherche ouverte sans compte

- **WHEN** Monsieur DUCOUT, non connecté, ouvre http://localhost:3000/aap/search
- **THEN** la page de connexion s'affiche, sans la liste des AAP

#### Scenario: Recherche par mot

- **WHEN** il tape « Dentobus » dans le champ de recherche
- **THEN** seuls les AAP dont le titre, la description ou le financeur contient « Dentobus » restent affichés

### Requirement: Consultation d'une fiche par un compte connecté

Depuis le 2026-10-20 (décision de Monsieur DUCOUT), la recherche et la fiche d'un AAP publié SHALL demander un compte
connecté. Un visiteur sans compte qui ouvre l'adresse d'une fiche ou d'une recherche SHALL être mené à la page de
connexion, puis ramené sur la page demandée, filtres compris. Les actions « Candidater » et « favori » SHALL être
réservées aux comptes connectés ; le favori SHALL être enregistré pour le compte et signalé par un cœur plein.

#### Scenario: Fiche ouverte sans compte

- **WHEN** Monsieur DUCOUT, non connecté, ouvre l'adresse d'une fiche
- **THEN** la page de connexion s'affiche, et après connexion il revient sur la même fiche

#### Scenario: Candidater sans compte

- **WHEN** il ouvre sans être connecté l'adresse du formulaire de candidature d'un appel publié, visible et ouvert
  (`/aap/<identifiant>/candidater`, lien gardé ou partagé)
- **THEN** la page de connexion s'affiche, et après connexion avec un compte candidat il revient sur ce formulaire

#### Scenario: Recherche partagée ouverte sans compte

- **WHEN** Monsieur DUCOUT, non connecté, ouvre le lien d'une recherche avec des filtres (par exemple
  `/aap/search?territory=normandie`)
- **THEN** la page de connexion s'affiche, et après connexion il revient sur la même recherche, filtres compris

#### Scenario: Favori

- **WHEN** un candidat connecté clique sur le cœur « Ajouter aux favoris » d'une fiche
- **THEN** le bouton devient « Retirer des favoris » et l'appel est enregistré dans ses favoris

## REMOVED Requirements

### Requirement: Accès à la recherche depuis la page d'accueil

**Reason**: depuis le 2026-10-20, la recherche demande un compte (décision de Monsieur DUCOUT) ; le lien « Voir les
appels à projets » a été retiré de l'accueil et de l'en-tête public.

**Migration**: l'accueil mène à l'inscription ou à la connexion ; après connexion, le menu « Rechercher » ouvre la
recherche.
