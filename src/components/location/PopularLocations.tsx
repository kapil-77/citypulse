import { getLocationByName } from '../../services/location/locationSearch';
import type { LocationResult } from '../../data/indiaLocations';

interface PopularLocationsProps {
  onSelect: (location: LocationResult) => void;
}

const POPULAR = ['Delhi', 'Mumbai', 'Bengaluru', 'Chandigarh', 'Gurugram'];

export const PopularLocations = ({ onSelect }: PopularLocationsProps) => {
  const handleClick = (name: string) => {
    const loc = getLocationByName(name);
    if (loc) onSelect(loc);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="label text-[0.625rem] mr-1">Popular:</span>
      {POPULAR.map((name, idx) => (
        <span key={name} className="flex items-center">
          <button
            type="button"
            onClick={() => handleClick(name)}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-4 transition-colors duration-150 cursor-pointer"
          >
            {name}
          </button>
          {idx < POPULAR.length - 1 && <span className="mx-1.5 text-[var(--text-muted)]">•</span>}
        </span>
      ))}
    </div>
  );
};