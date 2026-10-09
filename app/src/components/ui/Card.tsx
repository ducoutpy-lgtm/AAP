import { ReactNode } from 'react';

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
    <div
      className={`card ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
