# Rapport de critique — AAP Santé

Rédigé le 2026-10-14 pour Monsieur DUCOUT (ARCADIA SASU), à destination de Claude Code.

Base d'analyse : `CAHIER_DES_CHARGES_APPLICATION.md`, `application_spec.json`, `AUDIT_DONNEES_2026-10-14.md`,
`FLUX_DONNEES.md`. Le dépôt n'a pas été lu : toute affirmation sur le code vient de ces documents. Les chiffres
cités renvoient à la section du cahier des charges (CDC) ou de l'audit qui les donne. « À confirmer » signale
un point que le CDC lui-même laisse non vérifié ou que je ne peux pas vérifier d'ici. « Valeur par défaut »
signale une proposition que je formule faute d'information, à remplacer par la réponse de Monsieur DUCOUT.

Principe du rapport : corrections progressives, pas de refonte. L'audit du 2026-10-14 a déjà traité les
risques critiques d'écrasement (C1, C2, C3, I2, M1) ; ce rapport s'appuie dessus et ne les refait pas.

**Statut : validé par Monsieur DUCOUT le 2026-10-14.** Les huit questions de la section 7 ont reçu une réponse ;
les instructions de la section 6 les intègrent. Il n'y a plus de « valeur par défaut » en attente.

## 1. Compréhension du besoin

- **Problème** : les appels à projets (AAP) santé et médico-social sont dispersés sur des centaines de sites,
  dans des formats hétérogènes, sans annuaire unique (CDC §1).
- **Pour qui** : porteurs de projets (établissements, associations) ; secondairement financeurs. Un seul
  utilisateur réel aujourd'hui, Monsieur DUCOUT, à la fois opérateur de la collecte et administrateur (CDC §3).
- **Résultat attendu** : une liste unique, à jour et fiable des appels ouverts, consultable sans compte, filtrable,
  renvoyant vers la page officielle.
- **Flux principal** : visiteur → `/aap/search` → fiche `/aap/:id` → lien externe vers l'émetteur (CDC §3, §7.7).
- **Valeur du MVP** : le temps de veille économisé, à condition que la liste soit exhaustive, exacte et fraîche.
  Aujourd'hui : 341 documents, 194 publiés dont 150 « À vérifier » (CDC §7.5), environ 1 fiche sur 4 à 5 avec un
  champ faux (CDC §12), aucune veille (CDC §12).

**Défaut n°1 du cahier des charges** : il décrit l'existant (« telle qu'elle existe, pas telle qu'elle est
souhaitée », en-tête) et ne définit ni le périmètre du MVP, ni le client payant, ni un critère de réussite
mesurable. Conséquence visible : cinq rôles et une quinzaine de modules codés, dont les deux tiers sont inactifs
(Cloud Functions non déployées, Stripe fictif, pages gabarit). Hypothèse de travail retenue pour ce rapport,
**à confirmer (question Q1)** : le MVP est la consultation fiable et à jour des appels, sans compte.

## 2. Diagnostic

Gravité : BLOQUANT (empêche de développer correctement ou risque majeur), MAJEUR (coût, délai ou dette
importants), MINEUR (souhaitable).

| Point | Gravité | Problème | Recommandation |
|---|---|---|---|
| **Périmètre** | | | |
| P1 Deux applications en une | BLOQUANT | La chaîne de collecte fonctionne ; la plateforme transactionnelle (candidatures, évaluation, messagerie, notifications, calendrier, statistiques, recommandations, paiement) est codée mais non fonctionnelle : Functions non déployées, Stripe fictif, règles Firestore probablement bloquantes, champs désalignés (CDC §12). Tout effort dessus est perdu tant que le cœur n'est pas fiable. | Geler explicitement ce volet : retirer ses routes du MVP (le code reste), ne plus y toucher avant le lot 4. |
| P2 Code dépendant de Blaze | MAJEUR | Cloud Functions, Storage et webhook Stripe sont du code mort tant que Blaze est refusé (CDC §4, §12). Les pièces jointes sont servies depuis le PC. | Sortir Functions, Storage et Stripe du périmètre. Pour les pièces jointes, afficher le lien d'origine (`fichiers_joints[].url`, déjà présent dans le schéma) au lieu de servir une copie locale. |
| P3 Scores sur constantes | MAJEUR | `sectorsTargeted` vaut toujours `["sante","social"]` à l'import, donc le score de recommandation donne 40 points à tout le monde ; budget estimé fixe à 50 000 euros ; `profile.effectif` inexistant (CDC §9, §12). Les résultats sont faux par construction. | Supprimer recommandations et préqualification du MVP. |
| P4 Parcours porteur long | MINEUR | Quatre étapes avant le tableau de bord (inscription, vérification e-mail, profil, page abonnement non fonctionnelle) alors que la consultation est libre (CDC §7.7). | Rien tant que le volet est gelé ; au lot 4, réduire à inscription et profil. |
| **Manques** | | | |
| M1 Fraîcheur | BLOQUANT | Aucune veille, aucune date de collecte sur les textes, aucune détection d'un appel retiré du site (CDC §8.3, §12). Pour un agrégateur, c'est la deuxième fonction vitale après l'exactitude : une liste figée perd sa valeur en quelques semaines. | Dater chaque texte collecté (`collecteLe`), reporter une date « vue pour la dernière fois » sur chaque fiche (les connecteurs ont déjà `last_seen_at`, CDC §5.3), rejouer la collecte périodiquement, marquer « à corriger » une fiche non revue après deux rejeux. Lot 2. |
| M2 Règles Firestore | MAJEUR | Création probablement refusée pour `savedSearches`, `favoriteAap`, `notifications` (`resource.data`), actions admin non autorisées sur `aap` et `users`, `conversations` sans règle, essai jamais expiré (CDC §11, §12). Aucun test de règles. | Ne corriger que les collections du MVP (`aap`, `users`) avec des tests sur l'émulateur Firestore ; verrouiller les autres en écriture tant qu'elles sont gelées. |
| M3 Tests applicatifs | MAJEUR | 49 + 6 tests côté Python, aucun côté application (CDC §12). Les cinq tests d'import recommandés par l'audit ne sont pas tous mentionnés comme faits. | Écrire les cinq tests de l'audit (§ Plan, point 5) et un test de rendu de la page de recherche. Aucun lot ne se ferme sans eux. |
| M4 Sauvegarde | MAJEUR | Sauvegarde JSON seulement avant migration (CDC §11). Sauvegarde automatique Firestore sur le plan gratuit : à confirmer. `validation_pages.json` et `validation_liens.json` sont hors Git, dans `results/` (CDC §8.2) : des heures de décisions humaines non versionnées. | Export JSON hebdomadaire de la collection `aap` avec le script de sauvegarde existant ; verdicts humains déplacés dans `sources/` et versionnés. |
| M5 Exposition publique et RGPD | MAJEUR | Déploiement Netlify « à confirmer » ; si l'inscription est ouverte, des données personnelles (e-mail, SIRET, contacts) sont collectées sans AIPD ni pages légales (gabarits, CDC §12). | Tant que le volet comptes est gelé, fermer l'inscription (route `/signup` retirée). Pages légales minimales avant toute réouverture. |
| M6 Journalisation | MINEUR | `alert()` natifs, Sentry installé mais inactif, pas de journal d'import structuré (CDC §12). | Journal d'import en fichier (date, créés, mis à jour, ignorés, archivés). Pas de Sentry avant des utilisateurs externes. |
| M7 Performance de la recherche | MINEUR | Lecture de tous les AAP publiés puis filtrage côté client (CDC §9, §12). Acceptable à 341 documents ; le coût de lecture Firestore croît linéairement avec le catalogue. | Rien maintenant. Au-delà de 1 000 documents publiés (valeur par défaut), passer à des requêtes indexées avec pagination. |
| M8 Coût humain non dimensionné | MAJEUR | 150 fiches « À vérifier » aujourd'hui, 1 116 textes restants (CDC §7.3) : plusieurs centaines de fiches à juger. Le temps par fiche n'est pas mesuré ; c'est pourtant le vrai coût du modèle local « à zéro euro ». | Mesurer le temps par verdict (les dates sont déjà dans `verdicts_fiches.json`) et arbitrer le modèle d'extraction sur cette base (arbitrage A3). |
| **Ambiguïtés** | | | |
| A1 `draft` à deux sens | MAJEUR | `draft` signifie « fiche importée sans date de clôture » (règle 4) et « appel en cours de rédaction par un financeur » (CDC §7.8). Un développeur ne peut pas écrire un filtre d'administration sans savoir lequel. | Documenter : `status` décrit uniquement la visibilité publique (`draft` = non visible, quelle qu'en soit la raison) ; la raison est dans `validation.statut`. L'écran d'administration filtre sur `validation.statut`. |
| A2 Échéance fictive | MAJEUR | Fiche sans date → `deadline` à un an (règle 4). Une donnée inventée dans un champ métier ; un clic « publier » dans l'administration la rend publique. | Décision Q4 (tranchée) : rendre `deadline` nullable dans le type `AAP`, ne plus écrire d'échéance fictive, afficher « Date de clôture non précisée », migrer les documents existants portant `sans-date-cloture`. La publication reste soumise à un verdict humain (règle 4 du CDC). |
| A3 Quatre marqueurs de fiabilité | MAJEUR | `a_relire`, `a_verifier`, étiquette `a-verifier` dans `tags`, `validation.statut` (CDC §5.3, §5.4). L'interface lit l'étiquette ; l'import écrit le bloc. Deux sources de vérité qui peuvent diverger. | `validation.statut` devient l'unique source ; l'étiquette `a-verifier` est dérivée du statut à l'import (ou l'interface lit le bloc) ; `a_relire` n'est plus qu'un détail dans `ecarts`. |
| A4 Priorité entre sources | MINEUR | Règle 5 (fiche validée protégée) et règle 7 (connecteur prioritaire sur modèle local) ne disent pas l'ordre quand les deux s'appliquent. | Écrire et tester l'ordre : verdict humain > connecteur > modèle local. |
| A5 Territoire par défaut | MINEUR | Territoire non reconnu → `territoriesEligible = ["france"]` (CDC §9) : un appel régional devient « toute la France ». | Valeur `["non-precise"]` (valeur par défaut) et affichage « Territoire non précisé » ; le libellé brut reste dans `tags`. |
| **Incohérences** | | | |
| I1 Bloc `validation` hors type | MAJEUR | Écrit par l'import, absent du type `AAP` TypeScript ; pas de `validatedBy` (CDC §5.4, §8.3). | Ajouter `validation` (`statut`, `commentaire`, `date`, `par`) au type. Ce rapport vaut exigence explicite au sens de `CLAUDE.md`. |
| I2 Champs désalignés | MAJEUR | `teamMembers`/`team`, `frequency`/`alertFrequency`, `shortlisted` hors type, `profile.effectif` (CDC §12). Tous dans le volet gelé. | Ne pas corriger un par un maintenant ; au lot 4, valider les formulaires avec des schémas zod partagés entre formulaire et type. |
| I3 Documentation datée | MINEUR | `FLUX_DONNEES.md` dit « pas validé : les fiches extraites » alors que les verdicts sont appliqués depuis le même jour (CDC §6). | Mettre à jour `FLUX_DONNEES.md` à chaque changement OpenSpec touchant le flux. |
| I4 Clés de verdicts hétérogènes | MINEUR | Verdicts sur les fiches clés par `url_source` (stable) ; verdicts sur les pages clés par adresse de page (instable : 44 orphelins, audit I3). | Migrer les verdicts de pages vers `sources/verdicts_emetteurs.json` clé par identifiant d'émetteur, adresse jugée en attribut. |
| I5 Registre | MINEUR | Doublons d'émetteurs (Île-de-France, Drôme) ; adresse FIRAH pointant vers OCIRP (CDC §12). | Dédoublonner par adresse ; revoir le verdict FIRAH. |
| **Choix techniques** | | | |
| T1 Firebase sans Blaze | MAJEUR | Pas de code serveur possible, règles d'accès complexes à tester, lecture facturée par document, recherche côté client. Une alternative existe (base relationnelle hébergée avec recherche plein texte), mais migrer 341 documents et l'application entière contredit le principe « pas de refonte ». | Garder Firestore. Conserver tout accès Firestore dans `aapService.ts` (CDC §9 ; à confirmer que c'est le seul point d'accès) pour laisser la porte ouverte. Revoir au lot 3 si le catalogue dépasse 2 000 documents ou si une recherche plein texte est demandée. |
| T2 Modèle local qwen3:8b | MAJEUR | 0 euro, 69 s par fiche, seuil de l'échantillon non atteint, environ 20 à 25 % des fiches avec un champ faux (CDC §7.3, §12). Le coût réel est le temps humain de validation (M8). Un modèle API moins cher que `claude-sonnet-4-6` (0,03 euro par appel, CDC §4) pourrait réduire ce temps ; son prix et sa qualité sont à confirmer. | Mesurer un modèle API plus petit sur l'échantillon existant (45 textes, seuil 20 justes / 2 fabriquées, CDC §13) avec un budget plafonné et l'accord écrit de Monsieur DUCOUT, avant tout passage global. Arbitrage A3. |
| T3 Deux chaînes d'extraction | MINEUR | Connecteurs (API) et extraction locale produisent des `scrape_metadata` différents : pas de `modele` ni de `produite_le` côté connecteurs (audit M2). | Converger : mêmes champs de provenance pour les deux moteurs. |
| T4 Recherche web | MINEUR | Tavily épuisé ; recherche par la session Claude Code (CDC §10). | Acceptable pour le registre, qui avance par vagues manuelles. |
| **Cycle de vie des données** | | | |
| C1 Document Firestore à plat | MAJEUR | SOURCE, IA, VALIDÉ et DÉRIVÉ dans les mêmes champs (audit I1). La protection par listes `CHAMPS_HUMAINS` / `CHAMPS_METIER` fonctionne mais est fragile : un champ ajouté à l'import sans mise à jour des listes redevient écrasable. | Pas de migration en blocs maintenant. Rendre l'import strict : liste blanche des champs envoyés ; un champ inconnu dans une fiche fait échouer l'import à blanc. Blocs au lot 3 seulement si un cas réel l'exige. |
| C2 Décisions humaines hors versionnement | MAJEUR | Voir M4 : `validation_pages.json`, `validation_liens.json` dans `results/`, non versionnés. | Déplacer dans `sources/`, versionner, migration rejouable une fois. |
| C3 Proposition IA non conservée en base | MINEUR | Une fiche `validee` n'est plus réimportée ; si la consigne change, la nouvelle proposition reste dans `results/*.json` sans comparaison possible dans l'application. | Acceptable au MVP : `results/` conserve la proposition et `version_consigne`. Noter dans la documentation. |
| C4 Échantillon en trois copies | MINEUR | `echantillon_ollama*`, `echantillon_claude_code`, `echantillon_valides`, grille mixte (audit I5). | Dossier `results/essais/` ; un fichier de référence nommé comme tel. |
| **Expérience utilisateur** | | | |
| U1 « À vérifier » sur 150 des 194 fiches publiées | MAJEUR | Le visiteur voit, dès la première recherche, que trois quarts du catalogue n'est pas relu : la promesse de fiabilité est contredite. | Décision Q2. Valeur par défaut : afficher ces fiches avec une mention explicite (« Informations extraites automatiquement, non relues. Vérifiez sur la page officielle »), le lien officiel en évidence et la date de collecte ; proposer un filtre « fiches relues seulement ». |
| U2 Validation hors application | MINEUR | L'opérateur juge les fiches dans un serveur local (`validation.py`) et administre dans l'application : deux outils pour le même objet. Pour un seul opérateur, c'est moins coûteux que de tout refaire dans l'application. | Garder. Ne pas construire d'écran d'édition de fiche dans l'application avant le lot 3. |
| U3 Candidature sans brouillon | MINEUR | Créée directement en `submitted` (CDC §12) : perte de travail possible. | Volet gelé ; au lot 4, brouillon par défaut. |

## 3. Fondations à poser

### Architecture cible

Même architecture qu'aujourd'hui, avec un périmètre tracé au cordeau. Rien de nouveau n'est introduit.

```
COLLECTE (scraping/, Python, poste de Monsieur DUCOUT)
  annuaires/ ─────────────► registre.json           [SOURCE : url_aap | VALIDÉ : url_validee]
  registre ─► decouverte/   (robot Playwright)      [DÉRIVÉ, hors Git, régénérable]
            ─► qualification (Ollama)               [IA]
            ─► sources/relecture_qualification.json [VALIDÉ]
            ─► sources/verdicts_emetteurs.json      [VALIDÉ, migré depuis validation_pages.json]
  pages validées ─► textes collectés, datés         [SOURCE]
            ─► extraction : connecteurs (API) ou modèle local (Ollama)
            ─► results/connecteurs/*.json           [IA : moteur, modele, version_consigne, produite_le]
            ─► results/essais/                      [IA, jamais importé]
  validation.py ─► sources/verdicts_fiches.json     [VALIDÉ, clé url_source]

JONCTION (scripts/)
  import_to_firestore.py : liste blanche de champs, verdicts appliqués, identifiant = adresse
            ─► Firestore aap                        [IA + VALIDÉ + DÉRIVÉ, protégés par règles d'import]

APPLICATION (app/, React + Firebase, MVP)
  public  : /aap/search, /aap/:id
  admin   : /login, /admin/aaps (statut de publication, filtre par validation.statut)
  GELÉ    : porteur, financeur, candidatures, messagerie, notifications, calendrier,
            recommandations, Stripe, Cloud Functions, Storage
```

### Modèle de données principal

Objets inchangés : `Emetteur` (registre), `FicheAAP` (`AapNormalized`), `AAP` (Firestore), verdicts. Ajouts
minimaux, tous déjà suggérés par l'audit ou présents chez un des deux moteurs :

- `FicheAAP.scrape_metadata` : mêmes champs pour les deux moteurs : `source`, `moteur`, `modele`, `produite_le`,
  `version_consigne`, `collecte_le` (date du texte), `signature`.
- `AAP.validation` : `statut`, `commentaire`, `date`, `par` (ajouté au type TypeScript).
- `AAP.scrapeMetadata` : `collecteLe`, `derniereVueLe` (report de `last_seen_at` / de la date du dernier rejeu).
- Textes collectés : une ligne d'en-tête supplémentaire avec la date de collecte (audit M3).

Aucune nouvelle collection, aucun nouveau format de fiche.

### Cycle de vie des données

Quatre catégories, un emplacement et un seul auteur par catégorie :

| Catégorie | Emplacement | Seul auteur | Versionné |
|---|---|---|---|
| SOURCE | `sources/annuaires/`, `registre.json` (`url_aap`), `decouverte/<id>/fiches/*.txt` | annuaires, robots | annuaires et registre oui ; textes non (régénérables) |
| IA | `decouverte/qualification.json`, `results/connecteurs/*.json`, `results/essais/` | API Claude, Ollama | non (rejouables, avec `version_consigne`) |
| VALIDÉ | `sources/relecture_qualification.json`, `sources/verdicts_emetteurs.json`, `sources/verdicts_fiches.json`, `registre.json` (`url_validee`), Firestore `status`, `publishedAt`, `validation` | Monsieur DUCOUT via `validation.py` ou l'administration | oui, toujours |
| DÉRIVÉ | rapports Markdown, `decouverte/resultats.json`, Firestore `tags`, `territoriesEligible`, `sectorsTargeted`, `budgetTotal`, identifiant | scripts | non |

Statuts et transitions autorisées :

| Objet | Statut | Valeurs | Qui fait passer |
|---|---|---|---|
| Fiche (collecte) | résultat d'extraction | `produite`, `refusee`, `echec` | `extraction_locale.py` seulement |
| AAP | `validation.statut` | `proposee` → `validee` / `a_corriger` / `rejetee` ; `a_corriger` → `validee` / `rejetee` ; `validee` et `rejetee` sont terminaux sauf nouveau verdict humain | verdict humain, reporté par l'import |
| AAP | `status` (visibilité) | création : `published` (fiche datée) ou `draft` (sans date, ou verdict `a_corriger` avant publication) ou `archived` (verdict `rejetee`) ; ensuite `published` ↔ `closed` / `archived` | admin ; l'import ne touche jamais un `status` existant |

Règles contre l'écrasement d'une donnée validée (les cinq premières sont en vigueur depuis l'audit ; les
suivantes les complètent) :

1. L'import ne réécrit jamais `status`, `publishedAt`, `validation` d'un document existant.
2. `validation.statut == validee` gèle tous les champs métier.
3. `rejetee` archive et n'écrit rien d'autre.
4. Identifiant Firestore dérivé de `url_source` : deux moteurs, un document.
5. Fichiers de verdicts écrits uniquement par `validation.py`, jamais par un outil automatique.
6. **Nouveau** : l'import envoie uniquement les champs d'une liste blanche ; un champ inconnu dans une fiche fait
   échouer l'import à blanc (protège contre l'oubli de mise à jour de `CHAMPS_HUMAINS` / `CHAMPS_METIER`).
7. **Nouveau** : ordre de priorité explicite et testé : verdict humain > connecteur > modèle local.
8. **Nouveau** : toute modification de `CONSIGNE` incrémente `VERSION_CONSIGNE` (déjà prescrit) ; une fiche
   produite avec une version antérieure n'est jamais réimportée par-dessus une fiche `validee`.

### Modules

1. `collecte-registre` : annuaires, registre, sonde (`annuaires.py`, `registre.py`).
2. `collecte-decouverte` : découverte, qualification, verdicts émetteurs (`decouverte.py`, `qualification.py`).
3. `collecte-extraction` : textes datés, connecteurs, modèle local (`extraction_locale.py`, `run.py`, `extractor.py`).
4. `validation` : écrans locaux et fichiers de verdicts (`validation.py`).
5. `import` : `import_to_firestore.py`, migrations, sauvegardes.
6. `app-consultation` : recherche et fiche publiques.
7. `app-admin` : connexion, liste des AAP par statut de validation, actions de publication.
8. Gelés : `app-porteur`, `app-financeur`, `app-candidatures`, `app-messagerie`, `paiement`, `functions`.

### Conventions

Celles de `CLAUDE.md` restent (français sans emojis, OpenSpec obligatoire, preuve avant affirmation, zéro
dépense sans accord). Ajouts :

- `sources/` contient uniquement des données de référence ou des décisions humaines, toutes versionnées.
- `results/connecteurs/` est le seul dossier lu par l'import global ; `results/essais/` ne l'est jamais.
- Un fichier de verdicts est nommé par l'objet jugé : `verdicts_emetteurs.json`, `verdicts_fiches.json`.
- Toute fiche IA porte `moteur`, `modele`, `version_consigne`, `produite_le`, `collecte_le`, quel que soit le moteur.
- Chaque test d'import porte le nom de la règle qu'il protège (« un document archivé reste archivé après réimport »).
- Côté application : tout accès Firestore passe par `src/services/` ; aucune page n'appelle Firestore directement
  (à confirmer que c'est déjà le cas).
- Un changement OpenSpec par lot ou par sous-lot ; chaque tâche cochée avec sa preuve ; vérification finale par
  Monsieur DUCOUT.

### Ce qu'il ne faut pas construire maintenant

- Comptes porteur, candidatures, évaluation financeur, messagerie, notifications, calendrier, statistiques,
  recommandations, recherches sauvegardées avec alertes.
- Cloud Functions, Storage, Stripe, Sentry (initialisation), portail client.
- Écran d'édition de fiche dans l'application (l'outil local suffit à un opérateur).
- Blocs `source` / `proposition` / `affichage` dans Firestore (les règles d'import suffisent).
- Migration de base (Firestore reste).
- Extraction des 533 liens PDF, Word, Excel (lot 3).
- Toute stack serveur (FastAPI, PostgreSQL, Next.js : interdit par `CLAUDE.md`).

## 4. Arbitrages

| Décision | Options | Recommandation | Justification | À trancher par |
|---|---|---|---|---|
| A1 Périmètre du MVP | (a) consultation publique fiable et à jour ; (b) a + comptes porteur avec alertes ; (c) plateforme complète actuelle | (a) | (a) teste la valeur centrale avec le code existant ; (b) exige un backend d'envoi d'e-mails (Functions, donc Blaze) ; (c) est codé mais non fonctionnel et sans utilisateur. | Monsieur DUCOUT (Q1) |
| A2 Visibilité des fiches non relues | masquer jusqu'à validation ; afficher avec mention et lien officiel ; afficher sans distinction | Afficher avec mention, lien officiel en évidence, date de collecte, filtre « relues seulement » | Masquer réduit le catalogue aux fiches des connecteurs plus celles validées, tant que la validation n'a pas rattrapé l'extraction ; afficher sans distinction trahit le lecteur. La mention coûte une ligne et préserve l'exhaustivité. | Monsieur DUCOUT (Q2) |
| A3 Modèle d'extraction | modèle local seul ; API avec un modèle plus petit que sonnet ; mixte (local pour le tri « est-ce un appel ? », API pour l'extraction) | **Tranché : mesure autorisée sur l'échantillon, plafond 5 euros** ; mixte ensuite seulement si le modèle API atteint le seuil 20/2 et après nouvel accord | Le local coûte 0 euro mais 20 à 25 % de fiches à corriger à la main (CDC §12) et 69 s par fiche. Le tri oui/non est la partie que le local fait bien (22 s par refus) ; l'extraction est la partie où il échoue. Prix d'un modèle API plus petit : à confirmer avant lancement. | Tranché par Monsieur DUCOUT (Q3) ; passage global = nouvel accord |
| A4 Base de données | garder Firestore ; migrer vers une base relationnelle hébergée | Garder Firestore | 341 documents, application écrite, pas de refonte. Un seul point d'accès (`aapService.ts`) garde la porte ouverte. | Claude Code applique ; revue au lot 3 |
| A5 Hébergement | Netlify + Firebase gratuit (actuel, à confirmer) ; Firebase Hosting | Garder, après confirmation que le déploiement et le projet Firebase sont actifs | Aucun coût, aucune migration. | Monsieur DUCOUT confirme l'état (Q5) |
| A6 Inscription publique | ouverte ; fermée tant que le volet comptes est gelé | Fermée (route retirée) | Évite toute collecte de données personnelles sans AIPD ni pages légales ; l'admin se connecte par `/login`. | Monsieur DUCOUT (Q5) |
| A7 Niveau de sécurité initial | corriger toutes les règles Firestore ; corriger `aap` et `users`, verrouiller le reste | Corriger `aap` et `users` avec tests émulateur, verrouiller le reste en écriture | Les autres collections sont gelées ; les tester maintenant coûte du temps pour du code inutilisé. | Claude Code applique |
| A8 Fiche sans date de clôture | échéance fictive à un an (actuel) ; `deadline` nullable avec affichage « non précisée » | **Tranché : nullable** | Plus de donnée inventée en base. Modifie le type `AAP` : ce rapport et la réponse de Monsieur DUCOUT constituent l'exigence explicite requise par `CLAUDE.md`. | Tranché par Monsieur DUCOUT (Q4) |
| A9 49 fiches des connecteurs sans date | laisser en brouillon ; publier (source fiable, pas de badge) | Laisser en brouillon et les valider en priorité à la main | Source fiable mais une date manquante peut cacher une clôture passée. 49 verdicts, c'est une heure de travail. | Monsieur DUCOUT (Q6) |
| A10 Veille : fréquence et règle de non-revu | hebdomadaire ; quotidienne ; non revu après N rejeux → `a_corriger` ou clôture automatique | Hebdomadaire ; non revu après deux rejeux → `a_corriger` avec commentaire, jamais de clôture automatique | Les robots tournent depuis la box domestique, un site à la fois (CDC §11) : une passe hebdomadaire est tenable. Une page déplacée ne signifie pas un appel clos ; la décision reste humaine. | Monsieur DUCOUT (Q7) |
| A11 Liens PDF, Word, Excel (533) | ignorer ; extraire le texte des PDF avant extraction | Reporter au lot 3 | Le texte web suffit à prouver la valeur ; l'extraction PDF ajoute une dépendance et des cas d'échec. | Monsieur DUCOUT |
| A12 Blaze | maintenir le refus ; activer avec plafond | Maintenir le refus tant qu'il n'y a pas d'utilisateur externe | Aucune fonction du MVP n'en a besoin. | Monsieur DUCOUT |
| A13 Données sensibles | aucune au MVP (comptes fermés) ; AIPD avant le lot 4 | Aucune au MVP | Les fiches d'appels sont publiques (CDC §11). | Claude Code applique |

## 5. Plan de développement par lots

| Lot | Objectif | Contenu | Données concernées | Tests de validation | Dépendances |
|---|---|---|---|---|---|
| **0 Assainissement** | Poser les fondations sans rien ajouter de visible | Geler le volet transactionnel (routes retirées, inscription fermée) ; `validation.statut` source unique, étiquette dérivée ; bloc `validation` dans le type `AAP` avec `par` ; liste blanche de champs à l'import ; verdicts humains déplacés dans `sources/` et versionnés ; règles Firestore `aap` et `users` corrigées, autres collections verrouillées ; journal d'import ; `deadline` nullable et migration des échéances fictives ; `results/connecteurs/` et `results/essais/` | Aucune donnée nouvelle ; migration une fois des fichiers de verdicts et des échéances fictives (sauvegarde JSON avant) | `pytest` collecte et scripts verts ; cinq tests de l'audit écrits et verts ; tests de règles sur l'émulateur ; `npm run build` et `lint` verts ; `--dry-run` produit le même résultat avant et après ; une fiche `validee` réimportée est inchangée (preuve par lecture) | Aucune |
| **1 MVP consultation fiable** | Un visiteur trouve un appel exact et sait s'il est relu | Terminer l'extraction (1 116 textes) ; valider les fiches publiées (verdicts) ; mention « non relue » + lien officiel + date de collecte sur la fiche et dans la liste ; filtre « relues seulement » ; administration : liste par `validation.statut` avec compteurs ; `territoriesEligible` « non précisé » | `sources/verdicts_fiches.json` ; Firestore `validation`, `status` | Mesure sur 30 fiches validées : taux de champs faux et temps moyen par verdict (chiffres à consigner) ; 0 fiche publiée sans verdict ni mention ; recherche et fiche fonctionnelles sur `http://localhost:3000/aap/search` sans compte ; vérification manuelle par Monsieur DUCOUT | Lot 0 |
| **2 Fraîcheur** | La liste reste vraie dans le temps | Date de collecte en en-tête des textes et `collecte_le` dans les fiches ; `derniereVueLe` à l'import ; rejeu hebdomadaire de la collecte sur les pages validées (lancement manuel ou planifié sur le poste, à trancher) ; règle « non revu après deux rejeux → `a_corriger` » ; rapport de veille (nouvelles, disparues, modifiées) | `scrape_metadata`, `scrapeMetadata.derniereVueLe`, `validation.statut` | Rejeu sur 20 émetteurs : une fiche disparue passe `a_corriger`, une fiche `validee` reste intacte, une fiche nouvelle est importée, une fiche inchangée ne crée pas de doublon | Lot 1 |
| **3 Couverture et robustesse** | Plus d'émetteurs, moins de corrections manuelles | Verdicts de pages par identifiant d'émetteur ; dédoublonnage du registre ; 577 émetteurs sans page validée par vagues ; décision modèle API après mesure sur l'échantillon ; convergence des `scrape_metadata` des connecteurs ; liens PDF (si tranché) ; revue du choix Firestore si volume ou recherche l'exigent | registre, `verdicts_emetteurs.json`, fiches | Mesure avant/après sur l'échantillon (20/2) ; nombre de pages validées ; taux de champs faux sur 30 nouvelles fiches | Lot 2 |
| **4 Comptes porteur minimal** | Un porteur sauvegarde une recherche et reçoit les nouveautés | Réactiver inscription, profil, recherches sauvegardées ; alertes (exige Functions, donc Blaze, ou une alternative à trancher) ; pages légales ; AIPD | `users`, `porteurProfiles`, `savedSearches` | Règles Firestore testées pour ces collections ; champs formulaire alignés sur les types par schémas partagés ; essai de 14 jours effectivement expiré | Lot 3 et décision Blaze |
| **5 Financeur, candidatures, paiement** | Non planifié | Reporté sans date | | | Lot 4 et premiers utilisateurs |

## 6. Instructions pour Claude Code

Chaque instruction s'applique telle quelle, dans un changement OpenSpec, avec preuve et vérification finale
par Monsieur DUCOUT. Aucune dépense, aucun `git push`, aucune suppression sans accord.

### BLOQUANT (lot 0)

1. Ne modifier aucun fichier des modules porteur, financeur, candidatures, messagerie, notifications,
   calendrier, statistiques, recommandations, Stripe, Cloud Functions, Storage avant la validation du lot 2.
   Critère : aucun de ces fichiers n'apparaît dans les changements OpenSpec des lots 0 à 2.
2. Retirer du routage (`app/src/App.tsx`) les routes de ces modules et la route `/signup` ; conserver `/`,
   `/login`, `/aap/search`, `/aap/:aapId`, `/admin`, `/admin/aaps`, `/admin/utilisateurs`. Le code des pages
   reste dans le dépôt. Critère : `npm run build` passe ; les routes retirées affichent la page 404.
3. Faire de `validation.statut` la seule source de vérité de la fiabilité d'une fiche. L'étiquette `a-verifier`
   est calculée à l'import depuis `validation.statut` (présente si `proposee` ou `a_corriger`). `a_relire`
   cesse d'être un marqueur indépendant. Critère : test « une fiche `validee` ne porte jamais l'étiquette
   `a-verifier` après import ».
4. Ajouter `validation` (`statut`, `commentaire`, `date`, `par`) au type `AAP` de `app/src/types/index.ts` et
   renseigner `par` à l'import (valeur : le relecteur des verdicts, « Monsieur DUCOUT »). Cette instruction
   constitue l'exigence explicite requise par `CLAUDE.md`.
5. Rendre l'import strict : liste blanche des champs envoyés à Firestore ; tout champ d'une fiche hors de cette
   liste fait échouer `--dry-run` avec un message nommant le champ. Critère : test avec une fiche contenant un
   champ inconnu.
6. Écrire et faire passer les cinq tests de l'audit : document archivé inchangé après réimport ; verdict
   `validee` protège les champs métier ; verdict `rejetee` empêche la publication ; `url_validee` jamais écrite
   par `annuaires.py` ni `registre.py` ; deux moteurs, un seul document pour un même `url_source`.
7. Déplacer `results/validation_pages.json` et `results/validation_liens.json` dans `sources/` par une migration
   rejouable une fois ; les versionner ; mettre à jour les chemins dans `validation.py`. Critère : `git status`
   montre les deux fichiers suivis ; `validation.py --appliquer-pages` donne le même résultat qu'avant.
8. Corriger `app/firestore.rules` pour `aap` (actions admin : publier, clôturer, archiver, supprimer) et `users`
   (actions admin : suspendre, activer) ; mettre les collections gelées en écriture interdite ; écrire des tests
   de règles sur l'émulateur Firestore pour ces deux collections. Critère : tests verts ; règles déployées
   après accord de Monsieur DUCOUT.
9. Rendre `deadline` nullable dans le type `AAP` (`app/src/types/index.ts`) et dans la contrainte « deadline
   obligatoire » de `application_spec.json` ; l'import n'écrit plus d'échéance fictive (valeur `null`) ; la fiche
   sans date entre toujours en `draft` avec `validation.statut = a_corriger` et l'étiquette `sans-date-cloture`
   (règle 4 du CDC conservée) ; la recherche et la fiche affichent « Date de clôture non précisée » et classent
   ces appels après les appels datés ; la mention « Clôturé » n'est jamais affichée pour une date nulle. Migrer
   une fois les documents existants portant `sans-date-cloture` (échéance fictive → `null`), après sauvegarde
   JSON et essai à blanc. Dans l'administration, le bouton « publier » reste disponible seulement après verdict
   humain (`validation.statut` différent de `a_corriger` et de `proposee`). Critère : test d'import « fiche sans
   date → deadline null, draft, a_corriger » ; `npm run build` et `lint` verts ; vérification visuelle sur
   `/aap/search` avec une fiche sans date.

### MAJEUR (lots 1 et 2)

10. Ajouter une ligne d'en-tête datée aux textes collectés et le champ `collecte_le` dans `scrape_metadata`
    des fiches des deux moteurs ; reporter `collecteLe` et `derniereVueLe` dans `scrapeMetadata` à l'import.
    Critère : chaque fiche produite après ce changement porte les deux dates.
11. Afficher, sur la fiche et dans la liste de recherche, pour tout AAP dont `validation.statut` vaut
    `proposee` ou `a_corriger` : la mention « Informations extraites automatiquement, non relues. Vérifiez sur
    la page officielle », le lien `externalUrl` en évidence et la date de collecte. Ajouter un filtre
    « fiches relues seulement » (statut `validee` ou source connecteur). À appliquer si la réponse à Q2 est
    « afficher ». Critère : vérification visuelle sur `/aap/search` et `/aap/:id`.
12. Dans `/admin/aaps`, filtrer et compter par `validation.statut` ; afficher `validation.commentaire`.
    Critère : les compteurs correspondent à `--dry-run`.
13. Écrire dans l'import l'ordre de priorité « verdict humain > connecteur > modèle local » et le tester avec
    trois fiches de même `url_source`.
14. Ajouter un journal d'import en fichier (date, nombre de documents créés, mis à jour, ignorés car clos,
    archivés par verdict, refusés par liste blanche). Critère : une ligne par exécution, y compris à blanc.
15. Créer un script de sauvegarde planifiable de la collection `aap` en JSON dans `scripts/sauvegardes/`
    (dossier ignoré par Git) à partir du script existant. Critère : exécution à blanc puis réelle, fichier daté.
16. Implémenter le rejeu de collecte sur les pages validées avec la règle « fiche non revue après deux rejeux →
    `validation.statut = a_corriger`, commentaire "non revue depuis <date>" », sans clôture automatique.
    Critère : test sur 20 émetteurs décrit au lot 2.
17. Mesure d'un modèle API autorisée sur l'échantillon seulement (45 textes, seuil 20 justes / 2 fabriquées),
    avec un plafond de 5 euros : avant de lancer, écrire dans le changement OpenSpec le nom du modèle, son prix
    unitaire vérifié et le coût estimé ; arrêter si le journal `logs/extraction_costs.jsonl` dépasse 5 euros.
    Tout passage au-delà de l'échantillon exige un nouvel accord explicite de Monsieur DUCOUT. Critère : coût
    réel consigné dans le journal et reporté dans `ECHANTILLON.md` avec le résultat contre le seuil.
18. Converger `scrape_metadata` des connecteurs sur celui du modèle local : `moteur`, `modele`, `produite_le`,
    `version_consigne`. Critère : test de schéma commun aux deux moteurs.
19. Migrer les verdicts de pages vers `sources/verdicts_emetteurs.json`, clé = identifiant d'émetteur, adresse
    jugée en attribut ; conserver les verdicts orphelins dans une section « sans émetteur » pour revue.
    Critère : 0 verdict perdu (compte avant = compte après, orphelins inclus).

### MINEUR

20. Remplacer la valeur par défaut `["france"]` de `territoriesEligible` par `["non-precise"]` et afficher
    « Territoire non précisé » ; le libellé brut reste dans `tags`.
21. Scinder `results/` en `results/connecteurs/` (seul dossier lu par l'import global) et `results/essais/`.
22. Mettre à jour `docs/FLUX_DONNEES.md` et `docs/application_spec.json` à la fin de chaque lot.
23. Dédoublonner le registre par adresse (Île-de-France, Drôme) et signaler le verdict FIRAH pour revue humaine.
24. Rédiger des pages légales minimales (mentions légales, confidentialité) avant toute réouverture de
    l'inscription ; contenu fourni par Monsieur DUCOUT.
25. Ne pas initialiser Sentry ni remplacer les `alert()` avant le lot 4.

## 7. Questions validées par Monsieur DUCOUT (2026-10-14)

Les huit questions ont été posées et tranchées. Claude Code applique les réponses ci-dessous sans les
rediscuter ; toute question nouvelle est posée à Monsieur DUCOUT avant d'agir.

**Q1. Le MVP est-il la consultation publique fiable et à jour, sans compte ?**
Importance : fixe le périmètre de tous les lots et justifie le gel de deux tiers du code.
**Réponse : oui, consultation seule.** Le volet comptes, candidatures, financeur et paiement est gelé jusqu'au lot 4.

**Q2. Les fiches non relues restent-elles visibles du public, avec mention et lien officiel ?**
Importance : conditionne l'instruction 11 et la taille du catalogue visible pendant la phase de validation.
**Réponse : visibles avec mention**, lien officiel en évidence, date de collecte, filtre « relues seulement ».
L'instruction 11 s'applique.

**Q3. Autorisez-vous une mesure d'un modèle API plus petit sur l'échantillon de 45 textes, avec un plafond de
dépense ?**
Importance : décide si l'extraction reste au modèle local ou passe à un mode mixte.
**Réponse : oui, plafond de 5 euros, sur l'échantillon seulement.** Prix du modèle à vérifier et à écrire dans
le changement OpenSpec avant lancement ; tout passage global exige un nouvel accord (instruction 17).

**Q4. Pour une fiche sans date de clôture : garder l'échéance fictive ou rendre `deadline` nullable ?**
Importance : la seconde option touche le type `AAP` et l'affichage.
**Réponse : rendre `deadline` nullable.** Cette réponse constitue l'exigence explicite de modification du type
`AAP` au sens de `CLAUDE.md` (instruction 9).

**Q5. Le déploiement Netlify et le projet Firebase `aapi-11bc3` sont-ils actifs, et l'inscription est-elle
accessible publiquement aujourd'hui ?**
Importance : si oui, des données personnelles peuvent être collectées sans AIPD ni pages légales.
**Réponse : non vérifié par Monsieur DUCOUT.** Claude Code applique la valeur par défaut : considérer
l'inscription comme publique et retirer la route `/signup` en priorité au lot 0 (instruction 2). Claude Code
vérifie l'état réel du déploiement (`app/firebase.json`, configuration Netlify si présente dans le dépôt) et le
consigne dans le compte rendu du lot 0, marqué « Vérifié » ou « Non vérifié ».

**Q6. Les 49 fiches des connecteurs sans date de clôture restent-elles en brouillon jusqu'à un verdict humain ?**
Importance : règle du 2026-10-14 marquée « à confirmer » dans le CDC.
**Réponse : oui, en brouillon, à valider en priorité.** La règle du 2026-10-14 est confirmée ; retirer la mention
« à confirmer » correspondante dans `CAHIER_DES_CHARGES_APPLICATION.md` et `application_spec.json`.

**Q7. Fréquence de rejeu de la collecte et sort d'une fiche non revue ?**
Importance : définit la veille, fonction centrale du lot 2.
**Réponse : hebdomadaire ; « à corriger » après deux rejeux sans la revoir ; jamais de clôture automatique**
(instruction 16).

**Q8. Les 533 liens PDF, Word, Excel sont-ils reportés au lot 3 ?**
Importance : environ un cinquième des liens repérés ; les traiter ajoute une dépendance et des échecs.
**Réponse : oui, reportés au lot 3.** Aucun traitement de fichier PDF, Word ou Excel aux lots 0 à 2.

Vérifié : contenu des quatre documents fournis. Non vérifié ou supposé : état du code, du déploiement Netlify, du
projet Firebase, prix des modèles API, existence d'une sauvegarde Firestore sur le plan gratuit, unicité du point
d'accès `aapService.ts`.

## 8. Réponses données au lot 0 (2026-10-14, hors section 7)

Questions posées par Claude Code dans le plan du changement `lot-0-assainissement` et tranchées par Monsieur DUCOUT
le 2026-10-14 (accord sur les recommandations), consignées ici pour que ce rapport reste la référence unique.

- Pages légales gabarit (`/cgu`, `/confidentialite`, `/mentions-legales`) : conservées dans le routage du MVP.
- Liens « Créer un compte » (sept sur l'accueil, un sur la connexion) : retirés ; l'accueil garde le lien
  « Voir les appels à projets » de l'en-tête.
- Trois fichiers gelés qui ne compilent plus avec `deadline` nullable (`CalendarPage`, `RecommendationsPage`,
  `MyAapPage`) : exclus de la compilation dans `tsconfig.json`, non modifiés (instruction 1 respectée) ; à réintégrer au
  lot 4. Fichier considéré comme gelé en plus de la liste de l'instruction 1 : `SignupPage.tsx` (inscription).
- Journal d'import (instruction 14) et scission `results/connecteurs/` / `results/essais/` (instruction 21), cités dans
  le tableau du lot 0 : exclus du lot 0, reportés conformément à la mission « instructions 1 à 9 et 17 ».
- Étiquette « À vérifier » dérivée de `validation.statut` quel que soit le moteur : appliquée à la lettre ; les fiches
  des connecteurs sans verdict portent donc le badge jusqu'à un verdict.
- Configuration ESLint absente : créée (gabarit Vite) ; les fichiers des modules gelés sont ignorés par le lint plutôt
  que corrigés ; les fichiers du MVP ont été typés (plus de `any`).
- Instruction 17 : modèle `claude-haiku-5-5`, prix vérifiés le 2026-10-14 sur la page officielle des tarifs (0,10 USD en
  entrée et 0,50 USD en sortie par million de tokens pour une requête de 100 000 tokens au plus), coût estimé 0,05 euro
  pour les 45 textes, plafond 5 euros (détail : `openspec/changes/lot-0-assainissement/design.md`, décision 9).
- Réponse Q5, état vérifié le 2026-10-14 : le site Netlify répond (code 200) et son bundle contient la route `/signup`
  et le lien « Créer un compte » (inscription accessible par l'accueil jusqu'au prochain déploiement) ; l'adresse directe
  `/signup` renvoie 404 faute de règle de redirection Netlify ; le projet Firebase `aapi-11bc3` est listé actif par la
  CLI Firebase. Non vérifié : correspondance entre le bundle déployé et le dépôt.
- Prérequis constatés : l'émulateur Firestore exige un JDK 21 (Eclipse Temurin déjà installé sur le poste, placé en tête
  du PATH pour la commande de test) ; `anthropic` et `python-dotenv`, déclarés dans `scraping/requirements.txt`,
  manquaient dans `.venv` et ont été installés ; `vitest` 2 et `@firebase/rules-unit-testing` 3.0.4 ajoutés en
  dépendances de développement (versions compatibles avec Vite 5 et firebase 10).
- Accords donnés le 2026-10-14 après le compte rendu du lot 0 : migration des verdicts (faite : 257 pages et 34 liens
  dans `scraping/sources/`, sauvegarde `scripts/sauvegardes/verdicts_2026-10-14_1514`, bilan du report inchangé) ;
  déploiement des règles Firestore (fait, « Deploy complete! », lecture publique vérifiée sur `/aap/search`) ; migration
  des 141 échéances fictives (accord donné ; l'exécution par la session a été refusée par le classificateur de sécurité
  de Claude Code ; faite par Monsieur DUCOUT depuis son terminal le 2026-10-14 : « 0 avec une echeance fictive a
  migrer ; 141 deja a null », sauvegarde `scripts/sauvegardes/echeances_2026-10-14_1523.json`). Mesure API
  (instruction 17) : accord donné le 2026-10-14 (fonds disponibles sur le compte Anthropic, budget accepté jusqu'à
  10 dollars ; plafond du rapport conservé à 5 euros). Résultat : `claude-haiku-5-5`, 40 textes traités pour 45
  adresses (les 5 textes FIRAH de la référence existent mais la rubrique FIRAH, retombée à 2 liens après sa
  redécouverte du 13 octobre, n'est plus retenue par la sélection par famille de l'échantillon ; proposition
  `[À VALIDER — Monsieur DUCOUT]` : lire les textes de l'échantillon par adresse et non par rubrique choisie, puis
  mesurer les 5 textes manquants, environ 0,003 euro), 16 fiches, 14 justes sur 15 comparées, 1 fabriquée,
  4 pages de référence refusées à tort à la question fermée (pages présentant un appel clos avec ses résultats,
  bourses SFMU) ; seuil 20 justes / 2 fabriquées non atteint, le maximum atteignable étant 19 tant que les 5 textes
  manquent ; coût réel 0,022 euro pour 56 appels (`scraping/ECHANTILLON.md`). Aucun autre appel sans nouvel accord.
- Question de Monsieur DUCOUT (2026-10-14) : le filtre « Territoire » de `/aap/search` ne renvoie rien pour Corse,
  Île-de-France ou Normandie. Constat vérifié dans le code (`SearchAapPage.tsx`) et dans Firestore (194 fiches
  publiées) : la liste déroulante propose des libellés (« Corse », « Île-de-France », « Normandie », « National »)
  alors que l'import écrit des identifiants en minuscules sans accent (`corse` 5 fiches, `ile-de-france` 23,
  `normandie` 8, `france` 107, les autres régions de 3 à 8) ; la comparaison exacte ne trouve donc jamais rien.
  Même cause pour le secteur : la liste propose dix secteurs génériques (environnement, énergie, numérique...) alors
  que toutes les fiches importées portent `["sante", "social"]` (constat P3) : « Santé » renvoie tout, les autres
  rien, et « social » n'est pas proposé ; la distinction santé / médico-social n'est pas extraite aujourd'hui. Budget :
  `budgetMin` renseigné sur 22 fiches et `budgetMax` sur 56 ; une borne saisie élimine les fiches sans montant. Hors
  lot 0 (aucune instruction 1 à 9 ne porte sur les filtres). Proposition pour le lot 1, à côté de l'instruction 11
  `[À VALIDER — Monsieur DUCOUT]` : construire les listes de filtres à partir des valeurs réellement présentes
  (identifiants des régions avec libellé d'affichage, secteurs effectifs, « Territoire non précisé » après
  l'instruction 20), et ne pas exclure d'un filtre budget les fiches sans montant connu.
- Constat après la migration des échéances (2026-10-14, deux documents relus) : les 141 brouillons sans date portent
  `validation.statut = proposee` et non `a_corriger`, trace du défaut corrigé au lot 0 (l'ancien import écrasait
  `a_corriger` par `proposee`). L'import ne réécrit jamais `validation` sur un document existant (`document_a_envoyer`),
  ils resteront donc `proposee` sans migration. Sans effet sur le public (brouillons invisibles) ni sur le bouton
  « Publier » (masqué pour les deux statuts) ; effet sur les compteurs par `validation.statut` de l'instruction 12 et
  sur le commentaire « date de cloture absente », absent. Proposition `[À VALIDER — Monsieur DUCOUT]` : migration
  unique (sauvegarde JSON, essai à blanc, accord) posant `validation = { a_corriger, « date de cloture absente »,
  date du jour, par « import (date absente) » }` sur ces 141 documents, au lot 1 avec l'instruction 12.
