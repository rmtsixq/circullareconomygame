import * as THREE from 'three';
import { Building } from './building.js';
import { BuildingType } from './buildingType.js';

/**
 * Recycling Center - Converts waste into recycled materials
 */
export class RecyclingCenter extends Building {
  type = BuildingType.recyclingCenter;
  
  /**
   * Current level of the recycling center (1-3)
   * @type {number}
   */
  level = 1;
  
  /**
   * Maximum level
   * @type {number}
   */
  maxLevel = 3;
  
  /**
   * Energy consumption per tick
   * @type {number}
   */
  energyConsumption = 8;
  
  /**
   * Base recycling efficiency by level (%)
   * @type {Object}
   */
  efficiencyByLevel = {
    1: 0.50, // 50%
    2: 0.70, // 70%
    3: 0.90  // 90%
  };
  
  /**
   * Boost efficiency bonus (when manually triggered)
   * @type {number}
   */
  boostEfficiencyBonus = 0.10; // +10%
  
  /**
   * Boost duration in ticks (30 seconds = 12 ticks at 2.5s per tick)
   * @type {number}
   */
  boostDuration = 12; // 30 seconds / 2.5 seconds per tick
  
  /**
   * Current boost remaining ticks
   * @type {number}
   */
  boostRemaining = 0;
  
  /**
   * Auto-recycling enabled (default: true)
   * @type {boolean}
   */
  autoRecycling = true;
  
  /**
   * Auto-recycling rate per tick (how much to process)
   * @type {Object}
   */
  autoRecyclingRateByLevel = {
    1: 2,  // Process 2 waste per tick
    2: 4,  // Process 4 waste per tick
    3: 6   // Process 6 waste per tick
  };
  
  /**
   * Waste conversion recipes
   * Maps waste types to recycled materials
   * @type {Object}
   */
  wasteRecipes = {
    'textile-waste': 'recycled-fabric',
    'e-waste': 'recycled-electronics',
    'scrap-metal': 'recycled-metal',
    'plastic-waste': 'recycled-plastic'
  };

  constructor(x = 0, y = 0) {
    super(x, y);
    // Recycling center consumes energy for auto-recycling
    this.power.required = this.energyConsumption;
    this.name = 'Recycling Center';
  }
  
  /**
   * Simulate recycling center for one tick
   * @param {City} city 
   * @param {number} currentTick 
   */
  simulate(city, currentTick = 0) {
    super.simulate(city);
    
    // Decrease boost timer
    if (this.boostRemaining > 0) {
      this.boostRemaining--;
    }
    
    // Auto-recycling if enabled and powered
    if (this.autoRecycling && this.power.isFullyPowered && window.resourceManager) {
      this.processAutoRecycling();
    }
  }
  
  /**
   * Process automatic recycling (called every tick)
   */
  processAutoRecycling() {
    if (!window.resourceManager || !this.power.isFullyPowered) {
      return;
    }

    const efficiency = this.efficiency;
    const rate = this.autoRecyclingRate;
    let totalRecycled = 0;
    
    // Process global waste (from resourceManager)
    Object.entries(this.wasteRecipes).forEach(([wasteType, recycledType]) => {
      const wasteAmount = window.resourceManager.getResource(wasteType);
      
      if (wasteAmount > 0) {
        // Process up to 'rate' amount per tick
        const toRecycle = Math.min(wasteAmount, rate);
        const recycledAmount = toRecycle * efficiency;
        
        // Remove waste
        window.resourceManager.removeResource(wasteType, toRecycle);
        
        // Add recycled material
        window.resourceManager.addResource(recycledType, recycledAmount);
        
        totalRecycled += recycledAmount;
      }
    });
    
    // Process local waste from buildings in the city
    if (window.game && window.game.city) {
      let processedLocalWaste = 0;
      const maxLocalWastePerTick = rate;
      
      window.game.city.traverse((obj) => {
        if (obj.building && obj.building.waste && processedLocalWaste < maxLocalWastePerTick) {
          const waste = obj.building.waste;
          
          // Check if this building has waste that we can recycle
          if (waste.amount > 0 && waste.wasteType && this.wasteRecipes[waste.wasteType]) {
            const recycledType = this.wasteRecipes[waste.wasteType];
            const toRecycle = Math.min(waste.amount, 1); // Max 1 per building per tick for auto
            const recycledAmount = toRecycle * efficiency;
            
            // Remove from local waste
            waste.remove(toRecycle);
            
            // Refresh building view if waste was removed
            if (toRecycle > 0 && typeof obj.building.refreshView === 'function') {
              obj.building.refreshView();
            }
            
            // Add recycled material
            window.resourceManager.addResource(recycledType, recycledAmount);
            
            // Reduce global pollution
            if (window.globalPollution) {
              window.globalPollution.removeWaste(waste.wasteType, toRecycle * 0.1);
            }
            
            totalRecycled += recycledAmount;
            processedLocalWaste += toRecycle;
          }
        }
      });
    }
    
    // Add XP and update Circular Score based on total recycled amount
    if (window.gameState && totalRecycled > 0) {
      window.gameState.addXP(Math.floor(totalRecycled * 0.5)); // Less XP for auto (0.5x)
      window.gameState.updateCircularScore(Math.floor(totalRecycled));
    }
  }

  /**
   * Get current recycling efficiency (with boost if active)
   * @returns {number} 0-1
   */
  get efficiency() {
    const baseEfficiency = this.efficiencyByLevel[this.level] || 0.5;
    const boost = this.boostRemaining > 0 ? this.boostEfficiencyBonus : 0;
    return Math.min(1.0, baseEfficiency + boost);
  }
  
  /**
   * Get current auto-recycling rate
   * @returns {number}
   */
  get autoRecyclingRate() {
    return this.autoRecyclingRateByLevel[this.level] || 2;
  }
  
  /**
   * Check if boost is active
   * @returns {boolean}
   */
  get isBoosted() {
    return this.boostRemaining > 0;
  }

  /**
   * Process manual recycling (immediate, no boost)
   * Processes both global waste (resourceManager) and local waste from buildings
   */
  processRecycling() {
    if (!window.resourceManager || !this.power.isFullyPowered) {
      return;
    }

    // Use base efficiency (no boost for manual recycling)
    const efficiency = this.efficiencyByLevel[this.level] || 0.5;
    let totalRecycled = 0;
    
    // First, process global waste (from resourceManager)
    Object.entries(this.wasteRecipes).forEach(([wasteType, recycledType]) => {
      const wasteAmount = window.resourceManager.getResource(wasteType);
      
      if (wasteAmount > 0) {
        // Calculate how much to recycle (manual = more per click)
        const toRecycle = Math.min(wasteAmount, 20); // Max 20 per manual click (more than auto)
        const recycledAmount = toRecycle * efficiency;
        
        // Remove waste
        window.resourceManager.removeResource(wasteType, toRecycle);
        
        // Add recycled material
        window.resourceManager.addResource(recycledType, recycledAmount);
        
        totalRecycled += recycledAmount;
      }
    });
    
    // Then, process local waste from buildings in the city
    if (window.game && window.game.city) {
      const maxLocalWastePerClick = 50; // Max local waste per manual click (more than auto)
      let processedLocalWaste = 0;
      
      window.game.city.traverse((obj) => {
        if (obj.building && obj.building.waste && processedLocalWaste < maxLocalWastePerClick) {
          const waste = obj.building.waste;
          
          // Check if this building has waste that we can recycle
          if (waste.amount > 0 && waste.wasteType && this.wasteRecipes[waste.wasteType]) {
            const recycledType = this.wasteRecipes[waste.wasteType];
            const toRecycle = Math.min(waste.amount, 20); // Max 20 per building per click (manual = more)
            const recycledAmount = toRecycle * efficiency;
            
            // Remove from local waste
            waste.remove(toRecycle);
            
            // Refresh building view to update color based on new waste level
            if (obj.building && typeof obj.building.refreshView === 'function') {
              obj.building.refreshView();
            }
            
            // Add recycled material
            window.resourceManager.addResource(recycledType, recycledAmount);
            
            // Reduce global pollution
            if (window.globalPollution) {
              window.globalPollution.removeWaste(waste.wasteType, toRecycle * 0.1); // Remove leaked pollution
            }
            
            totalRecycled += recycledAmount;
            processedLocalWaste += toRecycle;
          }
        }
      });
    }
    
    // Add XP and Circular Score
    if (window.gameState && totalRecycled > 0) {
      window.gameState.addXP(Math.floor(totalRecycled));
      // Update Circular Score (recycling points)
      window.gameState.updateCircularScore(Math.floor(totalRecycled * 2));
    }
  }
  
  /**
   * Get total local waste available for recycling
   * @returns {Object} Waste counts by type
   */
  getLocalWasteCounts() {
    const counts = {};
    
    if (!window.game || !window.game.city) {
      return counts;
    }
    
    window.game.city.traverse((obj) => {
      if (obj.building && obj.building.waste && obj.building.waste.amount > 0) {
        const wasteType = obj.building.waste.wasteType;
        if (wasteType && this.wasteRecipes[wasteType]) {
          if (!counts[wasteType]) {
            counts[wasteType] = 0;
          }
          counts[wasteType] += obj.building.waste.amount;
        }
      }
    });
    
    return counts;
  }

  /**
   * Upgrade recycling center to next level
   * @returns {boolean} True if upgrade successful
   */
  upgrade() {
    if (this.level >= this.maxLevel) {
      return false;
    }

    const upgradeCost = this.getUpgradeCost();
    if (window.gameState && window.gameState.spendMoney(upgradeCost)) {
      this.level++;
      this.power.required = this.energyConsumption; // Recalculate
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
    // Base cost * 1.3^(current level) - reduced from 2
    return Math.floor(this.getBaseCost() * Math.pow(1.3, this.level));
  }

  /**
   * Get base cost of recycling center
   * @returns {number}
   */
  getBaseCost() {
    return 12000;
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
      console.error(`Model not found: ${modelName} for recycling center`);
      return;
    }
    
    try {
      let mesh = window.assetManager.getModel(modelName, this);
      
      if (!mesh) {
        console.error(`Failed to load model: ${modelName}`);
        return;
      }
      
      // Tint building if no power
      if (this.status === 'no-power') {
        mesh.traverse((obj) => {
          if (obj.material) {
            obj.material.color = new THREE.Color(0x707070);
          }
        });
      }
      
      this.setMesh(mesh);
    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error);
    }
  }

  /**
   * Simulate recycling center for one tick
   * @param {City} city 
   * @param {number} currentTick 
   */
  simulate(city, currentTick = 0) {
    super.simulate(city);
    
    // Decrease boost timer
    if (this.boostRemaining > 0) {
      this.boostRemaining--;
    }
    
    // Auto-recycling if enabled and powered
    if (this.autoRecycling && this.power.isFullyPowered && window.resourceManager) {
      this.processAutoRecycling();
    }
  }

  /**
   * Start manual recycling process
   * @returns {boolean} True if recycling started successfully
   */
  startRecycling() {
    if (!this.power.isFullyPowered) {
      console.warn("Geri dönüşüm için enerji gerekli!");
      return false;
    }

    if (!window.gameState) {
      return false;
    }

    // Consume energy
    if (!window.gameState.consumeEnergy(this.energyConsumption)) {
      console.warn("Yetersiz enerji!");
      return false;
    }

    // Process recycling
    this.processRecycling();
    return true;
  }

  /**
   * Returns HTML representation
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    
    const baseEfficiency = this.efficiencyByLevel[this.level] || 0.5;
    const currentEfficiency = this.efficiency;
    const boostActive = this.isBoosted;
    const boostTimeLeft = Math.ceil(this.boostRemaining * 2.5); // Convert ticks to seconds
    
    html += `
      <div class="info-heading">♻️ Geri Dönüşüm Merkezi</div>
      <span class="info-label">Seviye </span>
      <span class="info-value">${this.level}/${this.maxLevel}</span>
      <br>
      <span class="info-label">Verimlilik </span>
      <span class="info-value" style="${boostActive ? 'color: #4CAF50; font-weight: bold;' : ''}">
        ${(currentEfficiency * 100).toFixed(0)}%
        ${boostActive ? ` (+${(this.boostEfficiencyBonus * 100).toFixed(0)}% boost)` : ''}
      </span>
      <br>
      ${boostActive ? `
        <span class="info-label" style="color: #4CAF50;">⚡ Boost Aktif </span>
        <span class="info-value" style="color: #4CAF50;">${boostTimeLeft}s kaldı</span>
        <br>
      ` : ''}
      <span class="info-label">Enerji </span>
      <span class="info-value">${this.power.isFullyPowered ? this.power.required : 0}/${this.power.required} ⚡</span>
      <br>
      <span class="info-label">Otomatik Geri Dönüşüm </span>
      <span class="info-value">${this.autoRecycling ? '✅ Aktif' : '❌ Kapalı'}</span>
      <br>
      <span class="info-label">Otomatik Hız </span>
      <span class="info-value">${this.autoRecyclingRate} atık/tick</span>
      <br>
    `;
    
    // Show current waste processing (Global + Local)
    if (window.resourceManager) {
      html += `<div class="info-heading">🌍 Global Atık (Şehir Deposu)</div>`;
      let hasGlobalWaste = false;
      Object.entries(this.wasteRecipes).forEach(([wasteType, recycledType]) => {
        const wasteAmount = window.resourceManager.getResource(wasteType);
        if (wasteAmount > 0) {
          hasGlobalWaste = true;
          const resourceNames = {
            'textile-waste': '🧵 Tekstil Atığı',
            'e-waste': '💻 E-Atık',
            'scrap-metal': '🔩 Hurda Metal',
            'plastic-waste': '🧴 Plastik Atık',
            'organic-waste': '🌾 Organik Atık'
          };
          html += `
            <div style="padding: 4px 8px; margin: 2px 0; background-color: #22294160; border-radius: 4px;">
              <span class="info-label">${resourceNames[wasteType] || wasteType}</span>
              <span class="info-value">${wasteAmount.toFixed(1)}</span>
            </div>
          `;
        }
      });
      if (!hasGlobalWaste) {
        html += `<div style="padding: 8px; color: #888; font-size: 0.9em;">Global atık yok</div>`;
      }
      
      // Show local waste from buildings
      html += `<div class="info-heading" style="margin-top: 12px;">🏭 Binalardaki Atık (Local)</div>`;
      const localWasteCounts = this.getLocalWasteCounts();
      let hasLocalWaste = false;
      Object.entries(localWasteCounts).forEach(([wasteType, amount]) => {
        if (amount > 0) {
          hasLocalWaste = true;
          const resourceNames = {
            'textile-waste': '🧵 Tekstil Atığı',
            'e-waste': '💻 E-Atık',
            'scrap-metal': '🔩 Hurda Metal',
            'plastic-waste': '🧴 Plastik Atık',
            'organic-waste': '🌾 Organik Atık'
          };
          const color = amount > 80 ? '#f44336' : amount > 50 ? '#FF9800' : '#4CAF50';
          html += `
            <div style="padding: 4px 8px; margin: 2px 0; background-color: #22294160; border-radius: 4px;">
              <span class="info-label">${resourceNames[wasteType] || wasteType}</span>
              <span class="info-value" style="color: ${color};">${amount.toFixed(1)}</span>
            </div>
          `;
        }
      });
      if (!hasLocalWaste) {
        html += `<div style="padding: 8px; color: #888; font-size: 0.9em;">Binalarda işlenecek atık yok</div>`;
      }
    }
    
    // Manual recycling button
    // Check both global and local waste
    const hasGlobalWaste = window.resourceManager && 
      Object.keys(this.wasteRecipes).some(wasteType => 
        window.resourceManager.getResource(wasteType) > 0
      );
    const localWasteCounts = this.getLocalWasteCounts();
    const hasLocalWaste = Object.values(localWasteCounts).some(count => count > 0);
    const canRecycle = this.power.isFullyPowered && (hasGlobalWaste || hasLocalWaste);
    
    html += `
      <div style="padding: 8px; margin-top: 8px;">
        <button id="recycling-center-process-button" class="action-button" 
          onclick="window.game?.processRecycling(${this.x}, ${this.y})" 
          style="width: 100%; ${!canRecycle ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
          ${!canRecycle ? 'disabled' : ''}>
          ♻️ Manuel Geri Dönüşüm
        </button>
      </div>
    `;
    
    // Upgrade button
    if (this.level < this.maxLevel) {
      const upgradeCost = this.getUpgradeCost();
      html += `
        <div style="padding: 8px; margin-top: 4px;">
          <button class="action-button" onclick="window.game?.upgradeFactory(${this.x}, ${this.y})" style="width: 100%;">
            ⬆️ Yükselt (${upgradeCost.toLocaleString()} 💰)
          </button>
        </div>
      `;
    }
    
    return html;
  }
}

