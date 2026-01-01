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
  
  constructor(x = 0, y = 0) {
    super(x, y);
    this.name = generateFarmName();
    this.type = BuildingType.farming;
    this.power.required = 2; // Düşük enerji tüketimi
    
    // Initialize waste module for farming (organic waste)
    this.waste.productionRate = 0.5; // Low organic waste
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

