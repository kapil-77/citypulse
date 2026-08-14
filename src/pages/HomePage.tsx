import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../components/layout/TopBar';
import { Button } from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import { IssueCard } from '../components/issue/IssueCard';
import { LocationSearch } from '../components/location/LocationSearch';
import { PopularLocations } from '../components/location/PopularLocations';
import { DynamicHero } from '../components/home/DynamicHero';
import { UseMyLocation } from '../components/location/UseMyLocation';
import { useIssues, useSelectedLocation, useSelectLocation } from '../store';
import type { LocationResult } from '../data/indiaLocations';
import { isIssueInLocation } from '../utils/locationMatch';

export const HomePage = () => {
  const navigate = useNavigate();
  const issues = useIssues();
  const selectedLocation = useSelectedLocation();
  const selectLocation = useSelectLocation();

  // Filter issues by the selected location (alias-aware address match + geographic fallback)
  const filteredIssues = useMemo(() => {
    if (!selectedLocation) return [];
    return issues.filter((issue) => isIssueInLocation(issue, selectedLocation));
  }, [issues, selectedLocation]);

  const handleLocationSelect = (loc: LocationResult) => {
    selectLocation(loc);
  };

  const locationLabel = selectedLocation
    ? `${selectedLocation.name.toUpperCase()}, ${selectedLocation.state.toUpperCase()}`
    : 'ALL INDIA';

  return (
    <div className="min-h-full bg-[var(--bg-page)]">
      <TopBar
        title="CityPulse"
        rightAction={
          <>
            <button onClick={() => navigate('/command-center')} className="text-xs uppercase tracking-[0.08em] text-white/80 hover:text-white font-medium">
              AI Hub
            </button>
            <button onClick={() => navigate('/localities')} className="text-xs uppercase tracking-[0.08em] text-white/80 hover:text-white font-medium">
              Health
            </button>
          </>
        }
      />

      <main className="container py-8 md:py-14">
        {/* ── Dynamic Glass Hero ──────────────────── */}
        <DynamicHero issues={issues} />

        {/* ── Search Controls ─────────────────────── */}
        <section className="text-center mb-12 md:mb-16">
          <div className="max-w-xl mx-auto">
            <LocationSearch onSelect={handleLocationSelect} />

            <div className="mt-5 flex justify-center">
              <PopularLocations onSelect={handleLocationSelect} />
            </div>

            <div className="mt-6 max-w-sm mx-auto">
              <UseMyLocation onLocationFound={handleLocationSelect} />
            </div>
          </div>
        </section>

        <hr className="rule-dotted" />

        {/* ── Selected Location / Issues ─────────── */}
        <section className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-3">
              <p className="label text-[var(--text-secondary)]">Issues Near</p>
              <h3 className="font-serif text-lg md:text-xl font-bold">{locationLabel}</h3>
            </div>
            <button
              onClick={() => {
                // Scroll to search hero
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs uppercase tracking-[0.08em] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium"
            >
              Change Location
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLocation?.name ?? 'none'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredIssues.length === 0 ? (
                <Card padding="lg" className="text-center py-14">
                  <div className="text-3xl mb-4 font-serif">🗺️</div>
                  <CardTitle className="mb-2">No issues reported here yet.</CardTitle>
                  <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
                    Be the first to report one.
                  </p>
                  <Button variant="primary" size="md" onClick={() => navigate('/report')}>
                    Report an Issue
                  </Button>
                </Card>
              ) : (
                <Card padding="none" className="divide-y divide-[var(--border-light)]">
                  {filteredIssues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} compact />
                  ))}
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Report CTA ─────────────────────────── */}
        <section className="mb-8">
          <Card padding="lg" className="text-center">
            <p className="label mb-2">See something wrong?</p>
            <h3 className="font-serif text-xl md:text-2xl font-bold mb-4">Report it in seconds.</h3>
            <Button variant="primary" size="lg" onClick={() => navigate('/report')}>
              Report an Issue
            </Button>
          </Card>
        </section>
      </main>
    </div>
  );
};