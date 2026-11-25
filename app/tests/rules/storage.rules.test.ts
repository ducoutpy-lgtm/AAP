// Tests des règles du stockage de fichiers (changement regles-stockage-durcies, 2026-11-16), joués sur les émulateurs
// Firestore et Storage (la lecture des documents d'appel consulte l'abonnement dans Firestore) :
//   npm run test:rules
// Les fichiers de test sont exécutés l'un après l'autre (--no-file-parallelism) : ils partagent les émulateurs.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { deleteObject, getBytes, ref, uploadBytes } from 'firebase/storage';

const lire = (fichier: string) => readFileSync(fileURLToPath(new URL(`../../${fichier}`, import.meta.url)), 'utf8');
let env: RulesTestEnvironment;
const contenu = new Uint8Array([37, 80, 68, 70]); // « %PDF »

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-aap',
    firestore: { rules: lire('firestore.rules'), host: '127.0.0.1', port: 8080 },
    storage: { rules: lire('storage.rules'), host: '127.0.0.1', port: 9199 },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.clearStorage();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/admin1'), { userType: 'admin', subscriptionStatus: 'active' });
    await setDoc(doc(db, 'users/porteur1'), { userType: 'porteur', subscriptionStatus: 'trial' });
    await setDoc(doc(db, 'users/porteur2'), { userType: 'porteur', subscriptionStatus: 'trial' });
    await setDoc(doc(db, 'users/expire'), { userType: 'porteur', subscriptionStatus: 'expired' });
    const st = ctx.storage();
    await uploadBytes(ref(st, 'uploads/applications/porteur1/statuts.pdf'), contenu);
    await uploadBytes(ref(st, 'uploads/aap-documents/appel1/cahier.pdf'), contenu);
    await uploadBytes(ref(st, 'uploads/application-documents/c1/budget.pdf'), contenu);
  });
});

const stockage = (uid?: string) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).storage();

describe('pièces de candidature : leur seul auteur', () => {
  it('porteur1 lit, écrit et supprime ses pièces ; porteur2 ne fait rien de cela', async () => {
    await assertFails(getBytes(ref(stockage('porteur2'), 'uploads/applications/porteur1/statuts.pdf')));
    await assertFails(uploadBytes(ref(stockage('porteur2'), 'uploads/applications/porteur1/autre.pdf'), contenu));
    await assertFails(deleteObject(ref(stockage('porteur2'), 'uploads/applications/porteur1/statuts.pdf')));
    await assertSucceeds(getBytes(ref(stockage('porteur1'), 'uploads/applications/porteur1/statuts.pdf')));
    await assertSucceeds(uploadBytes(ref(stockage('porteur1'), 'uploads/applications/porteur1/budget.pdf'), contenu));
    await assertSucceeds(deleteObject(ref(stockage('porteur1'), 'uploads/applications/porteur1/statuts.pdf')));
  });
});

describe('documents d’appel : lecture seule depuis l’application', () => {
  it('un porteur en essai lit ; un visiteur et un compte expiré ne lisent pas', async () => {
    await assertSucceeds(getBytes(ref(stockage('porteur1'), 'uploads/aap-documents/appel1/cahier.pdf')));
    await assertFails(getBytes(ref(stockage(), 'uploads/aap-documents/appel1/cahier.pdf')));
    await assertFails(getBytes(ref(stockage('expire'), 'uploads/aap-documents/appel1/cahier.pdf')));
  });

  it('personne n’écrit ni ne supprime, même l’administrateur', async () => {
    await assertFails(deleteObject(ref(stockage('porteur1'), 'uploads/aap-documents/appel1/cahier.pdf')));
    await assertFails(uploadBytes(ref(stockage('porteur1'), 'uploads/aap-documents/appel1/faux.pdf'), contenu));
    await assertFails(deleteObject(ref(stockage('admin1'), 'uploads/aap-documents/appel1/cahier.pdf')));
    await assertFails(uploadBytes(ref(stockage('admin1'), 'uploads/aap-documents/appel1/faux.pdf'), contenu));
  });
});

describe('chemins inutilisés fermés', () => {
  it('uploads/application-documents : ni lecture ni suppression', async () => {
    await assertFails(getBytes(ref(stockage('porteur1'), 'uploads/application-documents/c1/budget.pdf')));
    await assertFails(deleteObject(ref(stockage('porteur1'), 'uploads/application-documents/c1/budget.pdf')));
  });
});
