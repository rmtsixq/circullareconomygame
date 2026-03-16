import * as THREE from 'three';
import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

/**
 * Hospital - Health building
 * Directly contributes to health score
 */
export class Hospital extends Building {
  type = BuildingType.hospital;
  level = 1;
  maxLevel = 3;
  energyConsumption = 8;

  constructor(x, y) {
    super(x, y);
    this.name = 'Hospital';

    this.jobs = {
      maxWorkers: 10,
      workers: [],
      get availableJobs() { return this.maxWorkers - this.workers.length; }
    };
    this.requiredWorkers = 5;
    this.maxWorkers = 10;
  }

  getBaseCost() {
    return 60000;
  }

  simulate(city, currentTick) {
    super.simulate(city, currentTick);
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
    this.jobs.maxWorkers = 10 + (this.level - 1) * 5;
    this.maxWorkers = this.jobs.maxWorkers;
    this.refreshView();
    return true;
  }

  getUpgradeCost() {
    const costs = { 1: 50000, 2: 80000 };
    return costs[this.level] || 0;
  }

  refreshView() {
    const modelName = `hospital-${this.level}`;
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

    return `
      <div class="info-panel">
        <div class="info-heading">
          <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.045 3 5.5L12 21z"/><path d="M12 5v14"/><path d="M7 9h10"/></svg>
          ${this.name}
        </div>
        <div class="info-section">
          <span class="info-label">Level </span>
          <span class="info-value">${this.level}/${this.maxLevel}</span>
          <br>
          <span class="info-label">Workers </span>
          <span class="info-value">${workerCount}/${this.jobs.maxWorkers}</span>
          <br>
          <span class="info-label">Health Contribution </span>
          <span class="info-value" style="color: #E91E63;">+${8 + (this.level - 1) * 4}</span>
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
