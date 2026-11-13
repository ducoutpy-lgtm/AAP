# recommandations-candidat Specification

## ADDED Requirements

### Requirement: Recommandations depuis le profil, avec raisons

La page `/recommandations` SHALL proposer au candidat les appels publiés, contrôlés et non clos qui concernent sa
structure, SHALL écarter un appel d'une autre région ou dont les destinataires ou les types d'établissement cités
contredisent son profil, et SHALL afficher pour chaque appel les raisons de la recommandation et ce qui reste à vérifier.

#### Scenario: EHPAD associatif d'Île-de-France

- **WHEN** Monsieur DUCOUT se connecte avec le compte candidat de test (association, EHPAD, Île-de-France) et ouvre
  `/recommandations`
- **THEN** chaque carte affiche au moins une raison (« Appel de votre région (Île-de-France) », « Ouvert aux Privé non
  lucratif, votre statut »…), aucun appel d'une autre région ni aucun appel clos n'apparaît, et aucune carte n'affiche
  « Infinity »

#### Scenario: Profil incomplet

- **WHEN** le profil n'a ni région ni type d'établissement
- **THEN** un bandeau invite à compléter le profil et nomme ce qui manque

#### Scenario: Tirage de vingt recommandations

- **WHEN** Monsieur DUCOUT juge vingt recommandations tirées au sort pour un profil réel
- **THEN** au moins dix-huit lui paraissent pertinentes
