# Spec : mesure d'exactitude des fiches

## ADDED Requirements

### Requirement: Tirage rejouable

Le tirage MUST être déterminé par la graine, la période et le champ : deux tirages successifs MUST donner les mêmes
fiches dans le même ordre.

#### Scenario: même graine
- **WHEN** `python exactitude.py --tirer` est lancé deux fois
- **THEN** `results/exactitude_tirage.json` contient les mêmes 30 adresses, toutes produites entre le 2026-10-28 et le
  2026-11-11, toutes classées `sante` ou `medico-social`

### Requirement: Rapport contre le seuil

Le rapport MUST donner la part de champs justes (titre, financeur, date limite, montant) et le nombre de dates
inventées, et MUST conclure « seuil atteint » seulement si la part est d'au moins 90 % et qu'aucune date n'est inventée.

#### Scenario: calcul
- **WHEN** 30 fiches ont 4 verdicts chacune, dont 110 `juste` ou `vide-juste` et 1 date `invente`
- **THEN** le rapport écrit « 110 / 120 champs justes (91,7 %) », « dates inventées : 1 » et « seuil non atteint »
