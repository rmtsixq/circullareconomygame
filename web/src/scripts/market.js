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
      // Textile products
      'clothing': 150,      // Increased from 50
      'sports-gear': 250,   // Increased from 75
      
      // Technology products
      'smartphone': 600,    // Increased from 200
      'laptop': 1500,       // Increased from 500
      
      // Steel products
      'steel-beam': 300,    // Increased from 100
      'steel-structure': 900, // Increased from 300
      
      // Automotive products
      'electric-bike': 1200, // Increased from 400
      'electric-car': 6000,  // Increased from 2000
      
      // Farming products
      'fertilizer': 100,    // Increased from 30
      'compost': 60         // Increased from 20
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
     * Auto-buy enabled (unlocked at Level 3)
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
    
    // Auto-buy enabled at Level 3
    if (level >= 3) {
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
    
    let totalEarned = 0;
    const products = Object.keys(this.productPrices);
    
    // Sell products based on auto-sell rate
    products.forEach(product => {
      const currentAmount = resourceManager.getResource(product);
      if (currentAmount > 0) {
        const toSell = Math.min(this.autoSellRate, currentAmount);
        if (toSell > 0) {
          const price = this.productPrices[product] || 0;
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

