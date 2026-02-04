// Weather API service functions
import { extractErrorMessage } from '../utils/formatters.js';
import { API_BASE, API_KEY } from '../utils/constants.js';

export const fetchForecast = async (query) => {
  const url = `${API_BASE}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&days=3&aqi=no&alerts=no`;

  const response = await fetch(url);
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Unable to fetch weather data. ${message}`);
  }
  return response.json();
};

export const fetchSearch = async (query) => {
  const url = `${API_BASE}/search.json?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}`;
  const response = await fetch(url);
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Unable to search locations. ${message}`);
  }
  return response.json();
};

export const fetchCurrentWeather = async (query) => {
  const url = `${API_BASE}/current.json?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&aqi=no`;

  const response = await fetch(url);
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(`Unable to fetch current weather. ${message}`);
  }
  return response.json();
};