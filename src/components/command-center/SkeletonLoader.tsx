import { GlassCard } from './GlassCard';

export const SkeletonLoader = () => {
  return (
    <GlassCard className="p-6">
      <div className="h-6 w-32 rounded bg-white/40 animate-pulse mb-4" />
      <div className="space-y-3">
        <div className="h-4 rounded bg-white/40 animate-pulse" />
        <div className="h-4 rounded bg-white/40 animate-pulse w-3/4" />
        <div className="h-4 rounded bg-white/40 animate-pulse w-1/2" />
      </div>
    </GlassCard>
  );
};
