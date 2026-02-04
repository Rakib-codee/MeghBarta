// Custom hook for weather data management with React Query
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchForecast, fetchSearch } from '../services/weatherAPI.js';
import { API_KEY } from '../utils/constants.js';

export const useWeatherData = (location) => {
  const queryClient = useQueryClient();

  // Listen for PWA sync events
  useEffect(() => {
    const handleWeatherSync = () => {
      queryClient.invalidateQueries({ queryKey: ['weather'] });
    };

    window.addEventListener('weatherSync', handleWeatherSync);
    return () => window.removeEventListener('weatherSync', handleWeatherSync);
  }, [queryClient]);

  return useQuery({
    queryKey: ['weather', location?.query],
    queryFn: () => fetchForecast(location.query),
    enabled: Boolean(location?.query && API_KEY),
    staleTime: 0, // Always fetch fresh data when query key changes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes('API key is invalid')) {
        return false;
      }
      return failureCount < 3;
    },
    // Enhanced offline support
    networkMode: 'offlineFirst',
    meta: {
      // Custom meta for PWA cache handling
      persist: true
    }
  });
};

export const useLocationSearch = (searchQuery) => {
  return useQuery({
    queryKey: ['location-search', searchQuery],
    queryFn: () => fetchSearch(searchQuery),
    enabled: Boolean(searchQuery && searchQuery.trim().length > 2 && API_KEY),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};

// Hook for managing weather data state and errors
export const useWeatherState = () => {
  const queryClient = useQueryClient();

  const invalidateWeatherData = () => {
    queryClient.invalidateQueries({ queryKey: ['weather'] });
  };

  const prefetchWeatherData = (location) => {
    queryClient.prefetchQuery({
      queryKey: ['weather', location?.query],
      queryFn: () => fetchForecast(location.query),
      staleTime: 5 * 60 * 1000
    });
  };

  // PWA Background Sync
  const requestBackgroundSync = async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('weather-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.log('Background sync registration failed:', error);
        // Fallback to manual refresh
        invalidateWeatherData();
      }
    } else {
      // Fallback for browsers without background sync
      invalidateWeatherData();
    }
  };

  // Check if app is offline
  const isOffline = () => {
    return !navigator.onLine;
  };

  // Request notification permission for weather alerts
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.log('Notification permission error:', error);
        return false;
      }
    }
    return false;
  };

  return {
    invalidateWeatherData,
    prefetchWeatherData,
    requestBackgroundSync,
    isOffline,
    requestNotificationPermission
  };
};