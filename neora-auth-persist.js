/**
 * NEORA Auth Persistence
 * Élimine le flash de déconnexion entre les pages
 * Ajoute ce script APRÈS Firebase et AVANT ton code d'auth
 */

(function() {
  'use strict';

  const AUTH_CACHE_KEY = 'neora_auth_cache';
  const CACHE_DURATION = 3600000; // 1 heure en ms

  // Sauvegarder l'état d'auth
  window.NeoraAuth = {
    
    // Sauvegarder l'utilisateur connecté
    saveUser: function(user) {
      if (!user) {
        localStorage.removeItem(AUTH_CACHE_KEY);
        return;
      }
      
      const cache = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        timestamp: Date.now()
      };
      
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
    },
    
    // Sauvegarder le plan utilisateur
    savePlan: function(plan) {
      const cache = this.getCachedUser();
      if (cache) {
        cache.plan = plan;
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
      }
    },
    
    // Récupérer l'utilisateur caché
    getCachedUser: function() {
      try {
        const cached = localStorage.getItem(AUTH_CACHE_KEY);
        if (!cached) return null;
        
        const data = JSON.parse(cached);
        
        // Vérifier si le cache n'est pas expiré
        if (Date.now() - data.timestamp > CACHE_DURATION) {
          localStorage.removeItem(AUTH_CACHE_KEY);
          return null;
        }
        
        return data;
      } catch (e) {
        return null;
      }
    },
    
    // Vérifier si l'utilisateur est probablement connecté
    isLikelyLoggedIn: function() {
      return this.getCachedUser() !== null;
    },
    
    // Effacer le cache (à appeler lors du logout)
    clear: function() {
      localStorage.removeItem(AUTH_CACHE_KEY);
    },
    
    // Appliquer l'UI immédiatement basé sur le cache
    applyUIFromCache: function() {
      const cached = this.getCachedUser();
      
      if (cached) {
        // Cacher les boutons de connexion
        const loginBtns = document.querySelectorAll('#navButtons, .nav-buttons, .login-buttons, .auth-buttons');
        loginBtns.forEach(el => el.style.display = 'none');
        
        // Afficher le menu utilisateur
        const userMenus = document.querySelectorAll('#userMenu, .user-menu');
        userMenus.forEach(el => el.style.display = 'flex');
        
        // Afficher l'email si l'élément existe
        const emailEls = document.querySelectorAll('#userEmail, .user-email');
        emailEls.forEach(el => el.textContent = cached.email || '');
        
        // Afficher le plan si disponible
        if (cached.plan) {
          const planEls = document.querySelectorAll('#userPlan, .user-plan');
          planEls.forEach(el => {
            el.textContent = cached.plan.charAt(0).toUpperCase() + cached.plan.slice(1);
            if (cached.plan === 'pro') {
              el.classList.add('pro');
            }
          });
        }
        
        // Marquer le body comme auth-ready immédiatement
        document.body.classList.add('auth-cached');
      }
      
      return cached;
    }
  };

  // Appliquer l'UI dès que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.NeoraAuth.applyUIFromCache();
    });
  } else {
    window.NeoraAuth.applyUIFromCache();
  }

})();

/**
 * UTILISATION :
 * 
 * Dans ton code Firebase onAuthStateChanged, ajoute :
 * 
 * auth.onAuthStateChanged(async (user) => {
 *   if (user) {
 *     // Sauvegarder dans le cache
 *     NeoraAuth.saveUser(user);
 *     
 *     // Récupérer le plan et le sauvegarder aussi
 *     const userDoc = await db.collection('users').doc(user.uid).get();
 *     if (userDoc.exists) {
 *       const plan = userDoc.data().plan || 'free';
 *       NeoraAuth.savePlan(plan);
 *     }
 *     
 *     // ... reste de ton code
 *   } else {
 *     // Effacer le cache
 *     NeoraAuth.clear();
 *     
 *     // ... reste de ton code
 *   }
 * });
 * 
 * Dans ta fonction logout :
 * 
 * function logout() {
 *   NeoraAuth.clear();
 *   auth.signOut().then(() => {
 *     window.location.href = 'index.html';
 *   });
 * }
 */
