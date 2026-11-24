# Migrations déjà jouées

Scripts ponctuels exécutés une fois sur la base `aapi-11bc3`, rangés ici le 2026-11-24 (plan niveau A, tâche 2.6) pour
qu'aucun ne soit relancé par erreur : ils écrivent en base par défaut, et l'un d'eux supprime des documents.

| Script | Joué le | Effet |
|---|---|---|
| `migrer_identifiants.py` | 2026-10-14 | Identifiant d'un document = adresse de l'appel (341 documents) |
| `migrer_echeances.py` | 2026-10-14 | 141 échéances fictives passées à `null` (sauvegarde dans `scripts/sauvegardes/`) |
| `publier_sans_date.py` | 2026-10-14 | Publication des brouillons sans date ; contraire à la règle du 2026-10-20 (import en brouillon pour contrôle) |

Ils ne tournent plus tels quels depuis ce dossier (ils importent des modules de `scripts/`). Ne pas les relancer sans
décision de Monsieur DUCOUT ; l'historique Git garde leur version d'origine.
