// Tests des règles Firestore du MVP (lot 0 du rapport du 2026-10-14, instruction 8), joués sur l'émulateur :
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
    await setDoc(doc(db, 'aap/publie'), { status: 'published', financeurId: 'scraped', title: 'Publié' });
    await setDoc(doc(db, 'aap/brouillon'), { status: 'draft', financeurId: 'scraped', title: 'Brouillon' });
    await setDoc(doc(db, 'applications/c1'), { porteurId: 'porteur1', financeurId: 'f1', status: 'draft' });
    await setDoc(doc(db, 'savedSearches/s1'), { userId: 'porteur1', name: 'ma recherche' });
  });
});

const visiteur = () => env.unauthenticatedContext().firestore();
const admin = () => env.authenticatedContext('admin1').firestore();
const porteur = () => env.authenticatedContext('porteur1').firestore();

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
});

describe('collections gelées : lecture inchangée, écriture interdite', () => {
  it('le porteur lit sa candidature mais ne la modifie pas', async () => {
    await assertSucceeds(getDoc(doc(porteur(), 'applications/c1')));
    await assertFails(updateDoc(doc(porteur(), 'applications/c1'), { status: 'submitted' }));
  });

  it('le porteur lit sa recherche sauvegardée mais ne crée ni ne modifie', async () => {
    await assertSucceeds(getDoc(doc(porteur(), 'savedSearches/s1')));
    await assertFails(setDoc(doc(porteur(), 'savedSearches/s2'), { userId: 'porteur1', name: 'x' }));
    await assertFails(updateDoc(doc(porteur(), 'savedSearches/s1'), { name: 'y' }));
  });

  it('même l’administrateur n’écrit pas dans les collections gelées', async () => {
    await assertFails(setDoc(doc(admin(), 'notifications/n1'), { userId: 'porteur1', read: false }));
    await assertFails(updateDoc(doc(admin(), 'applications/c1'), { status: 'accepted' }));
  });
});
