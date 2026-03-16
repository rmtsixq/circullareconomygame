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
    // XP is now a secondary progress mechanic (optional visualization)
    this.xp = 0;
    this.circularScore = 0;

    // City Indices (0-100) - from ScoringSystem
    this.wellbeing = 50;       // 🟢 Wellbeing
    this.education = 30;       // 🎓 Education
    this.health = 70;          // 🏥 Health
    this.sustainability = 0;   // ♻️ Sustainability
    this.managementScore = 0;  // ⭐ Management Score

    /**
     * Total city population
     * @type {number}
     */
    this.population = 0;
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
   * Now based on score conditions from LevelUnlocks
   */
  checkLevelUp() {
    if (!window.levelUnlocks) return;

    // Disable leveling during tutorial to prevent flow breakage
    if (window.tutorialState && window.tutorialState.isActive) {
      return;
    }

    const nextLevel = this.level + 1;
    if (nextLevel <= 6) {
      if (window.levelUnlocks.isRequirementMet(nextLevel, this)) {
        const previousLevel = this.level;
        this.level = nextLevel;

        console.log(`Level up! Now level ${this.level}`);

        // Initialize market based on new level
        if (window.market) {
          window.market.initialize(this.level);
        }

        // Notify UI to update unlocked features
        if (window.ui && window.ui.onLevelUp) {
          window.ui.onLevelUp(this.level, previousLevel);
        }

        // Check for subsequent level ups (in case multiple levels reached at once)
        this.checkLevelUp();
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
   * Now delegates to the ScoringSystem for full 5-index calculation
   */
  calculateCircularScore() {
    if (window.scoringSystem) {
      const scores = window.scoringSystem.calculate();
      if (scores) {
        this.circularScore = Math.round(scores.sustainability);
      }
    }
    if (window.game && window.game.city) {
      this.population = window.game.city.population;
    }

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
   * Get XP progress percentage for current level
   * (Simplified since leveling is score-based)
   * @returns {number} 0-100
   */
  getXPProgress() {
    // Return a dummy value or use managementScore/total indices as progress
    const totalScore = (this.wellbeing + this.sustainability + this.health + this.education) / 4;
    return totalScore;
  }

  /**
   * Get display XP
   * @returns {number}
   */
  getDisplayXP() {
    return Math.round(this.managementScore);
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
    this.wellbeing = 50;
    this.education = 30;
    this.health = 70;
    this.sustainability = 0;
    this.managementScore = 0;
    if (window.scoringSystem) {
      window.scoringSystem.reset();
    }
    this.updateUI();
  }
}

// Global game state instance
window.gameState = new GameState();

