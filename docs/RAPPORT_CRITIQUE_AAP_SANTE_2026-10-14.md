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
  10 dollars ; plafond du rapport conservé à 5 euros). Résultat : `claude-haiku-5-5`. Première passe : 40 textes
  traités pour 45 adresses, les 5 textes FIRAH de la référence existant mais leur rubrique, retombée à 2 liens après sa
  redécouverte du 13 octobre, n'étant plus retenue par la sélection par famille ; 14 justes sur 15 comparées. Sur
  accord de Monsieur DUCOUT le même jour, l'outil lit désormais les textes de l'échantillon par adresse
  (`fiches_par_adresse`) et les 5 textes FIRAH ont été mesurés. Résultat final : 45 textes, 21 fiches, 19 justes sur
  20 comparées, 1 fabriquée, 4 pages de référence refusées à tort à la question fermée (pages présentant un appel clos
  avec ses résultats, bourses SFMU) ; seuil 20 justes / 2 fabriquées manqué d'une fiche ; coût réel 0,03 euro pour
  66 appels (`scraping/ECHANTILLON.md`). Aucun autre appel sans nouvel accord.
- Demande de Monsieur DUCOUT (2026-10-14, après la mesure) : refaire une comparaison entre le modèle local (qwen3:8b)
  et `claude-haiku-5-5` sur 50 pages chacun, en jugeant à la fois le repérage des appels et la qualité des fiches
  (pourcentage sur 50 pages). À faire après le lot 0, dans un changement OpenSpec dédié : mêmes 50 pages pour les deux
  moteurs, verdicts de Monsieur DUCOUT par l'outil de validation, coût estimé avant tout appel (environ 0,03 euro pour
  Haiku au coût moyen constaté, 0 euro pour le modèle local) et accord écrit. Place dans les lots : à fixer par
  Monsieur DUCOUT, hors instructions 10 à 25. Plan accordé le 2026-10-14 avec une exigence : 50 pages jamais traitées
  (changement `comparaison-moteurs-50-pages`) ; les deux moteurs ont traité les 50 pages (local 24 fiches, Haiku 20,
  0,03 euro), jugement de Monsieur DUCOUT en cours.
- Question de Monsieur DUCOUT pendant ce jugement (2026-10-14) : pourquoi des appels sur l'agriculture ou d'autres
  thèmes, alors que le projet vise la santé et le médico-social ? Constat vérifié dans le code : aucune étape de la
  chaîne ne filtre le thème au niveau de la page. La découverte note les liens avec des mots d'appel à projets
  seulement (`decouverte.score_lien` : « appel à projets », « subvention », « aides », « bourse »...) ; la qualification
  écarte des sources entières (88 hors santé) mais garde les collectivités, dont les pages listent toutes leurs
  politiques ; la collecte lit tous les liens retenus ; la question fermée posée aux deux moteurs (« est-ce la fiche
  d'un appel à projets ? », consigne version 3) ne mentionne pas le champ ; l'import écrit `sectorsTargeted =
  ["sante", "social"]` en dur (constat P3) ; la validation quotidienne des fiches n'a pas de verdict « hors champ ».
  Conséquence : le passage global sur les collectivités produit des fiches hors champ marquées « à vérifier », qu'il
  n'est possible d'écarter aujourd'hui qu'en les déclarant « pas un AAP ». Pour la comparaison en cours, la question
  jugée reste « est-ce un appel ? », conforme à la consigne des deux moteurs ; les appels hors champ sont signalés
  par le commentaire « hors champ », compté dans le rapport. Propositions `[À VALIDER — Monsieur DUCOUT]` : (a) verdict
  « hors champ » dans la validation quotidienne des fiches, reporté à l'import comme rejet (immédiat, 0 euro) ;
  (b) champ `champ` (santé, médico-social, hors champ ; définition décidée par Monsieur DUCOUT le soir même : santé et
  médico-social des établissements, y compris numérique, cybersécurité CaRE ANS/ANSSI et rénovation des hôpitaux et
  cliniques, sans volet social, ni insertion par l'emploi, ni jeunesse, ni logement) décidé par une question fermée
  supplémentaire du moteur d'extraction, stocké dans `scrape_metadata`, l'import ignorant « hors champ » (Haiku : environ 0,0002 euro par
  page, moins de 1 euro pour les 2 395 pages ; modèle local possible) ; (c) à terme, mots du champ dès la découverte
  des liens. Lot : à fixer par Monsieur DUCOUT, avant toute publication des fiches de collectivités.
- Question de Monsieur DUCOUT (2026-10-14, soir) : pourquoi les efforts ne se concentrent-ils pas sur les appels de
  santé et du médico-social ? Réponse vérifiée dans les données : la chaîne choisit des sources, pas des appels. Pour
  les sources spécialisées (ARS, CNSA, INCa, Inserm, fondations de santé) le résultat est dans le champ ; pour les
  sources mixtes gardées en « rubrique confirmée » parce qu'elles publient parfois des appels du champ (collectivités,
  préfectures, DRAAF, agences de l'eau, Bpifrance, ANR, Admical, agrégateurs), tout est pris. Dans le passage global
  (783 fiches au 2026-10-14 au soir) : 17 fiches de l'agence de l'eau Seine-Normandie, 8 de Rhin-Meuse, 24 de deux
  DRAAF, 20 de deux préfectures, 10 de l'ANR, 8 de Bpifrance France 2030, 10 d'Admical, 9 d'appelaprojets.org.
  Dans les 194 fiches publiées, une trentaine sont hors champ d'après le nom du financeur (Bpifrance 8, DRAAF et
  DAAF 6, agences de l'eau 7, ministère de l'Agriculture, FEADER, FIPD, Dalloz...) : estimation par lecture des
  financeurs, non jugée fiche par fiche. Ce n'est pas un choix de priorité, c'est une étape absente du plan, que ce
  rapport n'avait pas vue. Proposition d'instruction 26, MAJEUR, lot 1 `[À VALIDER — Monsieur DUCOUT]` : (1) verdict
  « hors champ » dans la validation quotidienne, reporté à l'import comme rejet ; (2) question fermée « cet appel
  relève-t-il de la santé, du médico-social, du social, du handicap ou de l'autonomie ? » dans la chaîne d'extraction
  (modèle local à 0 euro ou Haiku pour moins de 1 euro), appliquée aussi, une fois, aux 783 fiches locales et aux
  194 fiches publiées, les fiches hors champ repassant en brouillon jusqu'au verdict ; (3) dans le registre, marquer
  les sources mixtes et revoir la qualification des sources dont presque aucune page n'est dans le champ.
- Question de Monsieur DUCOUT (2026-10-14, soir, pendant le jugement) : beaucoup de pages tirées sont sans rapport
  avec un appel ; en cherchant « <département> appel à projets » on trouve la page qui liste les appels, il faut
  l'utiliser, ouvrir chaque appel, extraire texte, PDF et montants. Réponse vérifiée : c'est bien la chaîne prévue
  (page de liste validée par lui pour 257 sources, liens de la page ouverts un à un, extraction), mais le passage
  global ouvre tous les liens de la page de liste, menus compris, alors que l'échantillon ne prenait que les mieux
  notés. Chiffres : sur 2 888 liens des 242 sources confirmées, 1 190 ont un score 0 (navigation du site) ; 516 des
  740 refus du passage global et 18 des 50 pages de la comparaison viennent de ces liens ; 165 fiches viennent
  pourtant de liens à score 0 (appels dont le texte du lien est vague : « en savoir plus »), ce qui interdit de
  filtrer par le seul score sans perte. Les PDF ne sont pas lus (exclus de la collecte), les pages de liste ne sont
  pas feuilletées (pas de pagination), et 577 sources n'ont pas encore de page de liste. Proposition d'instruction
  27, MAJEUR, lot 1 `[À VALIDER — Monsieur DUCOUT]` : (1) tout de suite, le passage global ne lit plus que les liens
  de score 3 et plus (224 des 629 textes restants évités) ; (2) lecture de chaque page de liste par le modèle, qui
  rend les entrées d'appels (titre et lien) au lieu d'un score par mots-clés, 242 pages, 0 euro en local ou environ
  0,05 euro avec Haiku ; (3) pagination des pages de liste ; (4) lecture du texte des PDF joints (bibliothèque
  locale, 0 euro) ; (5) recherche de la page de liste des 577 sources sans page par la méthode de Monsieur DUCOUT
  (requête « <nom> appel à projets »).
- Constat de Monsieur DUCOUT (2026-10-14, soir) : le tirage de la comparaison ne contenait que des pages de
  départements et aucun appel de santé. Erreur de la session, qui a appliqué « pages jamais traitées » à la lettre
  alors que seules les collectivités restaient, au lieu de s'arrêter et de le dire. Rappel du projet, dans ses mots :
  mettre en relation, entre autres, les cliniques privées et les hôpitaux publics avec les appels publiés par les
  financeurs de la santé, ARS et INCa en tête ; toute mesure doit porter sur ces appels. Second tirage le soir même :
  50 pages d'appels des financeurs de la santé (ARS 20, fondations 11, caisses 8, INCa et Inserm 5, établissements
  4, sociétés savantes 2), pages dont le texte contient un mot d'appel, les deux moteurs repassant à neuf ; premier
  tirage et ses résultats archivés sous le suffixe « collectivites ». Monsieur DUCOUT a néanmoins jugé les 50 pages
  du premier tirage (23 appels, 27 non) ; résultat (`scraping/COMPARAISON_collectivites_2026-10-14.md`) : modèle
  local, repérage 45 sur 50, qualité 19 sur 23, 3 fabrications, 2 501 s, 0 euro ; Haiku, repérage 47 sur 50,
  qualité 19 sur 23, 0 fabrication, 184 s, 0,03 euro. Même qualité de fiche, Haiku plus sûr sur le tri et treize
  fois plus rapide, mesure hors du cœur du projet. Dépense totale de la journée sur le compte Anthropic : 0,09 euro.
  Business plan (dossier IMT Starter v2) lu par la session le soir même : cibles porteurs (EHPAD, hôpitaux publics et
  privés, HAD, SSIAD, GHT, GCS, associations de santé), financeurs (18 ARS, conseils régionaux, CNSA, fondations,
  CNAV et CARSAT, Europe, ministères), promesse « ne ratez plus aucun financement pertinent », problème terrain
  numéro un : la faible pertinence des appels détectés. Les collectivités sont donc bien des financeurs à couvrir,
  mais seules leurs pages du champ comptent : le filtre du champ (instruction 26) et la précision de la collecte
  (instruction 27) sont la condition de la promesse du produit.
- Décisions de Monsieur DUCOUT (2026-10-14, nuit) : (1) les fiches sans date de clôture sont publiées, badge « à
  vérifier », affichage « Date de clôture non précisée » ; pour la logique de l'application (tri, expiration), un appel
  sans date est considéré ouvert jusqu'au 31 décembre de l'année en cours ; aucune date n'est inscrite dans la base,
  ce qui reste cohérent avec la réponse Q4 mais remplace la règle 4 conservée par l'instruction 9 (brouillon imposé
  aux fiches sans date) ; les 141 brouillons sans date existants seront publiés par une migration, sauf fiches hors
  champ. (2) Vocabulaire : « fiche » = un appel à projets résumé, résultat visible dans l'application ; « documents »
  = les pièces jointes d'un appel (cahier des charges, règlement, annexes) ; ne plus employer « document » pour une
  fiche enregistrée. (3) Accord pour classer les 916 fiches avec `claude-haiku-5-5` (0,18 euro estimé) : les fiches
  des connecteurs sont classées aussitôt, celles du passage local après la fin du passage, qui réécrit son fichier à
  chaque fiche.
- Constats de Monsieur DUCOUT (2026-10-14, 22 h 30) sur les 420 fiches publiées : régions incohérentes, appels des
  ARS non labellisés santé, filtre financeur plein de doublons, « base sale ». Mesures : 203 noms de financeurs pour
  420 fiches (ARS Île-de-France sous six orthographes), 243 territoires « france » par défaut, source « extraction_locale »
  au lieu de l'émetteur sur les fiches du passage local, 7 titres en double (14 fiches) ; le label santé manquant vient
  du classement fait pour 21 fiches seulement ce soir. Réponse : changement `nettoyage-financeurs-territoires` préparé
  (source réelle, financeur canonique par table d'alias, territoire déduit de l'émetteur et des départements, plus de
  « france » par défaut, rapport des doublons), à lancer sur son accord. Netlify : il ne regarde qu'en local, aucun
  déploiement avant que tout fonctionne. Vocabulaire : « tirage » = sélection au sort de 50 pages pour comparer les
  deux moteurs ; « second tirage » = la seconde sélection, chez les financeurs de la santé, après le premier tirage
  inutilisable.
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
  l'instruction 20), et ne pas exclure d'un filtre budget les fiches sans montant connu. Fait le 2026-10-14 au soir à
  la demande de Monsieur DUCOUT (« pouvoir les classer et les manipuler par territoire, par thématique »), changement
  `filtres-recherche` : filtres Territoire (libellés des identifiants présents), Thématique (champ santé /
  médico-social / non classée) et Financeur ; vérifié dans le navigateur sur 420 fiches publiées (Normandie 15,
  Médico-social 5, égaux aux comptes de la base).
- Constat après la migration des échéances (2026-10-14, deux documents relus) : les 141 brouillons sans date portent
  `validation.statut = proposee` et non `a_corriger`, trace du défaut corrigé au lot 0 (l'ancien import écrasait
  `a_corriger` par `proposee`). L'import ne réécrit jamais `validation` sur un document existant (`document_a_envoyer`),
  ils resteront donc `proposee` sans migration. Sans effet sur le public (brouillons invisibles) ni sur le bouton
  « Publier » (masqué pour les deux statuts) ; effet sur les compteurs par `validation.statut` de l'instruction 12 et
  sur le commentaire « date de cloture absente », absent. Proposition `[À VALIDER — Monsieur DUCOUT]` : migration
  unique (sauvegarde JSON, essai à blanc, accord) posant `validation = { a_corriger, « date de cloture absente »,
  date du jour, par « import (date absente) » }` sur ces 141 documents, au lot 1 avec l'instruction 12.
- Décisions de Monsieur DUCOUT (2026-10-14, 22 h 45), en réponse aux quatre questions du compte rendu : (1) « passage
  global » : la comparaison des moteurs s'arrête au premier résultat, l'extraction locale du second tirage est
  interrompue à la 28e page sur 50 (Haiku avait fini les 50) et la carte graphique revient au passage global ; (2) « code
  maintenant » : le changement `nettoyage-financeurs-territoires` est codé la nuit même ; (3) « fais-le » : les 24
  classements du modèle sur le premier tirage lui sont présentés pour relecture ; (4) « oui tu les retires » : les appels
  hors champ (agricole, culturel, insertion, environnement) publiés sont retirés de l'affichage, c'est-à-dire repassés en
  brouillon à corriger, pas supprimés (`scripts/migrer_champ.py`, 10 fiches, sauvegarde
  `scripts/sauvegardes/champ_publiees_2026-10-14_2251.json`).
- Nettoyage codé (2026-10-14, 23 h) : tables `scraping/sources/financeurs.json` (1 198 financeurs du registre, 1 964
  alias, nom lu par l'IA rattaché par ses mots sans accents ni mots vides, règle « ARS de la région citée ») et
  `scraping/sources/departements.json` (101 départements, anciennes régions, 61 villes), modules `financeurs.py` et
  `territoires.py`, import : source réelle, financeur canonique (`financeurExtrait` conservé), territoire déduit
  (jamais « france » par défaut, « non-precise » affiché « Territoire non précisé ») ; filtre Source dans la recherche ;
  `scripts/doublons.py`. Essai à blanc de l'import : 933 fiches lues, 390 à publier, 149 financeurs distincts (260 fiches
  au nom canonique) contre 203 pour 420 dans la base, territoires « france » 101 contre 243, « non-precise » 3,
  Île-de-France 53, Bourgogne-Franche-Comté 25, Normandie 20, Grand Est 20. Sur les fichiers de l'import, 572 fiches
  sur 932 sont rattachées à un nom canonique ; les 360 autres (267 noms : départements, DRAAF, DREETS, MSA locales,
  préfectures, fonds européens) gardent le nom lu, à rattacher à la main dans la table si besoin. Tests : scraping 86
  verts (12 nouveaux), scripts 21 verts (4 nouveaux), lint et build de l'application verts. Ré-import réel en attente
  de l'accord de Monsieur DUCOUT (tâche 2.2).
- Accord de Monsieur DUCOUT (2026-10-14, 23 h 10) : « oui vas-y pour le ré-import, les 24 sont justes ». Ré-import réel
  fait : avant, 410 fiches publiées, 201 financeurs distincts, 234 territoires « france », 359 fiches à la source
  « extraction_locale » ; après, 415 publiées (5 nouvelles fiches du passage global), 151 financeurs distincts, les 18
  ARS à une entrée chacune dans le filtre, « france » 108, « non-precise » 3, plus aucune source « extraction_locale »,
  91 sources distinctes. Les fiches closes des cinq connecteurs, que l'import courant ne relit pas, ont reçu les mêmes
  règles par un passage `--include-expired --source <connecteur>` (105 fiches, aucune création). Écran `/aap/search`
  vérifié : « 415 AAP disponibles », filtre Financeur à 151 entrées, Source à 91, Territoire à 20 dont « Territoire non
  précisé ». Rapport des doublons : 5 groupes (10 fiches), deux adresses pour un même appel (paramètres `read_more`,
  préfixe `/fr/`, deux campagnes d'une fondation), décision fiche par fiche dans la validation quotidienne. Les 24
  classements du premier tirage sont enregistrés comme verdicts de référence (`scraping/sources/verdicts_champ.json`) :
  le modèle local fait 24 accords sur 24.
- Vérification de Monsieur DUCOUT (2026-10-14, 23 h 30) : « ok j'ai vérifié les filtres, c'est bon ». Tâche 5.1 du
  changement `nettoyage-financeurs-territoires` cochée ; toutes les tâches du changement sont faites, archivage
  seulement sur sa demande.
- Archivage (2026-10-14, 23 h 35) sur demande de Monsieur DUCOUT (« Validé : archiver le changement nettoyage ») :
  `openspec archive nettoyage-financeurs-territoires`, quatre exigences ajoutées à `openspec/specs/import-aap-scrapes/`
  (source réelle, financeur canonique, territoire déduit, rapport des doublons), validation de l'ensemble : 16 éléments
  sans erreur.
- Fin du passage global (2026-10-15, 7 h 40) : 2 178 textes traités, 1 086 fiches produites (2 à relire), 1 070 pages
  refusées, 22 échecs, 28,6 h de calcul cumulé, 0 euro ; points horaires envoyés de 23 h 35 à 7 h 46 à la demande de
  Monsieur DUCOUT, PC maintenu éveillé. Décision de Monsieur DUCOUT (7 h 17) : « arrête après la fin estimée, je
  relancerai tout seul après » ; aucune étape suivante lancée (classement du champ par Haiku, ré-import,
  `migrer_champ.py`, rapport), à relancer par lui.
- Accord de Monsieur DUCOUT (2026-10-15, 8 h 20) : « ok vas-y pour haiku sur les fiches du passage local ». Essai à
  blanc : 1 086 fiches à classer, 0,207 euro estimé, cumul Haiku avant 0,134 euro, plafond 5 euros. Classement fait de
  8 h 22 à 8 h 49 : santé 312, médico-social 209, hors champ 513, incertain 52 ; 1 086 appels, 0,231 euro réel (journal
  des coûts, étape `champ`), cumul 0,365 euro. Ré-import : « AAP lus : 1191 | a importer : 529 (256 sans date publiees,
  248 hors champ en brouillon) », « 120 crees, 409 mis a jour ». Retrait des appels hors champ publiés
  (`migrer_champ.py`, sauvegarde `champ_publiees_2026-10-15_0851.json`) : 147 fiches en brouillon. Base après coup :
  569 documents, 308 publiées (santé 172, médico-social 106, incertain 29, non classée 1 ; 131 sans date ; 307 à
  vérifier), 261 brouillons dont 258 hors champ, 105 financeurs distincts. `scraping/CHAMP.md` : part dans le champ par
  source, ARS 93 à 100 %, CNSA, INCa, Fondation ARC 100 %, FHF Hauts-de-France 97 %, Fondation de France 44 %,
  collectivités 0 à 42 %, DRAAF et DREETS 0 % (sources à revoir dans le registre).
- Décisions de Monsieur DUCOUT (2026-10-15, 9 h 40) : accord pour l'étape 1 du lot 1 (question du champ posée par le
  robot au moment de la lecture, puis avertissement « non relue » pour le visiteur, instruction 11) ; accord pour
  retirer de la collecte les sources à 0 % dans le champ. Fait : 35 sources (DRAAF, DAAF, DREETS, DDETS, DRIEETS,
  préfectures, agences de l'eau, mairies, FSE+, Fondation Orange, Le Compte Asso, Avise, Interreg Sudoe, DGCOPOP
  Guyane, FNSO, conseil régional de La Réunion ; 191 fiches) passées « hors-sante » par
  `sources/relecture_qualification.json` et `qualification.py --registre --rapport` : 207 rubriques confirmées au lieu
  de 242. Gardées malgré 0 % : 30 sources que Monsieur DUCOUT a nommées comme financeurs à couvrir (conseils
  régionaux et départementaux, collectivités territoriales, ANR, Bpifrance France 2030, MSA, ministères), 86 fiches.
  Constats pour ses questions : il n'existe aucun compte administrateur (collection `users` : 3 porteurs, 1
  financeur, aucun compte à son nom ; Firebase Auth : 3 comptes), d'où un espace `/admin` jamais vu ; devis d'une
  vérification des fiches par `claude-haiku-5-5` sur les textes réels (573 fiches dans le champ, 2 708 caractères en
  moyenne) : 0,19 euro, soit 0,03 centime par fiche, 0,10 euro pour les 308 fiches publiées.
- Décisions de Monsieur DUCOUT (2026-10-15, 10 h) : accord pour la vérification des fiches assistée par Haiku
  (0,10 euro estimé sur les 308 fiches publiées, mention « relue » réservée à ses verdicts), à cadrer dans un changement
  OpenSpec ; « le lien http://localhost:3000/admin ne fonctionne pas, fais ce qu'il faut ». Constats : `/admin` renvoie
  vers `/login` (normal sans compte) ; aucun compte admin ; fournisseur Google désactivé dans Firebase (le bouton
  échoue) ; le lien « Mot de passe oublié ? » menait à la page 404. Changement `acces-administration` : script
  `scripts/creer_admin.py` (compte Firebase Auth créé sans mot de passe ou retrouvé, profil `users` avec le rôle admin,
  essai à blanc) que Monsieur DUCOUT lance lui-même, et page `/reset-password` (e-mail de réinitialisation Firebase)
  pour choisir son mot de passe : aucun mot de passe ne transite par la session. Compteurs par statut de validation
  (instruction 12) prévus dans le même changement.
- Vérification de Monsieur DUCOUT (2026-10-15, 10 h 30) : « ça y est je suis connecté je vois l'admin ». Compte
  administrateur créé par lui avec le script, mot de passe choisi par l'e-mail de Firebase, espace `/admin` ouvert.
- Contrôle des fiches par le modèle (2026-10-15, 10 h 40 à 11 h 10, changement `verification-assistee-haiku`, accord
  « 1 ok ») : essai à blanc 283 fiches publiables, 0,096 euro estimé ; réel 284 appels, 0,154 euro (le modèle a répondu
  plus long que prévu), cumul Haiku 0,52 euro. Résultat : 283 fiches contrôlées, 129 sans doute, 74 douteuses sur une
  date, un montant, le financeur, le titre ou le territoire, 80 douteuses sur la seule description (le modèle relève des
  nuances de formulation : à prendre avec prudence), 39 pages qui ne décrivent pas un appel précis selon lui. Par champ :
  dates d'ouverture 19 fausses et 22 fabriquées, dates de clôture 5 fausses et 18 manquantes, montants 10 faux,
  enveloppe 14 manquantes, titres 2 faux et 1 fabriqué. L'outil de validation présente ces fiches en premier ;
  `VERIFICATION.md` les liste ; ré-import du résumé : 529 fiches mises à jour, aucune créée.
- Décision de Monsieur DUCOUT (2026-10-15, midi) : « je t'avais demandé d'utiliser Haiku pour contrôler et valider
  toutes ces fiches [...] j'ai payé pour qu'il le fasse à ma place ». La règle du matin (« relue » réservée à ses
  verdicts) est abandonnée : le contrôle vaut relecture. Codé et testé : `verification.decision_du_modele` (validée si
  aucun doute hors description ou si les doutes portent sur des dates et montants lisibles sur la page, corrections
  appliquées ; rejetée et archivée si la page n'est pas un appel ; à corriger si doute sur titre, financeur ou
  territoire), appliqué par l'import aux nouvelles fiches et par `scripts/appliquer_controle.py` aux fiches en base.
  Essai à blanc : 278 fiches, 231 validées, 39 rejetées, 8 à corriger ; corrections : 32 dates d'ouverture, 18 dates de
  clôture, 16 enveloppes, 12 montants. Outil de validation : 6 fiches restantes sur 486. Exécution réelle à 12 h 31 sur son accord (« 1. ok ») : 278 fiches
  mises à jour, sauvegarde `controle_2026-10-15_1231.json` ; base : 270 publiées (231 validées par le modèle, 8 à corriger,
  31 proposées closes non contrôlées), 39 archivées, 38 badges « à vérifier » contre 307.
- Instruction 12 (2026-10-19, changement `acces-administration` 2.1, reprise sur « on reprend, continue ») :
  `/admin/aaps` affiche quatre compteurs cliquables par `validation.statut`, un filtre par ce statut et, sur chaque
  fiche, badge, relecteur, date et commentaire de validation. Lint et build verts. Mesure en lecture seule de la base :
  569 documents, proposée 54, à corriger 245, validée 231, rejetée 39 ; `status` : publiées 270, brouillons 260,
  archivées 39. La page exige une connexion : les compteurs à l'écran sont à comparer par Monsieur DUCOUT.
- Instruction 26, suite (2026-10-19, changement `filtre-champ-sante` 5.1) : la question du champ est posée dans la
  chaîne d'extraction par les deux moteurs, après l'extraction d'une page acceptée (consigne version 4) ; un échec de
  la question laisse la fiche « incertain » sans la perdre ; `champ.py --classer` devient un rattrapage. Tests scraping
  95 verts ; preuve sur un texte réel en local (voir `tasks.md`, 5.1). Documentation (6.1) faite.
