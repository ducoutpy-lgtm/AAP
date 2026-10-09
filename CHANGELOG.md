# Changelog

Toutes les modifications notables du dépôt AAP Santé sont documentées ici (format Keep a Changelog, en
français). Le journal propre au volet scraping reste dans `scraping/CHANGELOG.md`.

## [Non publié]

### Ajouté
- Registre des sources, seconde extension (changement OpenSpec `registre-des-sources-2`, 2026-10-09) : 847
  sources, 657 pages vérifiées ; caisses et services de l'État locaux, IHU, GIRCI, Europe régionale, fédérations,
  plateformes de dépôt, sur la liste de Monsieur DUCOUT.
- Registre des sources (changement OpenSpec `registre-des-sources`, 2026-10-09) : 334 émetteurs d'AAP
  inventoriés dans `scraping/sources/registre.json` (régions, départements et grandes villes via l'annuaire
  officiel de l'administration), 304 pages vérifiées, outil `scraping/registre.py`,
  vue `scraping/REGISTRE_SOURCES.md`. Aucune dépense.
- Pièces jointes des AAP scrapés (changement OpenSpec `pieces-jointes-aap`, 2026-10-09) : section
  « Pièces jointes » sur la fiche et compteur « N pièces jointes » sur les cartes de la recherche ;
  champ optionnel `scrapeMetadata` déclaré sur le type `AAP`. Les fichiers déjà téléchargés par le
  scraping (93 sur 109) sont servis depuis le PC en développement (`app/public/documents` ->
  `scraping/downloads`, lien de jonction ignoré par Git), car les ARS refusent l'accès direct
  (« Forbidden ») ; les autres gardent leur lien d'origine. Envoi vers Firebase Storage codé mais
  désactivé (`--vers-storage`, nécessite le forfait Blaze : compte de facturation fermé).
- Démo de bout en bout (changement OpenSpec `demo-aap-scrapes-visibles`, 2026-10-09) : 89 AAP scrapés
  importés dans Firestore et visibles dans l'application ; procédure de rejeu dans le README (section 4).
- `app/src/utils/deadline.ts` : helper partagé « jours restants » ; mention « Clôturé » dans la liste et la
  fiche d'un AAP dont la date de clôture est passée.
- `scripts/import_to_firestore.py` : fusion des doublons entre sources avant écriture ; dépendances fixées
  (`google-cloud-firestore`, `grpcio` 1.74.0).

### Corrigé
- `app/src/pages/porteur/SearchAapPage.tsx` : la recherche par mot ne filtrait jamais (condition sur le
  financeur toujours vraie, parenthèse manquante).

### Connu, non corrigé (hors périmètre de la démo)
- À l'inscription, un message d'erreur s'affiche après la création réussie du compte (étape d'envoi de
  l'e-mail de vérification) ; la page de connexion ne redirige pas quand l'utilisateur est déjà connecté.
- `npm run lint` ne peut pas tourner : aucune configuration ESLint dans `app/`.
