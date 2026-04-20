/**
 * Developer Console - God Mode Dev Panel
 * Activated via ?dev=true query param or npm run dev:test
 * 
 * Features:
 * - Instant level switching (1-6)
 * - Score sliders (wellbeing, education, health, sustainability)
 * - Resource manipulation (add/set any resource)
 * - Money & energy controls
 * - Unlock all buildings
 * - Skip tutorial
 * - Simulation speed control
 * - Pollution control
 * - Quick build (place buildings without cost)
 * - Map clear
 */

(function () {
  // Only activate if ?dev=true in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('dev')) return;

  console.log('%c🛠️ DEV CONSOLE ACTIVE', 'color: #00ff00; font-size: 20px; font-weight: bold;');

  // Wait for game systems to load
  const initInterval = setInterval(() => {
    if (window.gameState && window.ui) {
      clearInterval(initInterval);
      initDevConsole();
    }
  }, 500);

  function initDevConsole() {
    // ═══════════════════════════════════════════
    // Skip welcome screen automatically in dev mode
    // ═══════════════════════════════════════════
    const welcomeScreen = document.getElementById('welcome-screen');
    const rootWindow = document.getElementById('root-window');
    if (welcomeScreen && welcomeScreen.style.display !== 'none') {
      welcomeScreen.style.display = 'none';
      rootWindow.style.display = 'block';

      // Auto-delete save and start fresh
      if (window.saveSystem && window.saveSystem.hasSaveData()) {
        window.saveSystem.deleteSave();
      }

      // Import Game dynamically
      import('./game.js').then(module => {
        window.game = new module.Game(null, 'DEV-TEST');
        const cityNameEl = document.getElementById('city-name');
        if (cityNameEl) cityNameEl.innerHTML = '🛠️ DEV-TEST';

        // Wait for game to initialize, then create panel
        setTimeout(() => createDevPanel(), 2000);
      });
    } else {
      // Game already started, just inject panel
      setTimeout(() => createDevPanel(), 1000);
    }

    // ═══════════════════════════════════════════
    // GLOBAL DEV SHORTCUTS
    // ═══════════════════════════════════════════
    window.dev = {
      setLevel: (level) => {
        if (!window.gameState) return;
        const prev = window.gameState.level;
        window.gameState.level = Math.max(1, Math.min(6, level));
        if (window.market) window.market.initialize(window.gameState.level);
        if (window.ui && window.ui.onLevelUp) window.ui.onLevelUp(window.gameState.level, prev);
        window.gameState.updateUI();
        console.log(`Level: ${prev} → ${window.gameState.level}`);
      },
      setMoney: (amount) => {
        if (!window.gameState) return;
        window.gameState.money = amount;
        window.gameState.updateUI();
      },
      setEnergy: (amount) => {
        if (!window.gameState) return;
        window.gameState.energy = amount;
        window.gameState.updateUI();
      },
      setScore: (type, value) => {
        if (!window.gameState || !window.scoringSystem) return;
        value = Math.max(0, Math.min(100, value));
        window.scoringSystem[type] = value;
        window.scoringSystem[`target${type.charAt(0).toUpperCase() + type.slice(1)}`] = value;
        window.gameState[type] = Math.round(value);
        window.gameState.updateUI();
      },
      addResource: (type, amount) => {
        if (!window.resourceManager) return;
        window.resourceManager.addResource(type, amount);
      },
      setResource: (type, amount) => {
        if (!window.resourceManager) return;
        window.resourceManager.resources[type] = amount;
        window.resourceManager.updateUI();
      },
      unlockAll: () => {
        if (!window.gameState) return;
        window.gameState.level = 6;
        window.gameState.wellbeing = 80;
        window.gameState.health = 80;
        window.gameState.sustainability = 80;
        window.gameState.education = 80;
        if (window.scoringSystem) {
          window.scoringSystem.wellbeing = 80;
          window.scoringSystem.health = 80;
          window.scoringSystem.sustainability = 80;
          window.scoringSystem.education = 80;
          window.scoringSystem.targetWellbeing = 80;
          window.scoringSystem.targetHealth = 80;
          window.scoringSystem.targetSustainability = 80;
          window.scoringSystem.targetEducation = 80;
        }
        if (window.market) window.market.initialize(6);
        if (window.ui && window.ui.onLevelUp) window.ui.onLevelUp(6, 1);
        window.gameState.updateUI();
        console.log('All buildings unlocked! Level set to 6.');
      },
      skipTutorial: () => {
        if (window.tutorialState) {
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
        if (window.scenarioSystem) {
          window.scenarioSystem.showScenarioSelection();
        }
        console.log('Tutorial skipped! Scenario selection opening.');
      },
      setPollution: (value) => {
        if (!window.globalPollution) return;
        Object.keys(window.globalPollution.pollution).forEach(k => {
          window.globalPollution.pollution[k] = value;
        });
        window.globalPollution.updateTotalPollution();
      },
      freeBuild: true, // Toggle free building (no cost)
      godMode: true,
      clearMap: () => {
        if (!window.game || !window.game.city) return;
        const city = window.game.city;
        for (let x = 0; x < city.size; x++) {
          for (let y = 0; y < city.size; y++) {
            const tile = city.getTile(x, y);
            if (tile && tile.building && !tile.building.isPlayerHouse) {
              city.bulldoze(x, y);
            }
          }
        }
        console.log('Map cleared (player house kept)!');
      },
      fillResources: () => {
        if (!window.resourceManager) return;
        Object.keys(window.resourceManager.resources).forEach(key => {
          if (key.startsWith('raw-')) {
            window.resourceManager.resources[key] = 500;
          }
        });
        window.resourceManager.updateUI();
        console.log('All raw materials set to 500!');
      },
      listBuildings: () => {
        if (!window.game || !window.game.city) return;
        const city = window.game.city;
        const buildings = {};
        for (let x = 0; x < city.size; x++) {
          for (let y = 0; y < city.size; y++) {
            const tile = city.getTile(x, y);
            if (tile && tile.building) {
              const type = tile.building.type || 'unknown';
              buildings[type] = (buildings[type] || 0) + 1;
            }
          }
        }
        console.table(buildings);
        return buildings;
      },
      getState: () => {
        console.log('=== GAME STATE ===');
        console.log('Level:', window.gameState?.level);
        console.log('Money:', window.gameState?.money);
        console.log('Energy:', window.gameState?.energy);
        console.log('Population:', window.gameState?.population);
        console.log('Wellbeing:', window.gameState?.wellbeing);
        console.log('Education:', window.gameState?.education);
        console.log('Health:', window.gameState?.health);
        console.log('Sustainability:', window.gameState?.sustainability);
        console.log('Pollution:', window.globalPollution?.totalPollution);
      },
      exportScenarioData: () => {
        if (!window.game || !window.game.city) return;
        const city = window.game.city;
        const buildings = [];
        for (let x = 0; x < city.size; x++) {
          for (let y = 0; y < city.size; y++) {
            const tile = city.getTile(x, y);
            if (tile && tile.building) {
              const b = tile.building;
              let bData = {
                x: x,
                y: y,
                type: b.type
              };
              if (b.level && b.level > 1 && b.type !== 'road') {
                bData.level = b.level;
              }
              if (b.isPlayerHouse) {
                bData.isPlayerHouse = true;
                bData.developmentState = 'developed';
              } else if (b.development && b.development.state === 'developed') {
                bData.developmentState = 'developed';
              }
              buildings.push(bData);
            }
          }
        }
        const dataStr = JSON.stringify(buildings, null, 2);
        console.log("=== EXPORTED SCENARIO MAP DATA ===");
        console.log(dataStr);
        navigator.clipboard.writeText(dataStr);
        alert("Map data copied to clipboard! Share this with your AI.");
        return dataStr;
      }
    };

    // ═══════════════════════════════════════════
    // Patch building placement to be free in dev mode
    // ═══════════════════════════════════════════
    const origSpendMoney = window.gameState.spendMoney.bind(window.gameState);
    window.gameState.spendMoney = function (amount) {
      if (window.dev && window.dev.freeBuild) {
        return true; // Always succeed
      }
      return origSpendMoney(amount);
    };

    // Skip tutorial automatically
    if (window.tutorialState && window.tutorialState.isActive) {
      window.dev.skipTutorial();
    }
  }

  // ═══════════════════════════════════════════
  // CREATE THE DEV PANEL UI
  // ═══════════════════════════════════════════
  function createDevPanel() {
    const panel = document.createElement('div');
    panel.id = 'dev-panel';
    panel.innerHTML = `
      <style>
        #dev-panel {
          position: fixed;
          top: 10px;
          right: 10px;
          width: 320px;
          max-height: 90vh;
          overflow-y: auto;
          background: rgba(10, 10, 20, 0.95);
          border: 2px solid #00ff88;
          border-radius: 12px;
          color: #e0e0e0;
          font-family: 'Segoe UI', monospace;
          font-size: 12px;
          z-index: 99999;
          box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
          backdrop-filter: blur(10px);
        }
        #dev-panel::-webkit-scrollbar { width: 6px; }
        #dev-panel::-webkit-scrollbar-track { background: transparent; }
        #dev-panel::-webkit-scrollbar-thumb { background: #00ff88; border-radius: 3px; }
        
        .dev-header {
          background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
          color: #000;
          padding: 10px 14px;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 10px 10px 0 0;
          cursor: move;
        }
        .dev-header-btns { display: flex; gap: 6px; }
        .dev-header-btn {
          background: rgba(0,0,0,0.3);
          border: none;
          color: #000;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .dev-header-btn:hover { background: rgba(0,0,0,0.5); color: #fff; }
        
        .dev-body { padding: 10px; }
        .dev-body.collapsed { display: none; }
        
        .dev-section {
          margin-bottom: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .dev-section-title {
          background: rgba(255,255,255,0.08);
          padding: 8px 10px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .dev-section-title:hover { background: rgba(255,255,255,0.12); }
        .dev-section-content { padding: 8px 10px; }
        .dev-section-content.collapsed { display: none; }
        
        .dev-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .dev-label {
          min-width: 85px;
          font-size: 11px;
          color: #aaa;
        }
        .dev-input {
          flex: 1;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          width: 60px;
        }
        .dev-input:focus { border-color: #00ff88; outline: none; }
        
        .dev-slider {
          flex: 1;
          -webkit-appearance: none;
          height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
          outline: none;
        }
        .dev-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00ff88;
          cursor: pointer;
        }
        .dev-slider-val {
          min-width: 30px;
          text-align: right;
          font-weight: bold;
          color: #00ff88;
        }
        
        .dev-btn {
          background: linear-gradient(135deg, #333 0%, #222 100%);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
          flex: 1;
        }
        .dev-btn:hover { background: linear-gradient(135deg, #444 0%, #333 100%); border-color: #00ff88; }
        .dev-btn.active { background: #00ff88; color: #000; font-weight: bold; }
        .dev-btn.danger { border-color: #ff4444; }
        .dev-btn.danger:hover { background: #ff4444; color: #fff; }
        .dev-btn.success { border-color: #00ff88; }
        .dev-btn.success:hover { background: #00ff88; color: #000; }
        
        .dev-level-btns {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 4px;
        }
        .dev-level-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          padding: 8px 4px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          text-align: center;
          transition: all 0.2s;
        }
        .dev-level-btn:hover { background: rgba(0,255,136,0.2); border-color: #00ff88; }
        .dev-level-btn.active { background: #00ff88; color: #000; }
        
        .dev-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .dev-toggle input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #00ff88;
        }
        
        .dev-quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }
      </style>
      
      <div class="dev-header">
        <span>🛠️ DEV CONSOLE</span>
        <div class="dev-header-btns">
          <button class="dev-header-btn" onclick="devPanel.minimize()" title="Minimize">_</button>
          <button class="dev-header-btn" onclick="devPanel.close()" title="Close">×</button>
        </div>
      </div>
      
      <div class="dev-body" id="dev-body">
        <!-- LEVEL -->
        <div class="dev-section">
          <div class="dev-section-title" onclick="devPanel.toggleSection(this)">
            🎮 Level & Progress <span>▼</span>
          </div>
          <div class="dev-section-content">
            <div style="margin-bottom: 6px; font-size: 11px; color: #888;">Select level (scores set automatically):</div>
            <div class="dev-level-btns" id="dev-level-btns">
              <div class="dev-level-btn" onclick="devPanel.setLevel(1)">1</div>
              <div class="dev-level-btn" onclick="devPanel.setLevel(2)">2</div>
              <div class="dev-level-btn" onclick="devPanel.setLevel(3)">3</div>
              <div class="dev-level-btn" onclick="devPanel.setLevel(4)">4</div>
              <div class="dev-level-btn" onclick="devPanel.setLevel(5)">5</div>
              <div class="dev-level-btn" onclick="devPanel.setLevel(6)">6</div>
            </div>
          </div>
        </div>
        
        <!-- SCORES -->
        <div class="dev-section">
          <div class="dev-section-title" onclick="devPanel.toggleSection(this)">
            📊 Scores <span>▼</span>
          </div>
          <div class="dev-section-content">
            <div class="dev-row">
              <span class="dev-label">💚 Wellbeing</span>
              <input type="range" class="dev-slider" min="0" max="100" value="50" 
                oninput="devPanel.setScore('wellbeing', this.value)" id="dev-slider-wellbeing">
              <span class="dev-slider-val" id="dev-val-wellbeing">50</span>
            </div>
            <div class="dev-row">
              <span class="dev-label">🎓 Education</span>
              <input type="range" class="dev-slider" min="0" max="100" value="30" 
                oninput="devPanel.setScore('education', this.value)" id="dev-slider-education">
              <span class="dev-slider-val" id="dev-val-education">30</span>
            </div>
            <div class="dev-row">
              <span class="dev-label">🏥 Health</span>
              <input type="range" class="dev-slider" min="0" max="100" value="70" 
                oninput="devPanel.setScore('health', this.value)" id="dev-slider-health">
              <span class="dev-slider-val" id="dev-val-health">70</span>
            </div>
            <div class="dev-row">
              <span class="dev-label">♻️ Sust.</span>
              <input type="range" class="dev-slider" min="0" max="100" value="0" 
                oninput="devPanel.setScore('sustainability', this.value)" id="dev-slider-sustainability">
              <span class="dev-slider-val" id="dev-val-sustainability">0</span>
            </div>
            <div class="dev-row">
              <span class="dev-label">☁️ Pollution</span>
              <input type="range" class="dev-slider" min="0" max="100" value="0" 
                oninput="devPanel.setPollution(this.value)" id="dev-slider-pollution">
              <span class="dev-slider-val" id="dev-val-pollution">0</span>
            </div>
          </div>
        </div>
        
        <!-- ECONOMY -->
        <div class="dev-section">
          <div class="dev-section-title" onclick="devPanel.toggleSection(this)">
            💰 Economy & Resources <span>▼</span>
          </div>
          <div class="dev-section-content">
            <div class="dev-row">
              <span class="dev-label">💰 Money</span>
              <input type="number" class="dev-input" value="500000" id="dev-money" 
                onchange="devPanel.setMoney(this.value)">
              <button class="dev-btn" onclick="devPanel.setMoney(9999999)" style="flex:0">MAX</button>
            </div>
            <div class="dev-row">
              <span class="dev-label">⚡ Energy</span>
              <input type="number" class="dev-input" value="0" id="dev-energy" 
                onchange="devPanel.setEnergy(this.value)">
              <button class="dev-btn" onclick="devPanel.setEnergy(9999)" style="flex:0">MAX</button>
            </div>
            <div style="margin-top: 6px">
              <div class="dev-quick-grid">
                <button class="dev-btn success" onclick="dev.fillResources()">📦 Fill Resources</button>
                <button class="dev-btn" onclick="devPanel.addAllWaste()">🗑️ Add Waste (+50)</button>
                <button class="dev-btn" onclick="devPanel.clearWaste()">✨ Clear Waste</button>
                <button class="dev-btn" onclick="devPanel.addRecycled()">♻️ Recycled +50</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- TOGGLES -->
        <div class="dev-section">
          <div class="dev-section-title" onclick="devPanel.toggleSection(this)">
            ⚙️ Settings <span>▼</span>
          </div>
          <div class="dev-section-content">
            <div class="dev-toggle">
              <input type="checkbox" id="dev-freebuild" checked onchange="dev.freeBuild = this.checked">
              <label for="dev-freebuild">🆓 Free Construction</label>
            </div>
            <div class="dev-toggle">
              <input type="checkbox" id="dev-freeze-scores" onchange="devPanel.freezeScores = this.checked">
              <label for="dev-freeze-scores">🧊 Freeze Scores</label>
            </div>
            <div class="dev-row">
              <span class="dev-label">⏱️ Sim Speed</span>
              <select class="dev-input" onchange="devPanel.setSimSpeed(this.value)" style="width: auto; flex: 1;">
                <option value="5000">0.5x Slow</option>
                <option value="2500" selected>1x Normal</option>
                <option value="1000">2.5x Fast</option>
                <option value="500">5x Very Fast</option>
                <option value="200">12x Turbo</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- QUICK ACTIONS -->
        <div class="dev-section">
          <div class="dev-section-title" onclick="devPanel.toggleSection(this)">
            ⚡ Quick Actions <span>▼</span>
          </div>
          <div class="dev-section-content">
            <div class="dev-quick-grid">
              <button class="dev-btn success" onclick="dev.unlockAll()">🔓 Unlock All</button>
              <button class="dev-btn" onclick="dev.skipTutorial()">⏭️ Skip Tutorial</button>
              <button class="dev-btn danger" onclick="dev.clearMap()">💥 Clear Map</button>
              <button class="dev-btn" onclick="dev.getState()">📋 Log State</button>
              <button class="dev-btn" onclick="dev.listBuildings()">🏗️ List Buildings</button>
              <button class="dev-btn" onclick="devPanel.refreshUI()">🔄 Refresh UI</button>
            </div>
          </div>
        </div>

        <!-- QUICK BUILD -->
        <div class="dev-section">
          <div class="dev-section-title" onclick="devPanel.toggleSection(this)">
            🏗️ Quick Build <span>▸</span>
          </div>
          <div class="dev-section-content collapsed">
            <div style="margin-bottom:6px; font-size:11px; color:#888;">Click → place anywhere on the map</div>
            <div class="dev-quick-grid">
              <button class="dev-btn" onclick="devPanel.selectTool('residential')">🏠 Residential</button>
              <button class="dev-btn" onclick="devPanel.selectTool('commercial')">🏪 Commercial</button>
              <button class="dev-btn" onclick="devPanel.selectTool('textile-factory')">🧵 Textile F.</button>
              <button class="dev-btn" onclick="devPanel.selectTool('technology-factory')">💻 Tech F.</button>
              <button class="dev-btn" onclick="devPanel.selectTool('steel-factory')">🔩 Steel F.</button>
              <button class="dev-btn" onclick="devPanel.selectTool('automotive-factory')">🚗 Auto F.</button>
              <button class="dev-btn" onclick="devPanel.selectTool('recycling-center')">♻️ Recycling</button>
              <button class="dev-btn" onclick="devPanel.selectTool('solar-panel')">☀️ Solar</button>
              <button class="dev-btn" onclick="devPanel.selectTool('wind-turbine')">🌬️ Wind</button>
              <button class="dev-btn" onclick="devPanel.selectTool('hydro-plant')">💧 Hydro</button>
              <button class="dev-btn" onclick="devPanel.selectTool('waste-to-energy')">⚡ Waste→Energy</button>
              <button class="dev-btn" onclick="devPanel.selectTool('farming')">🌾 Farming</button>
              <button class="dev-btn" onclick="devPanel.selectTool('road')">🛣️ Road</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // ═══════════════════════════════════════════
    // PANEL CONTROLLER
    // ═══════════════════════════════════════════
    window.devPanel = {
      freezeScores: false,
      simInterval: null,

      minimize() {
        const body = document.getElementById('dev-body');
        body.classList.toggle('collapsed');
      },

      close() {
        document.getElementById('dev-panel').style.display = 'none';
      },

      toggleSection(titleEl) {
        const content = titleEl.nextElementSibling;
        content.classList.toggle('collapsed');
        const arrow = titleEl.querySelector('span');
        arrow.textContent = content.classList.contains('collapsed') ? '▸' : '▼';
      },

      setLevel(lvl) {
        dev.setLevel(lvl);
        // Update level buttons
        document.querySelectorAll('.dev-level-btn').forEach((btn, i) => {
          btn.classList.toggle('active', i + 1 === lvl);
        });
        // Also set scores to meet level requirements
        const presets = {
          1: { wellbeing: 50, education: 30, health: 70, sustainability: 0 },
          2: { wellbeing: 56, education: 35, health: 70, sustainability: 10 },
          3: { wellbeing: 60, education: 40, health: 70, sustainability: 42 },
          4: { wellbeing: 65, education: 50, health: 65, sustainability: 52 },
          5: { wellbeing: 70, education: 60, health: 70, sustainability: 72 },
          6: { wellbeing: 80, education: 70, health: 75, sustainability: 80 },
        };
        const preset = presets[lvl];
        if (preset) {
          Object.entries(preset).forEach(([key, val]) => {
            this.setScore(key, val);
            const slider = document.getElementById(`dev-slider-${key}`);
            if (slider) slider.value = val;
          });
        }
      },

      setScore(type, value) {
        value = parseInt(value);
        dev.setScore(type, value);
        const valEl = document.getElementById(`dev-val-${type}`);
        if (valEl) valEl.textContent = value;
      },

      setPollution(value) {
        value = parseInt(value);
        dev.setPollution(value);
        const valEl = document.getElementById('dev-val-pollution');
        if (valEl) valEl.textContent = value;
      },

      setMoney(value) {
        dev.setMoney(parseInt(value));
        document.getElementById('dev-money').value = parseInt(value);
      },

      setEnergy(value) {
        dev.setEnergy(parseInt(value));
        document.getElementById('dev-energy').value = parseInt(value);
      },

      addAllWaste() {
        if (!window.resourceManager) return;
        ['textile-waste', 'e-waste', 'scrap-metal', 'plastic-waste', 'organic-waste'].forEach(w => {
          window.resourceManager.addResource(w, 50);
        });
      },

      clearWaste() {
        if (!window.resourceManager) return;
        ['textile-waste', 'e-waste', 'scrap-metal', 'plastic-waste', 'organic-waste'].forEach(w => {
          window.resourceManager.resources[w] = 0;
        });
        window.resourceManager.updateUI();
        if (window.globalPollution) {
          window.globalPollution.reset();
        }
      },

      addRecycled() {
        if (!window.resourceManager) return;
        ['recycled-fabric', 'recycled-metal', 'recycled-plastic', 'recycled-electronics'].forEach(r => {
          window.resourceManager.addResource(r, 50);
        });
      },

      setSimSpeed(ms) {
        // Clear existing intervals and set new ones
        // We need to find and replace the simulate interval
        // Since we can't easily access the interval ID, we'll hijack the simulate
        if (window.game) {
          // Store original sim function
          if (!window.game._devOrigSimBound) {
            window.game._devOrigSimBound = window.game.simulate.bind(window.game);
          }
          // Clear any dev interval
          if (this.simInterval) clearInterval(this.simInterval);
          // Set new interval
          this.simInterval = setInterval(window.game._devOrigSimBound, parseInt(ms));
          console.log(`Sim speed: ${ms}ms per tick`);
        }
      },

      selectTool(type) {
        if (window.ui) {
          window.ui.activeToolId = type;
          // Update toolbar UI
          document.querySelectorAll('.ui-button').forEach(b => b.classList.remove('selected'));
        }
      },

      refreshUI() {
        if (window.gameState) window.gameState.updateUI();
        if (window.resourceManager) window.resourceManager.updateUI();
        if (window.ui && window.game) {
          window.ui.updateTitleBar(window.game);
          window.ui.updateInfoPanel(window.game.selectedObject);
        }
      },

      // Update dev panel values from game state
      syncFromGame() {
        if (!window.gameState) return;
        
        ['wellbeing', 'education', 'health', 'sustainability'].forEach(key => {
          const val = Math.round(window.gameState[key]);
          const slider = document.getElementById(`dev-slider-${key}`);
          const valEl = document.getElementById(`dev-val-${key}`);
          if (slider && !slider.matches(':active')) slider.value = val;
          if (valEl) valEl.textContent = val;
        });

        const moneyEl = document.getElementById('dev-money');
        if (moneyEl && document.activeElement !== moneyEl) moneyEl.value = Math.round(window.gameState.money);
        
        const energyEl = document.getElementById('dev-energy');
        if (energyEl && document.activeElement !== energyEl) energyEl.value = Math.round(window.gameState.energy);

        const pollutionEl = document.getElementById('dev-slider-pollution');
        const pollutionValEl = document.getElementById('dev-val-pollution');
        if (pollutionEl && window.globalPollution && !pollutionEl.matches(':active')) {
          pollutionEl.value = Math.round(window.globalPollution.totalPollution);
        }
        if (pollutionValEl && window.globalPollution) {
          pollutionValEl.textContent = Math.round(window.globalPollution.totalPollution);
        }

        // Highlight current level
        document.querySelectorAll('.dev-level-btn').forEach((btn, i) => {
          btn.classList.toggle('active', i + 1 === window.gameState.level);
        });
      }
    };

    // Sync panel with game state every second
    setInterval(() => {
      if (!devPanel.freezeScores) {
        devPanel.syncFromGame();
      }
    }, 1000);

    // Override scoring to freeze if needed
    if (window.scoringSystem) {
      const origCalculate = window.scoringSystem.calculate.bind(window.scoringSystem);
      window.scoringSystem.calculate = function () {
        if (window.devPanel && window.devPanel.freezeScores) {
          // Return current values without recalculating
          return {
            wellbeing: this.wellbeing,
            education: this.education,
            health: this.health,
            sustainability: this.sustainability,
            managementScore: this.managementScore
          };
        }
        return origCalculate();
      };
    }

    // Make panel draggable
    makeDraggable(panel);

    console.log('%c🛠️ Dev Panel loaded! Use window.dev for console commands.', 'color: #00ff88;');
    console.log('  dev.setLevel(n)    - Set level 1-6');
    console.log('  dev.setMoney(n)    - Set money');
    console.log('  dev.unlockAll()    - Unlock everything');
    console.log('  dev.fillResources()- Fill raw materials');
    console.log('  dev.clearMap()     - Clear all buildings');
    console.log('  dev.getState()     - Log current state');
  }

  function makeDraggable(el) {
    const header = el.querySelector('.dev-header');
    let isDragging = false, offsetX, offsetY;
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.dev-header-btn')) return;
      isDragging = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      el.style.transition = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      el.style.left = (e.clientX - offsetX) + 'px';
      el.style.top = (e.clientY - offsetY) + 'px';
      el.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => {
      isDragging = false;
      el.style.transition = '';
    });
  }
})();
