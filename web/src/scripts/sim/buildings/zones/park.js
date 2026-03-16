import * as THREE from 'three';
import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

/**
 * Park (Green Space) - Wellbeing and health contribution
 * Low cost, provides pollution offset
 */
export class Park extends Building {
  type = BuildingType.park;
  level = 1;
  maxLevel = 1;
  energyConsumption = 0;

  constructor(x, y) {
    super(x, y);
    this.name = 'Park / Green Space';
  }

  getBaseCost() {
    return 10000;
  }

  simulate(city, currentTick) {
    super.simulate(city, currentTick);
  }

  refreshView() {
    const modelName = `park-${this.level}`;
    if (!window.assetManager) return;
    const mesh = window.assetManager.getModel(modelName, this);
    this.setMesh(mesh);
  }

  toHTML() {
    return `
      <div class="info-panel">
        <div class="info-heading">
          <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>
          ${this.name}
        </div>
        <div class="info-section">
          <span class="info-label">Effect </span>
          <span class="info-value" style="color: #8BC34A;">Wellbeing ↑, Health ↑, Pollution ↓</span>
          <br>
          <span class="info-label">Energy </span>
          <span class="info-value">Not Required</span>
        </div>
      </div>
    `;
  }
}
