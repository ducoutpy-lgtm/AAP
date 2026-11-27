// Messagerie (question 50, « construire » de Monsieur DUCOUT, 2026-11-26) : une conversation par candidature envoyée,
// entre le candidat et le financeur ; messages de 1 à 5 000 caractères. Fonctions pures du service.
import { describe, expect, it, vi } from 'vitest';

vi.mock('../config/firebase', () => ({ db: {} }));

import { apercu, contenuValide, conversationDeCandidature, fusionnerMessages, peutEcrire } from './messagerieService';

describe('conversation d’une candidature', () => {
  it('reprend les deux participants de la candidature, son identifiant et des titres bornés', () => {
    const c = conversationDeCandidature({
      id: 'c2',
      porteurId: 'p1',
      financeurId: 'f1',
      projectTitle: 'x'.repeat(400),
      aapTitle: 'Appel de test',
    });
    expect(c).toEqual({
      participants: ['p1', 'f1'],
      applicationId: 'c2',
      titre: 'x'.repeat(300),
      appel: 'Appel de test',
      lastMessage: '',
      nonLuPar: null,
    });
  });

  it('seule une candidature envoyée par l’application, entre deux comptes réels, ouvre une conversation', () => {
    const c = { porteurId: 'p1', financeurId: 'f1' };
    expect(peutEcrire({ ...c, status: 'submitted' })).toBe(true);
    expect(peutEcrire({ ...c, status: 'accepted' })).toBe(true);
    expect(peutEcrire({ ...c, status: 'draft' })).toBe(false);
    expect(peutEcrire({ ...c, status: 'submitted', externe: true })).toBe(false);
    // Relecture du 2026-11-27 : ni fiche importée, ni compte supprimé, ni financeur absent
    expect(peutEcrire({ status: 'submitted', porteurId: 'p1', financeurId: 'scraped' })).toBe(false);
    expect(peutEcrire({ status: 'submitted', porteurId: 'compte-supprime', financeurId: 'f1' })).toBe(false);
    expect(peutEcrire({ status: 'submitted', porteurId: 'p1', financeurId: '' })).toBe(false);
    expect(peutEcrire({ status: 'submitted', porteurId: 'p1' })).toBe(false);
  });
});

describe('messages', () => {
  it('de 1 à 5 000 caractères, espaces seuls refusés', () => {
    expect(contenuValide('Bonjour')).toBe(true);
    expect(contenuValide('a'.repeat(5000))).toBe(true);
    expect(contenuValide('a'.repeat(5001))).toBe(false);
    expect(contenuValide('')).toBe(false);
    expect(contenuValide('   ')).toBe(false);
  });

  it('aperçu du dernier message : espaces resserrés, 200 caractères au plus', () => {
    expect(apercu('  Pouvez-vous\n\npréciser   votre budget ?  ')).toBe('Pouvez-vous préciser votre budget ?');
    expect(apercu('a'.repeat(300))).toHaveLength(200);
  });

  it('les messages envoyés et reçus, réunis sans doublon et dans l’ordre', () => {
    const t = (s: number) => ({ toMillis: () => s * 1000 });
    const envoyes = [{ id: 'm2', createdAt: t(2) }];
    const recus = [
      { id: 'm1', createdAt: t(1) },
      { id: 'm3', createdAt: t(3) },
      { id: 'm2', createdAt: t(2) },
    ];
    expect(fusionnerMessages(envoyes, recus).map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
  });
});
