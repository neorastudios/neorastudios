/**
 * NEORA Mobile Navigation
 * Menu hamburger pour mobile
 * Ajoute ce script à toutes tes pages : <script src="neora-mobile-nav.js"></script>
 */

(function() {
  'use strict';

  // Attendre le DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Ne s'active que sur mobile
    if (window.innerWidth > 768) {
      window.addEventListener('resize', checkMobile);
      return;
    }
    
    createMobileNav();
  }

  function checkMobile() {
    if (window.innerWidth <= 768 && !document.getElementById('neora-mobile-menu')) {
      createMobileNav();
    }
  }

  function createMobileNav() {
    // Trouver la navbar existante
    const nav = document.querySelector('.nav, .topbar, nav');
    if (!nav) return;

    // Trouver les liens de navigation
    const navLinks = nav.querySelector('.nav-links');
    if (!navLinks) return;

    // Cacher les liens desktop
    navLinks.style.display = 'none';

    // Créer le bouton hamburger
    const hamburger = document.createElement('button');
    hamburger.id = 'neora-hamburger';
    hamburger.className = 'neora-hamburger';
    hamburger.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
    hamburger.setAttribute('aria-label', 'Menu');

    // Créer le menu mobile
    const mobileMenu = document.createElement('div');
    mobileMenu.id = 'neora-mobile-menu';
    mobileMenu.className = 'neora-mobile-menu';
    
    // Copier les liens
    const links = navLinks.querySelectorAll('a');
    let menuHTML = '<div class="neora-mobile-menu-inner">';
    
    links.forEach(link => {
      menuHTML += `<a href="${link.href}" class="neora-mobile-link" onclick="${link.getAttribute('onclick') || ''}">${link.innerHTML}</a>`;
    });
    
    // Ajouter boutons auth si présents
    const authBtns = nav.querySelector('.nav-buttons, #navButtons');
    const userMenu = nav.querySelector('.user-menu, #userMenu');
    
    if (authBtns && authBtns.style.display !== 'none') {
      const btns = authBtns.querySelectorAll('button, a');
      btns.forEach(btn => {
        menuHTML += `<button class="neora-mobile-btn" onclick="${btn.getAttribute('onclick') || ''}">${btn.innerHTML}</button>`;
      });
    }
    
    if (userMenu && userMenu.style.display !== 'none') {
      const btns = userMenu.querySelectorAll('button, a');
      btns.forEach(btn => {
        menuHTML += `<button class="neora-mobile-btn" onclick="${btn.getAttribute('onclick') || ''}">${btn.innerHTML}</button>`;
      });
    }
    
    menuHTML += '</div>';
    mobileMenu.innerHTML = menuHTML;

    // Insérer dans le DOM
    const navInner = nav.querySelector('.nav-inner, .topbar-inner') || nav;
    navInner.appendChild(hamburger);
    document.body.appendChild(mobileMenu);

    // Toggle menu
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });

    // Fermer au clic sur un lien
    mobileMenu.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });

    // Fermer au clic outside
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });

    // Injecter les styles
    injectStyles();
  }

  function injectStyles() {
    if (document.getElementById('neora-mobile-nav-styles')) return;

    const style = document.createElement('style');
    style.id = 'neora-mobile-nav-styles';
    style.textContent = `
      /* Hamburger Button */
      .neora-hamburger {
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 44px;
        height: 44px;
        padding: 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        cursor: pointer;
        z-index: 1001;
        gap: 5px;
      }

      .neora-hamburger span {
        display: block;
        width: 22px;
        height: 2px;
        background: #fff;
        border-radius: 2px;
        transition: all 0.3s ease;
      }

      .neora-hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
      }

      .neora-hamburger.active span:nth-child(2) {
        opacity: 0;
      }

      .neora-hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(5px, -5px);
      }

      /* Mobile Menu */
      .neora-mobile-menu {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .neora-mobile-menu.open {
        opacity: 1;
        visibility: visible;
      }

      .neora-mobile-menu-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 20px;
        width: 100%;
        max-width: 300px;
      }

      .neora-mobile-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 16px 24px;
        color: rgba(255,255,255,0.9);
        text-decoration: none;
        font-size: 16px;
        font-weight: 500;
        border-radius: 12px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        transition: all 0.2s ease;
      }

      .neora-mobile-link:hover,
      .neora-mobile-link:active {
        background: rgba(139,92,246,0.2);
        border-color: rgba(139,92,246,0.4);
        color: #fff;
      }

      .neora-mobile-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 16px 24px;
        margin-top: 8px;
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        font-family: inherit;
        border-radius: 12px;
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .neora-mobile-btn:hover,
      .neora-mobile-btn:active {
        transform: scale(1.02);
        box-shadow: 0 10px 30px rgba(139,92,246,0.4);
      }

      /* Body lock when menu open */
      body.menu-open {
        overflow: hidden;
      }

      /* Show hamburger on mobile */
      @media (max-width: 768px) {
        .neora-hamburger {
          display: flex !important;
        }
        
        .nav-links,
        .topbar .nav-links {
          display: none !important;
        }
        
        .nav-buttons,
        #navButtons,
        .user-menu,
        #userMenu {
          display: none !important;
        }
      }

      /* Hide on desktop */
      @media (min-width: 769px) {
        .neora-hamburger,
        .neora-mobile-menu {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

})();
