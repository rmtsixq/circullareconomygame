import { SimModule } from './simModule.js';

/**
 * Waste Module - Manages local waste for a building
 * Each building has its own waste storage (max 100)
 */
export class WasteModule extends SimModule {
  /**
   * Current waste amount (0-100)
   * @type {number}
   */
  amount = 0;
  
  /**
   * Maximum waste capacity
   * @type {number}
   */
  maxCapacity = 100;
  
  /**
   * Waste production rate per tick
   * @type {number}
   */
  productionRate = 0;
  
  /**
   * Waste type produced by this building
   * @type {string}
   */
  wasteType = null; // 'textile-waste', 'e-waste', 'scrap-metal', 'organic-waste'
  
  /**
   * Last tick when waste was produced (to control production frequency)
   * @type {number}
   */
  lastProductionTick = 0;
  
  /**
   * Production interval (every N ticks)
   * @type {number}
   */
  productionInterval = 3; // Produce waste every 3 ticks
  
  /**
   * Reference to the building this waste module belongs to
   * @type {Building}
   */
  #building = null;
  
  constructor(building) {
    super(building);
    this.#building = building;
  }
  
  /**
   * Produce waste
   * @param {number} amount - Amount to produce
   */
  produce(amount) {
    this.amount = Math.min(this.amount + amount, this.maxCapacity);
  }
  
  /**
   * Remove waste (for recycling)
   * @param {number} amount - Amount to remove
   * @returns {number} Actual amount removed
   */
  remove(amount) {
    const removed = Math.min(amount, this.amount);
    this.amount = Math.max(0, this.amount - removed);
    return removed;
  }
  
  /**
   * Get waste level as percentage (0-100)
   * @returns {number}
   */
  getLevel() {
    return (this.amount / this.maxCapacity) * 100;
  }
  
  /**
   * Check if building is at critical waste level
   * @returns {boolean}
   */
  isCritical() {
    return this.amount >= 95;
  }
  
  /**
   * Check if building is at warning level
   * @returns {boolean}
   */
  isWarning() {
    return this.amount >= 80;
  }
  
  /**
   * Get production efficiency penalty based on waste level
   * @returns {number} 0-1 multiplier (1 = no penalty, 0.5 = 50% penalty)
   */
  getEfficiencyPenalty() {
    if (this.amount >= 100) {
      return 0; // Building stops
    } else if (this.amount >= 95) {
      return 0.5; // -50% production
    } else if (this.amount >= 80) {
      return 0.8; // -20% production
    }
    return 1; // No penalty
  }
  
  /**
   * Simulate waste production
   * @param {City} city 
   * @param {number} currentTick 
   */
  simulate(city, currentTick) {
    // Check if waste system is unlocked (Level 3+)
    if (!window.gameState || !window.levelUnlocks) {
      return;
    }
    
    if (!window.levelUnlocks.isUnlocked('local-waste', window.gameState.level)) {
      // Waste system not unlocked yet - don't produce waste
      return;
    }
    
    // Produce waste at intervals
    if (this.productionRate > 0 && 
        this.wasteType && 
        (currentTick - this.lastProductionTick) >= this.productionInterval) {
      const wasteProduced = this.productionRate;
      this.produce(wasteProduced);
      this.lastProductionTick = currentTick;
      
      // Add to global pollution (waste leaks to city) - only if unlocked (Level 6+)
      if (window.globalPollution && 
          window.levelUnlocks.isUnlocked('global-pollution', window.gameState.level)) {
        window.globalPollution.addWaste(this.wasteType, wasteProduced * 0.1); // 10% leaks to city
      }
      
      // Show waste effect (only if building has significant waste AND building is not stopped)
      // Don't show waste effect if building is stopped (waste >= 100)
      if (window.visualEffects && this.#building && wasteProduced >= 0.5 && this.amount < 100) {
        window.visualEffects.showWasteEffect(this.#building, wasteProduced);
      }
    }
  }
  
  /**
   * Reset waste module
   */
  reset() {
    this.amount = 0;
    this.lastProductionTick = 0;
  }
}

