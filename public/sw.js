// Service Worker for International Car Company Inc
// Version: 1.0.0
// Cache Strategy: Cache First with Network Fallback

const CACHE_NAME = 'icc-cache-v1.0.0';
const STATIC_CACHE = 'icc-static-v1.0.0';
const DYNAMIC_CACHE = 'icc-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/inventory',
  '/about',
  '/contact',
  '/faq',
  '/privacy',
  '/terms',
  '/security',
  '/prestige-auto-sales-logo.png',
  '/optimized/placeholder.webp',
  '/optimized/am-tycoons-logo.webp',
  '/optimized/bmw-3-series-black.webp',
  '/optimized/ford-f150-2020.webp',
  '/optimized/honda-civic-2021.webp',
  '/optimized/toyota-camry-2019.webp'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated and cleaned up old caches');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isAuthRequest(request)) {
    // Never cache authentication requests - always fetch fresh
    event.respondWith(noCache(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImageRequest(request)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Cache First strategy for static assets
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// No Cache strategy for authentication requests
async function noCache(request) {
  try {
    // Clear any existing cache for this request
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.delete(request);
    
    // Always fetch fresh from network, never cache
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.error('No Cache strategy failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Network First strategy for dynamic content
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses (200-299) and redirects (300-399)
    // Never cache error responses (400-599) as they might be temporary
    if (networkResponse.ok || (networkResponse.status >= 300 && networkResponse.status < 400)) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Network error', { status: 503 });
  }
}

// Check if request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return STATIC_ASSETS.includes(url.pathname) ||
         url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js');
}

// Check if request is for an image
function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i) ||
         url.pathname.includes('/optimized/');
}

// Check if request is for an API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Check if request is for authentication endpoints (never cache these)
function isAuthRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/admin/') || 
         url.pathname.includes('/login') ||
         url.pathname.includes('/auth') ||
         url.pathname.includes('/me');
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get stored form data
    const formData = await getStoredFormData();
    if (formData) {
      // Attempt to submit form data
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Clear stored form data on success
        await clearStoredFormData();
        console.log('Background sync: Form submitted successfully');
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Store form data for offline submission
async function storeFormData(formData) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put('/offline-form-data', new Response(JSON.stringify(formData)));
  } catch (error) {
    console.error('Failed to store form data:', error);
  }
}

// Get stored form data
async function getStoredFormData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match('/offline-form-data');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to get stored form data:', error);
  }
  return null;
}

// Clear stored form data
async function clearStoredFormData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.delete('/offline-form-data');
  } catch (error) {
    console.error('Failed to clear stored form data:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/prestige-auto-sales-logo.png',
      badge: '/prestige-auto-sales-logo.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: '/prestige-auto-sales-logo.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/prestige-auto-sales-logo.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/inventory')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});
