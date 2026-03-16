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
   * Unlock levels for all features (6-level model)
   * @type {Object}
   */
  static unlockLevels = {
    // Level 1 - Basic Setup (Start)
    'player-house': 1,
    'energy-pool': 1,
    'solar-panel': 1,
    'textile-factory': 1,
    'residential-level-1': 1,
    'park': 1,
    'money': 1,
    'tick-system': 1,
    'auto-sell': 1,
    'road': 1,
    'inventory-panel': 1,
    'material-shop': 1,
    'residential-level-2': 2,
    'production-queue': 2,
    'auto-buy': 2,
    'school': 2,
    'hospital': 2,

    // Level 3 - Recycling (Sustainability > 40)
    'recycling-center': 3,
    'local-waste': 3,
    'waste-color-system': 3,
    'waste-bar': 3,
    'circular-score': 3,
    'recycled-material': 3,
    'hq-policy-panel': 3,
    'hq-statistics': 3,
    'awareness-center': 3,
    'mrf': 3,
    'water-treatment': 3,

    // Level 4 - Clean Energy & Crisis (Emission / Environment Focused)
    'wind-turbine': 4,
    'waste-to-energy': 4,
    'global-pollution': 4,
    'energy-priority': 4,

    // Level 5 - Technology & Symbiosis (Sustainability > 70)
    'technology-factory': 5,
    'farming-area': 5,
    'hydro-plant': 5,
    'industrial-symbiosis': 5,
    'residential-level-3': 5,

    // Level 6 - Net Zero City (Wellbeing > 75 & Health > 70)
    'steel-factory': 6,
    'automotive-factory': 6,
    'net-zero-bonus': 6,
    'achievements': 6
  };

  /**
   * Conditions required to reach each level
   */
  static levelConditions = {
    2: (gs) => gs.wellbeing >= 55,
    3: (gs) => gs.sustainability >= 40,
    4: (gs) => (window.globalPollution?.totalPollution || 0) > 30 || gs.sustainability >= 50,
    5: (gs) => gs.sustainability >= 70,
    6: (gs) => gs.wellbeing >= 75 && gs.health >= 70
  };

  /**
   * Check if a level's requirement is met
   * @param {number} level 
   * @param {object} gameState 
   * @returns {boolean}
   */
  static isRequirementMet(level, gameState) {
    if (level <= 1) return true;
    const condition = this.levelConditions[level];
    if (condition) {
      return condition(gameState);
    }
    return true;
  }

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

  /**
   * Get level information (title, description, features, tips)
   * @param {number} level 
   * @returns {Object}
   */
  static getLevelInfo(level) {
    const levelInfo = {
      1: {
        title: 'Basic Setup',
        description: 'You have started building your city! Learn the basic systems and citizen needs.',
        features: [
          'Residence (Level 1)',
          'Solar Panel',
          'Textile Factory',
          'Purchase Raw Materials',
          'Money & Energy Pool',
          'Citizen Indices'
        ],
        tips: [
          'Increase population by placing houses',
          'Meet city energy needs by building solar panels',
          'Monitor citizen health and wellbeing'
        ]
      },
      2: {
        title: 'Industry and Welfare',
        description: 'Wellbeing has passed 50! Take the first step into industry.',
        features: [
          'Residence (Level 2)',
          'Production Queue',
          'Auto-Purchase'
        ],
        tips: [
          'Increase income by producing and selling goods',
          'Boost citizen welfare by reducing unemployment',
          'Start paying attention to waste from industry'
        ]
      },
      3: {
        title: 'Recycling and Savings',
        description: 'Sustainability has passed 40! Professionalize waste management.',
        features: [
          'Recycling Center',
          'Recycled Raw Materials',
          'City Policies (HQ)',
          'Waste Tracking System'
        ],
        tips: [
          'Save raw materials by recycling waste',
          'Earn bonuses by increasing your Circular Score',
          'Optimize efficiency with city policies'
        ]
      },
      4: {
        title: 'Clean Energy and Crisis',
        description: 'Environmental pressures are rising. Use wind power.',
        features: [
          'Wind Turbine',
          'Waste-to-Energy Plant',
          'Global Pollution Tracking',
          'Energy Priority System'
        ],
        tips: [
          'Increase clean energy capacity with wind power',
          'Take precautions before pollution drops health index',
          'Get double benefit by turning waste into energy'
        ]
      },
      5: {
        title: 'High Tech and Symbiosis',
        description: 'Sustainability has passed 70! Equip the city with technology.',
        features: [
          'Technology Factory',
          'Agricultural Areas',
          'Hydroelectric Plant',
          'Industrial Symbiosis',
          'Residence (Level 3)'
        ],
        tips: [
          'Enable resource sharing with industrial symbiosis',
          'Meet food/organic needs with agricultural areas',
          'Earn high profits with high-tech products'
        ]
      },
      6: {
        title: 'Net Zero City',
        description: 'You are at the mastery level! You built the world\'s most livable city.',
        features: [
          'Steel Factory',
          'Automotive Factory',
          'Net Zero Bonuses',
          'Achievements'
        ],
        tips: [
          'Try to zero out your carbon footprint',
          'Export the most advanced industrial products',
          'Keep citizen happiness at maximum'
        ]
      }
    };

    return levelInfo[level] || {
      title: `Level ${level}`,
      description: 'You have reached a new level!',
      features: [],
      tips: []
    };
  }
}

// Global instance
window.levelUnlocks = LevelUnlocks;

