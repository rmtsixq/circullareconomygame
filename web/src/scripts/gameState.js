/**
 * Game State Management
 * Manages money, energy, level, XP, and Circular Score
 */
export class GameState {
  constructor() {
    // Starting values
    this.money = 500000; // 💰
    this.energy = 0; // ⚡ Start with 0 energy
    this.level = 1;
    this.xp = 0;
    this.circularScore = 0;
    
    // XP required for each level (cumulative)
    this.xpRequirements = {
      1: 0,
      2: 100,
      3: 250,
      4: 500,
      5: 1000,
      6: 2000,
      7: 4000,
      8: 8000,
      9: 16000,
      10: 32000
    };
  }

  /**
   * Add money (applies tax policy multiplier if unlocked)
   * @param {number} amount 
   */
  addMoney(amount) {
    // Apply tax policy multiplier (Level 4+)
    if (window.cityPolicies && window.levelUnlocks &&
        window.levelUnlocks.isUnlocked('hq-policy-panel', this.level)) {
      const taxEffects = window.cityPolicies.getTaxPolicyEffects();
      amount = amount * taxEffects.money;
    }
    
    this.money += amount;
    this.updateUI();
  }

  /**
   * Spend money
   * @param {number} amount 
   * @returns {boolean} True if successful, false if not enough money
   */
  spendMoney(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      this.updateUI();
      return true;
    }
    return false;
  }

  /**
   * Add energy
   * @param {number} amount 
   */
  addEnergy(amount) {
    this.energy += amount;
    this.updateUI();
  }

  /**
   * Consume energy
   * @param {number} amount 
   * @returns {boolean} True if successful, false if not enough energy
   */
  consumeEnergy(amount) {
    if (this.energy >= amount) {
      this.energy -= amount;
      this.updateUI();
      return true;
    }
    return false;
  }

  /**
   * Add XP and check for level up
   * @param {number} amount 
   */
  addXP(amount) {
    // All levels use normal XP now (no special Level 1 handling)
    this.xp += amount;
    this.checkLevelUp();
    this.updateUI();
  }


  /**
   * Check if player should level up
   */
  checkLevelUp() {
    // All levels use normal XP-based leveling
    const previousLevel = this.level;
    const nextLevel = this.level + 1;
    if (nextLevel <= 10) {
      const requiredXP = this.xpRequirements[nextLevel];
      if (this.xp >= requiredXP) {
        this.level = nextLevel;
        // Trigger level up event
        console.log(`Level up! Now level ${this.level}`);
        
        // Initialize market based on new level
        if (window.market) {
          window.market.initialize(this.level);
        }
        
        // Notify UI to update unlocked features
        if (window.ui && window.ui.onLevelUp) {
          window.ui.onLevelUp(this.level, previousLevel);
        }
      }
    }
  }

  /**
   * Update Circular Score
   * @param {number} amount 
   */
  updateCircularScore(amount) {
    this.circularScore += amount;
    if (this.circularScore < 0) {
      this.circularScore = 0;
    }
    this.updateUI();
  }

  /**
   * Calculate Circular Score based on comprehensive circular economy metrics
   * Detailed formula based on circular economy principles:
   * 1. Waste Reduction & Recycling (40% weight)
   * 2. Resource Efficiency (25% weight)
   * 3. Renewable Energy (20% weight)
   * 4. Product Lifecycle Management (10% weight)
   * 5. Circular Material Usage (5% weight)
   */
  calculateCircularScore() {
    if (!window.resourceManager || !window.game || !window.game.city) {
      return 0;
    }
    
    let score = 0;
    const maxScore = 100;
    
    // === 1. WASTE REDUCTION & RECYCLING (40 points max) ===
    const totalWaste = window.resourceManager.getTotalWaste();
    const maxWasteCapacity = 500; // 5 waste types × 100 each
    const wastePercentage = (totalWaste / maxWasteCapacity) * 100;
    
    // Waste reduction score (0-20 points)
    // Lower waste = higher score
    const wasteReductionScore = Math.max(0, 20 - (wastePercentage * 0.2));
    score += wasteReductionScore;
    
    // Recycling efficiency (0-20 points)
    const recycledMaterials = 
      window.resourceManager.getResource('recycled-fabric') +
      window.resourceManager.getResource('recycled-metal') +
      window.resourceManager.getResource('recycled-plastic') +
      window.resourceManager.getResource('recycled-electronics');
    
    // Recycling centers count
    let recyclingCenters = 0;
    for (let x = 0; x < window.game.city.size; x++) {
      for (let y = 0; y < window.game.city.size; y++) {
        const tile = window.game.city.getTile(x, y);
        if (tile && tile.building && tile.building.type === 'recycling-center') {
          recyclingCenters++;
        }
      }
    }
    
    // Recycling score: based on recycled materials and recycling centers
    const recyclingScore = Math.min(20, (recycledMaterials * 0.5) + (recyclingCenters * 5));
    score += recyclingScore;
    
    // === 2. RESOURCE EFFICIENCY (25 points max) ===
    // Check if using recycled materials in production
    const totalProducts = Object.values({
      'clothing': window.resourceManager.getResource('clothing'),
      'smartphone': window.resourceManager.getResource('smartphone'),
      'laptop': window.resourceManager.getResource('laptop'),
      'steel-beam': window.resourceManager.getResource('steel-beam'),
      'steel-structure': window.resourceManager.getResource('steel-structure'),
      'electric-car': window.resourceManager.getResource('electric-car'),
      'electric-bike': window.resourceManager.getResource('electric-bike')
    }).reduce((sum, val) => sum + val, 0);
    
    // Resource efficiency: more products with less waste = better
    const resourceEfficiencyScore = Math.min(25, (totalProducts * 0.1) + (recycledMaterials * 0.3));
    score += resourceEfficiencyScore;
    
    // === 3. RENEWABLE ENERGY (20 points max) ===
    let renewableEnergySources = 0;
    let totalEnergyProduction = 0;
    
    for (let x = 0; x < window.game.city.size; x++) {
      for (let y = 0; y < window.game.city.size; y++) {
        const tile = window.game.city.getTile(x, y);
        if (tile && tile.building) {
          const building = tile.building;
          if (building.type === 'solar-panel' || 
              building.type === 'wind-turbine' || 
              building.type === 'hydro-plant') {
            renewableEnergySources++;
            // Estimate energy production based on level
            if (building.energyProduction) {
              totalEnergyProduction += building.energyProduction;
            } else if (building.level) {
              // Fallback estimation
              totalEnergyProduction += building.level * 5;
            }
          }
        }
      }
    }
    
    // Renewable energy score: based on number of renewable sources and production
    const renewableEnergyScore = Math.min(20, (renewableEnergySources * 3) + (totalEnergyProduction * 0.2));
    score += renewableEnergyScore;
    
    // === 4. PRODUCT LIFECYCLE MANAGEMENT (10 points max) ===
    // Eco shops selling products (circular economy)
    let ecoShops = 0;
    for (let x = 0; x < window.game.city.size; x++) {
      for (let y = 0; y < window.game.city.size; y++) {
        const tile = window.game.city.getTile(x, y);
        if (tile && tile.building && tile.building.type === 'commercial') {
          if (tile.building.development && tile.building.development.state === 'developed') {
            ecoShops++;
          }
        }
      }
    }
    
    // Product lifecycle score: eco shops extend product lifecycle
    const lifecycleScore = Math.min(10, ecoShops * 2);
    score += lifecycleScore;
    
    // === 5. CIRCULAR MATERIAL USAGE (5 points max) ===
    // Using recycled materials in production (if factories use recycled materials)
    // This is a bonus for having recycled materials available
    const circularMaterialScore = Math.min(5, recycledMaterials * 0.1);
    score += circularMaterialScore;
    
    // === PENALTIES ===
    // High waste penalty
    if (wastePercentage > 80) {
      score -= (wastePercentage - 80) * 0.5;
    }
    
    // No recycling centers penalty (if waste exists)
    if (totalWaste > 0 && recyclingCenters === 0) {
      score -= 10;
    }
    
    // === FINAL SCORE ===
    this.circularScore = Math.max(0, Math.min(maxScore, Math.round(score)));
    this.updateUI();
    return this.circularScore;
  }

  /**
   * Update UI elements
   */
  updateUI() {
    if (window.ui && window.ui.updateGameState) {
      window.ui.updateGameState(this);
    }
  }

  /**
   * Get current level's XP requirement
   * @returns {number}
   */
  getCurrentLevelXPRequirement() {
    return this.xpRequirements[this.level] || 0;
  }

  /**
   * Get next level's XP requirement
   * @returns {number}
   */
  getNextLevelXPRequirement() {
    const nextLevel = this.level + 1;
    return this.xpRequirements[nextLevel] || this.xpRequirements[10];
  }

  /**
   * Get XP progress percentage for current level
   * @returns {number} 0-100
   */
  getXPProgress() {
    // Use real XP for all levels
    const current = this.getCurrentLevelXPRequirement();
    const next = this.getNextLevelXPRequirement();
    const progress = this.xp - current;
    const total = next - current;
    return total > 0 ? (progress / total) * 100 : 100;
  }
  
  /**
   * Get display XP
   * @returns {number}
   */
  getDisplayXP() {
    return this.xp;
  }

  /**
   * Reset to initial state (for new game)
   */
  reset() {
    this.money = 500000;
    this.energy = 0; // Start with 0 energy
    this.level = 1;
    this.xp = 0;
    this.circularScore = 0;
    this.updateUI();
  }
}

// Global game state instance
window.gameState = new GameState();

