import type { GeoPoint } from './issue';

export type MapProvider = 'leaflet' | 'maplibre';

export interface MapOptions {
  center: GeoPoint;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  scrollWheelZoom?: boolean;
}

export interface MarkerOptions {
  icon?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  popup?: string;
}

export interface ClusterOptions {
  maxClusterRadius?: number;
  disableClusteringAtZoom?: number;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapAdapter {
  render(mapContainer: HTMLElement, options: MapOptions): void;
  setCenter(point: GeoPoint): void;
  setZoom(zoom: number): void;
  addMarker(point: GeoPoint, options: MarkerOptions): void;
  clearMarkers(): void;
  fitBounds(bounds: Bounds): void;
  onMove(callback: (center: GeoPoint) => void): void;
  onClick(callback: (point: GeoPoint) => void): void;
  destroy(): void;
}