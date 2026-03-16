/**
 * City Policies - Global game settings managed from Player House
 */
export class CityPolicies {
  constructor() {
    // Recycling Priority (0-100, higher = more priority)
    this.recyclingPriority = 50;
    
    // Energy Policy
    this.energyPolicy = 'balanced'; // 'balanced', 'efficiency', 'green'
    
    // Production vs Environment Balance (0-100, 0 = production, 100 = environment)
    this.productionEnvironmentBalance = 50;
    
    // Energy Crisis Mode - Priority order when energy is low
    this.energyCrisisPriority = [
      'recycling',      // 1. Recycling centers (highest priority)
      'factories',      // 2. Factories
      'residential',    // 3. Residential
      'commercial'      // 4. Commercial (lowest priority)
    ];
    
    // Auto-save enabled
    this.autoSave = true;
    this.autoSaveInterval = 30; // seconds
    
    // 1️⃣ PRODUCTION PRIORITY POLICY (Level 6+)
    this.productionMode = 'balanced'; // 'balanced', 'economy', 'environment'
    
    // 2️⃣ AUTO-SELL POLICY
    this.salesPolicy = 'auto'; // 'auto', 'store', 'smart'
    
    // 3️⃣ TAX & TRADE SETTING
    this.taxPolicy = 'medium'; // 'low', 'medium', 'high'
    
    // 4️⃣ WORKFORCE DISTRIBUTION (total must be 100)
    this.workforceDistribution = {
      factories: 60,      // Factories
      recycling: 20,     // Recycling
      commercial: 20     // Trade
    };
    
    // 5️⃣ ENERGY TRADE MODE
    this.energyTradeMode = 'none'; // 'none', 'sell', 'store'
  }

  /**
   * Get energy policy multiplier
   * @returns {number} Multiplier for energy consumption
   */
  getEnergyMultiplier() {
    switch (this.energyPolicy) {
      case 'efficiency':
        return 0.9; // 10% less energy consumption
      case 'green':
        return 1.1; // 10% more energy consumption (but better for environment)
      case 'balanced':
      default:
        return 1.0;
    }
  }

  /**
   * Get production efficiency based on balance
   * @returns {number} 0-1
   */
  getProductionEfficiency() {
    // Lower balance = more production, less environment
    // Higher balance = less production, more environment
    return 1 - (this.productionEnvironmentBalance / 100) * 0.2; // Max 20% reduction
  }

  /**
   * Get recycling efficiency bonus
   * @returns {number} 0-0.2 (0-20%)
   */
  getRecyclingBonus() {
    return (this.recyclingPriority / 100) * 0.2; // Max 20% bonus
  }

  /**
   * Get production mode multiplier
   * @returns {Object} {speed: number, waste: number, circularScore: number}
   */
  getProductionModeEffects() {
    switch (this.productionMode) {
      case 'economy':
        return {
          speed: 1.2,        // +20% production speed
          waste: 1.25,       // +25% waste
          circularScore: -0.1 // -10% Circular Score per tick
        };
      case 'environment':
        return {
          speed: 0.85,       // -15% production speed
          waste: 0.7,        // -30% waste
          circularScore: 0.1 // +10% Circular Score bonus
        };
      case 'balanced':
      default:
        return {
          speed: 1.0,
          waste: 1.0,
          circularScore: 0
        };
    }
  }

  /**
   * Get tax policy effects
   * @returns {Object} {money: number, population: number, waste: number}
   */
  getTaxPolicyEffects() {
    switch (this.taxPolicy) {
      case 'low':
        return {
          money: 0,         // Normal money
          population: 1.1,  // +10% population growth
          waste: 1.0        // Normal waste
        };
      case 'high':
        return {
          money: 1.25,      // +25% money
          population: 0,    // No population growth
          waste: 1.15       // +15% waste
        };
      case 'medium':
      default:
        return {
          money: 1.0,
          population: 1.0,
          waste: 1.0
        };
    }
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.recyclingPriority = 50;
    this.energyPolicy = 'balanced';
    this.productionEnvironmentBalance = 50;
    this.energyCrisisPriority = ['recycling', 'factories', 'residential', 'commercial'];
    this.autoSave = true;
    this.autoSaveInterval = 30;
    this.productionMode = 'balanced';
    this.salesPolicy = 'auto';
    this.taxPolicy = 'medium';
    this.workforceDistribution = {
      factories: 60,
      recycling: 20,
      commercial: 20
    };
    this.energyTradeMode = 'none';
  }
}

// Global instance
window.cityPolicies = new CityPolicies();

