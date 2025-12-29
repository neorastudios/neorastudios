/**
 * NEORA Prompt Templates
 * Système de prompts pré-faits cliquables
 */

const NeoraTemplates = {
  
  // ============================================
  // CATÉGORIES DE TEMPLATES
  // ============================================
  
  categories: [
    { id: 'product', name: '📦 Produit', icon: '📦' },
    { id: 'lifestyle', name: '🌿 Lifestyle', icon: '🌿' },
    { id: 'luxury', name: '💎 Luxe', icon: '💎' },
    { id: 'creative', name: '🎨 Créatif', icon: '🎨' },
    { id: 'food', name: '🍽️ Food', icon: '🍽️' },
    { id: 'fashion', name: '👗 Mode', icon: '👗' },
    { id: 'tech', name: '📱 Tech', icon: '📱' },
    { id: 'beauty', name: '💄 Beauté', icon: '💄' }
  ],
  
  // ============================================
  // TEMPLATES PAR CATÉGORIE
  // ============================================
  
  templates: {
    
    // 📦 PRODUIT
    product: [
      {
        id: 'packshot-white',
        name: 'Packshot Fond Blanc',
        preview: '🤍',
        prompt: 'professional product photography, clean white background, soft shadows, studio lighting, commercial packshot, high-end catalog style, sharp focus, 8k quality',
        description: 'Fond blanc classique e-commerce'
      },
      {
        id: 'packshot-gradient',
        name: 'Packshot Dégradé',
        preview: '🌈',
        prompt: 'professional product photography, smooth gradient background, soft pastel colors, studio lighting, modern minimalist style, floating product, subtle shadows, 8k quality',
        description: 'Fond dégradé moderne'
      },
      {
        id: 'floating-product',
        name: 'Produit Flottant',
        preview: '✨',
        prompt: 'levitating product photography, floating in air, dynamic angle, soft shadow below, clean minimal background, dramatic studio lighting, 3D render style, 8k quality',
        description: 'Effet lévitation dynamique'
      },
      {
        id: 'hero-shot',
        name: 'Hero Shot',
        preview: '🦸',
        prompt: 'hero product shot, dramatic lighting, low angle, powerful presence, dark moody background, rim lighting, cinematic commercial photography, 8k quality',
        description: 'Shot impactant pour homepage'
      },
      {
        id: 'flat-lay',
        name: 'Flat Lay',
        preview: '📐',
        prompt: 'flat lay product photography, top-down view, organized composition, complementary props, clean background, soft natural lighting, instagram style, 8k quality',
        description: 'Vue du dessus stylisée'
      }
    ],
    
    // 🌿 LIFESTYLE
    lifestyle: [
      {
        id: 'nature-outdoor',
        name: 'Nature & Outdoor',
        preview: '🏞️',
        prompt: 'lifestyle product photography, natural outdoor setting, golden hour sunlight, organic environment, rocks and plants, authentic feel, warm tones, 8k quality',
        description: 'Ambiance nature extérieure'
      },
      {
        id: 'cozy-interior',
        name: 'Intérieur Cosy',
        preview: '🛋️',
        prompt: 'lifestyle product photography, cozy home interior, warm ambient lighting, soft textures, wooden elements, hygge atmosphere, comfortable setting, 8k quality',
        description: 'Ambiance intérieur chaleureux'
      },
      {
        id: 'urban-street',
        name: 'Urban Street',
        preview: '🏙️',
        prompt: 'lifestyle product photography, urban street setting, city background, concrete and metal, modern architecture, street style vibes, natural daylight, 8k quality',
        description: 'Ambiance urbaine street'
      },
      {
        id: 'beach-summer',
        name: 'Beach & Summer',
        preview: '🏖️',
        prompt: 'lifestyle product photography, beach setting, sand and ocean, summer vibes, bright sunlight, tropical feel, fresh and vibrant colors, 8k quality',
        description: 'Ambiance plage été'
      },
      {
        id: 'cafe-mood',
        name: 'Coffee Shop',
        preview: '☕',
        prompt: 'lifestyle product photography, coffee shop setting, warm wood tones, morning light through window, cozy cafe atmosphere, bokeh background, 8k quality',
        description: 'Ambiance café cosy'
      }
    ],
    
    // 💎 LUXE
    luxury: [
      {
        id: 'black-elegance',
        name: 'Black Elegance',
        preview: '🖤',
        prompt: 'luxury product photography, pure black background, dramatic rim lighting, elegant reflections, high-end aesthetic, premium feel, sophisticated, 8k quality',
        description: 'Fond noir premium'
      },
      {
        id: 'marble-gold',
        name: 'Marbre & Or',
        preview: '🏛️',
        prompt: 'luxury product photography, white marble surface, gold accents, elegant composition, soft reflections, high-end jewelry style, opulent feel, 8k quality',
        description: 'Marbre blanc et touches dorées'
      },
      {
        id: 'velvet-premium',
        name: 'Velours Premium',
        preview: '👑',
        prompt: 'luxury product photography, rich velvet fabric background, deep jewel tones, dramatic lighting, premium texture, royal aesthetic, sophisticated elegance, 8k quality',
        description: 'Texture velours luxueuse'
      },
      {
        id: 'crystal-shine',
        name: 'Crystal Shine',
        preview: '💠',
        prompt: 'luxury product photography, crystal and glass elements, light refractions, sparkling highlights, transparent elegance, premium perfume style, 8k quality',
        description: 'Effets cristal et lumière'
      },
      {
        id: 'minimalist-luxury',
        name: 'Luxe Minimaliste',
        preview: '◽',
        prompt: 'minimalist luxury photography, clean composition, subtle shadows, muted elegant tones, negative space, understated sophistication, gallery style, 8k quality',
        description: 'Luxe épuré et minimaliste'
      }
    ],
    
    // 🎨 CRÉATIF
    creative: [
      {
        id: 'neon-glow',
        name: 'Neon Glow',
        preview: '💜',
        prompt: 'creative product photography, neon lights, purple and blue glow, cyberpunk aesthetic, futuristic vibes, dark background with color splash, 8k quality',
        description: 'Néons violet/bleu cyberpunk'
      },
      {
        id: 'splash-water',
        name: 'Water Splash',
        preview: '💦',
        prompt: 'creative product photography, dynamic water splash, frozen motion, droplets in air, fresh and clean feel, high speed photography style, 8k quality',
        description: 'Éclaboussures d\'eau dynamiques'
      },
      {
        id: 'color-explosion',
        name: 'Explosion de Couleurs',
        preview: '🎨',
        prompt: 'creative product photography, colorful powder explosion, vibrant holi colors, dynamic movement, energetic composition, bold and playful, 8k quality',
        description: 'Poudre colorée explosive'
      },
      {
        id: 'smoke-mystery',
        name: 'Smoke & Mystery',
        preview: '🌫️',
        prompt: 'creative product photography, flowing smoke effects, mysterious atmosphere, dramatic lighting, dark and moody, ethereal feel, artistic composition, 8k quality',
        description: 'Fumée mystérieuse'
      },
      {
        id: 'holographic',
        name: 'Holographique',
        preview: '🌈',
        prompt: 'creative product photography, holographic reflections, iridescent colors, futuristic chrome, rainbow light effects, Y2K aesthetic, 8k quality',
        description: 'Effets holographiques Y2K'
      },
      {
        id: 'surreal-float',
        name: 'Surréaliste',
        preview: '🎭',
        prompt: 'surreal product photography, dreamlike composition, impossible physics, floating elements, artistic and abstract, salvador dali inspired, 8k quality',
        description: 'Composition surréaliste'
      }
    ],
    
    // 🍽️ FOOD
    food: [
      {
        id: 'gourmet-dark',
        name: 'Gourmet Dark',
        preview: '🍽️',
        prompt: 'professional food photography, dark moody background, dramatic side lighting, gourmet restaurant style, appetizing, rich colors, michelin star presentation, 8k quality',
        description: 'Style gastronomique sombre'
      },
      {
        id: 'fresh-bright',
        name: 'Fresh & Bright',
        preview: '🥗',
        prompt: 'food photography, bright natural lighting, fresh ingredients, healthy vibes, clean white background, vibrant colors, farm to table aesthetic, 8k quality',
        description: 'Style frais et lumineux'
      },
      {
        id: 'rustic-wood',
        name: 'Rustique',
        preview: '🪵',
        prompt: 'rustic food photography, wooden table surface, natural ingredients around, warm earthy tones, artisanal feel, homemade aesthetic, cozy atmosphere, 8k quality',
        description: 'Style rustique artisanal'
      },
      {
        id: 'splash-drink',
        name: 'Drink Splash',
        preview: '🥤',
        prompt: 'beverage photography, dynamic liquid splash, frozen motion, refreshing feel, droplets and ice, advertising style, crisp and fresh, 8k quality',
        description: 'Boisson avec splash dynamique'
      }
    ],
    
    // 👗 MODE
    fashion: [
      {
        id: 'editorial-high',
        name: 'Editorial',
        preview: '📸',
        prompt: 'high fashion product photography, editorial style, vogue aesthetic, dramatic lighting, artistic composition, runway inspired, avant-garde, 8k quality',
        description: 'Style éditorial magazine'
      },
      {
        id: 'streetwear',
        name: 'Streetwear',
        preview: '🧢',
        prompt: 'streetwear product photography, urban backdrop, concrete textures, hypebeast aesthetic, bold angles, street culture vibes, authentic feel, 8k quality',
        description: 'Style streetwear urbain'
      },
      {
        id: 'minimal-fashion',
        name: 'Mode Minimaliste',
        preview: '🤍',
        prompt: 'minimalist fashion photography, clean scandinavian aesthetic, neutral tones, simple composition, elegant simplicity, timeless style, 8k quality',
        description: 'Style mode épuré'
      }
    ],
    
    // 📱 TECH
    tech: [
      {
        id: 'tech-futuristic',
        name: 'Futuriste',
        preview: '🚀',
        prompt: 'tech product photography, futuristic setting, blue LED accents, sleek and modern, sci-fi aesthetic, holographic elements, cutting-edge feel, 8k quality',
        description: 'Style tech futuriste'
      },
      {
        id: 'tech-minimal',
        name: 'Tech Minimal',
        preview: '⬜',
        prompt: 'minimalist tech photography, clean white surface, soft gradient background, apple style aesthetic, premium feel, simple and elegant, 8k quality',
        description: 'Style Apple minimaliste'
      },
      {
        id: 'tech-workspace',
        name: 'Workspace',
        preview: '💻',
        prompt: 'tech product in workspace setting, modern desk setup, productivity aesthetic, clean organization, professional environment, lifestyle tech, 8k quality',
        description: 'Style bureau moderne'
      }
    ],
    
    // 💄 BEAUTÉ
    beauty: [
      {
        id: 'beauty-glow',
        name: 'Beauty Glow',
        preview: '✨',
        prompt: 'beauty product photography, soft glowing light, dewy fresh aesthetic, pastel tones, skincare vibes, luminous and radiant, spa feeling, 8k quality',
        description: 'Style beauté lumineux'
      },
      {
        id: 'beauty-luxe',
        name: 'Beauté Luxe',
        preview: '💄',
        prompt: 'luxury beauty photography, gold and black accents, rich textures, high-end cosmetics style, glamorous, sophisticated elegance, 8k quality',
        description: 'Style cosmétique luxe'
      },
      {
        id: 'beauty-natural',
        name: 'Beauté Naturelle',
        preview: '🌸',
        prompt: 'natural beauty photography, organic elements, flowers and plants, soft earthy tones, clean beauty aesthetic, botanical vibes, 8k quality',
        description: 'Style beauté naturelle'
      }
    ]
  },
  
  // ============================================
  // MÉTHODES
  // ============================================
  
  // Récupérer tous les templates d'une catégorie
  getByCategory(categoryId) {
    return this.templates[categoryId] || [];
  },
  
  // Récupérer un template par son ID
  getById(templateId) {
    for (const category of Object.values(this.templates)) {
      const template = category.find(t => t.id === templateId);
      if (template) return template;
    }
    return null;
  },
  
  // Récupérer tous les templates
  getAll() {
    const all = [];
    for (const category of Object.values(this.templates)) {
      all.push(...category);
    }
    return all;
  },
  
  // Appliquer un template au prompt utilisateur
  applyTemplate(templateId, userPrompt = '') {
    const template = this.getById(templateId);
    if (!template) return userPrompt;
    
    if (userPrompt.trim()) {
      return `${userPrompt.trim()}, ${template.prompt}`;
    }
    return template.prompt;
  },
  
  // Générer le HTML du sélecteur de templates
  renderSelector(containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `
      <div class="neora-templates">
        <div class="templates-header">
          <span class="templates-icon">✨</span>
          <span class="templates-title">Templates</span>
        </div>
        <div class="templates-categories">
    `;
    
    // Boutons catégories
    this.categories.forEach((cat, index) => {
      html += `
        <button class="template-cat-btn ${index === 0 ? 'active' : ''}" data-category="${cat.id}">
          ${cat.icon}
        </button>
      `;
    });
    
    html += `</div><div class="templates-list" id="templatesList">`;
    
    // Templates de la première catégorie par défaut
    const firstCategory = this.categories[0].id;
    this.templates[firstCategory].forEach(template => {
      html += this._renderTemplateCard(template);
    });
    
    html += `</div></div>`;
    
    container.innerHTML = html;
    
    // Event listeners
    container.querySelectorAll('.template-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Active state
        container.querySelectorAll('.template-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Charger les templates de cette catégorie
        const categoryId = btn.dataset.category;
        const list = container.querySelector('#templatesList');
        list.innerHTML = this.templates[categoryId].map(t => this._renderTemplateCard(t)).join('');
        
        // Re-bind click events
        this._bindTemplateClicks(container, onSelect);
      });
    });
    
    this._bindTemplateClicks(container, onSelect);
  },
  
  _renderTemplateCard(template) {
    return `
      <div class="template-card" data-template-id="${template.id}" title="${template.description}">
        <span class="template-preview">${template.preview}</span>
        <span class="template-name">${template.name}</span>
      </div>
    `;
  },
  
  _bindTemplateClicks(container, onSelect) {
    container.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const templateId = card.dataset.templateId;
        const template = this.getById(templateId);
        if (template && onSelect) {
          onSelect(template);
        }
        
        // Visual feedback
        container.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  },
  
  // Injecter les styles CSS
  injectStyles() {
    if (document.getElementById('neora-templates-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'neora-templates-styles';
    style.textContent = `
      .neora-templates {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 20px;
      }
      
      .templates-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 600;
        font-size: 14px;
        color: rgba(255,255,255,0.9);
      }
      
      .templates-icon {
        font-size: 16px;
      }
      
      .templates-categories {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      
      .template-cat-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .template-cat-btn:hover {
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
      }
      
      .template-cat-btn.active {
        background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3));
        border-color: rgba(139,92,246,0.5);
      }
      
      .templates-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
      }
      
      .template-card {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 12px 10px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
      
      .template-card:hover {
        background: rgba(255,255,255,0.1);
        border-color: rgba(139,92,246,0.4);
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(139,92,246,0.2);
      }
      
      .template-card.selected {
        background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2));
        border-color: rgba(139,92,246,0.6);
      }
      
      .template-preview {
        font-size: 24px;
      }
      
      .template-name {
        font-size: 11px;
        color: rgba(255,255,255,0.7);
        line-height: 1.2;
      }
      
      @media (max-width: 600px) {
        .templates-list {
          grid-template-columns: repeat(3, 1fr);
        }
        .template-name {
          font-size: 10px;
        }
      }
    `;
    document.head.appendChild(style);
  },
  
  // Initialisation facile
  init(containerId, promptInputId) {
    this.injectStyles();
    
    const promptInput = document.getElementById(promptInputId);
    
    this.renderSelector(containerId, (template) => {
      if (promptInput) {
        // Ajouter le template au prompt existant ou le remplacer
        const currentPrompt = promptInput.value.trim();
        
        // Si le prompt contient déjà des tags de style, on les remplace
        const styleKeywords = ['photography', 'lighting', 'background', 'aesthetic', 'quality'];
        const hasStyleTags = styleKeywords.some(kw => currentPrompt.toLowerCase().includes(kw));
        
        if (hasStyleTags || currentPrompt === '') {
          promptInput.value = template.prompt;
        } else {
          promptInput.value = `${currentPrompt}, ${template.prompt}`;
        }
        
        // Focus sur l'input
        promptInput.focus();
        
        // Feedback visuel
        promptInput.style.borderColor = 'rgba(139,92,246,0.6)';
        setTimeout(() => {
          promptInput.style.borderColor = '';
        }, 1000);
      }
    });
  }
};

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeoraTemplates;
}

// Auto-init si l'élément existe
document.addEventListener('DOMContentLoaded', () => {
  // Cherche automatiquement un container de templates
  const container = document.getElementById('promptTemplates');
  const promptInput = document.getElementById('prompt_user') || document.getElementById('prompt');
  
  if (container && promptInput) {
    NeoraTemplates.init('promptTemplates', promptInput.id);
  }
});
