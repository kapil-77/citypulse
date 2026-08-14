import { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSelectedLocation, useIssues, useStore } from '../../store';
import { computeDashboardScore } from '../../features/health/computeDashboardScore';

interface DynamicHeroProps {
  issues: ReturnType<typeof useIssues>;
}

const PARTICLES = [
  { left: '8%', top: '30%', size: 4, delay: 0 },
  { left: '22%', top: '65%', size: 3, delay: 0.6 },
  { left: '35%', top: '20%', size: 5, delay: 1.2 },
  { left: '68%', top: '40%', size: 3, delay: 0.3 },
  { left: '82%', top: '70%', size: 4, delay: 0.9 },
  { left: '55%', top: '75%', size: 3, delay: 1.5 },
];

const LIGHTS = [
  { left: '5%', top: '12%', delay: 0 },
  { left: '18%', top: '48%', delay: 0.4 },
  { left: '44%', top: '22%', delay: 0.8 },
  { left: '74%', top: '15%', delay: 0.2 },
  { left: '88%', top: '42%', delay: 1.1 },
  { left: '62%', top: '60%', delay: 0.6 },
];

export const DynamicHero = ({ issues }: DynamicHeroProps) => {
  const selectedLocation = useSelectedLocation();
  const verifications = useStore((s) => s.verifications);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 60]);
  const bgY = useTransform(scrollY, [0, 400], [0, -30]);

  const activeIssues = useMemo(
    () => issues.filter((i) => i.status !== 'resolved' && i.status !== 'verified_resolved').length,
    [issues]
  );
  const healthScore = useMemo(() => computeDashboardScore(issues, verifications), [issues, verifications]);

  const cityName = selectedLocation
    ? `${selectedLocation.name}, ${selectedLocation.state}`
    : 'All India';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-white/25 via-white/10 to-transparent shadow-[0_8px_40px_rgba(0,0,0,0.15)] px-6 py-12 md:py-16 mb-12 md:mb-16">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-[var(--status-blue)]/10 animate-float-drift"
        style={{ y: bgY }}
        aria-hidden
      />

      {/* Moving city lights */}
      {LIGHTS.map((light, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute h-1.5 w-1.5 rounded-full bg-white/70 animate-light-twinkle"
          style={{ left: light.left, top: light.top, animationDelay: `${light.delay}s` }}
        />
      ))}

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute rounded-full bg-white/50 animate-particle-rise"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Parallax wrapper */}
      <motion.div style={{ y }} className="relative">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="font-display text-[3.75rem] leading-none mb-3">
            What's happening around you?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Live civic intelligence for {cityName}
          </p>
        </div>

        {/* Glass metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5 text-center"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">City</p>
            <p className="font-display text-xl mt-1 truncate" title={cityName}>{cityName}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5 text-center"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Weather</p>
            <p className="font-display text-xl mt-1">--°C</p>
            <p className="text-[0.625rem] text-[var(--text-muted)]">Coming soon</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5 text-center"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Health Score</p>
            <p className="font-display text-xl mt-1">{healthScore}</p>
            <div className="mx-auto mt-2 h-1.5 w-24 rounded-full bg-white/40 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${healthScore}%`, background: 'var(--accent)' }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5 text-center"
          >
            <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Active Issues</p>
            <p className="font-display text-xl mt-1">{activeIssues}</p>
            <p className="text-[0.625rem] text-[var(--text-muted)]">currently open</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
