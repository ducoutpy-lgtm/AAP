# Proposal

## Why

Semaine 3 du plan de quatre semaines (« alertes »). Constat du 2026-11-16 dans le code :

- `app/src/pages/porteur/SavedSearchesPage.tsx` enregistre des critères hérités du gabarit d'avril (secteurs
  « énergie », « culture », « numérique » ; régions en toutes lettres ; paramètres `sectors` et `territories`) que la
  page de recherche ne lit pas : « Lancer » n'applique que les mots-clés et les montants.
- La page promet « des alertes » (choix temps réel, quotidien, hebdomadaire), mais `scraping/alertes.py` ne lit jamais
  la collection `savedSearches` : le courriel du lundi part d'après la région et la forme juridique du profil seulement.

Une promesse non tenue est une impasse du parcours candidat (critère de la semaine 3 : « sans page vide ni erreur »).

## What Changes

- Une recherche sauvegardée garde l'adresse de la page de recherche (`params`, mêmes clés que le lien partageable :
  `q`, `thematique`, `territory`, `statut`, `destinataire`, `typeAppel`, `financeur`, `budgetMin`, `budgetMax`).
  Pourquoi : un seul vocabulaire, « Lancer » rouvre exactement les mêmes résultats.
- `/aap/search` : bouton « Enregistrer cette recherche » pour un candidat connecté, dès qu'un filtre est choisi ; alerte
  active par défaut.
- `/recherches-sauvegardees` : liste des recherches avec leurs étiquettes, « Lancer », « Alerte chaque lundi »
  (marche / arrêt), suppression. L'ancienne fenêtre de création est retirée (on crée depuis la recherche). Une ancienne
  recherche est convertie à la lecture : mots-clés et montants repris, secteurs et régions d'avril signalés « non
  repris ».
- Fréquence : seulement hebdomadaire, car la veille tourne le lundi. Les choix « temps réel » et « quotidien » sont
  retirés de l'écran (ils n'étaient pas tenus).
- Filtrage des appels sorti de `SearchAapPage.tsx` dans une fonction pure `filtrerAppels` (`app/src/utils/recherche.ts`),
  même comportement ; reproduit en Python dans `scraping/alertes.py` pour le courriel. Pourquoi deux copies : le
  courriel part d'un script Python sur le PC, l'application est en TypeScript. Garde-fou : un fichier de cas commun
  (`app/src/utils/cas_filtres_recherche.json`) rejoué par Vitest et par pytest ; si les deux règles divergent, un des
  deux jeux de tests échoue.
- Courriel du lundi d'un candidat : une section par recherche dont l'alerte est active (« Votre recherche « X » : n
  nouveaux appels », cinq au plus, lien vers la recherche), en plus de la section d'après le profil.
- Coût : aucun appel payant. Règles Firestore de `savedSearches` inchangées (le propriétaire lit et écrit les siennes).

## Hors périmètre

- Lien de désabonnement en un clic (le courriel renvoie déjà au profil ; à traiter avec les droits RGPD, semaine 4).
- Envoi plus fréquent qu'hebdomadaire.

## Capabilities

### New Capabilities

- `alertes-recherches` : recherches sauvegardées fidèles à la page de recherche, alerte hebdomadaire par courriel.
