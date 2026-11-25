import { ReactNode } from 'react';
import { activableAuClavier } from '../../utils/clavier';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const hoverClass = hover ? 'cursor-pointer hover:shadow-lg' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    // Carte cliquable atteinte par Tab et ouverte par Entrée ou Espace (plan niveau A, lot 3.3)
    <div
      className={`card ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
      {...(onClick ? activableAuClavier(onClick) : {})}
    >
      {children}
    </div>
  );
}
