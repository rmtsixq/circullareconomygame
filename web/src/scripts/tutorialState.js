import { BuildingType } from './sim/buildings/buildingType.js';

/**
 * Tutorial State Management
 * Manages tutorial progression and step validation
 */
export class TutorialState {
  constructor() {
    this.currentStep = 0;
    this.isActive = true;
    this.completedSteps = new Set();
    this.allowedActions = new Set();
    this.stepData = {};
  }

  /**
   * Get current step info
   */
  getCurrentStepInfo() {
    return this.steps[this.currentStep] || null;
  }

  /**
   * Check if an action is allowed
   */
  isActionAllowed(action) {
    if (!this.isActive) return true;
    if (this.currentStep < 0) return true;

    // Limit residential placement to 1 during the tutorial (Step 6)
    if (this.currentStep === 6 && action === 'residential') {
      if (this.countResidentialBuildings() >= 1) {
        if (window.ui) {
          window.ui.showNotification(
            'Limit Reached',
            'You can only build 1 residence during the tutorial.',
            'warning'
          );
        }
        return false;
      }
    }

    return this.allowedActions.has(action);
  }

  /**
   * Count residential buildings excluding player house
   */
  countResidentialBuildings() {
    if (!window.game || !window.game.city) return 0;
    let count = 0;
    for (let x = 0; x < window.game.city.size; x++) {
      for (let y = 0; y < window.game.city.size; y++) {
        const tile = window.game.city.getTile(x, y);
        if (tile && tile.building && 
           (tile.building.type === BuildingType.residential || tile.building.type === 'residential')) {
          if (!tile.building.isPlayerHouse) {
            count++;
          }
        }
      }
    }
    return count;
  }

  /**
   * Complete current step
   */
  completeStep() {
    this.completedSteps.add(this.currentStep);
    this.currentStep++;

    // If tutorial is complete, show scenario selection
    if (this.currentStep >= this.steps.length) {
      this.isActive = false;
      if (window.ui) {
        window.ui.hideTutorialPanel();
        window.ui.unlockToolbar();
      }
      // Trigger any pending level ups now that tutorial is done
      if (window.gameState) {
        window.gameState.checkLevelUp();
      }
      // Show scenario selection screen
      if (window.scenarioSystem) {
        // Small delay to let the UI update
        setTimeout(() => {
          window.scenarioSystem.showScenarioSelection();
        }, 500);
      }
    } else {
      // Initialize next step
      this.initializeStep(this.currentStep);
    }
  }

  /**
   * Initialize a step
   */
  initializeStep(stepIndex) {
    const step = this.steps[stepIndex];
    if (!step) return;

    // Clear previous allowed actions
    this.allowedActions.clear();

    // Set allowed actions for this step
    if (step.allowedActions) {
      step.allowedActions.forEach(action => {
        this.allowedActions.add(action);
      });
    }

    // Call step initialization
    if (step.onInit) {
      step.onInit();
    }

    // Update UI
    if (window.ui) {
      window.ui.updateTutorialPanel(step);
    }
  }

  /**
   * Check step completion condition
   */
  checkStepCompletion() {
    const step = this.steps[this.currentStep];
    if (!step || !step.checkCompletion) return;

    if (step.checkCompletion()) {
      this.completeStep();
    }
  }

  /**
   * Tutorial steps definition
   */
  steps = [
    {
      id: 0,
      title: 'Welcome',
      content: `Hello!
Welcome to CircularWorld.

This city is your responsibility.
You will manage resources, produce energy, and build a sustainable future.

Shall we begin?`,
      allowedActions: [],
      onInit: () => {
        // No restrictions, just show message
      }
    },
    {
      id: 1,
      title: 'Need for Energy',
      content: `The city needs energy

Buildings cannot work without energy.
Our first job is to build a clean energy source.

Select the Solar Panel from the toolbar
and place 1 unit in a suitable location on the map.`,
      allowedActions: ['solar-panel', 'select'],
      maxSolarPanels: 1,
      onInit: () => {
        // Lock all toolbar buttons except solar panel and select
        if (window.ui) {
          window.ui.lockToolbar(['solar-panel', 'select']);
        }
      },
      checkCompletion: () => {
        // Check if exactly 1 solar panel is placed
        if (!window.game || !window.game.city) return false;

        let solarPanelCount = 0;
        for (let x = 0; x < window.game.city.size; x++) {
          for (let y = 0; y < window.game.city.size; y++) {
            const tile = window.game.city.getTile(x, y);
            if (tile && tile.building &&
              (tile.building.type === BuildingType.solarPanel || tile.building.type === 'solar-panel')) {
              solarPanelCount++;
            }
          }
        }

        return solarPanelCount >= 1;
      }
    },
    {
      id: 2,
      title: 'Road Connection',
      content: `Power needs a road

Let's draw a road from the solar panel to the player house.`,
      allowedActions: ['road', 'select'],
      onInit: () => {
        // Lock all toolbar buttons except road
        if (window.ui) {
          window.ui.lockToolbar(['road']);
        }
      },
      checkCompletion: () => {
        // Check if solar panel and player house are connected by road
        if (!window.game || !window.game.city || !window.tutorialState) return false;

        // Find solar panel and player house
        let solarPanelTile = null;
        let playerHouseTile = null;

        for (let x = 0; x < window.game.city.size; x++) {
          for (let y = 0; y < window.game.city.size; y++) {
            const tile = window.game.city.getTile(x, y);
            if (tile && tile.building) {
              const buildingType = tile.building.type;
              if (buildingType === BuildingType.solarPanel || buildingType === 'solar-panel') {
                solarPanelTile = tile;
              }
              if (tile.building.isPlayerHouse) {
                playerHouseTile = tile;
              }
            }
          }
        }

        if (!solarPanelTile || !playerHouseTile) return false;

        // Check if there's a road adjacent to both tiles
        return window.tutorialState.checkRoadConnection(solarPanelTile, playerHouseTile);
      }
    },
    {
      id: 3,
      title: 'Energy Icon Explanation',
      content: `What is this energy icon?

If you see a lightning bolt symbol over a building
this indicates the building does not have enough energy.

Without energy:
• Buildings won't work
• Production stops
• The city cannot grow

Right now, our energy is still insufficient.
Let's fix this.`,
      allowedActions: ['select'],
      onInit: () => {
        // Lock all toolbar buttons
        if (window.ui) {
          window.ui.lockToolbar([]);
        }
      }
    },
    {
      id: 4,
      title: 'Solar Panel Upgrade',
      content: `Increase energy production

Select the solar panel you just built
and upgrade it to Level 3.`,
      allowedActions: ['select', 'upgrade'],
      targetSolarPanelLevel: 3,
      onInit: () => {
        // Lock all toolbar buttons except select
        if (window.ui) {
          window.ui.lockToolbar(['select']);
        }
      },
      checkCompletion: () => {
        // Check if any solar panel is level 3
        if (!window.game || !window.game.city) return false;

        for (let x = 0; x < window.game.city.size; x++) {
          for (let y = 0; y < window.game.city.size; y++) {
            const tile = window.game.city.getTile(x, y);
            if (tile && tile.building &&
              (tile.building.type === BuildingType.solarPanel || tile.building.type === 'solar-panel')) {
              if (tile.building.level >= 3) {
                return true;
              }
            }
          }
        }

        return false;
      }
    },
    {
      id: 5,
      title: 'Player House (HQ) Introduction',
      content: `This is your Player House (HQ)

This is the management center of your city.

From here you will manage:
• City settings
• Energy policies
• Economy and environment balance

As you level up
new settings and features will unlock here.`,
      allowedActions: ['select'],
      onInit: () => {
        // Lock all toolbar buttons except select
        if (window.ui) {
          window.ui.lockToolbar(['select']);
        }
      }
    },
    {
      id: 6,
      title: 'Building a Residence',
      content: `No city without people

We need to add residents to your city.
To do this, build a Residence Building.`,
      allowedActions: ['residential', 'select'],
      onInit: () => {
        // Lock all toolbar buttons except residential
        if (window.ui) {
          window.ui.lockToolbar(['residential']);
        }
      },
      checkCompletion: () => {
        // Check if a residential building (NOT player house) is developed
        if (!window.game || !window.game.city) return false;

        for (let x = 0; x < window.game.city.size; x++) {
          for (let y = 0; y < window.game.city.size; y++) {
            const tile = window.game.city.getTile(x, y);
            if (tile && tile.building &&
              (tile.building.type === BuildingType.residential || tile.building.type === 'residential')) {
              // Skip player house - only count new residential buildings
              if (tile.building.isPlayerHouse) {
                continue;
              }

              if (tile.building.development &&
                tile.building.development.state === 'developed') {
                return true;
              }
            }
          }
        }

        return false;
      }
    },
    {
      id: 7,
      title: 'Factory Setup',
      content: `Time for production

To grow your city, you need:
• Production
• Job opportunities

Now, build a Textile Factory.`,
      allowedActions: ['textile-factory', 'select'],
      onInit: () => {
        // Lock all toolbar buttons except textile factory
        if (window.ui) {
          window.ui.lockToolbar(['textile-factory']);
        }
      },
      checkCompletion: () => {
        // Check if textile factory is placed
        if (!window.game || !window.game.city) return false;

        for (let x = 0; x < window.game.city.size; x++) {
          for (let y = 0; y < window.game.city.size; y++) {
            const tile = window.game.city.getTile(x, y);
            if (tile && tile.building &&
              (tile.building.type === BuildingType.textileFactory || tile.building.type === 'textile-factory')) {
              return true;
            }
          }
        }

        return false;
      }
    },
    {
      id: 8,
      title: 'Factory Explanation',
      content: `What do factories do?

Factories:
• Process raw materials
• Produce goods
• Generate waste

More factories =
more production but means more management.

As you produce:
• You gain XP
• You earn money
• Your city grows`,
      allowedActions: ['select'],
      onInit: () => {
        // Lock all toolbar buttons except select
        if (window.ui) {
          window.ui.lockToolbar(['select']);
        }
      }
    },
    {
      id: 9,
      title: 'Tutorial End',
      content: `You're ready!

Now you can:
• Produce energy
• House people
• Manufacture goods

Growing the city is now in your hands.`,
      allowedActions: [],
      onInit: () => {
        // Unlock all toolbar buttons
        if (window.ui) {
          window.ui.unlockToolbar();
        }
      }
    }
  ];

  /**
   * Check if two tiles are connected by road
   * Checks if both tiles have roads in their adjacent tiles
   */
  checkRoadConnection(tile1, tile2) {
    if (!window.game || !window.game.city) return false;

    // Check if there's a road adjacent to tile1 (solar panel)
    const hasRoadNearTile1 = this.hasAdjacentRoad(tile1);

    // Check if there's a road adjacent to tile2 (player house)
    const hasRoadNearTile2 = this.hasAdjacentRoad(tile2);

    // Both tiles need to have roads nearby
    return hasRoadNearTile1 && hasRoadNearTile2;
  }

  /**
   * Check if a tile has a road in any of its adjacent tiles
   */
  hasAdjacentRoad(tile) {
    if (!window.game || !window.game.city || !tile) return false;

    const { x, y } = tile;
    const neighbors = [
      window.game.city.getTile(x - 1, y),  // Left
      window.game.city.getTile(x + 1, y),  // Right
      window.game.city.getTile(x, y - 1), // Top
      window.game.city.getTile(x, y + 1)   // Bottom
    ];

    // Check if any neighbor has a road building
    for (const neighbor of neighbors) {
      if (neighbor && neighbor.building) {
        const buildingType = neighbor.building.type;
        if (buildingType === BuildingType.road || buildingType === 'road') {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Reset tutorial
   */
  reset() {
    this.currentStep = 0;
    this.isActive = true;
    this.completedSteps.clear();
    this.allowedActions.clear();
    this.stepData = {};
    this.initializeStep(0);
  }
}

// Global tutorial state instance
window.tutorialState = new TutorialState();

