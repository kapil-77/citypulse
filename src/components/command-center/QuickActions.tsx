import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <GlassCard className="p-6">
      <h3 className="font-display text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/report')}
          className="rounded-xl border border-white/50 bg-white/50 backdrop-blur px-4 py-3 text-sm font-medium hover:bg-white/70 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          📸 Report Issue
        </button>
        <button
          onClick={() => navigate('/')}
          className="rounded-xl border border-white/50 bg-white/50 backdrop-blur px-4 py-3 text-sm font-medium hover:bg-white/70 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          🔍 Search Location
        </button>
      </div>
    </GlassCard>
  );
};
