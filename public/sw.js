/**
 * Service Worker for Umbra Player
 * Handles caching of music files and offline support
 */

const CACHE_NAME = 'umbra-cache-v1';
const MUSIC_CACHE_NAME = 'umbra-music-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/default-artwork.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== MUSIC_CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // For navigation requests, try network first then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For music files (under the /music/ path), always serve from cache
  if (event.request.url.includes('/music/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || Promise.reject('not-found');
        })
    );
    return;
  }
  
  // For other assets, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.ok) {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return fetchResponse;
          });
      })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STORE_MUSIC_FILE') {
    const { id, file } = event.data;
    
    // Store music file in cache
    caches.open(MUSIC_CACHE_NAME)
      .then((cache) => {
        // Create a response object from the file
        const response = new Response(file, {
          headers: {
            'Content-Type': file.type,
            'Content-Length': file.size.toString()
          }
        });
        
        // Store in cache with a URL pattern that includes the song ID
        const url = new URL(`/music/${id}`, self.location.origin).href;
        return cache.put(url, response);
      })
      .then(() => {
        // Notify client that file is stored
        event.source.postMessage({
          type: 'MUSIC_FILE_STORED',
          id,
          success: true
        });
      })
      .catch((error) => {
        console.error('Failed to store music file:', error);
        event.source.postMessage({
          type: 'MUSIC_FILE_STORED',
          id,
          success: false,
          error: error.message
        });
      });
  }
  
  if (event.data && event.data.type === 'CLEAR_MUSIC_CACHE') {
    // Clear music cache
    caches.delete(MUSIC_CACHE_NAME)
      .then((success) => {
        event.source.postMessage({
          type: 'MUSIC_CACHE_CLEARED',
          success
        });
      });
  }
});