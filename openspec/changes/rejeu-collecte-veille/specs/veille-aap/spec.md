# veille-aap Specification

## ADDED Requirements

### Requirement: Rejeu des pages validées

`rejeu.py --relire` SHALL rouvrir la page validée de chaque rubrique confirmée (adresse de `liens.json`), en lire les
liens avec la règle de la découverte, et pour chaque lien connu ou nouveau SHALL tenir `apparu_le` (première vue),
`vu_le` (dernière vue) et `absences` (rejeux consécutifs sans le voir) ; une page en erreur ou sans aucun lien SHALL
être journalisée sans toucher aux compteurs de ses liens.

#### Scenario: Lien nouveau

- **WHEN** la page relue contient un lien absent de `liens.json`
- **THEN** le lien est ajouté avec `apparu_le` et `vu_le` au jour du rejeu et `absences = 0`, et figure dans les
  « nouveaux » du journal

#### Scenario: Lien disparu

- **WHEN** un lien connu n'est plus sur la page relue
- **THEN** son compteur `absences` augmente de 1, `vu_le` ne change pas, et il figure dans les « disparus » du journal

#### Scenario: Page en erreur

- **WHEN** la page répond en erreur ou ne livre aucun lien
- **THEN** le journal note l'erreur et aucun compteur `absences` ne bouge

### Requirement: Collecte des textes nouveaux et marquage des fiches

`rejeu.py --collecter` SHALL lire le texte des liens nouveaux seulement (textes existants conservés) ; `--marquer` SHALL
reporter sur chaque fiche des fichiers de résultats `scrape_metadata.vue_rubrique_le` et `absences` du lien de même
adresse.

#### Scenario: Fiche encore présente

- **WHEN** le lien d'une fiche a été vu au rejeu du jour
- **THEN** la fiche porte `vue_rubrique_le` au jour du rejeu et `absences = 0`

### Requirement: Rapport de veille et péremption

`rejeu.py --rapport` SHALL écrire `scraping/VEILLE.md` (par rejeu : sources relues, en erreur, liens nouveaux et
disparus par source, fiches dont `absences` vaut 2 ou plus) ; `scripts/perimer_fiches.py` SHALL, après essai à blanc,
sauvegarde et accord, passer « a_corriger » les fiches publiées sans verdict humain dont `absences` vaut 2 ou plus, avec
le commentaire « absente de sa page source depuis N rejeux », sans toucher aux fiches validées par Monsieur DUCOUT.

#### Scenario: Rejeu sur vingt émetteurs

- **WHEN** le rejeu tourne sur vingt sources, dont une page ayant perdu un appel et une page ayant gagné un appel
- **THEN** le journal montre un disparu et un nouveau, le texte du nouveau est collecté une seule fois, aucune fiche
  existante n'est dupliquée, et une fiche validée par Monsieur DUCOUT reste intacte
