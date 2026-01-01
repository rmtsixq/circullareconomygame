import { Factory } from '../factory.js';
import { BuildingType } from '../buildingType.js';

/**
 * Technology Factory - Produces electronics and tech products
 */
export class TechnologyFactory extends Factory {
  type = BuildingType.technologyFactory;
  
  constructor(x = 0, y = 0) {
    super(x, y);
    this.energyConsumption = 8;
    this.baseWasteProduction = 1.5;
    
    // Define recipes
    this.recipes = [
      {
        id: 'electronics-basic',
        name: 'Basic Electronics',
        inputs: { 'raw-electronics': 2, 'raw-metal': 1 },
        outputs: { 'smartphone': 1 },
        waste: { 'e-waste': 1 },
        duration: 3, // reduced from 6
        requiredLevel: 1
      },
      {
        id: 'electronics-advanced',
        name: 'Advanced Electronics',
        inputs: { 'raw-electronics': 3, 'raw-metal': 2, 'raw-plastic': 1 },
        outputs: { 'laptop': 1 },
        waste: { 'e-waste': 1.5 },
        duration: 5, // reduced from 10
        requiredLevel: 2
      },
      {
        id: 'smart-device',
        name: 'Smart Device',
        inputs: { 'raw-electronics': 4, 'raw-metal': 2, 'recycled-plastic': 1 },
        outputs: { 'smartphone': 1 },
        waste: { 'e-waste': 0.8 },
        duration: 6, // reduced from 15
        requiredLevel: 3
      }
    ];
  }

  getBaseCost() {
    return 8000;
  }
}

