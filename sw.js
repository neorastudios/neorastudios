// NEORA Service Worker - Cache d'images (FIX POST + Firestore)
const CACHE_NAME = 'neora-cache-v2';         // 🔁 bump version pour forcer MAJ
const IMAGE_CACHE_NAME = 'neora-images-v2';  // 🔁 bump version pour forcer MAJ

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
  const req = event.request;
  const url = new URL(req.url);

  // ✅ CRITIQUE : ne jamais gérer/cacher autre chose que GET
  // Firestore listen utilise du POST => on laisse passer.
  if (req.method !== 'GET') return;

  // ✅ Ne pas toucher aux appels Firebase/Firestore (évite tout effet de bord)
  // (Tu peux garder Firebasestorage si tu veux, mais pas "googleapis" en général)
  const blockedHosts = [
    'firestore.googleapis.com',
    'identitytoolkit.googleapis.com',
    'securetoken.googleapis.com'
  ];
  if (blockedHosts.some(h => url.hostname.includes(h))) return;

  // Gérer les images (GET uniquement)
  if (isImageRequest(req)) {
    event.respondWith(handleImageRequest(req));
    return;
  }

  // Pour les autres requêtes GET : network first
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Vérifie si c'est une requête d'image (GET seulement)
function isImageRequest(request) {
  if (request.method !== 'GET') return false;

  const url = new URL(request.url);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

  // ✅ Si le navigateur dit explicitement que c'est une image
  if (request.destination === 'image') return true;

  // Vérifie l'extension
  if (imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext))) return true;

  // Vérifie le header Accept
  const accept = request.headers.get('Accept');
  if (accept && accept.includes('image/')) return true;

  // ✅ N'autorise que des hosts d'images (pas "googleapis" global)
  if (
    url.hostname.includes('firebasestorage.googleapis.com') ||
    url.hostname.includes('storage.googleapis.com') ||         // parfois utilisé par Firebase Storage
    url.hostname.includes('lh3.googleusercontent.com') ||      // avatars Google
    url.hostname.includes('res.cloudinary.com') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('imgix.net') ||
    url.hostname.includes('imgix')
  ) {
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

// Télécharge et met en cache (GET uniquement)
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);

    // ✅ Ne cache que les GET + réponses OK
    if (request.method === 'GET' && response && response.ok) {
      await cache.put(request, response.clone());
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
