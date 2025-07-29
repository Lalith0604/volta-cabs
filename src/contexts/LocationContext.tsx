import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Location {
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface LocationContextType {
  currentLocation: Location | null;
  destination: Location | null;
  setCurrentLocation: (location: Location | null) => void;
  setDestination: (location: Location | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        destination,
        setCurrentLocation,
        setDestination,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};