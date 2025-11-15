import { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <GlassCard className="text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
          {icon}
        </div>
      </div>
      <h2 className="mb-3 text-2xl font-bold text-white">{title}</h2>
      <p className="mb-6 text-lg text-white/80">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </GlassCard>
  );
}

