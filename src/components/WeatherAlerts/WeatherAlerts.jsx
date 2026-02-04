import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Bell, BellOff, Wind, Thermometer, Eye, CloudRain } from 'lucide-react';
import { useWeatherAlerts } from '../../hooks/useWeatherAlerts';

const WeatherAlerts = ({ weatherData, location }) => {
  const {
    alerts,
    notificationPermission,
    requestPermission,
    dismissAlert,
    clearAllAlerts,
    subscribeToAlerts,
    hasAlerts,
    criticalAlerts
  } = useWeatherAlerts(weatherData);

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);

  const getAlertIcon = (alertType) => {
    const iconProps = { size: 18 };
    
    switch (alertType) {
      case 'severe_weather': return <AlertTriangle {...iconProps} />;
      case 'temperature_extreme': return <Thermometer {...iconProps} />;
      case 'wind_warning': return <Wind {...iconProps} />;
      case 'visibility_warning': return <Eye {...iconProps} />;
      case 'rain_warning': return <CloudRain {...iconProps} />;
      default: return <AlertTriangle {...iconProps} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444'; // red
      case 'high': return '#f97316'; // orange  
      case 'medium': return '#eab308'; // yellow
      case 'low': return '#3b82f6'; // blue
      default: return '#6b7280'; // gray
    }
  };

  const handleSubscribe = async () => {
    if (notificationPermission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    const result = await subscribeToAlerts(location?.name || 'Current Location');
    if (result.success) {
      setIsSubscribed(true);
    }
  };

  if (!hasAlerts && notificationPermission === 'granted') return null;

  return (
    <>
      {/* Alerts Button */}
      <motion.div
        className="weather-alerts-toggle"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className={`alerts-button ${hasAlerts ? 'has-alerts' : ''} ${criticalAlerts.length > 0 ? 'critical' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`${alerts.length} weather alerts`}
        >
          <Bell size={20} />
          {hasAlerts && (
            <span className="alert-count">
              {alerts.length}
            </span>
          )}
        </motion.button>
      </motion.div>

      {/* Notification Permission Banner */}
      <AnimatePresence>
        {notificationPermission !== 'granted' && !isExpanded && (
          <motion.div
            className="notification-banner"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="banner-content">
              <BellOff size={20} />
              <div>
                <strong>Enable Weather Alerts</strong>
                <span>Get notified about severe weather conditions</span>
              </div>
            </div>
            <button 
              onClick={requestPermission}
              className="enable-button"
            >
              Enable
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="weather-alerts-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="alerts-header">
              <div className="header-title">
                <Bell size={20} />
                <h3>Weather Alerts</h3>
                {hasAlerts && <span className="alert-badge">{alerts.length}</span>}
              </div>
              
              <div className="header-actions">
                {hasAlerts && (
                  <button
                    onClick={clearAllAlerts}
                    className="clear-button"
                    title="Clear all alerts"
                  >
                    Clear All
                  </button>
                )}
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="close-button"
                  aria-label="Close alerts panel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="alerts-content">
              {!hasAlerts ? (
                <div className="no-alerts">
                  <Bell size={24} opacity={0.5} />
                  <p>No active weather alerts</p>
                  <small>You'll be notified if conditions change</small>
                </div>
              ) : (
                <div className="alerts-list">
                  <AnimatePresence>
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        className={`alert-item severity-${alert.severity}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ borderLeftColor: getSeverityColor(alert.severity) }}
                      >
                        <div className="alert-icon">
                          {getAlertIcon(alert.type)}
                        </div>
                        
                        <div className="alert-content">
                          <h4>{alert.title}</h4>
                          <p>{alert.message}</p>
                          <time>{new Date(alert.timestamp).toLocaleTimeString()}</time>
                        </div>
                        
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="dismiss-button"
                          aria-label="Dismiss alert"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Subscription Toggle */}
              {notificationPermission === 'granted' && (
                <div className="subscription-section">
                  <div className="subscription-info">
                    <h4>Alert Notifications</h4>
                    <p>Get push notifications for severe weather</p>
                  </div>
                  
                  <button
                    onClick={handleSubscribe}
                    className={`subscription-button ${isSubscribed ? 'subscribed' : ''}`}
                    disabled={isSubscribed}
                  >
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WeatherAlerts;