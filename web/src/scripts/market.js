/**
 * Market System - Handles automatic buying and selling of products
 * Products are automatically sold to NPC market, raw materials can be bought
 */

export class Market {
  constructor() {
    /**
     * Base prices for products (can fluctuate)
     * @type {Object}
     */
    this.productPrices = {
      // Textile products (Grade 1)
      'clothing': 450,      // Market price (Eco Shop: 520)
      'sports-gear': 600,   // Market price
      
      // Technology products (Grade 1)
      'smartphone': 750,    // Market price (Eco Shop: 900)
      'laptop': 1500,       // Market price (Eco Shop: 1800)
      
      // Steel products (Grade 1)
      'steel-beam': 650,    // Market price (Eco Shop: 800)
      'steel-structure': 900, // Market price (Eco Shop: 1100)
      
      // Automotive products (Grade 1)
      'electric-bike': 1200, // Market price (Eco Shop: 1400)
      'electric-car': 1700,  // Market price (Eco Shop: 2000)
      
      // Farming products
      'fertilizer': 100,
      'compost': 60
    };
    
    /**
     * Eco Shop prices (15-20% premium over market)
     * @type {Object}
     */
    this.ecoShopPrices = {
      'clothing': 520,      // +15.5% premium
      'sports-gear': 700,
      'smartphone': 900,    // +20% premium
      'laptop': 1800,       // +20% premium
      'steel-beam': 800,    // +23% premium
      'steel-structure': 1100, // +22% premium
      'electric-bike': 1400, // +17% premium
      'electric-car': 2000   // +18% premium
    };
    
    /**
     * Base prices for raw materials (buying from market)
     * @type {Object}
     */
    this.rawMaterialPrices = {
      'raw-fabric': 10,
      'raw-plastic': 8,
      'raw-metal': 12,
      'raw-electronics': 15,
      'raw-glass': 6
    };
    
    /**
     * Auto-sell enabled (always enabled from Level 1)
     * @type {boolean}
     */
    this.autoSellEnabled = true; // Always enabled
    
    /**
     * Auto-buy enabled (unlocked at Level 2)
     * @type {boolean}
     */
    this.autoBuyEnabled = false;
    
    /**
     * Auto-sell rate per tick (how much to sell)
     * @type {number}
     */
    this.autoSellRate = 2.0; // Sell 2 products per tick (increased from 0.5)
    
    /**
     * Auto-buy rate per tick (how much to buy)
     * @type {number}
     */
    this.autoBuyRate = 0.3; // Buy 0.3 raw materials per tick
    
    /**
     * Minimum money threshold for auto-buy (don't buy if money is below this)
     * @type {number}
     */
    this.autoBuyMinMoney = 1000;
    
    /**
     * Price fluctuation factor (0-1, how much prices can change)
     * @type {number}
     */
    this.priceVolatility = 0.1; // 10% price fluctuation
    
    /**
     * Last price update tick
     * @type {number}
     */
    this.lastPriceUpdate = 0;
    
    /**
     * Price update interval (every N ticks)
     * @type {number}
     */
    this.priceUpdateInterval = 20; // Update prices every 20 ticks
  }
  
  /**
   * Initialize market based on player level
   * @param {number} level 
   */
  initialize(level) {
    // Auto-sell is always enabled from Level 1
    this.autoSellEnabled = true;
    
    // Auto-buy enabled at Level 2 (moved from Level 3)
    if (level >= 2) {
      this.autoBuyEnabled = true;
    }
  }
  
  /**
   * Update market prices (fluctuation)
   * @param {number} currentTick 
   */
  updatePrices(currentTick) {
    if (currentTick - this.lastPriceUpdate < this.priceUpdateInterval) {
      return;
    }
    
    this.lastPriceUpdate = currentTick;
    
    // Fluctuate product prices
    Object.keys(this.productPrices).forEach(product => {
      const basePrice = this.productPrices[product];
      const fluctuation = (Math.random() - 0.5) * 2 * this.priceVolatility; // -10% to +10%
      this.productPrices[product] = Math.max(basePrice * 0.5, basePrice * (1 + fluctuation));
    });
    
    // Fluctuate raw material prices
    Object.keys(this.rawMaterialPrices).forEach(material => {
      const basePrice = this.rawMaterialPrices[material];
      const fluctuation = (Math.random() - 0.5) * 2 * this.priceVolatility;
      this.rawMaterialPrices[material] = Math.max(basePrice * 0.5, basePrice * (1 + fluctuation));
    });
  }
  
  /**
   * Auto-sell products from inventory
   * @param {ResourceManager} resourceManager 
   * @param {GameState} gameState 
   * @returns {number} Total money earned
   */
  autoSellProducts(resourceManager, gameState) {
    if (!this.autoSellEnabled || !resourceManager || !gameState) {
      return 0;
    }
    
    // Check sales policy
    const salesPolicy = window.cityPolicies?.salesPolicy || 'auto';
    
    // If policy is 'store', don't sell anything
    if (salesPolicy === 'store') {
      return 0;
    }
    
    // If policy is 'smart', check conditions
    if (salesPolicy === 'smart') {
      // Check if inventory is 70% full
      const totalInventory = Object.values(resourceManager.resources).reduce((sum, val) => sum + val, 0);
      const maxInventory = 1000; // Approximate max inventory
      const inventoryPercent = (totalInventory / maxInventory) * 100;
      
      // Check energy surplus
      const energySurplus = (gameState.energy || 0) > 50;
      
      // Check Circular Score trend (simplified - if score is decreasing)
      const circularScore = gameState.circularScore || 0;
      const shouldSlowDown = circularScore < 50; // If score is low, slow down sales
      
      // Smart selling conditions
      if (inventoryPercent < 70 && !energySurplus && shouldSlowDown) {
        // Don't sell if inventory is low, energy is low, and score is low
        return 0;
      }
    }
    
    let totalEarned = 0;
    const products = Object.keys(this.productPrices);
    
    // Check if there are Eco Shops (for premium pricing)
    let hasEcoShop = false;
    if (window.game && window.game.city) {
      window.game.city.traverse((obj) => {
        if (obj.building && obj.building.type === 'commercial') {
          hasEcoShop = true;
        }
      });
    }
    
    // Sell products based on auto-sell rate
    products.forEach(product => {
      const currentAmount = resourceManager.getResource(product);
      if (currentAmount > 0) {
        const toSell = Math.min(this.autoSellRate, currentAmount);
        if (toSell > 0) {
          // Use Eco Shop price if available, otherwise market price
          let price = this.productPrices[product] || 0;
          if (hasEcoShop && this.ecoShopPrices[product]) {
            price = this.ecoShopPrices[product];
          }
          
          const earnings = toSell * price;
          
          // Remove from inventory
          resourceManager.removeResource(product, toSell);
          
          // Add money
          gameState.addMoney(earnings);
          
          totalEarned += earnings;
        }
      }
    });
    
    return totalEarned;
  }
  
  /**
   * Get product price (market or eco shop)
   * @param {string} product 
   * @param {boolean} useEcoShop 
   * @returns {number}
   */
  getProductPrice(product, useEcoShop = false) {
    if (useEcoShop && this.ecoShopPrices[product]) {
      return this.ecoShopPrices[product];
    }
    return this.productPrices[product] || 0;
  }
  
  /**
   * Auto-buy raw materials when needed
   * @param {ResourceManager} resourceManager 
   * @param {GameState} gameState 
   * @returns {number} Total money spent
   */
  autoBuyMaterials(resourceManager, gameState) {
    if (!this.autoBuyEnabled || !resourceManager || !gameState) {
      return 0;
    }
    
    // Don't auto-buy if money is too low
    if (gameState.money < this.autoBuyMinMoney) {
      return 0;
    }
    
    let totalSpent = 0;
    const materials = Object.keys(this.rawMaterialPrices);
    
    // Buy materials that are low or missing
    materials.forEach(material => {
      const currentAmount = resourceManager.getResource(material);
      const targetAmount = 10; // Try to keep at least 10 units
      
      if (currentAmount < targetAmount) {
        const toBuy = Math.min(this.autoBuyRate, targetAmount - currentAmount);
        if (toBuy > 0) {
          const price = this.rawMaterialPrices[material] || 0;
          const cost = toBuy * price;
          
          // Check if we can afford it
          if (gameState.money >= cost) {
            // Add to inventory
            resourceManager.addResource(material, toBuy);
            
            // Spend money
            gameState.spendMoney(cost);
            
            totalSpent += cost;
          }
        }
      }
    });
    
    return totalSpent;
  }
  
  /**
   * Manual sell products
   * @param {string} product 
   * @param {number} amount 
   * @param {ResourceManager} resourceManager 
   * @param {GameState} gameState 
   * @returns {number} Money earned
   */
  sellProduct(product, amount, resourceManager, gameState) {
    if (!resourceManager || !gameState) {
      return 0;
    }
    
    const available = resourceManager.getResource(product);
    const toSell = Math.min(amount, available);
    
    if (toSell <= 0) {
      return 0;
    }
    
    const price = this.productPrices[product] || 0;
    const earnings = toSell * price;
    
    resourceManager.removeResource(product, toSell);
    gameState.addMoney(earnings);
    
    return earnings;
  }
  
  /**
   * Manual buy raw material
   * @param {string} material 
   * @param {number} amount 
   * @param {ResourceManager} resourceManager 
   * @param {GameState} gameState 
   * @returns {boolean} Success
   */
  buyMaterial(material, amount, resourceManager, gameState) {
    if (!resourceManager || !gameState) {
      return false;
    }
    
    const price = this.rawMaterialPrices[material] || 0;
    const cost = amount * price;
    
    if (gameState.money < cost) {
      return false;
    }
    
    resourceManager.addResource(material, amount);
    gameState.spendMoney(cost);
    
    return true;
  }
  
  /**
   * Get current price for a product
   * @param {string} product 
   * @returns {number}
   */
  getProductPrice(product) {
    return this.productPrices[product] || 0;
  }
  
  /**
   * Get current price for a raw material
   * @param {string} material 
   * @returns {number}
   */
  getMaterialPrice(material) {
    return this.rawMaterialPrices[material] || 0;
  }
}

// Global instance
window.market = new Market();

