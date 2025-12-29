// NEORA Service Worker - Cache d'images
const CACHE_NAME = 'neora-cache-v1';
const IMAGE_CACHE_NAME = 'neora-images-v1';

// Fichiers statiques à mettre en cache
const STATIC_FILES = [
  '/logo.jpg',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/1.jpg', '/1.png',
  '/2.jpg', '/2.png',
  '/3.jpg', '/3.png',
  '/4.jpg', '/4.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache des fichiers statiques');
      return cache.addAll(STATIC_FILES).catch(err => {
        console.log('[SW] Certains fichiers non trouvés, continuons...', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation - Nettoyer les anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Gérer les images
  if (isImageRequest(event.request)) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // Pour les autres requêtes, network first
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Vérifie si c'est une requête d'image
function isImageRequest(request) {
  const url = new URL(request.url);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  // Vérifie l'extension
  if (imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext))) {
    return true;
  }
  
  // Vérifie le header Accept
  const accept = request.headers.get('Accept');
  if (accept && accept.includes('image/')) {
    return true;
  }
  
  // URLs d'images générées (Firebase Storage, etc.)
  if (url.hostname.includes('firebasestorage') || 
      url.hostname.includes('googleapis') ||
      url.hostname.includes('cloudinary') ||
      url.hostname.includes('imgix')) {
    return true;
  }
  
  return false;
}

// Gère les requêtes d'images avec cache
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  
  // Chercher dans le cache d'abord
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('[SW] Image depuis cache:', request.url);
    
    // Rafraîchir en arrière-plan (stale-while-revalidate)
    fetchAndCache(request, cache);
    
    return cachedResponse;
  }
  
  // Sinon, télécharger et mettre en cache
  console.log('[SW] Téléchargement image:', request.url);
  return fetchAndCache(request, cache);
}

// Télécharge et met en cache
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    
    // Ne cache que les réponses réussies
    if (response.ok) {
      // Clone la réponse car elle ne peut être lue qu'une fois
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Erreur fetch:', error);
    
    // Retourner une image placeholder en cas d'erreur
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#1a1a2e" width="200" height="200"/><text fill="#666" x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14">Image non disponible</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Nettoyer le cache d'images (garder les 100 plus récentes)
async function cleanImageCache() {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const keys = await cache.keys();
  
  if (keys.length > 100) {
    console.log('[SW] Nettoyage cache images...');
    const keysToDelete = keys.slice(0, keys.length - 100);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Nettoyer périodiquement
setInterval(cleanImageCache, 60000); // Toutes les minutes
