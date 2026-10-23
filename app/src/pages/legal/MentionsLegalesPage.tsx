// Mentions légales (articles 6 III et 19 de la loi pour la confiance dans l'économie numérique). Rédigées le
// 2026-10-19 (changement degel-application-complete) ; données d'entreprise à compléter par Monsieur DUCOUT.
import { AValider, LegalLayout, Section } from './LegalLayout';
import { EDITEUR } from './editeur';

export default function MentionsLegalesPage() {
  return (
    <LegalLayout titre="Mentions légales">
      <Section titre="Éditeur du service">
        <p>
          Le service {EDITEUR.nomService} est édité par {EDITEUR.raisonSociale}, {EDITEUR.formeJuridique.toLowerCase()},
          au capital de {EDITEUR.capital}, immatriculée au registre du commerce et des sociétés
          sous le numéro {EDITEUR.siren} (SIRET du siège {EDITEUR.siret}), dont le siège social est situé{' '}
          {EDITEUR.siege}.
        </p>
        <p>Directeur de la publication : {EDITEUR.directeurPublication}.</p>
        <p>Contact : {EDITEUR.contact}.</p>
      </Section>

      <Section titre="Hébergement">
        <p>
          Le site est hébergé par Google Cloud EMEA Limited (service Firebase Hosting), 70 Sir John Rogerson's Quay,
          Dublin 2, Irlande.
        </p>
        <p>
          Les données des comptes et des appels à projets sont stockées par Google Cloud EMEA Limited (services Firebase :
          authentification, base de données Firestore), 70 Sir John Rogerson's Quay, Dublin 2, Irlande. Région de
          la base de données : eur3, multirégion Europe (Belgique et Pays-Bas) ; emplacement des comptes et des fichiers{' '}
          <AValider>[À VALIDER — Monsieur DUCOUT : non vérifié]</AValider>.
        </p>
      </Section>

      <Section titre="Objet du service">
        <p>
          {EDITEUR.nomService} recense des appels à projets, appels à candidatures, bourses et prix publiés par des
          financeurs publics et privés du secteur de la santé et du médico-social en France, et les met à disposition des
          établissements et services porteurs de projets. Les informations affichées sont extraites automatiquement des
          sites des financeurs ; chaque fiche indique si elle a été relue, la date de son extraction et le lien vers
          l'annonce officielle, qui seule fait foi.
        </p>
      </Section>

      <Section titre="Propriété intellectuelle">
        <p>
          La structure du site, ses textes propres, sa charte graphique et son code sont la propriété de{' '}
          {EDITEUR.raisonSociale}. Les textes des appels à projets restent la propriété de leurs émetteurs respectifs ; ils
          sont reproduits sous forme de résumés avec renvoi systématique vers la source. Tout émetteur qui souhaite le
          retrait d'une fiche peut en faire la demande à l'adresse de contact ci-dessus.
        </p>
      </Section>

      <Section titre="Responsabilité">
        <p>
          {EDITEUR.raisonSociale} s'efforce de maintenir des informations exactes et à jour, sans pouvoir le garantir :
          les dates, montants et conditions d'un appel à projets doivent être vérifiés sur le site du financeur avant
          toute candidature. {EDITEUR.raisonSociale} ne saurait être tenue responsable d'une décision prise sur la seule
          foi d'une fiche du service.
        </p>
      </Section>

      <Section titre="Données personnelles et cookies">
        <p>
          Le traitement des données personnelles est décrit dans la politique de confidentialité. Le site n'utilise
          que les témoins de connexion strictement nécessaires au fonctionnement du compte (authentification Firebase) ;
          aucun témoin publicitaire ni de mesure d'audience n'est déposé{' '}
          <AValider>[À VALIDER — Monsieur DUCOUT : à confirmer si un outil de mesure est ajouté]</AValider>.
        </p>
      </Section>
    </LegalLayout>
  );
}
