# Flux des données AAP Santé : d'un site d'émetteur à l'écran de l'application

Écrit le 2026-10-14 à la demande de Monsieur DUCOUT, pour lire d'un coup d'œil où entrent les données,
où un humain tranche, et ce qui est automatique. À tenir à jour avec `FEUILLE_DE_ROUTE.md`.

## Le schéma

```mermaid
flowchart TB
    subgraph E1[1. Sources : qui publie des appels]
        A1[Annuaires de référence<br/>RNF, ARS, départements, FSE...] -->|recherche web, sonde HTTP| R[(registre.json<br/>1 198 émetteurs)]
    end
    subgraph E2[2. Pages : où ils publient]
        R -->|robot de découverte<br/>decouverte.py| P[Page candidate par émetteur<br/>et liens repérés]
        P -->|tri par le modèle local<br/>qualification.py| Q[Verdict machine]
        Q -->|HUMAIN : Monsieur DUCOUT<br/>raccourci Validation des pages| V1[242 pages validées<br/>2 395 liens]
    end
    subgraph E3[3. Fiches : ce que dit chaque appel]
        V1 -->|collecte du texte<br/>extraction_locale.py --collecter| T[2 178 textes de pages]
        T -->|modèle local qwen3:8b<br/>extraction_locale.py --extraire| F[Fiches au format AapNormalized<br/>marque a_verifier]
        T -.->|refusé : pas un appel| X[Pages écartées]
    end
    subgraph E4[4. Base et application]
        F -->|import par lots<br/>import_to_firestore.py| B[(Firestore<br/>collection aap)]
        F -.->|clos ou sans date : non importé| N[Fiches en attente]
        B --> W[Application<br/>badge À vérifier]
        W -->|HUMAIN : Monsieur DUCOUT<br/>raccourci Validation des fiches| V2[Verdict par fiche<br/>juste / à corriger / pas un appel]
        V2 -->|import : verdict appliqué<br/>rejetée = archivé, validée = badge retiré| B
    end
    C5[5 connecteurs historiques<br/>ARS IdF, Fondation de France, CNSA, ARS Corse] -->|run.py, API Claude| B
```

Trait plein : flux en place. Trait pointillé : flux en attente ou non construit. « HUMAIN » : une décision de
Monsieur DUCOUT, prise à l'écran, enregistrée dans un fichier de verdicts rejouable.

## Les quatre étages, et ce que veut dire chaque mot

| Mot | Ce que c'est | Où c'est enregistré | Qui décide |
|---|---|---|---|
| Source (émetteur) | Un organisme qui publie des appels : ARS, fondation, département, ministère | `scraping/sources/registre.json` | Annuaires + session, aucune validation humaine pour l'instant |
| Page validée (rubrique confirmée) | La page du site de l'émetteur qui liste ses appels | champ `qualification` du registre, `relecture_qualification.json` | Modèle local, puis Monsieur DUCOUT à l'écran (257 verdicts le 2026-10-13) |
| Lien (adresse candidate) | Sur une page validée, un lien qui ressemble à un appel | `scraping/decouverte/<id>/liens.json` | Robot (mots-clés), personne ne relit |
| Texte collecté | Le texte lisible de la page d'un lien, lu par le navigateur | `scraping/decouverte/<id>/fiches/*.txt` | Automatique |
| Extraction | Le modèle local lit le texte, dit si c'est un appel, et remplit une fiche | `scraping/results/extraction_locale.json` | Modèle local (qwen3:8b), zéro euro |
| Page refusée | Texte jugé « pas la fiche d'un appel » (liste, article, page bloquée) | `results/extraction_locale_non_aap.json` | Modèle local |
| Échec | Texte trop long pour le modèle (délai dépassé) | `results/extraction_locale.errors.json` | Automatique |
| Fiche | Un appel structuré : titre, financeur, dates, montants, description | fichier ci-dessus, puis Firestore | Modèle local, marque « à vérifier » |
| Import | Copie des fiches dans la base de l'application, sans doublon, en ignorant les appels clos ; les appels sans date sont publiés avec `deadline` nulle et « Date de clôture non précisée » (décision du 2026-10-14 au soir) ; les appels classés hors champ entrent en brouillon à corriger (changement `filtre-champ-sante`) | `scripts/import_to_firestore.py` | Automatique, rejouable |
| Source réelle | L'émetteur du registre dont vient la fiche (`scrapeMetadata.source`, `sourceNom`), le fichier de résultats d'origine à part (`fichier`) ; avant le 2026-10-14 au soir, toutes les fiches du passage local portaient « extraction_locale » | `scripts/import_to_firestore.py`, `scraping/financeurs.py` (`emetteur_de`) | Automatique |
| Financeur canonique | Un seul nom par financeur quelle que soit l'orthographe lue par l'IA (« ARS IDF », « Agence régionale de santé Île-de-France » -> « ARS Île-de-France ») ; le nom lu reste dans `scrapeMetadata.financeurExtrait` | `scraping/sources/financeurs.json` (table construite depuis le registre, alias complétables à la main) | Automatique ; alias ajoutés par un humain |
| Territoire | Régions lues dans le texte du territoire (départements, anciennes régions, villes), sinon dans le nom de l'émetteur ; « france » seulement pour un appel national, « non-precise » sinon | `scraping/sources/departements.json`, `scraping/territoires.py`, `territoriesEligible` | Automatique |
| Contrôle du modèle | Relecture de chaque fiche publiable par `claude-haiku-5-5` à côté du texte de sa page : verdict par champ (juste, faux avec la valeur lue, fabriqué, manquant, vide, incertain), champs douteux listés ; depuis le 2026-10-15 à midi, vaut relecture (décision de Monsieur DUCOUT) : validée au nom du modèle si aucun doute hors description ou si dates et montants sont corrigeables d'après la page, rejetée si la page n'est pas un appel, à corriger si doute sur titre, financeur ou territoire ; un verdict humain l'emporte | `scraping/verification.py` (`decision_du_modele`), `scrape_metadata.verification`, `validation` du document (par = modèle), `scripts/appliquer_controle.py` pour les fiches déjà en base | Automatique (0,03 centime par fiche) ; Monsieur DUCOUT relit les fiches « à corriger » |
| Champ | Réponse du modèle à « de quel champ relève cet appel ? » : santé, médico-social, hors champ, incertain (définition de Monsieur DUCOUT du 2026-10-14) ; posée dans la chaîne d'extraction depuis la consigne 4 (2026-10-19), `champ.py --classer` en rattrapage | `scraping/echantillon.py` (`poser_question_champ`), `scraping/champ.py`, `scrape_metadata.champ`, `scrapeMetadata.champ` | Automatique ; le verdict humain l'emporte |
| Lot | Un import exécuté pendant l'extraction, sur tout ce qui a été produit jusque-là | journal de session | Session |
| Rejeu et veille | Relecture des pages validées : liens nouveaux (collectés puis extraits après devis), liens disparus (`absences` croissant, fiche « à corriger » à 2), `VEILLE.md` ; une page en erreur ne compte pas (lot 2, 2026-10-20) | `scraping/rejeu.py`, `decouverte/<source>/liens.json` et `rejeux.json`, `scripts/perimer_fiches.py` | `veille.cmd` à la main ; Monsieur DUCOUT tranche les fiches périmées |
| Dates de fraîcheur | `collecteLe` : date de lecture de la page (en-tête `# collecte_le` du texte, sinon date du fichier, sinon `scraped_at`) ; `extraitLe` : date de production de la fiche ; `derniereVueLe` : date du dernier import où la fiche figurait (lot 2, instruction 10, 2026-10-19) | `scraping/echantillon.py` (`date_collecte`), `scrape_metadata.collecte_le`, `scrapeMetadata` | Automatique |
| Mention de relecture | Ce que lit le visiteur, déduit de `validation` : « Relue par Monsieur DUCOUT », « Contrôlée par le modèle » (validée au nom du modèle), « Non relue : informations extraites automatiquement » ; avec la date d'extraction (`scrapeMetadata.extraitLe`) et le lien officiel (2026-10-19, instruction 11) | `app/src/utils/relecture.ts`, liste et fiche | Automatique |
| À vérifier | Marque posée sur toute fiche sans verdict humain ou à corriger (`validation.statut` = `proposee` ou `a_corriger`, quel que soit le moteur, depuis le lot 0 du 2026-10-14 ; modèle local : environ 1 champ faux sur 4 fiches) | étiquette `a-verifier` dans Firestore, badge dans l'application | Automatique ; levée par un verdict humain (à construire) |
| Verdict | Décision de Monsieur DUCOUT sur une page ou une fiche, avec commentaire | `sources/verdicts_pages.json`, `verdicts_liens.json`, `verdicts_fiches.json` (versionnés ; pages et liens déplacés de `results/` par le lot 0, 2026-10-14) | Monsieur DUCOUT |

## Ce qui est validé par un humain aujourd'hui, et ce qui ne l'est pas

- Validé : les pages des émetteurs (étape 2). C'est la décision prise le 2026-10-13.
- Pas validé : les émetteurs eux-mêmes (étape 1, pris dans des annuaires de référence), les liens repérés
  (étape 2, mots-clés), et les fiches extraites (étape 3, d'où la marque « à vérifier »).
- Retour des verdicts (fait le 2026-10-14, changement `organisation-donnees-validees`) : le verdict de
  Monsieur DUCOUT sur une fiche (`scraping/sources/verdicts_fiches.json`) est appliqué par l'import : « pas un
  appel » archive la fiche, « juste » retire le badge et protège les champs, « à corriger » garde le badge avec
  le commentaire. L'import ne réécrit jamais un statut ou une validation existants.

## Chiffres au 2026-10-14, 10 h (source : `extraction_locale.py --bilan`, import à blanc)

- 242 pages validées, 2 395 liens, 2 178 textes collectés.
- Extraction en cours : 434 fiches, 363 pages refusées, 16 échecs, 1 365 textes restants.
- Base : 221 appels visibles, dont 126 « À vérifier » ; 202 fiches closes et 80 sans date non importées.
