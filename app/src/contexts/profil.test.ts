// Test de la fusion du profil relu (changement premier-clic-candidater, tâche 1.1).
import { describe, expect, it } from 'vitest';
import { fusionnerProfil } from './profil';

describe('fusionnerProfil', () => {
  it('une relecture partielle ne fait pas perdre le rôle ni l abonnement', () => {
    const connu = {
      uid: 'u1',
      email: 'a@b.fr',
      userType: 'porteur',
      subscriptionStatus: 'trial',
      demarrage: { fiche: true },
    };
    expect(fusionnerProfil(connu, 'u1', { demarrage: { fiche: true, candidature: true } })).toEqual({
      uid: 'u1',
      email: 'a@b.fr',
      userType: 'porteur',
      subscriptionStatus: 'trial',
      demarrage: { fiche: true, candidature: true },
    });
  });
  it('sans profil connu, ou pour un autre compte, le document relu fait foi', () => {
    expect(fusionnerProfil(null, 'u1', { userType: 'financeur' })).toEqual({ uid: 'u1', userType: 'financeur' });
    expect(fusionnerProfil({ uid: 'u0', userType: 'admin' }, 'u1', { userType: 'porteur' })).toEqual({
      uid: 'u1',
      userType: 'porteur',
    });
  });
});
