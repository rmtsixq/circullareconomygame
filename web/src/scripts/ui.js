import { Game } from './game';
import { SimObject } from './sim/simObject';
import playIconUrl from '/icons/play-color.png';
import pauseIconUrl from '/icons/pause-color.png';

export class GameUI {
  /**
   * Currently selected tool
   * @type {string}
   */
  activeToolId = 'select';
  /**
   * @type {HTMLElement | null }
   */
  selectedControl = document.getElementById('button-select');
  /**
   * True if the game is currently paused
   * @type {boolean}
   */
  isPaused = false;

  get gameWindow() {
    return document.getElementById('render-target');
  }

  showLoadingText() {
    document.getElementById('loading').style.visibility = 'visible';
  }

  hideLoadingText() {
    document.getElementById('loading').style.visibility = 'hidden';
  }
  
  /**
   * 
   * @param {*} event 
   */
  onToolSelected(event) {
    // Find the button element (might be clicked on child element like span or img)
    const button = event.target.closest('.ui-button') || event.currentTarget;
    
    if (!button) {
      console.warn('Button not found in onToolSelected');
      return;
    }
    
    // Check tutorial restrictions
    if (window.tutorialState && window.tutorialState.isActive) {
      const toolType = button.getAttribute('data-type');
      if (toolType && !window.tutorialState.isActionAllowed(toolType)) {
        this.showNotification(
          '🔒 Kilitli',
          'Bu aksiyon tutorial sırasında kilitli.',
          'warning'
        );
        return;
      }
    }
    
    // Deselect previously selected button and selected this one
    if (this.selectedControl) {
      this.selectedControl.classList.remove('selected');
    }
    this.selectedControl = button;
    this.selectedControl.classList.add('selected');

    this.activeToolId = this.selectedControl.getAttribute('data-type');
    
    if (!this.activeToolId) {
      console.warn('No data-type attribute found on button:', button);
    }
  }

  /**
   * Toggles the pause state of the game
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      document.getElementById('pause-button-icon').src = playIconUrl;
      document.getElementById('paused-text').style.visibility = 'visible';
    } else {
      document.getElementById('pause-button-icon').src = pauseIconUrl;
      document.getElementById('paused-text').style.visibility = 'hidden';
    }
  }

  /**
   * Updates the values in the title bar
   * @param {Game} game 
   */
  updateTitleBar(game) {
    document.getElementById('city-name').innerHTML = game.city.name;
    document.getElementById('population-counter').innerHTML = game.city.population;

    const date = new Date('1/1/2023');
    date.setDate(date.getDate() + game.city.simTime);
    document.getElementById('sim-time').innerHTML = date.toLocaleDateString();
    
    // Update game state in title bar
    this.updateGameState(window.gameState);
    
    // Update pollution display only if unlocked (Level 6+)
    if (window.gameState && window.levelUnlocks && 
        window.levelUnlocks.isUnlocked('global-pollution', window.gameState.level)) {
      if (window.globalPollution) {
        this.updatePollutionDisplay();
      }
    } else {
      // Hide pollution display if not unlocked
      const pollutionEl = document.getElementById('pollution-display');
      if (pollutionEl) {
        pollutionEl.style.display = 'none';
      }
    }
    
    // Update toolbar visibility
    this.updateToolbarVisibility();
  }
  
  /**
   * Update global pollution display in title bar
   */
  updatePollutionDisplay() {
    if (!window.globalPollution) return;
    
    // Add pollution indicator to title bar if not exists
    let pollutionEl = document.getElementById('pollution-display');
    if (!pollutionEl) {
      pollutionEl = document.createElement('span');
      pollutionEl.id = 'pollution-display';
      pollutionEl.style.margin = '0 10px';
      const titleBarLeft = document.querySelector('.title-bar-left-items');
      if (titleBarLeft) {
        titleBarLeft.appendChild(pollutionEl);
      }
    }
    
    const pollution = window.globalPollution.totalPollution;
    const level = window.globalPollution.getLevel();
    const color = level === 'maximum' ? '#f44336' : level === 'danger' ? '#ff5722' : level === 'critical' ? '#ff9800' : level === 'warning' ? '#ffc107' : '#4CAF50';
    
    pollutionEl.innerHTML = `<span style="color: ${color};">🌍 ${pollution.toFixed(1)}%</span>`;
    pollutionEl.title = `Şehir Kirliliği: ${pollution.toFixed(1)}%`;
  }

  /**
   * Updates game state display in title bar
   * @param {GameState} gameState 
   */
  updateGameState(gameState) {
    if (!gameState) return;
    
    // Update money display
    const moneyElement = document.getElementById('money-display');
    if (moneyElement) {
      moneyElement.innerHTML = `💰 ${gameState.money.toLocaleString()}`;
    }
    
    // Update energy display
    const energyElement = document.getElementById('energy-display');
    if (energyElement) {
      energyElement.innerHTML = `⚡ ${gameState.energy.toFixed(0)}`;
    }
    
    // Update level display
    const levelElement = document.getElementById('level-display');
    if (levelElement) {
      levelElement.innerHTML = `Level ${gameState.level}`;
    }
    
    // Update XP display
    const xpElement = document.getElementById('xp-display');
    if (xpElement) {
      const progress = gameState.getXPProgress();
      const displayXP = gameState.getDisplayXP();
      xpElement.innerHTML = `XP: ${displayXP} (${progress.toFixed(0)}%)`;
    }
    
    // Update Circular Score display with progress bar
    const scoreBar = document.getElementById('circular-score-bar');
    const scoreText = document.getElementById('circular-score-text');
    
    if (scoreBar && scoreText) {
      const score = gameState.circularScore || 0;
      const maxScore = 100;
      const percentage = Math.min(100, (score / maxScore) * 100);
      
      // Update progress bar width
      scoreBar.style.width = `${percentage}%`;
      
      // Update text
      scoreText.textContent = `${score}/${maxScore}`;
      
      // Update bar color based on score
      if (percentage >= 80) {
        scoreBar.style.background = 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)'; // Green
      } else if (percentage >= 60) {
        scoreBar.style.background = 'linear-gradient(90deg, #8BC34A 0%, #FFC107 100%)'; // Yellow-Green
      } else if (percentage >= 40) {
        scoreBar.style.background = 'linear-gradient(90deg, #FFC107 0%, #FF9800 100%)'; // Yellow-Orange
      } else if (percentage >= 20) {
        scoreBar.style.background = 'linear-gradient(90deg, #FF9800 0%, #FF5722 100%)'; // Orange-Red
      } else {
        scoreBar.style.background = 'linear-gradient(90deg, #FF5722 0%, #f44336 100%)'; // Red
      }
    }
  }

  /**
   * Updates resource display
   * @param {ResourceManager} resourceManager 
   */
  updateResources(resourceManager) {
    if (!resourceManager) return;
    
    // Resource name mappings
    const resourceNames = {
      // Raw Materials
      'raw-fabric': '🧵 Ham Kumaş',
      'raw-plastic': '🧴 Ham Plastik',
      'raw-metal': '🔩 Ham Metal',
      'raw-electronics': '💻 Elektronik',
      'raw-glass': '🪟 Ham Cam',
      
      // Products
      'clothing': '👔 Giyim',
      'sports-gear': '👟 Spor Ekipmanı',
      'smartphone': '📱 Akıllı Telefon',
      'laptop': '💻 Dizüstü Bilgisayar',
      'steel-beam': '🔧 Çelik Kiriş',
      'steel-structure': '🏗️ Çelik Yapı',
      'electric-car': '🚗 Elektrikli Araba',
      'electric-bike': '🚲 Elektrikli Bisiklet',
      'fertilizer': '🌱 Gübre',
      'compost': '🍂 Kompost',
      
      // Waste
      'textile-waste': '🧶 Tekstil Atığı',
      'e-waste': '📟 E-Atık',
      'scrap-metal': '🗑️ Hurda Metal',
      'plastic-waste': '🥤 Plastik Atık',
      'organic-waste': '🥬 Organik Atık',
      
      // Recycled
      'recycled-fabric': '♻️🧵 Geri Dönüşümlü Kumaş',
      'recycled-metal': '♻️🔩 Geri Dönüşümlü Metal',
      'recycled-plastic': '♻️🧴 Geri Dönüşümlü Plastik',
      'recycled-electronics': '♻️💻 Geri Dönüşümlü Elektronik'
    };

    // Update raw materials
    const rawMaterialsList = document.getElementById('raw-materials-list');
    if (rawMaterialsList) {
      rawMaterialsList.innerHTML = '';
      const rawMaterials = ['raw-fabric', 'raw-plastic', 'raw-metal', 'raw-electronics', 'raw-glass'];
      rawMaterials.forEach(type => {
        const amount = resourceManager.getResource(type);
        if (amount > 0 || type.startsWith('raw-')) {
          const item = document.createElement('div');
          item.className = 'resource-item';
          item.innerHTML = `
            <span class="resource-item-name">${resourceNames[type] || type}</span>
            <span class="resource-item-amount">${amount}</span>
          `;
          rawMaterialsList.appendChild(item);
        }
      });
    }

    // Update products
    const productsList = document.getElementById('products-list');
    if (productsList) {
      productsList.innerHTML = '';
      const products = ['clothing', 'sports-gear', 'smartphone', 'laptop', 'steel-beam', 'steel-structure', 'electric-car', 'electric-bike', 'fertilizer', 'compost'];
      products.forEach(type => {
        const amount = resourceManager.getResource(type);
        if (amount > 0) {
          const item = document.createElement('div');
          item.className = 'resource-item';
          item.innerHTML = `
            <span class="resource-item-name">${resourceNames[type] || type}</span>
            <span class="resource-item-amount">${amount}</span>
          `;
          productsList.appendChild(item);
        }
      });
      if (productsList.children.length === 0) {
        productsList.innerHTML = '<div style="padding: 8px; color: #888; font-size: 0.9em;">Henüz ürün yok</div>';
      }
    }

    // Update waste
    const wasteList = document.getElementById('waste-list');
    if (wasteList) {
      wasteList.innerHTML = '';
      const wastes = ['textile-waste', 'e-waste', 'scrap-metal', 'plastic-waste', 'organic-waste'];
      wastes.forEach(type => {
        const amount = resourceManager.getResource(type);
        const limit = resourceManager.limits[type] || 0;
        const percentage = limit > 0 ? (amount / limit) * 100 : 0;
        const color = percentage > 80 ? '#ff6666' : percentage > 50 ? '#ffaa66' : '#ffffff';
        
        const item = document.createElement('div');
        item.className = 'resource-item';
        item.innerHTML = `
          <span class="resource-item-name">${resourceNames[type] || type}</span>
          <span class="resource-item-amount" style="color: ${color}">${amount}${limit > 0 ? `/${limit}` : ''}</span>
        `;
        wasteList.appendChild(item);
      });
    }

    // Update recycled
    const recycledList = document.getElementById('recycled-list');
    if (recycledList) {
      recycledList.innerHTML = '';
      const recycled = ['recycled-fabric', 'recycled-metal', 'recycled-plastic', 'recycled-electronics'];
      recycled.forEach(type => {
        const amount = resourceManager.getResource(type);
        if (amount > 0) {
          const item = document.createElement('div');
          item.className = 'resource-item';
          item.innerHTML = `
            <span class="resource-item-name">${resourceNames[type] || type}</span>
            <span class="resource-item-amount">${amount}</span>
          `;
          recycledList.appendChild(item);
        }
      });
      if (recycledList.children.length === 0) {
        recycledList.innerHTML = '<div style="padding: 8px; color: #888; font-size: 0.9em;">Henüz geri dönüşüm yok</div>';
      }
    }
  }

  /**
   * Toggle resource panel visibility
   */
  toggleResourcePanel() {
    const panel = document.getElementById('resource-panel');
    const button = document.getElementById('button-resources');
    
    if (panel) {
      const isHidden = panel.style.display === 'none';
      panel.style.display = isHidden ? 'block' : 'none';
      
      // Update button state
      if (button) {
        if (isHidden) {
          button.classList.add('selected');
        } else {
          button.classList.remove('selected');
        }
      }
    }
  }

  /**
   * Initialize resource panel drag functionality
   */
  initResourcePanelDrag() {
    const panel = document.getElementById('resource-panel');
    const header = panel?.querySelector('.panel-header');
    const button = document.getElementById('button-resources');
    
    if (!panel || !header) return;
    
    // Set initial state - panel hidden, button not selected
    panel.style.display = 'none';
    if (button) {
      button.classList.remove('selected');
    }

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
      if (e.target.classList.contains('panel-close')) return;
      
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    }
  }

  /**
   * Updates the info panel with the information in the object
   * @param {SimObject} object 
   */
  updateInfoPanel(object) {
    const infoElement = document.getElementById('info-panel')
    if (!infoElement) {
      console.error('Info panel element not found!');
      return;
    }
    
    if (object) {
      console.log('Updating info panel for:', object.name, 'isPlayerHouse:', object.isPlayerHouse);
      infoElement.style.visibility = 'visible';
      infoElement.style.display = 'block';
      const html = object.toHTML();
      console.log('Generated HTML length:', html.length);
      infoElement.innerHTML = html;
      
      // Re-attach event listeners for player house buttons
      if (object.isPlayerHouse) {
        this.attachPlayerHouseButtonListeners();
      }
    } else {
      infoElement.style.visibility = 'hidden';
      infoElement.style.display = 'none';
      infoElement.innerHTML = '';
    }
  }

  /**
   * Attach event listeners for player house buttons
   */
  attachPlayerHouseButtonListeners() {
    // Butonlar innerHTML ile eklendiği için event listener'ları yeniden eklemeliyiz
    // Ancak onclick attribute'ları zaten HTML'de olduğu için çalışmalı
    // Sadece kontrol edelim
  }

  /**
   * Open trade panel (harita üzerinde floating)
   */
  openTradePanel() {
    this.closeAllPanels();
    const panel = this.getOrCreatePanel('trade-panel', '💱 Takas & Pazar');
    panel.style.width = '400px';
    const content = panel.querySelector('.panel-content') || document.createElement('div');
    content.className = 'panel-content';
    content.innerHTML = `
      <div style="padding: 8px; max-height: 600px; overflow-y: auto;">
        <div class="resource-section-title">🔄 Kaynak Takası</div>
        <div style="padding: 8px; color: #888; font-size: 0.9em; margin-bottom: 12px;">
          Kaynaklarınızı birbiriyle takas edin
        </div>
        <div style="padding: 8px;">
          <div class="resource-section-title">Takas Edilecek Kaynak</div>
          <select id="trade-resource-from" class="trade-select" style="width: 100%; padding: 4px; margin-bottom: 8px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;">
            <option value="">Kaynak seçin...</option>
          </select>
          <input type="number" id="trade-amount-from" placeholder="Miktar" min="1" 
            style="width: 100%; padding: 4px; margin-bottom: 8px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;">
          <div style="text-align: center; margin: 8px 0; font-size: 1.5em;">⇄</div>
          <div class="resource-section-title">Karşılığında Alınacak</div>
          <select id="trade-resource-to" class="trade-select" style="width: 100%; padding: 4px; margin-bottom: 8px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;">
            <option value="">Kaynak seçin...</option>
          </select>
          <input type="number" id="trade-amount-to" placeholder="Miktar" min="1" 
            style="width: 100%; padding: 4px; margin-bottom: 8px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;">
          <button class="action-button" onclick="ui.executeTrade()" style="width: 100%; margin-top: 8px;">
            Takas Yap
          </button>
        </div>
        
        <div class="resource-section-title" style="margin-top: 16px;">🌍 Dış Pazar</div>
        <div style="padding: 8px; color: #888; font-size: 0.9em; margin-bottom: 12px;">
          Şehir dışı dünya ile ticaret yapın
        </div>
        <div style="padding: 8px;">
          <div class="resource-section-title">Sat</div>
          <div id="market-sell-list" class="resource-list" style="max-height: 150px; overflow-y: auto;"></div>
          <div class="resource-section-title" style="margin-top: 12px;">Satın Al</div>
          <div id="market-buy-list" class="resource-list" style="max-height: 150px; overflow-y: auto;"></div>
        </div>
      </div>
    `;
    if (!panel.querySelector('.panel-content')) {
      panel.appendChild(content);
    } else {
      panel.replaceChild(content, panel.querySelector('.panel-content'));
    }
    this.populateTradeSelects();
    this.updateMarketLists();
    panel.style.display = 'block';
  }

  /**
   * Update market buy/sell lists
   */
  updateMarketLists() {
    if (!window.resourceManager) return;
    
    const sellList = document.getElementById('market-sell-list');
    const buyList = document.getElementById('market-buy-list');
    
    if (!sellList || !buyList) return;
    
    // Sell list - show resources player can sell
    sellList.innerHTML = '';
    const sellableResources = {
      'clothing': { price: 50, name: '🧵 Kıyafet' },
      'smartphone': { price: 200, name: '📱 Akıllı Telefon' },
      'laptop': { price: 500, name: '💻 Laptop' },
      'steel-beam': { price: 100, name: '🔩 Çelik Kiriş' },
      'electric-car': { price: 5000, name: '🚗 Elektrikli Araba' },
      'recycled-fabric': { price: 30, name: '♻️🧵 Geri Dönüşümlü Kumaş' },
      'recycled-metal': { price: 40, name: '♻️🔩 Geri Dönüşümlü Metal' },
      'recycled-plastic': { price: 25, name: '♻️🧴 Geri Dönüşümlü Plastik' }
    };
    
    Object.entries(sellableResources).forEach(([resource, info]) => {
      const amount = window.resourceManager.getResource(resource);
      if (amount > 0) {
        const item = document.createElement('div');
        item.className = 'resource-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.style.padding = '4px 8px';
        item.style.margin = '2px 0';
        item.style.backgroundColor = '#22294160';
        item.style.borderRadius = '4px';
        item.innerHTML = `
          <span>${info.name}: ${amount.toFixed(1)}</span>
          <div>
            <span style="color: #4CAF50; margin-right: 8px;">${info.price} 💰/birim</span>
            <button class="action-button" onclick="ui.sellResource('${resource}', 1)" style="padding: 2px 8px; font-size: 0.85em;">
              Sat
            </button>
          </div>
        `;
        sellList.appendChild(item);
      }
    });
    
    if (sellList.children.length === 0) {
      sellList.innerHTML = '<div style="padding: 8px; color: #888; font-size: 0.9em;">Satılacak ürün yok</div>';
    }
    
    // Buy list - show resources player can buy
    buyList.innerHTML = '';
    const buyableResources = {
      'raw-fabric': { price: 20, name: '🧵 Ham Kumaş' },
      'raw-plastic': { price: 15, name: '🧴 Ham Plastik' },
      'raw-metal': { price: 25, name: '🔩 Ham Metal' },
      'raw-electronics': { price: 30, name: '💻 Ham Elektronik' },
      'textile-waste': { price: 5, name: '🧵 Tekstil Atığı' },
      'e-waste': { price: 8, name: '💻 E-Atık' },
      'scrap-metal': { price: 10, name: '🔩 Hurda Metal' }
    };
    
    Object.entries(buyableResources).forEach(([resource, info]) => {
      const item = document.createElement('div');
      item.className = 'resource-item';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '4px 8px';
      item.style.margin = '2px 0';
      item.style.backgroundColor = '#22294160';
      item.style.borderRadius = '4px';
      item.innerHTML = `
        <span>${info.name}</span>
        <div>
          <span style="color: #FF9800; margin-right: 8px;">${info.price} 💰/birim</span>
          <button class="action-button" onclick="ui.buyResource('${resource}', 1)" style="padding: 2px 8px; font-size: 0.85em;">
            Al
          </button>
        </div>
      `;
      buyList.appendChild(item);
    });
  }

  /**
   * Sell resource to market
   */
  sellResource(resourceType, amount) {
    if (!window.resourceManager || !window.gameState) return;
    
    const prices = {
      'clothing': 50,
      'smartphone': 200,
      'laptop': 500,
      'steel-beam': 100,
      'electric-car': 5000,
      'recycled-fabric': 30,
      'recycled-metal': 40,
      'recycled-plastic': 25
    };
    
    const price = prices[resourceType];
    if (!price) return;
    
    const available = window.resourceManager.getResource(resourceType);
    const sellAmount = Math.min(amount, available);
    
    if (sellAmount > 0 && window.resourceManager.removeResource(resourceType, sellAmount)) {
      const totalPrice = sellAmount * price;
      window.gameState.addMoney(totalPrice);
      this.updateMarketLists();
      this.updateResources(window.resourceManager);
      this.updateGameState(window.gameState);
    }
  }

  /**
   * Buy resource from market
   */
  buyResource(resourceType, amount) {
    if (!window.resourceManager || !window.gameState) return;
    
    const prices = {
      'raw-fabric': 20,
      'raw-plastic': 15,
      'raw-metal': 25,
      'raw-electronics': 30,
      'textile-waste': 5,
      'e-waste': 8,
      'scrap-metal': 10
    };
    
    const price = prices[resourceType];
    if (!price) return;
    
    const totalCost = amount * price;
    
    if (window.gameState.spendMoney(totalCost)) {
      window.resourceManager.addResource(resourceType, amount);
      this.updateMarketLists();
      this.updateResources(window.resourceManager);
      this.updateGameState(window.gameState);
    } else {
      console.warn('Yetersiz para!');
    }
  }

  /**
   * Open market panel
   */
  openMarketPanel() {
    this.closeAllPanels();
    const panel = this.getOrCreatePanel('market-panel', '🛒 Pazar');
    panel.style.width = '450px';
    const content = panel.querySelector('.panel-content') || document.createElement('div');
    content.className = 'panel-content';
    
    const level = window.gameState?.level || 1;
    const autoBuyUnlocked = window.levelUnlocks && window.levelUnlocks.isUnlocked('auto-buy', level);
    
    content.innerHTML = `
      <div style="padding: 8px; max-height: 600px; overflow-y: auto;">
        <div style="padding: 8px; margin-bottom: 12px; background: #1e3a2e; border-radius: 4px; border: 1px solid #4CAF50;">
          <div style="color: #4CAF50; font-weight: bold; margin-bottom: 4px;">✅ Otomatik Satış Aktif</div>
          <div style="color: #aaa; font-size: 0.9em;">Üretilen ürünler otomatik olarak satılıyor. Manuel satış yok.</div>
        </div>
        
        ${autoBuyUnlocked ? `
          <div style="padding: 8px; margin-bottom: 12px; background: #1e3a2e; border-radius: 4px; border: 1px solid #4CAF50;">
            <div style="color: #4CAF50; font-weight: bold; margin-bottom: 4px;">✅ Otomatik Satın Alma Aktif</div>
            <div style="color: #aaa; font-size: 0.9em;">Eksik hammaddeler otomatik olarak satın alınıyor.</div>
          </div>
        ` : `
          <div style="padding: 8px; margin-bottom: 12px; background: #2a2a2a; border-radius: 4px; border: 1px solid #555;">
            <div style="color: #888; font-weight: bold; margin-bottom: 4px;">🔒 Otomatik Satın Alma (Seviye 3)</div>
            <div style="color: #666; font-size: 0.9em;">Seviye 3'te otomatik satın alma açılacak.</div>
          </div>
        `}
        
        <div class="resource-section-title">📦 Ürünler (Otomatik Satılıyor)</div>
        <div id="market-sell-list" class="resource-list" style="max-height: 200px; overflow-y: auto;"></div>
        <div style="padding: 8px; color: #888; font-size: 0.85em; margin-top: 8px;">
          Ürünler otomatik olarak satılıyor. Manuel satış yapılamaz.
        </div>
        
        <div class="resource-section-title" style="margin-top: 12px;">🛒 Hammaddeler Satın Al</div>
        <div id="market-buy-list" class="resource-list" style="max-height: 200px; overflow-y: auto;"></div>
      </div>
    `;
    if (!panel.querySelector('.panel-content')) {
      panel.appendChild(content);
    } else {
      panel.replaceChild(content, panel.querySelector('.panel-content'));
    }
    panel.style.display = 'block';
    
    // Update market lists
    this.updateMarketLists();
  }
  
  /**
   * Update market buy/sell lists
   */
  updateMarketLists() {
    if (!window.market || !window.resourceManager) return;
    
    // Update sell list (products)
    const sellList = document.getElementById('market-sell-list');
    if (sellList) {
      sellList.innerHTML = '';
      const products = ['clothing', 'sports-gear', 'smartphone', 'laptop', 'steel-beam', 'steel-structure', 'electric-bike', 'electric-car', 'fertilizer', 'compost'];
      const productNames = {
        'clothing': '👕 Kıyafet',
        'sports-gear': '⚽ Spor Ekipmanı',
        'smartphone': '📱 Akıllı Telefon',
        'laptop': '💻 Laptop',
        'steel-beam': '🔩 Çelik Kiriş',
        'steel-structure': '🏗️ Çelik Yapı',
        'electric-bike': '🚲 Elektrikli Bisiklet',
        'electric-car': '🚗 Elektrikli Araba',
        'fertilizer': '🌾 Gübre',
        'compost': '♻️ Kompost'
      };
      
      products.forEach(product => {
        const amount = window.resourceManager.getResource(product);
        if (amount > 0) {
          const price = window.market.getProductPrice(product);
          const item = document.createElement('div');
          item.className = 'resource-item';
          item.style.padding = '8px';
          item.style.marginBottom = '4px';
          item.style.backgroundColor = '#22294160';
          item.style.borderRadius = '4px';
          item.style.display = 'flex';
          item.style.justifyContent = 'space-between';
          item.style.alignItems = 'center';
          item.innerHTML = `
            <div>
              <div style="font-weight: bold;">${productNames[product] || product}</div>
              <div style="font-size: 0.85em; color: #888;">Miktar: ${amount.toFixed(1)}</div>
            </div>
            <div style="text-align: right;">
              <div style="color: #4CAF50; font-weight: bold;">${price.toFixed(0)} 💰/birim</div>
              <div style="color: #4CAF50; font-size: 0.85em; margin-top: 4px;">Otomatik satılıyor</div>
            </div>
          `;
          sellList.appendChild(item);
        }
      });
      
      if (sellList.children.length === 0) {
        sellList.innerHTML = '<div style="padding: 8px; color: #888; font-size: 0.9em;">Satılacak ürün yok</div>';
      }
    }
    
    // Update buy list (raw materials)
    const buyList = document.getElementById('market-buy-list');
    if (buyList) {
      buyList.innerHTML = '';
      const materials = ['raw-fabric', 'raw-plastic', 'raw-metal', 'raw-electronics', 'raw-glass'];
      const materialNames = {
        'raw-fabric': '🧵 Ham Kumaş',
        'raw-plastic': '🧴 Ham Plastik',
        'raw-metal': '🔩 Ham Metal',
        'raw-electronics': '💻 Ham Elektronik',
        'raw-glass': '🪟 Ham Cam'
      };
      
      materials.forEach(material => {
        const price = window.market.getMaterialPrice(material);
        const item = document.createElement('div');
        item.className = 'resource-item';
        item.style.padding = '8px';
        item.style.marginBottom = '4px';
        item.style.backgroundColor = '#22294160';
        item.style.borderRadius = '4px';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.innerHTML = `
          <div>
            <div style="font-weight: bold;">${materialNames[material] || material}</div>
            <div style="font-size: 0.85em; color: #888;">Mevcut: ${window.resourceManager.getResource(material).toFixed(1)}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: #FF9800; font-weight: bold;">${price.toFixed(0)} 💰/birim</div>
            <button class="action-button" onclick="ui.buyMaterial('${material}', 1)" style="padding: 4px 12px; font-size: 0.85em; margin-top: 4px;">
              Al (1)
            </button>
          </div>
        `;
        buyList.appendChild(item);
      });
    }
  }
  
  /**
   * Sell product manually
   */
  sellProduct(product, amount) {
    if (!window.market || !window.resourceManager || !window.gameState) return;
    
    const earned = window.market.sellProduct(product, amount, window.resourceManager, window.gameState);
    if (earned > 0) {
      this.updateMarketLists();
      this.updateResources(window.resourceManager);
      this.updateGameState(window.gameState);
      this.showNotification('💰 Satış', `${amount} ${product} satıldı: ${earned.toFixed(0)} 💰`, 'success');
    }
  }
  
  /**
   * Buy material manually
   */
  buyMaterial(material, amount) {
    if (!window.market || !window.resourceManager || !window.gameState) return;
    
    const success = window.market.buyMaterial(material, amount, window.resourceManager, window.gameState);
    if (success) {
      this.updateMarketLists();
      this.updateResources(window.resourceManager);
      this.updateGameState(window.gameState);
      const price = window.market.getMaterialPrice(material);
      this.showNotification('Satın Alındı', `${amount} ${material} satın alındı: ${(amount * price).toFixed(0)} 💰`, 'success');
      // Refresh material shop if open
      if (document.getElementById('material-shop-panel')?.style.display === 'block') {
        this.openMaterialShop();
      }
    } else {
      this.showNotification('Hata', 'Yetersiz para veya geçersiz işlem', 'error');
    }
  }

  /**
   * Open settings panel (Global Policies)
   */
  openSettingsPanel() {
    this.closeAllPanels();
    const panel = this.getOrCreatePanel('settings-panel', '⚙️ Şehir Politikaları');
    const content = panel.querySelector('.panel-content') || document.createElement('div');
    content.className = 'panel-content';
    
    const policies = window.cityPolicies || { recyclingPriority: 50, energyPolicy: 'balanced', productionEnvironmentBalance: 50, autoSave: true, autoSaveInterval: 30 };
    
    content.innerHTML = `
        <div style="padding: 8px; max-height: 600px; overflow-y: auto;">
          <div class="resource-section-title">♻️ Geri Dönüşüm Önceliği</div>
          <div style="padding: 8px;">
            <input type="range" id="recycling-priority" min="0" max="100" value="${policies.recyclingPriority || 50}" 
              style="width: 100%;" oninput="ui.updateRecyclingPriority(this.value)">
            <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.85em; color: #aaa;">
              <span>Düşük</span>
              <span id="recycling-priority-value">${policies.recyclingPriority || 50}%</span>
              <span>Yüksek</span>
            </div>
          </div>
          
          <div class="resource-section-title" style="margin-top: 12px;">⚡ Enerji Politikası</div>
          <div style="padding: 8px;">
            <select id="energy-policy" style="width: 100%; padding: 4px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;"
              onchange="ui.updateEnergyPolicy(this.value)">
              <option value="balanced" ${policies.energyPolicy === 'balanced' ? 'selected' : ''}>Dengeli</option>
              <option value="efficiency" ${policies.energyPolicy === 'efficiency' ? 'selected' : ''}>Verim Odaklı (-10% tüketim)</option>
              <option value="green" ${policies.energyPolicy === 'green' ? 'selected' : ''}>Yeşil Öncelikli (+10% tüketim, +çevre)</option>
            </select>
          </div>
          
          ${window.gameState && window.levelUnlocks && window.levelUnlocks.isUnlocked('hq-policy-panel', window.gameState.level) ? `
          <div class="resource-section-title" style="margin-top: 12px;">🏭 Üretim Öncelik Politikası</div>
          <div style="padding: 8px;">
            <select id="production-mode" style="width: 100%; padding: 4px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;"
              onchange="ui.updateProductionMode(this.value)">
              <option value="balanced" ${policies.productionMode === 'balanced' ? 'selected' : ''}>🟢 Dengeli (Normal üretim, normal atık)</option>
              <option value="economy" ${policies.productionMode === 'economy' ? 'selected' : ''}>🟡 Ekonomi Odaklı (+20% üretim, +25% atık, -10% Circular Score)</option>
              <option value="environment" ${policies.productionMode === 'environment' ? 'selected' : ''}>🔵 Çevre Odaklı (-15% üretim, -30% atık, +10% Circular Score)</option>
            </select>
          </div>
          
          <div class="resource-section-title" style="margin-top: 12px;">💱 Otomatik Satış Politikası</div>
          <div style="padding: 8px;">
            <select id="sales-policy" style="width: 100%; padding: 4px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;"
              onchange="ui.updateSalesPolicy(this.value)">
              <option value="auto" ${policies.salesPolicy === 'auto' ? 'selected' : ''}>🔁 Otomatik Sat (Eco Shop varsa premium, yoksa market)</option>
              <option value="store" ${policies.salesPolicy === 'store' ? 'selected' : ''}>📦 Depola (Hiç satma, manuel kontrol)</option>
              <option value="smart" ${policies.salesPolicy === 'smart' ? 'selected' : ''}>⚖️ Akıllı Satış (Stok %70+ ise sat, enerji fazlaysa üret&sat)</option>
            </select>
          </div>
          
          <div class="resource-section-title" style="margin-top: 12px;">💰 Vergi & Ticaret Politikası</div>
          <div style="padding: 8px;">
            <select id="tax-policy" style="width: 100%; padding: 4px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;"
              onchange="ui.updateTaxPolicy(this.value)">
              <option value="low" ${policies.taxPolicy === 'low' ? 'selected' : ''}>🟢 Düşük (Normal para, +nüfus artışı)</option>
              <option value="medium" ${policies.taxPolicy === 'medium' ? 'selected' : ''}>🟡 Orta (Normal para, stabil nüfus)</option>
              <option value="high" ${policies.taxPolicy === 'high' ? 'selected' : ''}>🔴 Yüksek (+25% para, nüfus artmaz, +atık)</option>
            </select>
          </div>
          
          <div class="resource-section-title" style="margin-top: 12px;">👷 İş Gücü Dağıtımı</div>
          <div style="padding: 8px;">
            <div style="margin-bottom: 8px;">
              <label style="color: white; font-size: 0.9em;">🏭 Fabrikalar</label>
              <input type="range" id="workforce-factories" min="0" max="100" value="${policies.workforceDistribution?.factories || 60}" 
                style="width: 100%;" oninput="ui.updateWorkforceDistribution()">
              <span id="workforce-factories-value" style="color: #aaa; font-size: 0.85em;">${policies.workforceDistribution?.factories || 60}%</span>
            </div>
            <div style="margin-bottom: 8px;">
              <label style="color: white; font-size: 0.9em;">♻️ Geri Dönüşüm</label>
              <input type="range" id="workforce-recycling" min="0" max="100" value="${policies.workforceDistribution?.recycling || 20}" 
                style="width: 100%;" oninput="ui.updateWorkforceDistribution()">
              <span id="workforce-recycling-value" style="color: #aaa; font-size: 0.85em;">${policies.workforceDistribution?.recycling || 20}%</span>
            </div>
            <div style="margin-bottom: 8px;">
              <label style="color: white; font-size: 0.9em;">🏪 Ticaret</label>
              <input type="range" id="workforce-commercial" min="0" max="100" value="${policies.workforceDistribution?.commercial || 20}" 
                style="width: 100%;" oninput="ui.updateWorkforceDistribution()">
              <span id="workforce-commercial-value" style="color: #aaa; font-size: 0.85em;">${policies.workforceDistribution?.commercial || 20}%</span>
            </div>
            <div style="margin-top: 8px; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; font-size: 0.85em; color: #aaa;">
              <strong style="color: white;">Toplam:</strong> <span id="workforce-total">${(policies.workforceDistribution?.factories || 60) + (policies.workforceDistribution?.recycling || 20) + (policies.workforceDistribution?.commercial || 20)}%</span>
              <div style="margin-top: 4px; font-size: 0.8em; color: #ff9800;">⚠️ Toplam 100% olmalı. Bir slider değiştiğinde diğerleri otomatik ayarlanır.</div>
            </div>
          </div>
          
          <div class="resource-section-title" style="margin-top: 12px;">⚡ Enerji Ticaret Modu</div>
          <div style="padding: 8px;">
            <select id="energy-trade-mode" style="width: 100%; padding: 4px; background: #1e2331; color: white; border: 1px solid #333; border-radius: 4px;"
              onchange="ui.updateEnergyTradeMode(this.value)">
              <option value="none" ${policies.energyTradeMode === 'none' ? 'selected' : ''}>❌ Satma (Enerji fazlası kullanılmaz)</option>
              <option value="sell" ${policies.energyTradeMode === 'sell' ? 'selected' : ''}>💰 Sat (Fazla enerjiyi düşük fiyata sat)</option>
              <option value="store" ${policies.energyTradeMode === 'store' ? 'selected' : ''}>🔋 Depola (Gelecek feature)</option>
            </select>
          </div>
          ` : ''}
          
          <div class="resource-section-title" style="margin-top: 12px;">🏭 Üretim vs Çevre Dengesi</div>
          <div style="padding: 8px;">
            <input type="range" id="production-balance" min="0" max="100" value="${policies.productionEnvironmentBalance || 50}" 
              style="width: 100%;" oninput="ui.updateProductionBalance(this.value)">
            <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.85em; color: #aaa;">
              <span>Üretim</span>
              <span id="production-balance-value">${policies.productionEnvironmentBalance || 50}%</span>
              <span>Çevre</span>
            </div>
          </div>
          
          <div class="resource-section-title" style="margin-top: 12px;">⚡ Enerji Kriz Modu</div>
          <div style="padding: 8px; font-size: 0.9em; color: #aaa;">
            Enerji azaldığında öncelik sırası:
            <ol style="margin: 8px 0; padding-left: 20px; color: white;">
              <li>♻️ Geri Dönüşüm</li>
              <li>🏭 Fabrikalar</li>
              <li>🏠 Konutlar</li>
              <li>🏪 Ticari</li>
            </ol>
          </div>
          
          <div class="resource-section-title" style="margin-top: 12px;">💾 Oyun Ayarları</div>
          <div style="margin: 8px 0;">
            <label style="color: white; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="auto-save" ${policies.autoSave ? 'checked' : ''} onchange="ui.updateAutoSave(this.checked)">
              Otomatik Kayıt (${policies.autoSaveInterval || 30} saniye)
            </label>
          </div>
          <div style="margin: 8px 0;">
            <label style="color: white; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="show-effects" checked>
              Görsel Efektler
            </label>
          </div>
          <div style="margin-top: 12px;">
            <button class="action-button" onclick="ui.saveGame()" style="width: 100%; margin-bottom: 4px;">
              💾 Oyunu Kaydet
            </button>
            <button class="action-button" onclick="ui.loadGame()" style="width: 100%;">
              📂 Oyunu Yükle
            </button>
          </div>
        </div>
    `;
    if (!panel.querySelector('.panel-content')) {
      panel.appendChild(content);
    } else {
      panel.replaceChild(content, panel.querySelector('.panel-content'));
    }
    panel.style.display = 'block';
  }

  /**
   * Update recycling priority
   */
  updateRecyclingPriority(value) {
    if (window.cityPolicies) {
      window.cityPolicies.recyclingPriority = parseInt(value);
      const valueEl = document.getElementById('recycling-priority-value');
      if (valueEl) valueEl.textContent = value + '%';
    }
  }

  /**
   * Update energy policy
   */
  updateEnergyPolicy(value) {
    if (window.cityPolicies) {
      window.cityPolicies.energyPolicy = value;
    }
  }

  /**
   * Update production balance
   */
  updateProductionBalance(value) {
    if (window.cityPolicies) {
      window.cityPolicies.productionEnvironmentBalance = parseInt(value);
      const valueEl = document.getElementById('production-balance-value');
      if (valueEl) valueEl.textContent = value + '%';
    }
  }

  /**
   * Update auto-save setting
   */
  updateAutoSave(enabled) {
    if (window.cityPolicies) {
      window.cityPolicies.autoSave = enabled;
    }
  }

  /**
   * Update production mode
   */
  updateProductionMode(value) {
    if (window.cityPolicies) {
      window.cityPolicies.productionMode = value;
    }
  }

  /**
   * Update sales policy
   */
  updateSalesPolicy(value) {
    if (window.cityPolicies) {
      window.cityPolicies.salesPolicy = value;
    }
  }

  /**
   * Update tax policy
   */
  updateTaxPolicy(value) {
    if (window.cityPolicies) {
      window.cityPolicies.taxPolicy = value;
    }
  }

  /**
   * Update energy trade mode
   */
  updateEnergyTradeMode(value) {
    if (window.cityPolicies) {
      window.cityPolicies.energyTradeMode = value;
    }
  }

  /**
   * Update workforce distribution (ensures total = 100)
   */
  updateWorkforceDistribution() {
    if (!window.cityPolicies) return;

    const factoriesEl = document.getElementById('workforce-factories');
    const recyclingEl = document.getElementById('workforce-recycling');
    const commercialEl = document.getElementById('workforce-commercial');

    if (!factoriesEl || !recyclingEl || !commercialEl) return;

    let factories = parseInt(factoriesEl.value) || 0;
    let recycling = parseInt(recyclingEl.value) || 0;
    let commercial = parseInt(commercialEl.value) || 0;

    const total = factories + recycling + commercial;

    // If total exceeds 100, normalize to 100
    if (total > 100) {
      const ratio = 100 / total;
      factories = Math.round(factories * ratio);
      recycling = Math.round(recycling * ratio);
      commercial = Math.round(commercial * ratio);
      
      // Ensure total is exactly 100 (adjust for rounding)
      const newTotal = factories + recycling + commercial;
      const diff = 100 - newTotal;
      if (diff !== 0) {
        // Add difference to largest value
        if (factories >= recycling && factories >= commercial) {
          factories += diff;
        } else if (recycling >= commercial) {
          recycling += diff;
        } else {
          commercial += diff;
        }
      }

      factoriesEl.value = factories;
      recyclingEl.value = recycling;
      commercialEl.value = commercial;
    }

    // Update city policies
    window.cityPolicies.workforceDistribution = {
      factories: factories,
      recycling: recycling,
      commercial: commercial
    };

    // Update display values
    const factoriesValueEl = document.getElementById('workforce-factories-value');
    const recyclingValueEl = document.getElementById('workforce-recycling-value');
    const commercialValueEl = document.getElementById('workforce-commercial-value');
    const totalValueEl = document.getElementById('workforce-total');

    if (factoriesValueEl) factoriesValueEl.textContent = factories + '%';
    if (recyclingValueEl) recyclingValueEl.textContent = recycling + '%';
    if (commercialValueEl) commercialValueEl.textContent = commercial + '%';
    if (totalValueEl) totalValueEl.textContent = (factories + recycling + commercial) + '%';
  }

  /**
   * Open inventory panel (kaynak panelini göster)
   */
  openInventoryPanel() {
    this.toggleResourcePanel();
  }

  /**
   * Open material shop panel (ham madde satın alma)
   */
  openMaterialShop() {
    this.closeAllPanels();
    const panel = this.getOrCreatePanel('material-shop-panel', 'Ham Madde Satın Al');
    panel.style.width = '400px';
    const content = panel.querySelector('.panel-content') || document.createElement('div');
    content.className = 'panel-content';
    
    if (!window.market || !window.resourceManager || !window.gameState) {
      const missing = [];
      if (!window.market) missing.push('Market');
      if (!window.resourceManager) missing.push('ResourceManager');
      if (!window.gameState) missing.push('GameState');
      content.innerHTML = `<div style="padding: 8px; color: #ff9800;">⚠️ Sistem yükleniyor... (Eksik: ${missing.join(', ')})</div>`;
      if (!panel.querySelector('.panel-content')) {
        panel.appendChild(content);
      }
      panel.style.display = 'block';
      return;
    }

    // Check if getMaterialPrice method exists
    if (typeof window.market.getMaterialPrice !== 'function') {
      content.innerHTML = '<div style="padding: 8px; color: #f44336;">❌ Market sistemi hatası: getMaterialPrice metodu bulunamadı</div>';
      if (!panel.querySelector('.panel-content')) {
        panel.appendChild(content);
      }
      panel.style.display = 'block';
      return;
    }

    const rawMaterials = {
      'raw-fabric': 'Ham Kumaş',
      'raw-plastic': 'Ham Plastik',
      'raw-metal': 'Ham Metal',
      'raw-electronics': 'Elektronik',
      'raw-glass': 'Ham Cam'
    };

    let materialsHTML = '';
    Object.entries(rawMaterials).forEach(([type, name]) => {
      let price = 0;
      try {
        price = window.market.getMaterialPrice(type);
      } catch (error) {
        console.error(`Error getting price for ${type}:`, error);
        price = window.market.rawMaterialPrices?.[type] || 0;
      }
      const current = window.resourceManager.getResource(type) || 0;
      const canAfford1 = window.gameState.money >= price;
      const canAfford10 = window.gameState.money >= (price * 10);
      const canAfford50 = window.gameState.money >= (price * 50);
      
      materialsHTML += `
        <div style="padding: 8px; margin-bottom: 8px; background: #1e2331; border-radius: 4px; border: 1px solid #333;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-weight: bold;">${name}</span>
            <span style="color: #aaa; font-size: 0.9em;">Mevcut: ${current.toFixed(0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="color: #4CAF50;">Fiyat: ${price.toFixed(0)} 💰</span>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="action-button" onclick="ui.buyMaterial('${type}', 1)" 
              style="flex: 1; padding: 4px; font-size: 0.85em; ${!canAfford1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
              ${!canAfford1 ? 'disabled' : ''}>
              1 Adet (${price.toFixed(0)} 💰)
            </button>
            <button class="action-button" onclick="ui.buyMaterial('${type}', 10)" 
              style="flex: 1; padding: 4px; font-size: 0.85em; ${!canAfford10 ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
              ${!canAfford10 ? 'disabled' : ''}>
              10 Adet (${(price * 10).toFixed(0)} 💰)
            </button>
            <button class="action-button" onclick="ui.buyMaterial('${type}', 50)" 
              style="flex: 1; padding: 4px; font-size: 0.85em; ${!canAfford50 ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
              ${!canAfford50 ? 'disabled' : ''}>
              50 Adet (${(price * 50).toFixed(0)} 💰)
            </button>
          </div>
        </div>
      `;
    });

    content.innerHTML = `
      <div style="padding: 8px; max-height: 600px; overflow-y: auto;">
        <div style="padding: 8px; margin-bottom: 12px; background: #2d3561; border-radius: 4px; border-left: 3px solid #4a90e2;">
          <div style="color: #4a90e2; font-weight: bold; margin-bottom: 4px;">Bilgi</div>
          <div style="color: #ccc; font-size: 0.9em;">
            Ham maddeleri buradan manuel olarak satın alabilirsiniz. Otomatik satın alma da aktif.
          </div>
        </div>
        ${materialsHTML}
      </div>
    `;
    
    if (!panel.querySelector('.panel-content')) {
      panel.appendChild(content);
    } else {
      panel.replaceChild(content, panel.querySelector('.panel-content'));
    }
    panel.style.display = 'block';
  }

  /**
   * Open energy management panel
   */
  openEnergyManagementPanel() {
    this.closeAllPanels();
    const panel = this.getOrCreatePanel('energy-panel', '⚡ Enerji Yönetimi');
    panel.style.width = '400px';
    const content = panel.querySelector('.panel-content') || document.createElement('div');
    content.className = 'panel-content';
    
    const energy = window.gameState?.energy || 0;
    const energyProduction = this.calculateEnergyProduction();
    const energyConsumption = this.calculateEnergyConsumption();
    const energyBalance = energyProduction - energyConsumption;
    
    content.innerHTML = `
      <div style="padding: 8px; max-height: 600px; overflow-y: auto;">
        <div class="resource-section-title">📊 Enerji Durumu</div>
        <div style="padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Mevcut Enerji:</span>
            <span style="color: ${energy > 50 ? '#4CAF50' : energy > 20 ? '#FF9800' : '#f44336'}; font-weight: bold;">
              ${energy.toFixed(1)} ⚡
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Üretim:</span>
            <span style="color: #4CAF50;">+${energyProduction.toFixed(1)} ⚡/saniye</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Tüketim:</span>
            <span style="color: #f44336;">-${energyConsumption.toFixed(1)} ⚡/saniye</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding-top: 8px; border-top: 1px solid #333;">
            <span>Denge:</span>
            <span style="color: ${energyBalance >= 0 ? '#4CAF50' : '#f44336'}; font-weight: bold;">
              ${energyBalance >= 0 ? '+' : ''}${energyBalance.toFixed(1)} ⚡/saniye
            </span>
          </div>
        </div>
        
        <div class="resource-section-title" style="margin-top: 12px;">⚡ Enerji Üretimi</div>
        <div id="energy-production-list" style="padding: 8px; max-height: 150px; overflow-y: auto;"></div>
        
        <div class="resource-section-title" style="margin-top: 12px;">🔌 Enerji Tüketimi</div>
        <div id="energy-consumption-list" style="padding: 8px; max-height: 200px; overflow-y: auto;"></div>
        
        <div class="resource-section-title" style="margin-top: 12px;">⚠️ Kriz Modu</div>
        <div style="padding: 8px; font-size: 0.9em; color: #aaa;">
          Enerji azaldığında öncelik sırası:
          <ol style="margin: 8px 0; padding-left: 20px; color: white;">
            <li>♻️ Geri Dönüşüm</li>
            <li>🏭 Fabrikalar</li>
            <li>🏠 Konutlar</li>
            <li>🏪 Ticari</li>
          </ol>
        </div>
      </div>
    `;
    if (!panel.querySelector('.panel-content')) {
      panel.appendChild(content);
    } else {
      panel.replaceChild(content, panel.querySelector('.panel-content'));
    }
    this.updateEnergyLists();
    panel.style.display = 'block';
  }

  /**
   * Calculate total energy production
   */
  calculateEnergyProduction() {
    if (!window.game || !window.game.city) return 0;
    let total = 0;
    window.game.city.traverse((obj) => {
      if (obj.building && (obj.building.type === 'solar-panel' || obj.building.type === 'wind-turbine' || obj.building.type === 'hydro-plant')) {
        const level = obj.building.level || 1;
        if (obj.building.type === 'solar-panel') {
          total += 5 * level; // 5 per level
        } else if (obj.building.type === 'wind-turbine') {
          total += 10 * level; // 10 per level
        } else if (obj.building.type === 'hydro-plant') {
          total += 20 * level; // 20 per level
        }
      }
    });
    return total;
  }

  /**
   * Calculate total energy consumption
   */
  calculateEnergyConsumption() {
    if (!window.game || !window.game.city) return 0;
    let total = 0;
    window.game.city.traverse((obj) => {
      if (obj.building && obj.building.energyConsumption) {
        total += obj.building.energyConsumption;
      }
    });
    return total;
  }

  /**
   * Update energy production/consumption lists
   */
  updateEnergyLists() {
    if (!window.game || !window.game.city) return;
    
    const productionList = document.getElementById('energy-production-list');
    const consumptionList = document.getElementById('energy-consumption-list');
    
    if (!productionList || !consumptionList) return;
    
    // Production list
    productionList.innerHTML = '';
    const productionCounts = {};
    window.game.city.traverse((obj) => {
      if (obj.building && (obj.building.type === 'solar-panel' || obj.building.type === 'wind-turbine' || obj.building.type === 'hydro-plant')) {
        const type = obj.building.type;
        const level = obj.building.level || 1;
        if (!productionCounts[type]) {
          productionCounts[type] = { count: 0, total: 0, name: '' };
        }
        productionCounts[type].count++;
        if (type === 'solar-panel') {
          productionCounts[type].total += 5 * level;
          productionCounts[type].name = '☀️ Solar Panel';
        } else if (type === 'wind-turbine') {
          productionCounts[type].total += 10 * level;
          productionCounts[type].name = '💨 Rüzgar Türbini';
        } else if (type === 'hydro-plant') {
          productionCounts[type].total += 20 * level;
          productionCounts[type].name = '💧 Hidroelektrik';
        }
      }
    });
    
    Object.entries(productionCounts).forEach(([type, data]) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.padding = '4px 8px';
      item.style.margin = '2px 0';
      item.style.backgroundColor = '#22294160';
      item.style.borderRadius = '4px';
      item.innerHTML = `
        <span>${data.name} (${data.count}x)</span>
        <span style="color: #4CAF50;">+${data.total.toFixed(1)} ⚡/s</span>
      `;
      productionList.appendChild(item);
    });
    
    if (productionList.children.length === 0) {
      productionList.innerHTML = '<div style="padding: 8px; color: #888; font-size: 0.9em;">Enerji üreten bina yok</div>';
    }
    
    // Consumption list
    consumptionList.innerHTML = '';
    const consumptionCounts = {};
    window.game.city.traverse((obj) => {
      if (obj.building && obj.building.energyConsumption && obj.building.energyConsumption > 0) {
        const type = obj.building.type;
        if (!consumptionCounts[type]) {
          consumptionCounts[type] = { count: 0, total: 0, name: this.getBuildingDisplayName(type) };
        }
        consumptionCounts[type].count++;
        consumptionCounts[type].total += obj.building.energyConsumption;
      }
    });
    
    Object.entries(consumptionCounts).sort((a, b) => b[1].total - a[1].total).forEach(([type, data]) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.padding = '4px 8px';
      item.style.margin = '2px 0';
      item.style.backgroundColor = '#22294160';
      item.style.borderRadius = '4px';
      item.innerHTML = `
        <span>${data.name} (${data.count}x)</span>
        <span style="color: #f44336;">-${data.total.toFixed(1)} ⚡/s</span>
      `;
      consumptionList.appendChild(item);
    });
    
    if (consumptionList.children.length === 0) {
      consumptionList.innerHTML = '<div style="padding: 8px; color: #888; font-size: 0.9em;">Enerji tüketen bina yok</div>';
    }
  }

  /**
   * Get building display name
   */
  getBuildingDisplayName(type) {
    const names = {
      'textile-factory': '🧵 Tekstil Fabrikası',
      'technology-factory': '💻 Teknoloji Fabrikası',
      'steel-factory': '⚙️ Çelik Fabrikası',
      'automotive-factory': '🚗 Otomotiv Fabrikası',
      'recycling-center': '♻️ Geri Dönüşüm Merkezi',
      'farming': '🌾 Tarım Alanı',
      'residential': '🏠 Konut',
      'commercial': '🏪 Ticari'
    };
    return names[type] || type;
  }

  /**
   * Open statistics panel
   */
  openStatisticsPanel() {
    this.closeAllPanels();
    const panel = this.getOrCreatePanel('statistics-panel', '📊 Şehir İstatistikleri');
    panel.style.width = '400px';
    const content = panel.querySelector('.panel-content') || document.createElement('div');
    content.className = 'panel-content';
    
    const stats = this.calculateCityStatistics();
    
    content.innerHTML = `
      <div style="padding: 8px; max-height: 600px; overflow-y: auto;">
        <div class="resource-section-title">♻️ Döngüsel Ekonomi</div>
        <div style="padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Circular Score:</span>
            <span style="color: #4CAF50; font-weight: bold; font-size: 1.1em;">
              ${(window.gameState?.circularScore || 0).toFixed(1)}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Geri Dönüşüm Oranı:</span>
            <span>${stats.recyclingRate.toFixed(1)}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Yenilenebilir Enerji:</span>
            <span>${stats.renewableEnergyPercent.toFixed(1)}%</span>
          </div>
        </div>
        
        <div class="resource-section-title" style="margin-top: 12px;">🗑️ Atık Yönetimi</div>
        <div style="padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Toplam Atık:</span>
            <span style="color: ${stats.totalWaste > 80 ? '#f44336' : stats.totalWaste > 50 ? '#FF9800' : '#4CAF50'};">
              ${stats.totalWaste.toFixed(1)} / 100
            </span>
          </div>
          <div style="margin-bottom: 8px;">
            <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="background: ${stats.totalWaste > 80 ? '#f44336' : stats.totalWaste > 50 ? '#FF9800' : '#4CAF50'}; 
                height: 100%; width: ${Math.min(stats.totalWaste, 100)}%; transition: width 0.3s;"></div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Tekstil Atığı:</span>
            <span>${stats.textileWaste.toFixed(1)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>E-Atık:</span>
            <span>${stats.eWaste.toFixed(1)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Hurda Metal:</span>
            <span>${stats.scrapMetal.toFixed(1)}</span>
          </div>
        </div>
        
        <div class="resource-section-title" style="margin-top: 12px;">⚡ Enerji</div>
        <div style="padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Üretim:</span>
            <span style="color: #4CAF50;">${stats.energyProduction.toFixed(1)} ⚡/s</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Tüketim:</span>
            <span style="color: #f44336;">${stats.energyConsumption.toFixed(1)} ⚡/s</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Denge:</span>
            <span style="color: ${stats.energyBalance >= 0 ? '#4CAF50' : '#f44336'};">
              ${stats.energyBalance >= 0 ? '+' : ''}${stats.energyBalance.toFixed(1)} ⚡/s
            </span>
          </div>
        </div>
        
        <div class="resource-section-title" style="margin-top: 12px;">🏗️ Binalar</div>
        <div style="padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Toplam Bina:</span>
            <span>${stats.totalBuildings}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Fabrikalar:</span>
            <span>${stats.factories}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Enerji Üretimi:</span>
            <span>${stats.energyBuildings}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Geri Dönüşüm:</span>
            <span>${stats.recyclingCenters}</span>
          </div>
        </div>
      </div>
    `;
    if (!panel.querySelector('.panel-content')) {
      panel.appendChild(content);
    } else {
      panel.replaceChild(content, panel.querySelector('.panel-content'));
    }
    panel.style.display = 'block';
  }

  /**
   * Calculate city statistics
   */
  calculateCityStatistics() {
    if (!window.game || !window.game.city || !window.resourceManager) {
      return {
        recyclingRate: 0,
        renewableEnergyPercent: 0,
        totalWaste: 0,
        textileWaste: 0,
        eWaste: 0,
        scrapMetal: 0,
        energyProduction: 0,
        energyConsumption: 0,
        energyBalance: 0,
        totalBuildings: 0,
        factories: 0,
        energyBuildings: 0,
        recyclingCenters: 0
      };
    }
    
    const stats = {
      recyclingRate: 0,
      renewableEnergyPercent: 0,
      totalWaste: window.resourceManager.getResource('textile-waste') + 
                  window.resourceManager.getResource('e-waste') + 
                  window.resourceManager.getResource('scrap-metal'),
      textileWaste: window.resourceManager.getResource('textile-waste'),
      eWaste: window.resourceManager.getResource('e-waste'),
      scrapMetal: window.resourceManager.getResource('scrap-metal'),
      energyProduction: this.calculateEnergyProduction(),
      energyConsumption: this.calculateEnergyConsumption(),
      energyBalance: 0,
      totalBuildings: 0,
      factories: 0,
      energyBuildings: 0,
      recyclingCenters: 0
    };
    
    stats.energyBalance = stats.energyProduction - stats.energyConsumption;
    stats.renewableEnergyPercent = stats.energyProduction > 0 ? 100 : 0; // All energy is renewable in this game
    
    window.game.city.traverse((obj) => {
      if (obj.building) {
        stats.totalBuildings++;
        if (obj.building.type.includes('factory')) {
          stats.factories++;
        }
        if (obj.building.type === 'solar-panel' || obj.building.type === 'wind-turbine' || obj.building.type === 'hydro-plant') {
          stats.energyBuildings++;
        }
        if (obj.building.type === 'recycling-center') {
          stats.recyclingCenters++;
        }
      }
    });
    
    // Calculate recycling rate (simplified)
    const totalWasteProduced = stats.totalWaste;
    const recycled = window.resourceManager.getResource('recycled-fabric') + 
                     window.resourceManager.getResource('recycled-metal') + 
                     window.resourceManager.getResource('recycled-plastic');
    stats.recyclingRate = totalWasteProduced > 0 ? (recycled / (totalWasteProduced + recycled) * 100) : 0;
    
    return stats;
  }

  /**
   * Open research panel
   */
  openResearchPanel() {
    this.closeAllPanels();
    const panel = this.getOrCreatePanel('research-panel', '🧠 Araştırma & Teknoloji');
    panel.style.width = '400px';
    const content = panel.querySelector('.panel-content') || document.createElement('div');
    content.className = 'panel-content';
    
    const level = window.gameState?.level || 1;
    
    content.innerHTML = `
      <div style="padding: 8px; max-height: 600px; overflow-y: auto;">
        <div class="resource-section-title">📚 Teknoloji Ağacı</div>
        <div style="padding: 8px; color: #888; font-size: 0.9em; margin-bottom: 12px;">
          Seviye: ${level} / 10
        </div>
        
        <div id="research-tree" style="padding: 8px;">
          ${this.generateResearchTree(level)}
        </div>
      </div>
    `;
    if (!panel.querySelector('.panel-content')) {
      panel.appendChild(content);
    } else {
      panel.replaceChild(content, panel.querySelector('.panel-content'));
    }
    panel.style.display = 'block';
  }

  /**
   * Generate research tree HTML
   */
  generateResearchTree(level) {
    const researches = [
      { id: 'recycling-efficiency-1', name: 'Gelişmiş Geri Dönüşüm', level: 2, desc: '+10% geri dönüşüm verimliliği', unlocked: level >= 2 },
      { id: 'energy-optimization-1', name: 'Enerji Optimizasyonu', level: 3, desc: '-15% enerji tüketimi', unlocked: level >= 3 },
      { id: 'waste-reduction-1', name: 'Atık Azaltma', level: 4, desc: '-20% atık üretimi', unlocked: level >= 4 },
      { id: 'renewable-energy-1', name: 'Yenilenebilir Enerji+', level: 5, desc: '+25% enerji üretimi', unlocked: level >= 5 },
      { id: 'circular-design-1', name: 'Döngüsel Tasarım', level: 6, desc: '+15% Circular Score', unlocked: level >= 6 },
      { id: 'advanced-recycling', name: 'İleri Geri Dönüşüm', level: 7, desc: '+20% geri dönüşüm verimliliği', unlocked: level >= 7 },
      { id: 'zero-waste', name: 'Sıfır Atık Hedefi', level: 8, desc: '-30% atık üretimi', unlocked: level >= 8 },
      { id: 'green-tech', name: 'Yeşil Teknoloji', level: 9, desc: '+30% enerji üretimi, +20% Circular Score', unlocked: level >= 9 },
      { id: 'circular-master', name: 'Döngüsel Ustası', level: 10, desc: '+50% Circular Score bonusu', unlocked: level >= 10 }
    ];
    
    let html = '';
    researches.forEach(research => {
      const isUnlocked = research.unlocked;
      html += `
        <div style="padding: 8px; margin-bottom: 8px; background: ${isUnlocked ? '#1e3a2e' : '#2a2a2a'}; 
          border: 1px solid ${isUnlocked ? '#4CAF50' : '#555'}; border-radius: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="color: ${isUnlocked ? '#4CAF50' : '#888'}; font-weight: bold;">
              ${isUnlocked ? '✓' : '🔒'} ${research.name}
            </span>
            <span style="color: #888; font-size: 0.85em;">Seviye ${research.level}</span>
          </div>
          <div style="color: #aaa; font-size: 0.9em;">${research.desc}</div>
        </div>
      `;
    });
    
    return html;
  }

  /**
   * Get or create a floating panel
   */
  getOrCreatePanel(id, title) {
    let panel = document.getElementById(id);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = id;
      panel.className = 'floating-panel';
      panel.style.top = '100px';
      panel.style.left = '300px';
      panel.style.display = 'none';
      document.getElementById('ui').appendChild(panel);
      this.initPanelDrag(panel);
    }
    
    // Update or create header
    let header = panel.querySelector('.panel-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'panel-header';
      panel.insertBefore(header, panel.firstChild);
    }
    header.innerHTML = `
      <span>${title}</span>
      <button class="panel-close" onclick="ui.closePanel('${id}')">×</button>
    `;
    
    return panel;
  }

  /**
   * Close a specific panel
   */
  closePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.style.display = 'none';
    }
  }

  /**
   * Close all floating panels
   */
  closeAllPanels() {
    const panels = ['trade-panel', 'market-panel', 'settings-panel', 'material-shop-panel', 'energy-panel', 'statistics-panel', 'research-panel'];
    panels.forEach(id => this.closePanel(id));
  }

  /**
   * Initialize drag for a panel
   */
  initPanelDrag(panel) {
    const header = panel.querySelector('.panel-header');
    if (!header) return;

    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('panel-close')) return;
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    });

    document.addEventListener('mouseup', () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    });
  }

  /**
   * Populate trade select dropdowns
   */
  populateTradeSelects() {
    if (!window.resourceManager) return;
    
    const resources = window.resourceManager.getAllResources();
    const selectFrom = document.getElementById('trade-resource-from');
    const selectTo = document.getElementById('trade-resource-to');
    
    if (!selectFrom || !selectTo) return;

    const resourceNames = {
      'raw-fabric': '🧵 Ham Kumaş',
      'raw-plastic': '🧴 Ham Plastik',
      'raw-metal': '🔩 Ham Metal',
      'raw-electronics': '💻 Elektronik',
      'raw-glass': '🪟 Ham Cam',
      'clothing': '👔 Giyim',
      'sports-gear': '👟 Spor Ekipmanı',
      'smartphone': '📱 Akıllı Telefon',
      'laptop': '💻 Dizüstü Bilgisayar',
      'steel-beam': '🔧 Çelik Kiriş',
      'steel-structure': '🏗️ Çelik Yapı',
      'electric-car': '🚗 Elektrikli Araba',
      'electric-bike': '🚲 Elektrikli Bisiklet',
      'fertilizer': '🌱 Gübre',
      'compost': '🍂 Kompost',
      'recycled-fabric': '♻️🧵 Geri Dönüşümlü Kumaş',
      'recycled-metal': '♻️🔩 Geri Dönüşümlü Metal',
      'recycled-plastic': '♻️🧴 Geri Dönüşümlü Plastik',
      'recycled-electronics': '♻️💻 Geri Dönüşümlü Elektronik'
    };

    [selectFrom, selectTo].forEach(select => {
      select.innerHTML = '<option value="">Kaynak seçin...</option>';
      Object.entries(resources).forEach(([type, amount]) => {
        // Don't allow trading waste or recycled materials (they should be used in production/recycling)
        if (type.includes('waste') || type.includes('recycled')) {
          return;
        }
        
        // Only show resources that exist or are raw materials
        if (amount > 0 || type.startsWith('raw-')) {
          const option = document.createElement('option');
          option.value = type;
          option.textContent = `${resourceNames[type] || type} (${amount})`;
          select.appendChild(option);
        }
      });
    });
  }

  /**
   * Execute trade
   */
  executeTrade() {
    const fromType = document.getElementById('trade-resource-from')?.value;
    const fromAmount = parseInt(document.getElementById('trade-amount-from')?.value || 0);
    const toType = document.getElementById('trade-resource-to')?.value;
    const toAmount = parseInt(document.getElementById('trade-amount-to')?.value || 0);

    if (!fromType || !toType || fromAmount <= 0 || toAmount <= 0) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    if (!window.resourceManager) {
      alert('Kaynak yöneticisi bulunamadı!');
      return;
    }

    // Check if player has enough resources
    if (window.resourceManager.getResource(fromType) < fromAmount) {
      alert('Yeterli kaynağınız yok!');
      return;
    }

    // Prevent trading waste or recycled materials (they should be used in production/recycling)
    if (fromType.includes('waste') || fromType.includes('recycled') || 
        toType.includes('waste') || toType.includes('recycled')) {
      alert('Atık ve geri dönüşümlü malzemeler takas edilemez! Bunları üretim ve geri dönüşümde kullanın.');
      return;
    }

    // Execute trade (for now, just swap - later will be with NPCs or other players)
    window.resourceManager.removeResource(fromType, fromAmount);
    window.resourceManager.addResource(toType, toAmount);
    
    this.updateResources(window.resourceManager);
    this.showNotification('✅ Takas Tamamlandı', `${fromAmount} ${fromType} → ${toAmount} ${toType}`, 'success');
    this.closePanel('trade-panel');
  }

  /**
   * Save game
   */
  saveGame() {
    if (!window.saveSystem) {
      this.showNotification('Hata', 'Kayıt sistemi yüklenemedi', 'error');
      return;
    }

    const success = window.saveSystem.saveGame();
    if (success) {
      this.showNotification('✅ Oyun Kaydedildi', 'Oyununuz başarıyla kaydedildi', 'success');
    } else {
      this.showNotification('❌ Hata', 'Oyun kaydedilemedi', 'error');
    }
  }

  /**
   * Load game
   */
  loadGame() {
    if (!window.saveSystem) {
      this.showNotification('Hata', 'Kayıt sistemi yüklenemedi', 'error');
      return;
    }

    if (!window.saveSystem.hasSaveData()) {
      this.showNotification('Bilgi', 'Kayıtlı oyun bulunamadı', 'info');
      return;
    }

    // Confirm load
    if (confirm('Kayıtlı oyunu yüklemek istediğinize emin misiniz? Mevcut oyun kaybolacak.')) {
      const saveData = window.saveSystem.loadGame();
      if (saveData) {
        // Reload page to reconstruct city
        location.reload();
      } else {
        this.showNotification('❌ Hata', 'Oyun yüklenemedi', 'error');
      }
    }
  }
  /**
   * Show a notification
   */
  showNotification(title, message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#3a1e1e' : type === 'success' ? '#1e3a2e' : '#1e2331';
    const borderColor = type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3';
    const textColor = type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3';
    
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: 8px;
      padding: 12px 16px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: bold; color: ${textColor}; margin-bottom: 4px;">
        ${title}
      </div>
      <div style="color: #ddd; font-size: 0.9em;">
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }
  
  /**
   * Called when player levels up
   * @param {number} newLevel 
   * @param {number} oldLevel 
   */
  onLevelUp(newLevel, oldLevel) {
    // Update toolbar visibility
    this.updateToolbarVisibility();
    
    // Show level up modal
    this.showLevelUpModal(newLevel);
  }

  /**
   * Show level up modal
   * @param {number} level 
   */
  showLevelUpModal(level) {
    if (!window.levelUnlocks) return;

    const levelInfo = window.levelUnlocks.getLevelInfo(level);
    
    // Create or get modal container
    let modal = document.getElementById('level-up-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'level-up-modal';
      modal.className = 'level-up-modal-overlay';
      document.body.appendChild(modal);
    }

    // Build features HTML
    const featuresHTML = levelInfo.features.map(feature => 
      `<li>${feature}</li>`
    ).join('');

    // Build tips HTML
    const tipsHTML = levelInfo.tips.map(tip => 
      `<li>${tip}</li>`
    ).join('');

    // Set modal content
    modal.innerHTML = `
      <div class="level-up-modal">
        <div class="level-up-modal-header">
          <h2>Level ${level}!</h2>
          <button class="level-up-modal-close" onclick="window.ui.closeLevelUpModal()">×</button>
        </div>
        <div class="level-up-modal-content">
          <div class="level-up-title">${levelInfo.title}</div>
          <div class="level-up-description">${levelInfo.description}</div>
          
          <div class="level-up-section">
            <h3>Yeni Özellikler</h3>
            <ul class="level-up-features">
              ${featuresHTML}
            </ul>
          </div>
          
          <div class="level-up-section">
            <h3>Yapılması Gerekenler</h3>
            <ul class="level-up-tips">
              ${tipsHTML}
            </ul>
          </div>
        </div>
        <div class="level-up-modal-footer">
          <button class="level-up-modal-button" onclick="window.ui.closeLevelUpModal()">Devam Et</button>
        </div>
      </div>
    `;

    // Show modal
    modal.style.display = 'flex';
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeLevelUpModal();
      }
    });
  }

  /**
   * Close level up modal
   */
  closeLevelUpModal() {
    const modal = document.getElementById('level-up-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /**
   * Update toolbar button visibility based on current level
   */
  updateToolbarVisibility() {
    if (!window.gameState || !window.levelUnlocks) {
      return;
    }

    const level = window.gameState.level;
    
    // Button unlock mappings
    const buttonUnlocks = {
      'button-commercial': 'eco-shop', // Level 5
      'button-farming': 'farming-area', // Level 7
      'button-technology-factory': 'technology-factory', // Level 6
      'button-steel-factory': 'steel-factory', // Level 8
      'button-automotive-factory': 'automotive-factory', // Level 9
      'button-recycling-center': 'recycling-center', // Level 3
      'button-wind-turbine': 'wind-turbine', // Level 5
      'button-hydro-plant': 'hydro-plant', // Level 7
      'button-waste-to-energy': 'waste-to-energy' // Level 5
    };

    // Update each button
    Object.entries(buttonUnlocks).forEach(([buttonId, feature]) => {
      const button = document.getElementById(buttonId);
      if (button) {
        const isUnlocked = window.levelUnlocks.isUnlocked(feature, level);
        if (isUnlocked) {
          button.style.display = 'flex';
          button.style.opacity = '1';
          button.disabled = false;
        } else {
          button.style.display = 'none'; // Hide completely
        }
      }
    });
  }

  /**
   * Check for waste alarms
   */
  checkWasteAlarms() {
    if (!window.game || !window.game.city) return;
    
    let criticalWasteCount = 0;
    let warningWasteCount = 0;
    
    // Check all buildings for waste levels
    window.game.city.traverse((obj) => {
      if (obj.building && obj.building.waste) {
        const wasteAmount = obj.building.waste.amount;
        if (wasteAmount >= 95) {
          criticalWasteCount++;
        } else if (wasteAmount >= 80) {
          warningWasteCount++;
        }
      }
    });
    
    // Show alarm if critical waste detected (only if count > 0)
    if (criticalWasteCount > 0 && (!this._lastCriticalAlarm || Date.now() - this._lastCriticalAlarm > 10000)) {
      this.showNotification(
        '⚠️ Kritik Atık Uyarısı!',
        `${criticalWasteCount} binada atık seviyesi kritik! Geri dönüşüm yapın.`,
        'error'
      );
      this._lastCriticalAlarm = Date.now();
    } else if (criticalWasteCount === 0 && this._lastCriticalAlarm) {
      // Reset alarm timer if no critical waste
      this._lastCriticalAlarm = null;
    }
    
    // Check global pollution
    if (window.globalPollution) {
      const pollutionLevel = window.globalPollution.getLevel();
      if (pollutionLevel === 'maximum' && (!this._lastPollutionAlarm || Date.now() - this._lastPollutionAlarm > 30000)) {
        this.showNotification(
          '🌍 Şehir Kirliliği Maksimum!',
          'Şehir kirliliği kritik seviyede! Acil önlem alın.',
          'error'
        );
        this._lastPollutionAlarm = Date.now();
      }
    }
  }

  /**
   * Tutorial Panel Functions
   */
  showTutorialPanel() {
    const panel = document.getElementById('tutorial-panel');
    if (panel) {
      panel.style.display = 'block';
    }
  }

  hideTutorialPanel() {
    const panel = document.getElementById('tutorial-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }

  updateTutorialPanel(step) {
    if (!step) return;

    const titleEl = document.getElementById('tutorial-title');
    const textEl = document.getElementById('tutorial-text');
    const nextBtn = document.getElementById('tutorial-next-btn');

    if (titleEl) {
      titleEl.textContent = step.title || '';
    }

    if (textEl) {
      // Convert line breaks to <br> tags
      textEl.innerHTML = step.content.replace(/\n/g, '<br>');
    }

    if (nextBtn) {
      // Hide next button if step has auto-completion
      if (step.checkCompletion) {
        nextBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'block';
        // Change button text for last step
        if (step.id === 9) {
          nextBtn.textContent = "Tutorial'ı Bitir";
        } else {
          nextBtn.textContent = 'Sonraki ➜';
        }
      }
    }

    this.showTutorialPanel();
  }

  nextTutorialStep() {
    if (window.tutorialState && window.tutorialState.isActive) {
      window.tutorialState.completeStep();
    }
  }

  /**
   * Lock toolbar buttons (only allow specified actions)
   */
  lockToolbar(allowedActions) {
    const toolbarButtons = document.querySelectorAll('#ui-toolbar .ui-button');
    
    toolbarButtons.forEach(button => {
      const toolType = button.getAttribute('data-type');
      if (!toolType) {
        // Special handling for pause button - always allow
        if (button.id === 'button-pause' || button.id === 'button-resources') {
          button.disabled = false;
          button.style.opacity = '1';
          button.style.cursor = 'pointer';
        }
        return;
      }
      
      if (allowedActions.includes(toolType)) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      } else {
        button.disabled = true;
        button.style.opacity = '0.3';
        button.style.cursor = 'not-allowed';
      }
    });
  }

  /**
   * Unlock all toolbar buttons
   */
  unlockToolbar() {
    const toolbarButtons = document.querySelectorAll('#ui-toolbar .ui-button');
    
    toolbarButtons.forEach(button => {
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
    });
  }
}

window.ui = new GameUI();

// Initialize resource panel drag when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ui.initResourcePanelDrag();
  });
} else {
  window.ui.initResourcePanelDrag();
}