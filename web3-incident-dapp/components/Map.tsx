"use client";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L, { LatLng } from "leaflet";
import React, { useEffect } from "react";
// import { useMapContext } from "@/context/MapContext";
import { useMapContext } from "@/app/context/MapContext";

// Component to handle map click and update marker
const MapClickHandler: React.FC = () => {
  const { setMarker } = useMapContext();
  useMapEvents({
    click(e) {
      setMarker(new LatLng(e.latlng.lat, e.latlng.lng));
    },
  });
  return null;
};

// Component to handle search control
const SearchControl: React.FC = () => {
  const { setMarker, setMapCenter } = useMapContext();
  const map = useMap();
  // @ts-ignore
  useEffect(() => {
    // @ts-ignore
    const searchControl = new GeoSearchControl({
      provider: new OpenStreetMapProvider(),
      showMarker: false,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: "Enter address",
    });

    map.addControl(searchControl as unknown as L.Control);

    map.on("geosearch/showlocation", (result: any) => {
      const { x, y } = result.location;
      setMarker(new LatLng(y, x));
      setMapCenter(new LatLng(y, x));
    });

    return () => map.removeControl(searchControl as unknown as L.Control);
  }, [map, setMarker, setMapCenter]);

  return null;
};

const Map: React.FC = () => {
  const { marker, mapCenter, setMapCenter, setMarker } = useMapContext();

  // Function to fetch current location
  const fetchCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const currentLocation = new LatLng(
        position.coords.latitude,
        position.coords.longitude
      );
      setMarker(currentLocation);
      setMapCenter(currentLocation);
    });
  };

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  return (
    <div>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {marker && (
          <Marker position={marker}>
            <Popup>
              Marker at {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
            </Popup>
          </Marker>
        )}
        <MapClickHandler />
        <SearchControl />
      </MapContainer>
      <button onClick={fetchCurrentLocation}>Fetch Current Location</button>
    </div>
  );
};

export default Map;
