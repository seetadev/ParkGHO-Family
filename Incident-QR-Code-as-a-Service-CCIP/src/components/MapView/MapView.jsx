import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon URLs broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SERVICE_PROVIDERS = [
  { id: 1, name: 'QuickFix Auto Repair', lat: 28.6139, lng: 77.2090, type: 'repair', rating: 4.5 },
  { id: 2, name: 'Sharma Garage', lat: 28.6200, lng: 77.2150, type: 'garage', rating: 4.2 },
  { id: 3, name: 'SpeedWheels Service', lat: 28.6080, lng: 77.2200, type: 'service', rating: 4.8 },
  { id: 4, name: 'Delhi Tyre House', lat: 28.6250, lng: 77.2050, type: 'tyre', rating: 4.0 },
  { id: 5, name: 'NSUT Campus Repair', lat: 28.6180, lng: 77.0310, type: 'repair', rating: 4.3 },
];

const FILTER_TYPES = ['all', 'repair', 'garage', 'service', 'tyre'];

function LocateButton() {
  const map = useMap();
  return (
    <button
      className="map-locate-btn"
      onClick={() => map.locate({ setView: true, maxZoom: 15 })}
      title="Find my location"
      style={{ position: 'absolute', bottom: 30, right: 10, zIndex: 1000, padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
    >
      📡 Locate Me
    </button>
  );
}

export default function MapView() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? SERVICE_PROVIDERS
    : SERVICE_PROVIDERS.filter((p) => p.type === filter);

  return (
    <div className="sr-card map-card">
      <h2>Nearby Vehicle Service Providers</h2>
      <p className="sr-subtitle">Delhi NCR region · Updated via EtherCalc registry</p>

      <div className="filter-row">
        {FILTER_TYPES.map((f) => (
          <button
            key={f}
            className={`filter-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <MapContainer
          center={[28.6180, 77.2090]}
          zoom={13}
          style={{ height: '420px', borderRadius: '12px', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocateButton />
          {filtered.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <strong>{p.name}</strong><br />
                Type: {p.type}<br />
                Rating: {'⭐'.repeat(Math.round(p.rating))} ({p.rating})<br />
                <a
                  href={`https://maps.google.com/?q=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions &rarr;
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="sr-hint">
        Data sourced from{' '}
        <a href="https://ethercalc.net/veg1fcob7fe3" target="_blank" rel="noreferrer">
          EtherCalc Provider Registry
        </a>
        {' '}· Stored on Filecoin
      </p>
    </div>
  );
}
