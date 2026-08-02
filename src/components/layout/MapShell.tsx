import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../../store';
import type { GeoPoint } from '../../types/issue';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: '',
    html: `<div style="width:24px;height:24px;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
};

const severityColors: Record<string, string> = {
  low: '#2e7d5b', medium: '#a33a2e', high: '#a33a2e', critical: '#8b0000',
};

const MapEventsHandler = ({ onMapClick }: { onMapClick?: (point: GeoPoint) => void }) => {
  const setCenter = useStore((s) => s.setCenter);
  const setMapReady = useStore((s) => s.setMapReady);
  useMapEvents({
    moveend: (e) => { const c = e.target.getCenter(); setCenter({ lat: c.lat, lng: c.lng }); },
    click: (e) => { if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  useEffect(() => { setMapReady(true); }, []);
  return null;
};

const MapController = () => {
  const map = useMap();
  const selectedIssueId = useStore((s) => s.selectedIssueId);
  const issues = useStore((s) => s.issues);
  useEffect(() => {
    if (selectedIssueId) {
      const issue = issues.find((i) => i.id === selectedIssueId);
      if (issue) map.flyTo([issue.location.lat, issue.location.lng], 16, { duration: 0.8 });
    }
  }, [selectedIssueId]);
  return null;
};

interface MapShellProps {
  markers?: Array<{ id: string; position: GeoPoint; title: string; category: string; severity: string; onClick?: () => void }>;
  onMapClick?: (point: GeoPoint) => void;
  showClickMarker?: boolean;
  clickMarkerPosition?: GeoPoint | null;
  className?: string;
}

export const MapShell = ({ markers = [], onMapClick, showClickMarker = false, clickMarkerPosition = null, className = '' }: MapShellProps) => {
  return (
    <div className={`border border-[var(--black)] ${className}`}>
      <MapContainer center={[28.6139, 77.209]} zoom={12} className="w-full h-full" scrollWheelZoom={true} style={{ background: '#f0ece6' }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEventsHandler onMapClick={onMapClick} />
        <MapController />
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.position.lat, marker.position.lng]} icon={createColoredIcon(severityColors[marker.severity] || '#0a0a0a')} eventHandlers={{ click: () => marker.onClick?.() }}>
            <Popup><div className="text-sm">{marker.title}</div></Popup>
          </Marker>
        ))}
        {showClickMarker && clickMarkerPosition && (
          <Marker position={[clickMarkerPosition.lat, clickMarkerPosition.lng]} icon={L.divIcon({ className: '', html: `<div style="width:18px;height:18px;background:var(--black,#0a0a0a);border:2px solid white;"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] })} />
        )}
      </MapContainer>
    </div>
  );
};