// Custom hook for PWA functionality and installation
import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          setUpdateAvailable(true);
        });
      });
    }
  }, []);

  // Install the PWA
  const installPWA = async () => {
    if (installPrompt) {
      try {
        const result = await installPrompt.prompt();
        console.log('Install prompt result:', result.outcome);
        
        if (result.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      } catch (error) {
        console.error('Install failed:', error);
      }
    }
  };

  // Update the app
  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  // Share functionality
  const shareWeather = async (weatherData, location) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Weather Update',
          text: `Current weather in ${location}: ${weatherData.current.condition.text}, ${weatherData.current.temp_c}°C`,
          url: window.location.href
        });
        return true;
      } catch (error) {
        console.log('Share failed:', error);
        return false;
      }
    }
    return false;
  };

  // Copy to clipboard fallback
  const copyToClipboard = async (text) => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.log('Clipboard write failed:', error);
      }
    }

    // Fallback method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (error) {
      console.log('Fallback copy failed:', error);
      return false;
    }
  };

  // Get device info for PWA optimization
  const getDeviceInfo = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    return {
      isIOS,
      isAndroid,
      isMobile,
      isStandalone: isInstalled,
      supportsInstall: !!installPrompt
    };
  };

  // Request notification permission
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
    // Status
    isOnline,
    isInstalled,
    updateAvailable,
    
    // Installation
    canInstall: !!installPrompt,
    installPWA,
    
    // Updates
    updateApp,
    
    // Sharing
    shareWeather,
    copyToClipboard,
    
    // Device info
    deviceInfo: getDeviceInfo(),
    
    // Notifications
    requestNotificationPermission
  };
};

export default usePWA;