import { useEffect, useState } from 'react';
import { useGeolocation } from '../../services/geolocation/useGeolocation';
import type { GeolocationErrorCode } from '../../services/geolocation/useGeolocation';
import { reverseGeocode } from '../../utils/geoUtils';
import { getLocationByName, getNearestLocation } from '../../services/location/locationSearch';
import type { LocationResult } from '../../data/indiaLocations';

interface UseMyLocationProps {
  onLocationFound: (location: LocationResult) => void;
  className?: string;
}

// Transient failures where retrying can succeed. Permission-denied and unsupported
// cannot be fixed from the UI (browsers do not re-prompt after denial).
const RETRYABLE_ERRORS = new Set<GeolocationErrorCode>(['timeout', 'position_unavailable']);

export const UseMyLocation = ({ onLocationFound, className = '' }: UseMyLocationProps) => {
  const { location, isLoading, error, errorCode, requestLocation } = useGeolocation();
  const [hasRequested, setHasRequested] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const handleClick = () => {
    setHasRequested(true);
    requestLocation();
  };

  const handleRetry = () => {
    requestLocation();
  };

  // When location arrives, reverse geocode and match to a known India location
  useEffect(() => {
    if (!location || isLoading || isReverseGeocoding) return;

    let cancelled = false;
    setIsReverseGeocoding(true);

    const resolve = async () => {
      const findMatch = (address: string): LocationResult | undefined => {
        const lower = address.toLowerCase();
        if (lower.includes('gurugram') || lower.includes('gurgaon')) return getLocationByName('Gurugram');
        if (lower.includes('new delhi') || lower.includes('delhi')) return getLocationByName('Delhi');
        if (lower.includes('mumbai') || lower.includes('bombay')) return getLocationByName('Mumbai');
        if (lower.includes('bengaluru') || lower.includes('bangalore')) return getLocationByName('Bengaluru');
        if (lower.includes('chandigarh')) return getLocationByName('Chandigarh');
        if (lower.includes('chennai') || lower.includes('madras')) return getLocationByName('Chennai');
        if (lower.includes('kolkata') || lower.includes('calcutta')) return getLocationByName('Kolkata');
        if (lower.includes('hyderabad')) return getLocationByName('Hyderabad');
        if (lower.includes('pune')) return getLocationByName('Pune');
        if (lower.includes('jaipur')) return getLocationByName('Jaipur');
        // Address didn't name a supported city — use the nearest known location
        // to the actual GPS coordinates instead of a hard-coded default.
        return getNearestLocation(location);
      };

      try {
        const address = await reverseGeocode(location);
        if (cancelled) return;
        const match = findMatch(address);
        if (match) onLocationFound(match);
      } catch {
        if (!cancelled) {
          const fallback = getNearestLocation(location);
          if (fallback) onLocationFound(fallback);
        }
      } finally {
        if (!cancelled) setIsReverseGeocoding(false);
      }
    };

    void resolve();
    return () => { cancelled = true; };
  }, [location, isLoading]);

  const showError = hasRequested && error && !isLoading;
  const canRetry = errorCode ? RETRYABLE_ERRORS.has(errorCode) : false;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || isReverseGeocoding}
        className="w-full min-h-[50px] px-6 py-3 bg-[var(--black)] text-white border border-[var(--black)] font-semibold uppercase tracking-[0.08em] text-[0.8125rem] leading-none hover:bg-[#222] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading || isReverseGeocoding ? 'LOCATING...' : 'USE MY LOCATION'}
      </button>
      {showError && (
        <div className="mt-3 space-y-2 text-center">
          <p className="text-xs text-[var(--status-red)]">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {canRetry && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={isLoading}
                className="text-xs uppercase tracking-[0.08em] text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Try Again
              </button>
            )}
            <span className="text-xs text-[var(--text-muted)]">Search your city manually above</span>
          </div>
        </div>
      )}
    </div>
  );
};