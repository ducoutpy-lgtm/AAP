# Tasks

## 1. Type et fiche

- [x] 1.1 Ajouter le champ optionnel `scrapeMetadata` au type `AAP` (`app/src/types/index.ts`). Fait quand : `npm run build` passe.
- [x] 1.2 Section « Pièces jointes » dans `AapDetailPage.tsx` (gabarit de « Documents requis », un lien par fichier, nouvel onglet, masquée si vide). Fait quand : la fiche « Contrat d'Allocation d'Études » liste 5 fichiers .docx et un AAP sans document n'affiche pas la section.

## 1bis. Fichiers servis depuis le PC (révisé le 2026-10-09 : Storage exige un compte de facturation, refusé par Monsieur DUCOUT ; démo locale choisie)

- [x] 1.5 Relier `app/public/documents` au dossier `scraping/downloads` (lien de jonction Windows, ignoré par Git) ; le script d'import enregistre `fichierLocal` (chemin relatif) pour chaque document présent sur le disque. Fait quand : l'import rejoué affiche « N documents disponibles en local » et `http://localhost:3000/documents/ars_idf/media_158752.docx` répond.
- [x] 1.6 Fiche : ordre des liens = copie Storage si `storagePath`, sinon fichier local si `fichierLocal` et application lancée sur le PC, sinon URL d'origine. Fait quand : un document ARS s'ouvre sans « Forbidden » depuis le compte de démo.

## 1ter. Hébergement Storage (code conservé, inactif : option `--vers-storage`, nécessite le forfait Blaze)

- [x] 1.3 (code écrit, non exécuté : facturation fermée) `scripts/import_to_firestore.py` : envoi des fichiers locaux (`local_path`) vers Storage `uploads/aap-documents/<id>/<nom>`, ignoré si déjà présent, chemin écrit dans `fichiersJoints[].storagePath` ; dépendance `google-cloud-storage`. Fait quand : l'import réel rejoué affiche « N fichiers envoyés », puis « 0 envoyé » au second passage, et la console Storage montre les fichiers.
- [x] 1.4 (code écrit, inactif tant qu'aucun `storagePath` n'est en base) Fiche : lien résolu par `getDownloadURL` quand `storagePath` existe, sinon URL d'origine. Fait quand : un document ARS s'ouvre sans « Forbidden » depuis le compte de démo.

## 2. Liste

- [x] 2.1 Mention « N pièce(s) jointe(s) » sur la carte de `SearchAapPage.tsx`, seulement si N > 0. Fait quand : la carte de l'AAP ci-dessus affiche « 5 pièces jointes » et une carte sans document n'affiche rien.

## 3. Documentation et vérification finale

- [x] 3.1 CHANGELOG racine (section Ajouté) et ligne dans le README section 4 (« chaque fiche liste ses pièces jointes »). Fait quand : les deux fichiers sont relus.
- [x] 3.2 Vérification manuelle par Monsieur DUCOUT : rejouer les 3 scénarios de la spec et noter OK ou ÉCHEC. Fait quand : tous OK, ou écarts listés.

## Workflow follow-up

- Archiver le changement après la vérification 3.2.
