import * as THREE from 'three';
import { AssetManager } from './assets/assetManager.js';
import { CameraManager } from './camera.js';
import { InputManager } from './input.js';
import { City } from './sim/city.js';
import { SimObject } from './sim/simObject.js';
import { GameState } from './gameState.js';
import { ResourceManager } from './resources.js';
import { VisualEffectsManager } from './visualEffects.js';

/** 
 * Manager for the Three.js scene. Handles rendering of a `City` object
 */
export class Game {
  /**
   * @type {City}
   */
  city;
  /**
   * Object that currently hs focus
   * @type {SimObject | null}
   */
  focusedObject = null;
  /**
   * Class for managing user input
   * @type {InputManager}
   */
  inputManager;
  /**
   * Object that is currently selected
   * @type {SimObject | null}
   */
  selectedObject = null;
  
  /**
   * Current simulation tick counter
   * @type {number}
   */
  currentTick = 0;

  constructor(city) {
    this.city = city;

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    this.scene = new THREE.Scene();

    this.inputManager = new InputManager(window.ui.gameWindow);
    this.cameraManager = new CameraManager(window.ui.gameWindow);

    // Configure the renderer
    this.renderer.setSize(window.ui.gameWindow.clientWidth, window.ui.gameWindow.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Add the renderer to the DOM
    window.ui.gameWindow.appendChild(this.renderer.domElement);

    // Variables for object selection
    this.raycaster = new THREE.Raycaster();

    /**
     * Global instance of the asset manager
     */
    window.assetManager = new AssetManager(() => {
      // Initialize visual effects manager after scene is ready
      if (!window.visualEffects) {
        window.visualEffects = new VisualEffectsManager(this.scene);
      }
      
      window.ui.hideLoadingText();

      // Initialize game state and resources (already initialized as globals)
      // But ensure they're reset for new game
      if (window.gameState) {
        window.gameState.reset();
      }
      if (window.resourceManager) {
        window.resourceManager.reset();
      }
      if (window.cityPolicies) {
        window.cityPolicies.reset();
      }

      this.city = new City(16);
      this.initialize(this.city);
      
      // Place player house automatically at the center of the city
      const centerX = Math.floor(this.city.size / 2);
      const centerY = Math.floor(this.city.size / 2);
      this.city.placeBuilding(centerX, centerY, 'residential');
      
      // Mark it as player house
      const playerHouseTile = this.city.getTile(centerX, centerY);
      if (playerHouseTile && playerHouseTile.building) {
        playerHouseTile.building.name = "Oyuncu Evi";
        playerHouseTile.building.isPlayerHouse = true;
      }
      
      this.start();

      // Update UI with initial game state
      window.ui.updateGameState(window.gameState);
      window.ui.updateResources(window.resourceManager);
      
      // Update resources periodically
      setInterval(() => {
        if (window.resourceManager) {
          window.ui.updateResources(window.resourceManager);
        }
      }, 2000); // Update every 2 seconds

      // Simulation runs every 2.5 seconds (slower pace)
      setInterval(this.simulate.bind(this), 2500);
    });

    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  /**
   * Initalizes the scene, clearing all existing assets
   */
  initialize(city) {
    this.scene.clear();
    this.scene.add(city);
    this.#setupLights();
    this.#setupGrid(city);
  }

  #setupGrid(city) {
    // Add the grid
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      map: window.assetManager.textures['grid'],
      transparent: true,
      opacity: 0.2
    });
    gridMaterial.map.repeat = new THREE.Vector2(city.size, city.size);
    gridMaterial.map.wrapS = city.size;
    gridMaterial.map.wrapT = city.size;

    const grid = new THREE.Mesh(
      new THREE.BoxGeometry(city.size, 0.1, city.size),
      gridMaterial
    );
    grid.position.set(city.size / 2 - 0.5, -0.04, city.size / 2 - 0.5);
    this.scene.add(grid);
  }

  /**
   * Setup the lights for the scene
   */
  #setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 2)
    sun.position.set(-10, 20, 0);
    sun.castShadow = true;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 50;
    sun.shadow.normalBias = 0.01;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }
  
  /**
   * Starts the renderer
   */
  start() {
    this.renderer.setAnimationLoop(this.draw.bind(this));
  }

  /**
   * Stops the renderer
   */
  stop() {
    this.renderer.setAnimationLoop(null);
  }

  /**
   * Render the contents of the scene
   */
  draw() {
    this.city.draw();
    this.updateFocusedObject();

    if (this.inputManager.isLeftMouseDown) {
      this.useTool();
    }
    
    // Update visual effects
    if (window.visualEffects) {
      window.visualEffects.update();
    }

    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  /**
   * Moves the simulation forward by one step
   */
  simulate() {
    if (window.ui.isPaused) return;

    // Increment tick counter
    this.currentTick++;
    
    // Update market prices
    if (window.market) {
      window.market.updatePrices(this.currentTick);
    }
    
    // Update global pollution
    if (window.globalPollution) {
      window.globalPollution.decay();
      window.globalPollution.applyPenalties(this.currentTick);
    }
    
    // Update the city data model first, then update the scene
    this.city.simulate(1, this.currentTick);
    
    // Auto-sell products and auto-buy materials (if unlocked)
    if (window.market && window.resourceManager && window.gameState) {
      // Auto-sell products (always enabled from Level 1)
      if (window.market.autoSellEnabled) {
        const earned = window.market.autoSellProducts(window.resourceManager, window.gameState);
        // Silent auto-sell, no notification spam
      }
      
      // Auto-buy materials (Level 3+)
      if (window.gameState.level >= 3 && window.levelUnlocks && 
          window.levelUnlocks.isUnlocked('auto-buy', window.gameState.level)) {
        window.market.autoBuyMaterials(window.resourceManager, window.gameState);
      }
    }

    window.ui.updateTitleBar(this);
    window.ui.updateInfoPanel(this.selectedObject);
    
    // Check for waste alarms (every 5 ticks)
    if (this.currentTick % 5 === 0 && window.ui) {
      window.ui.checkWasteAlarms();
    }
  }

  /**
   * Uses the currently active tool
   */
  useTool() {
    const activeToolId = window.ui?.activeToolId;
    
    // Don't proceed if no tool is selected
    if (!activeToolId) {
      return;
    }
    
    switch (activeToolId) {
      case 'select':
        this.updateSelectedObject();
        if (this.selectedObject) {
          console.log('Selected object:', this.selectedObject.name, this.selectedObject.type);
          if (this.selectedObject.isPlayerHouse) {
            console.log('Player house selected!');
          }
        }
        window.ui.updateInfoPanel(this.selectedObject);
        break;
      case 'bulldoze':
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.bulldoze(x, y);
        }
        break;
      default:
        if (this.focusedObject && activeToolId) {
          const { x, y } = this.focusedObject;
          this.city.placeBuilding(x, y, activeToolId);
        }
        break;
    }
  }
  
  /**
   * Sets the currently selected object and highlights it
   */
  updateSelectedObject() {
    this.selectedObject?.setSelected(false);
    this.selectedObject = this.focusedObject;
    this.selectedObject?.setSelected(true);
  }

  /**
   * Upgrade a factory or recycling center at the given coordinates
   * @param {number} x 
   * @param {number} y 
   */
  upgradeFactory(x, y) {
    const tile = this.city.getTile(x, y);
    if (tile && tile.building && tile.building.upgrade) {
      if (tile.building.upgrade()) {
        // Refresh view
        tile.building.refreshView();
        // Update UI
        if (this.selectedObject === tile.building) {
          window.ui.updateInfoPanel(this.selectedObject);
        }
        window.ui.updateGameState(window.gameState);
      } else {
        console.warn("Yükseltme başarısız!");
      }
    }
  }

  /**
   * Process recycling at recycling center
   * @param {number} x 
   * @param {number} y 
   */
  processRecycling(x, y) {
    const tile = this.city.getTile(x, y);
    if (tile && tile.building && tile.building.startRecycling) {
      if (tile.building.startRecycling()) {
        // Update UI
        if (this.selectedObject === tile.building) {
          window.ui.updateInfoPanel(this.selectedObject);
        }
        window.ui.updateGameState(window.gameState);
        window.ui.updateResources(window.resourceManager);
      } else {
        console.warn("Geri dönüşüm başarısız!");
      }
    }
  }

  /**
   * Sets the object that is currently highlighted
   */
  updateFocusedObject() {  
    this.focusedObject?.setFocused(false);
    const newObject = this.#raycast();
    if (newObject !== this.focusedObject) {
      this.focusedObject = newObject;
    }
    this.focusedObject?.setFocused(true);
  }

  /**
   * Gets the mesh currently under the the mouse cursor. If there is nothing under
   * the the mouse cursor, returns null
   * @param {MouseEvent} event Mouse event
   * @returns {THREE.Mesh | null}
   */
  #raycast() {
    var coords = {
      x: (this.inputManager.mouse.x / this.renderer.domElement.clientWidth) * 2 - 1,
      y: -(this.inputManager.mouse.y / this.renderer.domElement.clientHeight) * 2 + 1
    };

    this.raycaster.setFromCamera(coords, this.cameraManager.camera);

    let intersections = this.raycaster.intersectObjects(this.city.root.children, true);
    if (intersections.length > 0) {
      // The SimObject attached to the mesh is stored in the user data
      const selectedObject = intersections[0].object.userData;
      return selectedObject;
    } else {
      return null;
    }
  }

  /**
   * Resizes the renderer to fit the current game window
   */
  onResize() {
    this.cameraManager.resize(window.ui.gameWindow);
    this.renderer.setSize(window.ui.gameWindow.clientWidth, window.ui.gameWindow.clientHeight);
  }
}

// Create a new game when the window is loaded
window.onload = () => {
  window.game = new Game();
}