# Tasks

Règle « Preuve avant affirmation » (CLAUDE.md) : chaque tâche n'est cochée qu'avec la preuve
indiquée, collée dans le compte rendu de session.

## 1. Mise sous spécification de l'outil existant

- [x] 1.1 Tests `tests/test_validation.py` sur les fonctions pures : `echantillonner` (N liens, un par
  source à tour de rôle, même liste à deux appels), `liens_des_rubriques_confirmees` écarte les liens
  cassés, `pages_gardees` renvoie une fiche par rubrique confirmée avec l'adresse de la découverte.
  Fait quand : pytest vert, sortie collée. (Fait le 2026-10-13 : `pytest tests/test_validation.py -q` : 4 passed in 0.16s.)
- [x] 1.2 Rejeu par la session des huit scénarios de la spec dans le navigateur intégré, avec pour
  chacun une preuve (texte lu dans la page ou contenu du fichier de verdicts). Fait quand : tableau
  scénario / OK ou ÉCHEC / preuve dans le compte rendu ; tout ÉCHEC corrigé avant de passer à 1.3. (Fait le 2026-10-13, navigateur intégré, serveurs d'essai sur 8788 et 8789, fichier d'essai supprimé ensuite :
  Première page présentée OK « Fiche 1 sur 155 », Fondation de France, quatre boutons ; Mauvaise page avec adresse OK, `validation_pages.json` : verdict `mauvaise-page`, commentaire = adresse saisie, puis « Fiche 2 » ;
  Six verdicts proposés OK, boutons 1 à 6 lus dans la page ; Lien cassé écarté OK, 2 116 liens, 0 cassé, « DSR_FORM » absent ; Échantillon réparti OK, 60 fiches de 60 sources ;
  Fenêtre séparée PARTIEL : le navigateur intégré bloque toute fenêtre ouverte par la session, mais a consigné la tentative d'ouverture de la page suivante (ARS Île-de-France) après le verdict, à confirmer par Monsieur DUCOUT dans Chrome ;
  Site qui refuse le cadre OK, option décochée : colonne gauche affichée, cadre pointant sur la page, texte lu par le serveur présent ; Commentaire par Entrée OK, fiche inchangée, commentaire dans le fichier ; Reprise OK, après redémarrage « Fiche 3 sur 155 ; 2 verdict(s) enregistré(s) ».)
- [x] 1.3 Documentation : section « Validation manuelle » du README scraping (trois modes, raccourcis,
  fichiers de verdicts), CHANGELOG scraping et racine, CLAUDE.md (tableau d'avancement), REPRISE.md,
  feuille de route. Fait quand : les fichiers citent les mêmes noms de fichiers et de boutons que
  l'outil. (Fait le 2026-10-13 : README scraping section « Validation manuelle », CHANGELOGs, CLAUDE.md, REPRISE.md, feuille de route.)
- [x] 1.4 Relecture des sources exclues (demande de Monsieur DUCOUT après le cas Bpifrance) : `--verdicts` en mode
  pages, verdict actuel et motif affichés, sources sans page ignorées avec leur nombre, bouton 5 « des appels, mais
  jamais santé ni médico-social », lanceur `validation_exclues.cmd` et raccourci. Fait quand : test unitaire vert,
  scénarios « Sources exclues présentées avec leur motif » et « Bpifrance » rejoués avec preuve, README à jour.
  (Fait le 2026-10-13 : pytest 5 passed ; serveur d'essai sur 8790 : « 577 sources sans page gardée, non présentées »,
  « Fiche 1 sur 115 », Bpifrance en première fiche avec « Verdict actuel hors-sante » et « Motif industrie, clusters
  Eureka, espace de données », cinq boutons dont le 5 lus dans la page. Le clic du bouton 1 sur Bpifrance est laissé à
  Monsieur DUCOUT : c'est son verdict, le mécanisme d'écriture est celui prouvé en 1.2.)

## 2. Vérification par Monsieur DUCOUT

- [ ] 2.1 Monsieur DUCOUT rejoue les scénarios « Première page présentée », « Mauvaise page avec la
  bonne adresse », « Commentaire par Entrée » et « Reprise » depuis les raccourcis du bureau.
  Fait quand : il dit OK pour chacun, ou décrit l'écart.
