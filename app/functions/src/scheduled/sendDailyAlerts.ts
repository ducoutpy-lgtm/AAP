import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const sendDailyAlerts = functions
  .region('europe-west1')
  .pubsub.schedule('0 9 * * *') // Tous les jours à 9h
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const db = admin.firestore();

    try {
      // Récupération de toutes les recherches sauvegardées avec alerte activée
      const savedSearchesSnapshot = await db
        .collection('savedSearches')
        .where('alertEnabled', '==', true)
        .get();

      for (const searchDoc of savedSearchesSnapshot.docs) {
        const search = searchDoc.data();
        const userId = search.userId;

        // Récupération des nouveaux AAP depuis la dernière exécution
        const lastExecuted = search.lastExecutedAt?.toDate() || new Date(0);
        const newAapSnapshot = await db
          .collection('aap')
          .where('status', '==', 'published')
          .where('publishedAt', '>', lastExecuted)
          .get();

        if (newAapSnapshot.size > 0) {
          // Notification
          await db.collection('notifications').add({
            userId,
            type: 'new_aap',
            title: `${newAapSnapshot.size} nouveaux AAP`,
            message: `${newAapSnapshot.size} nouveaux appels à projets correspondent à votre recherche "${search.name}"`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            actionUrl: '/aap/search',
          });
        }

        // Mise à jour de la date de dernière exécution
        await searchDoc.ref.update({
          lastExecutedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      console.log('Daily alerts sent successfully');
    } catch (error) {
      console.error('Error sending daily alerts:', error);
    }
  });
