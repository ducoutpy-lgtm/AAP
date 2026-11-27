# Tâches

Décision 5b de Monsieur DUCOUT du 2026-11-27 (« Oui, le nouveau seulement »). Test en échec d'abord, puis le code.

## 1. Recopie

- [x] 1.1 Tests : liste présente sans lecture de la base, premier passage qui relit puis crée la liste, essai à blanc
  sans écriture, liste écrite seulement après l'écriture (échec avant).
- [x] 1.2 Code de `scripts/publier_couts.py` (liste locale, option `--relire-base`).

## 2. Clôture

- [ ] 2.1 Essai à blanc sur la vraie base (une lecture complète, la dernière) ; documentation (README scraping,
  CHANGELOG, `REPRISE.md`).

## Preuves (2026-11-27)

- Échec avant : 4 tests sur 4 (fonction absente). Après : 7 tests de `test_publier_couts.py`, ruff et mypy verts ; un faux
  Firestore compte les lectures : 0 avec la liste, 1 sans liste ou avec `--relire-base`, rien d'écrit à blanc.
- 2.1 reportée à la veille du 30/11 : le premier passage relit les 9 389 documents « collecte » une dernière fois ;
  le lancer aujourd'hui doublerait cette lecture (essai à blanc puis passage réel) pour un résultat attendu de 0 ligne
  à écrire. Documentation faite (README scraping, CHANGELOG).
