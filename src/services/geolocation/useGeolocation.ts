import { useState, useCallback, useRef, useEffect } from 'react';
import type { GeoPoint } from '../../types/issue';

export type GeolocationErrorCode =
  | 'unsupported'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout';

const ERROR_MESSAGES: Record<Exclude<GeolocationErrorCode, 'unsupported'>, string> = {
  permission_denied: 'Location access was not allowed.',
  position_unavailable: 'Could not find your location. Check GPS/Wi-Fi and try again.',
  timeout: 'Location lookup timed out. Try again.',
};

interface GeolocationState {
  location: GeoPoint | null;
  error: string | null;
  errorCode: GeolocationErrorCode | null;
  isLoading: boolean;
}

// Mobile-friendly defaults:
// - enableHighAccuracy: false  -> cell/Wi-Fi positioning is faster and more reliable
//    on phones, and accurate enough for city-level matching.
// - timeout: 15000             -> a cold fix can take longer than 10s on mobile.
// - maximumAge: 60000          -> reuse a recent cached position instead of forcing
//    a slow fresh GPS fix on every tap.
const DEFAULT_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 60000,
};

function getErrorCode(code: number): Exclude<GeolocationErrorCode, 'unsupported'> {
  switch (code) {
    case 1: // GeolocationPositionError.PERMISSION_DENIED
      return 'permission_denied';
    case 2: // GeolocationPositionError.POSITION_UNAVAILABLE
      return 'position_unavailable';
    case 3: // GeolocationPositionError.TIMEOUT
      return 'timeout';
    default:
      return 'position_unavailable';
  }
}

/**
 * Geolocation hook that only requests permission when `requestLocation` is called.
 * Never requests permission automatically on mount.
 */
export const useGeolocation = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    errorCode: null,
    isLoading: false,
  });

  // Keep the latest options without re-creating `requestLocation` on every render,
  // which would otherwise cause consumers' effects to re-run.
  const optionsRef = useRef<PositionOptions | undefined>(options);
  optionsRef.current = options;

  // Ignore geo callbacks after unmount to avoid setState-on-unmounted warnings/leaks.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const requestLocation = useCallback(() => {
    // The Geolocation API is only available in secure contexts (HTTPS or localhost).
    const insecureContext =
      typeof window !== 'undefined' &&
      'isSecureContext' in window &&
      !window.isSecureContext;

    if (insecureContext) {
      setState({
        location: null,
        error: 'Geolocation requires a secure (HTTPS) connection. Search your city manually.',
        errorCode: 'unsupported',
        isLoading: false,
      });
      return;
    }

    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocation is not supported on this browser or device. Search your city manually.',
        errorCode: 'unsupported',
        isLoading: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null, errorCode: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        setState({
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          error: null,
          errorCode: null,
          isLoading: false,
        });
      },
      (error) => {
        if (!mountedRef.current) return;
        const errorCode = getErrorCode(error.code);
        setState({ location: null, error: ERROR_MESSAGES[errorCode], errorCode, isLoading: false });
      },
      { ...DEFAULT_OPTIONS, ...(optionsRef.current || {}) }
    );
  }, []);

  return { ...state, requestLocation };
};
