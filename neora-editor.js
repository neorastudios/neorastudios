/**
 * NEORA Image Editor
 * Mini éditeur pour ajouter du texte et des logos sur les images générées
 * Utilise Fabric.js
 */

const NeoraEditor = {
  canvas: null,
  isOpen: false,
  currentImage: null,
  
  // ============================================
  // INITIALISATION
  // ============================================
  
  init() {
    this.injectStyles();
    this.createModal();
    this.loadFabricJS();
  },
  
  loadFabricJS() {
    if (window.fabric) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
  
  // ============================================
  // MODAL
  // ============================================
  
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'neoraEditorModal';
    modal.className = 'neora-editor-modal';
    modal.innerHTML = `
      <div class="neora-editor-container">
        <div class="neora-editor-header">
          <h3>✏️ Éditeur</h3>
          <button class="neora-editor-close" onclick="NeoraEditor.close()">✕</button>
        </div>
        
        <div class="neora-editor-body">
          <div class="neora-editor-canvas-wrapper">
            <canvas id="neoraEditorCanvas"></canvas>
          </div>
          
          <div class="neora-editor-tools">
            <div class="neora-tool-section">
              <h4>✏️ Texte</h4>
              <input type="text" id="neoraTextInput" placeholder="Entrez votre texte..." class="neora-input">
              <div class="neora-tool-row">
                <select id="neoraFontFamily" class="neora-select">
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Impact">Impact</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
                <input type="number" id="neoraFontSize" value="32" min="8" max="200" class="neora-input-small">
              </div>
              <div class="neora-tool-row">
                <input type="color" id="neoraTextColor" value="#ffffff" class="neora-color">
                <label>Couleur</label>
                <input type="color" id="neoraTextBg" value="#000000" class="neora-color">
                <label>Fond</label>
                <input type="checkbox" id="neoraTextBgEnabled">
              </div>
              <button class="neora-btn" onclick="NeoraEditor.addText()">Ajouter texte</button>
            </div>
            
            <div class="neora-tool-section">
              <h4>🖼️ Logo / Image</h4>
              <input type="file" id="neoraLogoInput" accept="image/*" style="display:none">
              <button class="neora-btn" onclick="document.getElementById('neoraLogoInput').click()">Importer image</button>
            </div>
            
            <div class="neora-tool-section">
              <h4>🎯 Actions</h4>
              <button class="neora-btn neora-btn-danger" onclick="NeoraEditor.deleteSelected()">Supprimer sélection</button>
              <button class="neora-btn" onclick="NeoraEditor.bringToFront()">Mettre devant</button>
              <button class="neora-btn" onclick="NeoraEditor.sendToBack()">Mettre derrière</button>
            </div>
          </div>
        </div>
        
        <div class="neora-editor-footer">
          <button class="neora-btn neora-btn-secondary" onclick="NeoraEditor.close()">Annuler</button>
          <button class="neora-btn neora-btn-primary" onclick="NeoraEditor.download()">💾 Télécharger</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Event listener pour l'import de logo
    document.getElementById('neoraLogoInput').addEventListener('change', (e) => {
      this.addLogo(e.target.files[0]);
    });
    
    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  },
  
  // ============================================
  // OUVRIR / FERMER
  // ============================================
  
  async open(imageUrl) {
    await this.loadFabricJS();
    
    this.currentImage = imageUrl;
    this.isOpen = true;
    
    const modal = document.getElementById('neoraEditorModal');
    modal.classList.add('open');
    
    // Initialiser le canvas
    setTimeout(() => {
      this.initCanvas(imageUrl);
    }, 100);
  },
  
  close() {
    this.isOpen = false;
    const modal = document.getElementById('neoraEditorModal');
    modal.classList.remove('open');
    
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  },
  
  // ============================================
  // CANVAS
  // ============================================
  
  initCanvas(imageUrl) {
    const canvasEl = document.getElementById('neoraEditorCanvas');
    const wrapper = document.querySelector('.neora-editor-canvas-wrapper');
    
    // Charger l'image d'abord pour avoir ses dimensions
    fabric.Image.fromURL(imageUrl, (img) => {
      // Calculer les dimensions pour le canvas
      const maxWidth = wrapper.clientWidth - 40;
      const maxHeight = wrapper.clientHeight - 40;
      
      let width = img.width;
      let height = img.height;
      
      // Redimensionner si nécessaire
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }
      
      // Créer le canvas
      this.canvas = new fabric.Canvas('neoraEditorCanvas', {
        width: width,
        height: height,
        backgroundColor: '#1a1a2e'
      });
      
      // Ajouter l'image de fond
      img.scaleToWidth(width);
      img.set({
        selectable: false,
        evented: false
      });
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
      
      // Stocker les dimensions originales pour l'export
      this.originalWidth = img.width;
      this.originalHeight = img.height;
      this.displayWidth = width;
      this.displayHeight = height;
    }, { crossOrigin: 'anonymous' });
  },
  
  // ============================================
  // AJOUTER TEXTE
  // ============================================
  
  addText() {
    if (!this.canvas) return;
    
    const text = document.getElementById('neoraTextInput').value || 'Texte';
    const fontFamily = document.getElementById('neoraFontFamily').value;
    const fontSize = parseInt(document.getElementById('neoraFontSize').value) || 32;
    const textColor = document.getElementById('neoraTextColor').value;
    const textBg = document.getElementById('neoraTextBg').value;
    const textBgEnabled = document.getElementById('neoraTextBgEnabled').checked;
    
    const textObj = new fabric.IText(text, {
      left: this.canvas.width / 2,
      top: this.canvas.height / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: fontFamily,
      fontSize: fontSize,
      fill: textColor,
      backgroundColor: textBgEnabled ? textBg : 'transparent',
      padding: 10,
      cornerStyle: 'circle',
      cornerColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      transparentCorners: false
    });
    
    this.canvas.add(textObj);
    this.canvas.setActiveObject(textObj);
    this.canvas.renderAll();
    
    // Reset input
    document.getElementById('neoraTextInput').value = '';
  },
  
  // ============================================
  // AJOUTER LOGO
  // ============================================
  
  addLogo(file) {
    if (!this.canvas || !file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        // Redimensionner le logo à max 200px
        const maxSize = 200;
        if (img.width > maxSize || img.height > maxSize) {
          const scale = maxSize / Math.max(img.width, img.height);
          img.scale(scale);
        }
        
        img.set({
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: 'center',
          originY: 'center',
          cornerStyle: 'circle',
          cornerColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          transparentCorners: false
        });
        
        this.canvas.add(img);
        this.canvas.setActiveObject(img);
        this.canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    document.getElementById('neoraLogoInput').value = '';
  },
  
  // ============================================
  // ACTIONS
  // ============================================
  
  deleteSelected() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.remove(active);
      this.canvas.renderAll();
    }
  },
  
  bringToFront() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (active) {
      active.bringToFront();
      this.canvas.renderAll();
    }
  },
  
  sendToBack() {
    if (!this.canvas) return;
    const active = this.canvas.getActiveObject();
    if (active) {
      active.sendToBack();
      this.canvas.renderAll();
    }
  },
  
  // ============================================
  // TÉLÉCHARGER
  // ============================================
  
  download() {
    if (!this.canvas) return;
    
    // Créer un canvas temporaire à la taille originale
    const scale = this.originalWidth / this.displayWidth;
    
    const dataURL = this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: scale
    });
    
    // Télécharger
    const link = document.createElement('a');
    link.download = 'neora-edited-' + Date.now() + '.png';
    link.href = dataURL;
    link.click();
  },
  
  // ============================================
  // STYLES
  // ============================================
  
  injectStyles() {
    if (document.getElementById('neora-editor-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'neora-editor-styles';
    style.textContent = `
      .neora-editor-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .neora-editor-modal.open {
        opacity: 1;
        visibility: visible;
      }
      
      .neora-editor-container {
        background: #0a0a12;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.1);
        width: 95vw;
        max-width: 1200px;
        height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .neora-editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      
      .neora-editor-header h3 {
        font-size: 18px;
        font-weight: 600;
        color: white;
      }
      
      .neora-editor-close {
        background: none;
        border: none;
        color: rgba(255,255,255,0.6);
        font-size: 20px;
        cursor: pointer;
        padding: 8px;
        transition: color 0.2s;
      }
      
      .neora-editor-close:hover {
        color: white;
      }
      
      .neora-editor-body {
        flex: 1;
        display: flex;
        overflow: hidden;
      }
      
      .neora-editor-canvas-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #050508;
        padding: 20px;
        overflow: auto;
      }
      
      .neora-editor-canvas-wrapper canvas {
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      }
      
      .neora-editor-tools {
        width: 280px;
        background: #0d0d15;
        border-left: 1px solid rgba(255,255,255,0.1);
        padding: 16px;
        overflow-y: auto;
      }
      
      .neora-tool-section {
        margin-bottom: 24px;
      }
      
      .neora-tool-section h4 {
        font-size: 14px;
        font-weight: 600;
        color: rgba(255,255,255,0.9);
        margin-bottom: 12px;
      }
      
      .neora-tool-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }
      
      .neora-tool-row label {
        font-size: 11px;
        color: rgba(255,255,255,0.5);
      }
      
      .neora-input {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        margin-bottom: 10px;
        outline: none;
        transition: border-color 0.2s;
      }
      
      .neora-input:focus {
        border-color: #8b5cf6;
      }
      
      .neora-input-small {
        width: 70px;
        padding: 8px 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        outline: none;
      }
      
      .neora-select {
        flex: 1;
        padding: 8px 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        outline: none;
      }
      
      .neora-color {
        width: 36px;
        height: 36px;
        padding: 2px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        cursor: pointer;
      }
      
      .neora-btn {
        width: 100%;
        padding: 10px 16px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: white;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 8px;
      }
      
      .neora-btn:hover {
        background: rgba(255,255,255,0.15);
      }
      
      .neora-btn-primary {
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        border: none;
      }
      
      .neora-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(139,92,246,0.4);
      }
      
      .neora-btn-secondary {
        background: transparent;
      }
      
      .neora-btn-danger {
        background: rgba(239,68,68,0.2);
        border-color: rgba(239,68,68,0.3);
      }
      
      .neora-btn-danger:hover {
        background: rgba(239,68,68,0.3);
      }
      
      .neora-editor-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid rgba(255,255,255,0.1);
      }
      
      .neora-editor-footer .neora-btn {
        width: auto;
        margin-bottom: 0;
      }
      
      @media (max-width: 768px) {
        .neora-editor-body {
          flex-direction: column;
        }
        
        .neora-editor-tools {
          width: 100%;
          max-height: 200px;
          border-left: none;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .neora-editor-canvas-wrapper {
          min-height: 300px;
        }
      }
    `;
    document.head.appendChild(style);
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  NeoraEditor.init();
});
