// Gabarit commun des pages légales (changement degel-application-complete, 2026-10-19). Texte en dur, sans gestion
// de contenu : trois pages, rarement modifiées, relues par Monsieur DUCOUT. Les données d'entreprise que le dépôt ne
// connaît pas sont marquées « À VALIDER » plutôt qu'inventées.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { EDITEUR } from './editeur';

export function AValider({ children }: { children: ReactNode }) {
  return <span className="bg-yellow-100 text-yellow-900 px-1 rounded">{children}</span>;
}

export function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{titre}</h2>
      <div className="space-y-3 text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

export function LegalLayout({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-primary-600 hover:underline text-sm">Retour à l'accueil</Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{titre}</h1>
        <p className="text-sm text-gray-500 mb-8">
          {EDITEUR.nomService}, édité par {EDITEUR.raisonSociale}. Dernière mise à jour : {EDITEUR.dateMiseAJour}.
        </p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">{children}</div>
        <nav className="mt-8 text-sm text-gray-600 flex flex-wrap gap-4">
          <Link to="/mentions-legales" className="hover:underline">Mentions légales</Link>
          <Link to="/cgu" className="hover:underline">Conditions générales d'utilisation</Link>
          <Link to="/confidentialite" className="hover:underline">Politique de confidentialité</Link>
        </nav>
      </div>
    </div>
  );
}
