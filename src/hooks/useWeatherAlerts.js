// Custom hook for weather alerts and notifications
import { useState, useEffect, useCallback } from 'react';

// Weather alert types (moved outside to prevent recreation)
const alertTypes = {
  SEVERE_WEATHER: 'severe_weather',
  TEMPERATURE_EXTREME: 'temperature_extreme', 
  RAIN_WARNING: 'rain_warning',
  WIND_WARNING: 'wind_warning',
  VISIBILITY_WARNING: 'visibility_warning'
};

export const useWeatherAlerts = (weatherData) => {
  const [alerts, setAlerts] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  // Check for weather alerts based on current conditions
  const checkWeatherAlerts = useCallback((data) => {
    if (!data?.current) return [];

    const newAlerts = [];
    const { temp_c, temp_f, condition, wind_kph, vis_km, humidity } = data.current;

    // Temperature extremes
    if (temp_c > 40 || temp_c < -20) {
      newAlerts.push({
        id: Date.now() + 1,
        type: alertTypes.TEMPERATURE_EXTREME,
        title: temp_c > 40 ? 'Extreme Heat Warning' : 'Extreme Cold Warning',
        message: `Temperature is ${temp_c}°C. Take necessary precautions.`,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }

    // High wind warning
    if (wind_kph > 50) {
      newAlerts.push({
        id: Date.now() + 2,
        type: alertTypes.WIND_WARNING,
        title: 'High Wind Warning',
        message: `Wind speed is ${wind_kph} km/h. Avoid outdoor activities.`,
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }

    // Poor visibility
    if (vis_km < 2) {
      newAlerts.push({
        id: Date.now() + 3,
        type: alertTypes.VISIBILITY_WARNING,
        title: 'Poor Visibility Warning',
        message: `Visibility reduced to ${vis_km}km. Drive carefully.`,
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }

    // Severe weather conditions
    const severeConditions = ['thunderstorm', 'blizzard', 'tornado', 'hurricane'];
    if (severeConditions.some(condition => 
      data.current.condition.text.toLowerCase().includes(condition)
    )) {
      newAlerts.push({
        id: Date.now() + 4,
        type: alertTypes.SEVERE_WEATHER,
        title: 'Severe Weather Alert',
        message: `${condition.text} conditions detected. Stay safe!`,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });
    }

    // Heavy rain prediction
    if (data.forecast?.forecastday?.[0]?.day?.totalprecip_mm > 50) {
      newAlerts.push({
        id: Date.now() + 5,
        type: alertTypes.RAIN_WARNING,
        title: 'Heavy Rain Warning',
        message: 'Heavy rainfall expected today. Plan accordingly.',
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }

    return newAlerts;
  }, []); // Remove alertTypes dependency since it's now stable

  // Update alerts when weather data changes
  useEffect(() => {
    if (weatherData) {
      const newAlerts = checkWeatherAlerts(weatherData);
      setAlerts(prev => {
        // Only add new unique alerts
        const existingIds = prev.map(alert => alert.type);
        const uniqueNewAlerts = newAlerts.filter(alert => 
          !existingIds.includes(alert.type)
        );
        return [...prev, ...uniqueNewAlerts];
      });
    }
  }, [weatherData, checkWeatherAlerts]);

  // Send push notification
  const sendNotification = useCallback(async (alert) => {
    if (notificationPermission !== 'granted') return false;

    try {
      const notification = new Notification(alert.title, {
        body: alert.message,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: alert.type,
        vibrate: [200, 100, 200],
        data: {
          alertId: alert.id,
          severity: alert.severity
        },
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }, [notificationPermission]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, []);

  // Dismiss an alert
  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Auto-send notifications for new critical alerts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.severity === 'critical' && notificationPermission === 'granted') {
        sendNotification(alert);
      }
    });
  }, [alerts, notificationPermission, sendNotification]);

  // Subscribe to weather alerts (mock implementation)
  const subscribeToAlerts = useCallback(async (location) => {
    if ('serviceWorker' in navigator && notificationPermission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Mock subscription - in real app would connect to push service
        console.log('Subscribed to weather alerts for:', location);
        
        return {
          success: true,
          message: 'Successfully subscribed to weather alerts'
        };
      } catch (error) {
        console.error('Failed to subscribe to alerts:', error);
        return {
          success: false,
          message: 'Failed to subscribe to weather alerts'
        };
      }
    }
    
    return {
      success: false,
      message: 'Notifications not supported'
    };
  }, [notificationPermission]);

  return {
    alerts,
    notificationPermission,
    requestPermission,
    dismissAlert,
    clearAllAlerts,
    sendNotification,
    subscribeToAlerts,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(alert => alert.severity === 'critical'),
    alertTypes
  };
};