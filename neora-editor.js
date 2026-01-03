/**
 * NEORA Image Editor Pro
 * Version 2.1 - Stable
 */

const NeoraEditor = {
  canvas: null,
  isOpen: false,
  currentImage: null,
  history: [],
  historyIndex: -1,
  zoom: 1,
  currentTextObj: null,
  displayWidth: 0,
  displayHeight: 0,
  originalWidth: 0,
  originalHeight: 0,
  
  fonts: [
    // Sans-serif modernes
    'Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans', 'Lato', 'Nunito', 'Raleway', 'Work Sans', 'DM Sans', 'Plus Jakarta Sans', 'Space Grotesk', 'Outfit', 'Sora', 'Manrope',
    // Display & Titres tendances
    'Bebas Neue', 'Oswald', 'Anton', 'Righteous', 'Staatliches', 'Russo One', 'Archivo Black', 'Bowlby One SC', 'Bungee', 'Monoton',
    // Élégantes & Luxe
    'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', 'Crimson Text', 'DM Serif Display', 'Bodoni Moda', 'Italiana',
    // Manuscrites & Créatives
    'Pacifico', 'Lobster', 'Permanent Marker', 'Caveat', 'Dancing Script', 'Satisfy', 'Great Vibes', 'Sacramento', 'Kaushan Script', 'Shadows Into Light',
    // Futuristes & Tech
    'Orbitron', 'Rajdhani', 'Exo 2', 'Audiowide', 'Michroma', 'Oxanium', 'Electrolize',
    // Rétro & Vintage
    'Abril Fatface', 'Alfa Slab One', 'Fredoka One', 'Titan One', 'Rubik Mono One', 'Bungee Shade',
    // Minimalistes
    'Quicksand', 'Comfortaa', 'Varela Round', 'Karla', 'Urbanist', 'Lexend'
  ],
  
  init() {
    if (document.getElementById('neoraEditorModal')) return;
    this.injectStyles();
    this.createModal();
    this.loadDependencies();
    console.log('NeoraEditor initialized');
  },
  
  loadDependencies() {
    if (!window.fabric) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
      document.head.appendChild(script);
    }
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${this.fonts.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
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
              <button class="ne-icon-btn" onclick="NeoraEditor.zoomOut()" title="Zoom -">−</button>
              <span class="ne-zoom-level" id="neZoomLevel">100%</span>
              <button class="ne-icon-btn" onclick="NeoraEditor.zoomIn()" title="Zoom +">+</button>
              <button class="ne-icon-btn" onclick="NeoraEditor.resetZoom()" title="Reset">↺</button>
            </div>
          </div>
          <div class="ne-header-right">
            <button class="ne-icon-btn" onclick="NeoraEditor.undo()" title="Annuler" id="neUndoBtn" disabled>↶</button>
            <button class="ne-icon-btn" onclick="NeoraEditor.redo()" title="Rétablir" id="neRedoBtn" disabled>↷</button>
            <div class="ne-divider"></div>
            <button class="ne-btn ne-btn-ghost" onclick="NeoraEditor.close()">Annuler</button>
            <button class="ne-btn ne-btn-primary" onclick="NeoraEditor.download()">💾 Exporter</button>
          </div>
        </div>
        
        <div class="ne-body">
          <div class="ne-toolbar">
            <button class="ne-tool-btn active" data-tool="select" onclick="NeoraEditor.setTool('select')" title="Sélection">✋</button>
            <button class="ne-tool-btn" data-tool="text" onclick="NeoraEditor.setTool('text')" title="Texte">T</button>
            <button class="ne-tool-btn" data-tool="image" onclick="NeoraEditor.setTool('image')" title="Image">🖼</button>
            <div class="ne-tool-sep"></div>
            <button class="ne-tool-btn" onclick="NeoraEditor.deleteSelected()" title="Supprimer">🗑</button>
            <button class="ne-tool-btn" onclick="NeoraEditor.duplicateSelected()" title="Dupliquer">📋</button>
          </div>
          
          <div class="ne-canvas-area">
            <div class="ne-canvas-wrapper" id="neCanvasWrapper">
              <canvas id="neoraEditorCanvas"></canvas>
            </div>
          </div>
          
          <div class="ne-panel">
            <!-- Panel Texte -->
            <div class="ne-panel-content" id="nePanelText" style="display:none;">
              <h4>✏️ Ajouter du texte</h4>
              <div class="ne-field">
                <label>Texte</label>
                <textarea id="neTextInput" placeholder="Votre texte..." rows="2"></textarea>
              </div>
              <div class="ne-field">
                <label>Police</label>
                <select id="neFontFamily">${this.fonts.map(f => `<option value="${f}" style="font-family:${f}">${f}</option>`).join('')}</select>
              </div>
              <div class="ne-row">
                <div class="ne-field" style="flex:1">
                  <label>Taille</label>
                  <input type="number" id="neFontSize" value="48" min="8" max="300">
                </div>
                <div class="ne-field" style="flex:1">
                  <label>Couleur</label>
                  <input type="color" id="neTextColor" value="#ffffff">
                </div>
              </div>
              <div class="ne-field">
                <label>Style</label>
                <div class="ne-style-btns">
                  <button class="ne-style-btn" id="neBold" onclick="NeoraEditor.toggleStyle('bold')"><b>B</b></button>
                  <button class="ne-style-btn" id="neItalic" onclick="NeoraEditor.toggleStyle('italic')"><i>I</i></button>
                  <button class="ne-style-btn" id="neUnderline" onclick="NeoraEditor.toggleStyle('underline')"><u>U</u></button>
                </div>
              </div>
              <div class="ne-field">
                <label>Ombre <input type="checkbox" id="neShadowEnabled"></label>
                <div class="ne-row">
                  <input type="color" id="neShadowColor" value="#000000">
                  <input type="range" id="neShadowBlur" min="0" max="30" value="10" style="flex:1">
                </div>
              </div>
              <button class="ne-btn ne-btn-primary ne-btn-full" style="margin-top:16px;" onclick="NeoraEditor.addNewText()">+ Ajouter un autre texte</button>
            </div>
            
            <!-- Panel Image -->
            <div class="ne-panel-content" id="nePanelImage" style="display:none;">
              <h4>🖼️ Ajouter une image</h4>
              <div class="ne-upload-zone" id="neUploadZone" onclick="document.getElementById('neImageInput').click()">
                <input type="file" id="neImageInput" accept="image/*" style="display:none">
                <p>📁 Cliquer pour importer<br>ou glisser-déposer</p>
              </div>
            </div>
            
            <!-- Panel Sélection -->
            <div class="ne-panel-content" id="nePanelSelect">
              <h4>🎯 Propriétés</h4>
              <div id="neEmptyState" class="ne-empty-state">
                <p>Sélectionnez un élément pour modifier ses propriétés</p>
              </div>
              
              <!-- Props Texte sélectionné -->
              <div id="neSelTextProps" style="display:none;">
                <div class="ne-field">
                  <label>Texte</label>
                  <textarea id="neSelText" rows="2"></textarea>
                </div>
                <div class="ne-field">
                  <label>Police</label>
                  <select id="neSelFont">${this.fonts.map(f => `<option value="${f}" style="font-family:${f}">${f}</option>`).join('')}</select>
                </div>
                <div class="ne-row">
                  <div class="ne-field" style="flex:1">
                    <label>Taille</label>
                    <input type="number" id="neSelSize" value="48" min="8" max="300">
                  </div>
                  <div class="ne-field" style="flex:1">
                    <label>Couleur</label>
                    <input type="color" id="neSelColor" value="#ffffff">
                  </div>
                </div>
                <div class="ne-field">
                  <label>Opacité: <span id="neSelOpacityVal">100%</span></label>
                  <input type="range" id="neSelOpacity" min="0" max="100" value="100">
                </div>
                <button class="ne-btn ne-btn-danger ne-btn-full" onclick="NeoraEditor.deleteSelected()">🗑 Supprimer</button>
              </div>
              
              <!-- Props Image sélectionnée -->
              <div id="neSelImageProps" style="display:none;">
                <div class="ne-field">
                  <label>Opacité: <span id="neSelImgOpacityVal">100%</span></label>
                  <input type="range" id="neSelImgOpacity" min="0" max="100" value="100">
                </div>
                <button class="ne-btn ne-btn-danger ne-btn-full" onclick="NeoraEditor.deleteSelected()">🗑 Supprimer</button>
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
    // Upload image
    const imageInput = document.getElementById('neImageInput');
    imageInput.addEventListener('change', (e) => {
      if (e.target.files[0]) this.addImage(e.target.files[0]);
    });
    
    // Preview texte en temps réel
    ['neTextInput', 'neFontFamily', 'neFontSize', 'neTextColor', 'neShadowEnabled', 'neShadowColor', 'neShadowBlur'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updateTextPreview());
      if (el) el.addEventListener('change', () => this.updateTextPreview());
    });
    
    // Modification élément sélectionné
    ['neSelText', 'neSelFont', 'neSelSize', 'neSelColor'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.updateSelectedElement());
      if (el) el.addEventListener('change', () => this.updateSelectedElement());
    });
    
    document.getElementById('neSelOpacity')?.addEventListener('input', (e) => {
      document.getElementById('neSelOpacityVal').textContent = e.target.value + '%';
      this.updateSelectedElement();
    });
    
    document.getElementById('neSelImgOpacity')?.addEventListener('input', (e) => {
      document.getElementById('neSelImgOpacityVal').textContent = e.target.value + '%';
      const obj = this.canvas?.getActiveObject();
      if (obj) {
        obj.set('opacity', e.target.value / 100);
        this.canvas.renderAll();
      }
    });
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') this.close();
      if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        this.deleteSelected();
      }
    });
  },
  
  // ===== OPEN / CLOSE =====
  
  async open(imageUrl) {
    console.log('Opening editor with:', imageUrl);
    
    // Attendre Fabric.js
    let attempts = 0;
    while (!window.fabric && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    
    if (!window.fabric) {
      alert('Erreur: Fabric.js non chargé');
      return;
    }
    
    this.currentImage = imageUrl;
    this.isOpen = true;
    this.history = [];
    this.historyIndex = -1;
    this.zoom = 1;
    this.previewText = null;
    
    document.getElementById('neoraEditorModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    this.setTool('select');
    
    // Petit délai pour que le modal soit affiché
    setTimeout(() => this.initCanvas(imageUrl), 150);
  },
  
  close() {
    this.isOpen = false;
    this.previewText = null;
    document.getElementById('neoraEditorModal').classList.remove('open');
    document.body.style.overflow = '';
    if (this.canvas) {
      this.canvas.dispose();
      this.canvas = null;
    }
  },
  
  // ===== CANVAS =====
  
  initCanvas(imageUrl) {
    const wrapper = document.getElementById('neCanvasWrapper');
    if (!wrapper) {
      console.error('Canvas wrapper not found');
      return;
    }
    
    const maxWidth = wrapper.clientWidth - 40;
    const maxHeight = wrapper.clientHeight - 40;
    
    console.log('Wrapper size:', maxWidth, maxHeight);
    
    // Créer une image pour obtenir les dimensions
    const imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';
    
    imgEl.onload = () => {
      console.log('Image loaded:', imgEl.width, imgEl.height);
      
      const imgWidth = imgEl.width;
      const imgHeight = imgEl.height;
      
      // Calculer le scale - on utilise 0.85 de l'espace disponible pour un bon confort visuel
      const scale = Math.min((maxWidth * 0.85) / imgWidth, (maxHeight * 0.85) / imgHeight);
      const canvasWidth = Math.round(imgWidth * scale);
      const canvasHeight = Math.round(imgHeight * scale);
      
      console.log('Canvas size:', canvasWidth, canvasHeight);
      
      // Créer le canvas
      this.canvas = new fabric.Canvas('neoraEditorCanvas', {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#1a1a2e'
      });
      
      // Ajouter l'image de fond
      fabric.Image.fromURL(imageUrl, (fabricImg) => {
        fabricImg.scaleToWidth(canvasWidth);
        fabricImg.set({ selectable: false, evented: false });
        this.canvas.setBackgroundImage(fabricImg, this.canvas.renderAll.bind(this.canvas));
        
        this.originalWidth = imgWidth;
        this.originalHeight = imgHeight;
        this.displayWidth = canvasWidth;
        this.displayHeight = canvasHeight;
        
        // Events
        this.canvas.on('selection:created', (e) => this.onSelect(e.selected[0]));
        this.canvas.on('selection:updated', (e) => this.onSelect(e.selected[0]));
        this.canvas.on('selection:cleared', () => this.onDeselect());
        this.canvas.on('object:modified', () => this.saveHistory());
        
        this.saveHistory();
        this.updateZoomDisplay();
        
        console.log('Canvas ready');
      }, { crossOrigin: 'anonymous' });
    };
    
    imgEl.onerror = (err) => {
      console.error('Image load error:', err);
      alert('Erreur de chargement de l\'image');
    };
    
    imgEl.src = imageUrl;
  },
  
  // ===== TOOLS =====
  
  setTool(tool) {
    // Si on quitte l'outil texte, finaliser le texte actuel
    if (tool !== 'text') {
      this.finalizeCurrentText();
    }
    
    document.querySelectorAll('.ne-tool-btn[data-tool]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    
    document.getElementById('nePanelText').style.display = tool === 'text' ? 'block' : 'none';
    document.getElementById('nePanelImage').style.display = tool === 'image' ? 'block' : 'none';
    document.getElementById('nePanelSelect').style.display = tool === 'select' ? 'block' : 'none';
  },
  
  // ===== TEXT =====
  
  updateTextPreview() {
    if (!this.canvas) return;
    
    const text = document.getElementById('neTextInput').value;
    if (!text) {
      // Si on efface tout le texte, supprimer l'objet actuel
      if (this.currentTextObj) {
        this.canvas.remove(this.currentTextObj);
        this.currentTextObj = null;
        this.canvas.renderAll();
      }
      return;
    }
    
    const fontFamily = document.getElementById('neFontFamily').value;
    const fontSize = parseInt(document.getElementById('neFontSize').value) || 48;
    const fill = document.getElementById('neTextColor').value;
    const shadowEnabled = document.getElementById('neShadowEnabled').checked;
    const shadowColor = document.getElementById('neShadowColor').value;
    const shadowBlur = parseInt(document.getElementById('neShadowBlur').value);
    const isBold = document.getElementById('neBold').classList.contains('active');
    const isItalic = document.getElementById('neItalic').classList.contains('active');
    const isUnderline = document.getElementById('neUnderline').classList.contains('active');
    
    const props = {
      text,
      fontFamily,
      fontSize,
      fill,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
      shadow: shadowEnabled ? new fabric.Shadow({ color: shadowColor, blur: shadowBlur, offsetX: 2, offsetY: 2 }) : null
    };
    
    if (this.currentTextObj) {
      // Mettre à jour le texte existant
      this.currentTextObj.set(props);
      this.canvas.renderAll();
    } else {
      // Créer un nouveau texte
      this.currentTextObj = new fabric.IText(text, {
        ...props,
        left: this.displayWidth / 2,
        top: this.displayHeight / 2,
        originX: 'center',
        originY: 'center',
        cornerColor: '#8b5cf6',
        borderColor: '#8b5cf6',
        cornerSize: 10
      });
      this.canvas.add(this.currentTextObj);
      this.canvas.setActiveObject(this.currentTextObj);
      this.canvas.renderAll();
    }
  },
  
  toggleStyle(style) {
    const btn = document.getElementById('ne' + style.charAt(0).toUpperCase() + style.slice(1));
    btn.classList.toggle('active');
    this.updateTextPreview();
  },
  
  // Ajouter un nouveau texte (reset le champ et crée un nouvel objet)
  addNewText() {
    // Sauvegarder l'historique pour le texte actuel
    if (this.currentTextObj) {
      this.saveHistory();
    }
    // Reset
    this.currentTextObj = null;
    document.getElementById('neTextInput').value = '';
    document.getElementById('neTextInput').focus();
  },
  
  // Quand on quitte l'outil texte, on sauvegarde
  finalizeCurrentText() {
    if (this.currentTextObj) {
      this.saveHistory();
      this.currentTextObj = null;
      document.getElementById('neTextInput').value = '';
    }
  },
  
  // ===== IMAGE =====
  
  addImage(file) {
    if (!this.canvas || !file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        const maxSize = Math.min(this.displayWidth, this.displayHeight) * 0.4;
        const scale = maxSize / Math.max(img.width, img.height);
        img.scale(scale);
        img.set({
          left: this.displayWidth / 2,
          top: this.displayHeight / 2,
          originX: 'center',
          originY: 'center',
          cornerColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          cornerSize: 10
        });
        this.canvas.add(img);
        this.canvas.setActiveObject(img);
        this.canvas.renderAll();
        this.saveHistory();
        this.setTool('select');
      });
    };
    reader.readAsDataURL(file);
  },
  
  // ===== SELECTION =====
  
  onSelect(obj) {
    if (!obj) return;
    
    document.getElementById('neEmptyState').style.display = 'none';
    
    const isText = obj.type === 'i-text' || obj.type === 'text';
    document.getElementById('neSelTextProps').style.display = isText ? 'block' : 'none';
    document.getElementById('neSelImageProps').style.display = isText ? 'none' : 'block';
    
    if (isText) {
      document.getElementById('neSelText').value = obj.text || '';
      document.getElementById('neSelFont').value = obj.fontFamily || 'Inter';
      document.getElementById('neSelSize').value = obj.fontSize || 48;
      document.getElementById('neSelColor').value = obj.fill || '#ffffff';
      const opacity = Math.round((obj.opacity || 1) * 100);
      document.getElementById('neSelOpacity').value = opacity;
      document.getElementById('neSelOpacityVal').textContent = opacity + '%';
    } else {
      const opacity = Math.round((obj.opacity || 1) * 100);
      document.getElementById('neSelImgOpacity').value = opacity;
      document.getElementById('neSelImgOpacityVal').textContent = opacity + '%';
    }
  },
  
  onDeselect() {
    document.getElementById('neEmptyState').style.display = 'block';
    document.getElementById('neSelTextProps').style.display = 'none';
    document.getElementById('neSelImageProps').style.display = 'none';
  },
  
  updateSelectedElement() {
    const obj = this.canvas?.getActiveObject();
    if (!obj || (obj.type !== 'i-text' && obj.type !== 'text')) return;
    
    obj.set({
      text: document.getElementById('neSelText').value,
      fontFamily: document.getElementById('neSelFont').value,
      fontSize: parseInt(document.getElementById('neSelSize').value) || 48,
      fill: document.getElementById('neSelColor').value,
      opacity: document.getElementById('neSelOpacity').value / 100
    });
    this.canvas.renderAll();
  },
  
  deleteSelected() {
    const obj = this.canvas?.getActiveObject();
    if (obj) {
      this.canvas.remove(obj);
      this.canvas.renderAll();
      this.saveHistory();
      this.onDeselect();
    }
  },
  
  duplicateSelected() {
    const obj = this.canvas?.getActiveObject();
    if (obj) {
      obj.clone((cloned) => {
        cloned.set({ left: obj.left + 20, top: obj.top + 20 });
        this.canvas.add(cloned);
        this.canvas.setActiveObject(cloned);
        this.canvas.renderAll();
        this.saveHistory();
      });
    }
  },
  
  // ===== HISTORY =====
  
  saveHistory() {
    if (!this.canvas) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.stringify(this.canvas.toJSON()));
    if (this.history.length > 30) this.history.shift();
    this.historyIndex = this.history.length - 1;
    this.updateHistoryButtons();
  },
  
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadHistory();
    }
  },
  
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadHistory();
    }
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
    const undoBtn = document.getElementById('neUndoBtn');
    const redoBtn = document.getElementById('neRedoBtn');
    if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
  },
  
  // ===== ZOOM =====
  
  zoomIn() { this.zoom = Math.min(this.zoom + 0.25, 3); this.applyZoom(); },
  zoomOut() { this.zoom = Math.max(this.zoom - 0.25, 0.5); this.applyZoom(); },
  resetZoom() { this.zoom = 1; this.applyZoom(); },
  
  applyZoom() {
    if (!this.canvas) return;
    
    // Recalculer les dimensions du canvas en fonction du zoom
    const newWidth = Math.round(this.displayWidth * this.zoom);
    const newHeight = Math.round(this.displayHeight * this.zoom);
    
    // Redimensionner le canvas Fabric
    this.canvas.setDimensions({ width: newWidth, height: newHeight });
    
    // Mettre à jour le zoom de Fabric pour garder les objets à la bonne échelle
    this.canvas.setZoom(this.zoom);
    
    // Re-rendre pour une image nette
    this.canvas.renderAll();
    
    this.updateZoomDisplay();
  },
  
  updateZoomDisplay() {
    const el = document.getElementById('neZoomLevel');
    if (el) el.textContent = Math.round(this.zoom * 100) + '%';
  },
  
  // ===== DOWNLOAD =====
  
  download() {
    if (!this.canvas) return;
    const scale = this.originalWidth / this.displayWidth;
    const dataURL = this.canvas.toDataURL({ format: 'png', quality: 1, multiplier: scale });
    const link = document.createElement('a');
    link.download = 'neora-edited-' + Date.now() + '.png';
    link.href = dataURL;
    link.click();
  },
  
  // ===== STYLES =====
  
  injectStyles() {
    if (document.getElementById('ne-styles')) return;
    const style = document.createElement('style');
    style.id = 'ne-styles';
    style.textContent = `
      .ne-modal{position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10000;opacity:0;visibility:hidden;transition:all .3s}
      .ne-modal.open{opacity:1;visibility:visible}
      .ne-container{width:100%;height:100%;display:flex;flex-direction:column;background:#0a0a12}
      .ne-header{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#0d0d15;border-bottom:1px solid rgba(255,255,255,0.1)}
      .ne-header-left,.ne-header-center,.ne-header-right{display:flex;align-items:center;gap:12px}
      .ne-logo{font-size:16px;font-weight:700;color:#fff}
      .ne-zoom-controls{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.05);padding:4px 12px;border-radius:8px}
      .ne-zoom-level{font-size:13px;color:rgba(255,255,255,0.7);min-width:50px;text-align:center}
      .ne-divider{width:1px;height:24px;background:rgba(255,255,255,0.1)}
      .ne-icon-btn{background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;padding:8px 12px;border-radius:6px;font-size:16px}
      .ne-icon-btn:hover{background:rgba(255,255,255,0.1);color:#fff}
      .ne-icon-btn:disabled{opacity:.3;cursor:not-allowed}
      .ne-btn{padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none}
      .ne-btn-ghost{background:transparent;color:rgba(255,255,255,0.7)}
      .ne-btn-ghost:hover{background:rgba(255,255,255,0.1);color:#fff}
      .ne-btn-primary{background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff}
      .ne-btn-primary:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(139,92,246,0.4)}
      .ne-btn-danger{background:rgba(239,68,68,0.2);color:#f87171}
      .ne-btn-full{width:100%}
      .ne-body{flex:1;display:flex;overflow:hidden}
      .ne-toolbar{width:50px;background:#0d0d15;border-right:1px solid rgba(255,255,255,0.1);padding:12px 5px;display:flex;flex-direction:column;align-items:center;gap:8px}
      .ne-tool-btn{width:40px;height:40px;border-radius:8px;background:transparent;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:18px}
      .ne-tool-btn:hover{background:rgba(255,255,255,0.1);color:#fff}
      .ne-tool-btn.active{background:rgba(139,92,246,0.2);color:#8b5cf6}
      .ne-tool-sep{width:30px;height:1px;background:rgba(255,255,255,0.1);margin:4px 0}
      .ne-canvas-area{flex:1;display:flex;align-items:center;justify-content:center;background:#050508;overflow:auto;min-height:0}
      .ne-canvas-wrapper{display:flex;align-items:center;justify-content:center;padding:20px;width:100%;height:100%}
      .ne-canvas-wrapper .canvas-container{border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.5)}
      .ne-panel{width:280px;background:#0d0d15;border-left:1px solid rgba(255,255,255,0.1);overflow-y:auto}
      .ne-panel-content{padding:20px}
      .ne-panel-content h4{font-size:14px;font-weight:600;color:#fff;margin:0 0 16px 0}
      .ne-field{margin-bottom:14px}
      .ne-field label{display:block;font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:6px}
      .ne-field input,.ne-field textarea,.ne-field select{width:100%;padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#fff;font-size:14px}
      .ne-field select option{background:#1a1a2e;color:#fff;padding:8px}
      .ne-field select optgroup{background:#0d0d15;color:rgba(255,255,255,0.6)}
      .ne-field input:focus,.ne-field textarea:focus,.ne-field select:focus{border-color:#8b5cf6;outline:none}
      .ne-field input[type="color"]{width:50px;height:40px;padding:2px;cursor:pointer}
      .ne-field input[type="range"]{accent-color:#8b5cf6}
      .ne-row{display:flex;gap:10px;align-items:flex-end}
      .ne-style-btns{display:flex;gap:6px}
      .ne-style-btn{width:36px;height:36px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);cursor:pointer;font-size:14px}
      .ne-style-btn:hover{background:rgba(255,255,255,0.1)}
      .ne-style-btn.active{background:rgba(139,92,246,0.2);border-color:#8b5cf6;color:#8b5cf6}
      .ne-upload-zone{border:2px dashed rgba(255,255,255,0.2);border-radius:12px;padding:30px;text-align:center;cursor:pointer}
      .ne-upload-zone:hover{border-color:#8b5cf6;background:rgba(139,92,246,0.1)}
      .ne-upload-zone p{color:rgba(255,255,255,0.5);font-size:13px;margin:0}
      .ne-empty-state{text-align:center;padding:30px 10px;color:rgba(255,255,255,0.4);font-size:13px}
      
      /* MOBILE RESPONSIVE */
      @media(max-width:768px){
        .ne-header{padding:10px 12px;flex-wrap:wrap;gap:8px}
        .ne-header-left,.ne-header-center,.ne-header-right{gap:6px}
        .ne-logo{font-size:13px}
        .ne-zoom-controls{padding:4px 8px;gap:4px}
        .ne-zoom-level{font-size:11px;min-width:40px}
        .ne-icon-btn{padding:6px 8px;font-size:14px}
        .ne-btn{padding:10px 14px;font-size:13px}
        .ne-divider{display:none}
        .ne-body{flex-direction:column}
        .ne-toolbar{width:100%;flex-direction:row;justify-content:center;padding:10px;gap:6px;order:2;border-right:none;border-top:1px solid rgba(255,255,255,0.1)}
        .ne-tool-btn{width:44px;height:44px;font-size:18px}
        .ne-tool-sep{width:1px;height:28px;margin:0 4px}
        .ne-canvas-area{order:1;flex:1;min-height:250px}
        .ne-canvas-wrapper{padding:10px}
        .ne-panel{width:100%;max-height:45vh;order:3;border-left:none;border-top:1px solid rgba(255,255,255,0.1)}
        .ne-panel-content{padding:14px}
        .ne-panel-content h4{font-size:13px;margin-bottom:12px}
        .ne-field{margin-bottom:10px}
        .ne-field label{font-size:11px}
        .ne-field input,.ne-field textarea,.ne-field select{padding:12px;font-size:16px}
        .ne-row{flex-wrap:wrap}
        .ne-style-btns{flex-wrap:wrap}
        .ne-style-btn{width:40px;height:40px}
        .ne-upload-zone{padding:20px}
        .ne-btn-full{padding:14px}
      }
      
      @media(max-width:480px){
        .ne-header-center{display:none}
        .ne-logo{font-size:12px}
        .ne-btn{padding:8px 12px;font-size:12px}
      }
      
      @media(max-height:600px) and (orientation:landscape){
        .ne-panel{max-height:35vh}
        .ne-canvas-area{min-height:180px}
      }
    `;
    document.head.appendChild(style);
  }
};

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NeoraEditor.init());
} else {
  NeoraEditor.init();
}
