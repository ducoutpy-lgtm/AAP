import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onUserCreated = functions
  .region('europe-west1')
  .auth.user()
  .onCreate(async (user) => {
    const { uid, email } = user;

    try {
      // Créer une notification de bienvenue
      await admin.firestore().collection('notifications').add({
        userId: uid,
        type: 'system',
        title: 'Bienvenue !',
        message: 'Bienvenue sur AAP Platform. Complétez votre profil pour commencer.',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        actionUrl: '/profil',
      });

      console.log(`User created notification sent for: ${uid} (${email})`);
    } catch (error) {
      console.error('Error creating user notification:', error);
    }
  });
