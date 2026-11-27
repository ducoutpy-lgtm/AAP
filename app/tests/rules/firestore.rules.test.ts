// Tests des règles Firestore (lot 0 du 2026-10-14, puis dégel des modules du 2026-10-19, changement
// degel-application-complete), joués sur l'émulateur :
//   npm run test:rules   (firebase emulators:exec --only firestore --project demo-aap "npx vitest run tests/rules")
// Chaque test porte le nom de la règle qu'il protège. Le jeu de données est écrit sans règles avant chaque test.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

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
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/admin1'), { userType: 'admin', subscriptionStatus: 'active' });
    await setDoc(doc(db, 'users/porteur1'), { userType: 'porteur', subscriptionStatus: 'trial' });
    await setDoc(doc(db, 'users/porteur2'), { userType: 'porteur', subscriptionStatus: 'trial' });
    await setDoc(doc(db, 'users/expire'), { userType: 'porteur', subscriptionStatus: 'expired' });
    await setDoc(doc(db, 'users/f1'), { userType: 'financeur', subscriptionStatus: 'active' });
    await setDoc(doc(db, 'aap/publie'), { status: 'published', financeurId: 'scraped', title: 'Publié' });
    await setDoc(doc(db, 'aap/brouillon'), { status: 'draft', financeurId: 'scraped', title: 'Brouillon' });
    await setDoc(doc(db, 'aap/du-financeur'), { status: 'draft', financeurId: 'f1', title: 'Appel du financeur' });
    await setDoc(doc(db, 'aap/archive-f1'), {
      status: 'archived',
      financeurId: 'f1',
      title: 'Archivé par l’administrateur',
    });
    await setDoc(doc(db, 'aap/ouvert-f1'), {
      status: 'published',
      financeurId: 'f1',
      title: 'Appel ouvert du financeur',
      validation: { statut: 'validee', par: 'Monsieur DUCOUT' },
    });
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
  // Changement securite-vues-messagerie (question 49, 2026-11-26) : la liste des appels publiés porte aussi la contrainte
  // de validation ; « status == 'published' » seule ouvrirait les appels « Proposée » et la règle la refuse
  it('un visiteur lit un AAP publié et liste les AAP publiés et validés', async () => {
    await assertSucceeds(getDoc(doc(visiteur(), 'aap/publie')));
    await assertSucceeds(
      getDocs(
        query(
          collection(visiteur(), 'aap'),
          where('status', '==', 'published'),
          where('validation.statut', '==', 'validee'),
        ),
      ),
    );
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
    // Bloc de validation et source « manual » joints (relecture du 2026-11-25, constats 38 et 6) : seul le rôle produit
    // le refus
    await assertFails(
      setDoc(doc(porteur(), 'aap/nouveau'), {
        status: 'draft',
        financeurId: 'porteur1',
        source: 'manual',
        validation: A_VALIDER,
      }),
    );
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
    await assertSucceeds(
      setDoc(doc(financeur(), 'aap/nouveau'), {
        status: 'draft',
        financeurId: 'f1',
        title: 'Mon appel',
        source: 'manual',
        validation: A_VALIDER,
      }),
    );
    // Les refus de ce bloc joignent le bloc de validation (relecture du 2026-11-25, constat 38) et la source « manual »
    // (constat 6) : sans eux, ils échouaient sur aValiderSansRelecteur ou sur la source, quel que soit le contrôle visé
    await assertFails(
      setDoc(doc(financeur(), 'aap/usurpe'), {
        status: 'draft',
        financeurId: 'autre',
        title: 'x',
        source: 'manual',
        validation: A_VALIDER,
      }),
    );
  });

  it('le financeur modifie et supprime son appel, pas celui d’un autre ni une fiche importée', async () => {
    await assertSucceeds(
      updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'published', validation: A_VALIDER }),
    );
    await assertFails(updateDoc(doc(financeur(), 'aap/publie'), { title: 'détourné', validation: A_VALIDER }));
    await assertSucceeds(deleteDoc(doc(financeur(), 'aap/du-financeur')));
  });

  // Question 49 (2026-11-26) : le porteur en essai lisait ce brouillon par son abonnement ; il ne le lit plus
  it('le financeur lit son brouillon ; ni un porteur en essai ni un compte expiré', async () => {
    await assertSucceeds(getDoc(doc(financeur(), 'aap/du-financeur')));
    await assertFails(getDoc(doc(porteur(), 'aap/du-financeur')));
    await assertFails(getDoc(doc(expire(), 'aap/brouillon')));
  });
});

describe('profils : le propriétaire écrit, l’administrateur lit', () => {
  it('un porteur écrit son profil, pas celui d’un autre', async () => {
    await assertSucceeds(
      setDoc(doc(porteur(), 'porteurProfiles/porteur1'), { userId: 'porteur1', structureName: 'EHPAD Test' }),
    );
    await assertFails(setDoc(doc(porteur(), 'porteurProfiles/porteur2'), { userId: 'porteur2', structureName: 'x' }));
    await assertSucceeds(getDoc(doc(admin(), 'porteurProfiles/porteur1')));
  });

  it('un financeur écrit son profil financeur', async () => {
    await assertSucceeds(
      setDoc(doc(financeur(), 'financeurProfiles/f1'), { userId: 'f1', organizationName: 'ARS Test' }),
    );
    await assertFails(getDoc(doc(porteur(), 'financeurProfiles/f1')));
  });
});

describe('candidatures : porteur en brouillon, financeur en évaluation', () => {
  it('un porteur en essai crée une candidature à son nom et la modifie en brouillon', async () => {
    await assertSucceeds(
      setDoc(doc(porteur(), 'applications/nouvelle'), {
        porteurId: 'porteur1',
        financeurId: 'f1',
        aapId: 'ouvert-f1',
        status: 'draft',
      }),
    );
    await assertFails(
      setDoc(doc(porteur(), 'applications/usurpee'), {
        porteurId: 'porteur2',
        financeurId: 'f1',
        aapId: 'ouvert-f1',
        status: 'draft',
      }),
    );
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
    await assertFails(
      setDoc(doc(expire(), 'applications/x'), {
        porteurId: 'expire',
        financeurId: 'f1',
        aapId: 'ouvert-f1',
        status: 'draft',
      }),
    );
  });

  // Relecture du 2026-11-25 (constat 14) : par le SDK, un candidat écrivait à un appel non visible (brouillon, encore
  // « Proposée », archivé) ; la règle lit l'appel comme candidatureOuverte le fait à l'écran
  it('le candidat ne candidate qu’à un appel publié et visible', async () => {
    await env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), 'aap/propose-f1'), {
        status: 'published',
        financeurId: 'f1',
        title: 'Proposé',
        validation: { statut: 'proposee', par: '' },
      }),
    );
    const vers = (aapId: string) => ({ porteurId: 'porteur1', financeurId: 'f1', aapId, status: 'submitted' });
    await assertFails(setDoc(doc(porteur(), 'applications/vers-brouillon'), vers('du-financeur')));
    await assertFails(setDoc(doc(porteur(), 'applications/vers-propose'), vers('propose-f1')));
    await assertFails(setDoc(doc(porteur(), 'applications/vers-archive'), vers('archive-f1')));
    await assertSucceeds(setDoc(doc(porteur(), 'applications/vers-ouvert'), vers('ouvert-f1')));
  });

  // Relecture du 2026-11-25 (remarque sur le constat 14) : une fiche importée clôturée mais contrôlée reste ouverte au
  // candidat (ficheConsultable) avec le bouton « J'ai déposé ma candidature : la suivre ici » ; ce seul suivi y est admis
  it('sur une fiche importée clôturée et visible, seul le suivi externe se crée', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'aap/close-importee'), {
        status: 'closed',
        financeurId: 'scraped',
        title: 'Clôturée',
        validation: { statut: 'validee', par: 'claude-haiku-5-5' },
      });
      await setDoc(doc(db, 'aap/close-proposee'), {
        status: 'closed',
        financeurId: 'scraped',
        title: 'Clôturée, non relue',
        validation: { statut: 'proposee', par: '' },
      });
      await setDoc(doc(db, 'aap/close-f1'), {
        status: 'closed',
        financeurId: 'f1',
        title: 'Clôturée par son financeur',
        validation: { statut: 'validee', par: 'Monsieur DUCOUT' },
      });
      await setDoc(doc(db, 'aap/archive-importee'), { status: 'archived', financeurId: 'scraped', title: 'Archivée' });
    });
    const dossier = (aapId: string, financeurId = 'scraped') => ({
      porteurId: 'porteur1',
      financeurId,
      aapId,
      status: 'submitted',
    });
    const suivi = (aapId: string, financeurId = 'scraped') => ({ ...dossier(aapId, financeurId), externe: true });
    await assertSucceeds(setDoc(doc(porteur(), 'applications/suivi-close'), suivi('close-importee')));
    await assertFails(setDoc(doc(porteur(), 'applications/dossier-close'), dossier('close-importee')));
    await assertFails(
      setDoc(doc(porteur(), 'applications/faux-suivi'), { ...dossier('close-importee'), externe: false }),
    );
    await assertFails(setDoc(doc(porteur(), 'applications/suivi-proposee'), suivi('close-proposee')));
    await assertFails(setDoc(doc(porteur(), 'applications/suivi-close-f1'), suivi('close-f1', 'f1')));
    await assertFails(setDoc(doc(porteur(), 'applications/suivi-archive'), suivi('archive-importee')));
    // Contre-vérification : un suivi en brouillon devenait ensuite, en retirant « externe », un dossier ordinaire
    await assertFails(
      setDoc(doc(porteur(), 'applications/suivi-brouillon'), { ...suivi('close-importee'), status: 'draft' }),
    );
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
    await assertSucceeds(
      setDoc(doc(porteur(), 'favoriteAap/porteur1_publie'), { userId: 'porteur1', aapId: 'publie' }),
    );
    await assertFails(setDoc(doc(porteur(), 'favoriteAap/porteur2_publie'), { userId: 'porteur2', aapId: 'publie' }));
  });

  // Relecture du 2026-11-25 (constat 11) : l'identifiant « compte_appel » écrit par favorisService est lié au compte et à
  // l'appel ; un autre compte ne l'occupe pas d'avance pour bloquer le favori
  it('l’identifiant d’un favori vaut « compte_appel » ; un autre compte ne l’occupe pas', async () => {
    await assertFails(setDoc(doc(porteur2(), 'favoriteAap/porteur1_publie'), { userId: 'porteur2', aapId: 'publie' }));
    await assertFails(
      setDoc(doc(porteur(), 'favoriteAap/porteur1_publie'), { userId: 'porteur1', aapId: 'brouillon' }),
    );
    await assertFails(setDoc(doc(porteur(), 'favoriteAap/fav1'), { userId: 'porteur1', aapId: 'publie' }));
    await assertSucceeds(
      setDoc(doc(porteur(), 'favoriteAap/porteur1_publie'), { userId: 'porteur1', aapId: 'publie' }),
    );
  });

  it('le destinataire lit et marque lue sa notification ; l’administrateur en crée une', async () => {
    await assertSucceeds(getDoc(doc(porteur(), 'notifications/n1')));
    await assertSucceeds(updateDoc(doc(porteur(), 'notifications/n1'), { read: true }));
    await assertFails(getDoc(doc(porteur2(), 'notifications/n1')));
    await assertSucceeds(setDoc(doc(admin(), 'notifications/n2'), { userId: 'porteur1', read: false }));
  });

  // Question 50 (2026-11-26, « construire ») : un message sans conversation n'est plus accepté (bloc « messagerie »)
  it('un message sans conversation est refusé ; le destinataire le lit et le marque lu', async () => {
    await assertFails(
      setDoc(doc(porteur(), 'messages/m2'), { senderId: 'porteur1', receiverId: 'f1', content: 'Bonjour' }),
    );
    await assertFails(
      setDoc(doc(porteur(), 'messages/m3'), { senderId: 'f1', receiverId: 'porteur1', content: 'usurpé' }),
    );
    await assertSucceeds(getDoc(doc(porteur(), 'messages/m1')));
    await assertSucceeds(updateDoc(doc(porteur(), 'messages/m1'), { read: true }));
    await assertFails(getDoc(doc(porteur2(), 'messages/m1')));
  });
});

describe('propriétaire figé et financeur suspendu (corrections-relecture-16-novembre)', () => {
  it('une recherche, un favori, une notification ne changent pas de propriétaire', async () => {
    await env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), 'favoriteAap/fav1'), { userId: 'porteur1', aapId: 'publie' }),
    );
    await assertFails(updateDoc(doc(porteur(), 'savedSearches/s1'), { userId: 'porteur2', name: 'piège' }));
    await assertFails(updateDoc(doc(porteur(), 'favoriteAap/fav1'), { userId: 'porteur2' }));
    await assertFails(updateDoc(doc(porteur(), 'notifications/n1'), { userId: 'porteur2' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'savedSearches/s1'), { alertEnabled: false }));
    await assertSucceeds(updateDoc(doc(porteur(), 'notifications/n1'), { read: true }));
  });

  it('un financeur suspendu lit encore la liste de ses appels, pas ceux d’un autre', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
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
    await env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), 'applications/c3'), {
        porteurId: 'porteur1',
        financeurId: 'scraped',
        status: 'submitted',
      }),
    );
    await assertSucceeds(deleteDoc(doc(porteur(), 'applications/c3')));
    await assertFails(deleteDoc(doc(porteur(), 'applications/c2')));
  });

  it('sur une candidature envoyée, il ne peut que remplacer son identifiant par « compte-supprime »', async () => {
    await assertFails(updateDoc(doc(porteur(), 'applications/c2'), { porteurId: 'porteur2' }));
    await assertFails(
      updateDoc(doc(porteur(), 'applications/c2'), { porteurId: 'compte-supprime', status: 'accepted' }),
    );
    await assertFails(updateDoc(doc(porteur2(), 'applications/c2'), { porteurId: 'compte-supprime' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'applications/c2'), { porteurId: 'compte-supprime' }));
  });
});

describe('champs propriétaires figés (relecture du 2026-11-17, suite)', () => {
  it('un financeur ne transfère pas son appel à un autre compte', async () => {
    await assertFails(
      updateDoc(doc(financeur(), 'aap/du-financeur'), { financeurId: 'porteur1', validation: A_VALIDER }),
    );
    await assertSucceeds(
      updateDoc(doc(financeur(), 'aap/du-financeur'), { title: 'Titre modifié', validation: A_VALIDER }),
    );
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
  const ligne = (userId: string) => ({
    userId,
    role: 'porteur',
    action: 'fiche',
    cible: 'publie',
    libelle: 'Publié',
    le: new Date(),
  });

  it('un candidat crée sa propre ligne, pas celle d’un autre, et ne lit pas le journal', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'journal/j1'), ligne('porteur1')));
    await assertFails(setDoc(doc(porteur(), 'journal/j2'), ligne('porteur2')));
    await assertFails(setDoc(doc(porteur(), 'journal/j3'), { ...ligne('porteur1'), motDePasse: 'x' }));
    await assertFails(getDoc(doc(porteur(), 'journal/j1')));
  });

  it('l’administrateur lit le journal, personne ne le modifie', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => setDoc(doc(ctx.firestore(), 'journal/j1'), ligne('porteur1')));
    await assertSucceeds(getDoc(doc(admin(), 'journal/j1')));
    await assertFails(updateDoc(doc(admin(), 'journal/j1'), { libelle: 'autre' }));
    await assertFails(setDoc(doc(visiteur(), 'journal/j9'), ligne('porteur1')));
  });
});

describe('chiffres publics (financeur-vendable, 2026-10-21)', () => {
  it('tout le monde lit statistiquesPubliques/accueil, personne ne l’écrit, même l’administrateur', async () => {
    await env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), 'statistiquesPubliques/accueil'), { etablissementsInscrits: 3, appelsSuivis: 10 }),
    );
    await assertSucceeds(getDoc(doc(visiteur(), 'statistiquesPubliques/accueil')));
    await assertSucceeds(getDoc(doc(porteur(), 'statistiquesPubliques/accueil')));
    await assertFails(updateDoc(doc(admin(), 'statistiquesPubliques/accueil'), { appelsSuivis: 999 }));
    await assertFails(setDoc(doc(porteur(), 'statistiquesPubliques/autre'), { appelsSuivis: 1 }));
  });
});

describe('retours des testeurs (mise-en-ligne-testeurs, 2026-10-21)', () => {
  const retour = (userId: string, message = 'La date de clôture manque sur cette fiche') => ({
    userId,
    role: 'porteur',
    email: 'p@test.local',
    type: 'anomalie',
    page: '/aap/x',
    message,
    le: new Date(),
  });

  it('un compte crée son propre retour, pas celui d’un autre, pas trop court, pas avec un champ en plus', async () => {
    await assertSucceeds(setDoc(doc(porteur(), 'retours/r1'), retour('porteur1')));
    await assertFails(setDoc(doc(porteur(), 'retours/r2'), retour('porteur2')));
    await assertFails(setDoc(doc(porteur(), 'retours/r3'), retour('porteur1', 'court')));
    await assertFails(setDoc(doc(porteur(), 'retours/r6'), retour('porteur1', 'x'.repeat(4001))));
    await assertFails(setDoc(doc(porteur(), 'retours/r4'), { ...retour('porteur1'), traite: true }));
    await assertFails(setDoc(doc(visiteur(), 'retours/r5'), retour('porteur1')));
  });

  it('l’administrateur lit les retours, personne ne les modifie ni ne les lit sans être administrateur', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => setDoc(doc(ctx.firestore(), 'retours/r1'), retour('porteur1')));
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
    await assertSucceeds(
      updateDoc(doc(financeur(), 'applications/c2'), {
        status: 'accepted',
        financeurScore: 80,
        financeurFeedback: 'Bon dossier',
        evaluatedAt: maintenant,
        updatedAt: maintenant,
      }),
    );
  });

  it('le candidat ne crée pas une candidature déjà évaluée, ni adressée à un autre financeur que celui de l’appel', async () => {
    const base = { porteurId: 'porteur1', financeurId: 'f1', aapId: 'ouvert-f1' };
    await assertFails(setDoc(doc(porteur(), 'applications/acceptee'), { ...base, status: 'accepted' }));
    await assertFails(
      setDoc(doc(porteur(), 'applications/notee'), { ...base, status: 'submitted', financeurScore: 100 }),
    );
    await assertFails(
      setDoc(doc(porteur(), 'applications/detournee'), { ...base, financeurId: 'autre', status: 'submitted' }),
    );
    await assertSucceeds(setDoc(doc(porteur(), 'applications/envoyee'), { ...base, status: 'submitted' }));
    await assertSucceeds(
      setDoc(doc(porteur(), 'applications/externe'), {
        porteurId: 'porteur1',
        financeurId: 'scraped',
        aapId: 'publie',
        status: 'submitted',
        externe: true,
      }),
    );
  });

  it('en brouillon, le candidat ne se donne pas lui-même une décision', async () => {
    await assertFails(updateDoc(doc(porteur(), 'applications/c1'), { status: 'accepted' }));
    await assertFails(updateDoc(doc(porteur(), 'applications/c1'), { financeurFeedback: 'parfait' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'applications/c1'), { status: 'submitted' }));
  });
});

describe('appels : statut et relecture réservés à l’administrateur', () => {
  // Les refus de ce bloc joignent le bloc de validation (relecture du 2026-11-25, constat 38) : seul le contrôle visé
  // (statut, verdict, source) produit le refus
  it('l’auteur ne republie pas un appel archivé ; l’administrateur le peut', async () => {
    await assertFails(updateDoc(doc(financeur(), 'aap/archive-f1'), { status: 'published', validation: A_VALIDER }));
    await assertSucceeds(updateDoc(doc(admin(), 'aap/archive-f1'), { status: 'published' }));
  });

  it('l’auteur publie son brouillon, le corrige, le clôture, mais ne revient pas en arrière', async () => {
    await assertSucceeds(
      updateDoc(doc(financeur(), 'aap/du-financeur'), {
        status: 'published',
        publishedAt: maintenantAap(),
        validation: A_VALIDER,
      }),
    );
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/du-financeur'), { title: 'Corrigé', validation: A_VALIDER }));
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'closed' }));
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'published', validation: A_VALIDER }));
  });

  it('l’auteur n’écrit ni verdict de relecture ni source', async () => {
    await assertFails(
      updateDoc(doc(financeur(), 'aap/du-financeur'), { validation: { statut: 'validee', par: 'Monsieur DUCOUT' } }),
    );
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { source: 'scraped', validation: A_VALIDER }));
    await assertFails(
      setDoc(doc(financeur(), 'aap/avec-verdict'), {
        status: 'draft',
        financeurId: 'f1',
        title: 'x',
        source: 'manual',
        validation: { statut: 'validee' },
      }),
    );
    await assertFails(
      setDoc(doc(financeur(), 'aap/faux-import'), {
        status: 'draft',
        financeurId: 'f1',
        title: 'x',
        source: 'scraped',
        validation: A_VALIDER,
      }),
    );
    await assertSucceeds(
      setDoc(doc(financeur(), 'aap/saisi'), {
        status: 'draft',
        financeurId: 'f1',
        title: 'x',
        source: 'manual',
        validation: A_VALIDER,
      }),
    );
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
    await assertSucceeds(
      updateDoc(doc(porteur(), 'users/porteur1'), { profileComplete: true, cguAccepteLe: new Date() }),
    );
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
    await assertFails(
      setDoc(doc(financeur(), 'aap/sans'), { status: 'draft', financeurId: 'f1', title: 'x', source: 'manual' }),
    );
    await assertFails(
      setDoc(doc(financeur(), 'aap/auto'), {
        status: 'draft',
        financeurId: 'f1',
        title: 'x',
        source: 'manual',
        validation: { statut: 'proposee', par: 'Monsieur DUCOUT' },
      }),
    );
  });

  it('l’auteur ne publie ni ne modifie sans repasser l’appel « Proposée » ; il peut seulement le clôturer tel quel', async () => {
    await env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), 'aap/valide-f1'), {
        status: 'published',
        financeurId: 'f1',
        title: 'Validé',
        validation: { statut: 'validee', par: 'Monsieur DUCOUT' },
      }),
    );
    await assertFails(updateDoc(doc(financeur(), 'aap/valide-f1'), { title: 'Gagnez de l’argent sur http://x.fr' }));
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { status: 'published' }));
    await assertSucceeds(
      updateDoc(doc(financeur(), 'aap/valide-f1'), { title: 'Titre corrigé', validation: A_VALIDER }),
    );
    await env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), 'aap/valide-f2'), {
        status: 'published',
        financeurId: 'f1',
        title: 'Validé',
        validation: { statut: 'validee', par: 'Monsieur DUCOUT' },
      }),
    );
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/valide-f2'), { status: 'closed' }));
  });
});

// Relecture du 2026-11-25 (constat 6, volet règles) : le bloc scrapeMetadata est réservé à l'import (SDK admin) ; le tri
// (scripts/trier_file.py) y lit le contrôle du modèle et l'écran la thématique. Un financeur ne l'écrit ni à la création
// ni en modifiant son appel, et son appel naît avec la source « manual », comme l'écrit aapService.createAap.
describe('appels de financeurs : champs réservés à l’import', () => {
  const saisi = { status: 'draft', financeurId: 'f1', title: 'x', source: 'manual', validation: A_VALIDER };
  const faux = { source: 'ars_test', signature: 'x', champ: 'sante', verification: { estUnAppel: true, douteux: [] } };

  it('à la création : ni bloc scrapeMetadata, ni source absente', async () => {
    await assertFails(setDoc(doc(financeur(), 'aap/faux-controle'), { ...saisi, scrapeMetadata: faux }));
    await assertFails(
      setDoc(doc(financeur(), 'aap/sans-source'), {
        status: 'draft',
        financeurId: 'f1',
        title: 'x',
        validation: A_VALIDER,
      }),
    );
    await assertSucceeds(setDoc(doc(financeur(), 'aap/saisi-main'), saisi));
  });

  it('en modifiant son appel, l’auteur n’ajoute pas de bloc scrapeMetadata', async () => {
    await assertFails(updateDoc(doc(financeur(), 'aap/du-financeur'), { scrapeMetadata: faux, validation: A_VALIDER }));
    await assertFails(
      updateDoc(doc(financeur(), 'aap/du-financeur'), { 'scrapeMetadata.champ': 'sante', validation: A_VALIDER }),
    );
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/du-financeur'), { title: 'Corrigé', validation: A_VALIDER }));
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
    await env.withSecurityRulesDisabled(async (ctx) =>
      setDoc(doc(ctx.firestore(), 'messages/m2'), {
        senderId: 'f1',
        receiverId: 'porteur1',
        content: 'Bonjour',
        read: false,
      }),
    );
    await assertFails(updateDoc(doc(porteur(), 'messages/m2'), { content: 'Texte réécrit' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'messages/m2'), { read: true }));
  });
});

// Question 50 (« construire » de Monsieur DUCOUT, 2026-11-26) : la page Messages lisait une collection `conversations`
// que rien n'écrivait ni ne couvrait. Une conversation par candidature envoyée (identifiant = celui de la candidature),
// entre ses deux seuls participants ; les messages restent dans `messages` (export des données personnelles).
describe('messagerie : une conversation par candidature (question 50)', () => {
  const conversation = {
    participants: ['porteur1', 'f1'],
    applicationId: 'c2',
    titre: 'Projet de test',
    appel: 'Appel de test',
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    nonLuPar: null,
  };
  const semer = () =>
    env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'conversations/c2'), { ...conversation, lastMessageAt: new Date() });
    });
  const message = (db: ReturnType<typeof porteur>, id: string, de: string, a: string, contenu = 'Bonjour', fil = 'c2') =>
    setDoc(doc(db, `messages/${id}`), {
      conversationId: fil,
      senderId: de,
      receiverId: a,
      content: contenu,
      createdAt: serverTimestamp(),
      read: false,
    });

  it('un participant ouvre la conversation d’une candidature envoyée ; ni tiers, ni brouillon, ni suivi externe', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'applications/c3'), {
        porteurId: 'porteur1',
        financeurId: 'f1',
        status: 'submitted',
        externe: true,
      });
    });
    await assertFails(setDoc(doc(porteur2(), 'conversations/c2'), { ...conversation, participants: ['porteur2', 'f1'] }));
    await assertFails(setDoc(doc(porteur(), 'conversations/c2'), { ...conversation, participants: ['porteur1', 'porteur2'] }));
    await assertFails(setDoc(doc(porteur(), 'conversations/c1'), { ...conversation, applicationId: 'c1' }));
    await assertFails(setDoc(doc(porteur(), 'conversations/c3'), { ...conversation, applicationId: 'c3' }));
    await assertFails(setDoc(doc(porteur(), 'conversations/c2'), { ...conversation, nonLuPar: 'f1', autre: 1 }));
    await assertSucceeds(setDoc(doc(financeur(), 'conversations/c2'), conversation));
  });

  it('seuls les deux participants la lisent, aussi par la liste ; une conversation absente se constate', async () => {
    await semer();
    await assertSucceeds(getDoc(doc(porteur(), 'conversations/c2')));
    await assertSucceeds(
      getDocs(query(collection(financeur(), 'conversations'), where('participants', 'array-contains', 'f1'))),
    );
    await assertFails(getDoc(doc(porteur2(), 'conversations/c2')));
    await assertFails(
      getDocs(query(collection(porteur2(), 'conversations'), where('participants', 'array-contains', 'porteur1'))),
    );
    await assertSucceeds(getDoc(doc(porteur(), 'conversations/absente')));
  });

  it('un message va de l’expéditeur connecté à l’autre participant, de 1 à 5 000 caractères', async () => {
    await semer();
    await assertSucceeds(message(financeur(), 'm10', 'f1', 'porteur1', 'Pouvez-vous préciser votre budget ?'));
    await assertSucceeds(message(porteur(), 'm11', 'porteur1', 'f1', 'a'.repeat(5000)));
    await assertFails(message(porteur(), 'm12', 'f1', 'porteur1'));
    await assertFails(message(porteur(), 'm13', 'porteur1', 'porteur2'));
    await assertFails(message(porteur2(), 'm14', 'porteur2', 'f1'));
    await assertFails(message(porteur(), 'm15', 'porteur1', 'f1', ''));
    await assertFails(message(porteur(), 'm16', 'porteur1', 'f1', 'a'.repeat(5001)));
    await assertFails(message(porteur(), 'm17', 'porteur1', 'f1', 'Bonjour', 'c1'));
    await assertSucceeds(
      getDocs(query(collection(porteur(), 'messages'), where('conversationId', '==', 'c2'), where('receiverId', '==', 'porteur1'))),
    );
    await assertFails(
      getDocs(query(collection(porteur2(), 'messages'), where('conversationId', '==', 'c2'), where('receiverId', '==', 'porteur1'))),
    );
  });

  // Relecture adverse du chantier 50 (2026-11-27, constats confirmés)
  it('relecture : date du serveur, compte actif, participants réels, tiers refusé même avec les bons participants', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'applications/importee'), { porteurId: 'porteur1', financeurId: 'scraped', status: 'submitted' });
      await setDoc(doc(db, 'applications/anonyme'), { porteurId: 'compte-supprime', financeurId: 'f1', status: 'submitted' });
      await setDoc(doc(db, 'applications/sans-financeur'), { porteurId: 'porteur1', financeurId: '', status: 'submitted' });
    });
    await assertFails(setDoc(doc(porteur2(), 'conversations/c2'), conversation));
    await assertFails(setDoc(doc(financeur(), 'conversations/c2'), { ...conversation, lastMessageAt: 'x' }));
    await assertFails(setDoc(doc(financeur(), 'conversations/c2'), { ...conversation, lastMessageAt: new Date('9999-01-01') }));
    await assertFails(
      setDoc(doc(porteur(), 'conversations/importee'), { ...conversation, applicationId: 'importee', participants: ['porteur1', 'scraped'] }),
    );
    await assertFails(
      setDoc(doc(financeur(), 'conversations/anonyme'), { ...conversation, applicationId: 'anonyme', participants: ['compte-supprime', 'f1'] }),
    );
    await assertFails(
      setDoc(doc(porteur(), 'conversations/sans-financeur'), { ...conversation, applicationId: 'sans-financeur', participants: ['porteur1', ''] }),
    );
    await semer();
    await assertFails(updateDoc(doc(financeur(), 'conversations/c2'), { lastMessageAt: 'x' }));
    await assertFails(updateDoc(doc(financeur(), 'conversations/c2'), { lastMessageAt: new Date('9999-01-01') }));
    // Compte suspendu ou expiré : plus d'écriture par la conversation, sauf effacer sa marque « non lu »
    await env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(doc(ctx.firestore(), 'users/f1'), { subscriptionStatus: 'cancelled' });
      await updateDoc(doc(ctx.firestore(), 'conversations/c2'), { nonLuPar: 'f1' });
    });
    await assertFails(
      updateDoc(doc(financeur(), 'conversations/c2'), { lastMessage: 'Rappelez-moi', lastMessageAt: serverTimestamp(), nonLuPar: 'porteur1' }),
    );
    await assertSucceeds(updateDoc(doc(financeur(), 'conversations/c2'), { nonLuPar: null }));
    await env.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(doc(ctx.firestore(), 'conversations/c2'));
    });
    await assertFails(setDoc(doc(financeur(), 'conversations/c2'), conversation));
  });

  // Question 54 (« Effacer », 2026-11-27) : à la suppression du compte, ses messages envoyés disparaissent, l'autre
  // garde les siens ; l'aperçu du dernier message est vidé. Jamais avant la suppression (document users effacé).
  it('messages envoyés effacés avec le compte, jamais avant ; ni ceux reçus ; aperçu vidé', async () => {
    await semer();
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'messages/envoye'), { conversationId: 'c2', senderId: 'porteur1', receiverId: 'f1', content: 'Mon budget', read: false });
      await setDoc(doc(db, 'messages/recu'), { conversationId: 'c2', senderId: 'f1', receiverId: 'porteur1', content: 'Question', read: false });
      await updateDoc(doc(db, 'conversations/c2'), { lastMessage: 'Mon budget' });
    });
    await assertFails(deleteDoc(doc(porteur(), 'messages/envoye')));
    await env.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(doc(ctx.firestore(), 'users/porteur1'));
    });
    await assertFails(deleteDoc(doc(porteur(), 'messages/recu')));
    await assertSucceeds(deleteDoc(doc(porteur(), 'messages/envoye')));
    await assertFails(updateDoc(doc(porteur(), 'conversations/c2'), { lastMessage: 'autre texte' }));
    await assertSucceeds(updateDoc(doc(porteur(), 'conversations/c2'), { lastMessage: '' }));
  });

  it('la conversation garde ses participants ; l’envoi la met en non lue pour l’autre, la lecture l’efface', async () => {
    await semer();
    await assertSucceeds(
      updateDoc(doc(porteur(), 'conversations/c2'), { lastMessage: 'Oui', lastMessageAt: serverTimestamp(), nonLuPar: 'f1' }),
    );
    await assertSucceeds(updateDoc(doc(financeur(), 'conversations/c2'), { nonLuPar: null }));
    await assertFails(updateDoc(doc(porteur(), 'conversations/c2'), { participants: ['porteur1', 'porteur2'] }));
    await assertFails(updateDoc(doc(porteur(), 'conversations/c2'), { nonLuPar: 'porteur2' }));
    await assertFails(updateDoc(doc(porteur(), 'conversations/c2'), { lastMessage: 'a'.repeat(201) }));
    await assertFails(updateDoc(doc(porteur2(), 'conversations/c2'), { nonLuPar: null }));
    await assertFails(deleteDoc(doc(porteur(), 'conversations/c2')));
  });
});

// Décision 35 du 2026-11-24 : l'ouverture d'une fiche par un compte connecté ajoute 1 à son compteur de vues ; cette
// écriture ne permet rien d'autre. Question 52 (« oui » du 2026-11-26) : une vue par compte et par appel ; l'ajout
// s'accompagne, dans la même écriture, de la marque de vue du compte (`aap/{id}/vues/{uid}`), qui ne s'écrit qu'une fois.
function ecrireUneVue(db: ReturnType<typeof porteur>, id: string, uid: string, donnees: object = { views: increment(1) }) {
  const lot = writeBatch(db);
  lot.set(doc(db, `aap/${id}/vues/${uid}`), { vueLe: serverTimestamp(), uid });
  lot.update(doc(db, `aap/${id}`), donnees);
  return lot.commit();
}

describe('aap : compteur de vues', () => {
  it('une vue par compte : la première ouverture compte, la seconde est refusée, un autre compte compte', async () => {
    await assertSucceeds(ecrireUneVue(porteur(), 'publie', 'porteur1'));
    await assertFails(ecrireUneVue(porteur(), 'publie', 'porteur1'));
    // Marque déjà écrite : un ajout seul la trouve « présente après » ; seule la condition « absente avant » le refuse
    await assertFails(updateDoc(doc(porteur(), 'aap/publie'), { views: increment(1) }));
    await assertSucceeds(ecrireUneVue(porteur2(), 'publie', 'porteur2'));
    await env.withSecurityRulesDisabled(async (ctx) => {
      expect((await getDoc(doc(ctx.firestore(), 'aap/publie'))).data()?.views).toBe(2);
    });
  });
  it('ni vue sans marque, ni marque sans vue, ni marque d’un autre compte ; marque ni lue, ni réécrite, ni effacée', async () => {
    await assertFails(updateDoc(doc(porteur(), 'aap/publie'), { views: increment(1) }));
    await assertFails(setDoc(doc(porteur(), 'aap/publie/vues/porteur1'), { vueLe: serverTimestamp() }));
    await assertFails(ecrireUneVue(porteur(), 'publie', 'porteur2'));
    const db = porteur();
    const lot = writeBatch(db);
    lot.set(doc(db, 'aap/publie/vues/porteur1'), { vueLe: serverTimestamp(), uid: 'porteur1', autre: 1 });
    lot.update(doc(db, 'aap/publie'), { views: increment(1) });
    await assertFails(lot.commit());
    await assertSucceeds(ecrireUneVue(porteur(), 'publie', 'porteur1'));
    await assertFails(getDoc(doc(porteur(), 'aap/publie/vues/porteur1')));
    await assertFails(updateDoc(doc(porteur(), 'aap/publie/vues/porteur1'), { vueLe: serverTimestamp() }));
    await assertFails(deleteDoc(doc(porteur(), 'aap/publie/vues/porteur1')));
  });
  // Décision « Effacer avec le compte » (2026-11-27, RGPD) : la marque porte l'identifiant du compte, qui retrouve ses
  // seules marques et les efface avec son compte (document users déjà effacé), jamais avant : il recompterait sa vue
  it('marques effacées avec le compte, jamais avant ; celles des autres ni lues ni effacées', async () => {
    const db = porteur();
    const sansIdentifiant = writeBatch(db);
    sansIdentifiant.set(doc(db, 'aap/publie/vues/porteur1'), { vueLe: serverTimestamp(), uid: 'porteur2' });
    sansIdentifiant.update(doc(db, 'aap/publie'), { views: increment(1) });
    await assertFails(sansIdentifiant.commit());
    await assertSucceeds(ecrireUneVue(porteur(), 'publie', 'porteur1'));
    await assertSucceeds(ecrireUneVue(porteur2(), 'publie', 'porteur2'));
    const marquesDe = (base: ReturnType<typeof porteur>, uid: string) =>
      getDocs(query(collectionGroup(base, 'vues'), where('uid', '==', uid)));
    await assertSucceeds(marquesDe(porteur(), 'porteur1'));
    await assertFails(marquesDe(porteur2(), 'porteur1'));
    await assertFails(deleteDoc(doc(porteur(), 'aap/publie/vues/porteur1')));
    await env.withSecurityRulesDisabled(async (ctx) => {
      await deleteDoc(doc(ctx.firestore(), 'users/porteur1'));
    });
    await assertFails(deleteDoc(doc(porteur(), 'aap/publie/vues/porteur2')));
    await assertSucceeds(deleteDoc(doc(porteur(), 'aap/publie/vues/porteur1')));
    // Sans document users, plus de vue comptée : effacer ses marques ne permet pas de recompter
    await assertFails(ecrireUneVue(porteur(), 'publie', 'porteur1'));
  });
  // Relecture du chantier 52 (2026-11-26, constat confirmé) : le financeur auteur écrivait lui-même `views`, sans
  // marque, à la création comme à la modification de son appel ; la spec n'accepte une vue qu'avec sa marque
  it('le financeur auteur ne fixe pas lui-même le compteur de vues', async () => {
    await assertFails(updateDoc(doc(financeur(), 'aap/ouvert-f1'), { views: 5000, validation: A_VALIDER }));
    const appel = { status: 'draft', financeurId: 'f1', title: 'x', source: 'manual', validation: A_VALIDER };
    await assertFails(setDoc(doc(financeur(), 'aap/gonfle'), { ...appel, views: 5000 }));
    await assertSucceeds(setDoc(doc(financeur(), 'aap/neuf'), { ...appel, views: 0 }));
    await assertSucceeds(updateDoc(doc(financeur(), 'aap/ouvert-f1'), { title: 'retouché', validation: A_VALIDER }));
  });
  it('ni deux vues d’un coup, ni un nombre choisi, ni un autre champ, ni un brouillon, ni sans compte', async () => {
    await assertFails(ecrireUneVue(porteur(), 'publie', 'porteur1', { views: increment(2) }));
    await assertFails(ecrireUneVue(porteur(), 'publie', 'porteur1', { views: 1000 }));
    await assertFails(ecrireUneVue(porteur(), 'publie', 'porteur1', { views: increment(1), title: 'Réécrit' }));
    await assertFails(ecrireUneVue(porteur(), 'brouillon', 'porteur1'));
    await assertFails(ecrireUneVue(visiteur(), 'publie', 'porteur1'));
  });
  // Relecture du 2026-11-25 (constats 2 et 43) : un appel publié encore « Proposée » ou « à corriger » est fermé au
  // candidat (« AAP non trouvé ») ; il ne compte pas de vue, comme visiblePubliquement à l'écran
  it('pas de vue sur un appel publié encore « Proposée » ou « à corriger » ; une vue sur un appel validé', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'aap/propose'), {
        status: 'published',
        financeurId: 'f1',
        title: 'Proposé',
        validation: { statut: 'proposee', par: '' },
      });
      await setDoc(doc(db, 'aap/a-corriger'), {
        status: 'published',
        financeurId: 'scraped',
        title: 'À corriger',
        validation: { statut: 'a_corriger', par: 'claude-haiku-5-5' },
      });
    });
    await assertFails(ecrireUneVue(porteur(), 'propose', 'porteur1'));
    await assertFails(ecrireUneVue(porteur(), 'a-corriger', 'porteur1'));
    await assertSucceeds(ecrireUneVue(porteur(), 'ouvert-f1', 'porteur1'));
  });
});

// Changement securite-vues-messagerie, question 49 (décision « maintenant » de Monsieur DUCOUT, 2026-11-26) : un compte
// en période d'essai lisait par le kit Firebase les brouillons et les appels rejetés, un visiteur un appel publié encore
// « Proposée » ; l'écran ne les montrait pas, mais les données sortaient. Seuls l'administrateur et le financeur auteur
// lisent un appel qui n'est pas publié (ou clôturé) et visible. Firestore ne filtre pas : une requête de liste que la
// règle ne peut pas prouver est refusée en entier, d'où une requête par forme écrite par les pages.
describe('aap : lecture réservée aux appels publiés et visibles (question 49)', () => {
  const debut = new Date(Date.UTC(2026, 11, 1));
  const fin = new Date(Date.UTC(2026, 11, 31, 23, 59, 59));
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'aap/propose-f1'), {
        status: 'published',
        financeurId: 'f1',
        title: 'Proposé',
        validation: { statut: 'proposee', par: '' },
      });
      await setDoc(doc(db, 'aap/a-corriger'), {
        status: 'published',
        financeurId: 'scraped',
        title: 'À corriger',
        validation: { statut: 'a_corriger', par: 'claude-haiku-5-5' },
      });
      await setDoc(doc(db, 'aap/rejete'), {
        status: 'archived',
        financeurId: 'scraped',
        title: 'Rejeté',
        validation: { statut: 'rejetee', par: 'Monsieur DUCOUT' },
      });
      await setDoc(doc(db, 'aap/valide'), {
        status: 'published',
        financeurId: 'scraped',
        title: 'Validé',
        validation: { statut: 'validee', par: 'claude-haiku-5-5' },
        publishedAt: new Date(Date.UTC(2026, 10, 20)),
        createdAt: new Date(Date.UTC(2026, 10, 20)),
        deadline: new Date(Date.UTC(2026, 11, 15)),
      });
      await setDoc(doc(db, 'aap/close-valide'), {
        status: 'closed',
        financeurId: 'scraped',
        title: 'Clôturé, validé',
        validation: { statut: 'validee', par: 'claude-haiku-5-5' },
      });
      // Contre-vérification : un appel clôturé mais non validé reste fermé
      await setDoc(doc(db, 'aap/close-propose'), {
        status: 'closed',
        financeurId: 'scraped',
        title: 'Clôturé, non validé',
        validation: { statut: 'proposee', par: '' },
      });
    });
  });

  const NON_VISIBLES = [
    'brouillon',
    'du-financeur',
    'rejete',
    'archive-f1',
    'propose-f1',
    'a-corriger',
    'close-propose',
  ];

  it('un candidat en essai et un visiteur ne lisent ni brouillon, ni appel rejeté, ni appel publié « Proposée » ou « à corriger »', async () => {
    for (const lecteur of [porteur(), visiteur()]) {
      for (const id of NON_VISIBLES) await assertFails(getDoc(doc(lecteur, `aap/${id}`)));
    }
  });

  it('ni en requête de liste : brouillons, archivés, publiés sans contrainte de validation, « Proposée », collection entière', async () => {
    for (const lecteur of [porteur(), visiteur()]) {
      const aap = collection(lecteur, 'aap');
      await assertFails(getDocs(query(aap, where('status', '==', 'draft'))));
      await assertFails(getDocs(query(aap, where('status', '==', 'archived'))));
      await assertFails(getDocs(query(aap, where('status', '==', 'published'))));
      await assertFails(
        getDocs(query(aap, where('status', '==', 'published'), where('validation.statut', '==', 'proposee'))),
      );
      await assertFails(getDocs(query(aap, where('validation.statut', '==', 'validee'))));
      await assertFails(getDocs(aap));
    }
  });

  it('un appel publié ou clôturé et validé se lit sans compte ; un appel publié sans bloc de validation aussi', async () => {
    for (const lecteur of [visiteur(), porteur(), expire()]) {
      await assertSucceeds(getDoc(doc(lecteur, 'aap/valide')));
      await assertSucceeds(getDoc(doc(lecteur, 'aap/ouvert-f1')));
      await assertSucceeds(getDoc(doc(lecteur, 'aap/close-valide')));
      // Appel saisi à la main avant la validation obligatoire du 2026-11-24 (scripts/valider_publiees_sans_bloc.py)
      await assertSucceeds(getDoc(doc(lecteur, 'aap/publie')));
    }
  });

  it('le financeur auteur et l’administrateur lisent tous les appels qui leur reviennent', async () => {
    for (const id of ['du-financeur', 'archive-f1', 'propose-f1', 'ouvert-f1']) {
      await assertSucceeds(getDoc(doc(financeur(), `aap/${id}`)));
    }
    await assertFails(getDoc(doc(financeur(), 'aap/brouillon')));
    for (const id of [...NON_VISIBLES, 'valide', 'publie']) await assertSucceeds(getDoc(doc(admin(), `aap/${id}`)));
  });

  // Une requête par forme écrite par les pages après la correction (les mêmes filtres et le même tri)
  it('recherche, tableau de bord du candidat et service des appels : publiés et validés, triés par publication', async () => {
    for (const lecteur of [visiteur(), porteur(), financeur(), admin()]) {
      const aap = collection(lecteur, 'aap');
      const publiesValides = [where('status', '==', 'published'), where('validation.statut', '==', 'validee')];
      // SearchAapPage, PorteurDashboard, aapService.searchAaps
      await assertSucceeds(getDocs(query(aap, ...publiesValides, orderBy('publishedAt', 'desc'))));
      // aapService.getPublishedAaps
      await assertSucceeds(getDocs(query(aap, ...publiesValides, orderBy('publishedAt', 'desc'), limit(20))));
    }
  });

  it('recommandations : publiés et validés, sans tri ; le résultat ne contient que les appels visibles', async () => {
    for (const lecteur of [visiteur(), porteur()]) {
      const lus = await assertSucceeds(
        getDocs(
          query(
            collection(lecteur, 'aap'),
            where('status', '==', 'published'),
            where('validation.statut', '==', 'validee'),
          ),
        ),
      );
      // « publie » (sans bloc de validation) ne sort pas de cette requête : il attend la migration
      expect(lus.docs.map((d) => d.id).sort()).toEqual(['ouvert-f1', 'valide']);
    }
  });

  it('calendrier du candidat : publiés, validés, clôture dans le mois', async () => {
    const lus = await assertSucceeds(
      getDocs(
        query(
          collection(porteur(), 'aap'),
          where('status', '==', 'published'),
          where('validation.statut', '==', 'validee'),
          where('deadline', '>=', debut),
          where('deadline', '<=', fin),
        ),
      ),
    );
    expect(lus.docs.map((d) => d.id)).toEqual(['valide']);
  });

  it('pages du financeur : ses appels, avec ou sans statut, tri et bornes du calendrier', async () => {
    const aap = collection(financeur(), 'aap');
    // FinanceurDashboard, StatisticsPage, export des données
    const siens = await assertSucceeds(getDocs(query(aap, where('financeurId', '==', 'f1'))));
    expect(siens.docs.map((d) => d.id).sort()).toEqual(['archive-f1', 'du-financeur', 'ouvert-f1', 'propose-f1']);
    // Mes appels (aapService.getFinanceurAaps)
    await assertSucceeds(getDocs(query(aap, where('financeurId', '==', 'f1'), orderBy('createdAt', 'desc'))));
    // Calendrier du financeur
    await assertSucceeds(
      getDocs(
        query(
          aap,
          where('financeurId', '==', 'f1'),
          where('status', '==', 'published'),
          where('deadline', '>=', debut),
          where('deadline', '<=', fin),
        ),
      ),
    );
    // Les appels d'un autre compte ne se listent pas par ce chemin
    await assertFails(getDocs(query(aap, where('financeurId', '==', 'scraped'))));
  });

  it('administration : collection entière, derniers appels créés, appels publiés', async () => {
    const aap = collection(admin(), 'aap');
    await assertSucceeds(getDocs(aap));
    await assertSucceeds(getDocs(query(aap, orderBy('createdAt', 'desc'), limit(3))));
    await assertSucceeds(getDocs(query(aap, where('status', '==', 'published'))));
  });
});

// Changement securite-vues-messagerie (question 51, décision « Registre des suspensions » de Monsieur DUCOUT du
// 2026-11-26) : un compte suspendu supprimait son document users puis le recréait en essai, ou créait un nouveau compte
// avec la même adresse. La suspension laisse deux fiches, suspensions/{uid} et suspensions/email:<adresse en minuscules>,
// que seul l'administrateur lit, écrit ou efface.
describe('comptes suspendus : registre des suspensions (question 51)', () => {
  const ADRESSE = 'porteur1@exemple.fr';
  const FICHE = { uid: 'porteur1', email: ADRESSE, le: new Date(2026, 10, 26), par: 'admin1' };
  const suspendu = () => env.authenticatedContext('porteur1', { email: ADRESSE }).firestore();

  // État après une suspension par l'administrateur : document en « cancelled » et ses deux fiches
  const suspendre = () =>
    env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, 'users/porteur1'), { userType: 'porteur', subscriptionStatus: 'cancelled', email: ADRESSE });
      await setDoc(doc(db, 'suspensions/porteur1'), FICHE);
      await setDoc(doc(db, `suspensions/email:${ADRESSE}`), FICHE);
    });

  it('l’administrateur lit, liste, écrit et efface les fiches de suspension', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'suspensions/porteur2'), { ...FICHE, uid: 'porteur2' }));
    await assertSucceeds(setDoc(doc(admin(), 'suspensions/email:porteur2@exemple.fr'), { ...FICHE, uid: 'porteur2' }));
    await assertSucceeds(getDoc(doc(admin(), 'suspensions/porteur2')));
    await assertSucceeds(getDocs(collection(admin(), 'suspensions')));
    await assertSucceeds(deleteDoc(doc(admin(), 'suspensions/porteur2')));
    await assertSucceeds(deleteDoc(doc(admin(), 'suspensions/email:porteur2@exemple.fr')));
  });

  it('le compte suspendu ne lit ni n’efface sa fiche ; personne d’autre n’en écrit', async () => {
    await suspendre();
    await assertFails(getDoc(doc(suspendu(), 'suspensions/porteur1')));
    await assertFails(getDoc(doc(suspendu(), `suspensions/email:${ADRESSE}`)));
    await assertFails(deleteDoc(doc(suspendu(), 'suspensions/porteur1')));
    await assertFails(deleteDoc(doc(suspendu(), `suspensions/email:${ADRESSE}`)));
    await assertFails(getDocs(collection(porteur2(), 'suspensions')));
    await assertFails(setDoc(doc(porteur2(), 'suspensions/porteur2'), { ...FICHE, uid: 'porteur2' }));
    await assertFails(getDoc(doc(visiteur(), 'suspensions/porteur1')));
  });

  it('le compte suspendu supprime son document users, mais ne le recrée pas en essai', async () => {
    await suspendre();
    await assertSucceeds(deleteDoc(doc(suspendu(), 'users/porteur1')));
    await assertFails(
      setDoc(doc(suspendu(), 'users/porteur1'), { userType: 'porteur', subscriptionStatus: 'trial', email: ADRESSE }),
    );
  });

  it('par son identifiant seul : fiche suspensions/{uid} sans fiche d’adresse, création refusée', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => setDoc(doc(ctx.firestore(), 'suspensions/porteur9'), FICHE));
    const sansAdresse = env.authenticatedContext('porteur9').firestore();
    await assertFails(setDoc(doc(sansAdresse, 'users/porteur9'), { userType: 'porteur', subscriptionStatus: 'trial' }));
  });

  // Document écrit avec l'adresse du jeton, comme AuthContext : seule la suspension produit le refus
  it('nouvel identifiant, même adresse (casse comprise) : création refusée', async () => {
    await suspendre();
    const meme = env.authenticatedContext('nouvel-id', { email: ADRESSE }).firestore();
    await assertFails(
      setDoc(doc(meme, 'users/nouvel-id'), { userType: 'porteur', subscriptionStatus: 'trial', email: ADRESSE }),
    );
    const majuscules = env.authenticatedContext('autre-id', { email: 'Porteur1@Exemple.FR' }).firestore();
    await assertFails(
      setDoc(doc(majuscules, 'users/autre-id'), {
        userType: 'financeur',
        subscriptionStatus: 'trial',
        email: 'Porteur1@Exemple.FR',
      }),
    );
  });

  // Contre-vérification du 2026-11-26 : le compte écrivait une adresse leurre dans le champ email de son document ;
  // la suspension inscrivait alors la fiche suspensions/email:<leurre>, et un nouvel identifiant sous la vraie adresse
  // recréait un compte en essai (et le vrai titulaire de l'adresse leurre se trouvait bloqué)
  it('le champ email du document est l’adresse de connexion : adresse leurre ou absente refusée', async () => {
    const malin = env.authenticatedContext('malin', { email: 'malin@exemple.fr' }).firestore();
    const essai = { userType: 'porteur', subscriptionStatus: 'trial' };
    await assertFails(setDoc(doc(malin, 'users/malin'), { ...essai, email: 'leurre@exemple.fr' }));
    await assertFails(setDoc(doc(malin, 'users/malin'), essai));
    await assertSucceeds(setDoc(doc(malin, 'users/malin'), { ...essai, email: 'malin@exemple.fr' }));
    // Compte de test sans adresse dans son jeton : document sans adresse (ou adresse nulle) accepté, adresse inventée
    // refusée
    const sansAdresse = env.authenticatedContext('sans-adresse').firestore();
    await assertFails(setDoc(doc(sansAdresse, 'users/sans-adresse'), { ...essai, email: 'leurre@exemple.fr' }));
    await assertSucceeds(setDoc(doc(sansAdresse, 'users/sans-adresse'), { ...essai, email: null }));
    await deleteDoc(doc(sansAdresse, 'users/sans-adresse'));
    await assertSucceeds(setDoc(doc(sansAdresse, 'users/sans-adresse'), essai));
  });

  it('compte rétabli : fiches effacées par l’administrateur, le compte recrée son document', async () => {
    await suspendre();
    await assertSucceeds(deleteDoc(doc(suspendu(), 'users/porteur1')));
    await assertSucceeds(deleteDoc(doc(admin(), 'suspensions/porteur1')));
    await assertSucceeds(deleteDoc(doc(admin(), `suspensions/email:${ADRESSE}`)));
    await assertSucceeds(
      setDoc(doc(suspendu(), 'users/porteur1'), { userType: 'porteur', subscriptionStatus: 'trial', email: ADRESSE }),
    );
  });

  it('un compte non suspendu supprime puis recrée son document ; une autre adresse n’est pas bloquée', async () => {
    await suspendre();
    const libre = env.authenticatedContext('porteur2', { email: 'porteur2@exemple.fr' }).firestore();
    await assertSucceeds(deleteDoc(doc(libre, 'users/porteur2')));
    await assertSucceeds(
      setDoc(doc(libre, 'users/porteur2'), {
        userType: 'porteur',
        subscriptionStatus: 'trial',
        email: 'porteur2@exemple.fr',
      }),
    );
  });
});
