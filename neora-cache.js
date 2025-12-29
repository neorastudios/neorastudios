/**
 * NEORA Image Cache & Lazy Loading
 * Ajoute ce script à toutes tes pages
 */

(function() {
  'use strict';

  // ============================================
  // 1. SERVICE WORKER REGISTRATION
  // ============================================
  
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ NEORA Cache actif');
        })
        .catch(error => {
          console.log('❌ Service Worker non enregistré:', error);
        });
    });
  }

  // ============================================
  // 2. LAZY LOADING DES IMAGES
  // ============================================
  
  // Configuration
  const lazyConfig = {
    rootMargin: '50px 0px',  // Charge 50px avant d'être visible
    threshold: 0.01
  };

  // Observer pour lazy loading
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        loadImage(img);
        observer.unobserve(img);
      }
    });
  }, lazyConfig);

  // Charge une image
  function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    // Créer une image temporaire pour précharger
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('lazy-loaded');
      
      // Animation fade-in
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      requestAnimationFrame(() => {
        img.style.opacity = '1';
      });
    };

    tempImg.onerror = () => {
      img.classList.add('lazy-error');
      console.warn('Image non chargée:', src);
    };

    tempImg.src = src;
  }

  // Initialiser lazy loading sur les images avec data-src
  function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      // Ajouter placeholder/skeleton
      if (!img.src || img.src === '') {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23111119" width="400" height="300"/%3E%3C/svg%3E';
      }
      img.classList.add('lazy');
      imageObserver.observe(img);
    });
  }

  // ============================================
  // 3. PRELOAD DES IMAGES CRITIQUES
  // ============================================
  
  function preloadCriticalImages() {
    const criticalImages = [
      '/logo.jpg',
      '/1.jpg', '/1.png',  // Slider avant/après
      '/2.jpg', '/2.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // ============================================
  // 4. SKELETON LOADER POUR IMAGES
  // ============================================
  
  // Ajoute des styles pour le skeleton loading
  function addSkeletonStyles() {
    if (document.getElementById('neora-lazy-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'neora-lazy-styles';
    style.textContent = `
      /* Lazy loading styles */
      img.lazy {
        background: linear-gradient(90deg, #111119 25%, #1a1a2e 50%, #111119 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      img.lazy-loaded {
        animation: none;
        background: none;
      }
      
      img.lazy-error {
        background: #1a1a2e;
        min-height: 100px;
      }
      
      /* Image container avec aspect ratio */
      .img-container {
        position: relative;
        overflow: hidden;
        background: #111119;
      }
      
      .img-container::before {
        content: '';
        display: block;
        padding-top: 75%; /* 4:3 ratio par défaut */
      }
      
      .img-container img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .img-container.ratio-1-1::before { padding-top: 100%; }
      .img-container.ratio-16-9::before { padding-top: 56.25%; }
      .img-container.ratio-4-3::before { padding-top: 75%; }
      .img-container.ratio-3-2::before { padding-top: 66.67%; }
    `;
    document.head.appendChild(style);
  }

  // ============================================
  // 5. CACHE MANUEL POUR HISTORIQUE
  // ============================================
  
  const NeoraImageCache = {
    dbName: 'neora-images-db',
    storeName: 'images',
    db: null,

    // Ouvrir la base de données IndexedDB
    async openDB() {
      if (this.db) return this.db;

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'url' });
          }
        };
      });
    },

    // Sauvegarder une image en cache
    async cacheImage(url, blob) {
      try {
        const db = await this.openDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        
        await store.put({
          url: url,
          blob: blob,
          timestamp: Date.now()
        });
        
        console.log('✅ Image cachée:', url);
      } catch (error) {
        console.warn('Cache image erreur:', error);
      }
    },

    // Récupérer une image du cache
    async getImage(url) {
      try {
        const db = await this.openDB();
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        
        return new Promise((resolve, reject) => {
          const request = store.get(url);
          request.onsuccess = () => resolve(request.result?.blob);
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        return null;
      }
    },

    // Charger image avec cache
    async loadWithCache(imgElement, url) {
      // Essayer le cache d'abord
      const cachedBlob = await this.getImage(url);
      
      if (cachedBlob) {
        imgElement.src = URL.createObjectURL(cachedBlob);
        imgElement.classList.add('from-cache');
        console.log('⚡ Image depuis cache local:', url);
        return;
      }

      // Sinon télécharger et cacher
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        imgElement.src = URL.createObjectURL(blob);
        
        // Cacher pour plus tard
        this.cacheImage(url, blob);
      } catch (error) {
        console.warn('Erreur chargement image:', error);
        imgElement.src = url; // Fallback
      }
    },

    // Nettoyer le cache (garder les 50 plus récentes)
    async cleanCache(keepCount = 50) {
      try {
        const db = await this.openDB();
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        
        const request = store.getAll();
        request.onsuccess = () => {
          const items = request.result;
          if (items.length > keepCount) {
            // Trier par timestamp et supprimer les plus anciens
            items.sort((a, b) => b.timestamp - a.timestamp);
            const toDelete = items.slice(keepCount);
            
            toDelete.forEach(item => store.delete(item.url));
            console.log(`🧹 Cache nettoyé: ${toDelete.length} images supprimées`);
          }
        };
      } catch (error) {
        console.warn('Erreur nettoyage cache:', error);
      }
    }
  };

  // Exposer globalement
  window.NeoraImageCache = NeoraImageCache;

  // ============================================
  // 6. INITIALISATION
  // ============================================
  
  function init() {
    addSkeletonStyles();
    preloadCriticalImages();
    initLazyLoading();
    
    // Nettoyer le cache au démarrage
    NeoraImageCache.cleanCache(50);
    
    // Observer les nouvelles images ajoutées dynamiquement
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG' && node.dataset.src) {
            node.classList.add('lazy');
            imageObserver.observe(node);
          }
          // Chercher aussi dans les descendants
          if (node.querySelectorAll) {
            node.querySelectorAll('img[data-src]').forEach(img => {
              img.classList.add('lazy');
              imageObserver.observe(img);
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('🚀 NEORA Image Cache initialisé');
  }

  // Lancer l'initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
