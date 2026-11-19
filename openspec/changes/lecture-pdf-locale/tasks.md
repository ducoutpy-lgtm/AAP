# Tâches

- [x] 1.1 Tests d'abord : questions partagées (`extractor`), moteur local du contrôle et de la qualification (appel à
  `echantillon.appeler_ollama` avec le schéma de l'outil). Fait quand : ils échouent. (2026-11-19 : « 2 failed ».)
- [x] 1.2 Code. Fait quand : pytest vert ; essai à blanc `--moteur ollama` annonce 0 euro. (2026-11-19 : pytest 174 verts ;
  « Modèle local qwen3:8b (Ollama) : zéro euro, sans plafond » pour le contrôle et la qualification.)
- [x] 2.1 Mesure local contre Haiku sur un échantillon de fiches déjà contrôlées et qualifiées par Haiku (copie de
  travail, rien d'écrit dans les vrais fichiers), quand la carte graphique est libre ; résultat dans
  `scraping/LOCAL_CONTRE_HAIKU.md`. (2026-11-19 : contrôle local, « est un appel » 13 / 13, aucun doute de Haiku manqué,
  5 doutes de plus ; qualification : type 14 / 14, champ 10 / 14, destinataires 4 / 14, objets 2 / 14 ; environ
  1 min 30 par fiche.)
- [x] 3.1 Collecte des PDF par la veille, chaîne locale de nuit, import et tri. (2026-11-19 : `rejeu.py --pdf` dans
  `veille.cmd` ; extraction du matin `--sans-pdf` (devis à blanc : 0 texte) ; `extraction_locale.py --seulement-pdf`
  (sortie `results/extraction_pdf_locale.json`, 0 PDF à lire aujourd'hui, ils seront collectés lundi matin) ;
  `chaine_pdf_locale.cmd` et `chaine_pdf_locale_cachee.vbs` ; tâche Windows « AAP Sante - lecture locale des PDF »
  créée sur son « Oui, lundi 23 h » : état Ready, prochain passage 23/11/2026 23:00, limite 12 h, pas sur batterie ;
  pytest 176 verts. Première vraie preuve : la nuit du 23 au 24 novembre.)
- [ ] 3.2 Documentation ; vérification de Monsieur DUCOUT.
