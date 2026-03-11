import * as THREE from 'three';
import { SimObject } from '../simObject';
import { BuildingStatus } from './buildingStatus';
import { PowerModule } from './modules/power';
import { RoadAccessModule } from './modules/roadAccess';

export class Building extends SimObject {
  /**
   * The building type
   * @type {string}
   */
  type = 'building';
  /**
   * True if the terrain should not be rendered with this building type
   * @type {boolean}
   */
  hideTerrain = false;
  /**
   * @type {PowerModule}
   */
  power = new PowerModule(this);
  /**
   * @type {RoadAccessModule}
   */
  roadAccess = new RoadAccessModule(this);
  /**
   * The current status of the building
   * @type {string}
   */
  status = BuildingStatus.Ok;
  /**
   * Icon displayed when building status
   * @type {Sprite}
   */
  #statusIcon = new THREE.Sprite();

  constructor() {
    super();
    this.#statusIcon.visible = false;
    this.#statusIcon.material = new THREE.SpriteMaterial({ depthTest: false })
    this.#statusIcon.layers.set(1);
    this.#statusIcon.scale.set(0.5, 0.5, 0.5);
    this.add(this.#statusIcon);
  }

  /**
   * 
   * @param {*} status 
   */
  setStatus(status) {
    if (status !== this.status) {
      this.status = status;
      switch (status) {
        case BuildingStatus.NoPower:
          this.#statusIcon.visible = true;
          this.#statusIcon.material.map = window.assetManager.statusIcons[BuildingStatus.NoPower];
          this.#statusIcon.position.set(0, 0, 0); // Normal position
          break;
        case BuildingStatus.NoRoadAccess:
          this.#statusIcon.visible = true;
          this.#statusIcon.material.map = window.assetManager.statusIcons[BuildingStatus.NoRoadAccess];
          this.#statusIcon.position.set(0, 0, 0); // Normal position
          break;
        case BuildingStatus.CriticalWaste:
          this.#statusIcon.visible = true;
          this.#statusIcon.material.map = window.assetManager.statusIcons[BuildingStatus.CriticalWaste];
          this.#statusIcon.position.set(0, 1, 0); // Position above building for waste warning
          break;
        case BuildingStatus.MissingResources:
          this.#statusIcon.visible = true;
          // Use warning icon (yellow exclamation) - create if doesn't exist
          if (window.assetManager.statusIcons && window.assetManager.statusIcons[BuildingStatus.MissingResources]) {
            this.#statusIcon.material.map = window.assetManager.statusIcons[BuildingStatus.MissingResources];
          } else {
            // Fallback: use NoPower icon or create a simple warning
            this.#statusIcon.material.map = window.assetManager.statusIcons?.[BuildingStatus.NoPower] || null;
          }
          this.#statusIcon.position.set(0, 1.2, 0); // Position above building for resource warning
          break;
        default:
          this.#statusIcon.visible = false;
      }
    }
  }

  simulate(city) {
    super.simulate(city);

    // Power consumption from energy pool
    if (this.power.required > 0 && window.gameState) {
      // Try to consume energy from pool
      if (window.gameState.energy >= this.power.required) {
        window.gameState.consumeEnergy(this.power.required);
      }
    }

    this.roadAccess.simulate(city);

    // Check waste status first (highest priority) - only if waste system is unlocked
    if (this.waste && window.gameState && window.levelUnlocks &&
      window.levelUnlocks.isUnlocked('local-waste', window.gameState.level) &&
      this.waste.amount >= 95) {
      this.setStatus(BuildingStatus.CriticalWaste);
      return; // Don't check other statuses if waste is critical
    }

    // Check power status (from energy pool)
    if (!this.power.isFullyPowered) {
      this.setStatus(BuildingStatus.NoPower);
    } else if (!this.roadAccess.value) {
      this.setStatus(BuildingStatus.NoRoadAccess);
    } else {
      this.setStatus(BuildingStatus.Ok);
    }
  }

  dispose() {
    this.power.dispose();
    this.roadAccess.dispose();
    super.dispose();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = `
      <div class="info-heading">
        <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Building
      </div>
      <span class="info-label">Name </span>
      <span class="info-value">${this.name}</span>
      <br>
      <span class="info-label">Type </span>
      <span class="info-value">${this.type}</span>
      <br>
      <span class="info-label">Road Access </span>
      <span class="info-value">
        ${this.roadAccess.value ?
        '<svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #4CAF50;"><polyline points="20 6 9 17 4 12"/></svg>' :
        '<svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f44336;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      }
      </span>
      <br>`;

    if (this.power.required > 0) {
      const supplied = this.power.isFullyPowered ? this.power.required : 0;
      html += `
        <span class="info-label">Power (kW) </span>
        <span class="info-value">${supplied}/${this.power.required} <svg class="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
        <br>`;
    }
    return html;
  }
}