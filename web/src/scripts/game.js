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

  constructor(city, cityName = 'My City') {
    this.cityName = cityName;
    if (city) {
      this.city = city;
    }

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

      // Check if there's a saved game
      let saveData = null;
      if (window.saveSystem && window.saveSystem.hasSaveData()) {
        // Load saved game data
        saveData = window.saveSystem.loadGame();
      }

      // Initialize game state and resources
      if (!saveData) {
        // New game - reset everything
        if (window.gameState) {
          window.gameState.reset();
        }
        if (window.resourceManager) {
          window.resourceManager.reset();
        }
        if (window.cityPolicies) {
          window.cityPolicies.reset();
        }
      }
      // If saveData exists, gameState and resources are already loaded by loadGame()

      // Initialize market with current level
      if (window.market && window.gameState) {
        window.market.initialize(window.gameState.level);
      }

      // Create city if not already created
      if (!this.city) {
        const cityName = saveData && saveData.city ? saveData.city.name : (this.cityName || 'My City');
        this.city = new City(16, cityName);
        this.cityName = cityName;
      }
      this.initialize(this.city);
      
      // Reconstruct city from save data if available
      if (saveData && window.saveSystem) {
        window.saveSystem.reconstructCity(saveData, this.city);
        // Update city name in title bar from save
        if (saveData.city && saveData.city.name) {
          this.cityName = saveData.city.name;
          const cityNameElement = document.getElementById('city-name');
          if (cityNameElement) {
            cityNameElement.innerHTML = saveData.city.name;
          }
        }
        
        // Ensure tutorial state is correct after reconstruction
        // (loadGame already handles this, but UI might not be ready then)
        if (window.tutorialState && window.gameState) {
          const level = window.gameState.level || 1;
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
          }
        }
      } else {
        // New game - place player house automatically at the center
        // Skip tutorial check for initial player house placement
        const centerX = Math.floor(this.city.size / 2);
        const centerY = Math.floor(this.city.size / 2);
        this.city.placeBuilding(centerX, centerY, 'residential', true);
        
        // Mark it as player house
        const playerHouseTile = this.city.getTile(centerX, centerY);
        if (playerHouseTile && playerHouseTile.building) {
          playerHouseTile.building.name = "Oyuncu Evi";
          playerHouseTile.building.isPlayerHouse = true;
        }
      }

      // Initialize tutorial if Level 1 and not loading from save (after player house is placed)
      if (!saveData && window.tutorialState && window.gameState && window.gameState.level === 1) {
        window.tutorialState.initializeStep(0);
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
      
      // Auto-save mechanism
      if (window.cityPolicies && window.cityPolicies.autoSave) {
        const autoSaveInterval = (window.cityPolicies.autoSaveInterval || 30) * 1000; // Convert to milliseconds
        setInterval(() => {
          if (window.cityPolicies && window.cityPolicies.autoSave && window.saveSystem) {
            window.saveSystem.saveGame();
            console.log('Auto-save completed');
          }
        }, autoSaveInterval);
      }
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
    
    // Apply production mode effects to Circular Score (Level 6+)
    if (window.cityPolicies && window.gameState && window.levelUnlocks &&
        window.levelUnlocks.isUnlocked('hq-policy-panel', window.gameState.level)) {
      const modeEffects = window.cityPolicies.getProductionModeEffects();
      if (modeEffects.circularScore !== 0) {
        // Apply Circular Score change (positive or negative)
        const change = modeEffects.circularScore * 10; // Scale to meaningful values
        window.gameState.updateCircularScore(change);
      }
    }
    
    // Check tutorial step completion
    if (window.tutorialState && window.tutorialState.isActive) {
      window.tutorialState.checkStepCompletion();
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
      
      // Auto-buy materials (Level 2+)
      if (window.gameState.level >= 2 && window.levelUnlocks && 
          window.levelUnlocks.isUnlocked('auto-buy', window.gameState.level)) {
        window.market.autoBuyMaterials(window.resourceManager, window.gameState);
      }
    }

    // Calculate circular score every tick (comprehensive calculation)
    if (window.gameState && window.gameState.level >= 3) {
      window.gameState.calculateCircularScore();
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
      // Check tutorial restrictions
      if (window.tutorialState && window.tutorialState.isActive) {
        if (!window.tutorialState.isActionAllowed('upgrade')) {
          if (window.ui) {
            window.ui.showNotification(
              '🔒 Kilitli',
              'Bu aksiyon tutorial sırasında kilitli.',
              'warning'
            );
          }
          return;
        }
      }
      
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
    if (tile && tile.building) {
      // Check if it's a recycling center and has startRecycling method
      if (tile.building.startRecycling && typeof tile.building.startRecycling === 'function') {
        // Call startRecycling which handles energy check and calls processRecycling
        const success = tile.building.startRecycling();
        
        if (success) {
          // Update UI
          if (this.selectedObject === tile.building) {
            window.ui.updateInfoPanel(this.selectedObject);
          }
          window.ui.updateGameState(window.gameState);
          window.ui.updateResources(window.resourceManager);
        } else {
          console.warn("Geri dönüşüm başarısız! (Enerji yetersiz veya başka bir sorun)");
        }
      } else {
        console.warn("Geri dönüşüm metodu bulunamadı!");
      }
    } else {
      console.warn("Geri dönüşüm merkezi bulunamadı!");
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

// Welcome screen handler
function initWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const cityNameInput = document.getElementById('city-name-input');
  const okButton = document.getElementById('welcome-ok-button');
  const rootWindow = document.getElementById('root-window');

  function startGame() {
    const cityName = cityNameInput.value.trim() || 'My City';
    
    // Hide welcome screen
    welcomeScreen.style.display = 'none';
    
    // Show game window
    rootWindow.style.display = 'block';
    
    // Initialize game with city name
    window.game = new Game(null, cityName);
    
    // Update city name in title bar
    const cityNameElement = document.getElementById('city-name');
    if (cityNameElement) {
      cityNameElement.innerHTML = cityName;
    }
  }

  // Check for saved game after a short delay (to ensure saveSystem is loaded)
  setTimeout(() => {
    if (window.saveSystem && window.saveSystem.hasSaveData()) {
      // Add load game button
      const welcomeForm = document.querySelector('.welcome-form');
      if (welcomeForm && !document.getElementById('load-game-button')) {
        const loadButton = document.createElement('button');
        loadButton.id = 'load-game-button';
        loadButton.className = 'welcome-button';
        loadButton.textContent = '📂 Kayıtlı Oyunu Yükle';
        loadButton.style.marginTop = '12px';
        loadButton.style.background = 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)';
        loadButton.onclick = () => {
          if (confirm('Kayıtlı oyunu yüklemek istediğinize emin misiniz?')) {
            welcomeScreen.style.display = 'none';
            rootWindow.style.display = 'block';
            window.game = new Game(null, 'My City'); // City name will be loaded from save
          }
        };
        welcomeForm.appendChild(loadButton);
      }
    }
  }, 500);

  // OK button click handler
  okButton.addEventListener('click', () => {
    const cityName = cityNameInput.value.trim();
    if (cityName) {
      startGame();
    } else {
      // Show error or focus input
      cityNameInput.focus();
      cityNameInput.style.borderColor = '#f44336';
      setTimeout(() => {
        cityNameInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      }, 1000);
    }
  });

  // Enter key handler
  cityNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && cityNameInput.value.trim()) {
      startGame();
    }
  });

  // Focus input on load
  cityNameInput.focus();
}

// Create a new game when the window is loaded
window.onload = () => {
  // Initialize welcome screen first
  initWelcomeScreen();
}