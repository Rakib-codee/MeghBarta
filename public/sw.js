// Service Worker for MeghBarta Weather App
const CACHE_NAME = 'meghbarta-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/src/App.jsx',
  '/src/styles.css',
  '/src/main.jsx',
  '/offline.html'
];

// API cache configuration
const API_CACHE_NAME = 'weather-api-v1';
const API_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static resources:', error);
      })
  );
  
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all pages
        return self.clients.claim();
      })
  );
});

// Fetch event - network-first strategy for API, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle weather API requests
  if (url.hostname === 'api.weatherapi.com') {
    event.respondWith(handleWeatherAPIRequest(request));
    return;
  }

  // Handle static resources
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle Weather API requests with caching and offline support
async function handleWeatherAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cacheKey = request.url;

  try {
    // Try network first
    console.log('[SW] Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful response with timestamp
      const responseToCache = networkResponse.clone();
      const cacheData = {
        response: await responseToCache.arrayBuffer(),
        headers: [...networkResponse.headers.entries()],
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        timestamp: Date.now()
      };
      
      await cache.put(cacheKey, new Response(JSON.stringify(cacheData)));
      console.log('[SW] Cached API response');
      
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);
    
    // Try cache as fallback
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      const cacheData = JSON.parse(await cachedResponse.text());
      const age = Date.now() - cacheData.timestamp;
      
      // Use cached data if it's fresh enough (even if stale, better than nothing)
      if (age < API_CACHE_DURATION * 3) { // Allow 30 minutes for offline
        console.log('[SW] Serving cached API response');
        
        const headers = new Headers();
        cacheData.headers.forEach(([key, value]) => headers.set(key, value));
        headers.set('X-SW-Cache', 'true');
        headers.set('X-SW-Cache-Age', Math.round(age / 1000) + 's');
        
        return new Response(cacheData.response, {
          status: cacheData.status,
          statusText: cacheData.statusText,
          headers
        });
      }
    }
    
    // Return offline data or error
    return createOfflineAPIResponse();
  }
}

// Handle static resource requests
async function handleStaticRequest(request) {
  try {
    // Network first for HTML, cache first for other resources
    if (request.headers.get('accept')?.includes('text/html')) {
      return await handleNavigationRequest(request);
    }
    
    // Cache first for static resources
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network if not in cache
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version or offline page
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match(OFFLINE_URL);
  }
}

// Handle navigation requests (HTML pages)
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    return caches.match(OFFLINE_URL);
  }
}

// Create offline API response with dummy data
function createOfflineAPIResponse() {
  const offlineData = {
    current: {
      temp_c: '--',
      temp_f: '--',
      condition: {
        text: 'Weather data unavailable offline'
      },
      humidity: '--',
      wind_kph: '--',
      wind_mph: '--',
      pressure_mb: '--',
      feelslike_c: '--',
      feelslike_f: '--',
      vis_km: '--',
      vis_miles: '--',
      uv: '--'
    },
    location: {
      name: 'Offline Mode',
      localtime: new Date().toISOString()
    },
    forecast: {
      forecastday: [
        {
          date: new Date().toISOString().split('T')[0],
          day: {
            condition: { text: 'No data available' },
            maxtemp_c: '--',
            maxtemp_f: '--',
            mintemp_c: '--',
            mintemp_f: '--'
          },
          astro: {
            sunrise: '--',
            sunset: '--'
          },
          hour: Array.from({ length: 24 }, (_, i) => ({
            time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
            temp_c: '--',
            temp_f: '--',
            condition: { text: 'Offline' }
          }))
        }
      ]
    }
  };

  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-SW-Offline': 'true'
  });

  return new Response(JSON.stringify(offlineData), {
    status: 200,
    statusText: 'OK (Offline Mode)',
    headers
  });
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'weather-sync') {
    console.log('[SW] Background sync: weather-sync');
    event.waitUntil(syncWeatherData());
  }
});

// Sync weather data when connection is restored
async function syncWeatherData() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_WEATHER_DATA',
        message: 'Connection restored, syncing weather data...'
      });
    });
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Weather update available',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [300, 100, 400],
    data: data.data || {},
    tag: 'weather-update',
    actions: [
      {
        action: 'view',
        title: 'View Weather'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Weather Alert', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

console.log('[SW] Service Worker loaded');