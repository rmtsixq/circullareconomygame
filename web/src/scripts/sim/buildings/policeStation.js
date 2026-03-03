import * as THREE from 'three';
import { Building } from './building.js';
import { BuildingType } from './buildingType.js';

/**
 * Police Station - Spawns police vehicles and provides city security
 */
export class PoliceStation extends Building {
  type = BuildingType.policeStation;
  
  /**
   * Current level of the police station (1-3)
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
  energyConsumption = 5;
  
  /**
   * Police vehicles spawned by level
   * @type {Object}
   */
  vehiclesByLevel = {
    1: 1,  // 1 police vehicle
    2: 2,  // 2 police vehicles
    3: 3   // 3 police vehicles
  };
  
  /**
   * Spawn interval in milliseconds
   * @type {number}
   */
  spawnInterval = 15000; // 15 seconds
  
  /**
   * Last spawn time
   * @type {number}
   */
  lastSpawnTime = 0;
  
  /**
   * Active police vehicles count
   * @type {number}
   */
  activeVehicles = 0;
  
  /**
   * Entrance direction (0 = bottom, 1 = right, 2 = top, 3 = left)
   * Determines where the road should curve
   * @type {number}
   */
  entranceDirection = 0; // Default: bottom (south)
  
  constructor(x, y) {
    super(x, y);
    this.x = x;
    this.y = y;
    this.name = 'Polis Merkezi';
    this.hideTerrain = true;
    this.roadAccess.enabled = true;
    
    // Determine entrance direction based on nearby roads
    this.determineEntranceDirection();
  }
  
  /**
   * Get base cost for building
   * @returns {number}
   */
  getBaseCost() {
    return 3000; // Base cost for police station
  }
  
  /**
   * Determine entrance direction based on nearby roads
   * @param {City} city - City instance (optional, will use window.game.city if not provided)
   */
  determineEntranceDirection(city = null) {
    if (!city) {
      if (!window.game || !window.game.city) return;
      city = window.game.city;
    }
    const directions = [
      { x: 0, y: 1, dir: 0 },  // bottom (south)
      { x: 1, y: 0, dir: 1 },  // right (east)
      { x: 0, y: -1, dir: 2 }, // top (north)
      { x: -1, y: 0, dir: 3 }  // left (west)
    ];
    
    // Find the direction with the nearest road
    let bestDirection = 0;
    let minDistance = Infinity;
    
    for (const dir of directions) {
      for (let dist = 1; dist <= 3; dist++) {
        const checkX = this.x + dir.x * dist;
        const checkY = this.y + dir.y * dist;
        const tile = city.getTile(checkX, checkY);
        
        if (tile && tile.building && tile.building.type === 'road') {
          if (dist < minDistance) {
            minDistance = dist;
            bestDirection = dir.dir;
          }
          break;
        }
      }
    }
    
    this.entranceDirection = bestDirection;
  }
  
  /**
   * Refresh view - load model and update road connections
   * @param {City} city - City instance
   */
  refreshView(city) {
    // Determine entrance direction
    this.determineEntranceDirection(city);
    
    // Load model
    const modelName = `police-station-${this.level}`;
    const mesh = window.assetManager.getModel(modelName, this);
    this.setMesh(mesh);
    
    // Update road connections (virtual road for vehicle path)
    this.updateRoadConnections(city);
  }
  
  /**
   * Update road connections - create virtual road path without visual road
   */
  updateRoadConnections(city) {
    if (!city.vehicleGraph) return;
    
    // Get entrance tile coordinates
    const entranceCoords = this.getEntranceCoords();
    if (!entranceCoords) return;
    
    const { x: entranceX, y: entranceY } = entranceCoords;
    
    // Create a virtual road connection in the vehicle graph
    // This allows vehicles to path through the police station
    // but doesn't create a visual road tile
    
    // Find adjacent road tiles
    const adjacentRoads = this.findAdjacentRoads(city);
    
    // Connect police station entrance to adjacent roads
    // This is handled in vehicleGraph.updateTile with a special flag
    // For now, we'll mark this building as a special road connection point
  }
  
  /**
   * Get entrance coordinates based on entrance direction
   * @returns {{x: number, y: number} | null}
   */
  getEntranceCoords() {
    const directions = [
      { x: 0, y: 1 },   // bottom (south)
      { x: 1, y: 0 },   // right (east)
      { x: 0, y: -1 },  // top (north)
      { x: -1, y: 0 }   // left (west)
    ];
    
    const dir = directions[this.entranceDirection];
    return {
      x: this.x + dir.x,
      y: this.y + dir.y
    };
  }
  
  /**
   * Find adjacent road tiles
   * @returns {Array}
   */
  findAdjacentRoads(city) {
    const roads = [];
    const directions = [
      { x: 0, y: 1 },   // bottom
      { x: 1, y: 0 },   // right
      { x: 0, y: -1 },  // top
      { x: -1, y: 0 }   // left
    ];
    
    for (const dir of directions) {
      const checkX = this.x + dir.x;
      const checkY = this.y + dir.y;
      const tile = city.getTile(checkX, checkY);
      
      if (tile && tile.building && tile.building.type === 'road') {
        roads.push({ x: checkX, y: checkY, tile });
      }
    }
    
    return roads;
  }
  
  /**
   * Simulate police station
   */
  simulate(city, currentTick) {
    super.simulate(city, currentTick);
    
    // Spawn police vehicles periodically
    const now = Date.now();
    if (now - this.lastSpawnTime >= this.spawnInterval) {
      const maxVehicles = this.vehiclesByLevel[this.level] || 1;
      
      if (this.activeVehicles < maxVehicles) {
        this.spawnPoliceVehicle(city);
        this.lastSpawnTime = now;
      }
    }
  }
  
  /**
   * Spawn a police vehicle
   */
  spawnPoliceVehicle(city) {
    if (!city.vehicleGraph) return;
    
    // Get entrance coordinates
    const entranceCoords = this.getEntranceCoords();
    if (!entranceCoords) return;
    
    // Find a nearby road to spawn from
    const adjacentRoads = this.findAdjacentRoads(city);
    if (adjacentRoads.length === 0) return;
    
    // Get vehicle graph tile for the entrance
    const vehicleGraphTile = city.vehicleGraph.getTile(entranceCoords.x, entranceCoords.y);
    if (!vehicleGraphTile) return;
    
    // Spawn police vehicle (this will be handled by a special vehicle spawner)
    // For now, we'll increment the counter
    this.activeVehicles++;
    
    // The actual vehicle spawning will be handled by the vehicle system
    // with a special police vehicle type
  }
  
  /**
   * Upgrade the police station
   */
  upgrade() {
    if (this.level < this.maxLevel) {
      this.level++;
      if (window.game && window.game.city) {
        this.refreshView(window.game.city);
      }
      return true;
    }
    return false;
  }
  
  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    const canUpgrade = this.level < this.maxLevel;
    const upgradeCost = this.getUpgradeCost();
    
    return `
      <div class="info-panel">
        <h2>${this.name}</h2>
        <div class="info-section">
          <p><strong>Seviye:</strong> ${this.level}/${this.maxLevel}</p>
          <p><strong>Enerji Tüketimi:</strong> ${this.energyConsumption} ⚡/tick</p>
          <p><strong>Aktif Polis Araçları:</strong> ${this.activeVehicles}/${this.vehiclesByLevel[this.level]}</p>
        </div>
        ${canUpgrade ? `
          <div class="info-section">
            <button class="action-button" onclick="window.game.selectedObject.building.upgrade(); window.ui.refreshInfoPanel();">
              Yükselt (${upgradeCost} 💰)
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  /**
   * Get upgrade cost
   * @returns {number}
   */
  getUpgradeCost() {
    const costs = {
      1: 5000,  // Level 1 -> 2
      2: 10000  // Level 2 -> 3
    };
    return costs[this.level] || 0;
  }
}

