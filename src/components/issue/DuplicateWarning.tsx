import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardTitle } from '../ui/Card';
import { IssueCard } from './IssueCard';
import type { DuplicateResult } from '../../features/duplicates/duplicateEngine';

interface DuplicateWarningProps {
  duplicates: DuplicateResult[];
  isChecking: boolean;
  onProceed: () => void;
  onAddPhoto: () => void;
  onAddUpdate: () => void;
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-[var(--status-red)]';
  if (score >= 60) return 'text-[var(--status-yellow)]';
  return 'text-[var(--text-secondary)]';
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Very Likely Duplicate';
  if (score >= 60) return 'Likely Duplicate';
  return 'Possible Duplicate';
};

export const DuplicateWarning = ({
  duplicates,
  isChecking,
  onProceed,
  onAddPhoto,
  onAddUpdate,
  className = '',
}: DuplicateWarningProps) => {
  if (isChecking) {
    return (
      <Card padding="lg" className={`text-center ${className}`}>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="animate-spin h-5 w-5 border border-[var(--text-muted)] border-t-[var(--text-primary)]" style={{ borderRadius: '50%' }} />
          <p className="text-sm text-[var(--text-muted)]">Checking for duplicates...</p>
        </div>
      </Card>
    );
  }

  if (duplicates.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Card padding="lg" className={className}>
          <div className="text-center mb-4">
            <CardTitle className="mb-1">Similar Issue Found Nearby</CardTitle>
            <p className="text-sm text-[var(--text-secondary)]">
              An issue with similar details already exists in this area.
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {duplicates.map((dup) => (
              <div key={dup.existingIssue.id} className="border border-[var(--border)] p-4" style={{ borderRadius: 'var(--radius)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-semibold ${getScoreColor(dup.similarityScore)}`}>
                    {dup.similarityScore}% match
                  </span>
                  <span className="label text-[0.625rem]">{getScoreLabel(dup.similarityScore)}</span>
                </div>
                <IssueCard issue={dup.existingIssue} compact />
                {dup.matchedStrategies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-[var(--border-light)]">
                    {dup.matchedStrategies.map((strategy) => (
                      <span key={strategy} className="label text-[0.625rem] px-1.5 py-0.5 border border-[var(--border-light)]" style={{ borderRadius: 'var(--radius-sm)' }}>
                        {strategy}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button className="w-full" variant="secondary" onClick={onProceed}>
              Report Anyway — It's Different
            </Button>
            <div className="flex gap-2">
              <Button className="flex-1" variant="ghost" size="sm" onClick={onAddPhoto}>
                Add Newer Photo
              </Button>
              <Button className="flex-1" variant="ghost" size="sm" onClick={onAddUpdate}>
                Add Update
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};