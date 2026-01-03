/**
 * Level Unlock System - Controls what features are available at each level
 * Progressive disclosure: systems unlock gradually as player levels up
 */

export class LevelUnlocks {
  /**
   * Check if a feature is unlocked at current level
   * @param {string} feature - Feature name
   * @param {number} currentLevel - Current player level
   * @returns {boolean}
   */
  static isUnlocked(feature, currentLevel) {
    const unlockLevel = this.unlockLevels[feature];
    if (!unlockLevel) {
      // If not defined, assume unlocked (backward compatibility)
      return true;
    }
    return currentLevel >= unlockLevel;
  }

  /**
   * Get unlock level for a feature
   * @param {string} feature 
   * @returns {number}
   */
  static getUnlockLevel(feature) {
    return this.unlockLevels[feature] || 1;
  }

  /**
   * Unlock levels for all features
   * @type {Object}
   */
  static unlockLevels = {
    // Level 1 - Basic Survival
    'player-house': 1,
    'energy-pool': 1,
    'solar-panel': 1,
    'textile-factory': 1,
    'residential-level-1': 1,
    'money': 1,
    'tick-system': 1,
    'auto-sell': 1, // Auto-sell products (always enabled from Level 1)
    
    // Level 2 - Understanding Production
    'production-queue': 2,
    'residential-level-2': 2,
    'energy-consumption-display': 2,
    'inventory-panel': 2,
    'auto-buy': 2, // Auto-buy raw materials (moved from Level 3)
    
    // Level 3 - Waste Reality & Recycling
    'local-waste': 3,
    'waste-color-system': 3,
    'waste-efficiency-penalty': 3,
    'waste-bar': 3,
    'recycling-center': 3, // Moved from Level 4 - atıklarla birlikte tanışma
    'recycled-material': 3, // Moved from Level 4
    'circular-score': 3, // Moved from Level 4
    
    // Level 4 - Advanced Production & City Management
    'textile-grade-2': 4,
    'hq-policy-panel': 4, // Moved from Level 7 - earlier city management
    'hq-energy-management': 4, // Moved from Level 7
    'hq-statistics': 4, // Moved from Level 7
    'hq-trade': 4, // Moved from Level 7
    'hq-research': 4, // Moved from Level 7
    'energy-priority': 4, // Moved from Level 7
    
    // Level 5 - Economy Deepens
    'eco-shop': 5,
    'product-sales': 5,
    'wind-turbine': 5,
    'waste-to-energy': 5, // Atıktan Enerji Tesisi
    
    // Level 6 - City Scale
    'technology-factory': 6,
    'global-pollution': 6,
    'recycling-auto': 6,
    'residential-level-3': 6,
    
    // Level 7 - Advanced Management
    'farming-area': 7,
    'hydro-plant': 7,
    
    // Level 8 - Optimization
    'steel-factory': 8,
    'recycling-efficiency-bonus': 8,
    'eco-shop-upgrade': 8,
    'global-pollution-effects': 8,
    
    // Level 9 - Industry
    'automotive-factory': 9,
    'eco-shop-prestige': 9,
    'pollution-events': 9,
    
    // Level 10 - Mastery
    'achievements': 10,
    'waste-free-bonuses': 10,
    'advanced-policies': 10,
    'max-circular-multipliers': 10
  };

  /**
   * Get all features unlocked at a specific level
   * @param {number} level 
   * @returns {Array<string>}
   */
  static getFeaturesAtLevel(level) {
    return Object.entries(this.unlockLevels)
      .filter(([feature, unlockLevel]) => unlockLevel === level)
      .map(([feature]) => feature);
  }

  /**
   * Get all unlocked features up to a level
   * @param {number} level 
   * @returns {Array<string>}
   */
  static getAllUnlockedFeatures(level) {
    return Object.entries(this.unlockLevels)
      .filter(([feature, unlockLevel]) => unlockLevel <= level)
      .map(([feature]) => feature);
  }

  /**
   * Get level information (title, description, features, tips)
   * @param {number} level 
   * @returns {Object}
   */
  static getLevelInfo(level) {
    const levelInfo = {
      1: {
        title: 'Temel Hayatta Kalma',
        description: 'Şehir kurulumuna başladınız! Temel sistemleri öğrenin.',
        features: [
          'Oyuncu Evi (HQ)',
          'Enerji Havuzu',
          'Solar Panel',
          'Textile Factory',
          'Konut (Level 1)',
          'Para Sistemi'
        ],
        tips: [
          'Solar Panel kurarak enerji üretin',
          'Textile Factory kurarak üretime başlayın',
          'Konutlar yerleştirerek nüfus artırın'
        ]
      },
      2: {
        title: 'Üretimi Anlamak',
        description: 'Üretim sistemini derinlemesine öğrenin ve ekonomiyi büyütün.',
        features: [
          'Üretim Kuyruğu (5 ürün)',
          'Konut Level 2',
          'Enerji Tüketim Gösterimi',
          'Envanter Paneli',
          'Otomatik Ham Madde Satın Alma',
          'Manuel Ham Madde Satın Alma (HQ)'
        ],
        tips: [
          'Üretim kuyruğunu kullanarak daha fazla ürün üretin',
          'Envanter panelinden kaynaklarınızı kontrol edin',
          'Ham maddeler otomatik satın alınır - üretim devam eder',
          'HQ\'dan manuel olarak ham madde satın alabilirsiniz',
          'Otomatik satış zaten aktif - ürünleriniz otomatik satılıyor'
        ]
      },
      3: {
        title: 'Atık Gerçeği & Geri Dönüşüm',
        description: 'Üretimin bedeli varmış! Atık yönetimini öğrenin ve geri dönüşümle tanışın.',
        features: [
          'Local Waste (Bina Bazlı)',
          'Atık Renk Sistemi',
          'Verimlilik Ceza Sistemi',
          'Atık Barı',
          'Recycling Center',
          'Recycled Material',
          'Circular Score'
        ],
        tips: [
          'Binaların atık seviyesini kontrol edin',
          'Yüksek atık seviyesi üretimi yavaşlatır',
          'Atık seviyesi 100\'e ulaşırsa bina durur',
          'Recycling Center kurarak atıkları geri dönüştürün',
          'Circular Score\'u artırarak bonuslar kazanın'
        ]
      },
      4: {
        title: 'Gelişmiş Üretim & Şehir Yönetimi',
        description: 'Daha verimli üretim tarifeleri keşfedin ve şehri yönetmeye başlayın.',
        features: [
          'Textile Grade 2 Tarifeler',
          'HQ Policy Panel (Şehir Politikaları)',
          'HQ Energy Management',
          'HQ Statistics',
          'HQ Trade',
          'HQ Research',
          'Energy Priority System'
        ],
        tips: [
          'Grade 2 tarifeler daha verimli üretim sağlar',
          'HQ\'dan şehir politikalarını ayarlayın',
          'Enerji öncelik sistemini kullanın',
          'İstatistikleri takip edin'
        ]
      },
      5: {
        title: 'Ekonomi Derinleşiyor',
        description: 'Ekonomi sistemini genişletin ve yeni binalar keşfedin.',
        features: [
          'Eco Shop',
          'Ürün Bazlı Satış',
          'Wind Turbine',
          'Atıktan Enerji Tesisi'
        ],
        tips: [
          'Eco Shop kurarak ürünlerinizi satın',
          'Wind Turbine ile daha fazla enerji üretin',
          'Atıktan Enerji Tesisi ile atıkları enerjiye çevirin (pahalı ama etkili)',
          'Ürün satışından para kazanın'
        ]
      },
      6: {
        title: 'Şehir Ölçeği',
        description: 'Şehir büyüyor! Global sistemleri yönetin.',
        features: [
          'Technology Factory',
          'Global Pollution',
          'Otomatik Geri Dönüşüm',
          'Konut Level 3'
        ],
        tips: [
          'Technology Factory ile teknoloji ürünleri üretin',
          'Global pollution\'u kontrol altında tutun',
          'Otomatik geri dönüşüm verimliliği artırır'
        ]
      },
      7: {
        title: 'Gelişmiş Kaynaklar',
        description: 'Yeni kaynaklar ve enerji üretim yöntemleri keşfedin.',
        features: [
          'Farming Area',
          'Hydro Plant'
        ],
        tips: [
          'Farming Area ile organik ürünler üretin',
          'Hydro Plant ile güçlü enerji üretin'
        ]
      },
      8: {
        title: 'Optimizasyon',
        description: 'Şehrinizi optimize edin ve verimliliği artırın.',
        features: [
          'Steel Factory',
          'Recycling Verimlilik Bonusları',
          'Eco Shop Upgrade (2 slot)',
          'Global Pollution Etkileri'
        ],
        tips: [
          'Steel Factory ile çelik ürünleri üretin',
          'Recycling bonusları ile daha fazla kaynak kazanın',
          'Eco Shop\'u yükselterek daha fazla ürün satın'
        ]
      },
      9: {
        title: 'Endüstri',
        description: 'Büyük güç = büyük sorumluluk!',
        features: [
          'Automotive Factory',
          'Eco Shop Prestige Mode',
          'Pollution Events'
        ],
        tips: [
          'Automotive Factory ile araç üretin',
          'Prestige mode ile daha fazla gelir kazanın',
          'Pollution event\'lerine hazır olun'
        ]
      },
      10: {
        title: 'Ustalık',
        description: 'Sistemi çözdünüz! Mastery seviyesine ulaştınız.',
        features: [
          'Achievement Sistemi',
          'Waste-free Bonusları',
          'Advanced Policies',
          'Max Circular Multipliers'
        ],
        tips: [
          'Achievement\'ları tamamlayın',
          'Waste-free binalar için bonuslar kazanın',
          'Advanced policies ile şehri optimize edin'
        ]
      }
    };

    return levelInfo[level] || {
      title: `Level ${level}`,
      description: 'Yeni seviyeye ulaştınız!',
      features: [],
      tips: []
    };
  }
}

// Global instance
window.levelUnlocks = LevelUnlocks;

