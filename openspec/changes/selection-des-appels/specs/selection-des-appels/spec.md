## ADDED Requirements

### Requirement: Une page bloquée n'est ni collectée ni extraite

La collecte SHALL reconnaître une page anti-robot (« vérifie que vous n'êtes pas un bot », « Vérification de sécurité en
cours ») ou une page « accès refusé » (« Vous n'êtes pas autorisé(e) à accéder à cette page », « Vous n'avez pas accès à
cette page »), la relire après une attente, et n'enregistrer aucun texte si elle reste bloquée. L'extraction SHALL mettre
de côté un texte bloqué déjà enregistré (dossier `_bloquees/` de la source) sans appeler le modèle, pour que la collecte
suivante le relise.

#### Scenario: Écran anti-robot qui se lève

- **WHEN** la page affiche l'écran anti-robot puis, après l'attente, le texte de l'appel
- **THEN** le texte de l'appel est enregistré

#### Scenario: Écran anti-robot persistant

- **WHEN** la page affiche encore l'écran anti-robot après l'attente
- **THEN** aucun texte n'est enregistré et la page est signalée « bloquée »

#### Scenario: Texte bloqué déjà collecté

- **WHEN** l'extraction lit le texte du Pacte Enseignement Supérieur du Grand Est, qui contient l'écran anti-robot
- **THEN** le texte est déplacé dans `_bloquees/`, le modèle n'est pas appelé et aucun refus n'est écrit

### Requirement: Un marché public n'est pas un appel à projets

L'extraction SHALL refuser sans appeler le modèle une page dont l'adresse est une plateforme d'achat public
(`marchespublics.`, `marches-publics.`, `achatpublic.`, `boamp.fr`, `marches-securises.fr`, `e-marchespublics.`,
`maximilien.fr`) ou dont le texte porte au moins deux marques d'une consultation (« remise des plis », « règlement de
consultation », « dossier de consultation des entreprises », « pouvoir adjudicateur », « télécharger le RC », « accéder
à la consultation », « MAPA »). L'import SHALL ignorer une fiche dont l'adresse est une plateforme d'achat public.

#### Scenario: AMI du 24 avenue du Prado

- **WHEN** l'extraction lit la page `marchespublics.ampmetropole.fr` de la consultation 2026K19
- **THEN** la page est refusée avec la raison « marché public » sans appel au modèle, et l'import ne l'écrit pas

#### Scenario: Appel à projets qui cite un règlement

- **WHEN** un appel de l'ARS cite une seule fois « règlement de consultation »
- **THEN** la page n'est pas refusée par ce filtre

### Requirement: Un appel hors champ est écarté d'office

L'import SHALL rejeter et archiver un appel classé hors champ par le modèle (question du champ ou qualification) quand
Monsieur DUCOUT n'a pas rendu de verdict, avec le commentaire « hors champ (modèle), écartée d'office ». L'appel SHALL ne
plus figurer dans la file « à valider » ni « à corriger ». Une fiche dont la description décrit une page bloquée SHALL ne
pas être importée.

#### Scenario: Défense des forêts contre l'incendie

- **WHEN** l'import lit une fiche FEADER DFCI classée « hors-champ » par le modèle, sans verdict humain
- **THEN** le document porte `validation.statut` « rejetee », `status` « archived » et l'étiquette « hors-champ »

#### Scenario: Verdict humain

- **WHEN** Monsieur DUCOUT a validé une fiche que le modèle classe hors champ
- **THEN** l'import garde son verdict

### Requirement: Un relais n'est jamais affiché comme financeur

Pour une fiche dont le financeur lu est le relais du registre (premier mot du nom égal au premier mot de son
identifiant), l'import SHALL afficher le financeur réel : celui cité entre parenthèses et connu du référentiel, ou
nommé après « financé par », sinon le programme « France 2030 » cité par la fiche. À défaut, pour un relais qui n'est
pas un établissement (pôle de compétitivité, gérontopôle, agrégateur), le financeur affiché SHALL être « Financeur à
préciser (relayé par <relais>) », sans changer le statut de la fiche. Un cancéropôle garde son nom pour ses propres
appels ; un financeur lu qui n'est pas le relais (« Région Bretagne ») SHALL être gardé.

#### Scenario: Première Usine relayée par Medicen

- **WHEN** l'import lit « Medicen Paris Region – appels à projets (dans le cadre du plan France 2030) »
- **THEN** le financeur affiché est « France 2030 (État) »

#### Scenario: Relais sans financeur cité

- **WHEN** l'import lit une fiche de Biotech Santé Bretagne dont le financeur lu est « Biotech Santé Bretagne – appels
  à projets »
- **THEN** le financeur affiché est « Financeur à préciser (relayé par Biotech Santé Bretagne) » et le statut de la
  fiche ne change pas

#### Scenario: Financeur cité par un relais

- **WHEN** l'import lit « Région Bretagne (France 2030 régionalisé) » sur le relais Atlanpole, ou « Lyonbiopôle (...,
  financé par la Région Auvergne-Rhône-Alpes) »
- **THEN** le financeur affiché est la Région, jamais « France 2030 (État) » ni « Financeur à préciser »

#### Scenario: Appel propre d'un cancéropôle

- **WHEN** l'import lit une fiche du Cancéropôle CLARA dont le financeur lu est le Cancéropôle
- **THEN** le financeur affiché reste le Cancéropôle

### Requirement: Les corrections de la relecture survivent au ré-import

L'import SHALL appliquer à chaque passage les corrections de `scraping/sources/corrections_fiches.json` (champ,
financeur), par identifiant de document, avant les règles du champ.

#### Scenario: Fiche gardée par la relecture

- **WHEN** la relecture a gardé dans le champ « santé » une fiche que le modèle classe hors champ, puis l'import repasse
- **THEN** le champ reste « sante » et la fiche n'est pas écartée

### Requirement: Valider une fiche hors champ demande confirmation

Dans `/admin/aaps`, valider une fiche classée hors champ (étiquette ou champ « hors-champ »), seule ou dans une
sélection, SHALL afficher une confirmation qui le dit ; « Annuler » n'écrit rien.

#### Scenario: Validation groupée avec une fiche hors champ

- **WHEN** Monsieur DUCOUT valide une sélection qui contient une fiche hors champ
- **THEN** la confirmation indique le nombre de fiches hors champ de la sélection
