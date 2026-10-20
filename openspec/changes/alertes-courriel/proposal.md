# Proposal

## Why

Jour 3 du plan MVP (`docs/PLAN_MVP_2026-10-20.md`). Monsieur DUCOUT veut recevoir, après la veille du lundi, un
courriel qui lui dit ce qui est sorti et ce qu'il a à contrôler (« Attention, on a fait la veille cette semaine, il y
a quinze nouveaux appels, dix validés automatiquement, cinq à valider »). Les candidats doivent recevoir chaque
semaine les appels qui les concernent sans ouvrir l'application. Les fonctions serveur ne sont pas déployées : tout
se fait depuis le PC, dans la chaîne de la veille.

## What Changes

- **Boîte d'envoi** (`scraping/courriel.py`) : envoi SMTP (Zoho Mail d'ARCADIA, mot de passe d'application dans
  `scraping/.env`, jamais affiché) ; sans configuration ou en essai à blanc, le courriel est écrit dans
  `scraping/logs/courriels/` pour relecture. `--test` envoie un courriel de contrôle.
- **Alertes** (`scraping/alertes.py`) : `--admin` compose le bilan (chiffres de `VEILLE.md`, fiches nouvelles de la
  semaine, fiches à contrôler, lien direct vers la liste) ; `--candidats` compose, pour chaque candidat au profil
  complet qui accepte les courriels, la liste des appels publiés depuis sept jours de sa région (ou nationaux) ouverts
  à sa famille de structure (d'après la qualification du jour 2), dix au plus, avec les liens. Lecture seule sur la
  base.
- **Chaîne de la veille** : `veille.cmd` appelle `alertes.py --admin --candidats` après la relecture des pages.
- **Hors périmètre** : alertes sur les recherches sauvegardées (les filtres enregistrés par l'ancienne page ne sont
  pas ceux de la recherche actuelle ; à reprendre quand la recherche saura sauvegarder ses propres filtres), courriels
  en HTML, désinscription en un clic (la préférence « courriel » du compte existe déjà).

## Capabilities

### New Capabilities

- `alertes-courriel` : bilan hebdomadaire de l'administrateur, appels de la semaine pour les candidats.

## Impact

- Code : `scraping/courriel.py`, `scraping/alertes.py`, tests, `scraping/veille.cmd`, `scraping/.env.example`.
- Données : aucune écriture. Secrets : `SMTP_MOT_DE_PASSE` dans `scraping/.env` (ignoré par Git), saisi par Monsieur
  DUCOUT lui-même.
- Coût : zéro euro (envoi par la boîte Zoho existante).
