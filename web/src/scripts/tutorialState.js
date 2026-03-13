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
            'Limit Aşıldı',
            'Tutorial sırasında sadece 1 adet konut inşa edebilirsin.',
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

    // If tutorial is complete, deactivate
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
      title: 'Karşılama',
      content: `Merhaba!
CircularWorld'e hoş geldin.

Bu şehir senin sorumluluğunda.
Kaynakları yönetecek, enerji üretecek ve sürdürülebilir bir gelecek kuracaksın.

Başlayalım mı?`,
      allowedActions: [],
      onInit: () => {
        // No restrictions, just show message
      }
    },
    {
      id: 1,
      title: 'Enerjiye İhtiyaç',
      content: `Şehrin enerjiye ihtiyacı var

Binalar enerji olmadan çalışamaz.
İlk işimiz temiz bir enerji kaynağı kurmak.

Toolbar'dan Güneş Paneli'ni seç
ve haritada uygun bir yere 1 adet yerleştir.`,
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
      title: 'Yol Bağlantısı',
      content: `Enerji için yol gerekir

Hadi enerji panelinden oyuncu evine kadar bir yol çiz.`,
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
      title: 'Enerji İkonu Açıklaması',
      content: `Bu enerji ikonu ne?

Bir binanın üzerinde yıldırım simgesi görüyorsan
bu, binanın yeterli enerjiye sahip olmadığını gösterir.

Enerji yoksa:
• Binalar çalışmaz
• Üretim durur
• Şehir gelişemez

Şu an enerjimiz hâlâ yetersiz.
Bunu düzeltelim.`,
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
      title: 'Güneş Paneli Yükseltme',
      content: `Enerji üretimini artır

Az önce kurduğun güneş panelini seç
ve Seviye 3 olana kadar yükselt.`,
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
      title: 'Oyuncu Evi (HQ) Tanıtımı',
      content: `Bu senin Oyuncu Evin (HQ)

Burası şehrinin yönetim merkezi.

Buradan:
• Şehir ayarlarını
• Enerji politikalarını
• Ekonomi ve çevre dengesini
yöneteceksin.

Seviye atladıkça
burada yeni ayarlar ve özellikler açılacak.`,
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
      title: 'Konut İnşası',
      content: `İnsanlar olmadan şehir olmaz

Şehrine yaşayanlar eklemeliyiz.
Bunun için bir Konut Binası inşa et.`,
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
      title: 'Fabrika Kurulumu',
      content: `Üretim zamanı

Şehrini büyütmek için:
• Üretime
• İş imkanlarına
ihtiyacın var.

Şimdi bir Tekstil Fabrikası kur.`,
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
      title: 'Fabrika Açıklaması',
      content: `Fabrikalar ne yapar?

Fabrikalar:
• Ham maddeleri işler
• Ürün üretir
• Atık oluşturur

Daha fazla fabrika =
daha fazla üretim ama daha fazla yönetim demek.

Üretim yaptıkça:
• XP kazanırsın
• Para kazanırsın
• Şehrin büyür`,
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
      title: 'Tutorial Bitiş',
      content: `Hazırsın!

Artık:
• Enerji üretebiliyor
• İnsan barındırıyor
• Üretim yapabiliyorsun

Şehri büyütmek artık senin elinde.`,
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

