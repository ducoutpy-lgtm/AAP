# Tasks

Accord de Monsieur DUCOUT du 2026-10-21 (« 2 ok »). Zéro euro. Règles : aucun `git push`, aucun archivage sans demande.

- [x] 1.1 Test `test_extraire_liens_lit_le_shadow_dom` dans `tests/test_decouverte.py` : page HTML locale (`data:` ou
  `page.set_content`) avec un lien ordinaire et un lien dans un shadow root ouvert ; le test échoue avec le code actuel.
  Fait quand : pytest rouge collé. (Fait le 2026-10-21 : page servie par `page.route` sous https://exemple.test ; rouge : `assert '.../s/article/appel-a-projets-achats-innovants' in ['https://exemple.test/ordinaire']`.)
- [x] 1.2 `decouverte.extraire_liens` par `page.locator(sel).evaluate_all`, même forme de résultat. Fait quand : pytest
  vert (tout `tests/test_decouverte.py` et `tests/test_rejeu.py`), sortie collée. (Fait le 2026-10-21 : `14 passed in 3.00s`.)
- [x] 1.3 Redécouverte `decouverte.py --ids anap --forcer --garder-depart`, puis `--rapport` : nombre de liens lus et
  statut collés ; `registre.py --tableau`. (Fait le 2026-10-21 : « aucune-rubrique ANAP » (un seul lien d'appel, il en faut deux) ; mesure par `decouverte.lire_page` : « liens lus : 27 (hors navigation : 11) ; liens d'appel : 1 » avec le lien Achats innovants, contre 14 liens lus avant ; `DECOUVERTE.md` régénéré ; registre inchangé, tableau non refait.)
- [x] 1.4 Documentation : `scraping/README.md` (section découverte : shadow DOM), `scraping/CHANGELOG.md`, `CLAUDE.md`. (Fait le 2026-10-21.)
- [ ] 2.1 Vérification par Monsieur DUCOUT : il relance la commande de 1.3 et lit le nombre de liens affiché.
