// Politique de confidentialité (RGPD, articles 13 et 14). Rédigée le 2026-10-19 (changement
// degel-application-complete) à partir des traitements réels de l'application ; DPO : Monsieur DUCOUT ; analyse
// d'impact reportée après le MVP (CLAUDE.md). À relire par Monsieur DUCOUT.
import { AValider, LegalLayout, Section } from './LegalLayout';
import { EDITEUR } from './editeur';

export default function ConfidentialitePage() {
  return (
    <LegalLayout titre="Politique de confidentialité">
      <Section titre="Responsable du traitement">
        <p>
          {EDITEUR.raisonSociale}, {EDITEUR.siege}, représentée par son président, est responsable des
          traitements décrits ci-dessous. Délégué à la protection des données : {EDITEUR.dpo}, joignable à{' '}
          {EDITEUR.contact}.
        </p>
      </Section>

      <Section titre="Données traitées et finalités">
        <p><strong>Comptes et profils.</strong> Adresse e-mail, mot de passe (jamais lisible par l'éditeur, géré par
          Firebase Authentication), type de compte, nom de la structure, numéro SIRET, adresse, nom et fonction du contact,
          domaines d'intérêt, territoire. Finalité : fournir le service, personnaliser les recommandations, contacter
          l'utilisateur. Base légale : exécution du contrat (conditions générales d'utilisation).</p>
        <p><strong>Candidatures.</strong> Contenu des dossiers déposés par un porteur, pièces jointes, échanges avec le
          financeur, évaluations. Finalité : transmettre et instruire les candidatures. Base légale : exécution du
          contrat.</p>
        <p><strong>Messagerie et notifications.</strong> Messages entre utilisateurs, notifications du service, alertes
          sur les recherches sauvegardées. Base légale : exécution du contrat ; les alertes par e-mail reposent sur le
          consentement et se désactivent depuis le profil.</p>
        <p><strong>Abonnement et paiement.</strong> Statut de l'essai et de l'abonnement, historique de facturation. Le
          paiement en ligne, lorsqu'il sera ouvert, sera confié à Stripe, qui traite seul les données bancaires ; l'éditeur
          n'y a pas accès. Base légale : exécution du contrat et obligations comptables.</p>
        <p><strong>Données de connexion.</strong> Journaux techniques de Firebase (date de connexion, identifiant
          technique, adresse IP). Finalité : sécurité du service. Base légale : intérêt légitime.</p>
        <p><strong>Journal d'usage.</strong> Actions faites dans le service (connexion, recherche et ses filtres, fiche
          consultée, recherche sauvegardée, candidature envoyée, appel publié), avec la date et le compte. Finalité :
          suivre la phase de test, améliorer le service et assister les utilisateurs. Base légale : intérêt légitime.
          Ce journal n'est lu que par l'éditeur.</p>
        <p><strong>Fiches d'appels à projets.</strong> Les fiches sont extraites de pages publiques des financeurs. Elles
          peuvent contenir le nom et les coordonnées professionnelles d'un contact désigné par le financeur. Finalité :
          informer les porteurs de projets. Base légale : intérêt légitime (information professionnelle issue d'une
          source publique). Toute personne citée peut demander le retrait de ses coordonnées.</p>
      </Section>

      <Section titre="Destinataires et sous-traitants">
        <p>
          Les données sont accessibles au personnel habilité de l'éditeur, aux financeurs pour les candidatures qui leur
          sont adressées, et aux porteurs pour les appels publiés. Sous-traitants : Google Cloud EMEA Limited (Firebase :
          authentification, base de données, stockage des fichiers, fonctions serveur, hébergement du site), et, lorsque le paiement sera ouvert, Stripe Payments Europe Ltd. Des transferts hors de l'Union européenne
          peuvent avoir lieu vers les États-Unis (Google, Stripe) ; ils sont encadrés par les clauses
          contractuelles types de la Commission européenne et, le cas échéant, le cadre de protection des données
          UE-États-Unis. Les données sont stockées dans l'Union européenne (région Firebase eur3, Belgique et Pays-Bas).
          Aucune donnée n'est vendue ni cédée à des tiers à des fins commerciales.
        </p>
      </Section>

      <Section titre="Durées de conservation">
        <p>Compte et profil : pendant la durée de l'abonnement, puis trois ans après la dernière connexion, sauf
          suppression demandée plus tôt. Candidatures et évaluations : cinq ans après la clôture de l'appel, au titre de
          la preuve. Messages : trois ans après le dernier échange. Données de facturation : dix ans (obligation
          comptable). Journaux de connexion et journal d'usage : un an. Fiches d'appels à projets : tant que l'appel est utile aux
          utilisateurs ; les coordonnées d'un contact sont retirées sur demande{' '}
          <AValider>[À VALIDER — Monsieur DUCOUT : durées à confirmer]</AValider>.</p>
      </Section>

      <Section titre="Vos droits">
        <p>
          Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité
          de vos données, ainsi que du droit de définir des directives sur leur sort après votre décès. Pour l'exercer,
          écrivez au délégué à la protection des données à {EDITEUR.contact} ; une réponse vous est
          apportée dans un délai d'un mois. Vous pouvez introduire une réclamation auprès de la Commission nationale de
          l'informatique et des libertés (CNIL, 3 place de Fontenoy, 75007 Paris, www.cnil.fr).
        </p>
      </Section>

      <Section titre="Sécurité">
        <p>
          Les accès sont protégés par mot de passe et, à terme, par une authentification à plusieurs facteurs. Les
          données transitent chiffrées (HTTPS) et sont stockées chez des prestataires certifiés ISO 27001. Les règles
          d'accès à la base de données limitent chaque utilisateur à ses propres données ; elles sont testées à chaque
          modification. Toute violation de données susceptible d'engendrer un risque pour les personnes est notifiée à
          la CNIL dans les 72 heures et aux personnes concernées lorsque la loi l'exige.
        </p>
      </Section>

      <Section titre="Témoins de connexion">
        <p>
          Le service n'utilise que les témoins strictement nécessaires à l'authentification et au maintien de la session.
          Aucun témoin publicitaire ni de mesure d'audience n'est déposé sans votre consentement{' '}
          <AValider>[À VALIDER — Monsieur DUCOUT : à mettre à jour si un outil de mesure est ajouté]</AValider>.
        </p>
      </Section>

      <Section titre="Mise à jour">
        <p>
          Cette politique est mise à jour à chaque évolution des traitements ; la date de dernière mise à jour figure en
          tête de page. Une analyse d'impact relative à la protection des données sera conduite avant l'ouverture du
          service au-delà de la phase de test.
        </p>
      </Section>
    </LegalLayout>
  );
}
