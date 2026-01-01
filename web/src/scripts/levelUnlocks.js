/**
 * Level Unlock System - Controls what features are available at each level
 * Progressive disclosure: systems unlock gradually as player levels up
 */

export class LevelUnlocks {
  /**
   * Check if a feature is unlocked at current level
   * @param {string} feature - Feature name
   * @param {number} currentLevel - Current player level
   * @returns {boolean}
   */
  static isUnlocked(feature, currentLevel) {
    const unlockLevel = this.unlockLevels[feature];
    if (!unlockLevel) {
      // If not defined, assume unlocked (backward compatibility)
      return true;
    }
    return currentLevel >= unlockLevel;
  }

  /**
   * Get unlock level for a feature
   * @param {string} feature 
   * @returns {number}
   */
  static getUnlockLevel(feature) {
    return this.unlockLevels[feature] || 1;
  }

  /**
   * Unlock levels for all features
   * @type {Object}
   */
  static unlockLevels = {
    // Level 1 - Basic Survival
    'player-house': 1,
    'energy-pool': 1,
    'solar-panel': 1,
    'textile-factory': 1,
    'residential-level-1': 1,
    'money': 1,
    'tick-system': 1,
    
    // Level 2 - Understanding Production
    'production-queue': 2,
    'residential-level-2': 2,
    'energy-consumption-display': 2,
    'inventory-panel': 2,
    'auto-sell': 2, // Auto-sell products
    
    // Level 3 - Waste Reality
    'local-waste': 3,
    'waste-color-system': 3,
    'waste-efficiency-penalty': 3,
    'waste-bar': 3,
    'auto-buy': 3, // Auto-buy raw materials
    
    // Level 4 - Solution Tools
    'recycling-center': 4,
    'recycled-material': 4,
    'circular-score': 4,
    'textile-grade-2': 4,
    
    // Level 5 - Economy Deepens
    'eco-shop': 5,
    'product-sales': 5,
    'wind-turbine': 5,
    
    // Level 6 - City Scale
    'technology-factory': 6,
    'global-pollution': 6,
    'recycling-auto': 6,
    'residential-level-3': 6,
    
    // Level 7 - Management Game
    'hq-policy-panel': 7,
    'energy-priority': 7,
    'farming-area': 7,
    'hydro-plant': 7,
    
    // Level 8 - Optimization
    'steel-factory': 8,
    'recycling-efficiency-bonus': 8,
    'eco-shop-upgrade': 8,
    'global-pollution-effects': 8,
    
    // Level 9 - Industry
    'automotive-factory': 9,
    'eco-shop-prestige': 9,
    'pollution-events': 9,
    
    // Level 10 - Mastery
    'achievements': 10,
    'waste-free-bonuses': 10,
    'advanced-policies': 10,
    'max-circular-multipliers': 10
  };

  /**
   * Get all features unlocked at a specific level
   * @param {number} level 
   * @returns {Array<string>}
   */
  static getFeaturesAtLevel(level) {
    return Object.entries(this.unlockLevels)
      .filter(([feature, unlockLevel]) => unlockLevel === level)
      .map(([feature]) => feature);
  }

  /**
   * Get all unlocked features up to a level
   * @param {number} level 
   * @returns {Array<string>}
   */
  static getAllUnlockedFeatures(level) {
    return Object.entries(this.unlockLevels)
      .filter(([feature, unlockLevel]) => unlockLevel <= level)
      .map(([feature]) => feature);
  }
}

// Global instance
window.levelUnlocks = LevelUnlocks;

