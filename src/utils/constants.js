// Constants for the weather application

export const API_BASE = "https://api.weatherapi.com/v1";
export const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";

// Debug: Log if API key is missing (only in development)
if (!import.meta.env.VITE_WEATHER_API_KEY) {
  console.warn("⚠️ VITE_WEATHER_API_KEY is not set! Please add it to your environment variables.");
}

export const fallbackLocation = {
  label: "Bengaluru",
  query: "Bengaluru"
};

// Weather condition mappings for animations and themes
export const WEATHER_CONDITIONS = {
  SUNNY: ['sunny', 'clear'],
  RAINY: ['rain', 'drizzle', 'shower'],
  CLOUDY: ['cloudy', 'overcast', 'partly cloudy'],
  SNOWY: ['snow', 'blizzard', 'sleet'],
  STORMY: ['thunderstorm', 'thunder'],
  FOGGY: ['fog', 'mist', 'haze']
};

// Theme colors for different weather conditions
export const WEATHER_THEMES = {
  sunny: {
    primary: '#FFB86C',
    secondary: '#4FACFE',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    accent: '#ffb86c',
  },
  rainy: {
    primary: '#62F5D8',
    secondary: '#667DB6',
    background: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)',
    accent: '#62f5d8',
  },
  cloudy: {
    primary: '#8E9EAB',
    secondary: '#757F9A',
    background: 'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
    accent: '#8e9eab',
  },
  stormy: {
    primary: '#FF7AA2',
    secondary: '#464C6A',
    background: 'linear-gradient(135deg, #464C6A 0%, #2D1B69 100%)',
    accent: '#ff7aa2',
  },
  snowy: {
    primary: '#E8F4FD',
    secondary: '#C7D2FE',
    background: 'linear-gradient(135deg, #C7D2FE 0%, #F9FAFB 100%)',
    accent: '#e8f4fd',
  }
};