import * as THREE from 'three';
import { City } from '../../city.js';
import { Zone } from './zone.js';
import { ResidentsModule } from '../modules/residents.js';
import { BuildingType } from '../buildingType.js';
import { WasteModule } from '../modules/waste.js';

export class ResidentialZone extends Zone {
  /**
   * @type {ResidentsModule}
   */
  residents = new ResidentsModule(this);

  /**
   * @type {WasteModule}
   */
  waste = new WasteModule(this);

  constructor(x, y) {
    super(x, y);
    this.name = generateBuildingName();
    this.type = BuildingType.residential;

    // Set style for residential (A, B, C, D, E, or F)
    this.style = ['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(6 * Math.random())];

    // Initialize waste module for residential (low waste production)
    this.waste.productionRate = 1.0; // Increased from 0.3
    this.waste.wasteType = 'organic-waste';
    this.waste.productionInterval = 3; // Produce every 3 ticks
  }

  /**
   * Steps the state of the zone forward in time by one simulation step
   * @param {City} city 
   * @param {number} currentTick 
   */
  simulate(city, currentTick = 0) {
    super.simulate(city);
    this.residents.simulate(city);

    // Update waste module
    if (this.waste) {
      this.waste.simulate(city, currentTick);
    }

    // Water consumption & Wastewater generation
    if (currentTick % 10 === 0 && window.resourceManager) {
      const population = this.residents ? this.residents.count : 0;
      if (population > 0) {
        const waterNeeded = population * 0.5; // 0.5 water per resident per 10 ticks
        if (window.resourceManager.getResource('water') >= waterNeeded) {
          window.resourceManager.removeResource('water', waterNeeded);
          window.resourceManager.addResource('wastewater', waterNeeded * 0.8);
        } else if (window.scoringSystem) {
          // Water shortage penalty
          window.scoringSystem.health = Math.max(0, window.scoringSystem.health - 0.1);
        }
      }
    }
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.residents.dispose();
    super.dispose();
  }

  /**
   * Override refreshView to add special visual for player house
   */
  refreshView() {
    // For player house, use development level to show different models
    if (this.isPlayerHouse) {
      let modelName;
      const level = this.development?.level || 1;

      // Player house models based on level
      // Use A, B, C styles for player house (not D, E, F)
      const playerHouseStyle = ['A', 'B', 'C'][Math.floor(3 * Math.random())];
      switch (level) {
        case 1:
          modelName = `${this.type}-${playerHouseStyle}1`;
          break;
        case 2:
          modelName = `${this.type}-${playerHouseStyle}2`;
          break;
        case 3:
          modelName = `${this.type}-${playerHouseStyle}3`;
          break;
        default:
          modelName = `${this.type}-${playerHouseStyle}${level}`;
      }

      let mesh = window.assetManager.getModel(modelName, this);

      // Tint building if abandoned or no power
      if (this.development?.state === 'abandoned') {
        mesh.traverse((obj) => {
          if (obj.material) {
            obj.material.color = new THREE.Color(0x707070);
          }
        });
      }

      // Add special visual effect for player house
      if (mesh) {
        mesh.traverse((obj) => {
          if (obj.material) {
            // Add a golden/yellow tint to make it stand out
            obj.material.color = new THREE.Color(0xffdd88); // Light golden color
            // Add emissive glow for special effect
            obj.material.emissive = new THREE.Color(0x332200);
            obj.material.emissiveIntensity = 0.3;
          }
        });
      }

      this.setMesh(mesh);
    } else {
      // Normal residential zone behavior
      super.refreshView();
    }
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();

    // Add special section for player house with management options
    if (this.isPlayerHouse) {
      const level = window.gameState?.level || 1;
      const levelUnlocks = window.levelUnlocks;

      html += `
        <div class="info-heading">Player House (HQ)</div>
        <div style="padding: 8px; color: #ffdd88; font-size: 0.9em; margin-bottom: 8px;">
          City management center. Cannot be removed.
        </div>
        <div style="padding: 8px;">
          ${levelUnlocks && levelUnlocks.isUnlocked('inventory-panel', level) ? `
          <button class="action-button" onclick="ui.openInventoryPanel()" style="width: 100%; margin-bottom: 4px;">
            Inventory
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('material-shop', level) ? `
          <button class="action-button" onclick="ui.openMaterialShop()" style="width: 100%; margin-bottom: 4px;">
            Buy Raw Materials
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-policy-panel', level) ? `
          <button class="action-button" onclick="ui.openSettingsPanel()" style="width: 100%; margin-bottom: 4px;">
            City Policies
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-energy-management', level) ? `
          <button class="action-button" onclick="ui.openEnergyManagementPanel()" style="width: 100%; margin-bottom: 4px;">
            Energy Management
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-statistics', level) ? `
          <button class="action-button" onclick="ui.openStatisticsPanel()" style="width: 100%; margin-bottom: 4px;">
            City Statistics
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-trade', level) ? `
          <button class="action-button" onclick="ui.openTradePanel()" style="width: 100%; margin-bottom: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1em; height: 1em; vertical-align: -0.125em; margin-right: 0.25em;">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v6h-2zm-3-1h2v2H8zm0 4h2v2H8zm8-4h-2v2h2zm0 4h-2v2h2z"/>
            </svg>
            Foreign Trade (Export)
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-research', level) ? `
          <button class="action-button" onclick="ui.openResearchPanel()" style="width: 100%; margin-bottom: 4px;">
            Research & Technology
          </button>
          ` : ''}
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
            <button class="action-button" onclick="ui.saveGame()" style="width: 100%; margin-bottom: 4px; background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%); display: flex; align-items: center; justify-content: center; gap: 8px;">
              <svg class="info-svg" style="margin: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Game
            </button>
            <button class="action-button" onclick="ui.loadGame()" style="width: 100%; background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%); display: flex; align-items: center; justify-content: center; gap: 8px;">
              <svg class="info-svg" style="margin: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Load Game
            </button>
          </div>
        </div>
      `;
    }

    html += this.residents.toHTML();
    return html;
  }
}

// Arrays of different name components
const prefixes = ['Emerald', 'Ivory', 'Crimson', 'Opulent', 'Celestial', 'Enchanted', 'Serene', 'Whispering', 'Stellar', 'Tranquil'];
const suffixes = ['Tower', 'Residence', 'Manor', 'Court', 'Plaza', 'House', 'Mansion', 'Place', 'Villa', 'Gardens'];

// Function to generate a random building name
function generateBuildingName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return prefix + ' ' + suffix;
}