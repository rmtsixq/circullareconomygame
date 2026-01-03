import * as THREE from 'three';
import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

/**
 * Waste-to-Energy Plant - Converts waste into energy
 * Expensive but converts waste into valuable energy
 */
export class WasteToEnergyPlant extends Building {
  type = BuildingType.wasteToEnergy;
  
  /**
   * Current level of the plant (1-3)
   * @type {number}
   */
  level = 1;
  
  /**
   * Maximum level
   * @type {number}
   */
  maxLevel = 3;
  
  /**
   * Waste consumption per tick by level
   * @type {Object}
   */
  wasteConsumptionByLevel = {
    1: 2,   // 2 waste per tick
    2: 4,   // 4 waste per tick
    3: 6    // 6 waste per tick
  };
  
  /**
   * Energy production per waste unit by level
   * @type {Object}
   */
  energyPerWasteByLevel = {
    1: 8,   // 8 energy per waste unit (16 energy per tick at level 1)
    2: 10,  // 10 energy per waste unit (40 energy per tick at level 2)
    3: 12   // 12 energy per waste unit (72 energy per tick at level 3)
  };
  
  /**
   * Processing progress (0-1)
   * @type {number}
   */
  processingProgress = 0;
  
  /**
   * Processing rate per tick
   * @type {number}
   */
  processingRate = 0.1; // 10 ticks per cycle

  constructor(x = 0, y = 0) {
    super(x, y);
    this.name = 'Atıktan Enerji Tesisi';
    // Plant consumes some energy for operation
    this.power.required = 5;
  }

  /**
   * Get current waste consumption
   * @returns {number}
   */
  get wasteConsumption() {
    return this.wasteConsumptionByLevel[this.level] || 2;
  }

  /**
   * Get energy production per waste unit
   * @returns {number}
   */
  get energyPerWaste() {
    return this.energyPerWasteByLevel[this.level] || 8;
  }

  /**
   * Get total energy production per cycle
   * @returns {number}
   */
  get energyProduction() {
    return this.wasteConsumption * this.energyPerWaste;
  }

  /**
   * Upgrade plant to next level
   * @returns {boolean} True if upgrade successful
   */
  upgrade() {
    if (this.level >= this.maxLevel) {
      return false;
    }

    const upgradeCost = this.getUpgradeCost();
    if (window.gameState && window.gameState.spendMoney(upgradeCost)) {
      this.level++;
      this.refreshView();
      return true;
    } else if (window.gameState) {
      // Not enough money - show notification
      if (window.ui) {
        window.ui.showNotification(
          '💰 Yetersiz Para',
          `Yükseltme için ${upgradeCost.toLocaleString()} 💰 gerekiyor. Mevcut paranız: ${window.gameState.money.toLocaleString()} 💰`,
          'error'
        );
      }
    }
    
    return false;
  }

  /**
   * Get upgrade cost for current level
   * @returns {number}
   */
  getUpgradeCost() {
    // Very expensive upgrades
    return Math.floor(this.getBaseCost() * Math.pow(2.0, this.level));
  }

  /**
   * Get base cost of waste-to-energy plant
   * @returns {number}
   */
  getBaseCost() {
    return 150000; // Very expensive - 150k base cost
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
      console.error(`Model not found: ${modelName} for waste-to-energy plant`);
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
   * Simulate waste-to-energy plant for one tick
   * @param {City} city 
   */
  simulate(city) {
    super.simulate(city);
    
    // Only operate if powered, has road access, and waste system is unlocked
    if (!this.power.isFullyPowered || !this.roadAccess.value || !window.resourceManager) {
      return;
    }
    
    // Check if waste system is unlocked (Level 3+)
    const wasteSystemUnlocked = window.gameState && window.levelUnlocks &&
        window.levelUnlocks.isUnlocked('local-waste', window.gameState.level);
    
    if (!wasteSystemUnlocked) {
      return;
    }
    
    // Process waste into energy
    this.processingProgress += this.processingRate;
    
    if (this.processingProgress >= 1) {
      const cyclesToProcess = Math.floor(this.processingProgress);
      this.processingProgress -= cyclesToProcess;
      
      for (let i = 0; i < cyclesToProcess; i++) {
        // Try to consume waste (prioritize different waste types)
        const wasteTypes = ['organic-waste', 'textile-waste', 'plastic-waste', 'e-waste', 'scrap-metal'];
        let totalWasteConsumed = 0;
        const wasteToConsume = this.wasteConsumption;
        
        for (const wasteType of wasteTypes) {
          if (totalWasteConsumed >= wasteToConsume) break;
          
          const available = window.resourceManager.getResource(wasteType);
          if (available > 0) {
            const consume = Math.min(available, wasteToConsume - totalWasteConsumed);
            window.resourceManager.removeResource(wasteType, consume);
            totalWasteConsumed += consume;
          }
        }
        
        // If we consumed waste, produce energy
        if (totalWasteConsumed > 0) {
          const energyProduced = totalWasteConsumed * this.energyPerWaste;
          if (window.gameState) {
            window.gameState.addEnergy(energyProduced);
          }
          
          // Add XP
          if (window.gameState) {
            window.gameState.addXP(Math.floor(totalWasteConsumed));
          }
          
          // Add Circular Score (waste-to-energy is good for circular economy)
          if (window.gameState) {
            window.gameState.updateCircularScore(totalWasteConsumed * 2);
          }
          
          // Show energy effect
          if (window.visualEffects) {
            window.visualEffects.showEnergyEffect(this, energyProduced);
          }
        }
      }
    }
  }

  /**
   * Returns HTML representation
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    
    // Calculate current waste available
    let totalWasteAvailable = 0;
    if (window.resourceManager) {
      totalWasteAvailable = 
        window.resourceManager.getResource('organic-waste') +
        window.resourceManager.getResource('textile-waste') +
        window.resourceManager.getResource('plastic-waste') +
        window.resourceManager.getResource('e-waste') +
        window.resourceManager.getResource('scrap-metal');
    }
    
    html += `
      <div class="info-heading">⚡ Atıktan Enerji Tesisi</div>
      <span class="info-label">Seviye </span>
      <span class="info-value">${this.level}/${this.maxLevel}</span>
      <br>
      <span class="info-label">Enerji </span>
      <span class="info-value">${this.power.isFullyPowered ? this.power.required : 0}/${this.power.required} ⚡</span>
      <br>
      <span class="info-label">Atık Tüketimi </span>
      <span class="info-value">${this.wasteConsumption} atık/döngü</span>
      <br>
      <span class="info-label">Enerji Üretimi </span>
      <span class="info-value">${this.energyProduction} ⚡/döngü</span>
      <br>
      <span class="info-label">Enerji/Atık Oranı </span>
      <span class="info-value">${this.energyPerWaste} ⚡/atık</span>
      <br>
      <span class="info-label">Mevcut Atık </span>
      <span class="info-value">${totalWasteAvailable.toLocaleString()}</span>
      <br>
      <span class="info-label">İşlem İlerlemesi </span>
      <span class="info-value">${(this.processingProgress * 100).toFixed(0)}%</span>
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

