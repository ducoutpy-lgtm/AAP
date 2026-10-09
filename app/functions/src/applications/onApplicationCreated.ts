import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onApplicationCreated = functions
  .region('europe-west1')
  .firestore.document('applications/{applicationId}')
  .onCreate(async (snapshot, context) => {
    const application = snapshot.data();
    const applicationId = context.params.applicationId;

    try {
      // Calcul d'un score de préqualification basique
      const score = calculateBasicScore(application);

      // Mise à jour de la candidature avec le score
      await snapshot.ref.update({
        prequalificationScore: score.overall,
        completenessScore: score.completeness,
        conformityFlags: score.flags,
        suggestions: score.suggestions,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Notification au porteur
      await admin.firestore().collection('notifications').add({
        userId: application.porteurId,
        type: 'status_change',
        title: 'Candidature soumise',
        message: `Votre candidature "${application.projectTitle}" a été soumise avec succès.`,
        relatedEntityId: applicationId,
        relatedEntityType: 'application',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        actionUrl: `/mes-candidatures/${applicationId}`,
      });

      // Notification au financeur
      await admin.firestore().collection('notifications').add({
        userId: application.financeurId,
        type: 'new_message',
        title: 'Nouvelle candidature',
        message: `Vous avez reçu une nouvelle candidature pour "${application.aapTitle}".`,
        relatedEntityId: applicationId,
        relatedEntityType: 'application',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        actionUrl: `/mes-aap/${application.aapId}/candidatures/${applicationId}`,
      });

      // Incrémenter le compteur de candidatures de l'AAP
      const aapRef = admin.firestore().collection('aap').doc(application.aapId);
      await aapRef.update({
        applicationsCount: admin.firestore.FieldValue.increment(1),
      });

      console.log(`Application created: ${applicationId}`);
    } catch (error) {
      console.error('Error processing application:', error);
    }
  });

function calculateBasicScore(application: any) {
  let completenessScore = 100;
  const flags: string[] = [];
  const suggestions: string[] = [];

  // Vérification des champs obligatoires
  const requiredFields = [
    'projectTitle',
    'projectDescription',
    'objectives',
    'methodology',
    'timeline',
    'expectedImpact',
  ];

  for (const field of requiredFields) {
    if (!application[field] || application[field] === '') {
      completenessScore -= 15;
      flags.push(`Champ manquant: ${field}`);
      suggestions.push(`Complétez le champ "${field}"`);
    }
  }

  // Vérification de la longueur des descriptions
  if (application.projectDescription && application.projectDescription.length < 200) {
    completenessScore -= 10;
    suggestions.push('La description du projet devrait contenir au moins 200 caractères');
  }

  // Vérification du budget
  if (!application.budget || !application.budget.total) {
    completenessScore -= 15;
    flags.push('Budget non renseigné');
    suggestions.push('Ajoutez les informations budgétaires');
  }

  // Vérification de l'équipe
  if (!application.team || application.team.length === 0) {
    completenessScore -= 10;
    suggestions.push('Ajoutez au moins un membre de l\'équipe');
  }

  const overall = Math.max(0, completenessScore);

  return {
    overall,
    completeness: completenessScore,
    flags,
    suggestions,
  };
}
