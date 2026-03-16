import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

export class PowerPlant extends Building {

  /**
   * Available units of power (kW)
   */
  powerCapacity = 100;

  /**
   * Consumed units of power
   */
  powerConsumed = 0;

  constructor(x, y) {
    super(x, y);
    this.type = BuildingType.powerPlant;
    this.name = 'Power Plant';
  }

  /**
   * Get base cost of power plant
   * @returns {number}
   */
  getBaseCost() {
    return 20000;
  }

  /**
   * Gets the amount of power available
   */
  get powerAvailable() {
    // Power plant must have road access in order to provide power
    if (this.roadAccess.value) {
      return this.powerCapacity - this.powerConsumed;
    } else {
      return 0;
    }
  }

  refreshView() {
    let mesh = window.assetManager.getModel(this.type, this);
    this.setMesh(mesh);
  }

  /**
   * Simulate power plant for one tick
   * @param {City} city 
   */
  simulate(city) {
    super.simulate(city);

    // Produce energy if road access is available
    // Power plant produces a small amount each tick (not full capacity)
    if (this.roadAccess.value && window.gameState) {
      // Produce 10 energy per tick (much more reasonable)
      window.gameState.addEnergy(10);
    }
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `
      <div class="info-heading">
        <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        Power Plant
      </div>
      <span class="info-label">Energy Capacity </span>
      <span class="info-value">${this.powerCapacity} <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
      <br>
      <span class="info-label">Consumed </span>
      <span class="info-value">${this.powerConsumed} <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
      <br>
      <span class="info-label">Available </span>
      <span class="info-value">${this.powerAvailable} <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
      <br>
      <span class="info-label">Road Access </span>
      <span class="info-value">${this.roadAccess.value ? 'Yes' : 'No'}</span>
      <br>
    `;
    return html;
  }
}