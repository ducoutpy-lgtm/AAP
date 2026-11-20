# Exactitude des fiches tirées des PDF par le modèle local

Changement `mesure-exactitude-30-fiches`. Les 58 fiches extraites des PDF par `qwen3:8b` le 2026-11-20 (chaîne `lecture-pdf-locale`, arrêtée après 72 PDF sur 278), comparées au texte source. Zéro euro.

- 199 / 232 champs justes (85,8 %)
- Dates inventées : 3
- Conclusion : seuil non atteint (90 % au moins et aucune date inventée)

| Champ | Justes | Total | Part |
|---|---|---|---|
| titre | 54 | 58 | 93,1 % |
| financeur | 54 | 58 | 93,1 % |
| date_cloture | 47 | 58 | 81,0 % |
| montant | 44 | 58 | 75,9 % |

## Écarts

- date_cloture (manque) : https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges%20-%20Nutrition.pdf ; La date limite de retour des fiches projets est fixée au 15 Mai 2026
- date_cloture (invente) : https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges%20-Sant%C3%A9%20sexuelle%20.pdf ; texte : 15 Mai 2026 ; 2026-12-31 absent du texte
- date_cloture (manque) : https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges%20%20-%20Vaccinations%20autres%20que%20grippe%20Covid-19%20et%20HPV.pdf ; La date limite de retour des fiches projets est fixée au 15 Mai 2026
- titre (faux) : https://www.carsat-normandie.fr/files/live/sites/carsat-normandie/files/pdf/pdf_partenaires/Appel_projets_bienvenue_retraite_Appel_candidature.pdf ; titre générique ; l’appel porte sur l’action « Bienvenue à la retraite »
- titre (faux) : https://alpes-vaucluse.msa.fr/lfp/documents/98795/1202571/APJ+-+Dossier+de+candidature.pdf ; titre réel : MSA Appels à projets Jeunes – Dossier de candidature ; « Jeunes porteurs du projet » est un intitulé de rubrique
- date_cloture (invente) : https://alpes-vaucluse.msa.fr/lfp/documents/98795/1202571/APJ+-+Dossier+de+candidature.pdf ; texte : avant le 31 janvier 2026 ; 30 juin absent du texte
- date_cloture (faux) : https://alpes-vaucluse.msa.fr/lfp/documents/98795/1202571/APJ+-+Cahier+des+charges.pdf ; 20 mars 2026 = date limite de remontée par les caisses au niveau national, pas dépôt des jeunes
- montant (manque) : https://alpes-vaucluse.msa.fr/lfp/documents/98795/1202571/APJ+-+Cahier+des+charges.pdf ; deux 1ers prix dotés de 2 500€ ... 4èmes prix dotés de 1 900 €
- date_cloture (faux) : https://picardie.msa.fr/lfp/documents/98875/488250023/APJ+2027+-+Cahier+des+charges+Picardie.pdf ; 19 mars 2027 = remontée nationale ; dépôt local : au plus tard le vendredi 15 janvier 2027
- montant (manque) : https://www.frm.org/uploads/2026_AJE_AAP_ad987fcbdc.pdf ; Le budget alloué en 2026 à cet appel à projets est de 2,7 millions d’euros (enveloppe absente de la fiche)
- montant (faux) : https://www.frm.org/uploads/2027_Danone_AAP_10742e745e.pdf ; dotation globale de 100 000 € (enveloppe) ; chaque projet reçoit 50 000 €, donc max 50 000
- montant (manque) : https://www.frm.org/uploads/2025_PER_FRM_AAP_d038a3796e.pdf ; Montant : 42000 €/an, 50 000 €/an, 60 000 €/an, 70 000 €/an selon l’aide (plusieurs aides, ambigu)
- montant (manque) : https://www.fondation-ca-solidaritedeveloppement.org/wp-content/uploads/2026/09/Modalites-participation-AAP-Fondation-CASD.pdf ; subvention d’au moins 8 000 € ; enveloppe : doté d’un budget de 400 000 € (non reprise)
- titre (faux) : https://www.francealzheimer.org/wp-content/uploads/2026/03/FADOC_Instruction_tech_AAP_SHS_2026_VF.pdf ; « AAP PFA 2026 » est un pied de page commun à plusieurs appels ; thématique SHS non nommée
- titre (faux) : https://www.francealzheimer.org/wp-content/uploads/2026/03/FADOC_instructions-tech-AAP2026_PFA_VF.pdf ; « AAP PFA 2026 » est un pied de page commun ; thématique sciences médicales non nommée
- date_cloture (manque) : https://fondationparalysiecerebrale.org/wp-content/uploads/2026/01/PARTAGE-2026-LETTRE-INTENTION.pdf ; A retourner au plus tard le : 22 mars 2026 (14h)
- date_cloture (faux) : https://www.lesouffle.org/sites/default/files/2026-03/EMERGENCE2026_RI_DEF_0.pdf ; texte : soumis avant le 27 avril 2026 ; 1er septembre = annonce des résultats
- date_cloture (invente) : https://www.culture.gouv.fr/mc/content/download/324787/file/Bilan%20dispositif%20regional%20Culture%20et%20Sante%202017-2021.pdf?inLanguage=fre-FR&version=1 ; rien dans le texte (2021-01-01 inventé)
- montant (faux) : https://www.culture.gouv.fr/mc/content/download/324787/file/Bilan%20dispositif%20regional%20Culture%20et%20Sante%202017-2021.pdf?inLanguage=fre-FR&version=1 ; budget stable 146 000 € ; 273 301 € / 439 000 € = enveloppes de demandes, pas d’appel ouvert
- financeur (faux) : https://www.culture.gouv.fr/mc/content/download/384278/file/Cahier%20des%20charges%20Culture%20et%20Sant%C3%A9%20IDF%202026.pdf?inLanguage=fre-FR&version=1 ; le texte dit seulement DRAC et ARS ; « de l’Art et des Musées » est une mauvaise expansion de DRAC
- montant (manque) : https://www.culture.gouv.fr/mc/content/download/384278/file/Cahier%20des%20charges%20Culture%20et%20Sant%C3%A9%20IDF%202026.pdf?inLanguage=fre-FR&version=1 ; L’enveloppe de subvention disponible en 2026 est de 700 000€ ; minimum 5 000 €
- montant (faux) : https://www.culture.gouv.fr/mc/content/download/395407/file/CDC_AAP2027_MEDICOSOCIAL.pdf?inLanguage=fre-FR&version=1 ; max 60 vient de « 60 €/h » et « 60 % du coût », ce n’est pas un montant par projet
- montant (manque) : https://www.culture.gouv.fr/mc/content/download/383303/file/AAP%20CES%202026.pdf?inLanguage=fre-FR&version=1 ; montant total de 90 000€ ; fourchette entre 1000 et 5 000€ par projet (min et enveloppe absents)
- financeur (faux) : https://www.culture.gouv.fr/mc/content/download/324786/file/Bilan%20dispositif%20regional%20culture%20et%20sante%202004-2016.pdf?inLanguage=fre-FR&version=1 ; le dispositif est celui de la DRAC et de l’ARS Bretagne, pas de la Région
- montant (invente) : https://www.culture.gouv.fr/mc/content/download/324786/file/Bilan%20dispositif%20regional%20culture%20et%20sante%202004-2016.pdf?inLanguage=fre-FR&version=1 ; 0 / 0 non fondés ; le texte cite 24 000 € par an et 458 900 € sur 2004-2010
- montant (faux) : https://www.culture.gouv.fr/mc/content/download/393718/file/CDC_AAP2027_NA_SANITAIRE.pdf?inLanguage=fre-FR&version=1 ; max 60 vient de « 60 €/h » et « 60 % du coût », pas un montant par projet
- date_cloture (manque) : https://www.culture.gouv.fr/mc/content/download/395809/file/CDC_CHD_2027.pdf?inLanguage=fre-FR&version=1 ; à finaliser avant le 31 décembre 2026 afin de permettre une notification
- financeur (faux) : https://www.culture.gouv.fr/mc/content/download/370958/file/Proc%C3%A9dure%20d%C3%A9p%C3%B4t%20en%20ligne_DRAC%20ARS_%20Bretagne.pdf?inLanguage=fre-FR&version=1 ; « Ministère de la Culture » absent du corps ; seul le nom de fichier cite DRAC ARS Bretagne
- montant (manque) : https://www.cantal.fr/wp-content/uploads/2025/12/aap-11-fa1-27112025-vf.pdf ; dépenses minimum 10 000 € HT, plafonnées à 150 000 € HT ; taux d’aide 40 % (dépenses, pas subvention)
- financeur (faux) : https://www.cantal.fr/wp-content/uploads/2025/12/aap-21-fa2-27112025-vf.pdf ; nom du programme FEADER pris pour l’organisme ; l’appel est lancé par le GAL Cantal
- date_cloture (manque) : https://www.cantal.fr/wp-content/uploads/2025/12/aap-21-fa2-27112025-vf.pdf ; Date limite de dépôt des projets : 31 décembre 2026
- montant (invente) : https://www.cantal.fr/wp-content/uploads/2025/12/aap-21-fa2-27112025-vf.pdf ; 0 / 0 non fondés ; dépenses minimum 5 000 € HT, matériel plafonné à 50 000 € HT
- montant (faux) : https://www.cantal.fr/wp-content/uploads/2026/08/aap-13-fa1-30062026-vf.pdf ; 200 000 € = enveloppe FEADER (non mise en enveloppe) ; par projet : dépenses 50 000 à 150 000 € HT

## Dix fiches à relire par Monsieur DUCOUT (les dix premières du tirage)

1. https://www.carsat-nordest.fr/files/live/sites/carsat-nordest/files/documents/partenaires/etre-partenaire-AS/aap-autres-partenaires/2025/AAP%2054/AAP-2026-cahier-des-charges-et-annexes-maj-09-01-2026.pdf
2. https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges%20-%20Nutrition.pdf
3. https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges%20-Sant%C3%A9%20sexuelle%20.pdf
4. https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges-%20Vaccination%20contre%20la%20grippe%20et%20le%20Covid-19%20-%20Annexe%2022.pdf
5. https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges%20%20-%20Vaccinations%20autres%20que%20grippe%20Covid-19%20et%20HPV.pdf
6. https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges%20-D%C3%A9pistage%20organis%C3%A9%20des%20cancers%20.pdf
7. https://www.cssm.fr/uploads//MALADIE/A/Cahier%20des%20charges%20-Sant%C3%A9%20environnementale.pdf
8. https://www.carsat-normandie.fr/files/live/sites/carsat-normandie/files/pdf/pdf_partenaires/Appel_projets_bienvenue_retraite_Appel_candidature.pdf
9. https://www.carsat-normandie.fr/files/live/sites/carsat-normandie/files/pdf/pdf_partenaires/Appel_projets_bienvenue_retraite_Dossier_candidature.pdf
10. https://alpes-vaucluse.msa.fr/lfp/documents/98795/1202571/APJ+-+Dossier+de+candidature.pdf

<!-- Fin du calcul. La suite est écrite à la main ; exactitude.py --rapport la garde. -->

## Analyse (écrite à la main le 2026-11-20)

Verdicts écrits par un sous-agent (modèle Sonnet) ; la session a contrôlé la date inventée de la fiche 2 (31/12/2026 absent du texte). 3 fiches sur 58 ne sont pas des appels (deux bilans Culture et Santé Bretagne, un guide de dépôt). À comparer avec l'extraction Haiku des pages web du pilote : 91,7 % de champs justes, 0 date inventée (`EXACTITUDE.md`). Ici : 3 dates inventées (dont une sur un rapport) et 3 dates fausses (date de remontée nationale ou d'annonce des résultats prise pour la date de dépôt) ; montants souvent mal rangés (enveloppe prise pour un plafond, « 60 €/h » lu comme un montant). Le contrôle local, plus prudent que Haiku (`LOCAL_CONTRE_HAIKU.md`), devrait envoyer une partie de ces fiches dans la file ; non vérifié tant que la chaîne n'a pas fait ses étapes de contrôle.
