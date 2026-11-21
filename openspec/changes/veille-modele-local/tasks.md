# Tâches

- [x] 1.1 Tests d'abord (`tests/test_veille_payante.py`, `tests/test_extraction_locale.py`) : étapes locales par
  défaut, fichier de la veille, report sur batterie, chemin API inchangé. Fait quand : ils échouent. (2026-11-21 :
  « 8 failed, 11 passed ».)
- [x] 1.2 `extraction_locale.py` (mode veille locale), `veille_payante.py` (moteur, batterie, éveil), `veille.cmd`
  (démarrage d'Ollama). Fait quand : tests Python verts. (2026-11-21 : « 234 passed ».)
- [x] 2.1 Essai à blanc sans Ollama : `python veille_payante.py` liste les étapes locales et ne lance rien. Fait quand :
  sortie collée dans ce fichier. (2026-11-21 :
  « --- extraction : essai à blanc, étape non lancée (extraction_locale.py --extraire --sans-pdf) »,
  « --- contrôle : essai à blanc, étape non lancée (verification.py --verifier --moteur ollama --fichier
  results/extraction_veille_locale.json) », même ligne pour la qualification ; contrôle à blanc sur le fichier encore
  absent : « 0 fiches à vérifier », code 0 ; alimentation lue : `ACLineStatus` 1, secteur.)
- [x] 2.2 Documentation (`scraping/README.md`, `CHANGELOG.md`, `REPRISE.md`).
- [ ] 3.1 Vérification de Monsieur DUCOUT : journal de la veille du lundi 23 novembre.
