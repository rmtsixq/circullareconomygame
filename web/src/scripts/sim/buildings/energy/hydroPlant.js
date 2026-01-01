import * as THREE from 'three';
import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

/**
 * Hydro Plant (Gravity Dam) - Produces energy from water
 */
export class HydroPlant extends Building {
  type = BuildingType.hydroPlant;
  
  /**
   * Current level of the hydro plant (1-3)
   * @type {number}
   */
  level = 1;
  
  /**
   * Maximum level
   * @type {number}
   */
  maxLevel = 3;
  
  /**
   * Energy production per tick by level
   * @type {Object}
   */
  energyProductionByLevel = {
    1: 15,  // 15 energy per tick
    2: 22,  // 22 energy per tick
    3: 30   // 30 energy per tick
  };

  constructor(x = 0, y = 0) {
    super(x, y);
    this.name = 'Hydro Plant';
    // Hydro plants don't consume energy, they produce it
    this.power.required = 0;
  }

  /**
   * Get current energy production
   * @returns {number}
   */
  get energyProduction() {
    return this.energyProductionByLevel[this.level] || 15;
  }

  /**
   * Upgrade hydro plant to next level
   * @returns {boolean} True if upgrade successful
   */
  upgrade() {
    if (this.level >= this.maxLevel) {
      return false;
    }

    const upgradeCost = this.getUpgradeCost();
    if (window.gameState && window.gameState.spendMoney(upgradeCost)) {
      this.level++;
      return true;
    }
    
    return false;
  }

  /**
   * Get upgrade cost for current level
   * @returns {number}
   */
  getUpgradeCost() {
    // Base cost * 1.25^(current level) - reduced from 1.8
    return Math.floor(this.getBaseCost() * Math.pow(1.25, this.level));
  }

  /**
   * Get base cost of hydro plant
   * @returns {number}
   */
  getBaseCost() {
    return 30000;
  }

  /**
   * Refresh view with appropriate model
   */
  refreshView() {
    if (!window.assetManager) {
      console.error('AssetManager not available');
      return;
    }
    
    let modelName = `${this.type}-${this.level}`;
    
    // Check if model exists
    if (!window.assetManager.models || !window.assetManager.models[modelName]) {
      // Fallback to level 1
      modelName = `${this.type}-1`;
    }
    
    if (!window.assetManager.models || !window.assetManager.models[modelName]) {
      console.error(`Model not found: ${modelName} for hydro plant`);
      return;
    }
    
    try {
      let mesh = window.assetManager.getModel(modelName, this);
      
      if (!mesh) {
        console.error(`Failed to load model: ${modelName}`);
        return;
      }
      
      this.setMesh(mesh);
    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error);
    }
  }

  /**
   * Simulate hydro plant for one tick
   * @param {City} city 
   */
  simulate(city) {
    super.simulate(city);
    
    // Produce energy only if road access is available
    if (window.gameState && this.roadAccess.value) {
      const energyProduced = this.energyProduction;
      window.gameState.addEnergy(energyProduced);
      
      // Show energy effect occasionally (every 5 ticks to avoid spam)
      if (window.visualEffects && window.game && (window.game.currentTick % 5 === 0)) {
        window.visualEffects.showEnergyEffect(this, energyProduced);
      }
    }
  }

  /**
   * Returns HTML representation
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    
    html += `
      <div class="info-heading">💧 Hidroelektrik Santrali</div>
      <span class="info-label">Seviye </span>
      <span class="info-value">${this.level}/${this.maxLevel}</span>
      <br>
      <span class="info-label">Enerji Üretimi </span>
      <span class="info-value">${this.energyProduction} ⚡/tick</span>
      <br>
    `;
    
    // Upgrade button
    if (this.level < this.maxLevel) {
      const upgradeCost = this.getUpgradeCost();
      html += `
        <div style="padding: 8px; margin-top: 8px;">
          <button class="action-button" onclick="window.game?.upgradeFactory(${this.x}, ${this.y})" style="width: 100%;">
            ⬆️ Yükselt (${upgradeCost.toLocaleString()} 💰)
          </button>
        </div>
      `;
    }
    
    return html;
  }
}

