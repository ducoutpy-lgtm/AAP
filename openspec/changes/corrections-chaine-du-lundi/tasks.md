# Tâches

Relecture de la chaîne du lundi (veille, import, tri, courriels) : 3 relecteurs, 1 vérificateur chargé de réfuter chaque
signalement ; 10 défauts confirmés, 2 écartés. Détail, scénarios et preuves : `signalements.json`. Proposition et spec
à écrire avant le code (méthode du projet). Chaque correction : test en échec d'abord.

- [ ] 1.1 (haute) `scripts/trier_file.py:93` : le tri republie une fiche « Proposée » archivée ou clôturée à la main ;
  ne traiter que `status == 'draft'`, comme `doublons.py --file`.
- [ ] 1.2 (haute) `scripts/import_to_firestore.py:240` : avec `--a-valider`, les corrections de Monsieur DUCOUT sur une
  fiche validée en base sont réécrites ; protéger les champs métier d'après le document existant.
- [ ] 1.3 (haute) `scraping/alertes.py:332` : fenêtre de sept jours comptée depuis l'heure du passage, d'où doublons ou
  oublis dans le courriel ; partir de la date du dernier envoi réussi.
- [ ] 1.4 (moyenne) `scraping/alertes.py:340` : un échec du courriel de l'administrateur arrête l'envoi aux candidats.
- [x] 1.5 (moyenne) Limites des tâches planifiées (veille 4 h, PDF 12 h). Décision de Monsieur DUCOUT du 2026-11-22
  (question à boutons) : « Ordre des étapes » ; chargeur d'origine lundi. Fait : courriels et chiffres avant le modèle
  local dans `veille.cmd` ; au plus 40 textes par veille (`TEXTES_PAR_VEILLE`) et 60 PDF par nuit (`PDF_PAR_NUIT`) ;
  `textes_veille_locale` et `textes_pdf_locaux` écartent les textes déjà faits avant la limite (sinon `echantillon.
  extraire` coupait la liste avant de les sauter et aurait repris les mêmes). 4 tests en échec avant, 238 tests Python
  verts après ; essai à blanc : « --limite 40 ». Réglage Windows non modifié.
- [ ] 1.6 (moyenne) `scraping/echantillon.py:529` : champ « incertain » après un échec jamais reposé.
- [ ] 1.7 (moyenne) `scripts/doublons.py:112` et `:153` : nouvelle édition rejetée au profit de l'ancienne ; groupes
  réunis par transitivité.
- [ ] 1.8 (moyenne) `scraping/alertes.py:262` : désabonnement annoncé par « Mon profil » sans réglage correspondant.
- [ ] 1.9 (basse) `scraping/veille_payante.py:132` : journal muet pendant les étapes locales.
- [ ] 2.1 Vérification de Monsieur DUCOUT.
