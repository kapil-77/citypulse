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
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
};

const severityColors: Record<string, string> = {
  low: '#2d6a4f',
  medium: '#b8860b',
  high: '#c0392b',
  critical: '#8b0000',
};

const MapEventsHandler = ({ onMapClick }: { onMapClick?: (point: GeoPoint) => void }) => {
  const setCenter = useStore((s) => s.setCenter);
  const setMapReady = useStore((s) => s.setMapReady);

  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      setCenter({ lat: center.lat, lng: center.lng });
    },
    click: (e) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  useEffect(() => {
    setMapReady(true);
  }, []);

  return null;
};

const MapController = () => {
  const map = useMap();
  const selectedIssueId = useStore((s) => s.selectedIssueId);
  const issues = useStore((s) => s.issues);

  useEffect(() => {
    if (selectedIssueId) {
      const issue = issues.find((i) => i.id === selectedIssueId);
      if (issue) {
        map.flyTo([issue.location.lat, issue.location.lng], 16, { duration: 0.8 });
      }
    }
  }, [selectedIssueId]);

  return null;
};

interface MapShellProps {
  markers?: Array<{
    id: string;
    position: GeoPoint;
    title: string;
    category: string;
    severity: string;
    onClick?: () => void;
  }>;
  onMapClick?: (point: GeoPoint) => void;
  showClickMarker?: boolean;
  clickMarkerPosition?: GeoPoint | null;
  className?: string;
}

export const MapShell = ({
  markers = [],
  onMapClick,
  showClickMarker = false,
  clickMarkerPosition = null,
  className = '',
}: MapShellProps) => {
  return (
    <div className={`border border-[var(--border)] bg-[var(--bg-muted)] ${className}`} style={{ borderRadius: 'var(--radius)' }}>
      <MapContainer
        center={[28.6139, 77.209]}
        zoom={12}
        className="w-full h-full"
        scrollWheelZoom={true}
        style={{ background: '#f0ece6' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventsHandler onMapClick={onMapClick} />
        <MapController />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={createColoredIcon(severityColors[marker.severity] || '#1e3a5f')}
            eventHandlers={{ click: () => marker.onClick?.() }}
          >
            <Popup>
              <div className="text-sm font-medium text-[var(--text-primary)]">{marker.title}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{marker.category}</div>
            </Popup>
          </Marker>
        ))}

        {showClickMarker && clickMarkerPosition && (
          <Marker
            position={[clickMarkerPosition.lat, clickMarkerPosition.lng]}
            icon={L.divIcon({
              className: '',
              html: `<div style="width:20px;height:20px;background:var(--accent,#c0392b);border:2px solid white;display:flex;align-items:center;justify-content:center;"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          />
        )}
      </MapContainer>
    </div>
  );
};