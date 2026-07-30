import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { GeoPoint } from '../../types/issue';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface IssueMiniMapProps {
  location: GeoPoint;
  title: string;
  className?: string;
}

export const IssueMiniMap = ({ location, title, className = '' }: IssueMiniMapProps) => {
  return (
    <div className={`rounded-xl overflow-hidden border border-gray-100 ${className}`}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        className="w-full h-40"
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[location.lat, location.lng]}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};