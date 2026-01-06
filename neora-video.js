// ============================================
// NEORA Video Animation - Kling Integration
// ============================================
// Ajoute ce fichier à tes pages NEORA
// <script src="neora-video.js"></script>

(function() {
  'use strict';

  // Configuration
  const KLING_WEBHOOK_URL = 'https://n8n.srv1125399.hstgr.cloud/webhook/kling-video';
  
  // Styles d'animation disponibles
  const ANIMATION_STYLES = [
    { id: 'zoom_in', name: '🔍 Zoom avant', desc: 'Zoom lent et cinématique' },
    { id: 'zoom_out', name: '🔭 Zoom arrière', desc: 'Révèle la scène complète' },
    { id: 'pan_left', name: '⬅️ Travelling gauche', desc: 'Mouvement horizontal fluide' },
    { id: 'pan_right', name: '➡️ Travelling droite', desc: 'Mouvement horizontal fluide' },
    { id: 'float', name: '🌊 Flottement', desc: 'Mouvement doux et onirique' },
    { id: 'rotate', name: '🔄 Rotation 360°', desc: 'Orbite autour du sujet' },
    { id: 'sparkle', name: '✨ Particules', desc: 'Effets magiques et brillants' },
    { id: 'reveal', name: '🎬 Révélation', desc: 'Effet premium avec lumière' },
    { id: 'breathe', name: '💫 Respiration', desc: 'Pulsation subtile et vivante' },
    { id: 'custom', name: '✏️ Personnalisé', desc: 'Décris ton animation' }
  ];

  // Créer le modal HTML
  function createVideoModal() {
    const modalHTML = `
      <div id="videoModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.9); backdrop-filter:blur(12px); z-index:2000; align-items:center; justify-content:center; padding:20px;">
        <div style="background:linear-gradient(180deg,#12121f,#0a0a14); border:1px solid rgba(255,255,255,.14); border-radius:24px; padding:32px; max-width:480px; width:100%; max-height:90vh; overflow-y:auto;">
          
          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
            <h2 style="margin:0; font-size:22px; font-weight:700; color:#fff;">
              🎬 Animer l'image
            </h2>
            <button onclick="closeVideoModal()" style="background:none; border:none; color:rgba(255,255,255,.6); font-size:24px; cursor:pointer; padding:4px;">✕</button>
          </div>
          
          <!-- Preview Image -->
          <div id="videoPreviewContainer" style="background:rgba(0,0,0,.4); border-radius:16px; overflow:hidden; margin-bottom:24px; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center;">
            <img id="videoPreviewImage" src="" alt="Preview" style="max-width:100%; max-height:100%; object-fit:contain;">
          </div>
          
          <!-- Style Selection -->
          <label style="display:block; font-size:13px; color:rgba(255,255,255,.7); margin-bottom:10px; font-weight:600;">
            🎭 Style d'animation
          </label>
          <div id="styleGrid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:20px;">
            ${ANIMATION_STYLES.map(style => `
              <div class="style-option" data-style="${style.id}" onclick="selectAnimationStyle('${style.id}')" 
                   style="padding:14px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:12px; cursor:pointer; transition:all .2s ease;">
                <div style="font-size:14px; font-weight:600; color:#fff; margin-bottom:4px;">${style.name}</div>
                <div style="font-size:11px; color:rgba(255,255,255,.5);">${style.desc}</div>
              </div>
            `).join('')}
          </div>
          
          <!-- Custom Prompt (hidden by default) -->
          <div id="customPromptContainer" style="display:none; margin-bottom:20px;">
            <label style="display:block; font-size:13px; color:rgba(255,255,255,.7); margin-bottom:8px; font-weight:600;">
              ✏️ Décris l'animation
            </label>
            <textarea id="customPromptInput" placeholder="Ex: Zoom lent avec des particules dorées qui apparaissent autour du produit..."
                      style="width:100%; min-height:80px; padding:12px; background:rgba(0,0,0,.4); border:1px solid rgba(255,255,255,.15); border-radius:12px; color:#fff; font-size:14px; resize:vertical;"></textarea>
          </div>
          
          <!-- Duration -->
          <label style="display:block; font-size:13px; color:rgba(255,255,255,.7); margin-bottom:10px; font-weight:600;">
            ⏱️ Durée
          </label>
          <div style="display:flex; gap:12px; margin-bottom:24px;">
            <button id="duration5" onclick="selectDuration('5')" class="duration-btn active-duration"
                    style="flex:1; padding:14px; background:rgba(139,92,246,.2); border:1px solid rgba(139,92,246,.5); border-radius:12px; color:#fff; font-weight:600; cursor:pointer; transition:all .2s ease;">
              5 secondes
            </button>
            <button id="duration10" onclick="selectDuration('10')" class="duration-btn"
                    style="flex:1; padding:14px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12); border-radius:12px; color:#fff; font-weight:600; cursor:pointer; transition:all .2s ease;">
              10 secondes
            </button>
          </div>
          
          <!-- Cost Info -->
          <div style="background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.3); border-radius:12px; padding:14px; margin-bottom:24px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">💰</span>
              <span style="font-size:13px; color:rgba(255,255,255,.85);">
                <strong id="videoCost">1 crédit vidéo</strong> sera utilisé
              </span>
            </div>
          </div>
          
          <!-- Generate Button -->
          <button id="generateVideoBtn" onclick="generateVideo()"
                  style="width:100%; padding:18px; background:linear-gradient(135deg,#8b5cf6,#ec4899); border:none; border-radius:999px; color:#fff; font-size:16px; font-weight:700; cursor:pointer; box-shadow:0 10px 40px rgba(139,92,246,.35); transition:all .2s ease;">
            🎬 Générer la vidéo
          </button>
          
          <!-- Loading State -->
          <div id="videoLoadingState" style="display:none; text-align:center; padding:20px 0;">
            <div style="width:50px; height:50px; border:3px solid rgba(255,255,255,.1); border-top-color:#8b5cf6; border-radius:50%; margin:0 auto 16px; animation:spin 1s linear infinite;"></div>
            <p style="color:rgba(255,255,255,.8); font-size:14px; margin:0;">Génération en cours...</p>
            <p style="color:rgba(255,255,255,.5); font-size:12px; margin:8px 0 0;">Cela peut prendre 1-2 minutes</p>
          </div>
          
          <!-- Result State -->
          <div id="videoResultState" style="display:none;">
            <div style="background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.3); border-radius:12px; padding:16px; margin-bottom:16px; text-align:center;">
              <span style="font-size:24px;">✅</span>
              <p style="color:#10b981; font-weight:600; margin:8px 0 0;">Vidéo générée !</p>
            </div>
            <video id="videoResult" controls style="width:100%; border-radius:12px; margin-bottom:16px;"></video>
            <a id="downloadVideoBtn" href="" download="neora-video.mp4" 
               style="display:block; text-align:center; padding:14px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); border-radius:999px; color:#fff; text-decoration:none; font-weight:600;">
              📥 Télécharger la vidéo
            </a>
          </div>
          
        </div>
      </div>
      
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .style-option:hover {
          background: rgba(255,255,255,.08) !important;
          border-color: rgba(139,92,246,.4) !important;
        }
        .style-option.selected {
          background: rgba(139,92,246,.15) !important;
          border-color: rgba(139,92,246,.6) !important;
        }
        .duration-btn:hover {
          background: rgba(139,92,246,.15) !important;
        }
        .active-duration {
          background: rgba(139,92,246,.2) !important;
          border-color: rgba(139,92,246,.5) !important;
        }
      </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Variables d'état
  let selectedStyle = 'zoom_in';
  let selectedDuration = '5';
  let currentImageUrl = '';

  // Sélectionner un style d'animation
  window.selectAnimationStyle = function(styleId) {
    selectedStyle = styleId;
    
    // Update UI
    document.querySelectorAll('.style-option').forEach(el => {
      el.classList.remove('selected');
    });
    document.querySelector(`[data-style="${styleId}"]`).classList.add('selected');
    
    // Show/hide custom prompt
    const customContainer = document.getElementById('customPromptContainer');
    if (styleId === 'custom') {
      customContainer.style.display = 'block';
    } else {
      customContainer.style.display = 'none';
    }
  };

  // Sélectionner la durée
  window.selectDuration = function(duration) {
    selectedDuration = duration;
    
    document.querySelectorAll('.duration-btn').forEach(el => {
      el.classList.remove('active-duration');
      el.style.background = 'rgba(255,255,255,.05)';
      el.style.borderColor = 'rgba(255,255,255,.12)';
    });
    
    const btn = document.getElementById(`duration${duration}`);
    btn.classList.add('active-duration');
    btn.style.background = 'rgba(139,92,246,.2)';
    btn.style.borderColor = 'rgba(139,92,246,.5)';
  };

  // Ouvrir le modal
  window.openVideoModal = function(imageUrl) {
    if (!imageUrl) {
      alert('Aucune image à animer. Générez d\'abord une image.');
      return;
    }
    
    currentImageUrl = imageUrl;
    
    // Reset state
    selectedStyle = 'zoom_in';
    selectedDuration = '5';
    document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
    document.querySelector('[data-style="zoom_in"]').classList.add('selected');
    document.getElementById('customPromptContainer').style.display = 'none';
    document.getElementById('videoLoadingState').style.display = 'none';
    document.getElementById('videoResultState').style.display = 'none';
    document.getElementById('generateVideoBtn').style.display = 'block';
    
    // Set preview
    document.getElementById('videoPreviewImage').src = imageUrl;
    
    // Show modal
    document.getElementById('videoModal').style.display = 'flex';
  };

  // Fermer le modal
  window.closeVideoModal = function() {
    document.getElementById('videoModal').style.display = 'none';
  };

  // Générer la vidéo
  window.generateVideo = async function() {
    const generateBtn = document.getElementById('generateVideoBtn');
    const loadingState = document.getElementById('videoLoadingState');
    const resultState = document.getElementById('videoResultState');
    
    // Show loading
    generateBtn.style.display = 'none';
    loadingState.style.display = 'block';
    resultState.style.display = 'none';
    
    try {
      const customPrompt = selectedStyle === 'custom' 
        ? document.getElementById('customPromptInput').value 
        : '';
      
      const response = await fetch(KLING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: currentImageUrl,
          animation_style: selectedStyle,
          duration: selectedDuration,
          custom_prompt: customPrompt
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.video_url) {
        // Success!
        loadingState.style.display = 'none';
        resultState.style.display = 'block';
        
        const videoEl = document.getElementById('videoResult');
        videoEl.src = data.video_url;
        
        document.getElementById('downloadVideoBtn').href = data.video_url;
        
      } else if (data.request_id) {
        // Still processing - start polling
        pollVideoStatus(data.request_id);
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
      
    } catch (error) {
      console.error('Video generation error:', error);
      loadingState.style.display = 'none';
      generateBtn.style.display = 'block';
      alert('Erreur lors de la génération: ' + error.message);
    }
  };

  // Polling pour vérifier le statut
  async function pollVideoStatus(requestId) {
    const POLL_URL = `https://queue.fal.run/fal-ai/kling-video/v2.1/standard/image-to-video/requests/${requestId}`;
    const API_KEY = 'fe2232cd-be9e-411f-9e5b-4e88bfcb3930:4539ba5f78d39afecdf730b00b3cba10';
    
    const maxAttempts = 40; // ~2 minutes
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      
      try {
        const response = await fetch(POLL_URL, {
          headers: { 'Authorization': `Key ${API_KEY}` }
        });
        
        const data = await response.json();
        
        if (data.status === 'COMPLETED' && data.video?.url) {
          // Success!
          document.getElementById('videoLoadingState').style.display = 'none';
          document.getElementById('videoResultState').style.display = 'block';
          
          const videoEl = document.getElementById('videoResult');
          videoEl.src = data.video.url;
          
          document.getElementById('downloadVideoBtn').href = data.video.url;
          
        } else if (data.status === 'FAILED') {
          throw new Error('La génération a échoué');
        } else if (attempts < maxAttempts) {
          // Still processing
          setTimeout(poll, 3000);
        } else {
          throw new Error('Timeout - la génération prend trop de temps');
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        document.getElementById('videoLoadingState').style.display = 'none';
        document.getElementById('generateVideoBtn').style.display = 'block';
        alert('Erreur: ' + error.message);
      }
    };
    
    // Start polling after 10 seconds
    setTimeout(poll, 10000);
  }

  // Créer le bouton "Animer"
  function createAnimateButton() {
    // Check if button already exists
    if (document.getElementById('animateBtn')) return;
    
    // Find the download button/link to place our button next to it
    const downloadLink = document.getElementById('downloadLink');
    if (!downloadLink) return;
    
    const animateBtn = document.createElement('button');
    animateBtn.id = 'animateBtn';
    animateBtn.innerHTML = '🎬 Animer';
    animateBtn.style.cssText = `
      display: none;
      padding: 12px 24px;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      border: none;
      border-radius: 999px;
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin-left: 12px;
      box-shadow: 0 8px 30px rgba(139,92,246,.3);
      transition: all .2s ease;
    `;
    
    animateBtn.addEventListener('click', () => {
      const previewImg = document.getElementById('preview-image');
      if (previewImg && previewImg.src && previewImg.style.display !== 'none') {
        openVideoModal(previewImg.src);
      } else {
        alert('Générez d\'abord une image à animer.');
      }
    });
    
    animateBtn.addEventListener('mouseenter', () => {
      animateBtn.style.transform = 'translateY(-2px)';
      animateBtn.style.boxShadow = '0 12px 40px rgba(139,92,246,.4)';
    });
    
    animateBtn.addEventListener('mouseleave', () => {
      animateBtn.style.transform = 'translateY(0)';
      animateBtn.style.boxShadow = '0 8px 30px rgba(139,92,246,.3)';
    });
    
    downloadLink.parentNode.insertBefore(animateBtn, downloadLink.nextSibling);
  }

  // Observer pour afficher/cacher le bouton Animer
  function observeImageChanges() {
    const previewImg = document.getElementById('preview-image');
    const animateBtn = document.getElementById('animateBtn');
    
    if (!previewImg || !animateBtn) return;
    
    // Use MutationObserver to watch for image changes
    const observer = new MutationObserver(() => {
      if (previewImg.src && previewImg.style.display !== 'none' && !previewImg.src.startsWith('blob:')) {
        animateBtn.style.display = 'inline-block';
      } else {
        animateBtn.style.display = 'none';
      }
    });
    
    observer.observe(previewImg, { 
      attributes: true, 
      attributeFilter: ['src', 'style'] 
    });
    
    // Also check periodically
    setInterval(() => {
      if (previewImg.src && previewImg.style.display !== 'none' && !previewImg.src.startsWith('blob:')) {
        animateBtn.style.display = 'inline-block';
      }
    }, 1000);
  }

  // Initialisation
  function init() {
    createVideoModal();
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          createAnimateButton();
          observeImageChanges();
        }, 500);
      });
    } else {
      setTimeout(() => {
        createAnimateButton();
        observeImageChanges();
      }, 500);
    }
  }

  init();
})();
