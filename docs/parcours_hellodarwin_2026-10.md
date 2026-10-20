# Parcours helloDarwin : relevé pour AAP Santé

Relevé fait le 2026-10-20 par la session, dans le navigateur de Monsieur DUCOUT, sur un compte de test
(app.hellodarwin.com, plateforme québécoise de recherche de subventions). But : s'inspirer de l'enchaînement, des
écrans et de la logique des menus pour AAP Santé. Ce qui est repris : la structure, l'ordre des questions, l'ergonomie.
Ce qui n'est pas repris : les textes mot à mot, le logo, les illustrations, le nom des produits. Captures dans
`docs/captures_hellodarwin/`.

Légende des colonnes « Pour AAP Santé » : **Reprendre** (à transposer tel quel au contexte santé), **Adapter** (idée
utile, forme à revoir), **Écarter** (hors sujet ou payant chez eux). Monsieur DUCOUT coche ce qu'il garde.

## 1. Parcours d'intégration (après création du compte)

Barre de progression en haut du formulaire, formulaire à gauche, carrousel de promesses à droite (quatre
diapositives : « Explorez les bonnes subventions », « Débloquez vos subventions grâce à l'IA », « Analysez votre
compétition », « Maximisez vos acceptations avec des guides d'experts », plus « Ne manquez aucune opportunité »).

| Étape | Écran | Champs et choix | Pour AAP Santé |
|---|---|---|---|
| 0 | Accueil « Bienvenue » (capture 01) | Texte d'accroche, bouton « Découvrir mon potentiel », case « J'accepte les conditions générales » | Reprendre : accueil en une phrase, un seul bouton, acceptation des CGU ici plutôt qu'à l'inscription |
| 1, 33 % | « Qui obtiendra les fonds ? » (capture 02) | Nom de l'organisation ; Forme juridique (liste : coopérative financière, coopérative non financière, entreprise à but lucratif, entreprise d'économie sociale, entreprise individuelle, OBNL, institution publique ou parapublique) ; Ville (saisie assistée Google, adresse complète dépliable) | Reprendre avec nos formes : établissement public de santé, ESPIC, association, fondation, GCS, collectivité, entreprise, CPTS, MSP ; ville avec code postal, région déduite |
| 2, 67 % | « Qui obtiendra les fonds ? », suite, écran différent selon la forme juridique (ici OBNL, capture 03) | Revenus approximatifs (500K ou moins, 500K-1M, 1M-2M, 2M-5M, 5M-10M, 11M-25M, 25M-50M...) ; Taille (1, 2-10, 11-25, 26-50, 51-100, 101-300, 300+ employés) ; Secteurs d'opération (liste longue, choix multiple, étiquettes) ; Structures de revenu (100 % dons/subventions, rémunération à l'acte, revenus mixtes) ; Groupes ciblés (milieu universitaire, artistes, entrepreneurs, enfants et jeunes, grand public, peuples autochtones...) | Adapter : type d'établissement (MCO, SSR, EHPAD, SSIAD, HAD, IME, ESAT...), taille en lits ou en ETP, budget annuel, publics accueillis (personnes âgées, handicap, enfance, précarité, santé mentale...), domaines d'intervention |
| 3 | Offres (capture 04) | Trois colonnes : Gratuit 0 $, Pro 199 $/mois « plus populaire », Expert 1 199 $/mois « pour les consultants » ; bascule mensuel / annuel (-20 %) ; liste des fonctionnalités par offre ; « Continuer gratuitement » | Adapter : notre grille (essai 14 jours, abonnement) sur le même gabarit à trois colonnes ; prix à fixer par Monsieur DUCOUT |
| Fin | Tableau de bord | Le profil est créé, les filtres de recherche sont pré-remplis avec les réponses | Reprendre : les réponses du parcours deviennent le profil et les filtres par défaut |

Observations : trois écrans seulement avant d'entrer ; chaque champ a une icône à gauche de son libellé ; les champs
obligatoires portent un astérisque rouge et un message sous le champ en cas d'oubli ; boutons « Retour » à gauche et
« Suivant » à droite, « Suivant » grisé tant que l'étape n'est pas complète.

## 2. Menus de l'application connectée

Barre latérale gauche repliable, icône plus libellé, cadenas sur les entrées payantes ; en haut à droite un bouton
« Voir nos plans » et le menu du compte (Préférences, Déconnexion).

| Menu | Contenu observé | Pour AAP Santé |
|---|---|---|
| Tableau de bord (capture 05) | « hello, prénom » ; six tuiles d'entrée (explorer, ne rien manquer, discuter de votre projet, voir ce qui fonctionne, simplifier vos demandes, consulter un expert), les payantes avec cadenas ; « Mes programmes » (favoris) ; « Mes demandes en cours » ; « Ressources et apprentissage » (webinaires) ; colonne droite : encart expert, « Financement disponible » avec un total et une répartition par thème ; fenêtre « Démarrer (0/4) » avec quatre actions à cocher (compléter le profil, explorer, consulter une fiche, commencer une demande) | Reprendre : tuiles d'entrée, liste de démarrage à quatre actions, total des appels ouverts et répartition par thématique (nous avons déjà ces chiffres). Adapter : « Financement disponible » devient « Appels ouverts : N, montants annoncés : M » |
| Trouver des subventions (capture 06) | Onglets « Trouver » / « Subventions consultées » ; compteur « 28 subventions totalisant 25 724 000 $ » ; étiquettes des filtres actifs, « Effacer », « Initialiser à vos détails d'organisation » ; filtres dépliables : forme juridique, bailleurs de fonds, type de financement (subvention, crédits d'impôt, prêts, subventions salariales, chercheurs et établissements, partenariat, autre soutien, conseils d'experts), statut (bientôt ouvert, ouvert, bientôt fermé, fermé), objectifs (groupés par thème), dépenses admissibles, revenu, taille, structure de revenu, secteur, groupe ciblé, envergure, année de fondation, province, ville ; carte : logo du financeur, pastille de statut, titre, financeur, une ligne de résumé, lieu, période de dépôt, « Jusqu'à X $ », bouton « Débuter une application », cloche d'alerte ; pagination | Reprendre : compteur avec total des montants, étiquettes des filtres actifs, « Initialiser à mon profil », statut « bientôt fermé », carte avec montant maximal et période, historique des fiches consultées. Nos filtres actuels (territoire, thématique, financeur, source, relecture) restent, on ajoute statut et montant |
| Assistant Charles IA (cadenas) | Renvoie vers la page des offres | Écarter pour l'instant |
| Mes subventions (capture 09) | « Demandes en cours » : tableau en six colonnes façon kanban (validation et éligibilité, collecter l'information, rédiger une première version, validation avant envoi, dépôt, décisions rendues), total en euros par colonne ; « Ajouter des programmes » | Adapter : notre page « Mes candidatures » en colonnes par étape ; c'est le suivi de dossier que veulent les établissements |
| Intelligence de financement (cadenas) | Statistiques sur les acceptations passées | Écarter |
| Alertes | Liste des alertes reçues par courriel, filtre par type | Reprendre : notre page Notifications, avec un lien vers les préférences |
| Intégration IA (cadenas) | Non ouvert | Écarter |
| Support > Ressources (capture 18) | Page « Ressources et apprentissage » : accroche, bouton vers le blog, filtre par type, grille de webinaires datés (titre, date, « En savoir plus »), pagination ; « Ajouter des programmes » et « Voir tous les fonds » sur le tableau de bord renvoient simplement vers la recherche | Adapter : une page « Ressources » avec nos guides (comment répondre à un appel ARS, calendrier des campagnes CNSA...) ; pas de webinaires pour l'instant |
| Support > FAQ (capture 15) | Sept questions dépliables (accordéon) : accès sans être client, industries couvertes, abonnement pour le module de demandes, petites entreprises, OBNL, réception des alertes, avantage par rapport à une recherche Google | Reprendre : FAQ en accordéon, sept à dix questions, dont « pourquoi pas Google », « comment sont relues les fiches », « qui peut s'inscrire » |
| Support > Nous contacter (capture 16) | Formulaire à deux champs (sujet en liste, message) et bouton « Soumettre » ; colonne « Autres moyens » : adresses postales et téléphone | Reprendre : contact à deux champs plus les coordonnées d'ARCADIA SASU (à valider) |
| Paramètres > Utilisateurs et rôles (capture 17) | Onglets « Utilisateurs » et « Invitations en attente » ; tableau (nom, courriel, titre, créé le, dernière connexion, rôle) ; « Ajouter un utilisateur » ouvre une fenêtre : courriel de connexion, puis « Suivant » ; un seul rôle vu, « User » | Adapter plus tard : plusieurs comptes par établissement (direction, chargé de projet) ; hors périmètre du MVP |
| Paramètres > Gestion de la facturation | Ouvre dans un nouvel onglet le portail client hébergé par Stripe (billing.stripe.com) : factures, moyen de paiement, résiliation gérés par Stripe, pas par leur application | Reprendre tel quel : notre abonnement passe déjà par Stripe ; le portail client Stripe évite d'écrire une page de facturation |
| Paramètres (capture 10) | Compte : informations personnelles (prénom, nom, téléphone, courriel, langue, « Supprimer mon compte »), préférences des alertes (trois interrupteurs : rapports hebdomadaires et mensuels, infolettre, mise à jour des programmes) ; Organisation : informations sur l'entreprise (logo, nom, site, effectif, revenus, année de fondation, adresse, objectifs de financement, secteurs, forme juridique, numéro de bienfaisance, courriel et téléphone de l'organisation, réseaux sociaux), utilisateurs et rôles ; Facturation : plans, gestion de la facturation | Reprendre : la structure en trois blocs (compte, organisation, facturation) pour notre page Mon profil et les paramètres ; « Supprimer mon compte » est une obligation RGPD que nous n'avons pas encore |

## 2 bis. La liste de démarrage jouée jusqu'au bout (captures 11 à 14)

La fenêtre « Démarrer sur helloDarwin (0/4) » reste affichée en haut à droite de toutes les pages tant que les
quatre actions ne sont pas faites, puis disparaît. Les actions, dans l'ordre, et ce qu'elles ouvrent :

| Action | Ce qui s'ouvre | Pour AAP Santé |
|---|---|---|
| Compléter le profil de l'organisation | Fenêtre « Adaptez votre recherche à votre entreprise » (capture 11), trois champs seulement : objectifs de financement (liste groupée : gouvernance, pérennité financière, capacité organisationnelle, présence en ligne, certifications, empreinte environnementale, cybersécurité...), année de fondation, envergure (international, local, municipal, national, provincial, régional) ; bouton « Appliquer les informations » ; les filtres de recherche s'enrichissent aussitôt | Reprendre : compléter le profil en une petite fenêtre de trois champs plutôt qu'une longue page ; nos champs : objectifs du projet, année d'ouverture, rayon d'action (local, départemental, régional, national) |
| Explorer les subventions | Cochée dès la première visite de la recherche | Reprendre |
| Consulter une fiche de programme | Cochée dès la première fiche ouverte | Reprendre |
| Commencer une demande de subvention | « Débuter une application » sur une carte crée une demande et ouvre un espace « Rédaction assistée » (capture 12) : zone de conversation à gauche, « Détails de la demande » (programme, statut, montant) et « Actions de la demande » (création, date) à droite ; l'espace est réservé à l'offre Pro, une fenêtre « Passez à la Plateforme Pro » le recouvre | Adapter : la demande devient notre candidature ; la zone de rédaction assistée est hors périmètre pour l'instant |

Après la quatrième action : la fenêtre de démarrage disparaît, « Mes demandes en cours » (capture 13) montre la
demande dans la première colonne « Validation et éligibilité du projet (1) » avec statut du programme, « Poursuivre
l'application » et « Consulter le programme » ; le tableau de bord (capture 14) remplace les tuiles vides par « Mes
programmes » avec la demande, une barre d'avancement à 0 % et « Voir mes programmes ».

## 3. Fiche d'un programme (captures 07 et 08)

Trois onglets : Analyse, Détails, Historique (cadenas). Fil d'Ariane en haut. En-tête : logo, pastille « Ouvert »,
titre, sous-titre d'une ligne, étiquette du financeur, « Mis à jour : date », type de financement, cloche d'alerte.
Trois cases : financement disponible, dates importantes, localisation.

Onglet Analyse : score d'opportunité sur 100 avec une phrase ; « Faits saillants » en deux colonnes (ce qui
fonctionne / points de vigilance) ; quatre jauges (vitesse, popularité, niche, facilité) ; « Votre éligibilité : 3 / 4
critères » avec la liste des critères cochés et un lien « Valider ce critère » ; matrice d'impact (potentiel de
financement contre facilité, quatre quadrants) ; subventions similaires ; « Les prochaines étapes » en trois pas ;
calendrier de disponibilité sur douze mois ; candidatures acceptées et candidats privilégiés (payant, flouté).

Onglet Détails : aperçu, résumé (objectifs, financement admissible, dates), candidats admissibles (industries,
localisation, structures légales, revenu, taille, audience), ressources officielles (payant), modalités de l'aide,
projets admissibles, admissibilité, qui est admissible, qui ne l'est pas, dépenses admissibles et non admissibles,
zone géographique, critères de sélection, comment s'inscrire en étapes, documents requis, traitement, autres
informations, contact.

Pour AAP Santé : Reprendre l'en-tête à trois cases, « Mis à jour le » (nous avons `derniereVueLe`), les deux colonnes
atouts / vigilance, la liste d'éligibilité cochée d'après le profil de l'établissement, le calendrier, les appels
similaires. Adapter le score d'opportunité en « correspondance avec votre profil » calculée sur territoire, type
d'établissement et thématique. Les sections de l'onglet Détails sont une bonne cible pour l'extraction : plusieurs
existent déjà dans nos fiches (critères, documents, contact), d'autres manquent (dépenses admissibles, qui n'est pas
admissible, étapes de dépôt).

## 4. Ce que je propose de faire, dans l'ordre

1. Parcours d'intégration à trois écrans après l'inscription, remplaçant « Compléter mon profil » : organisation,
   détails selon le type, offres. Les réponses alimentent le profil et les filtres par défaut.
2. Liste de démarrage à quatre actions sur les tableaux de bord.
3. Recherche : compteur avec montants, étiquettes des filtres actifs, « Initialiser à mon profil », statut « bientôt
   fermé », historique des fiches consultées.
4. Fiche : en-tête à trois cases, éligibilité cochée d'après le profil, appels similaires, calendrier.
5. Mes candidatures en colonnes par étape.
6. Paramètres en trois blocs, suppression du compte.

Chaque point fera un changement OpenSpec séparé, avec scénarios, tests et vérification par Monsieur DUCOUT.

Vérifié : tout ce qui précède a été lu à l'écran le 2026-10-20 sur le compte de test, captures à l'appui ; la liste de démarrage a été jouée jusqu'à 4 sur 4.
Non vérifié ou supposé : les écrans payants (assistant, intelligence de financement, historique, ressources
officielles) n'ont pas été ouverts ; les écrans de l'étape 2 pour les autres formes juridiques n'ont pas été vus.
