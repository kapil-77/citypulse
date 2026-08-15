import { useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSelectedLocation, useIssues, useStore } from '../../store';
import { computeCityHealth } from '../../features/health/cityHealthScore';
import { isIssueInLocation } from '../../utils/locationMatch';

interface DynamicHeroProps {
  issues: ReturnType<typeof useIssues>;
}

const statCard =
  'rounded-2xl border border-white/50 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-5 text-center';

/**
 * Lightweight, per-city home hero. Shows the selected city's real health score
 * (computed from its actual issue data), active and critical counts, and a short
 * status summary. Shows "Insufficient data" when there are no issues for the city.
 */
export const DynamicHero = ({ issues }: DynamicHeroProps) => {
  const selectedLocation = useSelectedLocation();
  const verifications = useStore((s) => s.verifications);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 60]);
  const bgY = useTransform(scrollY, [0, 400], [0, -30]);

  const cityIssues = useMemo(
    () => issues.filter((issue) => isIssueInLocation(issue, selectedLocation)),
    [issues, selectedLocation]
  );

  const report = useMemo(
    () => computeCityHealth(cityIssues, verifications),
    [cityIssues, verifications]
  );

  const cityName = selectedLocation
    ? selectedLocation.name + ', ' + selectedLocation.state
    : 'All India';
  const shortCity = selectedLocation ? selectedLocation.name : 'India';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-white/25 via-white/10 to-transparent shadow-[0_8px_40px_rgba(0,0,0,0.15)] px-6 py-10 md:py-14 mb-12 md:mb-16">
      <motion.div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-[var(--status-blue)]/10 animate-float-drift"
        style={{ y: bgY }}
        aria-hidden
      />

      <motion.div style={{ y }} className="relative max-w-4xl mx-auto text-center">
        <p className="label text-[var(--text-secondary)] mb-2">CityPulse · {cityName}</p>
        <h2 className="font-display text-[2.5rem] md:text-[3.25rem] leading-none mb-1">
          What&apos;s happening in {shortCity}?
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          {report
            ? 'Live civic health, computed from reported issues.'
            : 'No reported issues yet for this area.'}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className={statCard}
          >
            <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Health Score</p>
            <p className="font-display text-3xl mt-1">{report ? report.score : '—'}</p>
            {report ? (
              <div className="mx-auto mt-2 h-1.5 w-24 rounded-full bg-white/40 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: report.score + '%', background: 'var(--accent)' }}
                />
              </div>
            ) : (
              <p className="text-[0.625rem] text-[var(--text-muted)] mt-2">Insufficient data</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className={statCard}
          >
            <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Active Issues</p>
            <p className="font-display text-3xl mt-1">{report ? report.activeCount : 0}</p>
            <p className="text-[0.625rem] text-[var(--text-muted)]">currently open</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className={statCard}
          >
            <p className="text-[0.625rem] uppercase tracking-[0.15em] text-[var(--text-secondary)]">Critical</p>
            <p className="font-display text-3xl mt-1">{report ? report.criticalCount : 0}</p>
            <p className="text-[0.625rem] text-[var(--text-muted)]">need attention</p>
          </motion.div>
        </div>

        {report ? (
          <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">{report.summary}</p>
        ) : (
          <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto">
            Insufficient data for {cityName} — be the first to report an issue.
          </p>
        )}
      </motion.div>
    </section>
  );
};
