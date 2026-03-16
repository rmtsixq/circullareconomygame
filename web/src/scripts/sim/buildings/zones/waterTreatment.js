import * as THREE from 'three';
import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

/**
 * Water Treatment Plant
 * Treats wastewater to produce reusable water
 * Circular economy water cycle component
 */
export class WaterTreatmentPlant extends Building {
  type = BuildingType.waterTreatment;
  level = 1;
  maxLevel = 3;
  energyConsumption = 7;

  /**
   * Water treatment capacity per tick
   */
  treatmentCapacity = { 1: 10, 2: 20, 3: 35 };

  /**
   * Wastewater to clean water conversion rate
   */
  conversionRate = { 1: 0.6, 2: 0.75, 3: 0.9 };

  tickCounter = 0;
  processInterval = 5;

  constructor(x, y) {
    super(x, y);
    this.name = 'Water Treatment Plant';

    this.jobs = {
      maxWorkers: 6,
      workers: [],
      get availableJobs() { return this.maxWorkers - this.workers.length; }
    };
    this.requiredWorkers = 3;
    this.maxWorkers = 6;
  }

  getBaseCost() {
    return 45000;
  }

  simulate(city, currentTick) {
    super.simulate(city, currentTick);

    this.tickCounter++;
    if (this.tickCounter < this.processInterval) return;
    this.tickCounter = 0;

    if (!window.resourceManager) return;

    const capacity = this.treatmentCapacity[this.level] || 10;
    const rate = this.conversionRate[this.level] || 0.6;

    // Process wastewater → clean water
    const wastewater = window.resourceManager.getResource('wastewater');
    if (wastewater > 0) {
      const toProcess = Math.min(wastewater, capacity);
      const cleanWater = toProcess * rate;

      window.resourceManager.removeResource('wastewater', toProcess);
      window.resourceManager.addResource('water', cleanWater);
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
    this.jobs.maxWorkers = 6 + (this.level - 1) * 3;
    this.maxWorkers = this.jobs.maxWorkers;
    this.refreshView();
    return true;
  }

  getUpgradeCost() {
    const costs = { 1: 50000, 2: 70000 };
    return costs[this.level] || 0;
  }

  refreshView() {
    const modelName = `water-treatment-${this.level}`;
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

  toHTML() {
    const workerCount = this.jobs?.workers?.length || 0;
    const canUpgrade = this.level < this.maxLevel;
    const capacity = this.treatmentCapacity[this.level] || 10;
    const rate = Math.round((this.conversionRate[this.level] || 0.6) * 100);

    return `
      <div class="info-panel">
        <div class="info-heading">
          <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          ${this.name}
        </div>
        <div class="info-section">
          <span class="info-label">Level </span>
          <span class="info-value">${this.level}/${this.maxLevel}</span>
          <br>
          <span class="info-label">Workers </span>
          <span class="info-value">${workerCount}/${this.jobs.maxWorkers}</span>
          <br>
          <span class="info-label">Treatment Capacity </span>
          <span class="info-value" style="color: #03A9F4;">${capacity} units/tick</span>
          <br>
          <span class="info-label">Conversion Rate </span>
          <span class="info-value" style="color: #00BCD4;">${rate}%</span>
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
