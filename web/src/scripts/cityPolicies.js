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
   * Reset to defaults
   */
  reset() {
    this.recyclingPriority = 50;
    this.energyPolicy = 'balanced';
    this.productionEnvironmentBalance = 50;
    this.energyCrisisPriority = ['recycling', 'factories', 'residential', 'commercial'];
    this.autoSave = true;
    this.autoSaveInterval = 30;
  }
}

// Global instance
window.cityPolicies = new CityPolicies();

