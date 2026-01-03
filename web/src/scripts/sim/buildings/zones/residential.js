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
    this.waste.productionRate = 0.3; // Increased from 0.1
    this.waste.wasteType = 'organic-waste';
    this.waste.productionInterval = 8; // Produce every 8 ticks (increased frequency)
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
    
    // Development simulation is handled in Zone.simulate
    // Development module will check for isPlayerHouse and skip auto-leveling
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
        <div class="info-heading">Oyuncu Evi (HQ)</div>
        <div style="padding: 8px; color: #ffdd88; font-size: 0.9em; margin-bottom: 8px;">
          Şehir yönetim merkezi. Kaldırılamaz.
        </div>
        <div style="padding: 8px;">
          ${levelUnlocks && levelUnlocks.isUnlocked('inventory-panel', level) ? `
          <button class="action-button" onclick="ui.openInventoryPanel()" style="width: 100%; margin-bottom: 4px;">
            Envanter
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('auto-buy', level) ? `
          <button class="action-button" onclick="ui.openMaterialShop()" style="width: 100%; margin-bottom: 4px;">
            Ham Madde Satın Al
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-policy-panel', level) ? `
          <button class="action-button" onclick="ui.openSettingsPanel()" style="width: 100%; margin-bottom: 4px;">
            Şehir Politikaları
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-energy-management', level) ? `
          <button class="action-button" onclick="ui.openEnergyManagementPanel()" style="width: 100%; margin-bottom: 4px;">
            Enerji Yönetimi
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-statistics', level) ? `
          <button class="action-button" onclick="ui.openStatisticsPanel()" style="width: 100%; margin-bottom: 4px;">
            Şehir İstatistikleri
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-trade', level) ? `
          <button class="action-button" onclick="ui.openTradePanel()" style="width: 100%; margin-bottom: 4px;">
            Takas & Pazar
          </button>
          ` : ''}
          ${levelUnlocks && levelUnlocks.isUnlocked('hq-research', level) ? `
          <button class="action-button" onclick="ui.openResearchPanel()" style="width: 100%; margin-bottom: 4px;">
            Araştırma & Teknoloji
          </button>
          ` : ''}
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
            <button class="action-button" onclick="ui.saveGame()" style="width: 100%; margin-bottom: 4px; background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);">
              💾 Oyunu Kaydet
            </button>
            <button class="action-button" onclick="ui.loadGame()" style="width: 100%; background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);">
              📂 Oyunu Yükle
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