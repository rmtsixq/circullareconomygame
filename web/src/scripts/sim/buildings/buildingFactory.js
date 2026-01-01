import { BuildingType } from './buildingType.js';
import { CommercialZone } from './zones/commercial.js';
import { ResidentialZone } from './zones/residential.js';
import { IndustrialZone } from './zones/industrial.js';
import { FarmingArea } from './zones/farming.js';
import { Road } from './transportation/road.js';
import { Building } from './building.js';
import { TextileFactory } from './factories/textileFactory.js';
import { TechnologyFactory } from './factories/technologyFactory.js';
import { SteelFactory } from './factories/steelFactory.js';
import { AutomotiveFactory } from './factories/automotiveFactory.js';
import { RecyclingCenter } from './recyclingCenter.js';
import { SolarPanel } from './energy/solarPanel.js';
import { WindTurbine } from './energy/windTurbine.js';
import { HydroPlant } from './energy/hydroPlant.js';

/**
 * Creates a new building object
 * @param {number} x The x-coordinate of the building
 * @param {number} y The y-coordinate of the building
 * @param {string} type The building type
 * @returns {Building} A new building object
 */
export function createBuilding(x, y, type) {
  // Normalize type to string for comparison
  const typeStr = String(type);
  
  switch (typeStr) {
    case BuildingType.residential:
    case 'residential':
      return new ResidentialZone();
    case BuildingType.commercial:
    case 'commercial':
      return new CommercialZone();
    case BuildingType.industrial:
    case 'industrial':
      return new IndustrialZone();
    case BuildingType.farming:
    case 'farming':
      return new FarmingArea();
    case BuildingType.road:
    case 'road':
      return new Road();
    case BuildingType.textileFactory:
    case 'textile-factory':
      return new TextileFactory(x, y);
    case BuildingType.technologyFactory:
    case 'technology-factory':
      return new TechnologyFactory(x, y);
    case BuildingType.steelFactory:
    case 'steel-factory':
      return new SteelFactory(x, y);
    case BuildingType.automotiveFactory:
    case 'automotive-factory':
      return new AutomotiveFactory(x, y);
    case BuildingType.recyclingCenter:
    case 'recycling-center':
      return new RecyclingCenter(x, y);
    case BuildingType.solarPanel:
    case 'solar-panel':
      return new SolarPanel(x, y);
    case BuildingType.windTurbine:
    case 'wind-turbine':
      return new WindTurbine(x, y);
    case BuildingType.hydroPlant:
    case 'hydro-plant':
      return new HydroPlant(x, y);
    default:
      console.error(`${type} (${typeStr}) is not a recognized building type. Available types:`, Object.values(BuildingType));
      return null;
  }
}