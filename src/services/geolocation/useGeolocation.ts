import { useState, useCallback } from 'react';
import type { GeoPoint } from '../../types/issue';

interface GeolocationState {
  location: GeoPoint | null;
  error: string | null;
  isLoading: boolean;
}

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

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation not supported', isLoading: false });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        setState({ location: null, error: error.message, isLoading: false });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    );
  }, [options]);

  return { ...state, requestLocation };
};

// Future: Continuous watch position
export const useWatchPosition = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
  });

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation not supported', isLoading: false });
      return () => {};
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: { lat: position.coords.latitude, lng: position.coords.longitude },
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        setState({ location: null, error: error.message, isLoading: false });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [options]);

  return { ...state, startWatching };
};