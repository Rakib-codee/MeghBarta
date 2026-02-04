// Utility functions for temperature and time formatting

export const toCelsius = (f) => (f - 32) * (5 / 9);

export const formatTemp = (value) => `${Math.round(value)}°`;

export const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const getTimePercent = (now, sunrise, sunset) => {
  if (!sunrise || !sunset) return 0.5;
  const total = sunset - sunrise;
  const elapsed = Math.min(Math.max(now - sunrise, 0), total);
  return total > 0 ? elapsed / total : 0.5;
};

export const parseAstroTime = (dateBase, timeString) => {
  if (!timeString) return null;
  const [time, meridiem] = timeString.split(" ");
  const [rawHour, minute] = time.split(":").map(Number);
  let hour = rawHour % 12;
  if (meridiem.toLowerCase() === "pm") hour += 12;
  const date = new Date(dateBase);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const getAQILabel = (index) => {
  if (index === 1) return "Good";
  if (index === 2) return "Moderate";
  if (index === 3) return "Unhealthy (SG)";
  if (index === 4) return "Unhealthy";
  if (index === 5) return "Very Unhealthy";
  if (index === 6) return "Hazardous";
  return "Unknown";
};

export const extractErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || response.statusText;
  } catch {
    return response.statusText || "Request failed.";
  }
};

// Enhanced "Feels Like" Temperature Calculation
// Combines Heat Index, Wind Chill, and Humidex for accurate results

export const calculateHeatIndex = (tempC, humidity) => {
  // Convert to Fahrenheit for heat index calculation
  const tempF = (tempC * 9/5) + 32;
  
  if (tempF < 80) return tempC; // Heat index only applies above 80°F (26.7°C)
  
  // Rothfusz equation for heat index (more accurate)
  const T = tempF;
  const R = humidity;
  
  let heatIndex = -42.379 + 
                 2.04901523 * T + 
                 10.14333127 * R -
                 0.22475541 * T * R -
                 6.83783e-3 * T * T -
                 5.481717e-2 * R * R +
                 1.22874e-3 * T * T * R +
                 8.5282e-4 * T * R * R -
                 1.99e-6 * T * T * R * R;
  
  // Adjustments for specific conditions
  if (R < 13 && T >= 80 && T <= 112) {
    heatIndex -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (R > 85 && T >= 80 && T <= 87) {
    heatIndex += ((R - 85) / 10) * ((87 - T) / 5);
  }
  
  // Convert back to Celsius
  return (heatIndex - 32) * 5/9;
};

export const calculateWindChill = (tempC, windKph) => {
  // Wind chill only applies below 10°C and wind speed > 4.8 km/h
  if (tempC > 10 || windKph <= 4.8) return tempC;
  
  // Environment Canada wind chill formula (more accurate than US formula)
  const windChill = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKph, 0.16) + 0.3965 * tempC * Math.pow(windKph, 0.16);
  
  return windChill;
};

export const calculateHumidex = (tempC, humidity) => {
  // Humidex calculation (Canadian formula)
  const dewPoint = tempC - ((100 - humidity) / 5);
  const humidexFactor = 6.112 * Math.pow(10, (7.5 * dewPoint) / (237.7 + dewPoint)) * humidity / 100;
  const humidex = tempC + (5/9) * (humidexFactor - 10);
  
  return humidex;
};

export const calculateAccurateFeelsLike = (weatherData, unit = 'C') => {
  const current = weatherData?.current;
  if (!current) return null;
  
  const tempC = current.temp_c;
  const humidity = current.humidity;
  const windKph = current.wind_kph;
  const condition = current.condition?.text?.toLowerCase() || '';
  
  let feelsLike = tempC;
  
  // Apply appropriate calculation based on conditions
  if (tempC >= 27 && humidity >= 40) {
    // Hot weather - use heat index
    feelsLike = calculateHeatIndex(tempC, humidity);
  } else if (tempC <= 10 && windKph > 4.8) {
    // Cold weather - use wind chill
    feelsLike = calculateWindChill(tempC, windKph);
  } else if (humidity >= 60) {
    // High humidity - use humidex
    feelsLike = calculateHumidex(tempC, humidity);
  } else {
    // Moderate conditions - slight adjustment based on humidity and wind
    const humidityFactor = (humidity - 50) * 0.1; // Each 10% humidity = 1°C difference
    const windFactor = Math.min(windKph * 0.05, 2); // Wind cooling effect
    feelsLike = tempC + humidityFactor - windFactor;
  }
  
  // Additional factors for special conditions
  if (condition.includes('rain') || condition.includes('shower')) {
    feelsLike -= 1; // Rain makes it feel cooler
  }
  if (condition.includes('sunny') && tempC > 20) {
    feelsLike += 0.5; // Direct sunlight makes it feel warmer
  }
  
  // Convert to Fahrenheit if needed
  if (unit === 'F') {
    feelsLike = (feelsLike * 9/5) + 32;
  }
  
  return Math.round(feelsLike * 10) / 10; // Round to 1 decimal place
};