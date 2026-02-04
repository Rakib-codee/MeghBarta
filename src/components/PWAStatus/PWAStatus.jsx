import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, Wifi, WifiOff, Share2, Bell } from 'lucide-react';
import usePWA from '../../hooks/usePWA';

const PWAStatus = ({ weatherData, location }) => {
  const {
    isOnline,
    canInstall,
    installPWA,
    updateAvailable,
    updateApp,
    shareWeather,
    requestNotificationPermission,
    deviceInfo
  } = usePWA();

  const [showInstallBanner, setShowInstallBanner] = React.useState(canInstall && !deviceInfo.isStandalone);
  const [showUpdateBanner, setShowUpdateBanner] = React.useState(updateAvailable);
  const [notificationPermission, setNotificationPermission] = React.useState(Notification?.permission || 'default');

  // Auto-hide install banner after delay
  React.useEffect(() => {
    if (showInstallBanner) {
      const timer = setTimeout(() => setShowInstallBanner(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showInstallBanner]);

  const handleInstall = async () => {
    await installPWA();
    setShowInstallBanner(false);
  };

  const handleUpdate = () => {
    updateApp();
    setShowUpdateBanner(false);
  };

  const handleShare = async () => {
    if (weatherData && location) {
      const shared = await shareWeather(weatherData, location.name);
      if (!shared) {
        // Fallback to copy
        const text = `Current weather in ${location.name}: ${weatherData.current.condition.text}, ${weatherData.current.temp_c}°C - Check it out at ${window.location.href}`;
        await copyToClipboard(text);
      }
    }
  };

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
  };

  return (
    <>
      {/* Online/Offline Status */}
      <motion.div
        className="pwa-status-indicator"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isOnline ? (
          <Wifi className="status-icon status-online" size={16} />
        ) : (
          <WifiOff className="status-icon status-offline" size={16} />
        )}
      </motion.div>

      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            className="pwa-banner install-banner"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="banner-content">
              <Download className="banner-icon" size={20} />
              <div className="banner-text">
                <strong>Install MeghBarta</strong>
                <span>Get the full app experience!</span>
              </div>
            </div>
            <div className="banner-actions">
              <button
                onClick={handleInstall}
                className="banner-button install-button"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="banner-button dismiss-button"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Banner */}
      <AnimatePresence>
        {showUpdateBanner && (
          <motion.div
            className="pwa-banner update-banner"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="banner-content">
              <RefreshCw className="banner-icon" size={20} />
              <div className="banner-text">
                <strong>Update Available</strong>
                <span>New features and improvements</span>
              </div>
            </div>
            <div className="banner-actions">
              <button
                onClick={handleUpdate}
                className="banner-button update-button"
              >
                Update
              </button>
              <button
                onClick={() => setShowUpdateBanner(false)}
                className="banner-button dismiss-button"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Actions */}
      {deviceInfo.isStandalone && (
        <div className="pwa-actions">
          {/* Share Button */}
          {weatherData && (
            <motion.button
              className="pwa-action-button share-button"
              onClick={handleShare}
              whileTap={{ scale: 0.95 }}
              title="Share weather"
            >
              <Share2 size={16} />
            </motion.button>
          )}

          {/* Notification Permission */}
          {notificationPermission === 'default' && (
            <motion.button
              className="pwa-action-button notification-button"
              onClick={handleNotificationPermission}
              whileTap={{ scale: 0.95 }}
              title="Enable notifications"
            >
              <Bell size={16} />
            </motion.button>
          )}
        </div>
      )}
    </>
  );
};

export default PWAStatus;