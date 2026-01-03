import { City } from '../../city.js';
import { Zone } from './zone.js';
import { JobsModule } from '../modules/jobs.js';
import { BuildingType } from '../buildingType.js';
import { WasteModule } from '../modules/waste.js';

export class CommercialZone extends Zone {
  /**
   * @type {JobsModule}
   */
  jobs = new JobsModule(this);
  
  /**
   * @type {WasteModule}
   */
  waste = new WasteModule(this);
  
  /**
   * Current level of the eco shop (1-3)
   * @type {number}
   */
  level = 1;
  
  /**
   * Maximum level
   * @type {number}
   */
  maxLevel = 3;
  
  /**
   * Inventory - products available for sale
   * @type {Object}
   */
  inventory = {
    'clothing': 0,
    'smartphone': 0,
    'laptop': 0,
    'steel-beam': 0,
    'steel-structure': 0,
    'electric-car': 0,
    'electric-bike': 0
  };
  
  /**
   * Maximum inventory capacity by level
   * @type {Object}
   */
  maxInventoryByLevel = {
    1: 10,   // 10 products max
    2: 20,   // 20 products max
    3: 40    // 40 products max
  };
  
  /**
   * Product prices (how much money per product sold)
   * @type {Object}
   */
  productPrices = {
    'clothing': 50,
    'smartphone': 200,
    'laptop': 500,
    'steel-beam': 100,
    'steel-structure': 300,
    'electric-car': 2000,
    'electric-bike': 400
  };
  
  /**
   * Sales rate per tick by level (how many products can be sold)
   * @type {Object}
   */
  salesRateByLevel = {
    1: 0.2,  // 0.2 products per tick (1 product every 5 ticks)
    2: 0.4,  // 0.4 products per tick (1 product every 2.5 ticks)
    3: 0.8   // 0.8 products per tick (1 product every 1.25 ticks)
  };
  
  /**
   * Auto-purchase rate per tick (how many products to buy from global inventory)
   * @type {Object}
   */
  purchaseRateByLevel = {
    1: 0.1,  // 0.1 products per tick
    2: 0.2,  // 0.2 products per tick
    3: 0.4   // 0.4 products per tick
  };
  
  /**
   * Waste production per tick (packaging waste)
   * @type {number}
   */
  baseWasteProduction = 0.5; // Increased from 0.2
  
  /**
   * Accumulated sales progress (for fractional sales)
   * @type {number}
   */
  salesProgress = 0;
  
  /**
   * Accumulated purchase progress (for fractional purchases)
   * @type {number}
   */
  purchaseProgress = 0;

  constructor(x, y) {
    super(x, y);
    this.name = generateBusinessName();
    this.type = BuildingType.commercial;
    this.power.required = 3; // Low energy consumption
    
    // Set style for commercial (A or B)
    this.style = ['A', 'B'][Math.floor(2 * Math.random())];
    
    // Initialize waste module for commercial (low packaging waste)
    this.waste.productionRate = this.baseWasteProduction;
    this.waste.wasteType = 'plastic-waste';
    this.waste.productionInterval = 10; // Produce every 10 ticks
  }

  /**
   * Get maximum inventory capacity
   * @returns {number}
   */
  get maxInventory() {
    return this.maxInventoryByLevel[this.level] || 10;
  }
  
  /**
   * Get current sales rate
   * @returns {number}
   */
  get salesRate() {
    return this.salesRateByLevel[this.level] || 0.2;
  }
  
  /**
   * Get current purchase rate
   * @returns {number}
   */
  get purchaseRate() {
    return this.purchaseRateByLevel[this.level] || 0.1;
  }
  
  /**
   * Get total products in inventory
   * @returns {number}
   */
  get totalInventory() {
    return Object.values(this.inventory).reduce((sum, val) => sum + val, 0);
  }
  
  /**
   * Check if inventory has space
   * @returns {boolean}
   */
  hasInventorySpace() {
    return this.totalInventory < this.maxInventory;
  }
  
  /**
   * Get available products for sale (products that are in inventory)
   * @returns {Array<string>}
   */
  getAvailableProducts() {
    return Object.entries(this.inventory)
      .filter(([product, amount]) => amount > 0)
      .map(([product]) => product);
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   * @param {number} currentTick 
   */
  simulate(city, currentTick = 0) {
    super.simulate(city);
    this.jobs.simulate();
    
    // Check if Eco Shop is unlocked (Level 5+)
    if (!window.gameState || !window.levelUnlocks ||
        !window.levelUnlocks.isUnlocked('eco-shop', window.gameState.level)) {
      return;
    }
    
    // Update waste module (only if waste system is unlocked - Level 3+)
    if (this.waste && window.levelUnlocks.isUnlocked('local-waste', window.gameState.level)) {
      this.waste.simulate(city, currentTick);
    }
    
    // Only work if powered and has road access
    if (!this.power.isFullyPowered || !this.roadAccess.value || !window.resourceManager) {
      return;
    }
    
    // 1. AUTO-PURCHASE: Buy products from global inventory
    if (this.hasInventorySpace()) {
      this.purchaseProgress += this.purchaseRate;
      
      if (this.purchaseProgress >= 1) {
        const productsToBuy = Math.floor(this.purchaseProgress);
        this.purchaseProgress -= productsToBuy;
        
        // Try to buy products (prioritize by price/value)
        const productPriority = ['electric-car', 'laptop', 'electric-bike', 'steel-structure', 'smartphone', 'steel-beam', 'clothing'];
        
        for (let i = 0; i < productsToBuy && this.hasInventorySpace(); i++) {
          for (const productType of productPriority) {
            const globalAmount = window.resourceManager.getResource(productType);
            if (globalAmount > 0 && this.totalInventory < this.maxInventory) {
              // Buy 1 product
              window.resourceManager.removeResource(productType, 1);
              this.inventory[productType] = (this.inventory[productType] || 0) + 1;
              break;
            }
          }
        }
      }
    }
    
    // 2. SALES: Sell products from inventory
    const availableProducts = this.getAvailableProducts();
    if (availableProducts.length > 0) {
      this.salesProgress += this.salesRate;
      
      if (this.salesProgress >= 1) {
        const productsToSell = Math.floor(this.salesProgress);
        this.salesProgress -= productsToSell;
        
        // Sell products (prioritize higher value products)
        const sortedProducts = availableProducts.sort((a, b) => {
          return (this.productPrices[b] || 0) - (this.productPrices[a] || 0);
        });
        
        for (let i = 0; i < productsToSell && sortedProducts.length > 0; i++) {
          const productType = sortedProducts[0];
          if (this.inventory[productType] > 0) {
            // Sell 1 product
            this.inventory[productType]--;
            const price = this.productPrices[productType] || 0;
            
            // Earn money
            window.gameState.addMoney(price);
            
            // Add XP (small amount per sale)
            window.gameState.addXP(0.5);
            
            // Add Circular Score (eco shops contribute to circular economy)
            window.gameState.updateCircularScore(0.2);
            
            // Show sale effect
            if (window.visualEffects) {
              window.visualEffects.addEffect(this.x, this.y, `+${price} 💰`, 'success');
            }
            
            // Update sorted products list
            sortedProducts.shift();
          }
        }
      }
    }
  }

  /**
   * Upgrade eco shop to next level
   * @returns {boolean} True if upgrade successful
   */
  upgrade() {
    if (this.level >= this.maxLevel) {
      return false;
    }

    const upgradeCost = this.getUpgradeCost();
    if (window.gameState && window.gameState.spendMoney(upgradeCost)) {
      this.level++;
      return true;
    } else if (window.gameState) {
      // Not enough money - show notification
      if (window.ui) {
        window.ui.showNotification(
          '💰 Yetersiz Para',
          `Yükseltme için ${upgradeCost.toLocaleString()} 💰 gerekiyor. Mevcut paranız: ${window.gameState.money.toLocaleString()} 💰`,
          'error'
        );
      }
    }
    
    return false;
  }

  /**
   * Get upgrade cost for current level
   * @returns {number}
   */
  getUpgradeCost() {
    // Base cost * 1.3^(current level) - reduced from 2
    return Math.floor(this.getBaseCost() * Math.pow(1.3, this.level));
  }

  /**
   * Get base cost of eco shop
   * @returns {number}
   */
  getBaseCost() {
    return 10000;
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.jobs.dispose();
    super.dispose();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    
    html += `
      <div class="info-heading">🌿 Eco Shop</div>
      <span class="info-label">Seviye </span>
      <span class="info-value">${this.level}/${this.maxLevel}</span>
      <br>
      <span class="info-label">Satış Hızı </span>
      <span class="info-value">${(this.salesRate * 100).toFixed(0)}% ürün/tick</span>
      <br>
      <span class="info-label">Alış Hızı </span>
      <span class="info-value">${(this.purchaseRate * 100).toFixed(0)}% ürün/tick</span>
      <br>
      <span class="info-label">Envanter </span>
      <span class="info-value">${this.totalInventory}/${this.maxInventory}</span>
      <br>
    `;
    
    // Show inventory
    const hasProducts = this.totalInventory > 0;
    if (hasProducts) {
      html += `<div class="info-heading" style="margin-top: 12px;">📦 Stok</div>`;
      Object.entries(this.inventory).forEach(([product, amount]) => {
        if (amount > 0) {
          const price = this.productPrices[product] || 0;
          const productNames = {
            'clothing': '👕 Kıyafet',
            'smartphone': '📱 Telefon',
            'laptop': '💻 Laptop',
            'steel-beam': '🔩 Çelik Kiriş',
            'steel-structure': '🏗️ Çelik Yapı',
            'electric-car': '🚗 Elektrikli Araba',
            'electric-bike': '🚲 Elektrikli Bisiklet'
          };
          html += `
            <div style="padding: 4px 8px; margin: 2px 0; background-color: #22294160; border-radius: 4px;">
              <span class="info-label">${productNames[product] || product}</span>
              <span class="info-value">${amount}x (${price.toLocaleString()} 💰/adet)</span>
            </div>
          `;
        }
      });
    } else {
      html += `<div style="padding: 8px; color: #888; font-size: 0.9em;">Envanter boş - Ürün bekleniyor</div>`;
    }
    
    html += this.jobs.toHTML();
    
    // Waste information
    if (this.waste) {
      const wasteLevel = this.waste.getLevel();
      const wasteColor = wasteLevel >= 95 ? '#f44336' : wasteLevel >= 80 ? '#FF9800' : '#4CAF50';
      html += `
        <div class="info-heading" style="margin-top: 12px;">🗑️ Atık Durumu</div>
        <div style="padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Atık Seviyesi:</span>
            <span style="color: ${wasteColor}; font-weight: bold;">${this.waste.amount.toFixed(1)} / ${this.waste.maxCapacity}</span>
          </div>
          <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 4px;">
            <div style="background: ${wasteColor}; height: 100%; width: ${wasteLevel}%; transition: width 0.3s;"></div>
          </div>
        </div>
      `;
    }
    
    // Upgrade button
    if (this.level < this.maxLevel) {
      const upgradeCost = this.getUpgradeCost();
      html += `
        <div style="padding: 8px; margin-top: 8px;">
          <button class="action-button" onclick="window.game?.upgradeFactory(${this.x}, ${this.y})" style="width: 100%;">
            ⬆️ Yükselt (${upgradeCost.toLocaleString()} 💰)
          </button>
        </div>
      `;
    }
    
    return html;
  }
}

// Arrays of words for generating business names
const prefixes = ['Prime', 'Elite', 'Global', 'Exquisite', 'Vibrant', 'Luxury', 'Innovative', 'Sleek', 'Premium', 'Dynamic'];
const suffixes = ['Commerce', 'Trade', 'Marketplace', 'Ventures', 'Enterprises', 'Retail', 'Group', 'Emporium', 'Boutique', 'Mall'];
const businessSuffixes = ['LLC', 'Inc.', 'Co.', 'Corp.', 'Ltd.'];

// Function to generate a random commercial business name
function generateBusinessName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const businessSuffix = businessSuffixes[Math.floor(Math.random() * businessSuffixes.length)];

  return prefix + ' ' + suffix + ' ' + businessSuffix;
}