import type { StateCreator } from 'zustand';
import type { GeoPoint } from '../../types/issue';

export interface MapSlice {
  center: GeoPoint;
  zoom: number;
  selectedIssueId: string | null;
  isMapReady: boolean;

  setCenter: (center: GeoPoint) => void;
  setZoom: (zoom: number) => void;
  selectIssueOnMap: (issueId: string | null) => void;
  setMapReady: (ready: boolean) => void;
  flyTo: (point: GeoPoint, zoom?: number) => void;
}

export const createMapSlice: StateCreator<MapSlice, [], [], MapSlice> = (set) => ({
  center: { lat: 28.6139, lng: 77.2090 }, // Default: New Delhi
  zoom: 12,
  selectedIssueId: null,
  isMapReady: false,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  selectIssueOnMap: (issueId) => set({ selectedIssueId: issueId }),
  setMapReady: (ready) => set({ isMapReady: ready }),
  flyTo: (point, zoom) => set({ center: point, zoom: zoom ?? 15 }),
});