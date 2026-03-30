// ============================================
// NEORA Video Animation — Kling Integration
// ============================================
// Ajoute ce script sur tes pages NEORA (NEORA.html, NEORASIMPLE.html)
// <script src="neora-video.js"></script>
//
// SÉCURITÉ: Tout passe par n8n, aucune clé API exposée côté client.
// HISTORIQUE: Les vidéos sont sauvegardées dans Firestore /users/{uid}/videos
// ============================================

(function () {
  'use strict';

  // ─── Configuration ───
  const N8N_BASE = 'https://n8n.srv1125399.hstgr.cloud/webhook';
  const KLING_WEBHOOK_URL = `${N8N_BASE}/kling-video`;
  const KLING_STATUS_URL  = `${N8N_BASE}/kling-status`;

  // ─── Animation styles ───
  const ANIMATION_STYLES = [
    { id: 'zoom_in',   icon: '🔍', name: 'Zoom avant',   desc: 'Cinématique' },
    { id: 'zoom_out',  icon: '🔭', name: 'Zoom arrière', desc: 'Révèle la scène' },
    { id: 'pan_left',  icon: '⬅️', name: 'Travelling G',  desc: 'Pan horizontal' },
    { id: 'pan_right', icon: '➡️', name: 'Travelling D',  desc: 'Pan horizontal' },
    { id: 'float',     icon: '🌊', name: 'Flottement',   desc: 'Mouvement doux' },
    { id: 'rotate',    icon: '🔄', name: 'Rotation',     desc: 'Orbite 360°' },
    { id: 'sparkle',   icon: '✨', name: 'Particules',   desc: 'Effets magiques' },
    { id: 'reveal',    icon: '🎬', name: 'Révélation',   desc: 'Light rays' },
    { id: 'breathe',   icon: '💫', name: 'Respiration',  desc: 'Pulsation' },
    { id: 'custom',    icon: '✏️', name: 'Personnalisé', desc: 'Ton prompt' }
  ];

  // ─── State ───
  let selectedStyle = 'zoom_in';
  let selectedDuration = '5';
  let currentImageUrl = '';
  let timerInterval = null;

  // ─── Inject CSS ───
  function injectStyles() {
    if (document.getElementById('neora-video-styles')) return;
    const style = document.createElement('style');
    style.id = 'neora-video-styles';
    style.textContent = `
      /* ── Modal Overlay ── */
      #nv-modal {
        display: none; position: fixed; inset: 0;
        background: rgba(5,7,20,.92); backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        z-index: 9999; align-items: center; justify-content: center; padding: 20px;
      }
      #nv-modal.active { display: flex; }

      #nv-modal * { box-sizing: border-box; margin: 0; padding: 0; }

      /* ── Modal Content ── */
      .nv-content {
        background: linear-gradient(180deg, #12121f, #0a0a14);
        border: 1px solid rgba(255,255,255,.1); border-radius: 24px;
        padding: 28px; max-width: 500px; width: 100%;
        max-height: 90vh; overflow-y: auto;
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        color: rgba(255,255,255,.95);
      }
      .nv-content::-webkit-scrollbar { width: 4px; }
      .nv-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }

      /* ── Header ── */
      .nv-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 22px;
      }
      .nv-header h2 { font-size: 20px; font-weight: 700; }
      .nv-close {
        background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
        color: rgba(255,255,255,.6); font-size: 18px; cursor: pointer;
        width: 34px; height: 34px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        transition: all .2s;
      }
      .nv-close:hover { background: rgba(255,255,255,.1); color: #fff; }

      /* ── Preview ── */
      .nv-preview {
        background: rgba(0,0,0,.35); border-radius: 16px; overflow: hidden;
        margin-bottom: 22px; aspect-ratio: 16/9;
        display: flex; align-items: center; justify-content: center;
      }
      .nv-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }

      /* ── Labels ── */
      .nv-label {
        font-size: 12px; color: rgba(255,255,255,.5); margin-bottom: 10px;
        font-weight: 600; text-transform: uppercase; letter-spacing: .05em;
      }

      /* ── Style Grid ── */
      .nv-styles {
        display: grid; grid-template-columns: repeat(2, 1fr);
        gap: 8px; margin-bottom: 20px;
      }
      .nv-style-card {
        padding: 12px 10px; background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.08); border-radius: 12px;
        cursor: pointer; transition: all .2s; text-align: center;
      }
      .nv-style-card:hover { background: rgba(255,255,255,.07); border-color: rgba(139,92,246,.3); }
      .nv-style-card.nv-selected {
        background: rgba(139,92,246,.12); border-color: rgba(139,92,246,.5);
        box-shadow: 0 4px 16px rgba(139,92,246,.12);
      }
      .nv-style-card .nv-s-icon { font-size: 20px; margin-bottom: 4px; }
      .nv-style-card .nv-s-name { font-size: 12px; font-weight: 600; }
      .nv-style-card .nv-s-desc { font-size: 10px; color: rgba(255,255,255,.4); }

      /* ── Custom Prompt ── */
      .nv-custom-prompt { display: none; margin-bottom: 18px; }
      .nv-custom-prompt.active { display: block; }
      .nv-custom-prompt textarea {
        width: 100%; min-height: 72px; padding: 12px;
        background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.1);
        border-radius: 12px; color: #fff; font-size: 13px;
        font-family: inherit; resize: vertical;
      }
      .nv-custom-prompt textarea:focus { outline: none; border-color: rgba(139,92,246,.4); }
      .nv-custom-prompt textarea::placeholder { color: rgba(255,255,255,.3); }

      /* ── Duration ── */
      .nv-durations { display: flex; gap: 10px; margin-bottom: 22px; }
      .nv-dur-btn {
        flex: 1; padding: 14px 10px; background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.08); border-radius: 12px;
        color: #fff; font-size: 14px; font-weight: 600; cursor: pointer;
        text-align: center; transition: all .2s; font-family: inherit;
      }
      .nv-dur-btn:hover { background: rgba(236,72,153,.08); }
      .nv-dur-btn.nv-selected {
        background: rgba(236,72,153,.12); border-color: rgba(236,72,153,.4);
      }
      .nv-dur-btn .nv-d-sub { font-size: 10px; color: rgba(255,255,255,.4); margin-top: 2px; font-weight: 500; }

      /* ── Cost Info ── */
      .nv-cost {
        background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2);
        border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;
        font-size: 12px; color: rgba(255,255,255,.75);
        display: flex; align-items: center; gap: 8px;
      }

      /* ── Generate Button ── */
      .nv-generate-btn {
        width: 100%; padding: 16px; border: none; border-radius: 999px;
        background: linear-gradient(135deg, #ec4899, #8b5cf6);
        color: #fff; font-size: 15px; font-weight: 700; cursor: pointer;
        box-shadow: 0 10px 36px rgba(236,72,153,.25);
        transition: all .25s; font-family: inherit;
      }
      .nv-generate-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 44px rgba(236,72,153,.35); }
      .nv-generate-btn:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; }

      /* ── Loading ── */
      .nv-loading { display: none; text-align: center; padding: 24px 0; }
      .nv-loading.active { display: block; }
      .nv-spinner {
        width: 44px; height: 44px; border: 3px solid rgba(255,255,255,.08);
        border-top-color: #ec4899; border-radius: 50%;
        margin: 0 auto 14px; animation: nv-spin .9s linear infinite;
      }
      @keyframes nv-spin { to { transform: rotate(360deg); } }
      .nv-timer { font-size: 24px; font-weight: 700; color: #ec4899; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
      .nv-loading p { font-size: 13px; color: rgba(255,255,255,.6); }

      /* ── Result ── */
      .nv-result { display: none; }
      .nv-result.active { display: block; }
      .nv-result-badge {
        background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25);
        border-radius: 12px; padding: 14px; margin-bottom: 16px; text-align: center;
      }
      .nv-result-badge span { font-size: 20px; }
      .nv-result-badge p { color: #10b981; font-weight: 600; font-size: 13px; margin-top: 4px; }
      .nv-result video { width: 100%; border-radius: 12px; margin-bottom: 14px; }
      .nv-result-actions { display: flex; gap: 8px; }
      .nv-result-btn {
        flex: 1; padding: 12px; border-radius: 999px; text-align: center;
        font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer;
        font-family: inherit; transition: all .2s;
      }
      .nv-dl-btn {
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        border: none; color: #fff;
      }
      .nv-again-btn {
        background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
        color: rgba(255,255,255,.8);
      }
      .nv-again-btn:hover { background: rgba(255,255,255,.1); }

      /* ── Animate Button (injected on NEORA pages) ── */
      .nv-animate-btn {
        display: none; padding: 11px 22px;
        background: linear-gradient(135deg, #ec4899, #8b5cf6);
        border: none; border-radius: 999px; color: #fff;
        font-size: 13px; font-weight: 700; cursor: pointer;
        box-shadow: 0 6px 24px rgba(236,72,153,.25);
        transition: all .25s; font-family: inherit;
      }
      .nv-animate-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 32px rgba(236,72,153,.35);
      }
      .nv-animate-btn.visible { display: inline-flex; align-items: center; gap: 6px; }
    `;
    document.head.appendChild(style);
  }

  // ─── Build Modal HTML ───
  function createModal() {
    if (document.getElementById('nv-modal')) return;

    const stylesHTML = ANIMATION_STYLES.map(s =>
      `<div class="nv-style-card${s.id === 'zoom_in' ? ' nv-selected' : ''}" data-style="${s.id}">
        <div class="nv-s-icon">${s.icon}</div>
        <div class="nv-s-name">${s.name}</div>
        <div class="nv-s-desc">${s.desc}</div>
      </div>`
    ).join('');

    const modal = document.createElement('div');
    modal.id = 'nv-modal';
    modal.innerHTML = `
      <div class="nv-content">
        <div class="nv-header">
          <h2>🎬 Animer en vidéo</h2>
          <button class="nv-close" id="nv-close-btn">✕</button>
        </div>

        <div class="nv-preview"><img id="nv-preview-img" src="" alt="Preview"></div>

        <div class="nv-label">🎭 STYLE D'ANIMATION</div>
        <div class="nv-styles" id="nv-styles-grid">${stylesHTML}</div>

        <div class="nv-custom-prompt" id="nv-custom-prompt">
          <textarea id="nv-custom-input" placeholder="Décris l'animation... Ex: Zoom lent avec des particules dorées"></textarea>
        </div>

        <div class="nv-label">⏱️ DURÉE</div>
        <div class="nv-durations">
          <button class="nv-dur-btn nv-selected" data-dur="5">5s<div class="nv-d-sub">1 crédit</div></button>
          <button class="nv-dur-btn" data-dur="10">10s<div class="nv-d-sub">2 crédits</div></button>
        </div>

        <div class="nv-cost">
          <span>💰</span>
          <span><strong id="nv-cost-text">1 crédit vidéo</strong> sera utilisé</span>
        </div>

        <button class="nv-generate-btn" id="nv-generate-btn">🎬 Générer la vidéo</button>

        <div class="nv-loading" id="nv-loading">
          <div class="nv-spinner"></div>
          <div class="nv-timer" id="nv-timer">00:00</div>
          <p>Kling AI génère ta vidéo...</p>
        </div>

        <div class="nv-result" id="nv-result">
          <div class="nv-result-badge"><span>✅</span><p>Vidéo générée !</p></div>
          <video id="nv-result-video" controls autoplay muted></video>
          <div class="nv-result-actions">
            <a id="nv-dl-btn" class="nv-result-btn nv-dl-btn" href="" download="neora-video.mp4">📥 Télécharger</a>
            <button class="nv-result-btn nv-again-btn" id="nv-again-btn">🔄 Recommencer</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // ── Event: Close ──
    document.getElementById('nv-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    // ── Event: Style selection ──
    document.getElementById('nv-styles-grid').addEventListener('click', e => {
      const card = e.target.closest('.nv-style-card');
      if (!card) return;
      document.querySelectorAll('.nv-style-card').forEach(c => c.classList.remove('nv-selected'));
      card.classList.add('nv-selected');
      selectedStyle = card.dataset.style;
      document.getElementById('nv-custom-prompt').classList.toggle('active', selectedStyle === 'custom');
    });

    // ── Event: Duration ──
    document.querySelectorAll('.nv-dur-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nv-dur-btn').forEach(b => b.classList.remove('nv-selected'));
        btn.classList.add('nv-selected');
        selectedDuration = btn.dataset.dur;
        document.getElementById('nv-cost-text').textContent =
          selectedDuration === '10' ? '2 crédits vidéo' : '1 crédit vidéo';
      });
    });

    // ── Event: Generate ──
    document.getElementById('nv-generate-btn').addEventListener('click', generateVideo);

    // ── Event: Again ──
    document.getElementById('nv-again-btn').addEventListener('click', () => {
      resetModalState();
    });
  }

  // ─── Open Modal ───
  function openModal(imageUrl) {
    if (!imageUrl) { alert('Aucune image à animer.'); return; }
    currentImageUrl = imageUrl;
    resetModalState();
    document.getElementById('nv-preview-img').src = imageUrl;
    document.getElementById('nv-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // ─── Close Modal ───
  function closeModal() {
    document.getElementById('nv-modal').classList.remove('active');
    document.body.style.overflow = '';
    stopTimer();
  }

  // ─── Reset State ───
  function resetModalState() {
    selectedStyle = 'zoom_in';
    selectedDuration = '5';
    document.querySelectorAll('.nv-style-card').forEach(c => c.classList.remove('nv-selected'));
    const first = document.querySelector('[data-style="zoom_in"]');
    if (first) first.classList.add('nv-selected');
    document.querySelectorAll('.nv-dur-btn').forEach(b => b.classList.remove('nv-selected'));
    const dur5 = document.querySelector('[data-dur="5"]');
    if (dur5) dur5.classList.add('nv-selected');
    document.getElementById('nv-custom-prompt').classList.remove('active');
    document.getElementById('nv-loading').classList.remove('active');
    document.getElementById('nv-result').classList.remove('active');
    document.getElementById('nv-generate-btn').style.display = 'block';
    document.getElementById('nv-generate-btn').disabled = false;
    document.getElementById('nv-cost-text').textContent = '1 crédit vidéo';
    stopTimer();
  }

  // ─── Timer ───
  function startTimer() {
    let s = 0;
    const el = document.getElementById('nv-timer');
    el.textContent = '00:00';
    timerInterval = setInterval(() => {
      s++;
      el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    }, 1000);
  }
  function stopTimer() { if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

  // ─── Generate Video ───
  async function generateVideo() {
    const genBtn = document.getElementById('nv-generate-btn');
    const loadingEl = document.getElementById('nv-loading');
    const resultEl = document.getElementById('nv-result');

    // Check credits if Firebase available
    if (typeof firebase !== 'undefined' && firebase.auth) {
      const user = firebase.auth().currentUser;
      if (user) {
        try {
          const doc = await firebase.firestore().collection('users').doc(user.uid).get();
          const data = doc.exists ? doc.data() : {};
          const credits = data.videoCreditsAvailable || 0;
          const needed = selectedDuration === '10' ? 2 : 1;
          if (credits < needed) {
            alert('Crédits vidéo insuffisants. Rendez-vous sur la page pricing.');
            return;
          }
        } catch (e) { console.warn('Credit check failed:', e); }
      }
    }

    // UI: loading
    genBtn.style.display = 'none';
    loadingEl.classList.add('active');
    resultEl.classList.remove('active');
    startTimer();

    try {
      const customPrompt = selectedStyle === 'custom'
        ? document.getElementById('nv-custom-input').value
        : '';

      // 1) Submit to n8n
      const res = await fetch(KLING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: currentImageUrl,
          animation_style: selectedStyle,
          duration: selectedDuration,
          custom_prompt: customPrompt
        })
      });
      const data = await res.json();

      if (data.success && data.video_url) {
        onVideoReady(data.video_url);
      } else if (data.request_id) {
        // Poll via n8n
        pollStatus(data.request_id);
      } else {
        throw new Error(data.message || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('Generate error:', err);
      stopTimer();
      loadingEl.classList.remove('active');
      genBtn.style.display = 'block';
      genBtn.disabled = false;
      alert('Erreur: ' + err.message);
    }
  }

  // ─── Poll via n8n (secure, no API key client-side) ───
  async function pollStatus(requestId) {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(KLING_STATUS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: requestId })
        });
        const data = await res.json();

        if (data.success && data.video_url) {
          onVideoReady(data.video_url);
        } else if (data.status === 'FAILED') {
          throw new Error('Génération échouée côté Kling');
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          throw new Error('Timeout — vidéo trop longue');
        }
      } catch (err) {
        console.error('Poll error:', err);
        stopTimer();
        document.getElementById('nv-loading').classList.remove('active');
        document.getElementById('nv-generate-btn').style.display = 'block';
        document.getElementById('nv-generate-btn').disabled = false;
        alert('Erreur: ' + err.message);
      }
    };

    setTimeout(poll, 5000);
  }

  // ─── Video Ready ───
  async function onVideoReady(videoUrl) {
    stopTimer();
    document.getElementById('nv-loading').classList.remove('active');

    const resultEl = document.getElementById('nv-result');
    resultEl.classList.add('active');
    document.getElementById('nv-result-video').src = videoUrl;
    document.getElementById('nv-dl-btn').href = videoUrl;

    // Deduct credits + save to Firestore
    if (typeof firebase !== 'undefined' && firebase.auth) {
      const user = firebase.auth().currentUser;
      if (user) {
        const creditsNeeded = selectedDuration === '10' ? 2 : 1;
        try {
          // Deduct
          await firebase.firestore().collection('users').doc(user.uid).update({
            videoCreditsAvailable: firebase.firestore.FieldValue.increment(-creditsNeeded),
            totalVideosGenerated: firebase.firestore.FieldValue.increment(1)
          });

          // Save history
          await firebase.firestore().collection('users').doc(user.uid)
            .collection('videos')
            .add({
              videoUrl,
              sourceImageUrl: currentImageUrl,
              animationStyle: selectedStyle,
              duration: selectedDuration,
              source: 'neora-modal', // so you know it came from the inline modal
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) { console.warn('Firestore update failed:', e); }
      }
    }
  }

  // ─── Create Animate Button ───
  function createAnimateButton() {
    if (document.getElementById('nv-animate-btn')) return;

    // Try to find common NEORA page elements to attach the button
    // Targets: #downloadLink, .download-btn, [id*="download"], button with "Télécharger"
    const anchors = [
      document.getElementById('downloadLink'),
      document.querySelector('.download-btn'),
      document.querySelector('[id*="download"]'),
      document.querySelector('a[download]')
    ];
    const anchor = anchors.find(a => a);

    const btn = document.createElement('button');
    btn.id = 'nv-animate-btn';
    btn.className = 'nv-animate-btn';
    btn.innerHTML = '🎬 Animer';

    btn.addEventListener('click', () => {
      // Find the generated image - try multiple common selectors
      const imgSelectors = [
        '#preview-image',
        '#resultImage',
        '#generatedImage',
        '.preview-image',
        '.result-image img',
        'img[id*="preview"]',
        'img[id*="result"]'
      ];

      let imgUrl = null;
      for (const sel of imgSelectors) {
        const el = document.querySelector(sel);
        if (el && el.src && el.style.display !== 'none' && !el.src.startsWith('blob:')) {
          imgUrl = el.src;
          break;
        }
      }

      if (!imgUrl) {
        alert('Génère d\'abord une image à animer.');
        return;
      }

      openModal(imgUrl);
    });

    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    } else {
      // Fallback: find any result/action container
      const containers = [
        document.querySelector('.result-actions'),
        document.querySelector('.download-section'),
        document.querySelector('[class*="result"]'),
        document.querySelector('[class*="action"]')
      ];
      const container = containers.find(c => c);
      if (container) {
        container.appendChild(btn);
      }
    }
  }

  // ─── Show/hide the animate button based on image availability ───
  function observeForImage() {
    const btn = document.getElementById('nv-animate-btn');
    if (!btn) return;

    const imgSelectors = [
      '#preview-image', '#resultImage', '#generatedImage',
      '.preview-image', 'img[id*="preview"]', 'img[id*="result"]'
    ];

    function check() {
      let found = false;
      for (const sel of imgSelectors) {
        const el = document.querySelector(sel);
        if (el && el.src && el.style.display !== 'none' && !el.src.startsWith('blob:') && el.src !== '') {
          found = true;
          break;
        }
      }
      btn.classList.toggle('visible', found);
    }

    // MutationObserver on body for attribute changes
    const observer = new MutationObserver(check);
    observer.observe(document.body, { subtree: true, attributes: true, childList: true });

    // Periodic fallback
    setInterval(check, 1500);
    check();
  }

  // ═══════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════
  window.openVideoModal = openModal;
  window.closeVideoModal = closeModal;

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  function init() {
    injectStyles();
    createModal();

    const setup = () => {
      setTimeout(() => {
        createAnimateButton();
        observeForImage();
      }, 800);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  init();
})();
