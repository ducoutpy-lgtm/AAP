# Proposal

## Why

Le 2026-10-27, Monsieur DUCOUT a transmis quatre publications LinkedIn et demandé si la veille avait trouvé ces appels.
Contrôle de la session (registre, résultats de découverte, recherche « denys », « gerondif », « novap » dans tout le
dépôt) : aucun des trois appels de santé n'était connu.

| Appel | Date limite | Pourquoi il manquait |
|---|---|---|
| Appel à innovations novap 2026 (fonds de dotation de la FEHAP) | 31 octobre 2026 | La FEHAP est au registre avec sa page d'accueil ; la découverte du 2026-10-09 n'y a vu aucun lien d'appel. L'appel est sur un autre site (`novap.fehap.fr`) qui n'en publie qu'un : la découverte exige deux liens d'appel sur une page. |
| Appel Tubbe de Gérond'if (EHPAD d'Île-de-France) | 6 novembre 2026 | Gérond'if n'est pas au registre (aucune famille « gérontopôles »). La page de l'appel n'est reliée ni au menu ni à la page d'accueil (43 liens lus le 2026-10-27, aucun vers l'appel) : seul le lien LinkedIn y mène. |
| Prix 2026-2027 de la Fondation Béatrice Denys | 22 novembre 2026 (lettres d'intention) | Fondation abritée par la FRM, absente du registre (famille « fondations abritées » non mesurée). La page FRM des programmes ne la cite pas ; l'appel 2026-2027 n'est publié qu'en PDF (relais LinkedIn de Turenne Santé). |

La quatrième publication (don d'Amazon au Bureau des affaires spatiales de l'ONU) n'est pas un appel à projets : son
absence est normale.

Deux causes tiennent au code et se corrigent ici ; elles rejoignent le chantier « Pages à un seul appel » inscrit le
2026-10-23 dans `docs/FEUILLE_DE_ROUTE.md` (l'ANAP est sautée pour la même raison). Les familles manquantes du registre
font l'objet d'un changement suivant.

## What Changes

- **Seuil d'une seule page validée** : quand l'adresse d'une source a été donnée ou validée par un humain (`url_validee`
  du registre), la découverte et la veille la retiennent dès un lien d'appel, au lieu de deux. Pourquoi : le seuil de
  deux protège des pages d'accueil où un seul lien contient le mot « appel » par hasard ; une page validée à la main n'a
  pas ce risque.
- **Page qui est elle-même l'appel** : champ facultatif `page_appel: true` au registre. La page validée devient son
  propre lien (son texte est collecté puis extrait comme les autres) et la veille la relit chaque semaine. Pourquoi : la
  page Tubbe n'a aucun lien vers un autre appel ; aucun seuil ne la ferait retenir.
- **Registre** : `url_validee` de la FEHAP vers `https://novap.fehap.fr/` ; Gérond'if ajouté avec sa page d'appel ; la
  Fondation Béatrice Denys inscrite (statut « identifiée ») avec la raison pour laquelle elle ne peut pas encore être
  suivie.
- **Relais de la Fondation Béatrice Denys** (ajout du 2026-10-27, demande de Monsieur DUCOUT : « peu importe que ce soit
  sur le site web en lui-même ou un autre site web qui relaie, il faut que ça s'ajoute ») : au 2026-10-27, aucune page
  web ne publie l'édition 2026-2027 (contrôle de Turenne, FRM, cancéropôles CLARA et PACA, Eurasanté, Biotech Santé
  Bretagne, UPEC, Paris-Saclay). Sont inscrits les cinq sites dont la page de liste a déjà diffusé une édition : Turenne
  Groupe (actualités ; la fondation est gérée chez Turenne), Cancéropôle CLARA, Cancéropôle PACA, Eurasanté, Biotech Santé
  Bretagne. Pourquoi des relais plutôt que la FRM seule : la FRM n'a jamais listé ce prix sur sa page des programmes ;
  ces cinq pages l'ont fait. La veille hebdomadaire les relit : l'appel entrera dès que l'un d'eux le publiera.
- Hors périmètre : familles complètes « gérontopôles », « cancéropôles » et pôles de compétitivité santé, lecture des
  publications LinkedIn (interdite par les conditions du site), lecture des PDF d'appel, doublon
  `fehap` / `fehap-appels-a-projets` (signalé, non supprimé).

## Capabilities

### Modified Capabilities

- `decouverte-rubriques-aap` : seuil d'un lien pour une page validée ; page qui est elle-même l'appel.
- `registre-sources` : champ facultatif `page_appel`.

## Impact

- Code : `scraping/decouverte.py`, `scraping/rejeu.py`, `scraping/registre.py` (contrôle du champ), tests associés.
- Coût : zéro euro pour le code, la découverte et la collecte. L'extraction des textes nouveaux par Haiku (environ
  trois textes, de l'ordre de 0,01 euro) n'est lancée qu'après devis écrit et accord de Monsieur DUCOUT, avec
  `--plafond`.
