# Audit de l'organisation des données : source, proposition IA, validé, dérivé

Audit en lecture seule, 2026-10-14, à la demande de Monsieur DUCOUT. Aucun fichier de code modifié.
Méthode : lecture des structures réelles (`scraping/schema.py`, `sources/registre.json`,
`sources/relecture_qualification.json`, `results/*.json`, `decouverte/`, `scripts/import_to_firestore.py`,
`app/src/types/index.ts`, `app/firestore.rules`, `app/src/pages/admin/ManageAAPsPage.tsx`). Les quatre
catégories demandées : SOURCE (brut), IA (proposé), VALIDÉ (humain), DÉRIVÉ (calculé localement).

## Suite donnée (2026-10-14, changement `organisation-donnees-validees`)

Traités le jour même : C1 (champs humains jamais réécrits), C2 (verdicts lus par l'import), C3 (`url_validee`),
I2 (identifiant = adresse, base migrée), M1 (`produite_le`, `version_consigne`), M4 en partie (fichiers de
verdicts et pages refusées exclus de l'import). Lot 0 du rapport de critique (changement `lot-0-assainissement`,
2026-10-14) : I4 (un seul statut `validation.statut`, étiquette dérivée), C1 renforcé (liste blanche des champs),
verdicts des pages et des liens versionnés dans `sources/`, plus d'échéance fictive (`deadline` nulle), cinq tests
du plan de correction écrits (`scripts/tests/`). Restent : I1 (blocs séparés), I3 (verdicts des pages par
identifiant d'émetteur), I5, M2, M3, M5, M6.

## État actuel

Le projet est une chaîne de fichiers JSON, chaque étape lisant la précédente, et une seule collection
Firestore `aap` à l'arrivée. Les quatre catégories existent, mais elles ne sont pas nommées comme
telles, et plusieurs fichiers en mélangent deux.

| Donnée | Catégorie | Où | Statut explicite ? | Traçable ? |
|---|---|---|---|---|
| Émetteurs (registre) | SOURCE + VALIDÉ mélangés | `sources/registre.json` : `url_aap`, `notes`, `qualification` | `statut` (opérationnelle, à faire...) et `qualification.verdict` | partielle : `derniere_verification`, mais l'adresse corrigée à la main écrase l'adresse d'origine (ancienne seulement dans `notes`, en texte libre) |
| Annuaires (RNF, familles) | SOURCE | `sources/annuaires/*.csv`, `familles.json` | non | oui (fichier d'origine, date dans le CSV) |
| Page gardée et liens | DÉRIVÉ (robot) | `decouverte/resultats.json`, `decouverte/<id>/liens.json`, `rubrique.html` | `statut` (rubrique-trouvée, aucune-rubrique...) | `date`, mais hors Git, régénérable |
| Verdict de qualification du modèle | IA | `decouverte/qualification.json` (hors Git), recopié dans le registre | `verdict` | `date`, `justification` ; pas de nom de modèle ni de version de consigne |
| Relecture de la qualification | VALIDÉ | `sources/relecture_qualification.json` (versionné) | `verdict`, `relecteur`, `relecture_precedente` | oui, c'est le meilleur fichier du projet |
| Verdicts à l'écran sur les pages | VALIDÉ | `results/validation_pages.json`, clé = adresse de la page | `verdict`, `commentaire`, `date` | oui, mais la clé (adresse) devient orpheline quand la page change (44 verdicts « sans source » constatés après la redécouverte du 13) |
| Verdicts sur les liens et sur les fiches | VALIDÉ | `results/validation_liens.json`, `results/validation_manuelle.json` | `verdict`, `commentaire` | oui ; mais rien ne les lit en aval (voir Critique 2) |
| Textes des pages | SOURCE (brut) | `decouverte/<id>/fiches/*.txt` (adresse en première ligne) | non | pas de date de collecte dans le fichier |
| Fiches des connecteurs historiques | IA (Claude API) | `results/<connecteur>.json`, `scrape_metadata` : `scraped_at`, `last_seen_at`, `source`, `signature` | non | nom du modèle absent de la fiche (il est dans `logs/extraction_costs.jsonl`) |
| Fiches du modèle local | IA | `results/extraction_locale.json`, `scrape_metadata` : `moteur`, `modele`, `fichier`, `a_relire`, `a_verifier`, `ecarts`, `duree_s` | `a_verifier` (booléen), `a_relire` (booléen) | pas de date de production ; pas de version de consigne |
| Fiches de l'échantillon | IA puis VALIDÉ mélangés | `results/echantillon_ollama*.json` (IA), `echantillon_claude_code.json` (écrites par la session), `echantillon_valides.json` (copie validée), `controle_echantillon.json` (colonnes machine et manuelles côte à côte) | non | partielle |
| Base de l'application | SOURCE + IA + VALIDÉ + DÉRIVÉ dans un seul document | Firestore `aap/scraped-<signature>` | `status` (draft, published, closed, archived) ; `tags` contient `a-verifier` | `scrapeMetadata.source`, `signature`, `importedAt` ; pas de modèle, pas de verdict humain |

## Problèmes identifiés

### Critique : risque de perte ou d'écrasement de données validées

**C1. Toute réimport écrase ce qu'un humain a changé dans Firestore.**
`scripts/import_to_firestore.py`, ligne `batch.set(ref, doc, merge=True)` : pour un document existant, tous
les champs de la fiche sont réécrits, dont `status: "published"`, `tags`, `title`, `deadline`, `description`.
Or l'écran d'administration (`app/src/pages/admin/ManageAAPsPage.tsx`) permet d'archiver ou de clôturer un AAP
(`updateDoc` sur `status`). Scénario concret : Monsieur DUCOUT archive une fiche fausse le matin ; le lot
suivant de l'extraction est importé le soir ; la fiche redevient `published`. Le commentaire du code dit
« conserve views / applicationsCount » : c'est vrai pour ces deux compteurs seulement, parce que l'import ne
les envoie pas. Tout champ que l'import envoie est perdu pour l'humain.

**C2. Les verdicts humains sur les fiches ne sont lus par personne.**
`results/validation_manuelle.json` (raccourci « Validation des fiches à vérifier ») et
`results/validation_liens.json` sont écrits, jamais consommés : ni par l'import, ni par l'extraction, ni par
l'application. Un verdict « pas un appel » laisse la fiche visible ; un verdict « juste » laisse le badge. Le
travail de validation n'a donc aucun effet tant que ce chaînon manque (identifié dans `docs/FLUX_DONNEES.md`).

**C3. Le registre mélange la donnée d'origine et la correction humaine dans le même champ.**
`sources/registre.json`, champ `url_aap` : la correction donnée à l'écran remplace l'adresse d'origine ; l'ancienne
n'est gardée qu'en texte dans `notes` (« Adresse corrigée par Monsieur DUCOUT le ... (ancienne : ...) »). Une
future « vague » du registre par annuaires (`annuaires.py --integrer`) ou une resonde automatique pourrait
réécrire `url_aap` sans savoir qu'un humain l'avait fixée. Il n'y a pas de champ qui dise « cette adresse est
validée, ne pas toucher ».

### Important : confusion entre données IA, validées et locales

**I1. Un seul document Firestore porte les quatre catégories sans les distinguer.**
Dans `aap/scraped-<signature>` : `title`, `description`, `deadline` viennent de l'IA ; `status` peut être changé
par un humain ; `tags` mélange une provenance (`a-verifier`, nom du fichier source), un territoire et des
catégories ; `sectorsTargeted` vaut toujours `["sante", "social"]` (valeur fixée par l'import, pas une donnée).
Le type `AAP` (`app/src/types/index.ts`) n'a aucun champ de validation : pas de `validationStatus`, pas de
`validatedAt`, pas de `validatedBy`, pas de modèle. Le lecteur ne peut pas savoir si une date de clôture a
été relue par quelqu'un.

**I2. La clé de dédoublonnage dépend du texte produit par l'IA.**
`signature = sha1(titre|financeur|date_cloture)` (`orchestrator.py`, `import_to_firestore.py`). Deux moteurs
qui reformulent le même appel donnent deux documents : constaté le 2026-10-13 (« Appel à projet ESMS
Numérique 2026 » par le connecteur ARS, « Appel à projet - ESMS Numérique 2026 » par le modèle local). La vraie
identité d'un appel est son adresse `url_source`, qui est brute et stable ; elle n'est pas utilisée comme clé.

**I3. Les verdicts humains sur les pages sont indexés par une donnée dérivée.**
`results/validation_pages.json` a pour clé l'adresse de la page gardée, qui change à chaque redécouverte.
Conséquence déjà vue : 44 verdicts « sans source » quand on relance `--appliquer-pages` après une
redécouverte. Le verdict devrait être rattaché à l'identifiant de l'émetteur (stable) avec l'adresse jugée en
attribut.

**I4. Deux drapeaux pour une même idée, et aucun cycle de vie.**
`scrape_metadata.a_relire` (format douteux, mis à null par le script) et `scrape_metadata.a_verifier`
(provenance modèle local) sont deux booléens indépendants ; l'application n'en voit qu'un, transformé en
étiquette `a-verifier`. Il n'existe nulle part un statut unique du type « importée / proposée par l'IA /
à relire / validée / rejetée ». `AapStatus` de l'application (`draft`, `published`, `closed`, `archived`)
décrit la publication, pas la fiabilité.

**I5. Les fiches de l'échantillon existent en trois exemplaires de statut différent.**
`echantillon_ollama_qwen3-8b.json` (IA), `echantillon_claude_code.json` (écrites par la session, considérées
référence), `echantillon_valides.json` (sous-ensemble importé). `controle_echantillon.json` met dans le même
objet des colonnes remplies à la main (`claude_code`, `ollama`) et des colonnes calculées (`ollama_qwen3-8b`),
distinguées seulement par un commentaire dans le code. Pour un lecteur, rien ne dit laquelle fait foi.

### Mineur : traçabilité, nommage, duplication

**M1. Pas de date de production ni de version de consigne sur les fiches du modèle local.** `scrape_metadata` a
`duree_s` et `modele` mais pas de `scraped_at` (les connecteurs historiques l'ont). La consigne d'extraction
(`CONSIGNE` dans `echantillon.py`) a changé deux fois ; aucune fiche ne dit avec quelle version elle a été
produite. Impossible de rejouer ou de comparer deux campagnes.

**M2. Le nom du modèle des connecteurs historiques n'est pas dans la fiche.** `scrape_metadata` des fichiers
`fondation_de_france.json` etc. n'a pas de champ `model` ; il est dans `logs/extraction_costs.jsonl` seulement.

**M3. Textes collectés sans date.** `decouverte/<id>/fiches/*.txt` : adresse en première ligne, texte, pas de
date de lecture. Pour la veille (étape 4 de la feuille de route), la date de collecte est indispensable.

**M4. Noms ambigus.** `results/` contient à la fois des sorties de connecteurs (`cnsa.json`), des sorties IA
locales (`extraction_locale.json`), des verdicts humains (`validation_*.json`), une grille de contrôle et un
journal de recherche (`recherche_sites.jsonl`). L'import global lit tout `*.json` sauf par exception sur le
préfixe `echantillon_` et `controle_` : une nouvelle sortie IA déposée là part en base sans décision.
`validation_manuelle.json` et `validation_liens.json` ne disent pas ce qu'ils jugent (fiches ? liens ?).

**M5. Duplication d'adresses entre émetteurs.** Deux entrées du registre pointent la même page (Région et
Conseil régional d'Île-de-France, Drôme et sa commission des financeurs). L'extraction locale les dédoublonne à
la volée ; le registre, lui, les garde en double.

**M6. Fichiers de travail hors Git.** `decouverte/qualification.json` (verdicts IA) n'est pas versionné ; seule
la relecture l'est. Si le dossier est perdu, le registre garde le verdict final mais le détail IA (justification
complète, sondage) disparaît.

## Données concernées, résumé par problème

| Problème | Fichier / collection | Champ | Pourquoi | Risque concret |
|---|---|---|---|---|
| C1 | `scripts/import_to_firestore.py`, Firestore `aap` | `status`, `tags`, tous les champs métier | `set(merge=True)` réécrit tout ce que l'import envoie | un AAP archivé ou corrigé à la main revient à son état IA au lot suivant |
| C2 | `results/validation_manuelle.json`, `validation_liens.json` | `verdict`, `commentaire` | aucun lecteur en aval | heures de validation sans effet ; fiches fausses visibles |
| C3 | `sources/registre.json` | `url_aap`, `notes` | correction humaine indistincte de la donnée brute | réécriture silencieuse par un outil automatique |
| I1 | `app/src/types/index.ts`, Firestore `aap` | absence de `validationStatus`, `validatedAt`, `model` | IA et humain indiscernables | l'utilisateur final ne sait pas à quoi se fier |
| I2 | `orchestrator.py`, `import_to_firestore.py` | `signature` | clé calculée sur du texte IA | doublons entre moteurs, doublons après reformulation |
| I3 | `results/validation_pages.json` | clé = adresse | adresse dérivée, instable | verdicts orphelins après redécouverte |
| I4 | `results/extraction_locale.json`, Firestore `aap.tags` | `a_relire`, `a_verifier`, `a-verifier` | trois marques, aucun statut | logique de tri impossible à écrire proprement |
| I5 | `results/echantillon_*.json`, `controle_echantillon.json` | fichiers entiers | trois copies de statut différent | on ne sait plus laquelle fait foi |
| M1 à M6 | voir ci-dessus | | | perte de traçabilité, veille impossible, erreurs de lecture |

## Réponses aux vérifications demandées

- Réponses brutes de l'IA séparées des données finales ? Partiellement. Côté scraping, oui : un fichier par
  moteur. Côté application, non : le document Firestore est la réponse IA, sans copie « finale ».
- Une validation humaine peut-elle être écrasée par une nouvelle exécution IA ? Oui (C1), et une correction
  humaine du registre peut l'être par un outil automatique (C3). Exception positive : la relecture de la
  qualification (`relecture_qualification.json`) est protégée : elle s'applique par-dessus le verdict du modèle
  à chaque exécution, et conserve `relecture_precedente`.
- Données recalculables séparées des données validées ? Oui pour la découverte (`decouverte/`, hors Git,
  régénérable) ; non dans Firestore (`sectorsTargeted`, `territoriesEligible` calculés sont mêlés au reste).
- Statut de cycle de vie clair ? Non. Il y a des statuts partiels à chaque étape (registre, découverte,
  qualification, publication) mais aucun pour une fiche d'appel.
- Chaque donnée a-t-elle une source identifiable ? Oui pour les fiches (`url_source`, `scrape_metadata.source`),
  oui pour les verdicts (date, relecteur), non pour les émetteurs (pas de champ « d'où vient cette entrée du
  registre », sauf les 165 fondations de la vague 1 qui ont `id_registre` dans le CSV).
- `created_at`, `updated_at`, `source`, `model`, `prompt_version`, `validation_status` ? `created_at` : oui dans
  Firestore (`createdAt`, `importedAt`), non sur les fiches locales. `updated_at` : Firestore seulement. `source` :
  oui. `model` : fiches locales oui, connecteurs non. `prompt_version` : nulle part. `validation_status` :
  nulle part.
- Champs ou tables redondants ? `a_relire` / `a_verifier` / étiquette `a-verifier` ; registre et
  `decouverte/resultats.json` portent chacun une adresse de page ; trois fichiers d'échantillon.

## Schéma cible recommandé

Recommandation : garder les fichiers JSON pour le scraping (ils conviennent à un développeur solo et sont
rejouables), mais séparer clairement les quatre catégories, et ne plus laisser l'import écraser Firestore.
Pas de refonte : des champs et une règle d'écriture.

### Côté scraping (fichiers)

1. **SOURCE** : `sources/registre.json` garde `url_aap` comme adresse d'origine ; la correction humaine va dans un
   nouveau champ `url_validee` avec `validee_par` et `validee_le`. Les outils lisent `url_validee or url_aap`
   et n'écrivent jamais `url_validee`. Textes collectés : ajouter une ligne d'en-tête avec la date de collecte.
2. **IA** : chaque fiche produite reçoit dans `scrape_metadata` : `produite_le`, `moteur`, `modele`,
   `version_consigne` (un numéro incrémenté dans le code quand la consigne change). Un seul drapeau de qualité
   (`a_relire` pour « format neutralisé »), la provenance suffit pour le reste.
3. **VALIDÉ** : un seul fichier de verdicts par objet jugé, nommé par l'objet, rattaché à un identifiant stable :
   `sources/verdicts_emetteurs.json` (clé = identifiant de l'émetteur, attribut = adresse jugée),
   `sources/verdicts_fiches.json` (clé = `url_source` de l'appel). Ces fichiers sont versionnés et jamais
   écrits par un outil automatique. Les fichiers actuels `validation_pages.json` et `validation_manuelle.json`
   sont migrés une fois.
4. **DÉRIVÉ** : `decouverte/` reste hors Git et régénérable ; `results/` est scindé en deux sous-dossiers,
   `results/connecteurs/` (ce que l'import lit) et `results/essais/` (échantillons, grilles, journaux), pour que
   l'import global ne puisse pas lire une sortie d'essai par accident.

### Côté application (Firestore)

Une seule collection `aap`, mais un bloc par catégorie dans le document, et une règle : l'import ne touche
que son bloc.

```
aap/<id stable dérivé de url_source>
  source        : { url, emetteurId, collecteLe }                        <- SOURCE, écrit par l'import
  proposition   : { titre, description, dateCloture, ..., moteur, modele, versionConsigne, produiteLe }
                                                                         <- IA, écrit par l'import, réécrit librement
  validation    : { statut: proposee | a_corriger | validee | rejetee, par, le, commentaire,
                    corrections: { champ: valeur } }                     <- VALIDÉ, écrit par l'humain seulement
  publication   : { status (draft/published/closed/archived), publishedAt }  <- décision d'exploitation, humain
  affichage     : champs actuels (title, description, deadline...) = proposition + corrections,
                  recalculé par l'import à partir des deux blocs             <- DÉRIVÉ
```

Pourquoi un seul document et pas plusieurs collections : l'application lit déjà un document par appel, et
Firestore facture par lecture ; trois collections tripleraient les lectures et le code de l'application. Les
blocs séparés donnent la même clarté. Pourquoi l'identifiant dérivé de `url_source` : il est brut, stable, et
identique quel que soit le moteur (règle I2). Statut proposé pour `validation.statut` : `proposee` (par
défaut), `a_corriger`, `validee`, `rejetee`. La règle d'import devient : si `validation.statut` vaut `rejetee`,
ne pas publier ; si `validee`, ne pas toucher à `affichage` ; sinon, régénérer `affichage` depuis
`proposition`. `publication.status` n'est jamais écrit par l'import s'il existe déjà.

## Plan de correction progressif

1. **Corrections prioritaires (sans migration, une journée)**
   - C1 : dans l'import, pour un document existant, ne plus envoyer `status`, `publishedAt` ni `tags` si le
     document en a déjà ; ou mieux, écrire sous un sous-objet `proposition` et laisser `status` tranquille.
     Test : archiver un AAP, réimporter, vérifier qu'il reste archivé.
   - C2 : l'import lit `results/validation_manuelle.json` : `pas-un-aap` retire le document (ou le passe
     `archived`), `aap-juste` retire l'étiquette `a-verifier`, `aap-a-corriger` la garde avec le commentaire.
     C'est le changement OpenSpec « retour des verdicts sur les fiches » proposé ce matin.
   - C3 : champ `url_validee` dans le registre, outils en lecture seule dessus.
2. **Refactorisations ensuite**
   - I3 : verdicts sur les pages rattachés à l'identifiant de l'émetteur (migration des 257 verdicts par
     correspondance adresse -> identifiant, déjà faite une fois dans `--appliquer-pages`).
   - I2 : identifiant Firestore dérivé de `url_source` ; conserver `signature` comme attribut. Dédoublonnage
     des 95 anciens documents une fois (correspondance par `externalUrl`).
   - I4 / I5 : un statut `validation.statut` à la place des drapeaux ; dossier `results/essais/`.
3. **Champs à ajouter** : `produite_le`, `version_consigne` (fiches) ; `url_validee`, `validee_par`,
   `validee_le` (registre) ; blocs `proposition`, `validation`, `publication` (Firestore) ; `collecteLe` (textes).
4. **Migrations** : une fois chacune, scriptées et rejouables : verdicts pages (clé), documents Firestore
   (identifiant et blocs), registre (`url_validee` rempli depuis les notes « Adresse corrigée »).
5. **Tests à ajouter** (`scraping/tests/`, et un test du script d'import avec un faux Firestore en mémoire) :
   - « un document archivé reste archivé après réimport » ;
   - « un verdict `validee` protège `affichage` d'une nouvelle proposition » ;
   - « un verdict `rejetee` empêche la publication » ;
   - « `url_validee` n'est jamais écrite par `annuaires.py` ni `registre.py` » ;
   - « deux moteurs produisant le même `url_source` donnent un seul document ».

## Questions avant modification

1. Quand une fiche est jugée « pas un appel », faut-il la supprimer de Firestore ou la garder archivée (trace
   de la décision, mais document conservé) ? Je recommande archivée.
2. L'identifiant Firestore doit-il changer maintenant (migration des 221 documents, liens d'application
   cassés pour les favoris éventuels) ou seulement au prochain nettoyage global ? Je recommande maintenant,
   tant qu'il n'y a pas d'utilisateur.
3. Les 80 fiches sans date de clôture : les publier avec une échéance fictive (option existante) ou les laisser
   en attente de validation humaine ? Je recommande en attente, avec le statut `a_corriger`.
