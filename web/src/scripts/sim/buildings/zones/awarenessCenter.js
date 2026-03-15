import * as THREE from 'three';
import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

/**
 * Awareness Center (Circular Farkındalık Merkezi)
 * Eğitim + sürdürülebilirlik katkısı, geri dönüşüm verimini artırır
 */
export class AwarenessCenter extends Building {
  type = BuildingType.awarenessCenter;
  level = 1;
  maxLevel = 3;
  energyConsumption = 4;

  constructor(x, y) {
    super(x, y);
    this.name = 'Circular Farkındalık Merkezi';

    this.jobs = {
      maxWorkers: 5,
      workers: [],
      get availableJobs() { return this.maxWorkers - this.workers.length; }
    };
    this.requiredWorkers = 2;
    this.maxWorkers = 5;
  }

  getBaseCost() {
    return 40000;
  }

  simulate(city, currentTick) {
    super.simulate(city, currentTick);
  }

  upgrade() {
    if (this.level >= this.maxLevel) return false;
    
    const cost = this.getUpgradeCost();
    if (window.gameState && !window.gameState.spendMoney(cost)) {
      if (window.ui) {
        window.ui.showNotification('💰 Yetersiz Para', `Yükseltme için ${cost.toLocaleString()} 💰 gerekiyor.`, 'error');
      }
      return false;
    }
    
    this.level++;
    this.jobs.maxWorkers = 5 + (this.level - 1) * 2;
    this.maxWorkers = this.jobs.maxWorkers;
    this.refreshView();
    return true;
  }

  getUpgradeCost() {
    const costs = { 1: 40000, 2: 60000 };
    return costs[this.level] || 0;
  }

  /**
   * Get recycling efficiency multiplier based on level
   * This increases recycling center output when an awareness center exists
   */
  getRecyclingBoost() {
    return 1 + (this.level * 0.1); // 1.1x, 1.2x, 1.3x
  }

  refreshView() {
    const modelName = `awareness-center-${this.level}`;
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
          <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          ${this.name}
        </div>
        <div class="info-section">
          <span class="info-label">Seviye </span>
          <span class="info-value">${this.level}/${this.maxLevel}</span>
          <br>
          <span class="info-label">Çalışanlar </span>
          <span class="info-value">${workerCount}/${this.jobs.maxWorkers}</span>
          <br>
          <span class="info-label">Eğitim Katkısı </span>
          <span class="info-value" style="color: #2196F3;">+${4 + (this.level - 1) * 2}</span>
          <br>
          <span class="info-label">Geri Dönüşüm Boost </span>
          <span class="info-value" style="color: #8BC34A;">x${this.getRecyclingBoost().toFixed(1)}</span>
        </div>
        ${canUpgrade ? `
          <div style="padding: 8px; margin-top: 8px;">
            <button class="action-button" onclick="window.game.upgradeFactory(${this.x}, ${this.y})" style="width: 100%;">
              ⬆️ Yükselt (${this.getUpgradeCost().toLocaleString()} 💰)
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
}
