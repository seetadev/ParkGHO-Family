"use client"
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { LatLng } from 'leaflet';

// Define types for the context
type MapContextType = {
    marker: LatLng | null;
    setMarker: Dispatch<SetStateAction<LatLng | null>>;
    mapCenter: LatLng;
    setMapCenter: Dispatch<SetStateAction<LatLng>>;
};

// Create context
const MapContext = createContext<MapContextType | undefined>(undefined);

// Provide context
export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [marker, setMarker] = useState<LatLng | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLng>(new LatLng(48.8566, 2.3522)); // Default to Paris

    return (
        <MapContext.Provider value={{ marker, setMarker, mapCenter, setMapCenter }}>
            {children}
        </MapContext.Provider>
    );
};

// Hook to use context
export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapContext must be used within a MapProvider');
    }
    return context;
};
