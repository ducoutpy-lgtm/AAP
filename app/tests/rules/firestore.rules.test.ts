// Tests des règles Firestore (lot 0 du 2026-10-14, puis dégel des modules du 2026-10-19, changement
// degel-application-complete), joués sur l'émulateur :
//   npm run test:rules   (firebase emulators:exec --only firestore --project demo-aap "npx vitest run tests/rules")
// Chaque test porte le nom de la règle qu'il protège. Le jeu de données est écrit sans règles avant chaque test.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

const regles = readFileSync(fileURLToPath(new URL('../../firestore.rules', import.meta.url)), 'utf8');

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-aap',
    firestore: { rules: regles, host: '127.0.0.1', port: 8080 },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/admin1'), { userType: 'admin', subscriptionStatus: 'active' });
    await setDoc(doc(db, 'users/porteur1'), { userType: 'porteur', subscriptionStatus: 'trial' });
    await setDoc(doc(db, 'users/porteur2'), { userType: 'porteur', subscriptionStatus: 'trial' });
    await setDoc(doc(db, 'users/expire'), { userType: 'porteur', subscriptionStatus: 'expired' });
    await setDoc(doc(db, 'users/f1'), { userType: 'financeur', subscriptionStatus: 'active' });
    await setDoc(doc(db, 'aap/publie'), { status: 'published', financeurId: 'scraped', title: 'Publié' });
    await setDoc(doc(db, 'aap/brouillon'), { status: 'draft', financeurId: 'scraped', title: 'Brouillon' });
    await setDoc(doc(db, 'aap/du-financeur'), { status: 'draft', financeurId: 'f1', title: 'Appel du financeur' });
    await setDoc(doc(db, 'aap/archive-f1'), { status: 'archived', financeurId: 'f1', title: 'Archivé par l’administrateur' });
    await setDoc(doc(db, 'applications/c1'), { porteurId: 'porteur1', financeurId: 'f1', status: 'draft' });
    await setDoc(doc(db, 'applications/c2'), { porteurId: 'porteur1', financeurId: 'f1', status: 'submitted' });
    await setDoc(doc(db, 'savedSearches/s1'), { userId: 'porteur1', name: 'ma recherche' });
    await setDoc(doc(db, 'notifications/n1'), { userId: 'porteur1', read: false });
    await setDoc(doc(db, 'messages/m1'), { senderId: 'f1', receiverId: 'porteur1', read: false });
  });
});

const A_VALIDER = { statut: 'proposee', par: '' };
const visiteur = () => env.unauthenticatedContext().firestore();
const admin = () => env.authenticatedContext('admin1').firestore();
const porteur = () => env.authenticatedContext('porteur1').firestore();
const porteur2 = () => env.authenticatedContext('porteur2').firestore();
const expire = () => env.authenticatedContext('expire').firestore();
const financeur = () => env.authenticatedContext('f1').firestore();

describe('aap : consultation publique et actions de l’administrateur', () => {
  it('un visiteur lit un AAP publié et liste les AAP publiés', async () => {
    await assertSucceeds(getDoc(doc(visiteur(), 'aap/publie')));
    await assertSucceeds(getDocs(query(collection(visiteur(), 'aap'), where('status', '==', 'published'))));
  });

  it('un visiteur ne lit pas un brouillon', async () => {
    await assertFails(getDoc(doc(visiteur(), 'aap/brouillon')));
  });

  it('l’administrateur lit un brouillon et toute la collection', async () => {
    await assertSucceeds(getDoc(doc(admin(), 'aap/brouillon')));
    await assertSucceeds(getDocs(collection(admin(), 'aap')));
  });

  it('l’administrateur publie, clôture, archive et supprime', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'aap/brouillon'), { status: 'published' }));
    await assertSucceeds(updateDoc(doc(admin(), 'aap/publie'), { status: 'closed' }));
    await assertSucceeds(updateDoc(doc(admin(), 'aap/publie'), { status: 'archived' }));
    await assertSucceeds(deleteDoc(doc(admin(), 'aap/publie')));
  });

  it('un porteur ne modifie ni ne crée un AAP', async () => {
    await assertFails(updateDoc(doc(porteur(), 'aap/publie'), { status: 'archived' }));
    await assertFails(setDoc(doc(porteur(), 'aap/nouveau'), { status: 'draft', financeurId: 'porteur1' }));
  });

  it('un visiteur ne crée pas un AAP', async () => {
    await assertFails(setDoc(doc(visiteur(), 'aap/nouveau'), { status: 'published' }));
  });
});

describe('users : propriétaire et administrateur', () => {
  it('l’administrateur suspend et active un utilisateur', async () => {
    await assertSucceeds(updateDoc(doc(admin(), 'users/porteur1'), { subscriptionStatus: 'cancelled' }));
    await assertSucceeds(updateDoc(doc(admin(), 'users/porteur1'), { subscriptionStatus: 'active' }));
  });

  it('un utilisateur met à jour son propre document, pas celui d’un autre', async () => {
    await assertSucceeds(updateDoc(doc(porteur(), 'users/porteur1'), { profileComplete: true }));
    await assertFails(updateDoc(doc(porteur(), 'users/admin1'), { userType: 'porteur' }));
  });

  it('un compte crée seulement son propre document', async () => {
    const nouveau = env.authenticatedContext('nouveau').firestore();
    await assertSucceeds(setDoc(doc(nouveau, 'users/nouveau'), { userType: 'porteur', subscriptionStatus: 'trial' }));
    await assertFails(setDoc(doc(nouveau, 'users/autre'), { userType: 'porteur', subscriptionStatus: 'trial' }));
  });

  it('un visiteur ne lit pas un utilisateur', async () => {
    await assertFails(getDoc(doc(visiteur(), 'users/porteur1')));
  });

  // Faille relevée le 2026-11-13 (question 20, « Oui, corriger ») : un compte pouvait se donner le rôle administrateur
  it('un compte ne se donne jamais le rôle administrateur', async () => {
    await assertFails(updateDoc(doc(porteur(), 'users/porteur1'), { userType: 'admin' }));
    const nouveau = env.authenticatedContext('pirate').firestore();
    await assertFails(setDoc(doc(nouveau, 'users/pirate'), { userType: 'admin', subscriptionStatus: 'trial' }));
  });

  it('le parcours peut encore passer de porteur à financeur, l’administrateur garde la main', async () => {
    await assertSucceeds(updateDoc(doc(porteur(), 'users/porteur1'), { userType: 'financeur' }));
    await assertSucceeds(updateDoc(doc(admin(), 'users/porteur1'), { userType: 'porteur' }));
  });
});

describe('aap : création et modification par un financeur (dégel du 2026-10-19)', () => {
  it('un financeur abonné crée un appel à son nom, pas au nom d’un autre', async () => {
    await assertSucceeds(setDoc(doc(financeur(), 'aap/nouveau'), { status: 'draft', financeurId: 'f1', title: 'Mon appel', validation: A_VALIDER }));
    await assertFails(setDoc(doc(financeur(), 'aap/usurpe'), { status: 'draft', financeurId: 'autre', title: 'x' }));
  });

  it('le financeur modifie et supprime son appel, pas celui d’un autre ni une fiche importée', async () => {
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'published', validation: A_VALIDER }));
    await assertFails(updateDoc(doc(financeur(), 'aap/publie'), { title: 'détourné' }));
    await assertSucceeds(deleteDoc(doc(financeur(), 'aap/du-financeur')));
  });

  it('le financeur lit son brouillon ; un porteur en essai aussi (abonnement), un compte expiré non', async () => {
    await assertSucceeds(getDoc(doc(financeur(), 'aap/du-financeur')));
    await assertSucceeds(getDoc(doc(porteur(), 'aap/du-financeur')));
    await assertFails(getDoc(doc(expire(), 'aap/brouillon')));
  });
});

describe('profils : le propriétaire écrit, l’administrateur lit', () => {
  it('un porteur écrit son profil, pas celui d’un autre', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'porteurProfiles/porteur1'), { userId: 'porteur1', structureName: 'EHPAD Test' }));
    await assertFails(setDoc(doc(porteur(), 'porteurProfiles/porteur2'), { userId: 'porteur2', structureName: 'x' }));
    await assertSucceeds(getDoc(doc(admin(), 'porteurProfiles/porteur1')));
  });

  it('un financeur écrit son profil financeur', async () => {
    await assertSucceeds(setDoc(doc(financeur(), 'financeurProfiles/f1'), { userId: 'f1', organizationName: 'ARS Test' }));
    await assertFails(getDoc(doc(porteur(), 'financeurProfiles/f1')));
  });
});

describe('candidatures : porteur en brouillon, financeur en évaluation', () => {
  it('un porteur en essai crée une candidature à son nom et la modifie en brouillon', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'applications/nouvelle'), { porteurId: 'porteur1', financeurId: 'f1', aapId: 'du-financeur', status: 'draft' }));
    await assertFails(setDoc(doc(porteur(), 'applications/usurpee'), { porteurId: 'porteur2', financeurId: 'f1', aapId: 'du-financeur', status: 'draft' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'applications/c1'), { projectTitle: 'Projet' }));
    await assertFails(updateDoc(doc(porteur2(), 'applications/c1'), { projectTitle: 'volé' }));
  });

  it('une candidature soumise n’est plus modifiable par le porteur, le financeur l’évalue', async () => {
    await assertFails(updateDoc(doc(porteur(), 'applications/c2'), { projectTitle: 'trop tard' }));
    await assertSucceeds(updateDoc(doc(financeur(), 'applications/c2'), { status: 'accepted' }));
    await assertSucceeds(getDoc(doc(financeur(), 'applications/c2')));
  });

  it('le porteur supprime un brouillon, pas une candidature soumise ; un compte expiré ne crée rien', async () => {
    await assertSucceeds(deleteDoc(doc(porteur(), 'applications/c1')));
    await assertFails(deleteDoc(doc(porteur(), 'applications/c2')));
    await assertFails(setDoc(doc(expire(), 'applications/x'), { porteurId: 'expire', financeurId: 'f1', status: 'draft' }));
  });
});

describe('recherches sauvegardées, favoris, notifications, messages', () => {
  it('le porteur crée, modifie et supprime sa recherche sauvegardée, pas celle d’un autre', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'savedSearches/s2'), { userId: 'porteur1', name: 'nouvelle' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'savedSearches/s1'), { name: 'renommée' }));
    await assertFails(updateDoc(doc(porteur2(), 'savedSearches/s1'), { name: 'volée' }));
    await assertSucceeds(deleteDoc(doc(porteur(), 'savedSearches/s1')));
  });

  it('un favori se crée au nom de son propriétaire seulement', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'favoriteAap/fav1'), { userId: 'porteur1', aapId: 'publie' }));
    await assertFails(setDoc(doc(porteur(), 'favoriteAap/fav2'), { userId: 'porteur2', aapId: 'publie' }));
  });

  it('le destinataire lit et marque lue sa notification ; l’administrateur en crée une', async () => {
    await assertSucceeds(getDoc(doc(porteur(), 'notifications/n1')));
    await assertSucceeds(updateDoc(doc(porteur(), 'notifications/n1'), { read: true }));
    await assertFails(getDoc(doc(porteur2(), 'notifications/n1')));
    await assertSucceeds(setDoc(doc(admin(), 'notifications/n2'), { userId: 'porteur1', read: false }));
  });

  it('un compte abonné envoie un message en son nom ; le destinataire le lit et le marque lu', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'messages/m2'), { senderId: 'porteur1', receiverId: 'f1', content: 'Bonjour' }));
    await assertFails(setDoc(doc(porteur(), 'messages/m3'), { senderId: 'f1', receiverId: 'porteur1', content: 'usurpé' }));
    await assertSucceeds(getDoc(doc(porteur(), 'messages/m1')));
    await assertSucceeds(updateDoc(doc(porteur(), 'messages/m1'), { read: true }));
    await assertFails(getDoc(doc(porteur2(), 'messages/m1')));
  });
});

describe('propriétaire figé et financeur suspendu (corrections-relecture-16-novembre)', () => {
  it('une recherche, un favori, une notification ne changent pas de propriétaire', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'favoriteAap/fav1'), { userId: 'porteur1', aapId: 'publie' }));
    await assertFails(updateDoc(doc(porteur(), 'savedSearches/s1'), { userId: 'porteur2', name: 'piège' }));
    await assertFails(updateDoc(doc(porteur(), 'favoriteAap/fav1'), { userId: 'porteur2' }));
    await assertFails(updateDoc(doc(porteur(), 'notifications/n1'), { userId: 'porteur2' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'savedSearches/s1'), { alertEnabled: false }));
    await assertSucceeds(updateDoc(doc(porteur(), 'notifications/n1'), { read: true }));
  });

  it('un financeur suspendu lit encore la liste de ses appels, pas ceux d’un autre', async () => {
    await env.withSecurityRulesDisabled(async ctx => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'users/f2'), { userType: 'financeur', subscriptionStatus: 'cancelled' });
      await setDoc(doc(db, 'aap/du-f2'), { status: 'draft', financeurId: 'f2', title: 'Brouillon de f2' });
    });
    const f2 = env.authenticatedContext('f2').firestore();
    await assertSucceeds(getDocs(query(collection(f2, 'aap'), where('financeurId', '==', 'f2'))));
    await assertFails(getDoc(doc(f2, 'aap/du-financeur')));
  });
});

describe('suppression du compte (question 25, 2026-11-19)', () => {
  it('le candidat supprime sa candidature à un appel importé, pas une candidature envoyée à un financeur inscrit', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'applications/c3'),
      { porteurId: 'porteur1', financeurId: 'scraped', status: 'submitted' }));
    await assertSucceeds(deleteDoc(doc(porteur(), 'applications/c3')));
    await assertFails(deleteDoc(doc(porteur(), 'applications/c2')));
  });

  it('sur une candidature envoyée, il ne peut que remplacer son identifiant par « compte-supprime »', async () => {
    await assertFails(updateDoc(doc(porteur(), 'applications/c2'), { porteurId: 'porteur2' }));
    await assertFails(updateDoc(doc(porteur(), 'applications/c2'), { porteurId: 'compte-supprime', status: 'accepted' }));
    await assertFails(updateDoc(doc(porteur2(), 'applications/c2'), { porteurId: 'compte-supprime' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'applications/c2'), { porteurId: 'compte-supprime' }));
  });
});

describe('champs propriétaires figés (relecture du 2026-11-17, suite)', () => {
  it('un financeur ne transfère pas son appel à un autre compte', async () => {
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { financeurId: 'porteur1' }));
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/du-financeur'), { title: 'Titre modifié', validation: A_VALIDER }));
  });

  it('ni le porteur ni le financeur ne changent les comptes d’une candidature', async () => {
    await assertFails(updateDoc(doc(porteur(), 'applications/c1'), { porteurId: 'porteur2' }));
    await assertFails(updateDoc(doc(porteur(), 'applications/c1'), { financeurId: 'autre' }));
    await assertFails(updateDoc(doc(financeur(), 'applications/c2'), { porteurId: 'porteur2' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'applications/c1'), { projectTitle: 'Nouveau titre' }));
    await assertSucceeds(updateDoc(doc(financeur(), 'applications/c2'), { status: 'under_review' }));
  });

  it('le destinataire d’un message ne change ni l’expéditeur ni le destinataire', async () => {
    await assertFails(updateDoc(doc(porteur(), 'messages/m1'), { senderId: 'porteur2' }));
    await assertFails(updateDoc(doc(porteur(), 'messages/m1'), { receiverId: 'porteur2' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'messages/m1'), { read: true }));
  });
});

describe('paiements et statistiques : fonctions serveur seulement', () => {
  it('même l’administrateur n’écrit pas dans payments ni analytics', async () => {
    await assertFails(setDoc(doc(admin(), 'payments/p1'), { userId: 'porteur1', amount: 1 }));
    await assertFails(setDoc(doc(admin(), 'analytics/a1'), { totalUsers: 1 }));
  });
});

describe('journal des actions (suivi-testeurs, 2026-10-21)', () => {
  const ligne = (userId: string) => ({ userId, role: 'porteur', action: 'fiche', cible: 'publie', libelle: 'Publié', le: new Date() });

  it('un candidat crée sa propre ligne, pas celle d’un autre, et ne lit pas le journal', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'journal/j1'), ligne('porteur1')));
    await assertFails(setDoc(doc(porteur(), 'journal/j2'), ligne('porteur2')));
    await assertFails(setDoc(doc(porteur(), 'journal/j3'), { ...ligne('porteur1'), motDePasse: 'x' }));
    await assertFails(getDoc(doc(porteur(), 'journal/j1')));
  });

  it('l’administrateur lit le journal, personne ne le modifie', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'journal/j1'), ligne('porteur1')));
    await assertSucceeds(getDoc(doc(admin(), 'journal/j1')));
    await assertFails(updateDoc(doc(admin(), 'journal/j1'), { libelle: 'autre' }));
    await assertFails(setDoc(doc(visiteur(), 'journal/j9'), ligne('porteur1')));
  });
});

describe('chiffres publics (financeur-vendable, 2026-10-21)', () => {
  it('tout le monde lit statistiquesPubliques/accueil, personne ne l’écrit, même l’administrateur', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'statistiquesPubliques/accueil'), { etablissementsInscrits: 3, appelsSuivis: 10 }));
    await assertSucceeds(getDoc(doc(visiteur(), 'statistiquesPubliques/accueil')));
    await assertSucceeds(getDoc(doc(porteur(), 'statistiquesPubliques/accueil')));
    await assertFails(updateDoc(doc(admin(), 'statistiquesPubliques/accueil'), { appelsSuivis: 999 }));
    await assertFails(setDoc(doc(porteur(), 'statistiquesPubliques/autre'), { appelsSuivis: 1 }));
  });
});

describe('retours des testeurs (mise-en-ligne-testeurs, 2026-10-21)', () => {
  const retour = (userId: string, message = 'La date de clôture manque sur cette fiche') =>
    ({ userId, role: 'porteur', email: 'p@test.local', type: 'anomalie', page: '/aap/x', message, le: new Date() });

  it('un compte crée son propre retour, pas celui d’un autre, pas trop court, pas avec un champ en plus', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'retours/r1'), retour('porteur1')));
    await assertFails(setDoc(doc(porteur(), 'retours/r2'), retour('porteur2')));
    await assertFails(setDoc(doc(porteur(), 'retours/r3'), retour('porteur1', 'court')));
    await assertFails(setDoc(doc(porteur(), 'retours/r6'), retour('porteur1', 'x'.repeat(4001))));
    await assertFails(setDoc(doc(porteur(), 'retours/r4'), { ...retour('porteur1'), traite: true }));
    await assertFails(setDoc(doc(visiteur(), 'retours/r5'), retour('porteur1')));
  });

  it('l’administrateur lit les retours, personne ne les modifie ni ne les lit sans être administrateur', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'retours/r1'), retour('porteur1')));
    await assertSucceeds(getDoc(doc(admin(), 'retours/r1')));
    await assertFails(getDoc(doc(porteur(), 'retours/r1')));
    await assertFails(updateDoc(doc(admin(), 'retours/r1'), { message: 'modifié par erreur' }));
    await assertFails(deleteDoc(doc(admin(), 'retours/r1')));
  });
});

// Corrections-relecture 2.4 (2026-11-20) : champs et statuts bornés. Avant, le financeur pouvait réécrire le dossier du
// candidat, le candidat créer une candidature déjà acceptée, et l'auteur d'un appel republier un appel archivé par
// l'administrateur ou se poser un verdict de relecture.
describe('candidatures : champs et statuts bornés', () => {
  const maintenant = new Date();
  it('le financeur évalue (statut, note, avis) mais ne réécrit pas le dossier du candidat', async () => {
    await assertFails(updateDoc(doc(financeur(), 'applications/c2'), { projectDescription: 'texte modifié' }));
    await assertFails(updateDoc(doc(financeur(), 'applications/c2'), { budget: { total: 1, breakdown: '' } }));
    await assertSucceeds(updateDoc(doc(financeur(), 'applications/c2'),
      { status: 'accepted', financeurScore: 80, financeurFeedback: 'Bon dossier', evaluatedAt: maintenant, updatedAt: maintenant }));
  });

  it('le candidat ne crée pas une candidature déjà évaluée, ni adressée à un autre financeur que celui de l’appel', async () => {
    const base = { porteurId: 'porteur1', financeurId: 'f1', aapId: 'du-financeur' };
    await assertFails(setDoc(doc(porteur(), 'applications/acceptee'), { ...base, status: 'accepted' }));
    await assertFails(setDoc(doc(porteur(), 'applications/notee'), { ...base, status: 'submitted', financeurScore: 100 }));
    await assertFails(setDoc(doc(porteur(), 'applications/detournee'), { ...base, financeurId: 'autre', status: 'submitted' }));
    await assertSucceeds(setDoc(doc(porteur(), 'applications/envoyee'), { ...base, status: 'submitted' }));
    await assertSucceeds(setDoc(doc(porteur(), 'applications/externe'),
      { porteurId: 'porteur1', financeurId: 'scraped', aapId: 'publie', status: 'submitted', externe: true }));
  });

  it('en brouillon, le candidat ne se donne pas lui-même une décision', async () => {
    await assertFails(updateDoc(doc(porteur(), 'applications/c1'), { status: 'accepted' }));
    await assertFails(updateDoc(doc(porteur(), 'applications/c1'), { financeurFeedback: 'parfait' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'applications/c1'), { status: 'submitted' }));
  });
});

describe('appels : statut et relecture réservés à l’administrateur', () => {
  it('l’auteur ne republie pas un appel archivé ; l’administrateur le peut', async () => {
    await assertFails(updateDoc(doc(financeur(), 'aap/archive-f1'), { status: 'published' }));
    await assertSucceeds(updateDoc(doc(admin(), 'aap/archive-f1'), { status: 'published' }));
  });

  it('l’auteur publie son brouillon, le corrige, le clôture, mais ne revient pas en arrière', async () => {
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'published', publishedAt: maintenantAap(), validation: A_VALIDER }));
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/du-financeur'), { title: 'Corrigé', validation: A_VALIDER }));
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'closed' }));
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'published' }));
  });

  it('l’auteur n’écrit ni verdict de relecture ni source', async () => {
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { validation: { statut: 'validee', par: 'Monsieur DUCOUT' } }));
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { source: 'scraped' }));
    await assertFails(setDoc(doc(financeur(), 'aap/avec-verdict'), { status: 'draft', financeurId: 'f1', title: 'x', validation: { statut: 'validee' } }));
    await assertFails(setDoc(doc(financeur(), 'aap/faux-import'), { status: 'draft', financeurId: 'f1', title: 'x', source: 'scraped' }));
    await assertSucceeds(setDoc(doc(financeur(), 'aap/saisi'), { status: 'draft', financeurId: 'f1', title: 'x', source: 'manual', validation: A_VALIDER }));
  });
});

function maintenantAap() {
  return new Date();
}


// Plan niveau A, lot 1 (2026-11-24) : faille P0 de l'audit. Un compte réécrivait son adresse (le courriel du lundi la
// lisait) et pouvait se donner un abonnement actif ou prolonger son essai.
describe('users : le propriétaire ne modifie que ses champs de parcours', () => {
  it('ni adresse, ni abonnement, ni fin d’essai ; démarrage, profil complété et CGU passent', async () => {
    await assertFails(updateDoc(doc(porteur(), 'users/porteur1'), { email: 'victime@exemple.fr' }));
    await assertFails(updateDoc(doc(porteur(), 'users/porteur1'), { subscriptionStatus: 'active' }));
    await assertFails(updateDoc(doc(porteur(), 'users/porteur1'), { trialEndsAt: new Date(2030, 0, 1) }));
    await assertSucceeds(updateDoc(doc(porteur(), 'users/porteur1'), { demarrage: { recherche: true } }));
    await assertSucceeds(updateDoc(doc(porteur(), 'users/porteur1'), { profileComplete: true, cguAccepteLe: new Date() }));
    await assertSucceeds(updateDoc(doc(porteur(), 'users/porteur1'), { notificationPreferences: { email: false } }));
  });

  it('un compte neuf naît en essai, pas abonné', async () => {
    const neuf = env.authenticatedContext('neuf').firestore();
    await assertFails(setDoc(doc(neuf, 'users/neuf'), { userType: 'porteur', subscriptionStatus: 'active' }));
    await assertSucceeds(setDoc(doc(neuf, 'users/neuf'), { userType: 'porteur', subscriptionStatus: 'trial' }));
  });
});


// Plan niveau A, lot 1.2 (2026-11-24, décision « Validation admin ») : un financeur inscrit seul publiait aussitôt, sans
// contrôle, un appel au nom et au lien de son choix ; une modification d'un appel validé paraissait sans nouveau contrôle.
describe('appels de financeurs : validation par l’administrateur', () => {
  it('l’appel naît « Proposée » ; sans validation ou déjà validé, la création est refusée', async () => {
    await assertFails(setDoc(doc(financeur(), 'aap/sans'), { status: 'draft', financeurId: 'f1', title: 'x' }));
    await assertFails(setDoc(doc(financeur(), 'aap/auto'), { status: 'draft', financeurId: 'f1', title: 'x',
      validation: { statut: 'proposee', par: 'Monsieur DUCOUT' } }));
  });

  it('l’auteur ne publie ni ne modifie sans repasser l’appel « Proposée » ; il peut seulement le clôturer tel quel', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'aap/valide-f1'),
      { status: 'published', financeurId: 'f1', title: 'Validé', validation: { statut: 'validee', par: 'Monsieur DUCOUT' } }));
    await assertFails(updateDoc(doc(financeur(), 'aap/valide-f1'), { title: 'Gagnez de l’argent sur http://x.fr' }));
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'published' }));
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/valide-f1'), { title: 'Titre corrigé', validation: A_VALIDER }));
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'aap/valide-f2'),
      { status: 'published', financeurId: 'f1', title: 'Validé', validation: { statut: 'validee', par: 'Monsieur DUCOUT' } }));
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/valide-f2'), { status: 'closed' }));
  });
});


// Plan niveau A, lot 1.3 (2026-11-24) : formulaire de contact ouvert aux visiteurs, champs bornés ; messagerie, le
// destinataire ne fait que marquer lu.
describe('contact et messagerie : champs bornés', () => {
  const message = { sujet: 'question', email: 'a@exemple.fr', message: 'Bonjour', userId: null, createdAt: new Date() };
  it('le contact accepte un message normal, refuse un sujet inconnu, une adresse géante et un compte usurpé', async () => {
    await assertSucceeds(setDoc(doc(visiteur(), 'messagesContact/ok'), message));
    await assertFails(setDoc(doc(visiteur(), 'messagesContact/sujet'), { ...message, sujet: 'publicité' }));
    await assertFails(setDoc(doc(visiteur(), 'messagesContact/adresse'), { ...message, email: 'a'.repeat(300) }));
    await assertFails(setDoc(doc(visiteur(), 'messagesContact/compte'), { ...message, userId: 'porteur1' }));
    await assertSucceeds(setDoc(doc(porteur(), 'messagesContact/connecte'), { ...message, userId: 'porteur1' }));
  });
  it('le destinataire marque un message lu, sans en réécrire le contenu', async () => {
    await env.withSecurityRulesDisabled(async ctx => setDoc(doc(ctx.firestore(), 'messages/m2'),
      { senderId: 'f1', receiverId: 'porteur1', content: 'Bonjour', read: false }));
    await assertFails(updateDoc(doc(porteur(), 'messages/m2'), { content: 'Texte réécrit' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'messages/m2'), { read: true }));
  });
});
