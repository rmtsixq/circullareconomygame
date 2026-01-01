import { Factory } from '../factory.js';
import { BuildingType } from '../buildingType.js';

/**
 * Automotive Factory - Produces vehicles and automotive parts
 */
export class AutomotiveFactory extends Factory {
  type = BuildingType.automotiveFactory;
  
  constructor(x = 0, y = 0) {
    super(x, y);
    this.energyConsumption = 12;
    this.baseWasteProduction = 2.5;
    
    // Define recipes
    this.recipes = [
      {
        id: 'auto-parts',
        name: 'Auto Parts',
        inputs: { 'steel-beam': 2, 'raw-plastic': 2, 'raw-electronics': 1 },
        outputs: { 'electric-bike': 1 },
        waste: { 'scrap-metal': 1, 'plastic-waste': 1 },
        duration: 4, // reduced from 10
        requiredLevel: 1
      },
      {
        id: 'vehicle-basic',
        name: 'Basic Vehicle',
        inputs: { 'steel-structure': 2, 'raw-plastic': 3, 'raw-electronics': 2 },
        outputs: { 'electric-car': 1 },
        waste: { 'scrap-metal': 2, 'plastic-waste': 1 },
        duration: 6, // reduced from 20
        requiredLevel: 2
      },
      {
        id: 'eco-vehicle',
        name: 'Eco Vehicle',
        inputs: { 'steel-beam': 3, 'recycled-plastic': 2, 'raw-electronics': 2 },
        outputs: { 'electric-car': 1 },
        waste: { 'scrap-metal': 0.5, 'plastic-waste': 0.5 },
        duration: 7, // reduced from 25
        requiredLevel: 3
      }
    ];
  }

  getBaseCost() {
    return 15000;
  }
}

