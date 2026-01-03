import * as THREE from 'three';
import { Zone } from './zone.js';
import { BuildingType } from '../buildingType.js';
import { DevelopmentState } from '../modules/development.js';
import { WasteModule } from '../modules/waste.js';

export class FarmingArea extends Zone {
  /**
   * @type {WasteModule}
   */
  waste = new WasteModule(this);
  
  /**
   * Production progress (0-1)
   * @type {number}
   */
  productionProgress = 0;
  
  /**
   * Production rate per tick (based on level)
   * @type {number}
   */
  get productionRate() {
    // Level 1: 0.05 (20 ticks per product)
    // Level 2: 0.08 (12.5 ticks per product)
    // Level 3: 0.12 (8.3 ticks per product)
    const rates = {
      1: 0.05,
      2: 0.08,
      3: 0.12
    };
    return rates[this.development.level] || 0.05;
  }
  
  /**
   * Products produced by farming area
   * @type {Array<string>}
   */
  products = ['fertilizer', 'compost'];
  
  constructor(x = 0, y = 0) {
    super(x, y);
    this.name = generateFarmName();
    this.type = BuildingType.farming;
    this.power.required = 2; // Düşük enerji tüketimi
    
    // Initialize waste module for farming (organic waste)
    this.waste.productionRate = 1.0; // Increased from 0.5
    this.waste.wasteType = 'organic-waste';
    this.waste.productionInterval = 5; // Produce every 5 ticks
  }
  
  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   * @param {number} currentTick 
   */
  simulate(city, currentTick = 0) {
    super.simulate(city);
    
    // Update waste module
    if (this.waste) {
      this.waste.simulate(city, currentTick);
    }
    
    // Only produce if developed, powered, and has road access
    if (this.development.state === 'developed' && 
        this.power.isFullyPowered && 
        this.roadAccess.value &&
        window.resourceManager) {
      
      // Increase production progress
      this.productionProgress += this.productionRate;
      
      // When progress reaches 1, produce a product
      if (this.productionProgress >= 1) {
        const productsToProduce = Math.floor(this.productionProgress);
        this.productionProgress -= productsToProduce;
        
        // Produce products based on level
        for (let i = 0; i < productsToProduce; i++) {
          // Level 1: fertilizer only
          // Level 2: fertilizer and compost (50/50)
          // Level 3: more compost
          let productType;
          if (this.development.level === 1) {
            productType = 'fertilizer';
          } else if (this.development.level === 2) {
            productType = Math.random() < 0.5 ? 'fertilizer' : 'compost';
          } else {
            // Level 3: 30% fertilizer, 70% compost
            productType = Math.random() < 0.3 ? 'fertilizer' : 'compost';
          }
          
          // Add product to global inventory
          window.resourceManager.addResource(productType, 1);
          
          // Add XP
          if (window.gameState) {
            window.gameState.addXP(2);
          }
          
          // Show production effect
          if (window.visualEffects) {
            window.visualEffects.showProductionEffect(this, 1, productType);
          }
        }
      }
    }
  }

  refreshView() {
    let modelName;
    switch (this.development.state) {
      case DevelopmentState.underConstruction:
      case DevelopmentState.undeveloped:
        modelName = 'under-construction';
        break;
      default:
        modelName = `${this.type}-${this.style}${this.development.level}`;
        break;
    }

    let mesh = window.assetManager.getModel(modelName, this);
    
    // Safety check
    if (!mesh) {
      console.warn(`Failed to load model: ${modelName}`);
      return;
    }
    
    // Ensure mesh is centered on tile (X and Z should be 0)
    mesh.position.x = 0;
    mesh.position.z = 0;
    
    // Calculate bounding box to ensure mesh fits within tile
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // If mesh is too large, scale it down to fit within 1x1 tile
    const maxSize = 0.9; // Leave some margin
    if (size.x > maxSize || size.z > maxSize) {
      const scaleX = maxSize / size.x;
      const scaleZ = maxSize / size.z;
      const scale = Math.min(scaleX, scaleZ);
      mesh.scale.multiplyScalar(scale);
    }
    
    // Center the mesh on the tile
    mesh.position.x = -center.x;
    mesh.position.z = -center.z;
    
    // Adjust Y position to make farm touch the ground
    // Use -center.y to place the bottom of the mesh at y=0
    mesh.position.y = -center.y;
    
    // Tint building a dark color if it is abandoned
    if (this.development.state === DevelopmentState.abandoned) {
      mesh.traverse((obj) => {
        if (obj.material) {
          obj.material.color = new THREE.Color(0x707070);
        }
      });
    }
    
    this.setMesh(mesh);
  }
  
  /**
   * Returns HTML representation
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    
    html += `
      <div class="info-heading">🌾 Tarım Alanı</div>
      <span class="info-label">Seviye </span>
      <span class="info-value">${this.development.level}/${this.development.maxLevel}</span>
      <br>
      <span class="info-label">Durum </span>
      <span class="info-value">${this.development.state === 'developed' ? 'Aktif' : this.development.state === 'under-construction' ? 'İnşaat' : 'Gelişmemiş'}</span>
      <br>
      <span class="info-label">Enerji </span>
      <span class="info-value">${this.power.isFullyPowered ? this.power.required : 0}/${this.power.required} ⚡</span>
      <br>
    `;
    
    if (this.development.state === 'developed' && this.power.isFullyPowered) {
      const progressPercent = (this.productionProgress * 100).toFixed(0);
      html += `
        <span class="info-label">Üretim İlerlemesi </span>
        <span class="info-value">${progressPercent}%</span>
        <br>
        <span class="info-label">Üretim Hızı </span>
        <span class="info-value">${(this.productionRate * 100).toFixed(1)}%/tick</span>
        <br>
        <span class="info-label">Üretilen Ürünler </span>
        <span class="info-value">
          ${this.development.level === 1 ? 'Gübre' : this.development.level === 2 ? 'Gübre, Kompost' : 'Gübre, Kompost (daha fazla)'}
        </span>
        <br>
      `;
    }
    
    // Waste information
    if (this.waste) {
      const wasteLevel = (this.waste.amount / this.waste.maxCapacity * 100).toFixed(0);
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
        </div>
      `;
    }
    
    return html;
  }
}

// Arrays of different farm name components
const prefixes = ['Green', 'Golden', 'Sunny', 'Harvest', 'Meadow', 'Valley', 'Riverside', 'Hillside', 'Prairie', 'Orchard'];
const suffixes = ['Farm', 'Fields', 'Acres', 'Estate', 'Ranch', 'Grove', 'Garden', 'Plot', 'Land', 'Farmstead'];

// Function to generate a random farm name
function generateFarmName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return prefix + ' ' + suffix;
}

