import * as THREE from 'three';
import { Building } from './building.js';
import { BuildingType } from './buildingType.js';

/**
 * MRF - Material Recovery Facility (Waste Sorting Facility)
 * Takes mixed waste, sorts into plastic/metal/glass/organic
 * If no MRF exists, recycling efficiency drops to 20%
 */
export class MRF extends Building {
  type = BuildingType.mrf;
  level = 1;
  maxLevel = 3;
  energyConsumption = 6;

  /**
   * Sorting efficiency by level (determines what % of waste is properly sorted)
   */
  sortingEfficiency = { 1: 0.6, 2: 0.8, 3: 0.95 };

  /**
   * Processing rate per tick
   */
  processRate = 2;

  /**
   * Tick counter for processing intervals
   */
  tickCounter = 0;
  processInterval = 5; // Process every 5 ticks

  constructor(x, y) {
    super(x, y);
    this.name = 'Material Recovery Facility (MRF)';

    this.jobs = {
      maxWorkers: 8,
      workers: [],
      get availableJobs() { return this.maxWorkers - this.workers.length; }
    };
    this.requiredWorkers = 4;
    this.maxWorkers = 8;
  }

  getBaseCost() {
    return 35000;
  }

  /**
   * Process mixed waste into sorted fractions
   * Takes waste from global pool, outputs sorted materials that recycling centers can use
   */
  simulate(city, currentTick) {
    super.simulate(city, currentTick);

    this.tickCounter++;
    if (this.tickCounter < this.processInterval) return;
    this.tickCounter = 0;

    if (!window.resourceManager) return;

    const efficiency = this.sortingEfficiency[this.level] || 0.6;
    const rate = this.processRate * this.level;

    // Process each waste type: take from waste pool, add to sorted output
    const wasteTypes = [
      { waste: 'textile-waste', sorted: 'recycled-fabric' },
      { waste: 'plastic-waste', sorted: 'recycled-plastic' },
      { waste: 'scrap-metal', sorted: 'recycled-metal' },
      { waste: 'e-waste', sorted: 'recycled-electronics' },
    ];

    for (const { waste, sorted } of wasteTypes) {
      const available = window.resourceManager.getResource(waste);
      if (available > 0) {
        const toProcess = Math.min(available, rate);
        const sorted_amount = toProcess * efficiency;
        
        window.resourceManager.removeResource(waste, toProcess);
        window.resourceManager.addResource(sorted, sorted_amount);

        // Reduce global pollution as waste is processed
        if (window.globalPollution) {
          window.globalPollution.removeWaste(waste, toProcess * 0.5);
        }
      }
    }

    // Process organic waste → compost
    const organicAvailable = window.resourceManager.getResource('organic-waste');
    if (organicAvailable > 0) {
      const toProcess = Math.min(organicAvailable, rate);
      window.resourceManager.removeResource('organic-waste', toProcess);
      window.resourceManager.addResource('compost', toProcess * efficiency);
      
      if (window.globalPollution) {
        window.globalPollution.removeWaste('organic-waste', toProcess * 0.5);
      }
    }
  }

  upgrade() {
    if (this.level >= this.maxLevel) return false;
    
    const cost = this.getUpgradeCost();
    if (window.gameState && !window.gameState.spendMoney(cost)) {
      if (window.ui) {
        window.ui.showNotification('💰 Insufficient Funds', `Upgrade requires ${cost.toLocaleString()} 💰.`, 'error');
      }
      return false;
    }
    
    this.level++;
    this.jobs.maxWorkers = 8 + (this.level - 1) * 4;
    this.maxWorkers = this.jobs.maxWorkers;
    this.refreshView();
    return true;
  }

  getUpgradeCost() {
    const costs = { 1: 40000, 2: 60000 };
    return costs[this.level] || 0;
  }

  refreshView() {
    const modelName = `mrf-${this.level}`;
    if (!window.assetManager) return;
    const mesh = window.assetManager.getModel(modelName, this);
    this.setMesh(mesh);
  }

  dispose() {
    if (this.jobs && this.jobs.workers) {
      this.jobs.workers.forEach(w => {
        if (w) { w.workplace = null; w.state = 'unemployed'; }
      });
      this.jobs.workers = [];
    }
    super.dispose();
  }

  /**
   * Static: Check if city has an MRF
   * Used by recycling centers to determine their efficiency
   */
  static hasMRF(city) {
    if (!city) return false;
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile && tile.building && tile.building.type === 'mrf') {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Static: Get the best MRF efficiency in the city
   */
  static getBestEfficiency(city) {
    if (!city) return 0.2; // Default without MRF
    let bestEfficiency = 0.2; // Minimum 20% without MRF
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile && tile.building && tile.building.type === 'mrf') {
          const eff = tile.building.sortingEfficiency[tile.building.level] || 0.6;
          bestEfficiency = Math.max(bestEfficiency, eff);
        }
      }
    }
    return bestEfficiency;
  }

  toHTML() {
    const workerCount = this.jobs?.workers?.length || 0;
    const canUpgrade = this.level < this.maxLevel;
    const eff = Math.round((this.sortingEfficiency[this.level] || 0.6) * 100);

    return `
      <div class="info-panel">
        <div class="info-heading">
          <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          ${this.name}
        </div>
        <div class="info-section">
          <span class="info-label">Level </span>
          <span class="info-value">${this.level}/${this.maxLevel}</span>
          <br>
          <span class="info-label">Workers </span>
          <span class="info-value">${workerCount}/${this.jobs.maxWorkers}</span>
          <br>
          <span class="info-label">Sorting Efficiency </span>
          <span class="info-value" style="color: #FF9800;">${eff}%</span>
          <br>
          <span class="info-label">Process Speed </span>
          <span class="info-value">${this.processRate * this.level} units/tick</span>
        </div>
        ${canUpgrade ? `
          <div style="padding: 8px; margin-top: 8px;">
            <button class="action-button" onclick="window.game.upgradeFactory(${this.x}, ${this.y})" style="width: 100%;">
              ⬆️ Upgrade (${this.getUpgradeCost().toLocaleString()} 💰)
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
}
