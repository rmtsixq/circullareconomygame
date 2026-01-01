/**
 * Game State Management
 * Manages money, energy, level, XP, and Circular Score
 */
export class GameState {
  constructor() {
    // Starting values
    this.money = 500000; // 💰
    this.energy = 100; // ⚡
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
   * Add money
   * @param {number} amount 
   */
  addMoney(amount) {
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
    this.xp += amount;
    this.checkLevelUp();
    this.updateUI();
  }

  /**
   * Check if player should level up
   */
  checkLevelUp() {
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
   * Calculate Circular Score based on game state
   * Formula: (Recycling × 10) + (Energy Efficiency × 5) + (Low Waste Bonus × 15) + (Production × 2) - (Waste Penalties)
   */
  calculateCircularScore(stats) {
    let score = 0;
    
    // Recycling points
    if (stats.recycling) {
      score += stats.recycling * 10;
    }
    
    // Energy efficiency points
    if (stats.energyEfficiency) {
      score += stats.energyEfficiency * 5;
    }
    
    // Low waste bonus
    if (stats.lowWasteBonus) {
      score += stats.lowWasteBonus * 15;
    }
    
    // Production points
    if (stats.production) {
      score += stats.production * 2;
    }
    
    // Waste penalties
    if (stats.wastePenalties) {
      score -= stats.wastePenalties;
    }
    
    this.circularScore = Math.max(0, score);
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
    const current = this.getCurrentLevelXPRequirement();
    const next = this.getNextLevelXPRequirement();
    const progress = this.xp - current;
    const total = next - current;
    return total > 0 ? (progress / total) * 100 : 100;
  }

  /**
   * Reset to initial state (for new game)
   */
  reset() {
    this.money = 500000;
    this.energy = 100;
    this.level = 1;
    this.xp = 0;
    this.circularScore = 0;
    this.updateUI();
  }
}

// Global game state instance
window.gameState = new GameState();

