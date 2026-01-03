import { Factory } from '../factory.js';
import { BuildingType } from '../buildingType.js';

/**
 * Steel Factory - Produces steel and metal products
 */
export class SteelFactory extends Factory {
  type = BuildingType.steelFactory;
  
  constructor(x = 0, y = 0) {
    super(x, y);
    this.energyConsumption = 10;
    this.baseWasteProduction = 5; // Increased from 2
    this.requiredWorkers = 20; // Minimum 20 workers needed
    
    // Define recipes
    this.recipes = [
      {
        id: 'steel-basic',
        name: 'Basic Steel',
        inputs: { 'raw-metal': 3 },
        outputs: { 'steel-beam': 1 },
        waste: { 'scrap-metal': 2 },
        duration: 3, // reduced from 7
        requiredLevel: 1
      },
      {
        id: 'steel-advanced',
        name: 'Advanced Steel',
        inputs: { 'raw-metal': 4, 'recycled-metal': 1 },
        outputs: { 'steel-structure': 1 },
        waste: { 'scrap-metal': 1.5 },
        duration: 5, // reduced from 12
        requiredLevel: 2
      },
      {
        id: 'eco-steel',
        name: 'Eco Steel',
        inputs: { 'recycled-metal': 3 },
        outputs: { 'steel-beam': 1 },
        waste: { 'scrap-metal': 0.5 },
        duration: 6, // reduced from 15
        requiredLevel: 3
      }
    ];
  }

  getBaseCost() {
    return 10000;
  }
}

