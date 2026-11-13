# Tasks

Semaine 1 du plan de quatre semaines (« continue avec le plan », 2026-11-13) ; délégation permanente collée par
Monsieur DUCOUT le 2026-11-13. Coût : au plus 0,50 euro par semaine.

- [x] 1.1 Tests rouges : import `--a-valider` (fiche validée par le modèle en « proposée », rejetée et relue
  intactes) ; semaine du lundi au dimanche, dépense de la semaine, lecture des devis, décision dans la délégation. Fait
  quand : tests rouges collés. (Fait le 2026-11-13 : `scripts/tests` « 1 failed », `test_veille_payante.py` « 1 error »
  (module absent). Le test de la marge du devis (1.3) a été écrit en même temps que son code, sans passage rouge.)
- [x] 1.2 `scripts/import_to_firestore.py --a-valider`, `scraping/veille_payante.py`. Fait quand : suites vertes. (Fait le
  2026-11-13 : `scraping/tests` « 154 passed », `scripts/tests` « 43 passed ».)
- [x] 1.3 Marge du devis du contrôle et de la qualification : premier passage réel arrêté au plafond après 9 fiches sur 16
  (estimation 0,0003 euro par fiche, environ 0,0006 mesuré) ; devis retenu doublé. Fait quand : `test_veille_payante.py`
  « 5 passed ».
- [x] 2.1 Essai à blanc puis preuve réelle dans la délégation. Fait quand : journal collé. (Fait le 2026-11-13 : essai à
  blanc « devis 0.07 euro ; dans la délégation », plafond prévu 2.892 ; réel : « 1318 pages refusées, 1262 réussites (25
  nouvelles), 1 échecs ; coût cumulé 2.859 » ; contrôle 9 puis « 7 fiches vérifiées ; coût cumulé 2.868 » ;
  « 16 fiches qualifiées ; coût cumulé 2.873 » ; import « 22 crees, 429 mis a jour ». Base relue : les 22 fiches créées
  sont en brouillon, 16 « proposee » (file : 137) et 6 « a_corriger » (hors champ) ; publiées inchangées (378). Semaine :
  0,051 euro sur 0,50.)
- [x] 2.2 `veille.cmd` (étape payante puis courriels) et `veille_cachee.vbs`. Documentation : `scraping/CHANGELOG.md`,
  `scraping/README.md`, `docs/PILOTE_MVP.md`, `docs/A_VALIDER.md`, `REPRISE.md`.
- [ ] 3.1 Sur accord de Monsieur DUCOUT : action de la tâche « AAP Sante - veille hebdomadaire » remplacée par
  `wscript.exe "...\scraping\veille_cachee.vbs"` (veille sans fenêtre).
- [ ] 4.1 Vérification : le lundi 16 novembre, `scraping/logs/veille.log` va jusqu'à « Veille terminee » et Monsieur DUCOUT
  reçoit le bilan par courriel.
