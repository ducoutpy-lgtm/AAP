import { ReactNode, useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Fenêtre accessible (plan niveau A, lot 3.3, 2026-11-25) : rôle dialog nommé par son titre, croix « Fermer », Échap
// ferme ; à l'ouverture le focus entre dans la fenêtre, Tab y reste, et il revient à l'élément d'origine à la fermeture.
const FOCALISABLES =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const idTitre = useId();
  const fenetre = useRef<HTMLDivElement>(null);
  const fermer = useRef(onClose);
  fermer.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const origine = document.activeElement as HTMLElement | null;
    const elements = () => Array.from(fenetre.current?.querySelectorAll<HTMLElement>(FOCALISABLES) ?? []);
    (elements()[0] ?? fenetre.current)?.focus();
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        fermer.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const liste = elements();
      if (liste.length === 0) return;
      const premier = liste[0];
      const dernier = liste[liste.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener('keydown', touche);
    return () => {
      document.removeEventListener('keydown', touche);
      origine?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div
          ref={fenetre}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? idTitre : undefined}
          tabIndex={-1}
          className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full`}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b">
              <h3 id={idTitre} className="text-xl font-semibold text-gray-900">
                {title}
              </h3>
              <button
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
