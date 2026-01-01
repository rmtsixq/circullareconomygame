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
      <div class="info-heading">⚡ Enerji Santrali</div>
      <span class="info-label">Enerji Kapasitesi </span>
      <span class="info-value">${this.powerCapacity} ⚡</span>
      <br>
      <span class="info-label">Tüketilen </span>
      <span class="info-value">${this.powerConsumed} ⚡</span>
      <br>
      <span class="info-label">Kullanılabilir </span>
      <span class="info-value">${this.powerAvailable} ⚡</span>
      <br>
      <span class="info-label">Yol Erişimi </span>
      <span class="info-value">${this.roadAccess.value ? '✅ Var' : '❌ Yok'}</span>
      <br>
    `;
    return html;
  }
}