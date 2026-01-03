import * as THREE from 'three';
import { Building } from './building.js';
import { DevelopmentState } from './modules/development.js';
import { WasteModule } from './modules/waste.js';
import { JobsModule } from './modules/jobs.js';

/**
 * Base class for all factories
 * Handles production queue, energy consumption, waste production, and leveling
 */
export class Factory extends Building {
  /**
   * Current level of the factory (1-5)
   * @type {number}
   */
  level = 1;
  
  /**
   * Maximum level for this factory
   * @type {number}
   */
  maxLevel = 5;
  
  /**
   * Production queue - array of production jobs
   * @type {Array}
   */
  productionQueue = [];
  
  /**
   * Energy consumption per tick
   * @type {number}
   */
  energyConsumption = 5;
  
  /**
   * Base waste production per tick
   * @type {number}
   */
  baseWasteProduction = 4; // Increased from 3
  
  /**
   * Available recipes for this factory
   * @type {Array}
   */
  recipes = [];
  
  /**
   * Factory style (A, B, or C)
   * @type {string}
   */
  style = ['A', 'B', 'C'][Math.floor(3 * Math.random())];
  
  /**
   * Waste module for this factory
   * @type {WasteModule}
   */
  waste = new WasteModule(this);

  /**
   * Jobs module for this factory (workers)
   * @type {JobsModule}
   */
  jobs = null; // Will be initialized in constructor

  /**
   * Minimum number of workers required for this factory to operate
   * @type {number}
   */
  requiredWorkers = 10; // Default, can be overridden in subclasses

  constructor(x = 0, y = 0) {
    super(x, y);
    this.power.required = this.energyConsumption;
    
    // Initialize waste module
    this.waste.productionRate = this.baseWasteProduction;
    this.waste.wasteType = this.getWasteType();
    
    // Initialize jobs module (factories need workers)
    // Note: JobsModule expects a Zone, but we'll adapt it for factories
    // We'll create a simple wrapper or modify JobsModule to work with factories
    this.jobs = new JobsModule(this);
  }

  /**
   * Get current waste production based on level
   * @returns {number}
   */
  get wasteProduction() {
    // Higher level = more efficient = less waste (but not too much reduction)
    const efficiency = 1 - (this.level - 1) * 0.05; // 5% reduction per level (reduced from 10%)
    const baseWaste = Math.max(0, this.baseWasteProduction * efficiency);
    
    // Apply production mode multiplier
    return baseWaste * this.wasteProductionMultiplier;
  }

  /**
   * Get production efficiency based on energy, workers, level, and production mode
   * @returns {number} 0-1
   */
  get productionEfficiency() {
    if (!this.power.isFullyPowered) {
      return 0.5; // 50% efficiency if no power
    }
    
    // Check worker availability
    const currentWorkers = this.jobs ? this.jobs.workers.length : 0;
    let baseEfficiency = Math.min(1, 0.7 + (this.level - 1) * 0.1);
    
    if (currentWorkers < this.requiredWorkers) {
      // If no workers at all, factory stops completely
      if (currentWorkers === 0) {
        return 0; // 0% efficiency = factory stops
      }
      // If insufficient workers, production slows down proportionally
      const workerRatio = currentWorkers / this.requiredWorkers;
      // Production scales with worker ratio (e.g., 50% workers = 50% production)
      baseEfficiency = baseEfficiency * workerRatio;
    }
    
    // Apply production mode effects (Level 6+)
    if (window.cityPolicies && window.gameState && window.levelUnlocks &&
        window.levelUnlocks.isUnlocked('hq-policy-panel', window.gameState.level)) {
      const modeEffects = window.cityPolicies.getProductionModeEffects();
      baseEfficiency = baseEfficiency * modeEffects.speed;
    }
    
    return Math.min(1, baseEfficiency);
  }
  
  /**
   * Get waste production multiplier based on production mode
   * @returns {number}
   */
  get wasteProductionMultiplier() {
    if (window.cityPolicies && window.gameState && window.levelUnlocks &&
        window.levelUnlocks.isUnlocked('hq-policy-panel', window.gameState.level)) {
      const modeEffects = window.cityPolicies.getProductionModeEffects();
      return modeEffects.waste;
    }
    return 1.0;
  }
  
  /**
   * Get current number of workers
   * @returns {number}
   */
  get currentWorkers() {
    return this.jobs ? this.jobs.workers.length : 0;
  }
  
  /**
   * Get maximum number of workers this factory can employ
   * @returns {number}
   */
  get maxWorkers() {
    // Factories can employ more workers than required (for future expansion)
    return this.requiredWorkers * 2; // Can employ up to 2x required workers
  }

  /**
   * Add a production job to the queue
   * @param {Object} recipe Recipe object
   * @returns {boolean} True if added successfully
   */
  addProduction(recipe) {
    if (!this.canProduce(recipe)) {
      return false;
    }

    // Check if we have required resources
    if (!window.resourceManager || !window.resourceManager.hasResources(recipe.inputs)) {
      return false;
    }

    // Create production job
    const job = {
      recipe: recipe,
      progress: 0,
      totalTime: recipe.duration,
      startTime: Date.now()
    };

    this.productionQueue.push(job);
    
    // Consume resources
    window.resourceManager.consumeResources(recipe.inputs);
    
    return true;
  }

  /**
   * Check if factory can produce this recipe
   * @param {Object} recipe 
   * @returns {boolean}
   */
  canProduce(recipe) {
    // Check factory level requirement (building's own level)
    // Factory must be at least the required level
    if (recipe.requiredLevel && this.level < recipe.requiredLevel) {
      return false;
    }
    
    // No player level restrictions - recipes unlock based on factory level only
    // Grade 2 recipes (requiredLevel: 2) are available when factory is level 2
    // Grade 3 recipes (requiredLevel: 3) are available when factory is level 3
    
    // Check if recipe is available for this factory
    return this.recipes.some(r => r.id === recipe.id);
  }

  /**
   * Process production queue
   */
  processProduction() {
    if (this.productionQueue.length === 0) return;

    const efficiency = this.productionEfficiency;
    
    // Process each job in queue
    for (let i = this.productionQueue.length - 1; i >= 0; i--) {
      const job = this.productionQueue[i];
      
      // Update progress based on efficiency
      job.progress += efficiency;
      
      // Check if production is complete
      if (job.progress >= job.totalTime) {
        this.completeProduction(job);
        this.productionQueue.splice(i, 1);
      }
    }
  }

  /**
   * Complete a production job
   * @param {Object} job 
   */
  completeProduction(job) {
    const recipe = job.recipe;
    
    // Add outputs to inventory
    if (window.resourceManager) {
      Object.entries(recipe.outputs).forEach(([resource, amount]) => {
        window.resourceManager.addResource(resource, amount);
      });
      
      // Add waste
      if (recipe.waste) {
        Object.entries(recipe.waste).forEach(([wasteType, amount]) => {
          window.resourceManager.addResource(wasteType, amount * this.wasteProduction / this.baseWasteProduction);
        });
      }
    }
    
    // Add XP
    if (window.gameState) {
      window.gameState.addXP(5);
    }
    
    // Show production effect
    if (window.visualEffects) {
      // Get total output amount
      const totalOutput = Object.values(recipe.outputs).reduce((sum, amount) => sum + amount, 0);
      window.visualEffects.showProductionEffect(this, totalOutput, recipe.name);
    }
  }

  /**
   * Start automatic production - fill queue up to max queue size
   */
  startAutomaticProduction() {
    // Maximum queue size (allow multiple products in queue)
    const maxQueueSize = 5; // Allow up to 5 products in queue
    
    // Fill queue up to max size
    while (this.productionQueue.length < maxQueueSize) {
      let added = false;
      
      // Find first available recipe that we can produce
      // Try recipes in order (Level 1 first, then Level 2, then Level 3)
      // This ensures we always use the best available recipe for current factory level
      const sortedRecipes = [...this.recipes].sort((a, b) => {
        const levelA = a.requiredLevel || 1;
        const levelB = b.requiredLevel || 1;
        // Prefer recipes that match or are just below factory level
        if (levelA <= this.level && levelB <= this.level) {
          return levelB - levelA; // Higher level recipes first (if both available)
        }
        return levelA - levelB; // Lower level first
      });
      
      for (const recipe of sortedRecipes) {
        if (this.canProduce(recipe) && window.resourceManager && window.resourceManager.hasResources(recipe.inputs)) {
          this.addProduction(recipe);
          added = true;
          break;
        }
      }
      
      // If no recipe could be added, stop trying
      if (!added) {
        break;
      }
    }
  }

  /**
   * Upgrade factory to next level
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
      // Refresh view after upgrade to update model and check resources
      this.refreshView();
      // Check missing resources immediately after upgrade
      this.#checkMissingResources();
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
    // Base cost * 1.2^(current level) - reduced from 1.5
    return Math.floor(this.getBaseCost() * Math.pow(1.2, this.level));
  }

  /**
   * Get base cost of factory (override in subclasses)
   * @returns {number}
   */
  getBaseCost() {
    return 500;
  }

  /**
   * Refresh view with appropriate model
   */
  refreshView() {
    if (!window.assetManager) {
      console.error('AssetManager not available');
      return;
    }
    
    let modelName;
    
    // Use factory-specific model naming: type-style-level
    // e.g., "textile-factory-A1", "technology-factory-B2"
    modelName = `${this.type}-${this.style}${this.level}`;
    
    // Check if model exists in assetManager
    if (!window.assetManager.models || !window.assetManager.models[modelName]) {
      console.warn(`Model not found: ${modelName}, trying fallback...`);
      // Fallback to A1 style
      modelName = `${this.type}-A${this.level}`;
      
      // If still not found, try A1
      if (!window.assetManager.models[modelName]) {
        modelName = `${this.type}-A1`;
      }
    }
    
    // Final check
    if (!window.assetManager.models || !window.assetManager.models[modelName]) {
      console.error(`Model not found: ${modelName} for factory type: ${this.type}`);
      return;
    }
    
    try {
      let mesh = window.assetManager.getModel(modelName, this);
      
      if (!mesh) {
        console.error(`Failed to load model: ${modelName}`);
        return;
      }
      
      // Note: Missing resources check is now done in simulate() method
      // to ensure it updates every tick, not just when view refreshes
      // Status icon is managed by setStatus() in Building class
      
      // Tint building based on status and waste level
      // Priority: no-power > waste level > normal
      const wasteSystemUnlocked = window.gameState && window.levelUnlocks &&
          window.levelUnlocks.isUnlocked('local-waste', window.gameState.level);
      
      if (this.status === 'no-power' || (this.power && !this.power.isFullyPowered)) {
        mesh.traverse((obj) => {
          if (obj.material) {
            obj.material.color = new THREE.Color(0x707070);
          }
        });
      } else if (this.waste && wasteSystemUnlocked) {
        // Apply waste-based color tint (only if waste system is unlocked)
        const wasteAmount = this.waste.amount;
        mesh.traverse((obj) => {
          if (obj.material) {
            if (wasteAmount >= 100) {
              // Stopped: Dark red
              obj.material.color = new THREE.Color(0xcc0000);
            } else if (wasteAmount >= 95) {
              // Critical: Red tint
              obj.material.color = new THREE.Color(0xff4444);
            } else if (wasteAmount >= 80) {
              // Warning: Orange tint
              obj.material.color = new THREE.Color(0xff8844);
            } else if (wasteAmount >= 50) {
              // Moderate: Yellow tint
              obj.material.color = new THREE.Color(0xffff88);
            } else {
              // Clean: Normal color (no tint)
              obj.material.color = new THREE.Color(0xffffff);
            }
          }
        });
      } else {
        // No waste module, normal color
        mesh.traverse((obj) => {
          if (obj.material) {
            obj.material.color = new THREE.Color(0xffffff);
          }
        });
      }
      
      this.setMesh(mesh);
    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error);
    }
  }

  /**
   * Simulate factory for one tick
   * @param {City} city 
   * @param {number} currentTick 
   */
  simulate(city, currentTick = 0) {
    const previousWasteAmount = this.waste ? this.waste.amount : 0;
    
    super.simulate(city);
    
    // Simulate jobs module (workers)
    if (this.jobs) {
      this.jobs.simulate(city);
    }
    
    // Update waste module (only if waste system is unlocked - Level 3+)
    const wasteSystemUnlocked = window.gameState && window.levelUnlocks &&
        window.levelUnlocks.isUnlocked('local-waste', window.gameState.level);
    
    if (this.waste && wasteSystemUnlocked) {
      this.waste.simulate(city, currentTick);
      
      // Refresh view if waste level changed significantly (for color update)
      const currentWasteAmount = this.waste.amount;
      if (Math.abs(currentWasteAmount - previousWasteAmount) >= 5 || 
          (previousWasteAmount < 50 && currentWasteAmount >= 50) ||
          (previousWasteAmount < 80 && currentWasteAmount >= 80) ||
          (previousWasteAmount < 95 && currentWasteAmount >= 95) ||
          (previousWasteAmount >= 95 && currentWasteAmount < 95) ||
          (previousWasteAmount >= 100 && currentWasteAmount < 100)) {
        this.refreshView();
      }
    }
    
      // Apply waste efficiency penalty to production (only if waste system is unlocked)
      const wastePenalty = (this.waste && wasteSystemUnlocked) ? this.waste.getEfficiencyPenalty() : 1;
      
      // Energy is consumed automatically in Building.simulate
      // Process production queue if powered AND has workers
      // Note: wastePenalty can be 0 if waste is critical (100), which stops production
      // Note: productionEfficiency can be 0 if no workers, which stops production
      if (this.power.isFullyPowered) {
        // Store original efficiency (includes worker check - will be 0 if no workers)
        const originalEfficiency = this.productionEfficiency;
        
        // Apply waste penalty (0 if waste is critical, which stops production)
        const adjustedEfficiency = originalEfficiency * wastePenalty;
        
        // Process production with adjusted efficiency (only if both waste penalty and workers allow)
        // adjustedEfficiency will be 0 if no workers OR critical waste
        if (this.productionQueue.length > 0 && adjustedEfficiency > 0) {
          for (let i = this.productionQueue.length - 1; i >= 0; i--) {
            const job = this.productionQueue[i];
            job.progress += adjustedEfficiency;
            
            if (job.progress >= job.totalTime) {
              this.completeProduction(job);
              this.productionQueue.splice(i, 1);
            }
          }
        }
        
        // Start automatic production to fill queue (only if both waste penalty and workers allow)
        // This ensures production continues even after leveling up
        if (adjustedEfficiency > 0) {
          this.startAutomaticProduction();
        }
      }
      
      // Check for missing resources and update status icon (every tick for real-time updates)
      this.#checkMissingResources();
  }
  
  /**
   * Check if factory has missing resources and update status icon
   * Called every tick in simulate() for real-time updates
   */
  #checkMissingResources() {
    if (!window.resourceManager || !this.power.isFullyPowered) {
      // Clear missing resources status if no power or resource manager not available
      if (this.status === 'missing-resources') {
        this.setStatus('ok');
      }
      return;
    }
    
    let hasMissingResources = false;
    
    // Check if any recipe that can be produced is missing resources
    for (const recipe of this.recipes) {
      if (this.canProduce(recipe)) {
        // Check if resources are available for this recipe
        if (!window.resourceManager.hasResources(recipe.inputs)) {
          hasMissingResources = true;
          break;
        }
      }
    }
    
    // Also check production queue - if queue has jobs but can't produce due to missing resources
    if (!hasMissingResources && this.productionQueue.length > 0) {
      // Check if we can actually produce the queued items
      for (const job of this.productionQueue) {
        const recipe = this.recipes.find(r => r.output === job.product);
        if (recipe && !window.resourceManager.hasResources(recipe.inputs)) {
          hasMissingResources = true;
          break;
        }
      }
    }
    
    // Update status
    if (hasMissingResources) {
      if (this.status !== 'missing-resources') {
        this.setStatus('missing-resources');
      }
    } else {
      if (this.status === 'missing-resources') {
        this.setStatus('ok');
      }
    }
  }

  /**
   * Get waste type for this factory
   * @returns {string}
   */
  getWasteType() {
    // Default waste type, can be overridden in subclasses
    if (this.type.includes('textile')) {
      return 'textile-waste';
    } else if (this.type.includes('technology')) {
      return 'e-waste';
    } else if (this.type.includes('steel') || this.type.includes('automotive')) {
      return 'scrap-metal';
    }
    return 'textile-waste'; // Default
  }

  /**
   * Returns HTML representation
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    
    html += `
      <div class="info-heading">Factory Info</div>
      <span class="info-label">Level </span>
      <span class="info-value">${this.level}/${this.maxLevel}</span>
      <br>
      <span class="info-label">Energy </span>
      <span class="info-value">${this.power.isFullyPowered ? this.power.required : 0}/${this.power.required} ⚡</span>
      <br>
      <span class="info-label">Workers </span>
      <span class="info-value" style="color: ${this.currentWorkers >= this.requiredWorkers ? '#4CAF50' : this.currentWorkers > 0 ? '#FF9800' : '#f44336'};">
        ${this.currentWorkers}/${this.requiredWorkers} (min: ${this.requiredWorkers})
      </span>
      <br>
      ${window.gameState && window.levelUnlocks && window.levelUnlocks.isUnlocked('local-waste', window.gameState.level) ? `
      <span class="info-label">Waste Production </span>
      <span class="info-value">${this.wasteProduction.toFixed(1)}/tick</span>
      <br>
      ` : ''}
      <span class="info-label">Efficiency </span>
      <span class="info-value">${(this.productionEfficiency * 100).toFixed(0)}%</span>
      <br>
    `;
    
    // Production queue
    if (this.productionQueue.length > 0) {
      html += `<div class="info-heading">Production Queue (${this.productionQueue.length})</div>`;
      this.productionQueue.forEach((job, index) => {
        const progress = (job.progress / job.totalTime * 100).toFixed(0);
        html += `
          <div style="padding: 4px 8px; margin: 2px 0; background-color: #22294160; border-radius: 4px;">
            <span class="info-label">${index + 1}. ${job.recipe.name}</span>
            <span class="info-value">${progress}%</span>
          </div>
        `;
      });
    } else {
      html += `<div class="info-heading">Production Queue (Empty)</div>`;
      
      // Check why production is not starting
      let canProduceAny = false;
      let missingResources = [];
      
      for (const recipe of this.recipes) {
        if (this.canProduce(recipe)) {
          canProduceAny = true;
          // Check if we have resources for this recipe
          if (window.resourceManager && window.resourceManager.hasResources(recipe.inputs)) {
            // We can produce this recipe, so production should start
            html += `<div style="padding: 8px; color: #888; font-size: 0.9em;">Otomatik üretim başlatılacak...</div>`;
            break;
          } else {
            // Missing resources for this recipe
            const missing = [];
            for (const [resource, amount] of Object.entries(recipe.inputs)) {
              const current = window.resourceManager.getResource(resource) || 0;
              if (current < amount) {
                // Format resource name for display (capitalize and replace dashes)
                const resourceName = resource
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                missing.push(`${resourceName}: ${current.toFixed(0)}/${amount}`);
              }
            }
            if (missing.length > 0) {
              missingResources.push({
                recipe: recipe.name,
                missing: missing
              });
            }
          }
        }
      }
      
      // Show warning if no resources available
      if (canProduceAny && missingResources.length > 0) {
        html += `<div style="padding: 8px; margin-top: 8px; background-color: #ff980020; border-left: 3px solid #ff9800; border-radius: 4px;">`;
        html += `<div style="color: #ff9800; font-weight: bold; margin-bottom: 4px;">⚠️ Ham Madde Eksik!</div>`;
        missingResources.forEach(({ recipe, missing }) => {
          html += `<div style="color: #ccc; font-size: 0.9em; margin: 4px 0;">`;
          html += `<strong>${recipe}:</strong><br>`;
          missing.forEach(m => {
            html += `&nbsp;&nbsp;• ${m}<br>`;
          });
          html += `</div>`;
        });
        html += `</div>`;
      } else if (!canProduceAny) {
        html += `<div style="padding: 8px; color: #888; font-size: 0.9em;">Fabrika seviyesi yetersiz veya tarife yok.</div>`;
      }
    }
    
    // Waste information (only if waste system is unlocked - Level 3+)
    const wasteSystemUnlocked = window.gameState && window.levelUnlocks &&
        window.levelUnlocks.isUnlocked('local-waste', window.gameState.level);
    
    if (this.waste && wasteSystemUnlocked) {
      const wasteLevel = this.waste.getLevel();
      const wasteColor = wasteLevel >= 95 ? '#f44336' : wasteLevel >= 80 ? '#FF9800' : '#4CAF50';
      html += `
        <div class="info-heading" style="margin-top: 12px;">🗑️ Atık Durumu</div>
        <div style="padding: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Atık Seviyesi:</span>
            <span style="color: ${wasteColor}; font-weight: bold;">${this.waste.amount.toFixed(1)} / ${this.waste.maxCapacity}</span>
          </div>
          <div style="background: #333; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 4px;">
            <div style="background: ${wasteColor}; height: 100%; width: ${wasteLevel}%; transition: width 0.3s;"></div>
          </div>
          ${wasteLevel >= 95 ? '<div style="color: #f44336; font-size: 0.9em;">⚠️ Kritik! Bina durdu.</div>' : ''}
          ${wasteLevel >= 80 && wasteLevel < 95 ? '<div style="color: #FF9800; font-size: 0.9em;">⚠️ Uyarı! Üretim -50%</div>' : ''}
          ${wasteLevel >= 80 && wasteLevel < 95 ? '<div style="color: #FF9800; font-size: 0.9em;">⚠️ Uyarı! Üretim -20%</div>' : ''}
        </div>
      `;
    }
    
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

  /**
   * Dispose factory resources
   */
  dispose() {
    // Dispose jobs module (lay off all workers)
    if (this.jobs) {
      this.jobs.dispose();
    }
    
    // Call parent dispose
    super.dispose();
  }
}

