import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  progress?: number; // 0-100
  delay?: number;
}

export const KpiCard = ({
  label,
  value,
  suffix = '',
  trend = 'neutral',
  trendLabel,
  progress,
  delay = 0,
}: KpiCardProps) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1000;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const trendColor = trend === 'up' ? 'var(--status-green)' : trend === 'down' ? 'var(--status-red)' : 'var(--text-muted)';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">{label}</span>
        <span className="text-sm font-medium" style={{ color: trendColor }} title={trendLabel}>{trendIcon}</span>
      </div>
      <p className="font-display text-4xl leading-none mb-2" style={{ color: 'var(--text-primary)' }}>
        {display}{suffix}
      </p>
      {typeof progress === 'number' && (
        <div className="h-1.5 rounded-full bg-white/40 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: trend === 'up' ? 'var(--status-green)' : 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay }}
          />
        </div>
      )}
      {trendLabel && <p className="text-[0.625rem] text-[var(--text-muted)] mt-2">{trendLabel}</p>}
    </motion.div>
  );
};
