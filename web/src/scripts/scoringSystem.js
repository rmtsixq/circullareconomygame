/**
 * Scoring System - Circular World
 * 5 City Indices: Refah (Well-being), Eğitim (Education), Sağlık (Health), 
 * Sürdürülebilirlik (Sustainability), Yönetim Puanı (Management Score)
 * 
 * Each score is 0-100 (except Yönetim which is cumulative).
 * Scores are recalculated every simulation tick from city state.
 */
export class ScoringSystem {
  constructor() {
    // City indices (0-100)
    this.wellbeing = 50;       // 🟢 Refah
    this.education = 30;       // 🎓 Eğitim
    this.health = 70;          // 🏥 Sağlık
    this.sustainability = 0;   // ♻️ Sürdürülebilirlik
    this.managementScore = 0;  // ⭐ Yönetim Puanı (cumulative)

    // Score change rates for smooth transitions
    this.targetWellbeing = 50;
    this.targetEducation = 30;
    this.targetHealth = 70;
    this.targetSustainability = 0;

    // Building contribution weights
    this.buildingContributions = {
      // Residential buildings
      'residential': {
        wellbeing: { base: 2, perLevel: 1 },
        health: { base: -0.5, perLevel: 0.2 },  // More houses = slight health pressure unless managed
      },
      // Commercial buildings (AVM)
      'commercial': {
        wellbeing: { base: 3, perLevel: 1.5 },
        health: { base: -0.3, perLevel: 0.1 },
      },
      // Farming
      'farming': {
        wellbeing: { base: 1.5, perLevel: 0.5 },
        health: { base: 1, perLevel: 0.5 },
        sustainability: { base: 2, perLevel: 1 },
      },
      // Textile Factory
      'textile-factory': {
        wellbeing: { base: 3, perLevel: 2 },      // Employment, income
        health: { base: -2, perLevel: -0.5 },      // Pollution
        sustainability: { base: -3, perLevel: 0 },  // Linear production
      },
      // Technology Factory
      'technology-factory': {
        wellbeing: { base: 4, perLevel: 2 },
        education: { base: 2, perLevel: 1 },
        health: { base: -1.5, perLevel: -0.3 },
        sustainability: { base: -2, perLevel: 0 },
      },
      // Steel Factory
      'steel-factory': {
        wellbeing: { base: 3, perLevel: 1.5 },
        health: { base: -3, perLevel: -1 },         // Heavy pollution
        sustainability: { base: -4, perLevel: 0 },
      },
      // Automotive Factory
      'automotive-factory': {
        wellbeing: { base: 5, perLevel: 2 },
        education: { base: 1, perLevel: 0.5 },
        health: { base: -2, perLevel: -0.5 },
        sustainability: { base: -3, perLevel: 0 },
      },
      // Recycling Center
      'recycling-center': {
        wellbeing: { base: 1, perLevel: 0.5 },
        health: { base: 2, perLevel: 1 },
        sustainability: { base: 8, perLevel: 3 },   // Major sustainability boost
      },
      // Solar Panel
      'solar-panel': {
        wellbeing: { base: 1, perLevel: 0.5 },
        health: { base: 1, perLevel: 0.5 },
        sustainability: { base: 5, perLevel: 2 },
      },
      // Wind Turbine
      'wind-turbine': {
        wellbeing: { base: 1, perLevel: 0.5 },
        health: { base: 1.5, perLevel: 0.5 },
        sustainability: { base: 6, perLevel: 2.5 },
      },
      // Hydro Plant
      'hydro-plant': {
        wellbeing: { base: 1.5, perLevel: 1 },
        health: { base: 1, perLevel: 0.5 },
        sustainability: { base: 5, perLevel: 2 },
      },
      // Waste to Energy
      'waste-to-energy': {
        wellbeing: { base: 1, perLevel: 0.5 },
        health: { base: -0.5, perLevel: 0.3 },     // Slight pollution but improves with level
      },
    };
  }

  /**
   * Recalculate all scores based on current city state
   * Called every simulation tick
   */
  calculate() {
    // Skip scoring during tutorial to prevent noise at game start
    if (window.tutorialState && window.tutorialState.isActive) {
      return {
        wellbeing: this.wellbeing,
        education: this.education,
        health: this.health,
        sustainability: this.sustainability,
        managementScore: this.managementScore
      };
    }

    if (!window.game || !window.game.city) return;

    const city = window.game.city;

    // Reset target scores to base values
    let wellbeingScore = 0;
    let educationScore = 0;
    let healthScore = 60; // Base health (clean environment default)
    let sustainabilityScore = 0;

    // Count buildings and their contributions
    let totalBuildings = 0;
    let residentialCount = 0;
    let factoryCount = 0;
    let renewableCount = 0;
    let recyclingCount = 0;
    let commercialCount = 0;
    let publicServiceCount = 0;
    let farmingCount = 0;

    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (!tile || !tile.building) continue;

        const building = tile.building;
        const type = building.type;
        const level = building.level || 1;

        totalBuildings++;

        // Count by type
        if (type === 'residential') residentialCount++;
        else if (type === 'commercial') commercialCount++;
        else if (type === 'farming') farmingCount++;
        else if (type === 'recycling-center') recyclingCount++;
        else if (['solar-panel', 'wind-turbine', 'hydro-plant'].includes(type)) renewableCount++;
        else if (['textile-factory', 'technology-factory', 'steel-factory', 'automotive-factory'].includes(type)) factoryCount++;

        // Apply building contributions
        const contributions = this.buildingContributions[type];
        if (contributions) {
          if (contributions.wellbeing) {
            wellbeingScore += contributions.wellbeing.base + (contributions.wellbeing.perLevel * (level - 1));
          }
          if (contributions.education) {
            educationScore += contributions.education.base + (contributions.education.perLevel * (level - 1));
          }
          if (contributions.health) {
            healthScore += contributions.health.base + (contributions.health.perLevel * (level - 1));
          }
          if (contributions.sustainability) {
            sustainabilityScore += contributions.sustainability.base + (contributions.sustainability.perLevel * (level - 1));
          }
        }
      }
    }

    // === WELLBEING (Refah) ===
    // Bonus for balanced city (mix of residential, commercial, services)
    if (residentialCount > 0 && commercialCount > 0) {
      wellbeingScore += 5; // Balance bonus
    }
    if (publicServiceCount > 0) {
      wellbeingScore += 3; // Public services bonus
    }

    // === EDUCATION (Eğitim) ===
    // Base education from having any buildings
    if (totalBuildings > 0) {
      educationScore += Math.min(15, totalBuildings * 0.5);
    }
    // Factory diversity bonus
    if (factoryCount > 0) {
      educationScore += Math.min(10, factoryCount * 2);
    }
    // Recycling awareness bonus
    if (recyclingCount > 0) {
      educationScore += recyclingCount * 5;
    }

    // === HEALTH (Sağlık) ===
    // Pollution penalty
    if (window.globalPollution) {
      const pollution = window.globalPollution.totalPollution;
      healthScore -= pollution * 0.5;
    }
    // Waste penalty
    if (window.resourceManager) {
      const wastePercent = window.resourceManager.getWastePercentage();
      healthScore -= wastePercent * 0.3;
    }
    // Green space bonus (farming + renewables)
    healthScore += Math.min(10, (farmingCount + renewableCount) * 2);

    // === SUSTAINABILITY (Sürdürülebilirlik) ===
    // Recycling rate bonus
    if (window.resourceManager) {
      const recycled =
        window.resourceManager.getResource('recycled-fabric') +
        window.resourceManager.getResource('recycled-metal') +
        window.resourceManager.getResource('recycled-plastic') +
        window.resourceManager.getResource('recycled-electronics');
      sustainabilityScore += Math.min(15, recycled * 0.3);
    }
    // Renewable energy ratio
    const totalEnergy = renewableCount + factoryCount;
    if (totalEnergy > 0) {
      const renewableRatio = renewableCount / totalEnergy;
      sustainabilityScore += renewableRatio * 20;
    }
    // Circular loop bonus: recycling center + factory combo
    if (recyclingCount > 0 && factoryCount > 0) {
      sustainabilityScore += 10; // Closing the loop bonus
    }

    // Clamp all scores to 0-100
    this.targetWellbeing = Math.max(0, Math.min(100, wellbeingScore));
    this.targetEducation = Math.max(0, Math.min(100, educationScore));
    this.targetHealth = Math.max(0, Math.min(100, healthScore));
    this.targetSustainability = Math.max(0, Math.min(100, sustainabilityScore));

    // Smooth transition towards target scores (avoid jumpy UI)
    const smoothFactor = 0.15;
    this.wellbeing += (this.targetWellbeing - this.wellbeing) * smoothFactor;
    this.education += (this.targetEducation - this.education) * smoothFactor;
    this.health += (this.targetHealth - this.health) * smoothFactor;
    this.sustainability += (this.targetSustainability - this.sustainability) * smoothFactor;

    // Round for display
    this.wellbeing = Math.round(this.wellbeing * 10) / 10;
    this.education = Math.round(this.education * 10) / 10;
    this.health = Math.round(this.health * 10) / 10;
    this.sustainability = Math.round(this.sustainability * 10) / 10;

    // === MANAGEMENT SCORE (Yönetim Puanı) ===
    // Cumulative: average of all four scores, added each tick
    const avgSatisfaction = (this.wellbeing + this.education + this.health + this.sustainability) / 4;
    // Small increment per tick based on average satisfaction
    this.managementScore += avgSatisfaction * 0.01;
    this.managementScore = Math.round(this.managementScore * 10) / 10;

    // Update the old circularScore for backward compatibility
    if (window.gameState) {
      window.gameState.circularScore = Math.round(this.sustainability);
      window.gameState.wellbeing = Math.round(this.wellbeing);
      window.gameState.education = Math.round(this.education);
      window.gameState.health = Math.round(this.health);
      window.gameState.sustainability = Math.round(this.sustainability);
      window.gameState.managementScore = Math.round(this.managementScore);
    }

    return {
      wellbeing: this.wellbeing,
      education: this.education,
      health: this.health,
      sustainability: this.sustainability,
      managementScore: this.managementScore
    };
  }

  /**
   * Get score color based on value (0-100)
   * @param {number} score 
   * @returns {string} CSS color
   */
  static getScoreColor(score) {
    if (score >= 75) return '#4CAF50';  // Green
    if (score >= 50) return '#8BC34A';  // Light green
    if (score >= 35) return '#FFC107';  // Yellow
    if (score >= 20) return '#FF9800';  // Orange
    return '#f44336';                    // Red
  }

  /**
   * Get score emoji based on value
   * @param {number} score 
   * @returns {string}
   */
  static getScoreEmoji(score) {
    if (score >= 75) return '🟢';
    if (score >= 50) return '🟡';
    if (score >= 25) return '🟠';
    return '🔴';
  }

  /**
   * Check game over / victory conditions
   * Returns: 'success', 'partial-risk', 'collapse', 'total-collapse', or null
   */
  checkGameCondition() {
    // Success: Net sıfır atık, Refah > 75, low resource intensity
    if (this.wellbeing > 75 && this.health > 70 && this.sustainability > 75) {
      return 'success';
    }

    // Total Collapse: Resource depletion + waste accumulation
    if (this.health < 15 && this.wellbeing < 15) {
      return 'total-collapse';
    }

    // Collapse: Health < 30 or Wellbeing < 25
    if (this.health < 30 || this.wellbeing < 25) {
      return 'collapse';
    }

    // Partial risk: Sustainability too low
    if (this.sustainability < 20 && window.gameState && window.gameState.level >= 3) {
      return 'partial-risk';
    }

    return null;
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.wellbeing = 50;
    this.education = 30;
    this.health = 70;
    this.sustainability = 0;
    this.managementScore = 0;
    this.targetWellbeing = 50;
    this.targetEducation = 30;
    this.targetHealth = 70;
    this.targetSustainability = 0;
  }
}

// Global instance
window.scoringSystem = new ScoringSystem();
