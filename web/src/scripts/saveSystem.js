/**
 * Save/Load System - Handles game state persistence using localStorage
 */

// Import createBuilding for reconstruction
import { createBuilding } from './sim/buildings/buildingFactory.js';

const SAVE_KEY = 'circularWorld_save';

/**
 * Serialize game state to JSON
 */
export function saveGame() {
  try {
    if (!window.gameState || !window.resourceManager || !window.game || !window.game.city) {
      console.error('Cannot save: Game not initialized');
      return false;
    }

    const saveData = {
      version: '1.0',
      timestamp: Date.now(),
      
      // Game State
      gameState: {
        money: window.gameState.money,
        energy: window.gameState.energy,
        level: window.gameState.level,
        xp: window.gameState.xp,
        circularScore: window.gameState.circularScore
      },
      
      // Resources
      resources: { ...window.resourceManager.resources },
      
      // City
      city: {
        name: window.game.city.cityName || window.game.city.name || 'My City',
        size: window.game.city.size,
        simTime: window.game.city.simTime,
        buildings: []
      },
      
      // City Policies
      cityPolicies: window.cityPolicies ? {
        recyclingPriority: window.cityPolicies.recyclingPriority,
        energyPolicy: window.cityPolicies.energyPolicy,
        productionEnvironmentBalance: window.cityPolicies.productionEnvironmentBalance,
        productionMode: window.cityPolicies.productionMode,
        salesPolicy: window.cityPolicies.salesPolicy,
        taxPolicy: window.cityPolicies.taxPolicy,
        workforceDistribution: { ...window.cityPolicies.workforceDistribution },
        energyTradeMode: window.cityPolicies.energyTradeMode,
        autoSave: window.cityPolicies.autoSave,
        autoSaveInterval: window.cityPolicies.autoSaveInterval
      } : null,
      
      // Tutorial State
      tutorialState: window.tutorialState ? {
        isActive: window.tutorialState.isActive,
        currentStep: window.tutorialState.currentStep,
        completedSteps: Array.from(window.tutorialState.completedSteps || [])
      } : null
    };

    // Serialize all buildings
    for (let x = 0; x < window.game.city.size; x++) {
      for (let y = 0; y < window.game.city.size; y++) {
        const tile = window.game.city.getTile(x, y);
        if (tile && tile.building) {
          const building = tile.building;
          
          // Get building data
          const buildingData = {
            x: x,
            y: y,
            type: building.type,
            level: building.level || 1,
            name: building.name || null
          };
          
          // Add building-specific data
          if (building.type === 'factory' || building.type === 'textile-factory' || 
              building.type === 'technology-factory' || building.type === 'steel-factory' || 
              building.type === 'automotive-factory') {
            // Factory specific
            buildingData.style = building.style;
          } else if (building.type === 'residential' || building.type === 'commercial' || 
                     building.type === 'industrial') {
            // Zone specific
            buildingData.style = building.style;
            buildingData.developmentState = building.development ? building.development.state : null;
            buildingData.developmentLevel = building.development ? building.development.level : 1;
            buildingData.isPlayerHouse = building.isPlayerHouse || false;
            
            // Commercial zone inventory
            if (building.type === 'commercial' && building.inventory) {
              buildingData.inventory = { ...building.inventory };
            }
          } else if (building.type === 'farming') {
            // Farming area
            buildingData.developmentState = building.development ? building.development.state : null;
            buildingData.developmentLevel = building.development ? building.development.level : 1;
          }
          
          saveData.city.buildings.push(buildingData);
        }
      }
    }

    // Save to localStorage
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('Game saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
}

/**
 * Load game state from JSON
 */
export function loadGame() {
  try {
    const saveDataStr = localStorage.getItem(SAVE_KEY);
    if (!saveDataStr) {
      console.log('No save data found');
      return false;
    }

    const saveData = JSON.parse(saveDataStr);
    
    if (!saveData || !saveData.gameState || !saveData.resources || !saveData.city) {
      console.error('Invalid save data');
      return false;
    }

    // Restore GameState
    if (window.gameState) {
      window.gameState.money = saveData.gameState.money || 500000;
      window.gameState.energy = saveData.gameState.energy || 0;
      window.gameState.level = saveData.gameState.level || 1;
      window.gameState.xp = saveData.gameState.xp || 0;
      window.gameState.circularScore = saveData.gameState.circularScore || 0;
      window.gameState.updateUI();
    }

    // Restore Resources
    if (window.resourceManager) {
      window.resourceManager.resources = { ...saveData.resources };
      window.resourceManager.updateUI();
    }

    // Restore City Policies
    if (window.cityPolicies && saveData.cityPolicies) {
      window.cityPolicies.recyclingPriority = saveData.cityPolicies.recyclingPriority || 50;
      window.cityPolicies.energyPolicy = saveData.cityPolicies.energyPolicy || 'balanced';
      window.cityPolicies.productionEnvironmentBalance = saveData.cityPolicies.productionEnvironmentBalance || 50;
      window.cityPolicies.productionMode = saveData.cityPolicies.productionMode || 'balanced';
      window.cityPolicies.salesPolicy = saveData.cityPolicies.salesPolicy || 'auto';
      window.cityPolicies.taxPolicy = saveData.cityPolicies.taxPolicy || 'medium';
      window.cityPolicies.workforceDistribution = saveData.cityPolicies.workforceDistribution || {
        factories: 60,
        recycling: 20,
        commercial: 20
      };
      window.cityPolicies.energyTradeMode = saveData.cityPolicies.energyTradeMode || 'none';
      window.cityPolicies.autoSave = saveData.cityPolicies.autoSave !== undefined ? saveData.cityPolicies.autoSave : true;
      window.cityPolicies.autoSaveInterval = saveData.cityPolicies.autoSaveInterval || 30;
    }

    // Restore Tutorial State
    const level = saveData.gameState?.level || 1;
    if (window.tutorialState) {
      if (level > 1) {
        // Level > 1: Tutorial should be inactive
        window.tutorialState.isActive = false;
        window.tutorialState.currentStep = -1;
        window.tutorialState.allowedActions.clear();
        if (window.ui && typeof window.ui.hideTutorialPanel === 'function') {
          window.ui.hideTutorialPanel();
        }
        if (window.ui && typeof window.ui.unlockToolbar === 'function') {
          window.ui.unlockToolbar();
        }
      } else if (saveData.tutorialState) {
        // Level 1: Restore tutorial state from save
        window.tutorialState.isActive = saveData.tutorialState.isActive !== undefined ? saveData.tutorialState.isActive : false;
        window.tutorialState.currentStep = saveData.tutorialState.currentStep || 0;
        if (saveData.tutorialState.completedSteps) {
          window.tutorialState.completedSteps = new Set(saveData.tutorialState.completedSteps);
        }
        
        // If tutorial is active, initialize current step
        if (window.tutorialState.isActive && window.tutorialState.currentStep >= 0) {
          window.tutorialState.initializeStep(window.tutorialState.currentStep);
        } else {
          // Tutorial not active - unlock toolbar
          if (window.ui && typeof window.ui.hideTutorialPanel === 'function') {
            window.ui.hideTutorialPanel();
          }
          if (window.ui && typeof window.ui.unlockToolbar === 'function') {
            window.ui.unlockToolbar();
          }
        }
      } else {
        // No tutorial state in save, but level is 1 - start tutorial
        if (level === 1) {
          window.tutorialState.isActive = true;
          window.tutorialState.currentStep = 0;
          window.tutorialState.initializeStep(0);
        } else {
          // Level > 1 but no tutorial state - disable tutorial
          window.tutorialState.isActive = false;
          window.tutorialState.currentStep = -1;
          if (window.ui && typeof window.ui.hideTutorialPanel === 'function') {
            window.ui.hideTutorialPanel();
          }
          if (window.ui && typeof window.ui.unlockToolbar === 'function') {
            window.ui.unlockToolbar();
          }
        }
      }
    }

    // Return save data for city reconstruction
    return saveData;
  } catch (error) {
    console.error('Error loading game:', error);
    return false;
  }
}

/**
 * Check if save data exists
 */
export function hasSaveData() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

/**
 * Delete save data
 */
export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
  console.log('Save data deleted');
}

/**
 * Reconstruct city from save data
 * This should be called after creating a new City object
 */
export function reconstructCity(saveData, city) {
  if (!saveData || !saveData.city || !city) {
    return false;
  }

  try {
    // Restore city name
    if (saveData.city.name) {
      city.name = saveData.city.name;
      if (window.game) {
        window.game.cityName = saveData.city.name;
      }
    }

    // Restore simulation time
    if (saveData.city.simTime) {
      city.simTime = saveData.city.simTime;
    }

    // Reconstruct buildings
    if (saveData.city.buildings && Array.isArray(saveData.city.buildings)) {
      for (const buildingData of saveData.city.buildings) {
        try {
          const tile = city.getTile(buildingData.x, buildingData.y);
          if (!tile) continue;

          // Create building
          const building = createBuilding(buildingData.x, buildingData.y, buildingData.type);
          
          if (!building) {
            console.warn(`Failed to create building: ${buildingData.type} at (${buildingData.x}, ${buildingData.y})`);
            continue;
          }

          // Set building properties
          if (buildingData.level) {
            building.level = buildingData.level;
          }

          if (buildingData.name) {
            building.name = buildingData.name;
          }

          // Zone-specific properties
          if (building.development && buildingData.developmentState) {
            building.development.state = buildingData.developmentState;
            building.development.level = buildingData.developmentLevel || 1;
          }

          if (buildingData.isPlayerHouse) {
            building.isPlayerHouse = true;
          }

          // Commercial zone inventory
          if (building.type === 'commercial' && buildingData.inventory && building.inventory) {
            building.inventory = { ...buildingData.inventory };
          }

          // Place building on tile
          tile.setBuilding(building);
          tile.refreshView(city);
          building.refreshView();
        } catch (error) {
          console.error(`Error reconstructing building at (${buildingData.x}, ${buildingData.y}):`, error);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error reconstructing city:', error);
    return false;
  }
}

// Export functions to window for global access
window.saveSystem = {
  saveGame,
  loadGame,
  hasSaveData,
  deleteSave,
  reconstructCity
};

