/**
 * NEORA Image Editor Pro
 * Éditeur professionnel pour ajouter du texte et des logos
 * Version 2.0
 */

const NeoraEditor = {
  canvas: null,
  isOpen: false,
  currentImage: null,
  history: [],
  historyIndex: -1,
  maxHistory: 30,
  zoom: 1,
  previewText: null,
  
  fonts: [
    'Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Bebas Neue',
    'Oswald', 'Raleway', 'Roboto', 'Open Sans', 'Lato',
    'Anton', 'Righteous', 'Permanent Marker', 'Pacifico', 'Lobster'
  ],
  
  init() {
    this.injectStyles();
    this.createModal();
    this.loadDependencies();
  },
  
  loadDependencies() {
    if (!window.fabric) {
      const fabricScript = document.createElement('script');
      fabricScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
      document.head.appendChild(fabricScript);
    }
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${this.fonts.map(f => f.replace(' ', '+')).join('&family=')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  },
  
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'neoraEditorModal';
    modal.className = 'ne-modal';
    modal.innerHTML = `
      <div class="ne-container">
        <div class="ne-header">
          <div class="ne-header-left">
            <div class="ne-logo">✨ NEORA Editor</div>
          </div>
          <div class="ne-header-center">
            <div class="ne-zoom-controls">
              <button class="ne-icon-btn" onclick="NeoraEditor.zoomOut()" title="Zoom -">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </button>
              <span class="ne-zoom-level" id="neZoomLevel">100%</span>
              <button class="ne-icon-btn" onclick="NeoraEditor.zoomIn()" title="Zoom +">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </button>
              <button class="ne-icon-btn" onclick="NeoraEditor.resetZoom()" title="Reset">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </button>
            </div>
          </div>
          <div class="ne-header-right">
            <button class="ne-icon-btn" onclick="NeoraEditor.undo()" title="Annuler" id="neUndoBtn" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <button class="ne-icon-btn" onclick="NeoraEditor.redo()" title="Rétablir" id="neRedoBtn" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </button>
            <div class="ne-divider"></div>
            <button class="ne-btn ne-btn-ghost" onclick="NeoraEditor.close()">Annuler</button>
            <button class="ne-btn ne-btn-primary" onclick="NeoraEditor.download()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exporter
            </button>
          </div>
        </div>
        
        <div class="ne-body">
          <div class="ne-toolbar">
            <div class="ne-tool-group">
              <button class="ne-tool-btn active" data-tool="select" onclick="NeoraEditor.setTool('select')" title="Sélection">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
              </button>
              <button class="ne-tool-btn" data-tool="text" onclick="NeoraEditor.setTool('text')" title="Texte">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
              </button>
              <button class="ne-tool-btn" data-tool="image" onclick="NeoraEditor.setTool('image')" title="Image">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
            </div>
            <div class="ne-tool-group">
              <button class="ne-tool-btn" onclick="NeoraEditor.deleteSelected()" title="Supprimer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
              <button class="ne-tool-btn" onclick="NeoraEditor.duplicateSelected()" title="Dupliquer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
            <div class="ne-tool-group">
              <button class="ne-tool-btn" onclick="NeoraEditor.bringForward()" title="Avancer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4h12" opacity="0.5"/></svg>
              </button>
              <button class="ne-tool-btn" onclick="NeoraEditor.sendBackward()" title="Reculer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="12" height="12" rx="2"/><path d="M8 20h12V8" opacity="0.5"/></svg>
              </button>
            </div>
          </div>
          
          <div class="ne-canvas-area">
            <div class="ne-canvas-wrapper" id="neCanvasWrapper">
              <canvas id="neoraEditorCanvas"></canvas>
            </div>
          </div>
          
          <div class="ne-panel" id="nePanel">
            <div class="ne-panel-content" id="nePanelText" style="display:none;">
              <div class="ne-panel-header"><h4>✏️ Ajouter du texte</h4></div>
              <div class="ne-field">
                <label>Texte</label>
                <textarea id="neTextInput" placeholder="Votre texte ici..." rows="3"></textarea>
              </div>
              <div class="ne-field">
                <label>Police</label>
                <div class="ne-font-dropdown" id="neFontDropdown">
                  <div class="ne-font-selected" id="neFontSelected" onclick="NeoraEditor.toggleFontDropdown()">
                    <span style="font-family:'Inter'">Inter</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  <div class="ne-font-options" id="neFontOptions">
                    ${this.fonts.map(f => `<div class="ne-font-option" data-font="${f}" onclick="NeoraEditor.selectFont('${f}')" style="font-family:'${f}'">${f}</div>`).join('')}
                  </div>
                </div>
                <input type="hidden" id="neFontFamily" value="Inter">
              </div>
              <div class="ne-row">
                <div class="ne-field ne-field-half">
                  <label>Taille</label>
                  <input type="number" id="neFontSize" value="48" min="8" max="300">
                </div>
                <div class="ne-field ne-field-half">
                  <label>Couleur</label>
                  <input type="color" id="neTextColor" value="#ffffff">
                </div>
              </div>
              <div class="ne-field">
                <label>Style</label>
                <div class="ne-style-btns">
                  <button class="ne-style-btn" id="neBold" onclick="NeoraEditor.toggleStyle('bold')">B</button>
                  <button class="ne-style-btn" id="neItalic" onclick="NeoraEditor.toggleStyle('italic')"><i>I</i></button>
                  <button class="ne-style-btn" id="neUnderline" onclick="NeoraEditor.toggleStyle('underline')"><u>U</u></button>
                </div>
              </div>
              <div class="ne-field">
                <label>Ombre</label>
                <div class="ne-row">
                  <input type="checkbox" id="neShadowEnabled">
                  <input type="color" id="neShadowColor" value="#000000">
                  <input type="range" id="neShadowBlur" min="0" max="30" value="10" style="flex:1">
                </div>
              </div>
              <div class="ne-field">
                <label>Opacité: <span id="neTextOpacityVal">100%</span></label>
                <input type="range" id="neTextOpacity" min="0" max="100" value="100">
              </div>
              <div class="ne-row" style="gap:8px;">
                <button class="ne-btn ne-btn-ghost" style="flex:1;" onclick="NeoraEditor.cancelTextPreview()">Annuler</button>
                <button class="ne-btn ne-btn-primary" style="flex:1;" onclick="NeoraEditor.addText()">✓ Valider</button>
              </div>
            </div>
            
            <div class="ne-panel-content" id="nePanelImage" style="display:none;">
              <div class="ne-panel-header"><h4>🖼️ Ajouter une image</h4></div>
              <div class="ne-upload-zone" id="neUploadZone">
                <input type="file" id="neImageInput" accept="image/*" style="display:none">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p>Glisser une image ici<br>ou <span>parcourir</span></p>
              </div>
              <div class="ne-field" style="margin-top:16px;">
                <label>Opacité: <span id="neImageOpacityVal">100%</span></label>
                <input type="range" id="neImageOpacity" min="0" max="100" value="100">
              </div>
            </div>
            
            <div class="ne-panel-content" id="nePanelSelect">
              <div class="ne-panel-header"><h4>🎯 Propriétés</h4></div>
              <div class="ne-empty-state" id="neEmptyState">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
                <p>Sélectionnez un élément pour modifier ses propriétés</p>
              </div>
              <div class="ne-selection-props" id="neSelectionProps" style="display:none;">
                <div class="ne-field">
                  <label>Opacité: <span id="neSelOpacityVal">100%</span></label>
                  <input type="range" id="neSelOpacity" min="0" max="100" value="100">
                </div>
                <div class="ne-row" style="margin-top:12px;">
                  <button class="ne-btn ne-btn-ghost ne-btn-sm" onclick="NeoraEditor.duplicateSelected()">Dupliquer</button>
                  <button class="ne-btn ne-btn-danger ne-btn-sm" onclick="NeoraEditor.deleteSelected()">Supprimer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.setupEventListeners();
  },
  
  setupEventListeners() {
    const uploadZone = document.getElementById('neUploadZone');
    const imageInput = document.getElementById('neImageInput');
    
    uploadZone.addEventListener('click', () => imageInput.click());
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) this.addImage(e.dataTransfer.files[0]);
    });
    imageInput.addEventListener('change', (e) => { if (e.target.files[0]) this.addImage(e.target.files[0]); });
    
    document.getElementById('neTextOpacity').addEventListener('input', (e) => {
      document.getElementById('neTextOpacityVal').textContent = e.target.value + '%';
      this.updateTextPreview();
    });
    document.getElementById('neImageOpacity').addEventListener('input', (e) => {
      document.getElementById('neImageOpacityVal').textContent = e.target.value + '%';
    });
    document.getElementById('neSelOpacity').addEventListener('input', (e) => {
      document.getElementById('neSelOpacityVal').textContent = e.target.value + '%';
      this.updateSelectedOpacity(e.target.value);
    });
    
    // Preview en temps réel du texte
    document.getElementById('neTextInput').addEventListener('input', () => this.updateTextPreview());
    document.getElementById('neFontSize').addEventListener('input', () => this.updateTextPreview());
    document.getElementById('neTextColor').addEventListener('input', () => this.updateTextPreview());
    document.getElementById('neShadowEnabled').addEventListener('change', () => this.updateTextPreview());
    document.getElementById('neShadowColor').addEventListener('input', () => this.updateTextPreview());
    document.getElementById('neShadowBlur').addEventListener('input', () => this.updateTextPreview());
    
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        this.deleteSelected();
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); this.undo(); }
        if (e.key === 'y') { e.preventDefault(); this.redo(); }
        if (e.key === 'd') { e.preventDefault(); this.duplicateSelected(); }
      }
    });
    
    // Fermer le dropdown police quand on clique ailleurs
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('neFontDropdown');
      if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  },
  
  async open(imageUrl) {
    while (!window.fabric) await new Promise(r => setTimeout(r, 100));
    
    this.currentImage = imageUrl;
    this.isOpen = true;
    this.history = [];
    this.historyIndex = -1;
    this.zoom = 1;
    
    document.getElementById('neoraEditorModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    this.setTool('select');
    setTimeout(() => this.initCanvas(imageUrl), 100);
  },
  
  close() {
    this.isOpen = false;
    document.getElementById('neoraEditorModal').classList.remove('open');
    document.body.style.overflow = '';
    if (this.canvas) { this.canvas.dispose(); this.canvas = null; }
  },
  
  initCanvas(imageUrl) {
    const wrapper = document.getElementById('neCanvasWrapper');
    
    fabric.Image.fromURL(imageUrl, (img) => {
      // Prendre plus de place - 90% de l'espace disponible
      const maxWidth = wrapper.clientWidth - 40;
      const maxHeight = wrapper.clientHeight - 40;
      
      let width = img.width;
      let height = img.height;
      
      // Calculer le scale pour remplir au max l'espace
      const scale = Math.min(maxWidth / width, maxHeight / height);
      
      // Appliquer le scale seulement si l'image est plus grande que l'espace
      if (scale < 1) {
        width = width * scale;
        height = height * scale;
      } else {
        // Si l'image est petite, l'agrandir pour remplir l'espace (max 2x)
        const upscale = Math.min(scale, 2);
        width = width * upscale;
        height = height * upscale;
      }
      
      this.canvas = new fabric.Canvas('neoraEditorCanvas', {
        width, height,
        backgroundColor: '#1a1a2e',
        selection: true,
        preserveObjectStacking: true
      });
      
      // Mettre l'image à la taille du canvas
      img.scaleToWidth(width);
      img.set({ selectable: false, evented: false });
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
      
      this.originalWidth = img.width;
      this.originalHeight = img.height;
      this.displayWidth = width;
      this.displayHeight = height;
      
      this.canvas.on('object:modified', () => this.saveHistory());
      this.canvas.on('object:added', () => this.saveHistory());
      this.canvas.on('selection:created', (e) => this.onSelect(e.selected[0]));
      this.canvas.on('selection:updated', (e) => this.onSelect(e.selected[0]));
      this.canvas.on('selection:cleared', () => this.onDeselect());
      
      this.saveHistory();
      this.updateZoomDisplay();
    }, { crossOrigin: 'anonymous' });
  },
  
  setTool(tool) {
    // Annuler le preview texte si on quitte l'outil texte
    if (tool !== 'text' && this.previewText) {
      this.cancelTextPreview();
    }
    
    document.querySelectorAll('.ne-tool-btn[data-tool]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    document.getElementById('nePanelText').style.display = tool === 'text' ? 'block' : 'none';
    document.getElementById('nePanelImage').style.display = tool === 'image' ? 'block' : 'none';
    document.getElementById('nePanelSelect').style.display = tool === 'select' ? 'block' : 'none';
  },
  
  addText() {
    if (!this.canvas || !this.previewText) return;
    
    // Le texte preview devient définitif
    this.previewText.set({
      cornerStyle: 'circle',
      cornerColor: '#8b5cf6',
      borderColor: '#8b5cf6',
      cornerSize: 10,
      transparentCorners: false,
      padding: 10,
      selectable: true,
      evented: true
    });
    
    this.canvas.setActiveObject(this.previewText);
    this.canvas.requestRenderAll();
    
    // Reset le preview
    this.previewText = null;
    document.getElementById('neTextInput').value = '';
    this.setTool('select');
    
    console.log('Text confirmed');
  },
  
  // Preview en temps réel
  updateTextPreview() {
    if (!this.canvas) return;
    
    const text = document.getElementById('neTextInput').value || '';
    const fontFamily = document.getElementById('neFontFamily').value || 'Inter';
    const fontSize = parseInt(document.getElementById('neFontSize').value) || 48;
    const textColor = document.getElementById('neTextColor').value || '#ffffff';
    const opacity = parseInt(document.getElementById('neTextOpacity').value) / 100;
    const isBold = document.getElementById('neBold').classList.contains('active');
    const isItalic = document.getElementById('neItalic').classList.contains('active');
    const isUnderline = document.getElementById('neUnderline').classList.contains('active');
    const shadowEnabled = document.getElementById('neShadowEnabled').checked;
    const shadowColor = document.getElementById('neShadowColor').value;
    const shadowBlur = parseInt(document.getElementById('neShadowBlur').value);
    
    // Si pas de texte, supprimer le preview
    if (!text) {
      if (this.previewText) {
        this.canvas.remove(this.previewText);
        this.previewText = null;
        this.canvas.requestRenderAll();
      }
      return;
    }
    
    const shadow = shadowEnabled ? new fabric.Shadow({ 
      color: shadowColor, 
      blur: shadowBlur, 
      offsetX: 2, 
      offsetY: 2 
    }) : null;
    
    // Si preview existe, mettre à jour
    if (this.previewText) {
      this.previewText.set({
        text: text,
        fontFamily: fontFamily,
        fontSize: fontSize,
        fill: textColor,
        opacity: opacity,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: isUnderline,
        shadow: shadow
      });
      this.canvas.requestRenderAll();
    } else {
      // Créer le preview
      this.previewText = new fabric.IText(text, {
        left: this.displayWidth / 2,
        top: this.displayHeight / 2,
        originX: 'center',
        originY: 'center',
        fontFamily: fontFamily,
        fontSize: fontSize,
        fill: textColor,
        opacity: opacity,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: isUnderline,
        shadow: shadow,
        // Style preview (bordure pointillée)
        cornerStyle: 'circle',
        cornerColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        borderDashArray: [5, 5],
        cornerSize: 10,
        transparentCorners: false,
        padding: 10
      });
      this.canvas.add(this.previewText);
      this.canvas.setActiveObject(this.previewText);
      this.canvas.requestRenderAll();
    }
  },
  
  // Annuler le preview
  cancelTextPreview() {
    if (this.previewText && this.canvas) {
      this.canvas.remove(this.previewText);
      this.previewText = null;
      this.canvas.requestRenderAll();
    }
    document.getElementById('neTextInput').value = '';
  },
  
  toggleStyle(style) {
    document.getElementById('ne' + style.charAt(0).toUpperCase() + style.slice(1)).classList.toggle('active');
    this.updateTextPreview();
  },
  
  toggleFontDropdown() {
    const dropdown = document.getElementById('neFontDropdown');
    dropdown.classList.toggle('open');
  },
  
  selectFont(font) {
    document.getElementById('neFontFamily').value = font;
    document.getElementById('neFontSelected').innerHTML = `
      <span style="font-family:'${font}'">${font}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    `;
    document.getElementById('neFontDropdown').classList.remove('open');
    
    // Highlight selected
    document.querySelectorAll('.ne-font-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.font === font);
    });
    
    // Mettre à jour le preview
    this.updateTextPreview();
  },
  
  addImage(file) {
    if (!this.canvas || !file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        const maxSize = Math.min(this.canvas.width, this.canvas.height) * 0.4;
        img.scale(maxSize / Math.max(img.width, img.height));
        img.set({
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: 'center',
          originY: 'center',
          opacity: parseInt(document.getElementById('neImageOpacity').value) / 100,
          cornerStyle: 'circle',
          cornerColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          cornerSize: 10,
          transparentCorners: false
        });
        this.canvas.add(img);
        this.canvas.setActiveObject(img);
        this.canvas.renderAll();
        this.setTool('select');
      });
    };
    reader.readAsDataURL(file);
  },
  
  onSelect(obj) {
    document.getElementById('neEmptyState').style.display = 'none';
    document.getElementById('neSelectionProps').style.display = 'block';
    const opacity = Math.round((obj.opacity || 1) * 100);
    document.getElementById('neSelOpacity').value = opacity;
    document.getElementById('neSelOpacityVal').textContent = opacity + '%';
  },
  
  onDeselect() {
    document.getElementById('neEmptyState').style.display = 'flex';
    document.getElementById('neSelectionProps').style.display = 'none';
  },
  
  updateSelectedOpacity(value) {
    const obj = this.canvas?.getActiveObject();
    if (obj) { obj.set('opacity', value / 100); this.canvas.renderAll(); }
  },
  
  deleteSelected() {
    const obj = this.canvas?.getActiveObject();
    if (obj) { this.canvas.remove(obj); this.canvas.renderAll(); this.saveHistory(); }
  },
  
  duplicateSelected() {
    const obj = this.canvas?.getActiveObject();
    if (obj) {
      obj.clone((cloned) => {
        cloned.set({ left: obj.left + 20, top: obj.top + 20 });
        this.canvas.add(cloned);
        this.canvas.setActiveObject(cloned);
        this.canvas.renderAll();
      });
    }
  },
  
  bringForward() {
    const obj = this.canvas?.getActiveObject();
    if (obj) { obj.bringForward(); this.canvas.renderAll(); this.saveHistory(); }
  },
  
  sendBackward() {
    const obj = this.canvas?.getActiveObject();
    if (obj) { obj.sendBackwards(); this.canvas.renderAll(); this.saveHistory(); }
  },
  
  saveHistory() {
    if (!this.canvas) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.stringify(this.canvas.toJSON()));
    if (this.history.length > this.maxHistory) this.history.shift();
    this.historyIndex = this.history.length - 1;
    this.updateHistoryButtons();
  },
  
  undo() {
    if (this.historyIndex > 0) { this.historyIndex--; this.loadHistory(); }
  },
  
  redo() {
    if (this.historyIndex < this.history.length - 1) { this.historyIndex++; this.loadHistory(); }
  },
  
  loadHistory() {
    if (!this.canvas || !this.history[this.historyIndex]) return;
    const bgImage = this.canvas.backgroundImage;
    this.canvas.loadFromJSON(this.history[this.historyIndex], () => {
      this.canvas.setBackgroundImage(bgImage, this.canvas.renderAll.bind(this.canvas));
      this.updateHistoryButtons();
    });
  },
  
  updateHistoryButtons() {
    document.getElementById('neUndoBtn').disabled = this.historyIndex <= 0;
    document.getElementById('neRedoBtn').disabled = this.historyIndex >= this.history.length - 1;
  },
  
  zoomIn() { 
    if (!this.canvas) return;
    this.zoom = Math.min(this.zoom + 0.25, 3); 
    this.applyZoom();
  },
  zoomOut() { 
    if (!this.canvas) return;
    this.zoom = Math.max(this.zoom - 0.25, 0.5); 
    this.applyZoom();
  },
  resetZoom() { 
    if (!this.canvas) return;
    this.zoom = 1; 
    this.applyZoom();
  },
  
  applyZoom() {
    // Utiliser CSS transform pour le zoom (plus simple et fiable)
    const container = document.querySelector('#neCanvasWrapper .canvas-container');
    if (container) {
      container.style.transform = `scale(${this.zoom})`;
      container.style.transformOrigin = 'center center';
    }
    this.updateZoomDisplay();
  },
  
  updateZoomDisplay() {
    document.getElementById('neZoomLevel').textContent = Math.round(this.zoom * 100) + '%';
  },
  
  download() {
    if (!this.canvas) return;
    
    // Calculer le scale pour exporter à la taille originale
    const scale = this.originalWidth / this.displayWidth;
    
    const dataURL = this.canvas.toDataURL({ 
      format: 'png', 
      quality: 1, 
      multiplier: scale 
    });
    
    const link = document.createElement('a');
    link.download = 'neora-edited-' + Date.now() + '.png';
    link.href = dataURL;
    link.click();
  },
  
  injectStyles() {
    if (document.getElementById('neora-editor-styles')) return;
    const style = document.createElement('style');
    style.id = 'neora-editor-styles';
    style.textContent = `
      .ne-modal{position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10000;opacity:0;visibility:hidden;transition:all .3s ease}
      .ne-modal.open{opacity:1;visibility:visible}
      .ne-container{width:100%;height:100%;display:flex;flex-direction:column;background:#0a0a12}
      .ne-header{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#0d0d15;border-bottom:1px solid rgba(255,255,255,0.08)}
      .ne-header-left,.ne-header-center,.ne-header-right{display:flex;align-items:center;gap:12px}
      .ne-logo{font-size:16px;font-weight:700;color:#fff}
      .ne-zoom-controls{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.05);padding:4px 12px;border-radius:8px}
      .ne-zoom-level{font-size:13px;color:rgba(255,255,255,0.7);min-width:45px;text-align:center}
      .ne-divider{width:1px;height:24px;background:rgba(255,255,255,0.1);margin:0 8px}
      .ne-icon-btn{background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;padding:8px;border-radius:8px;display:flex;align-items:center;justify-content:center;transition:all .2s}
      .ne-icon-btn:hover{background:rgba(255,255,255,0.1);color:#fff}
      .ne-icon-btn:disabled{opacity:.3;cursor:not-allowed}
      .ne-btn{padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;border:none;font-family:inherit}
      .ne-btn-ghost{background:transparent;color:rgba(255,255,255,0.7)}
      .ne-btn-ghost:hover{background:rgba(255,255,255,0.1);color:#fff}
      .ne-btn-primary{background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff}
      .ne-btn-primary:hover{transform:translateY(-2px);box-shadow:0 5px 20px rgba(139,92,246,0.4)}
      .ne-btn-danger{background:rgba(239,68,68,0.2);color:#f87171}
      .ne-btn-danger:hover{background:rgba(239,68,68,0.3)}
      .ne-btn-full{width:100%;justify-content:center}
      .ne-btn-sm{padding:8px 12px;font-size:12px}
      .ne-body{flex:1;display:flex;overflow:hidden}
      .ne-toolbar{width:56px;background:#0d0d15;border-right:1px solid rgba(255,255,255,0.08);padding:12px 8px;display:flex;flex-direction:column;gap:8px}
      .ne-tool-group{display:flex;flex-direction:column;gap:4px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08)}
      .ne-tool-group:last-child{border-bottom:none}
      .ne-tool-btn{width:40px;height:40px;border-radius:10px;background:transparent;border:none;color:rgba(255,255,255,0.5);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
      .ne-tool-btn:hover{background:rgba(255,255,255,0.1);color:#fff}
      .ne-tool-btn.active{background:rgba(139,92,246,0.2);color:#8b5cf6}
      .ne-canvas-area{flex:1;display:flex;align-items:center;justify-content:center;background:#050508;overflow:auto}
      .ne-canvas-wrapper{display:flex;align-items:center;justify-content:center;padding:40px}
      .ne-canvas-wrapper .canvas-container{border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,0.5);transition:transform .2s ease}
      .ne-panel{width:300px;background:#0d0d15;border-left:1px solid rgba(255,255,255,0.08);overflow-y:auto}
      .ne-panel-content{padding:20px}
      .ne-panel-header{margin-bottom:20px}
      .ne-panel-header h4{font-size:15px;font-weight:600;color:#fff}
      .ne-field{margin-bottom:16px}
      .ne-field label{display:block;font-size:12px;font-weight:500;color:rgba(255,255,255,0.6);margin-bottom:8px}
      .ne-field input[type="text"],.ne-field input[type="number"],.ne-field textarea,.ne-field select{width:100%;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s}
      .ne-field input:focus,.ne-field textarea:focus,.ne-field select:focus{border-color:#8b5cf6}
      .ne-field textarea{resize:vertical;min-height:80px}
      .ne-field input[type="color"]{width:40px;height:40px;padding:2px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer}
      .ne-field input[type="range"]{width:100%;accent-color:#8b5cf6}
      .ne-field-half{width:48%}
      .ne-row{display:flex;gap:12px;align-items:center}
      .ne-style-btns{display:flex;gap:8px}
      .ne-style-btn{width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
      .ne-style-btn:hover{background:rgba(255,255,255,0.1)}
      .ne-style-btn.active{background:rgba(139,92,246,0.2);border-color:#8b5cf6;color:#8b5cf6}
      .ne-upload-zone{border:2px dashed rgba(255,255,255,0.2);border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:all .2s}
      .ne-upload-zone:hover,.ne-upload-zone.dragover{border-color:#8b5cf6;background:rgba(139,92,246,0.1)}
      .ne-upload-zone svg{color:rgba(255,255,255,0.3);margin-bottom:12px}
      .ne-upload-zone p{font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5}
      .ne-upload-zone span{color:#8b5cf6}
      .ne-font-dropdown{position:relative}
      .ne-font-selected{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;cursor:pointer;transition:all .2s}
      .ne-font-selected:hover{border-color:rgba(255,255,255,0.2)}
      .ne-font-selected span{color:#fff;font-size:14px}
      .ne-font-selected svg{color:rgba(255,255,255,0.5);transition:transform .2s}
      .ne-font-dropdown.open .ne-font-selected{border-color:#8b5cf6}
      .ne-font-dropdown.open .ne-font-selected svg{transform:rotate(180deg)}
      .ne-font-options{position:absolute;top:100%;left:0;right:0;background:#1a1a2e;border:1px solid rgba(255,255,255,0.1);border-radius:8px;margin-top:4px;max-height:250px;overflow-y:auto;opacity:0;visibility:hidden;transform:translateY(-10px);transition:all .2s;z-index:100}
      .ne-font-dropdown.open .ne-font-options{opacity:1;visibility:visible;transform:translateY(0)}
      .ne-font-option{padding:12px 14px;color:rgba(255,255,255,0.8);font-size:16px;cursor:pointer;transition:all .15s;border-bottom:1px solid rgba(255,255,255,0.05)}
      .ne-font-option:last-child{border-bottom:none}
      .ne-font-option:hover{background:rgba(139,92,246,0.15);color:#fff}
      .ne-font-option.selected{background:rgba(139,92,246,0.25);color:#8b5cf6}
      .ne-font-options::-webkit-scrollbar{width:6px}
      .ne-font-options::-webkit-scrollbar-track{background:rgba(255,255,255,0.05);border-radius:3px}
      .ne-font-options::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.5);border-radius:3px}
      .ne-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center}
      .ne-empty-state svg{color:rgba(255,255,255,0.2);margin-bottom:16px}
      .ne-empty-state p{font-size:13px;color:rgba(255,255,255,0.4);line-height:1.5}
      @media(max-width:900px){.ne-panel{width:260px}.ne-toolbar{width:48px}.ne-tool-btn{width:36px;height:36px}}
      @media(max-width:700px){.ne-body{flex-direction:column}.ne-toolbar{width:100%;flex-direction:row;overflow-x:auto;padding:8px}.ne-tool-group{flex-direction:row;border-bottom:none;border-right:1px solid rgba(255,255,255,0.08);padding-right:8px;padding-bottom:0}.ne-panel{width:100%;max-height:40vh}.ne-canvas-area{min-height:300px}}
    `;
    document.head.appendChild(style);
  }
};

document.addEventListener('DOMContentLoaded', () => NeoraEditor.init());
