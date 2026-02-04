import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { motion, AnimatePresence } from 'framer-motion';

// Custom hooks
import { useGeolocation } from './hooks/useGeolocation.js';
import { useWeatherData } from './hooks/useWeatherData.js';
import { useStoredUnit } from './hooks/useLocalStorage.js';
import { useKeyboardNavigation, useAccessibility } from './hooks/useKeyboardNavigation.js';

// Components
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import SearchBar from './components/SearchBar/SearchBar.jsx';
import WeatherHero from './components/WeatherHero/WeatherHero.jsx';
import HourlyForecast from './components/HourlyForecast/HourlyForecast.jsx';
import DailyForecast from './components/DailyForecast/DailyForecast.jsx';
import SunTimeline from './components/SunTimeline/SunTimeline.jsx';
import AirQuality from './components/AirQuality/AirQuality.jsx';
import LoadingSkeleton from './components/LoadingSkeleton/LoadingSkeleton.jsx';
import PWAStatus from './components/PWAStatus/PWAStatus.jsx';
import WeatherAlerts from './components/WeatherAlerts/WeatherAlerts.jsx';

// Utils
import { formatTemp, getTimePercent, parseAstroTime, calculateAccurateFeelsLike } from './utils/formatters.js';
import { API_KEY } from './utils/constants.js';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.message.includes('API key is invalid')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const WeatherApp = () => {
  // Custom hooks for state management
  const [unit, setUnit] = useStoredUnit();
  const { location, error: locationError, isLoading: isGettingLocation, handleUseLocation, setManualLocation } = useGeolocation();
  const { announceToScreenReader } = useAccessibility();
  
  // Weather data with React Query
  const { 
    data, 
    isLoading: isLoadingWeather, 
    error: weatherError, 
    isError,
    refetch
  } = useWeatherData(location);

  // Keyboard navigation
  const handleUnitToggle = () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    setUnit(newUnit);
    announceToScreenReader(`Temperature unit changed to ${newUnit === 'C' ? 'Celsius' : 'Fahrenheit'}`);
  };

  const handleRefresh = () => {
    refetch();
    announceToScreenReader('Refreshing weather data');
  };

  useKeyboardNavigation({
    onUnitToggle: handleUnitToggle,
    onLocationRequest: handleUseLocation,
    onRefresh: handleRefresh
  });

  // Computed values
  const isC = unit === 'C';
  const status = isLoadingWeather ? 'loading' : isError ? 'error' : data ? 'ready' : 'loading';
  const error = weatherError?.message || locationError;

  // Weather data destructuring
  const current = data?.current;
  const forecast = data?.forecast?.forecastday || [];
  const today = forecast[0];
  
  // Computed display values
  const { displayTemp, displayHigh, displayLow, feelTemp, wind, visibility, sunProgress } = useMemo(() => {
    if (!current || !today) {
      return {
        displayTemp: 0,
        displayHigh: 0,
        displayLow: 0,
        feelTemp: 0,
        wind: "",
        visibility: "",
        sunProgress: 0.5
      };
    }

    const displayTemp = isC ? current.temp_c : current.temp_f;
    const displayHigh = isC ? today.day.maxtemp_c : today.day.maxtemp_f;
    const displayLow = isC ? today.day.mintemp_c : today.day.mintemp_f;
    
    // Use accurate feels like calculation instead of API value
    const accurateFeelsLike = calculateAccurateFeelsLike(data, unit);
    const feelTemp = accurateFeelsLike || (isC ? current.feelslike_c : current.feelslike_f);
    
    const wind = isC ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`;
    const visibility = isC ? `${current.vis_km} km` : `${current.vis_miles} mi`;
    
    // Calculate sun progress
    const now = new Date(data.location.localtime);
    const sunrise = parseAstroTime(today.date, today.astro.sunrise);
    const sunset = parseAstroTime(today.date, today.astro.sunset);
    const sunProgress = getTimePercent(now, sunrise, sunset);

    return {
      displayTemp,
      displayHigh,
      displayLow,
      feelTemp,
      wind,
      visibility,
      sunProgress
    };
  }, [current, today, isC, data]);

  const handleLocationSelect = (newLocation) => {
    setManualLocation(newLocation);
    announceToScreenReader(`Location changed to ${newLocation.label}`);
  };

  return (
    <div className="app">
      {/* PWA Status Component */}
      <PWAStatus weatherData={data} location={location} />
      
      {/* Weather Alerts */}
      <WeatherAlerts weatherData={data} location={location} />

      {/* Background */}
      <div className="bg" role="presentation" aria-hidden="true">
        <span className="blob b1"></span>
        <span className="blob b2"></span>
        <span className="blob b3"></span>
        <span className="grid"></span>
      </div>

      <main className="shell" role="main">
        {/* Header */}
        <motion.header 
          className="topbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          role="banner"
        >
          <motion.div 
            className="brand"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="logo" role="img" aria-label="MeghBarta weather app logo">
              <motion.span 
                className="dot"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                aria-hidden="true"
              />
            </div>
            <div className="brand-text">
              <span className="title">MeghBarta</span>
              <span className="subtitle">Live climate, artfully</span>
            </div>
          </motion.div>

          <SearchBar 
            onLocationSelect={handleLocationSelect}
            onUseLocation={handleUseLocation}
            isGettingLocation={isGettingLocation}
          />

          <motion.div 
            className="units"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            role="group"
            aria-label="Temperature unit selection"
          >
            <motion.button
              className={`unit-btn ${unit === "C" ? "active" : ""}`}
              onClick={() => setUnit("C")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              aria-label={`Switch to Celsius ${unit === "C" ? "(current)" : ""}`}
              aria-pressed={unit === "C"}
            >
              °C
            </motion.button>
            <motion.button
              className={`unit-btn ${unit === "F" ? "active" : ""}`}
              onClick={() => setUnit("F")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              aria-label={`Switch to Fahrenheit ${unit === "F" ? "(current)" : ""}`}
              aria-pressed={unit === "F"}
            >
              °F
            </motion.button>
          </motion.div>
        </motion.header>

        {/* Main Content */}
        <section role="main" aria-label="Weather information">
          <AnimatePresence mode="wait">
            {!API_KEY && (
              <motion.div 
                className="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                role="alert"
                aria-live="polite"
              >
                Missing WeatherAPI key. Add it to .env as VITE_WEATHER_API_KEY.
              </motion.div>
            )}

            {API_KEY && status === "error" && (
              <motion.div 
                className="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                role="alert"
                aria-live="polite"
              >
                {error}
                <button 
                  onClick={handleRefresh}
                  className="retry-btn"
                  aria-label="Retry loading weather data"
                >
                  Try again
                </button>
              </motion.div>
            )}

            {API_KEY && status === "loading" && (
              <LoadingSkeleton />
            )}

            {API_KEY && status === "ready" && data && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <WeatherHero 
                  data={data}
                  unit={unit}
                  displayTemp={displayTemp}
                  displayHigh={displayHigh}
                  displayLow={displayLow}
                  feelTemp={feelTemp}
                  wind={wind}
                  visibility={visibility}
                />

                <motion.section 
                  className="panels"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  aria-label="Weather forecasts"
                >
                  <HourlyForecast today={today} unit={unit} />
                  <DailyForecast forecast={forecast} unit={unit} />
                </motion.section>

                <SunTimeline today={today} sunProgress={sunProgress} />
                <AirQuality current={current} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <motion.footer 
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        role="contentinfo"
      >
        Designed for phone and web • Smooth by default • Press ? for shortcuts
      </motion.footer>

      {/* Screen reader only content */}
      <div className="sr-only" aria-live="polite" id="announcements"></div>
    </div>
  );
};

// Main App with Query Provider and Error Boundary
const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WeatherApp />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;