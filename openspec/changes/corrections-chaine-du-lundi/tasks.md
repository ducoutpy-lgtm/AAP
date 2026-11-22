# Tâches

Relecture de la chaîne du lundi (veille, import, tri, courriels) : 3 relecteurs, 1 vérificateur chargé de réfuter chaque
signalement ; 10 défauts confirmés, 2 écartés. Détail, scénarios et preuves : `signalements.json`. Proposition et spec
à écrire avant le code (méthode du projet). Chaque correction : test en échec d'abord.

- [x] 1.1 (haute) `scripts/trier_file.py:93` : le tri republiait une fiche « Proposée » archivée ou clôturée à la main.
  Fait : `selection` écarte les fiches archivées et clôturées (les brouillons et les publiées encore « Proposée »
  restent triées). Test en échec avant ; essai à blanc sur la vraie base le 2026-11-22 : « publier : 3 »,
  « laisser : 58 », « rejeter : 0 », rien d'écrit.
- [x] 1.2 (haute) `scripts/import_to_firestore.py:240` : avec `--a-valider`, les corrections de Monsieur DUCOUT sur une
  fiche validée en base étaient réécrites. Fait : `document_a_envoyer` protège les champs métier dès que la fiche est
  validée en base (par lui ou par le tri). Test en échec avant, 46 tests de l'import verts après. Effet : une fiche
  validée ne reçoit plus les champs d'une nouvelle extraction, même une date plus récente (règle déjà appliquée sans
  `--a-valider`).
- [x] 1.3 (haute) `scraping/alertes.py:332` : fenêtre de sept jours comptée depuis l'heure du passage. Fait : la fenêtre
  part du dernier envoi réussi aux candidats (`debut_fenetre`, date gardée dans `scraping/logs/alertes_dernier_envoi.txt`,
  ignoré par Git, écrite après chaque envoi réel) ; amorcée au 16/11/2026 10 h 32 UTC, dernier envoi lu dans
  `logs/veille.log`. 2 tests en échec avant.
- [x] 1.4 (moyenne) `scraping/alertes.py:340` : un échec du courriel de l'administrateur arrêtait l'envoi aux
  candidats. Fait : `envoyer_admin` note l'échec et passe aux candidats ; boîte configurée sans `COURRIEL_ADMIN` :
  rien n'est envoyé à une adresse fictive. 2 tests en échec avant, 18 tests des alertes verts après.
- [x] 1.5 (moyenne) Limites des tâches planifiées (veille 4 h, PDF 12 h). Décision de Monsieur DUCOUT du 2026-11-22
  (question à boutons) : « Ordre des étapes » ; chargeur d'origine lundi. Fait : courriels et chiffres avant le modèle
  local dans `veille.cmd` ; au plus 40 textes par veille (`TEXTES_PAR_VEILLE`) et 60 PDF par nuit (`PDF_PAR_NUIT`) ;
  `textes_veille_locale` et `textes_pdf_locaux` écartent les textes déjà faits avant la limite (sinon `echantillon.
  extraire` coupait la liste avant de les sauter et aurait repris les mêmes). 4 tests en échec avant, 238 tests Python
  verts après ; essai à blanc : « --limite 40 ». Réglage Windows non modifié.
- [ ] 1.6 (moyenne) `scraping/echantillon.py:529` : champ « incertain » après un échec jamais reposé.
- [x] 1.7 (moyenne) `scripts/doublons.py:112` et `:153`. Fait : même titre et même financeur, mais deux clôtures
  connues et différentes, ne font plus un doublon (deux éditions) ; le tri ne rejette une fiche que si elle ressemble
  directement à la fiche gardée, sinon elle reste à relire (« rapprochée … par une autre fiche »). 2 tests en échec
  avant (`scripts/tests/test_doublons.py`, `test_trier_file.py`), 52 verts après ; tri à blanc sur la vraie base
  inchangé (0, 3, 58).
- [x] 1.8 (moyenne) `scraping/alertes.py:262` : désabonnement annoncé par un réglage inexistant. Fait : « répondez à ce
  message en écrivant « Désabonnement » » ; case dans Mon profil proposée (question 42 de `docs/A_VALIDER.md`). Test en
  échec avant.
- [ ] 1.9 (basse) `scraping/veille_payante.py:132` : journal muet pendant les étapes locales.
- [ ] 2.1 Vérification de Monsieur DUCOUT.
