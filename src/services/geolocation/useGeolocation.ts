import { useState, useCallback, useRef, useEffect } from 'react';
import type { GeoPoint } from '../../types/issue';

interface GeolocationState {
  location: GeoPoint | null;
  error: string | null;
  isLoading: boolean;
}

const EMPTY_OPTIONS: PositionOptions = {};

/**
 * Geolocation hook that only requests permission when `requestLocation` is called.
 * Never requests permission automatically on mount.
 */
export const useGeolocation = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
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
    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation not supported', isLoading: false });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mountedRef.current) return;
        setState({
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        if (!mountedRef.current) return;
        setState({ location: null, error: error.message, isLoading: false });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...(optionsRef.current || EMPTY_OPTIONS) }
    );
  }, []);

  return { ...state, requestLocation };
};