/**
 * Scenario System - 3 Game Modes after Tutorial
 * Manages scenario selection, prebuilt city layouts, and win/lose conditions
 */
import { createBuilding } from './sim/buildings/buildingFactory.js';

export class ScenarioSystem {
  constructor() {
    this.activeScenario = null;
    this.scenarioStarted = false;
    this.winChecked = false;
    this.loseChecked = false;
    this.checkCooldown = 0;
    this.CHECK_INTERVAL = 10; // Check every 10 ticks
  }

  /**
   * Get all scenario definitions
   */
  getScenarios() {
    return {
      'waste-crisis': {
        id: 'waste-crisis',
        title: 'The Waste Crisis',
        icon: '🗑️',
        difficulty: 3,
        difficultyLabel: 'Hard',
        color: '#E91E63',
        gradientFrom: '#880E4F',
        gradientTo: '#E91E63',
        description: 'The previous administration left the city drowning in garbage. Factories are polluting and waste is everywhere. Build MRFs and survive.',
        story: 'The previous mayor prioritized rapid industrialization but completely ignored waste management. The city is now buried under garbage. Treasury is running dry, and citizens are extremely unhealthy. You must quickly build recycling infrastructure and clean up this mess before the city collapses.',
        startingConditions: {
          money: 50000,
          energy: 20000,
          level: 3,
          resources: {
            'raw-fabric': 10,
            'raw-plastic': 10,
            'raw-metal': 10,
            'raw-electronics': 10,
            'raw-glass': 10,
            'water': 200,
            'textile-waste': 300,
            'plastic-waste': 300,
            'e-waste': 200,
            'scrap-metal': 150,
            'organic-waste': 100
          }
        },
        prebuiltBuildings: [
          {"x":0,"y":6,"type":"solar-panel"},
          {"x":0,"y":8,"type":"road"},
          {"x":0,"y":9,"type":"road"},
          {"x":0,"y":10,"type":"road"},
          {"x":0,"y":11,"type":"road"},
          {"x":0,"y":12,"type":"road"},
          {"x":0,"y":13,"type":"road"},
          {"x":0,"y":14,"type":"road"},
          {"x":1,"y":0,"type":"road"},
          {"x":1,"y":1,"type":"road"},
          {"x":1,"y":2,"type":"road"},
          {"x":1,"y":3,"type":"road"},
          {"x":1,"y":4,"type":"road"},
          {"x":1,"y":5,"type":"road"},
          {"x":1,"y":7,"type":"road"},
          {"x":1,"y":8,"type":"road"},
          {"x":1,"y":9,"type":"residential","developmentState":"developed"},
          {"x":1,"y":12,"type":"solar-panel"},
          {"x":1,"y":14,"type":"road"},
          {"x":2,"y":0,"type":"road"},
          {"x":2,"y":3,"type":"residential","developmentState":"developed"},
          {"x":2,"y":5,"type":"road"},
          {"x":2,"y":7,"type":"road"},
          {"x":2,"y":10,"type":"solar-panel"},
          {"x":2,"y":12,"type":"residential","developmentState":"developed"},
          {"x":2,"y":14,"type":"road"},
          {"x":2,"y":17,"type":"school"},
          {"x":3,"y":0,"type":"road"},
          {"x":3,"y":4,"type":"road"},
          {"x":3,"y":5,"type":"road"},
          {"x":3,"y":6,"type":"road"},
          {"x":3,"y":7,"type":"road"},
          {"x":3,"y":8,"type":"road"},
          {"x":3,"y":9,"type":"road"},
          {"x":3,"y":10,"type":"road"},
          {"x":3,"y":11,"type":"road"},
          {"x":3,"y":12,"type":"road"},
          {"x":3,"y":13,"type":"road"},
          {"x":3,"y":14,"type":"road"},
          {"x":3,"y":15,"type":"road"},
          {"x":3,"y":16,"type":"road"},
          {"x":4,"y":0,"type":"road"},
          {"x":4,"y":2,"type":"residential","developmentState":"developed"},
          {"x":4,"y":3,"type":"hospital"},
          {"x":4,"y":4,"type":"road"},
          {"x":4,"y":5,"type":"residential","developmentState":"developed"},
          {"x":4,"y":9,"type":"residential","developmentState":"developed"},
          {"x":4,"y":10,"type":"road"},
          {"x":4,"y":14,"type":"textile-factory"},
          {"x":4,"y":16,"type":"road"},
          {"x":4,"y":17,"type":"road"},
          {"x":4,"y":18,"type":"road"},
          {"x":4,"y":19,"type":"road"},
          {"x":5,"y":0,"type":"road"},
          {"x":5,"y":1,"type":"road"},
          {"x":5,"y":2,"type":"road"},
          {"x":5,"y":3,"type":"road"},
          {"x":5,"y":4,"type":"road"},
          {"x":5,"y":6,"type":"textile-factory"},
          {"x":5,"y":9,"type":"park"},
          {"x":5,"y":10,"type":"road"},
          {"x":5,"y":11,"type":"residential","developmentState":"developed"},
          {"x":5,"y":13,"type":"residential","developmentState":"developed"},
          {"x":5,"y":14,"type":"residential"},
          {"x":5,"y":15,"type":"commercial","developmentState":"developed"},
          {"x":5,"y":16,"type":"road"},
          {"x":5,"y":19,"type":"road"},
          {"x":6,"y":4,"type":"road"},
          {"x":6,"y":8,"type":"road"},
          {"x":6,"y":9,"type":"road"},
          {"x":6,"y":10,"type":"road"},
          {"x":6,"y":11,"type":"road"},
          {"x":6,"y":12,"type":"road"},
          {"x":6,"y":16,"type":"road"},
          {"x":6,"y":17,"type":"residential","developmentState":"developed"},
          {"x":6,"y":19,"type":"road"},
          {"x":7,"y":2,"type":"residential","developmentState":"developed"},
          {"x":7,"y":4,"type":"road"},
          {"x":7,"y":5,"type":"textile-factory"},
          {"x":7,"y":8,"type":"road"},
          {"x":7,"y":10,"type":"hospital"},
          {"x":7,"y":11,"type":"park"},
          {"x":7,"y":12,"type":"road"},
          {"x":7,"y":13,"type":"textile-factory"},
          {"x":7,"y":16,"type":"road"},
          {"x":7,"y":19,"type":"road"},
          {"x":8,"y":4,"type":"road"},
          {"x":8,"y":7,"type":"residential","developmentState":"developed"},
          {"x":8,"y":8,"type":"road"},
          {"x":8,"y":9,"type":"residential"},
          {"x":8,"y":12,"type":"road"},
          {"x":8,"y":14,"type":"park"},
          {"x":8,"y":15,"type":"residential"},
          {"x":8,"y":16,"type":"road"},
          {"x":8,"y":17,"type":"road"},
          {"x":8,"y":18,"type":"road"},
          {"x":8,"y":19,"type":"road"},
          {"x":9,"y":0,"type":"road"},
          {"x":9,"y":1,"type":"road"},
          {"x":9,"y":2,"type":"road"},
          {"x":9,"y":3,"type":"road"},
          {"x":9,"y":4,"type":"road"},
          {"x":9,"y":5,"type":"residential"},
          {"x":9,"y":7,"type":"school"},
          {"x":9,"y":8,"type":"road"},
          {"x":9,"y":12,"type":"road"},
          {"x":9,"y":13,"type":"road"},
          {"x":9,"y":14,"type":"road"},
          {"x":9,"y":15,"type":"road"},
          {"x":9,"y":16,"type":"road"},
          {"x":9,"y":19,"type":"road"},
          {"x":10,"y":0,"type":"road"},
          {"x":10,"y":3,"type":"residential","developmentState":"developed"},
          {"x":10,"y":4,"type":"road"},
          {"x":10,"y":6,"type":"textile-factory"},
          {"x":10,"y":8,"type":"road"},
          {"x":10,"y":10,"type":"residential","isPlayerHouse":true,"developmentState":"developed"},
          {"x":10,"y":12,"type":"residential"},
          {"x":10,"y":13,"type":"commercial","developmentState":"developed"},
          {"x":10,"y":16,"type":"road"},
          {"x":10,"y":17,"type":"residential"},
          {"x":10,"y":19,"type":"road"},
          {"x":11,"y":0,"type":"road"},
          {"x":11,"y":4,"type":"road"},
          {"x":11,"y":6,"type":"commercial","developmentState":"developed"},
          {"x":11,"y":8,"type":"road"},
          {"x":11,"y":9,"type":"road"},
          {"x":11,"y":11,"type":"park"},
          {"x":11,"y":13,"type":"textile-factory"},
          {"x":11,"y":15,"type":"hospital"},
          {"x":11,"y":16,"type":"road"},
          {"x":11,"y":19,"type":"road"},
          {"x":12,"y":0,"type":"road"},
          {"x":12,"y":2,"type":"residential","developmentState":"developed"},
          {"x":12,"y":4,"type":"road"},
          {"x":12,"y":8,"type":"residential","developmentState":"developed"},
          {"x":12,"y":9,"type":"road"},
          {"x":12,"y":10,"type":"road"},
          {"x":12,"y":11,"type":"road"},
          {"x":12,"y":12,"type":"road"},
          {"x":12,"y":13,"type":"road"},
          {"x":12,"y":14,"type":"road"},
          {"x":12,"y":15,"type":"road"},
          {"x":12,"y":16,"type":"road"},
          {"x":12,"y":19,"type":"road"},
          {"x":13,"y":0,"type":"road"},
          {"x":13,"y":3,"type":"school"},
          {"x":13,"y":4,"type":"road"},
          {"x":13,"y":5,"type":"residential","developmentState":"developed"},
          {"x":13,"y":7,"type":"residential","developmentState":"developed"},
          {"x":13,"y":9,"type":"road"},
          {"x":13,"y":12,"type":"residential","developmentState":"developed"},
          {"x":13,"y":13,"type":"residential","developmentState":"developed"},
          {"x":13,"y":14,"type":"residential"},
          {"x":13,"y":15,"type":"residential"},
          {"x":13,"y":16,"type":"road"},
          {"x":13,"y":18,"type":"residential"},
          {"x":13,"y":19,"type":"road"},
          {"x":14,"y":0,"type":"road"},
          {"x":14,"y":1,"type":"road"},
          {"x":14,"y":2,"type":"road"},
          {"x":14,"y":3,"type":"road"},
          {"x":14,"y":4,"type":"road"},
          {"x":14,"y":8,"type":"textile-factory"},
          {"x":14,"y":9,"type":"road"},
          {"x":14,"y":11,"type":"residential"},
          {"x":14,"y":16,"type":"road"},
          {"x":14,"y":19,"type":"road"},
          {"x":15,"y":1,"type":"park"},
          {"x":15,"y":2,"type":"residential"},
          {"x":15,"y":3,"type":"park"},
          {"x":15,"y":4,"type":"road"},
          {"x":15,"y":5,"type":"park"},
          {"x":15,"y":7,"type":"residential"},
          {"x":15,"y":9,"type":"road"},
          {"x":15,"y":12,"type":"residential","developmentState":"developed"},
          {"x":15,"y":15,"type":"park"},
          {"x":15,"y":16,"type":"road"},
          {"x":15,"y":17,"type":"road"},
          {"x":15,"y":19,"type":"road"},
          {"x":16,"y":4,"type":"road"},
          {"x":16,"y":5,"type":"road"},
          {"x":16,"y":6,"type":"road"},
          {"x":16,"y":7,"type":"road"},
          {"x":16,"y":8,"type":"road"},
          {"x":16,"y":9,"type":"road"},
          {"x":16,"y":10,"type":"road"},
          {"x":16,"y":11,"type":"road"},
          {"x":16,"y":12,"type":"road"},
          {"x":16,"y":13,"type":"road"},
          {"x":16,"y":14,"type":"road"},
          {"x":16,"y":15,"type":"road"},
          {"x":16,"y":16,"type":"residential","developmentState":"developed"},
          {"x":16,"y":17,"type":"road"},
          {"x":16,"y":18,"type":"road"},
          {"x":16,"y":19,"type":"road"},
          {"x":17,"y":1,"type":"residential"},
          {"x":17,"y":2,"type":"road"},
          {"x":17,"y":3,"type":"road"},
          {"x":17,"y":4,"type":"road"},
          {"x":17,"y":6,"type":"road"},
          {"x":17,"y":8,"type":"park"},
          {"x":17,"y":9,"type":"road"},
          {"x":17,"y":11,"type":"residential"},
          {"x":17,"y":13,"type":"residential"},
          {"x":17,"y":15,"type":"road"},
          {"x":17,"y":16,"type":"road"},
          {"x":17,"y":18,"type":"residential"},
          {"x":18,"y":2,"type":"road"},
          {"x":18,"y":4,"type":"residential"},
          {"x":18,"y":5,"type":"park"},
          {"x":18,"y":6,"type":"road"},
          {"x":18,"y":7,"type":"residential"},
          {"x":18,"y":9,"type":"road"},
          {"x":18,"y":12,"type":"road"},
          {"x":18,"y":13,"type":"road"},
          {"x":18,"y":14,"type":"road"},
          {"x":18,"y":15,"type":"road"},
          {"x":19,"y":2,"type":"road"},
          {"x":19,"y":3,"type":"road"},
          {"x":19,"y":4,"type":"road"},
          {"x":19,"y":5,"type":"road"},
          {"x":19,"y":6,"type":"road"},
          {"x":19,"y":8,"type":"park"},
          {"x":19,"y":9,"type":"road"},
          {"x":19,"y":10,"type":"road"},
          {"x":19,"y":11,"type":"road"},
          {"x":19,"y":12,"type":"road"}
        ],
        tips: [
          "Upgrade energy sources to handle industrial load.",
          "Buy starting raw materials from the Trade Panel.",
          "Focus on keeping Health and Sustainability up."
        ],
        winConditions: {
          sustainability: 70,
          health: 70,
          recyclingCenters: 3,
          label: 'Sustainability ≥ 70 • Health ≥ 70 • 3+ Recycling Centers'
        },
        loseConditions: {
          money: 0,
          health: 5,
          label: 'Bankruptcy OR Health drops below 5'
        }
      },

      'resource-scarcity': {
        id: 'resource-scarcity',
        title: 'Resource Scarcity',
        icon: '🏝️',
        difficulty: 2,
        difficultyLabel: 'Medium',
        color: '#2196F3',
        gradientFrom: '#0D47A1',
        gradientTo: '#2196F3',
        description: 'An island city with extremely limited natural resources. Close the loop and teach the city to survive totally on recycled goods.',
        story: 'This coastal city is completely cut off from external raw materials. You have a highly educated and aware population, but zero basic supplies. You must establish a flawless circular economy, relying entirely on existing waste and recycled materials to produce goods and grow.',
        startingConditions: {
          money: 100000,
          energy: 20000,
          level: 4,
          resources: {
            'raw-fabric': 0,
            'raw-plastic': 0,
            'raw-metal': 0,
            'raw-electronics': 0,
            'raw-glass': 0,
            'water': 500,
            'textile-waste': 150,
            'plastic-waste': 100,
            'e-waste': 50,
            'scrap-metal': 100,
            'organic-waste': 80
          }
        },
        prebuiltBuildings: [
          {"x":0,"y":6,"type":"solar-panel"},
          {"x":0,"y":8,"type":"road"},
          {"x":0,"y":9,"type":"road"},
          {"x":0,"y":10,"type":"road"},
          {"x":0,"y":11,"type":"road"},
          {"x":0,"y":12,"type":"road"},
          {"x":0,"y":13,"type":"road"},
          {"x":0,"y":14,"type":"road"},
          {"x":1,"y":0,"type":"road"},
          {"x":1,"y":1,"type":"road"},
          {"x":1,"y":2,"type":"road"},
          {"x":1,"y":3,"type":"road"},
          {"x":1,"y":4,"type":"road"},
          {"x":1,"y":5,"type":"road"},
          {"x":1,"y":7,"type":"road"},
          {"x":1,"y":8,"type":"road"},
          {"x":1,"y":9,"type":"residential","developmentState":"developed"},
          {"x":1,"y":12,"type":"wind-turbine"},
          {"x":1,"y":14,"type":"road"},
          {"x":2,"y":0,"type":"road"},
          {"x":2,"y":3,"type":"residential","developmentState":"developed"},
          {"x":2,"y":5,"type":"road"},
          {"x":2,"y":7,"type":"road"},
          {"x":2,"y":10,"type":"wind-turbine"},
          {"x":2,"y":12,"type":"residential","developmentState":"developed"},
          {"x":2,"y":14,"type":"road"},
          {"x":2,"y":15,"type":"solar-panel"},
          {"x":2,"y":16,"type":"wind-turbine"},
          {"x":2,"y":17,"type":"school"},
          {"x":3,"y":0,"type":"road"},
          {"x":3,"y":4,"type":"road"},
          {"x":3,"y":5,"type":"road"},
          {"x":3,"y":6,"type":"road"},
          {"x":3,"y":7,"type":"road"},
          {"x":3,"y":8,"type":"road"},
          {"x":3,"y":9,"type":"road"},
          {"x":3,"y":10,"type":"road"},
          {"x":3,"y":11,"type":"road"},
          {"x":3,"y":12,"type":"road"},
          {"x":3,"y":13,"type":"road"},
          {"x":3,"y":14,"type":"road"},
          {"x":3,"y":15,"type":"road"},
          {"x":3,"y":16,"type":"road"},
          {"x":4,"y":0,"type":"road"},
          {"x":4,"y":2,"type":"residential","developmentState":"developed"},
          {"x":4,"y":3,"type":"hospital"},
          {"x":4,"y":4,"type":"road"},
          {"x":4,"y":5,"type":"residential","developmentState":"developed"},
          {"x":4,"y":7,"type":"solar-panel"},
          {"x":4,"y":8,"type":"solar-panel"},
          {"x":4,"y":9,"type":"residential","developmentState":"developed"},
          {"x":4,"y":10,"type":"road"},
          {"x":4,"y":12,"type":"wind-turbine"},
          {"x":4,"y":14,"type":"recycling-center"},
          {"x":4,"y":16,"type":"road"},
          {"x":4,"y":17,"type":"road"},
          {"x":4,"y":18,"type":"road"},
          {"x":4,"y":19,"type":"road"},
          {"x":5,"y":0,"type":"road"},
          {"x":5,"y":1,"type":"road"},
          {"x":5,"y":2,"type":"road"},
          {"x":5,"y":3,"type":"road"},
          {"x":5,"y":4,"type":"road"},
          {"x":5,"y":7,"type":"wind-turbine"},
          {"x":5,"y":10,"type":"road"},
          {"x":5,"y":11,"type":"residential","developmentState":"developed"},
          {"x":5,"y":13,"type":"residential","developmentState":"developed"},
          {"x":5,"y":14,"type":"residential"},
          {"x":5,"y":15,"type":"commercial","developmentState":"developed"},
          {"x":5,"y":16,"type":"road"},
          {"x":5,"y":19,"type":"road"},
          {"x":6,"y":4,"type":"road"},
          {"x":6,"y":8,"type":"road"},
          {"x":6,"y":9,"type":"road"},
          {"x":6,"y":10,"type":"road"},
          {"x":6,"y":11,"type":"road"},
          {"x":6,"y":12,"type":"road"},
          {"x":6,"y":16,"type":"road"},
          {"x":6,"y":17,"type":"residential","developmentState":"developed"},
          {"x":6,"y":19,"type":"road"},
          {"x":7,"y":2,"type":"residential","developmentState":"developed"},
          {"x":7,"y":4,"type":"road"},
          {"x":7,"y":8,"type":"road"},
          {"x":7,"y":10,"type":"hospital"},
          {"x":7,"y":12,"type":"road"},
          {"x":7,"y":16,"type":"road"},
          {"x":7,"y":19,"type":"road"},
          {"x":8,"y":4,"type":"road"},
          {"x":8,"y":7,"type":"residential","developmentState":"developed"},
          {"x":8,"y":8,"type":"road"},
          {"x":8,"y":9,"type":"residential"},
          {"x":8,"y":12,"type":"road"},
          {"x":8,"y":15,"type":"residential"},
          {"x":8,"y":16,"type":"road"},
          {"x":8,"y":17,"type":"road"},
          {"x":8,"y":18,"type":"road"},
          {"x":8,"y":19,"type":"road"},
          {"x":9,"y":0,"type":"road"},
          {"x":9,"y":1,"type":"road"},
          {"x":9,"y":2,"type":"road"},
          {"x":9,"y":3,"type":"road"},
          {"x":9,"y":4,"type":"road"},
          {"x":9,"y":5,"type":"residential"},
          {"x":9,"y":7,"type":"school"},
          {"x":9,"y":8,"type":"road"},
          {"x":9,"y":12,"type":"road"},
          {"x":9,"y":13,"type":"road"},
          {"x":9,"y":14,"type":"road"},
          {"x":9,"y":15,"type":"road"},
          {"x":9,"y":16,"type":"road"},
          {"x":9,"y":19,"type":"road"},
          {"x":10,"y":0,"type":"road"},
          {"x":10,"y":3,"type":"residential","developmentState":"developed"},
          {"x":10,"y":4,"type":"road"},
          {"x":10,"y":8,"type":"road"},
          {"x":10,"y":10,"type":"residential","isPlayerHouse":true,"developmentState":"developed"},
          {"x":10,"y":12,"type":"residential"},
          {"x":10,"y":13,"type":"commercial","developmentState":"developed"},
          {"x":10,"y":16,"type":"road"},
          {"x":10,"y":17,"type":"residential"},
          {"x":10,"y":19,"type":"road"},
          {"x":11,"y":0,"type":"road"},
          {"x":11,"y":4,"type":"road"},
          {"x":11,"y":6,"type":"commercial","developmentState":"developed"},
          {"x":11,"y":8,"type":"road"},
          {"x":11,"y":9,"type":"road"},
          {"x":11,"y":15,"type":"hospital"},
          {"x":11,"y":16,"type":"road"},
          {"x":11,"y":19,"type":"road"},
          {"x":12,"y":0,"type":"road"},
          {"x":12,"y":2,"type":"residential","developmentState":"developed"},
          {"x":12,"y":4,"type":"road"},
          {"x":12,"y":8,"type":"residential","developmentState":"developed"},
          {"x":12,"y":9,"type":"road"},
          {"x":12,"y":10,"type":"road"},
          {"x":12,"y":11,"type":"road"},
          {"x":12,"y":12,"type":"road"},
          {"x":12,"y":13,"type":"road"},
          {"x":12,"y":14,"type":"road"},
          {"x":12,"y":15,"type":"road"},
          {"x":12,"y":16,"type":"road"},
          {"x":12,"y":19,"type":"road"},
          {"x":13,"y":0,"type":"road"},
          {"x":13,"y":3,"type":"school"},
          {"x":13,"y":4,"type":"road"},
          {"x":13,"y":5,"type":"residential","developmentState":"developed"},
          {"x":13,"y":7,"type":"residential","developmentState":"developed"},
          {"x":13,"y":9,"type":"road"},
          {"x":13,"y":12,"type":"residential","developmentState":"developed"},
          {"x":13,"y":13,"type":"residential","developmentState":"developed"},
          {"x":13,"y":14,"type":"residential"},
          {"x":13,"y":15,"type":"residential"},
          {"x":13,"y":16,"type":"road"},
          {"x":13,"y":18,"type":"residential"},
          {"x":13,"y":19,"type":"road"},
          {"x":14,"y":0,"type":"road"},
          {"x":14,"y":1,"type":"road"},
          {"x":14,"y":2,"type":"road"},
          {"x":14,"y":3,"type":"road"},
          {"x":14,"y":4,"type":"road"},
          {"x":14,"y":9,"type":"road"},
          {"x":14,"y":11,"type":"residential"},
          {"x":14,"y":16,"type":"road"},
          {"x":14,"y":19,"type":"road"},
          {"x":15,"y":2,"type":"residential"},
          {"x":15,"y":4,"type":"road"},
          {"x":15,"y":7,"type":"residential"},
          {"x":15,"y":9,"type":"road"},
          {"x":15,"y":12,"type":"residential","developmentState":"developed"},
          {"x":15,"y":16,"type":"road"},
          {"x":15,"y":17,"type":"road"},
          {"x":15,"y":19,"type":"road"},
          {"x":16,"y":4,"type":"road"},
          {"x":16,"y":5,"type":"road"},
          {"x":16,"y":6,"type":"road"},
          {"x":16,"y":7,"type":"road"},
          {"x":16,"y":8,"type":"road"},
          {"x":16,"y":9,"type":"road"},
          {"x":16,"y":10,"type":"road"},
          {"x":16,"y":11,"type":"road"},
          {"x":16,"y":12,"type":"road"},
          {"x":16,"y":13,"type":"road"},
          {"x":16,"y":14,"type":"road"},
          {"x":16,"y":15,"type":"road"},
          {"x":16,"y":16,"type":"residential","developmentState":"developed"},
          {"x":16,"y":17,"type":"road"},
          {"x":16,"y":18,"type":"road"},
          {"x":16,"y":19,"type":"road"},
          {"x":17,"y":1,"type":"residential"},
          {"x":17,"y":2,"type":"road"},
          {"x":17,"y":3,"type":"road"},
          {"x":17,"y":4,"type":"road"},
          {"x":17,"y":6,"type":"road"},
          {"x":17,"y":9,"type":"road"},
          {"x":17,"y":11,"type":"residential"},
          {"x":17,"y":13,"type":"residential"},
          {"x":17,"y":15,"type":"road"},
          {"x":17,"y":16,"type":"road"},
          {"x":17,"y":18,"type":"residential"},
          {"x":18,"y":2,"type":"road"},
          {"x":18,"y":4,"type":"residential"},
          {"x":18,"y":6,"type":"road"},
          {"x":18,"y":7,"type":"residential"},
          {"x":18,"y":9,"type":"road"},
          {"x":18,"y":12,"type":"road"},
          {"x":18,"y":13,"type":"road"},
          {"x":18,"y":14,"type":"road"},
          {"x":18,"y":15,"type":"road"},
          {"x":19,"y":2,"type":"road"},
          {"x":19,"y":3,"type":"road"},
          {"x":19,"y":4,"type":"road"},
          {"x":19,"y":5,"type":"road"},
          {"x":19,"y":6,"type":"road"},
          {"x":19,"y":9,"type":"road"},
          {"x":19,"y":10,"type":"road"},
          {"x":19,"y":11,"type":"road"},
          {"x":19,"y":12,"type":"road"}
        ],
        tips: [
          "You only have one recycling center. Close the material loops quickly!",
          "Expand energy grid WITHOUT using dirty sources.",
          "Maximize Sustainability to hit your Management Goal."
        ],
        winConditions: {
          managementScore: 80,
          money: 500000,
          label: 'Management ≥ 80 • Money ≥ 500K • Zero Raw Input'
        },
        loseConditions: {
          wellbeing: 15,
          label: 'Wellbeing drops below 15'
        }
      },

      'industrial-transition': {
        id: 'industrial-transition',
        title: 'Industrial Transition',
        icon: '🏗️',
        difficulty: 4,
        difficultyLabel: 'Very Hard',
        color: '#FF9800',
        gradientFrom: '#E65100',
        gradientTo: '#FF9800',
        description: 'A rich but highly polluting industrial powerhouse. Transition to green energy and circular production without crashing the economy.',
        story: 'The city economy is booming! The treasury is overflowing. However, the sky is black with smog, and citizens are suffering from severe health issues. Your task is to transform this polluting industrial giant into a green, sustainable city without causing mass unemployment or bankruptcy.',
        startingConditions: {
          money: 2000000,
          energy: 20000,
          level: 5,
          resources: {
            'raw-fabric': 500,
            'raw-plastic': 500,
            'raw-metal': 500,
            'raw-electronics': 200,
            'raw-glass': 200,
            'water': 2000,
            'textile-waste': 500,
            'plastic-waste': 500,
            'e-waste': 300,
            'scrap-metal': 400,
            'organic-waste': 200,
            'steel-beam': 500
          }
        },
        prebuiltBuildings: [
          {"x":0,"y":6,"type":"hospital"},
          {"x":0,"y":8,"type":"road"},
          {"x":0,"y":9,"type":"road"},
          {"x":0,"y":10,"type":"road"},
          {"x":0,"y":11,"type":"road"},
          {"x":0,"y":12,"type":"road"},
          {"x":0,"y":13,"type":"road"},
          {"x":0,"y":14,"type":"road"},
          {"x":1,"y":0,"type":"road"},
          {"x":1,"y":1,"type":"road"},
          {"x":1,"y":2,"type":"road"},
          {"x":1,"y":3,"type":"road"},
          {"x":1,"y":4,"type":"road"},
          {"x":1,"y":5,"type":"road"},
          {"x":1,"y":7,"type":"road"},
          {"x":1,"y":8,"type":"road"},
          {"x":1,"y":9,"type":"residential","developmentState":"developed"},
          {"x":1,"y":12,"type":"automotive-factory"},
          {"x":1,"y":14,"type":"road"},
          {"x":2,"y":0,"type":"road"},
          {"x":2,"y":3,"type":"residential","developmentState":"developed"},
          {"x":2,"y":5,"type":"road"},
          {"x":2,"y":7,"type":"road"},
          {"x":2,"y":10,"type":"steel-factory"},
          {"x":2,"y":12,"type":"residential","developmentState":"developed"},
          {"x":2,"y":14,"type":"road"},
          {"x":2,"y":15,"type":"automotive-factory"},
          {"x":2,"y":16,"type":"hospital"},
          {"x":2,"y":17,"type":"school"},
          {"x":3,"y":0,"type":"road"},
          {"x":3,"y":4,"type":"road"},
          {"x":3,"y":5,"type":"road"},
          {"x":3,"y":6,"type":"road"},
          {"x":3,"y":7,"type":"road"},
          {"x":3,"y":8,"type":"road"},
          {"x":3,"y":9,"type":"road"},
          {"x":3,"y":10,"type":"road"},
          {"x":3,"y":11,"type":"road"},
          {"x":3,"y":12,"type":"road"},
          {"x":3,"y":13,"type":"road"},
          {"x":3,"y":14,"type":"road"},
          {"x":3,"y":15,"type":"road"},
          {"x":3,"y":16,"type":"road"},
          {"x":4,"y":0,"type":"road"},
          {"x":4,"y":2,"type":"residential","developmentState":"developed"},
          {"x":4,"y":3,"type":"hospital"},
          {"x":4,"y":4,"type":"road"},
          {"x":4,"y":5,"type":"residential","developmentState":"developed"},
          {"x":4,"y":7,"type":"automotive-factory"},
          {"x":4,"y":8,"type":"steel-factory"},
          {"x":4,"y":9,"type":"residential","developmentState":"developed"},
          {"x":4,"y":10,"type":"road"},
          {"x":4,"y":12,"type":"automotive-factory"},
          {"x":4,"y":14,"type":"steel-factory"},
          {"x":4,"y":16,"type":"road"},
          {"x":4,"y":17,"type":"road"},
          {"x":4,"y":18,"type":"road"},
          {"x":4,"y":19,"type":"road"},
          {"x":5,"y":0,"type":"road"},
          {"x":5,"y":1,"type":"road"},
          {"x":5,"y":2,"type":"road"},
          {"x":5,"y":3,"type":"road"},
          {"x":5,"y":4,"type":"road"},
          {"x":5,"y":6,"type":"steel-factory"},
          {"x":5,"y":7,"type":"hospital"},
          {"x":5,"y":9,"type":"automotive-factory"},
          {"x":5,"y":10,"type":"road"},
          {"x":5,"y":11,"type":"residential","developmentState":"developed"},
          {"x":5,"y":12,"type":"steel-factory"},
          {"x":5,"y":13,"type":"residential","developmentState":"developed"},
          {"x":5,"y":14,"type":"residential"},
          {"x":5,"y":15,"type":"commercial","developmentState":"developed"},
          {"x":5,"y":16,"type":"road"},
          {"x":5,"y":19,"type":"road"},
          {"x":6,"y":2,"type":"automotive-factory"},
          {"x":6,"y":3,"type":"hospital"},
          {"x":6,"y":4,"type":"road"},
          {"x":6,"y":7,"type":"automotive-factory"},
          {"x":6,"y":8,"type":"road"},
          {"x":6,"y":9,"type":"road"},
          {"x":6,"y":10,"type":"road"},
          {"x":6,"y":11,"type":"road"},
          {"x":6,"y":12,"type":"road"},
          {"x":6,"y":16,"type":"road"},
          {"x":6,"y":17,"type":"residential","developmentState":"developed"},
          {"x":6,"y":19,"type":"road"},
          {"x":7,"y":2,"type":"residential","developmentState":"developed"},
          {"x":7,"y":4,"type":"road"},
          {"x":7,"y":5,"type":"steel-factory"},
          {"x":7,"y":8,"type":"road"},
          {"x":7,"y":10,"type":"hospital"},
          {"x":7,"y":11,"type":"steel-factory"},
          {"x":7,"y":12,"type":"road"},
          {"x":7,"y":13,"type":"steel-factory"},
          {"x":7,"y":16,"type":"road"},
          {"x":7,"y":19,"type":"road"},
          {"x":8,"y":0,"type":"automotive-factory"},
          {"x":8,"y":1,"type":"hospital"},
          {"x":8,"y":4,"type":"road"},
          {"x":8,"y":7,"type":"residential","developmentState":"developed"},
          {"x":8,"y":8,"type":"road"},
          {"x":8,"y":9,"type":"residential"},
          {"x":8,"y":10,"type":"automotive-factory"},
          {"x":8,"y":12,"type":"road"},
          {"x":8,"y":14,"type":"steel-factory"},
          {"x":8,"y":15,"type":"residential"},
          {"x":8,"y":16,"type":"road"},
          {"x":8,"y":17,"type":"road"},
          {"x":8,"y":18,"type":"road"},
          {"x":8,"y":19,"type":"road"},
          {"x":9,"y":0,"type":"road"},
          {"x":9,"y":1,"type":"road"},
          {"x":9,"y":2,"type":"road"},
          {"x":9,"y":3,"type":"road"},
          {"x":9,"y":4,"type":"road"},
          {"x":9,"y":5,"type":"residential"},
          {"x":9,"y":7,"type":"school"},
          {"x":9,"y":8,"type":"road"},
          {"x":9,"y":11,"type":"automotive-factory"},
          {"x":9,"y":12,"type":"road"},
          {"x":9,"y":13,"type":"road"},
          {"x":9,"y":14,"type":"road"},
          {"x":9,"y":15,"type":"road"},
          {"x":9,"y":16,"type":"road"},
          {"x":9,"y":17,"type":"hospital"},
          {"x":9,"y":19,"type":"road"},
          {"x":10,"y":0,"type":"road"},
          {"x":10,"y":3,"type":"residential","developmentState":"developed"},
          {"x":10,"y":4,"type":"road"},
          {"x":10,"y":6,"type":"steel-factory"},
          {"x":10,"y":8,"type":"road"},
          {"x":10,"y":9,"type":"automotive-factory"},
          {"x":10,"y":10,"type":"residential","isPlayerHouse":true,"developmentState":"developed"},
          {"x":10,"y":12,"type":"residential"},
          {"x":10,"y":13,"type":"commercial","developmentState":"developed"},
          {"x":10,"y":14,"type":"steel-factory"},
          {"x":10,"y":16,"type":"road"},
          {"x":10,"y":17,"type":"residential"},
          {"x":10,"y":19,"type":"road"},
          {"x":11,"y":0,"type":"road"},
          {"x":11,"y":1,"type":"automotive-factory"},
          {"x":11,"y":3,"type":"hospital"},
          {"x":11,"y":4,"type":"road"},
          {"x":11,"y":6,"type":"commercial","developmentState":"developed"},
          {"x":11,"y":7,"type":"automotive-factory"},
          {"x":11,"y":8,"type":"road"},
          {"x":11,"y":9,"type":"road"},
          {"x":11,"y":10,"type":"steel-factory"},
          {"x":11,"y":11,"type":"automotive-factory"},
          {"x":11,"y":13,"type":"steel-factory"},
          {"x":11,"y":15,"type":"hospital"},
          {"x":11,"y":16,"type":"road"},
          {"x":11,"y":17,"type":"hospital"},
          {"x":11,"y":19,"type":"road"},
          {"x":12,"y":0,"type":"road"},
          {"x":12,"y":2,"type":"residential","developmentState":"developed"},
          {"x":12,"y":4,"type":"road"},
          {"x":12,"y":8,"type":"residential","developmentState":"developed"},
          {"x":12,"y":9,"type":"road"},
          {"x":12,"y":10,"type":"road"},
          {"x":12,"y":11,"type":"road"},
          {"x":12,"y":12,"type":"road"},
          {"x":12,"y":13,"type":"road"},
          {"x":12,"y":14,"type":"road"},
          {"x":12,"y":15,"type":"road"},
          {"x":12,"y":16,"type":"road"},
          {"x":12,"y":17,"type":"automotive-factory"},
          {"x":12,"y":19,"type":"road"},
          {"x":13,"y":0,"type":"road"},
          {"x":13,"y":3,"type":"school"},
          {"x":13,"y":4,"type":"road"},
          {"x":13,"y":5,"type":"residential","developmentState":"developed"},
          {"x":13,"y":6,"type":"steel-factory"},
          {"x":13,"y":7,"type":"residential","developmentState":"developed"},
          {"x":13,"y":9,"type":"road"},
          {"x":13,"y":12,"type":"residential","developmentState":"developed"},
          {"x":13,"y":13,"type":"residential","developmentState":"developed"},
          {"x":13,"y":14,"type":"residential"},
          {"x":13,"y":15,"type":"residential"},
          {"x":13,"y":16,"type":"road"},
          {"x":13,"y":18,"type":"residential"},
          {"x":13,"y":19,"type":"road"},
          {"x":14,"y":0,"type":"road"},
          {"x":14,"y":1,"type":"road"},
          {"x":14,"y":2,"type":"road"},
          {"x":14,"y":3,"type":"road"},
          {"x":14,"y":4,"type":"road"},
          {"x":14,"y":5,"type":"automotive-factory"},
          {"x":14,"y":8,"type":"steel-factory"},
          {"x":14,"y":9,"type":"road"},
          {"x":14,"y":10,"type":"hospital"},
          {"x":14,"y":11,"type":"residential"},
          {"x":14,"y":16,"type":"road"},
          {"x":14,"y":19,"type":"road"},
          {"x":15,"y":1,"type":"automotive-factory"},
          {"x":15,"y":2,"type":"residential"},
          {"x":15,"y":3,"type":"steel-factory"},
          {"x":15,"y":4,"type":"road"},
          {"x":15,"y":5,"type":"automotive-factory"},
          {"x":15,"y":6,"type":"hospital"},
          {"x":15,"y":7,"type":"residential"},
          {"x":15,"y":9,"type":"road"},
          {"x":15,"y":11,"type":"automotive-factory"},
          {"x":15,"y":12,"type":"residential","developmentState":"developed"},
          {"x":15,"y":13,"type":"steel-factory"},
          {"x":15,"y":15,"type":"automotive-factory"},
          {"x":15,"y":16,"type":"road"},
          {"x":15,"y":17,"type":"road"},
          {"x":15,"y":19,"type":"road"},
          {"x":16,"y":4,"type":"road"},
          {"x":16,"y":5,"type":"road"},
          {"x":16,"y":6,"type":"road"},
          {"x":16,"y":7,"type":"road"},
          {"x":16,"y":8,"type":"road"},
          {"x":16,"y":9,"type":"road"},
          {"x":16,"y":10,"type":"road"},
          {"x":16,"y":11,"type":"road"},
          {"x":16,"y":12,"type":"road"},
          {"x":16,"y":13,"type":"road"},
          {"x":16,"y":14,"type":"road"},
          {"x":16,"y":15,"type":"road"},
          {"x":16,"y":16,"type":"residential","developmentState":"developed"},
          {"x":16,"y":17,"type":"road"},
          {"x":16,"y":18,"type":"road"},
          {"x":16,"y":19,"type":"road"},
          {"x":17,"y":1,"type":"residential"},
          {"x":17,"y":2,"type":"road"},
          {"x":17,"y":3,"type":"road"},
          {"x":17,"y":4,"type":"road"},
          {"x":17,"y":6,"type":"road"},
          {"x":17,"y":8,"type":"hospital"},
          {"x":17,"y":9,"type":"road"},
          {"x":17,"y":11,"type":"residential"},
          {"x":17,"y":13,"type":"residential"},
          {"x":17,"y":15,"type":"road"},
          {"x":17,"y":16,"type":"road"},
          {"x":17,"y":17,"type":"automotive-factory"},
          {"x":17,"y":18,"type":"residential"},
          {"x":18,"y":2,"type":"road"},
          {"x":18,"y":4,"type":"residential"},
          {"x":18,"y":5,"type":"steel-factory"},
          {"x":18,"y":6,"type":"road"},
          {"x":18,"y":7,"type":"residential"},
          {"x":18,"y":9,"type":"road"},
          {"x":18,"y":12,"type":"road"},
          {"x":18,"y":13,"type":"road"},
          {"x":18,"y":14,"type":"road"},
          {"x":18,"y":15,"type":"road"},
          {"x":18,"y":16,"type":"automotive-factory"},
          {"x":19,"y":2,"type":"road"},
          {"x":19,"y":3,"type":"road"},
          {"x":19,"y":4,"type":"road"},
          {"x":19,"y":5,"type":"road"},
          {"x":19,"y":6,"type":"road"},
          {"x":19,"y":8,"type":"hospital"},
          {"x":19,"y":9,"type":"road"},
          {"x":19,"y":10,"type":"road"},
          {"x":19,"y":11,"type":"road"},
          {"x":19,"y":12,"type":"road"}
        ],
        tips: [
          "Destroy highly polluting factories gradually.",
          "Offset job/money loss by switching to Eco-Commercial zones.",
          "Use your massive wealth to jumpstart the transformation."
        ],
        winConditions: {
          managementScore: 90,
          sustainability: 60,
          health: 60,
          label: 'Management ≥ 90 • Sustainability ≥ 60 • Health ≥ 60'
        },
        loseConditions: {
          money: 500000,
          label: 'Treasury drops below 500,000'
        }
      }
    };
  }

  /**
   * Show scenario selection screen
   */
  showScenarioSelection() {
    const modal = document.getElementById('scenario-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide scenario selection screen
   */
  hideScenarioSelection() {
    const modal = document.getElementById('scenario-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /**
   * Select and apply a scenario
   * @param {string} scenarioId
   */
  selectScenario(scenarioId) {
    const scenarios = this.getScenarios();
    const scenario = scenarios[scenarioId];
    if (!scenario) {
      console.error(`Unknown scenario: ${scenarioId}`);
      return;
    }

    this.activeScenario = scenario;
    this.scenarioStarted = true;
    this.winChecked = false;
    this.loseChecked = false;

    // Hide scenario modal
    this.hideScenarioSelection();

    // Clear the existing city
    this.clearCity();

    // Apply starting conditions
    this.applyStartingConditions(scenario);

    // Place prebuilt buildings
    this.placePrebuiltBuildings(scenario);

    // Populate Objectives Panel
    this.populateObjectivesPanel(scenario);

    // Initialize market for the scenario level
    if (window.market && window.gameState) {
      window.market.initialize(window.gameState.level);
    }

    // Update UI
    if (window.ui) {
      window.ui.updateToolbarVisibility();
      window.ui.updateGameState(window.gameState);
      window.ui.updateResources(window.resourceManager);
      window.ui.unlockToolbar();
    }

    // Store scenario in gameState
    if (window.gameState) {
      window.gameState.scenarioId = scenarioId;
      window.gameState.scenarioActive = true;
    }

    // Show scenario started notification
    if (window.ui) {
      window.ui.showNotification(
        `${scenario.icon} ${scenario.title}`,
        'Scenario started! Check the objectives panel for your goals.',
        'success'
      );
      window.ui.toggleHelpModal();
    }

    console.log(`Scenario "${scenario.title}" applied successfully`);
  }

  /**
   * Clear all buildings from the city
   */
  clearCity() {
    if (!window.game || !window.game.city) return;

    const city = window.game.city;
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile && tile.building) {
          tile.building.dispose();
          tile.setBuilding(null);
          tile.refreshView(city);
        }
      }
    }
  }

  /**
   * Apply scenario starting conditions
   */
  applyStartingConditions(scenario) {
    const conditions = scenario.startingConditions;

    // Game State
    if (window.gameState) {
      window.gameState.money = conditions.money;
      window.gameState.energy = conditions.energy;
      window.gameState.level = conditions.level;
      window.gameState.xp = 0;
      window.gameState.circularScore = 0;
      window.gameState.wellbeing = 50;
      window.gameState.education = 30;
      window.gameState.health = 70;
      window.gameState.sustainability = 0;
      window.gameState.managementScore = 0;
    }

    // Scoring System
    if (window.scoringSystem) {
      window.scoringSystem.reset();
    }

    // Resources
    if (window.resourceManager && conditions.resources) {
      // Reset resources first
      window.resourceManager.reset();
      // Apply scenario-specific resources
      for (const [resource, amount] of Object.entries(conditions.resources)) {
        window.resourceManager.resources[resource] = amount;
      }
    }

    // City Policies
    if (window.cityPolicies) {
      window.cityPolicies.reset();
    }

    // Tutorial must be off
    if (window.tutorialState) {
      window.tutorialState.isActive = false;
      window.tutorialState.currentStep = -1;
      window.tutorialState.allowedActions.clear();
    }
  }

  /**
   * Place prebuilt buildings on the city
   */

  /**
   * Populates and displays the scenario objectives panel
   */
  populateObjectivesPanel(scenario) {
    const panel = document.getElementById("objectives-panel");
    const content = document.getElementById("objectives-content");
    const toggleBtn = document.getElementById("objectives-toggle-btn");
    const aimsList = document.getElementById("objectives-aim-list");
    const tipsList = document.getElementById("objectives-tips-list");

    if (!panel || !aimsList || !tipsList) return;

    // Clear previous
    aimsList.innerHTML = "";
    tipsList.innerHTML = "";

    // Fill Win Conditions
    if (scenario.winConditions && scenario.winConditions.label) {
      const parts = scenario.winConditions.label.split(" ? ");
      parts.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p;
        aimsList.appendChild(li);
      });
      // Fallback if not using split symbol
      if (parts.length === 1 && scenario.winConditions.label.includes(" � ")) {
        aimsList.innerHTML = "";
        scenario.winConditions.label.split(" � ").forEach(p => {
            const li = document.createElement("li");
            li.textContent = p;
            aimsList.appendChild(li);
        });
      }
    } else {
        const li = document.createElement("li");
        li.textContent = "Survive and thrive!";
        aimsList.appendChild(li);
    }

    // Fill Tips
    if (scenario.tips && scenario.tips.length > 0) {
      scenario.tips.forEach(t => {
        const li = document.createElement("li");
        li.style.marginBottom = "4px";
        li.textContent = "• " + t;
        tipsList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "No specific tips for this scenario.";
      tipsList.appendChild(li);
    }

    // Show the panel
    panel.style.display = "block";
    const toggleToolbarBtn = document.getElementById("button-objectives");
    if (toggleToolbarBtn) toggleToolbarBtn.classList.add("selected");
    
    // Ensure content is expanded
    if (content) content.style.display = "block";
    if (toggleBtn) toggleBtn.textContent = "?";
  }

  placePrebuiltBuildings(scenario) {
    if (!window.game || !window.game.city) return;

    const city = window.game.city;

    for (const bData of scenario.prebuiltBuildings) {
      const tile = city.getTile(bData.x, bData.y);
      if (!tile) continue;

      const building = createBuilding(bData.x, bData.y, bData.type);
      if (!building) {
        console.warn(`Failed to create building: ${bData.type} at (${bData.x}, ${bData.y})`);
        continue;
      }

      // Set level
      if (bData.level) {
        building.level = bData.level;
      }

      // Set player house
      if (bData.isPlayerHouse) {
        building.isPlayerHouse = true;
        building.name = 'Player House';
      }

      // Set development state for zones
      if (bData.developmentState && building.development) {
        building.development.state = bData.developmentState;
        building.development.level = bData.developmentLevel || 1;
      }

      tile.setBuilding(building);
      tile.refreshView(city);

      // Refresh visual
      if (building.refreshView) {
        building.refreshView(city);
      }
    }

    // Update adjacent tiles for roads
    for (const bData of scenario.prebuiltBuildings) {
      if (bData.type === 'road') {
        city.getTile(bData.x - 1, bData.y)?.refreshView(city);
        city.getTile(bData.x + 1, bData.y)?.refreshView(city);
        city.getTile(bData.x, bData.y - 1)?.refreshView(city);
        city.getTile(bData.x, bData.y + 1)?.refreshView(city);

        // Update vehicle graph
        const tile = city.getTile(bData.x, bData.y);
        if (tile && tile.building && city.vehicleGraph) {
          city.vehicleGraph.updateTile(bData.x, bData.y, tile.building);
        }
      }
    }
  }

  /**
   * Check win/lose conditions (called every tick from game.simulate)
   * @param {number} currentTick
   */
  checkConditions(currentTick) {
    if (!this.activeScenario || !this.scenarioStarted) return;
    if (!window.gameState) return;

    // Throttle checks
    this.checkCooldown++;
    if (this.checkCooldown < this.CHECK_INTERVAL) return;
    this.checkCooldown = 0;

    // Don't check in the first 20 ticks (let the game stabilize)
    if (currentTick < 20) return;

    const gs = window.gameState;
    const scenario = this.activeScenario;

    // Check WIN condition
    if (this.checkWinCondition(gs, scenario)) {
      this.scenarioStarted = false;
      this.showWinScreen(scenario);
      return;
    }

    // Check LOSE condition
    if (this.checkLoseCondition(gs, scenario)) {
      this.scenarioStarted = false;
      this.showLoseScreen(scenario);
      return;
    }
  }

  /**
   * Check if win conditions are met
   */
  checkWinCondition(gs, scenario) {
    const wc = scenario.winConditions;

    if (wc.managementScore !== undefined && gs.managementScore < wc.managementScore) return false;
    if (wc.money !== undefined && gs.money < wc.money) return false;
    if (wc.sustainability !== undefined && gs.sustainability < wc.sustainability) return false;
    if (wc.health !== undefined && gs.health < wc.health) return false;
    if (wc.wellbeing !== undefined && gs.wellbeing < wc.wellbeing) return false;
    if (wc.education !== undefined && gs.education < wc.education) return false;

    // Check recycling center count
    if (wc.recyclingCenters !== undefined) {
      const count = this.countBuildingType('recycling-center');
      if (count < wc.recyclingCenters) return false;
    }

    return true;
  }

  /**
   * Check if lose conditions are met
   */
  checkLoseCondition(gs, scenario) {
    const lc = scenario.loseConditions;

    // Health check
    if (lc.health !== undefined && gs.health < lc.health) return true;

    // Wellbeing check
    if (lc.wellbeing !== undefined && gs.wellbeing < lc.wellbeing) return true;

    // Money check (bankruptcy)
    if (lc.money !== undefined && gs.money <= lc.money) return true;

    // Combined health AND wellbeing check
    if (lc.healthAndWellbeing) {
      if (gs.health < lc.healthAndWellbeing.health && gs.wellbeing < lc.healthAndWellbeing.wellbeing) {
        return true;
      }
    }

    return false;
  }

  /**
   * Count buildings of a specific type
   */
  countBuildingType(type) {
    if (!window.game || !window.game.city) return 0;
    let count = 0;
    const city = window.game.city;
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile && tile.building && tile.building.type === type) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Show win screen
   */
  showWinScreen(scenario) {
    const modal = document.getElementById('scenario-result-modal');
    if (!modal) return;

    const gs = window.gameState;

    modal.innerHTML = `
      <div class="level-up-modal" style="border: 2px solid ${scenario.color};">
        <div class="level-up-modal-header" style="background: linear-gradient(135deg, ${scenario.gradientFrom} 0%, ${scenario.gradientTo} 100%);">
          <h2>🏆 Victory!</h2>
          <button class="level-up-modal-close" onclick="window.scenarioSystem.closeResultModal()">×</button>
        </div>
        <div class="level-up-modal-content">
          <div class="level-up-title">${scenario.icon} ${scenario.title} — Completed!</div>
          <div class="level-up-description">
            Congratulations! You have successfully completed the ${scenario.title} scenario.
          </div>
          
          <div class="level-up-section">
            <h3>Final Stats</h3>
            <ul class="level-up-features">
              <li>💰 Money: ${(gs.money || 0).toLocaleString()}</li>
              <li>⭐ Management Score: ${Math.round(gs.managementScore || 0)}</li>
              <li>🟢 Wellbeing: ${Math.round(gs.wellbeing || 0)}</li>
              <li>🎓 Education: ${Math.round(gs.education || 0)}</li>
              <li>🏥 Health: ${Math.round(gs.health || 0)}</li>
              <li>♻️ Sustainability: ${Math.round(gs.sustainability || 0)}</li>
            </ul>
          </div>
        </div>
        <div class="level-up-modal-footer" style="gap: 12px;">
          <button class="level-up-modal-button" onclick="window.scenarioSystem.closeResultAndContinue()">
            Continue Playing
          </button>
          <button class="level-up-modal-button" style="background: linear-gradient(135deg, #2196F3 0%, #1565C0 100%);" onclick="window.scenarioSystem.returnToScenarioSelect()">
            New Scenario
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Show lose screen
   */
  showLoseScreen(scenario) {
    const modal = document.getElementById('scenario-result-modal');
    if (!modal) return;

    const gs = window.gameState;

    modal.innerHTML = `
      <div class="level-up-modal" style="border: 2px solid #f44336;">
        <div class="level-up-modal-header" style="background: linear-gradient(135deg, #B71C1C 0%, #f44336 100%);">
          <h2>💀 Defeat</h2>
          <button class="level-up-modal-close" onclick="window.scenarioSystem.closeResultModal()">×</button>
        </div>
        <div class="level-up-modal-content">
          <div class="level-up-title">${scenario.icon} ${scenario.title} — Failed</div>
          <div class="level-up-description">
            The city has collapsed. ${scenario.loseConditions.label}.
          </div>
          
          <div class="level-up-section">
            <h3>Final Stats</h3>
            <ul class="level-up-features">
              <li>💰 Money: ${(gs.money || 0).toLocaleString()}</li>
              <li>⭐ Management Score: ${Math.round(gs.managementScore || 0)}</li>
              <li>🟢 Wellbeing: ${Math.round(gs.wellbeing || 0)}</li>
              <li>🎓 Education: ${Math.round(gs.education || 0)}</li>
              <li>🏥 Health: ${Math.round(gs.health || 0)}</li>
              <li>♻️ Sustainability: ${Math.round(gs.sustainability || 0)}</li>
            </ul>
          </div>
        </div>
        <div class="level-up-modal-footer" style="gap: 12px;">
          <button class="level-up-modal-button" style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);" onclick="window.scenarioSystem.retryScenario()">
            Retry
          </button>
          <button class="level-up-modal-button" style="background: linear-gradient(135deg, #2196F3 0%, #1565C0 100%);" onclick="window.scenarioSystem.returnToScenarioSelect()">
            New Scenario
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close result modal
   */
  closeResultModal() {
    const modal = document.getElementById('scenario-result-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /**
   * Close result and continue free play
   */
  closeResultAndContinue() {
    this.closeResultModal();
    if (window.gameState) {
      window.gameState.scenarioActive = false;
    }
  }

  /**
   * Retry the same scenario
   */
  retryScenario() {
    this.closeResultModal();
    if (this.activeScenario) {
      this.selectScenario(this.activeScenario.id);
    }
  }

  /**
   * Return to scenario selection
   */
  returnToScenarioSelect() {
    this.closeResultModal();
    this.activeScenario = null;
    this.scenarioStarted = false;
    if (window.gameState) {
      window.gameState.scenarioActive = false;
      window.gameState.scenarioId = null;
    }
    this.showScenarioSelection();
  }

  /**
   * Get current scenario progress (for UI display)
   * @returns {Object|null}
   */
  getProgress() {
    if (!this.activeScenario || !this.scenarioStarted) return null;
    if (!window.gameState) return null;

    const gs = window.gameState;
    const wc = this.activeScenario.winConditions;
    const items = [];

    if (wc.managementScore !== undefined) {
      items.push({
        label: 'Management',
        current: Math.round(gs.managementScore || 0),
        target: wc.managementScore,
        met: (gs.managementScore || 0) >= wc.managementScore
      });
    }
    if (wc.money !== undefined) {
      items.push({
        label: 'Money',
        current: gs.money || 0,
        target: wc.money,
        met: (gs.money || 0) >= wc.money,
        format: 'currency'
      });
    }
    if (wc.sustainability !== undefined) {
      items.push({
        label: 'Sustainability',
        current: Math.round(gs.sustainability || 0),
        target: wc.sustainability,
        met: (gs.sustainability || 0) >= wc.sustainability
      });
    }
    if (wc.health !== undefined) {
      items.push({
        label: 'Health',
        current: Math.round(gs.health || 0),
        target: wc.health,
        met: (gs.health || 0) >= wc.health
      });
    }
    if (wc.wellbeing !== undefined) {
      items.push({
        label: 'Wellbeing',
        current: Math.round(gs.wellbeing || 0),
        target: wc.wellbeing,
        met: (gs.wellbeing || 0) >= wc.wellbeing
      });
    }
    if (wc.education !== undefined) {
      items.push({
        label: 'Education',
        current: Math.round(gs.education || 0),
        target: wc.education,
        met: (gs.education || 0) >= wc.education
      });
    }
    if (wc.recyclingCenters !== undefined) {
      const current = this.countBuildingType('recycling-center');
      items.push({
        label: 'Recycling Centers',
        current: current,
        target: wc.recyclingCenters,
        met: current >= wc.recyclingCenters
      });
    }

    return {
      scenario: this.activeScenario,
      items: items,
      allMet: items.every(i => i.met)
    };
  }

  /**
   * Reset the system
   */
  reset() {
    this.activeScenario = null;
    this.scenarioStarted = false;
    this.winChecked = false;
    this.loseChecked = false;
    this.checkCooldown = 0;
  }
}

// Global instance
window.scenarioSystem = new ScenarioSystem();
