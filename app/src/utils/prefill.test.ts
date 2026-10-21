// Tests du pré-remplissage depuis le dossier PDF (changement candidature-depuis-pdf, tâche 5.1).
import { describe, expect, it } from 'vitest';
import { fusionner, preRemplissageDepuis, verifierFichierPdf } from './prefill';

describe('verifierFichierPdf', () => {
  it('accepte un PDF raisonnable, refuse le reste', () => {
    expect(verifierFichierPdf({ name: 'dossier.pdf', type: 'application/pdf', size: 1024 })).toBeNull();
    expect(verifierFichierPdf({ name: 'DOSSIER.PDF', type: '', size: 1024 })).toBeNull();
    expect(verifierFichierPdf({ name: 'dossier.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1024 })).toMatch(/PDF/);
    expect(verifierFichierPdf({ name: 'dossier.pdf', type: 'application/pdf', size: 21 * 1024 * 1024 })).toMatch(/lourd/);
    expect(verifierFichierPdf({ name: 'dossier.pdf', type: 'application/pdf', size: 0 })).toMatch(/vide/);
  });
});

describe('preRemplissageDepuis et fusionner', () => {
  it('convertit la réponse du modèle, liste les manquants, garde la saisie du candidat', () => {
    const lu = preRemplissageDepuis({ titre_projet: ' Unité de soins palliatifs ', resume: 'Huit lits...', montant_demande: 125000.4, confiance: 'haute', remarque: '' });
    expect(lu).toEqual({ titre: 'Unité de soins palliatifs', resume: 'Huit lits...', montant: '125000', confiance: 'haute', remarque: '', manquants: [] });
    const partiel = preRemplissageDepuis({ titre_projet: 'X', montant_demande: null, confiance: 'bizarre' });
    expect(partiel.montant).toBe('');
    expect(partiel.confiance).toBe('basse');
    expect(partiel.manquants).toEqual(['le résumé', 'le montant demandé']);
    expect(preRemplissageDepuis(null).manquants).toHaveLength(3);
    expect(fusionner({ titre: 'Mon titre', resume: '', montant: '' }, lu)).toEqual({ titre: 'Mon titre', resume: 'Huit lits...', montant: '125000' });
  });
});
