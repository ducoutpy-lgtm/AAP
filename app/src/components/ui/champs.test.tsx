// Étiquettes reliées à leur champ (2026-11-20) : un lecteur d'écran annonce le nom du champ, et un clic sur
// l'étiquette place le curseur dans le champ. Sans ce lien, getByLabelText ne trouve pas le champ.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';

describe('étiquettes des champs', () => {
  it('Input : le champ se trouve par son étiquette, même obligatoire', () => {
    render(<Input label="Email" required />);
    expect(screen.getByLabelText(/Email/)).toBeInstanceOf(HTMLInputElement);
  });

  it('Select et Textarea : idem', () => {
    render(
      <>
        <Select label="Région" options={[{ value: 'idf', label: 'Île-de-France' }]} />
        <Textarea label="Résumé" />
      </>,
    );
    expect(screen.getByLabelText('Région')).toBeInstanceOf(HTMLSelectElement);
    expect(screen.getByLabelText('Résumé')).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('deux champs de même étiquette restent distincts', () => {
    render(
      <>
        <Input label="Nom" />
        <Input label="Nom" />
      </>,
    );
    const [a, b] = screen.getAllByLabelText('Nom');
    expect(a.id).not.toBe(b.id);
  });

  it('un identifiant donné par la page est conservé', () => {
    render(<Input label="Courriel" id="courriel" />);
    expect(screen.getByLabelText('Courriel').id).toBe('courriel');
  });
});
