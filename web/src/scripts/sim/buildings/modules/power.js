import { SimModule } from './simModule.js';

/**
 * Power module - checks energy pool for power availability
 */
export class PowerModule extends SimModule {
  /**
   * Amount of power this building needs per tick
   * @type {number}
   */
  required = 0;

  /**
   * @param {Building} building The building this module belongs to
   */
  constructor(building) {
    super();
    this.building = building;
  }

  /**
   * Returns true if building is fully powered (energy pool has enough energy)
   * @type {boolean}
   */
  get isFullyPowered() {
    if (this.required === 0) {
      return true; // Building doesn't need power
    }
    
    // Check if energy pool has enough energy
    if (window.gameState && window.gameState.energy >= this.required) {
      return true;
    }
    
    return false;
  }

  /**
   * Simulate power consumption - consume energy from pool if available
   * @param {City} city 
   */
  simulate(city) {
    if (this.required > 0 && window.gameState) {
      // Try to consume energy from pool
      if (window.gameState.energy >= this.required) {
        window.gameState.consumeEnergy(this.required);
      }
    }
  }
}