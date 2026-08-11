import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const HealthScoreRing = ({ score, size = 180, strokeWidth = 12, label = 'City Health' }: HealthScoreRingProps) => {
  const [display, setDisplay] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  // Animated counter
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(clamped * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  const color = clamped >= 70 ? '#2e7d5b' : clamped >= 40 ? '#a33a2e' : '#8b0000';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-5xl leading-none" style={{ color: 'var(--text-primary)' }}>{display}</span>
          <span className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
};