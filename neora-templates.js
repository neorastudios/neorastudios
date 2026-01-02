/**
 * NEORA Prompt Templates - Version avec Images
 * Système de prompts pré-faits avec preview visuel
 */

const NeoraTemplates = {
  
  // ============================================
  // TEMPLATES AVEC IMAGES
  // ============================================
  
  templates: [
    {
      id: 'food-gourmet',
      name: 'Food Gourmet',
      image: 'template-food.jpg',
      prompt: 'gourmet food photography, warm appetizing tones, dripping sauce effect, dramatic studio lighting, commercial food advertising style, bold typography space, 8k quality'
    },
    {
      id: 'sneaker-float',
      name: 'Floating Product',
      image: 'template-sneaker.jpg',
      prompt: 'floating product shot, levitating at dynamic angle, smooth gradient background, minimalist layout, premium commercial style, soft diffused shadows, 8k quality'
    },
    {
      id: 'tech-minimal',
      name: 'Tech Minimal',
      image: 'template-tech.jpg',
      prompt: 'minimalist tech product photography, monochromatic background, large typography behind product, modern apple style aesthetic, clean commercial design, soft studio lighting, 8k quality'
    },
    {
      id: 'old-money',
      name: 'Old Money',
      image: 'template-oldmoney.jpg',
      prompt: 'old money aesthetic, vintage film grain texture, editorial luxury campaign, muted earth tones, elegant serif typography overlay, sophisticated lifestyle, 8k quality'
    },
    {
      id: 'beauty-fresh',
      name: 'Beauty Fresh',
      image: 'template-beauty.jpg',
      prompt: 'fresh cosmetic photography, geometric split background, water droplets texture, hydrating skincare feel, clean clinical aesthetic, pharmaceutical luxury, 8k quality'
    },
    {
      id: 'drink-fresh',
      name: 'Drink Fresh',
      image: 'template-drink.jpg',
      prompt: 'refreshing beverage photography, condensation droplets, fresh fruits flying around, mint leaves, bold typography background, summer fresh feeling, dynamic composition, 8k quality'
    },
    {
      id: 'fun-bold',
      name: 'Fun & Bold',
      image: 'template-bold.jpg',
      prompt: 'bold vibrant advertising, colorful wavy background, energetic dynamic composition, playful bold typography, gen-z style, eye-catching social media ad, 8k quality'
    }
  ],
  
  // ============================================
  // MÉTHODES
  // ============================================
  
  // Récupérer un template par son ID
  getById(templateId) {
    return this.templates.find(t => t.id === templateId) || null;
  },
  
  // Récupérer tous les templates
  getAll() {
    return this.templates;
  },
  
  // Générer le HTML du sélecteur de templates
  renderSelector(containerId, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `
      <div class="neora-templates-v2">
        <div class="templates-header-v2">
          <span class="templates-icon-v2">✨</span>
          <span class="templates-title-v2">Choisis un style</span>
        </div>
        <div class="templates-grid-v2">
    `;
    
    this.templates.forEach(template => {
      html += `
        <div class="template-card-v2" data-template-id="${template.id}" title="${template.name}">
          <div class="template-image-v2">
            <img src="${template.image}" alt="${template.name}" loading="lazy">
            <div class="template-overlay-v2">
              <span class="template-select-btn">Utiliser</span>
            </div>
          </div>
          <span class="template-name-v2">${template.name}</span>
        </div>
      `;
    });
    
    html += `</div></div>`;
    
    container.innerHTML = html;
    
    // Bind click events
    container.querySelectorAll('.template-card-v2').forEach(card => {
      card.addEventListener('click', () => {
        const templateId = card.dataset.templateId;
        const template = this.getById(templateId);
        if (template && onSelect) {
          onSelect(template);
        }
        
        // Visual feedback
        container.querySelectorAll('.template-card-v2').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  },
  
  // Injecter les styles CSS
  injectStyles() {
    if (document.getElementById('neora-templates-v2-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'neora-templates-v2-styles';
    style.textContent = `
      .neora-templates-v2 {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 20px;
      }
      
      .templates-header-v2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-weight: 600;
        font-size: 14px;
        color: rgba(255,255,255,0.9);
      }
      
      .templates-icon-v2 {
        font-size: 16px;
      }
      
      .templates-grid-v2 {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
      }
      
      .template-card-v2 {
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      
      .template-card-v2:hover {
        transform: translateY(-4px);
      }
      
      .template-card-v2:hover .template-overlay-v2 {
        opacity: 1;
      }
      
      .template-card-v2.selected .template-image-v2 {
        border-color: #8b5cf6;
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
      }
      
      .template-card-v2.selected .template-name-v2 {
        color: #8b5cf6;
      }
      
      .template-image-v2 {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        border-radius: 12px;
        overflow: hidden;
        border: 2px solid rgba(255,255,255,0.1);
        transition: all 0.3s ease;
      }
      
      .template-image-v2 img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      
      .template-card-v2:hover .template-image-v2 img {
        transform: scale(1.1);
      }
      
      .template-overlay-v2 {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .template-select-btn {
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        color: white;
        padding: 8px 16px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .template-name-v2 {
        font-size: 12px;
        color: rgba(255,255,255,0.7);
        text-align: center;
        transition: color 0.3s ease;
      }
      
      @media (max-width: 600px) {
        .templates-grid-v2 {
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        
        .template-name-v2 {
          font-size: 10px;
        }
        
        .template-select-btn {
          padding: 6px 12px;
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
        // Remplacer le prompt par celui du template
        promptInput.value = template.prompt;
        
        // Focus sur l'input
        promptInput.focus();
        
        // Feedback visuel
        promptInput.style.borderColor = 'rgba(139,92,246,0.6)';
        promptInput.style.boxShadow = '0 0 20px rgba(139,92,246,0.2)';
        setTimeout(() => {
          promptInput.style.borderColor = '';
          promptInput.style.boxShadow = '';
        }, 1000);
      }
    });
  }
};

// Auto-init si l'élément existe
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('promptTemplates');
  const promptInput = document.getElementById('prompt_user') || document.getElementById('prompt') || document.getElementById('custom_style');
  
  if (container && promptInput) {
    NeoraTemplates.init('promptTemplates', promptInput.id);
  }
});
