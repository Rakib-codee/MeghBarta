// Custom hook for local storage management
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeStoredValue = () => {
    try {
      setValue(defaultValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [value, setStoredValue, removeStoredValue];
};

// Predefined hooks for common storage needs
export const useStoredUnit = () => useLocalStorage('weather-unit', 'C');
export const useStoredRecentSearches = () => useLocalStorage('recent-searches', []);
export const useStoredFavoriteLocations = () => useLocalStorage('favorite-locations', []);
export const useStoredTheme = () => useLocalStorage('weather-theme', 'auto');