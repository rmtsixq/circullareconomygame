import { Factory } from '../factory.js';
import { BuildingType } from '../buildingType.js';

/**
 * Textile Factory - Produces textiles and fabrics
 */
export class TextileFactory extends Factory {
  type = BuildingType.textileFactory;
  
  constructor(x = 0, y = 0) {
    super(x, y);
    this.energyConsumption = 5;
    this.baseWasteProduction = 1;
    
    // Define recipes
    this.recipes = [
      {
        id: 'textile-basic',
        name: 'Basic Textile',
        inputs: { 'raw-fabric': 2 },
        outputs: { 'clothing': 1 },
        waste: { 'textile-waste': 1 },
        duration: 3, // ticks (reduced from 5)
        requiredLevel: 1
      },
      {
        id: 'textile-advanced',
        name: 'Advanced Textile',
        inputs: { 'raw-fabric': 3, 'raw-plastic': 1 },
        outputs: { 'clothing': 2 },
        waste: { 'textile-waste': 1 },
        duration: 4, // reduced from 8
        requiredLevel: 2
      },
      {
        id: 'eco-textile',
        name: 'Eco Textile',
        inputs: { 'raw-fabric': 2, 'recycled-plastic': 1 },
        outputs: { 'clothing': 1 },
        waste: { 'textile-waste': 0.5 },
        duration: 5, // reduced from 10
        requiredLevel: 3
      }
    ];
  }

  getBaseCost() {
    return 5000;
  }
}

