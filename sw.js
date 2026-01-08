// NEORA Service Worker - Cache d'images
const CACHE_NAME = 'neora-cache-v2';
const IMAGE_CACHE_NAME = 'neora-images-v2';

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
  // On ne met en cache que des images en GET (sinon Cache.put() plante sur POST, etc.)
  if (request.method && request.method !== 'GET') return false;

  const url = new URL(request.url);

  // IMPORTANT: ne jamais traiter Firestore comme une "image"
  // (Firestore passe par firestore.googleapis.com et utilise souvent POST)
  if (url.hostname === 'firestore.googleapis.com') return false;

  // Détection fiable: destination "image" OU header accept image/* OU extension
  if (request.destination === 'image') return true;

  const accept = request.headers.get('accept') || '';
  if (accept.includes('image/')) return true;

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
  if (imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext))) return true;

  // Sources d'images connues (Cloudinary, Firebase Storage, Googleusercontent avatars)
  if (url.hostname.includes('cloudinary.com') ||
      url.hostname.includes('firebasestorage.googleapis.com') ||
      url.hostname.includes('googleusercontent.com') ||
      url.hostname.includes('gstatic.com')) {
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

    // On renvoie TOUJOURS la réponse réseau si on l'a,
    // même si la mise en cache échoue.
    if (response && response.ok && request.method === 'GET') {
      try {
        await cache.put(request, response.clone());
      } catch (e) {
        console.warn('[SW] Cache.put() failed (ignored):', e);
      }
    }

    return response;
  } catch (error) {
    console.error('[SW] Erreur fetch:', error);

    // Fallback: cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;

    // Fallback final: placeholder (uniquement si on n'a rien)
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#050714"/><text x="50%" y="50%" font-family="sans-serif" font-size="14" fill="#8b5cf6" text-anchor="middle">Image non disponible</text></svg>',
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
