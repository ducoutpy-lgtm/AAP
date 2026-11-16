# Tâches

## 1. Filtrage commun (tests d'abord)

- [x] 1.1 Fichier de cas `app/src/utils/cas_filtres_recherche.json` ; test Vitest de `filtrerAppels` et test pytest de
  `alertes.correspond` sur ces cas. Fait quand : les deux échouent (fonctions absentes). (2026-11-16 : 17 cas Vitest en
  échec, 1 test pytest en échec.)
- [x] 1.2 `filtrerAppels` dans `recherche.ts`, `SearchAapPage.tsx` l'utilise ; copie Python dans `alertes.py`. Fait
  quand : les deux jeux passent, `npm run lint` et `npm run build` verts. (2026-11-16 : `npm test` 103 verts, pytest
  160 verts, lint et build verts.)

## 2. Enregistrer et relire

- [x] 2.1 Fonctions pures `rechercheAEnregistrer` et `depuisAncienneRecherche` (tests d'abord) ; bouton sur
  `/aap/search` ; page `/recherches-sauvegardees` réécrite (étiquettes, Lancer, Alerte chaque lundi, supprimer).
  (2026-11-16 : 6 tests en échec puis verts, `npm test` 108 verts, lint et types verts ; `sansValeursVides`, devenue
  inutile, retirée avec son test ; écran joué en 4.1.)

## 3. Courriel

- [x] 3.1 `alertes.py` : section par recherche active (tests d'abord : active, arrêtée, aucun appel). (2026-11-16 : 3 tests
  en échec puis verts, pytest 163 verts ; le sujet compte les appels distincts du profil et des recherches.)

## 4. Preuve

- [x] 4.1 Jouer sur les émulateurs : enregistrer, relancer (même nombre d'appels), arrêter l'alerte ; composer le
  courriel à blanc sur les données des émulateurs si `alertes.py` le permet, sinon le dire. (2026-11-16, compte
  `candidat@test.local` : filtres Médico-social et Île-de-France, « 1 appel à projets », « Recherche « Médico-social ·
  Île-de-France » enregistrée » ; « Lancer » rouvre `/aap/search?thematique=medico-social&territory=ile-de-france`,
  « 1 appel à projets » ; courriel à blanc : « Votre recherche « Médico-social · Île-de-France » : 1 nouvel appel » et le
  lien de la recherche ; « Alerte arrêtée » gardé au rechargement, document `alertEnabled` faux, `frequency` « weekly »,
  courriel recomposé sans section ; « Effacer tout » : bouton absent ; recherche d'avril écrite dans l'émulateur :
  « « aidants » », « Budget min. 1 000 € », « Critères non repris : energie, culture, Corse ». `alertes.py` vise le vrai
  projet par sa clé : le courriel a été composé par ses fonctions avec le projet `demo-aap` de l'émulateur, sans
  modifier l'outil.)
- [x] 4.2 Documentation (`app/CHANGELOG.md`, `CHANGELOG.md`, `scraping/README.md`, `REPRISE.md`).
- [ ] 4.3 Vérification de Monsieur DUCOUT.
