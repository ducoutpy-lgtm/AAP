// Conditions générales d'utilisation. Rédigées le 2026-10-19 (changement degel-application-complete) ; à relire par
// Monsieur DUCOUT, en particulier les conditions tarifaires (Stripe non branché, essai de 14 jours).
import { AValider, LegalLayout, Section } from './LegalLayout';
import { EDITEUR } from './editeur';

export default function CguPage() {
  return (
    <LegalLayout titre="Conditions générales d'utilisation">
      <Section titre="1. Objet">
        <p>
          Les présentes conditions régissent l'accès et l'utilisation du service {EDITEUR.nomService}, édité par{' '}
          {EDITEUR.raisonSociale}, qui recense les appels à projets du secteur de la santé et du médico-social et permet
          aux porteurs de projets de les rechercher, de les suivre et d'y candidater, et aux financeurs de publier leurs
          appels et de recevoir des candidatures. Toute utilisation du service vaut acceptation de ces conditions.
        </p>
      </Section>

      <Section titre="2. Accès au service">
        <p>
          La consultation des appels publiés est libre et ne demande aucun compte. Les autres fonctions (candidature,
          recherches sauvegardées, messagerie, publication d'un appel) demandent un compte, réservé aux professionnels
          agissant pour une structure : établissement ou service de santé ou médico-social, association, collectivité,
          fondation, administration, entreprise.
        </p>
        <p>
          Le compte est personnel. L'utilisateur choisit un mot de passe robuste, le garde confidentiel et prévient
          l'éditeur de toute utilisation non autorisée. L'éditeur peut suspendre un compte en cas de manquement aux
          présentes conditions.
        </p>
      </Section>

      <Section titre="3. Comptes porteur et financeur">
        <p>
          Un compte porteur permet de rechercher les appels, d'enregistrer des recherches, de recevoir des
          recommandations, de déposer des candidatures et d'échanger avec les financeurs. Un compte financeur permet de
          publier des appels à projets, de recevoir et d'évaluer des candidatures. L'utilisateur garantit l'exactitude
          des informations de son profil et de ses publications.
        </p>
      </Section>

      <Section titre="4. Période d'essai et abonnement">
        <p>
          Toute création de compte ouvre une période d'essai gratuite de quatorze jours. Au-delà, l'accès aux fonctions
          réservées est soumis à un abonnement dont les tarifs et modalités sont affichés dans le service{' '}
          <AValider>[À VALIDER — Monsieur DUCOUT : grille tarifaire et conditions de résiliation ; le paiement en ligne
          n'est pas encore ouvert]</AValider>. Aucun paiement n'est prélevé sans action explicite de l'utilisateur.
        </p>
      </Section>

      <Section titre="5. Contenus des appels à projets">
        <p>
          Les fiches d'appels à projets sont produites automatiquement à partir des sites des financeurs, puis contrôlées
          par un programme et, pour partie, relues par l'éditeur. Chaque fiche indique son état de relecture, la date
          d'extraction et le lien vers l'annonce officielle. Seule l'annonce officielle fait foi : l'utilisateur vérifie
          les dates, montants et conditions à la source avant de candidater. L'éditeur corrige ou retire toute fiche
          signalée comme inexacte.
        </p>
        <p>
          Un financeur qui publie un appel dans le service est seul responsable de son contenu et de sa conformité au
          droit applicable.
        </p>
      </Section>

      <Section titre="6. Candidatures et échanges">
        <p>
          Une candidature déposée par le service est transmise au financeur de l'appel, qui l'évalue selon ses propres
          critères. L'éditeur n'intervient ni dans la sélection ni dans l'attribution des financements et ne garantit
          aucun résultat. Les messages échangés entre utilisateurs restent courtois et professionnels ; tout contenu
          illicite ou abusif peut être retiré.
        </p>
      </Section>

      <Section titre="7. Obligations de l'utilisateur">
        <p>
          L'utilisateur s'interdit toute extraction massive des données du service, toute tentative d'accès non autorisé,
          toute usurpation d'identité et toute utilisation du service à des fins autres que la recherche et la gestion de
          financements de projets de santé et médico-sociaux.
        </p>
      </Section>

      <Section titre="8. Disponibilité et évolution">
        <p>
          Le service est fourni en l'état, en phase de lancement. L'éditeur peut le faire évoluer, l'interrompre pour
          maintenance ou en modifier les fonctions ; il s'efforce de prévenir les utilisateurs des changements
          importants. L'éditeur n'est pas responsable des indisponibilités dues aux sites des financeurs ou aux
          prestataires d'hébergement.
        </p>
      </Section>

      <Section titre="9. Données personnelles">
        <p>
          Le traitement des données personnelles est décrit dans la politique de confidentialité, accessible depuis
          toutes les pages. Délégué à la protection des données : {EDITEUR.dpo}.
        </p>
      </Section>

      <Section titre="10. Résiliation">
        <p>
          L'utilisateur peut fermer son compte à tout moment depuis son profil ou par demande à l'adresse de contact ;
          ses données sont alors supprimées ou anonymisées dans les délais indiqués dans la politique de confidentialité,
          sous réserve des obligations légales de conservation.
        </p>
      </Section>

      <Section titre="11. Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, et à défaut d'accord amiable, les
          tribunaux compétents sont ceux du ressort du siège de l'éditeur{' '}
          <AValider>[À VALIDER — Monsieur DUCOUT : clause à faire relire par un conseil]</AValider>.
        </p>
      </Section>
    </LegalLayout>
  );
}
