/**
 * Global Pollution System - Manages city-wide pollution from waste
 * Local waste leaks to global pollution, which affects city-wide penalties
 */
export class GlobalPollution {
  constructor() {
    // Pollution levels (0-100%)
    this.pollution = {
      'textile-waste': 0,
      'e-waste': 0,
      'scrap-metal': 0,
      'organic-waste': 0
    };
    
    // Total pollution percentage (0-100)
    this.totalPollution = 0;
    
    // Pollution thresholds
    this.thresholds = {
      warning: 50,
      critical: 75,
      danger: 90,
      maximum: 100
    };
    
    // Last penalty check tick
    this.lastPenaltyTick = 0;
    this.penaltyCheckInterval = 10; // Check every 10 ticks
    
    // Active penalties
    this.activePenalties = {
      circularScore: false,
      xpReduction: false,
      marketPrices: false,
      eventTriggered: false
    };
  }
  
  /**
   * Add waste to global pollution
   * @param {string} wasteType 
   * @param {number} amount 
   */
  addWaste(wasteType, amount) {
    if (this.pollution.hasOwnProperty(wasteType)) {
      this.pollution[wasteType] = Math.min(100, this.pollution[wasteType] + amount);
      this.updateTotalPollution();
    }
  }
  
  /**
   * Remove waste from global pollution (via recycling)
   * @param {string} wasteType 
   * @param {number} amount 
   */
  removeWaste(wasteType, amount) {
    if (this.pollution.hasOwnProperty(wasteType)) {
      this.pollution[wasteType] = Math.max(0, this.pollution[wasteType] - amount);
      this.updateTotalPollution();
    }
  }
  
  /**
   * Update total pollution percentage
   */
  updateTotalPollution() {
    const total = Object.values(this.pollution).reduce((sum, val) => sum + val, 0);
    this.totalPollution = Math.min(100, total / Object.keys(this.pollution).length);
  }
  
  /**
   * Get pollution level category
   * @returns {string} 'clean', 'warning', 'critical', 'danger', 'maximum'
   */
  getLevel() {
    if (this.totalPollution >= 100) return 'maximum';
    if (this.totalPollution >= 90) return 'danger';
    if (this.totalPollution >= 75) return 'critical';
    if (this.totalPollution >= 50) return 'warning';
    return 'clean';
  }
  
  /**
   * Apply penalties based on pollution level
   * @param {number} currentTick 
   */
  applyPenalties(currentTick) {
    if ((currentTick - this.lastPenaltyTick) < this.penaltyCheckInterval) {
      return;
    }
    this.lastPenaltyTick = currentTick;
    
    const level = this.getLevel();
    
    // Reset penalties
    this.activePenalties = {
      circularScore: false,
      xpReduction: false,
      marketPrices: false,
      eventTriggered: false
    };
    
    // Apply penalties based on level
    if (this.totalPollution >= 50) {
      // Circular Score penalty
      this.activePenalties.circularScore = true;
      if (window.gameState) {
        // Reduce circular score growth rate
        window.gameState.circularScoreMultiplier = Math.max(0.5, 1 - (this.totalPollution / 100));
      }
    }
    
    if (this.totalPollution >= 75) {
      // XP reduction
      this.activePenalties.xpReduction = true;
      if (window.gameState) {
        window.gameState.xpMultiplier = 0.75; // -25% XP
      }
    }
    
    if (this.totalPollution >= 90) {
      // Market price reduction
      this.activePenalties.marketPrices = true;
      // Market prices will be reduced in UI
    }
    
    if (this.totalPollution >= 100) {
      // Trigger event/ceza
      this.activePenalties.eventTriggered = true;
      this.triggerPollutionEvent();
    }
    
    // Apply bonuses for low pollution
    if (this.totalPollution < 20 && window.gameState) {
      // Bonus XP for clean city
      window.gameState.xpMultiplier = 1.1; // +10% XP
    }
  }
  
  /**
   * Trigger pollution event
   */
  triggerPollutionEvent() {
    if (window.ui) {
      window.ui.showNotification(
        '⚠️ Kirlilik Uyarısı!',
        'Şehir kirliliği maksimum seviyeye ulaştı! Acil önlem alın.',
        'error'
      );
    }
  }
  
  /**
   * Natural pollution decay (slow reduction over time)
   */
  decay() {
    // Pollution naturally decays at 0.1% per tick
    Object.keys(this.pollution).forEach(wasteType => {
      this.pollution[wasteType] = Math.max(0, this.pollution[wasteType] - 0.1);
    });
    this.updateTotalPollution();
  }
  
  /**
   * Reset pollution
   */
  reset() {
    Object.keys(this.pollution).forEach(wasteType => {
      this.pollution[wasteType] = 0;
    });
    this.totalPollution = 0;
    this.activePenalties = {
      circularScore: false,
      xpReduction: false,
      marketPrices: false,
      eventTriggered: false
    };
  }
}

// Global instance
window.globalPollution = new GlobalPollution();

