import * as THREE from 'three';
import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

/**
 * School - Education building
 * Contributes to education score, creates workforce
 */
export class School extends Building {
  type = BuildingType.school;
  level = 1;
  maxLevel = 3;
  energyConsumption = 3;

  constructor(x, y) {
    super(x, y);
    this.name = 'School';

    // Jobs module
    this.jobs = {
      maxWorkers: 6,
      workers: [],
      get availableJobs() { return this.maxWorkers - this.workers.length; }
    };
    this.requiredWorkers = 3;
    this.maxWorkers = 6;
  }

  getBaseCost() {
    return 25000;
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
    this.jobs.maxWorkers = 6 + (this.level - 1) * 3;
    this.maxWorkers = this.jobs.maxWorkers;
    this.refreshView();
    return true;
  }

  getUpgradeCost() {
    const costs = { 1: 30000, 2: 50000 };
    return costs[this.level] || 0;
  }

  refreshView() {
    const modelName = `school-${this.level}`;
    if (!window.assetManager) return;
    const mesh = window.assetManager.getModel(modelName, this);
    this.setMesh(mesh);
  }

  dispose() {
    if (this.jobs && this.jobs.workers) {
      this.jobs.workers.forEach(w => {
        if (w) {
          w.workplace = null;
          w.state = 'unemployed';
        }
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
          <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3.333 3 10.667 3 14 0v-5"/></svg>
          ${this.name}
        </div>
        <div class="info-section">
          <span class="info-label">Level </span>
          <span class="info-value">${this.level}/${this.maxLevel}</span>
          <br>
          <span class="info-label">Workers </span>
          <span class="info-value">${workerCount}/${this.jobs.maxWorkers}</span>
          <br>
          <span class="info-label">Education Contribution </span>
          <span class="info-value" style="color: #4CAF50;">+${5 + (this.level - 1) * 3}</span>
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
