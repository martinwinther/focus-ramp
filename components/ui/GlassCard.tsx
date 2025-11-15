import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/20 bg-white/10 p-6 shadow-glass backdrop-blur-md transition-all duration-200 ${
        hover ? 'hover:bg-white/[0.15] hover:shadow-xl' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

