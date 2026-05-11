import MapView from '../components/MapView/MapView';

export default function MapPage() {
  return (
    <div className="page-layout">
      <div className="page-header">
        <h1>Service Provider Map</h1>
        <p className="sr-subtitle">
          Find real-time hyperlocal vehicle repair and servicing options near you,
          powered by decentralized data from EtherCalc and Filecoin.
        </p>
      </div>
      <MapView />
    </div>
  );
}
