import { GlassCard } from './GlassCard';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <GlassCard>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          <p className="text-white">{message}</p>
        </div>
      </GlassCard>
    </div>
  );
}

