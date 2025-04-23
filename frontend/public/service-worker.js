const CACHE_NAME = 'online-bar-v1';
const FONT_CACHE = 'font-cache-v1';

// Font files to precache
const FONT_FILES = [
  '/fonts/Corinthia-Regular.woff2',
  '/fonts/Corinthia-Bold.woff2',
  '/fonts/OldStandardTT-Regular.woff2',
  '/fonts/OldStandardTT-Bold.woff2',
  '/fonts/OldStandardTT-Italic.woff2',
  '/fonts/Corinthia-Regular.ttf',
  '/fonts/Corinthia-Bold.ttf',
  '/fonts/OldStandardTT-Regular.ttf',
  '/fonts/OldStandardTT-Bold.ttf',
  '/fonts/OldStandardTT-Italic.ttf'
];

// Install event - precache fonts
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(FONT_CACHE).then((cache) => {
      return cache.addAll(FONT_FILES);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== FONT_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve fonts from cache, falling back to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle font requests
  if (url.pathname.match(/\.(woff2?|ttf|eot)$/)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          // Serve from cache with proper headers
          const headers = new Headers(response.headers);
          headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year
          headers.set('Vary', 'Accept-Encoding');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
        }
        
        // Fetch from network and cache
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(FONT_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
    );
  }
}); 