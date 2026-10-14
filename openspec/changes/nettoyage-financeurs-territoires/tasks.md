# Tasks

Constat de Monsieur DUCOUT du 2026-10-14 au soir (base « sale » : financeurs en doublon, régions incohérentes).
Règle « Preuve avant affirmation ». Aucun appel API. Type `AAP` : champs optionnels ajoutés dans `scrapeMetadata`
seulement (exigence explicite). Décisions humaines (`status`, `validation`) jamais réécrites.

## 1. Tables et outil

- [ ] 1.1 `scraping/financeurs.py --construire` : table `sources/financeurs.json` depuis le registre (nom canonique
  par émetteur, alias générés : « ARS X », « Agence régionale de santé X », avec et sans accents) ; rapport des noms de
  financeurs extraits non rattachés, à compléter à la main. Fait quand : table écrite, rapport collé, pytest vert.
- [ ] 1.2 `sources/departements.json` : 101 départements -> région (identifiants de `REGIONS`) ; fonction pure
  `territoire_depuis(texte, emetteur)` testée (région, département, ARS, conseil départemental, ville, national,
  inconnu -> `non-precise`). Fait quand : pytest vert.

## 2. Import

- [ ] 2.1 `scripts/import_to_firestore.py` : `scrapeMetadata.source` = émetteur du registre, `sourceNom`, `fichier` ;
  `financeurName` canonique et `financeurExtrait` ; territoire déduit ; `france` seulement si national. Tests sur le
  faux Firestore. Fait quand : pytest scripts vert ; essai à blanc collé avec le nombre de financeurs canoniques et la
  répartition des territoires.
- [ ] 2.2 Ré-import réel après accord de Monsieur DUCOUT. Fait quand : dans la base, nombre de financeurs distincts
  et part de `non-precise` collés, avant et après.

## 3. Application

- [ ] 3.1 `SearchAapPage.tsx` : filtre Source (nom de l'émetteur) ajouté, Financeur sur le nom canonique, libellé
  « Territoire non précisé » ; `types/index.ts` : `sourceNom`, `financeurExtrait`. Fait quand : lint et build verts,
  filtre « ARS Île-de-France » vérifié dans le navigateur avec un seul choix dans la liste.

## 4. Doublons et documentation

- [ ] 4.1 `scraping/financeurs.py --doublons` : groupes de fiches publiées de même titre normalisé et même financeur,
  avec adresses. Fait quand : rapport collé.
- [ ] 4.2 README racine, README de l'application, CHANGELOGs, CLAUDE.md, REPRISE.md, `docs/FLUX_DONNEES.md`, rapport
  de critique (section 8). Fait quand : fichiers relus.

## 5. Vérification

- [ ] 5.1 Monsieur DUCOUT filtre par financeur, par source et par territoire, et constate l'absence de doublons dans
  la liste des financeurs.
