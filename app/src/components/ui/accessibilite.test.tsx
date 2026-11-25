// Clavier et fenêtre modale (plan niveau A, lot 3.3, 2026-11-25) : les cartes cliquables (recherche, recommandations,
// candidatures, notifications) n'étaient pas atteignables au clavier ; la fenêtre modale n'avait ni rôle, ni fermeture
// par Échap, ni libellé sur sa croix, et laissait le focus derrière elle.
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Card } from './Card';
import { Modal } from './Modal';

describe('carte cliquable', () => {
  afterEach(cleanup);

  it('atteinte par Tab, ouverte par Entrée ou Espace ; une touche dans un bouton intérieur ne l’ouvre pas', () => {
    const ouvrir = vi.fn();
    render(<Card onClick={ouvrir}><p>Appel test</p><button type="button">Favori</button></Card>);
    const carte = screen.getByRole('button', { name: /Appel test/ });
    expect(carte).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(carte, { key: 'Enter' });
    fireEvent.keyDown(carte, { key: ' ' });
    expect(ouvrir).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Favori' }), { key: 'Enter' });
    expect(ouvrir).toHaveBeenCalledTimes(2);
  });

  it('une carte sans action reste un simple bloc, hors de la tabulation', () => {
    render(<Card><p>Texte</p></Card>);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

function Essai() {
  const [ouverte, setOuverte] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOuverte(true)}>Ouvrir</button>
      <Modal isOpen={ouverte} onClose={() => setOuverte(false)} title="Qualifier la fiche">
        <button type="button">Valider</button>
      </Modal>
    </>
  );
}

describe('fenêtre modale', () => {
  afterEach(cleanup);

  it('rôle dialog nommé par son titre, focus dedans, croix « Fermer », Échap ferme et rend le focus', () => {
    render(<Essai />);
    const declencheur = screen.getByRole('button', { name: 'Ouvrir' });
    declencheur.focus();
    fireEvent.click(declencheur);
    const fenetre = screen.getByRole('dialog', { name: 'Qualifier la fiche' });
    expect(fenetre).toHaveAttribute('aria-modal', 'true');
    expect(fenetre.contains(document.activeElement)).toBe(true);
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(declencheur);
  });

  it('Tab reste dans la fenêtre : du dernier élément au premier', () => {
    render(<Essai />);
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir' }));
    const valider = screen.getByRole('button', { name: 'Valider' });
    valider.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Fermer' }));
  });
});
