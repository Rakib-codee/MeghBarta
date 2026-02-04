// Custom hook for managing geolocation
import { useState, useEffect, useCallback } from 'react';
import { fallbackLocation } from '../utils/constants.js';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      setLocation(fallbackLocation);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          label: "Your location",
          query: `${latitude},${longitude}`
        });
        setIsLoading(false);
      },
      (err) => {
        setError("Unable to access location. Please allow permissions.");
        setLocation(fallbackLocation);
        setIsLoading(false);
      },
      {
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        enableHighAccuracy: false
      }
    );
  }, []);

  // Auto-get location on mount
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  const handleUseLocation = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  const setManualLocation = useCallback((newLocation) => {
    setLocation(newLocation);
    setError(null);
  }, []);

  return {
    location,
    error,
    isLoading,
    handleUseLocation,
    getCurrentPosition,
    setManualLocation
  };
};