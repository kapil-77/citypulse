import { useState, useEffect } from 'react';
import type { GeoPoint } from '../../types/issue';

interface GeolocationState {
  location: GeoPoint | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation not supported', isLoading: false });
      return;
    }

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
  }, []);

  return state;
};

// Future: Continuous watch position
export const useWatchPosition = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: null, error: 'Geolocation not supported', isLoading: false });
      return;
    }

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
  }, []);

  return state;
};