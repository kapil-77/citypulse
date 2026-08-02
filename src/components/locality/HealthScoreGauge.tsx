import { AnimatedNumber } from '../ui/AnimatedNumber';

interface HealthScoreGaugeProps {
  score: number;
  trend?: 'improving' | 'stable' | 'declining';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 70) return 'text-[var(--status-green)]';
  if (score >= 40) return 'text-[var(--text-primary)]';
  return 'text-[var(--status-red)]';
};

const getScoreRing = (score: number): string => {
  if (score >= 70) return 'stroke-[var(--status-green)]';
  if (score >= 40) return 'stroke-[var(--black)]';
  return 'stroke-[var(--status-red)]';
};

const trendIcons: Record<string, { icon: string; color: string }> = {
  improving: { icon: '↑', color: 'text-[var(--status-green)]' },
  stable: { icon: '→', color: 'text-[var(--text-muted)]' },
  declining: { icon: '↓', color: 'text-[var(--status-red)]' },
};

const sizeConfig = {
  sm: { ring: 80, stroke: 4, fontSize: 'text-xl', labelSize: 'text-xs' },
  md: { ring: 120, stroke: 5, fontSize: 'text-3xl', labelSize: 'text-sm' },
  lg: { ring: 160, stroke: 6, fontSize: 'text-4xl', labelSize: 'text-base' },
};

export const HealthScoreGauge = ({ score, trend, size = 'md', className = '' }: HealthScoreGaugeProps) => {
  const config = sizeConfig[size];
  const radius = config.ring / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: config.ring, height: config.ring }}>
        <svg width={config.ring} height={config.ring} className="transform -rotate-90">
          <circle cx={radius} cy={radius} r={radius - config.stroke / 2} fill="none" stroke="var(--border-light)" strokeWidth={config.stroke} />
          <circle cx={radius} cy={radius} r={radius - config.stroke / 2} fill="none" className={getScoreRing(score)} strokeWidth={config.stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="butt" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={score} duration={1000} className={`font-serif font-bold ${getScoreColor(score)} ${config.fontSize}`} />
          <span className={`text-[var(--text-muted)] ${config.labelSize}`}>/ 100</span>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={trendIcons[trend].color}>{trendIcons[trend].icon}</span>
          <span className={`text-xs capitalize ${trendIcons[trend].color}`}>{trend}</span>
        </div>
      )}
    </div>
  );
};