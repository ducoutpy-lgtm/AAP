// Messages d'erreur compréhensibles (plan niveau A, lot 3.1, 2026-11-24) : les écrans montraient tel quel le texte
// anglais de Firebase (« Firebase: Error (auth/invalid-credential). »).
import { describe, expect, it } from 'vitest';
import { messageErreur } from './erreurs';

const firebase = (code: string) => Object.assign(new Error(`Firebase: Error (${code}).`), { code });

describe('messageErreur', () => {
  it('traduit les codes Firebase courants', () => {
    expect(messageErreur(firebase('auth/invalid-credential'), 'x')).toBe('Adresse ou mot de passe incorrect.');
    expect(messageErreur(firebase('auth/email-already-in-use'), 'x')).toBe('Un compte existe déjà avec cette adresse.');
    expect(messageErreur(firebase('auth/popup-closed-by-user'), 'x')).toMatch(/fermée/);
    expect(messageErreur(firebase('permission-denied'), 'x')).toMatch(/droits/);
    expect(messageErreur(firebase('unavailable'), 'x')).toMatch(/connexion/i);
  });

  it('garde un message français écrit par l’application, remplace un message technique par le message prévu', () => {
    expect(messageErreur(new Error('Non authentifié'), 'Erreur')).toBe('Non authentifié');
    expect(messageErreur(firebase('auth/code-inconnu'), 'Échec de la connexion')).toBe('Échec de la connexion');
    expect(messageErreur(new Error('Firebase: Error (internal).'), 'Échec')).toBe('Échec');
    expect(messageErreur('texte', 'Échec')).toBe('Échec');
    expect(messageErreur(new Error(''), 'Échec')).toBe('Échec');
  });
});
