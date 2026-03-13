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
   * Unlock levels for all features (6-level model)
   * @type {Object}
   */
  static unlockLevels = {
    // Seviye 1 - Temel Kurulum (Başlangıç)
    'player-house': 1,
    'energy-pool': 1,
    'solar-panel': 1,
    'textile-factory': 1,
    'residential-level-1': 1,
    'money': 1,
    'tick-system': 1,
    'auto-sell': 1,
    'road': 1,
    'inventory-panel': 1,
    'material-shop': 1,
    'residential-level-2': 2,
    'production-queue': 2,
    'auto-buy': 2,

    // Seviye 3 - Geri Dönüşüm (Sürdürülebilirlik > 40)
    'recycling-center': 3,
    'local-waste': 3,
    'waste-color-system': 3,
    'waste-bar': 3,
    'circular-score': 3,
    'recycled-material': 3,
    'hq-policy-panel': 3,
    'hq-statistics': 3,

    // Seviye 4 - Temiz Enerji & Kriz (Emisyon / Çevre Odaklı)
    'wind-turbine': 4,
    'waste-to-energy': 4,
    'global-pollution': 4,
    'energy-priority': 4,

    // Seviye 5 - Teknoloji & Sembiyez (Sürdürülebilirlik > 70)
    'technology-factory': 5,
    'farming-area': 5,
    'hydro-plant': 5,
    'industrial-symbiosis': 5,
    'residential-level-3': 5,

    // Seviye 6 - Net Sıfır Şehir (Refah > 75 & Sağlık > 70)
    'steel-factory': 6,
    'automotive-factory': 6,
    'net-zero-bonus': 6,
    'achievements': 6
  };

  /**
   * Conditions required to reach each level
   */
  static levelConditions = {
    2: (gs) => gs.wellbeing >= 55,
    3: (gs) => gs.sustainability >= 40,
    4: (gs) => (window.globalPollution?.totalPollution || 0) > 30 || gs.sustainability >= 50,
    5: (gs) => gs.sustainability >= 70,
    6: (gs) => gs.wellbeing >= 75 && gs.health >= 70
  };

  /**
   * Check if a level's requirement is met
   * @param {number} level 
   * @param {object} gameState 
   * @returns {boolean}
   */
  static isRequirementMet(level, gameState) {
    if (level <= 1) return true;
    const condition = this.levelConditions[level];
    if (condition) {
      return condition(gameState);
    }
    return true;
  }

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
        title: 'Temel Kurulum',
        description: 'Şehir kurulumuna başladınız! Temel sistemleri ve vatandaş ihtiyaçlarını öğrenin.',
        features: [
          'Konut (Level 1)',
          'Solar Panel',
          'Tekstil Fabrikası',
          'Ham Madde Satın Alma',
          'Para & Enerji Havuzu',
          'Vatandaş İndeksleri'
        ],
        tips: [
          'Ev yerleştirerek nüfusu artırın',
          'Solar panel kurarak şehrin enerji ihtiyacını karşılayın',
          'Vatandaşların sağlık ve refah durumunu takip edin'
        ]
      },
      2: {
        title: 'Sanayi ve Refah',
        description: 'Refah seviyesi 50\'yi geçti! Sanayiye ilk adımı atın.',
        features: [
          'Konut (Level 2)',
          'Üretim Kuyruğu',
          'Otomatik Satın Alma'
        ],
        tips: [
          'Üretim yapıp satarak gelirinizi artırın',
          'İşsizliği azaltarak vatandaş refahını yükseltin',
          'Sanayiyle gelen atıklara dikkat etmeye başlayın'
        ]
      },
      3: {
        title: 'Geri Dönüşüm ve Tasarruf',
        description: 'Sürdürülebilirlik 40\'ı geçti! Atık yönetimini profesyonelleştirin.',
        features: [
          'Geri Dönüşüm Tesisi',
          'Geri Dönüştürülmüş Hammadde',
          'Şehir Politikaları (HQ)',
          'Atık Takip Sistemi'
        ],
        tips: [
          'Atıkları geri dönüştürerek hammadde tasarrufu yapın',
          'Circular Score değerini yükselterek bonuslar kazanın',
          'Şehir politikalarıyla verimliliği optimize edin'
        ]
      },
      4: {
        title: 'Temiz Enerji ve Kriz',
        description: 'Çevresel baskılar artıyor. Rüzgar gücünü kullanın.',
        features: [
          'Rüzgar Türbini',
          'Atıktan Enerji Tesisi',
          'Global Kirlilik Takibi',
          'Enerji Öncelik Sistemi'
        ],
        tips: [
          'Rüzgar gücüyle temiz enerji kapasitenizi artırın',
          'Kirlilik sağlık indeksini düşürmeden önlem alın',
          'Atıkları enerjiye çevirerek çifte avantaj sağlayın'
        ]
      },
      5: {
        title: 'İleri Teknoloji ve Simbiyoz',
        description: 'Sürdürülebilirlik 70\'i geçti! Şehri teknolojiyle donatın.',
        features: [
          'Teknoloji Fabrikası',
          'Tarımsal Alanlar',
          'Hidroelektrik Santrali',
          'Endüstriyel Simbiyoz',
          'Konut (Level 3)'
        ],
        tips: [
          'Endüstriyel simbiyoz ile kaynak paylaşımını aktifleştirin',
          'Tarımsal alanlarla gıda/organik ihtiyacı karşılayın',
          'İleri teknoloji ürünleriyle yüksek kar elde edin'
        ]
      },
      6: {
        title: 'Net Sıfır Şehir',
        description: 'Ustalık seviyesindesiniz! Dünyanın en yaşanabilir şehrini kurdunuz.',
        features: [
          'Çelik Fabrikası',
          'Otomotiv Fabrikası',
          'Net Sıfır Bonusları',
          'Başarımlar'
        ],
        tips: [
          'Karbon ayak izinizi sıfırlamaya çalışın',
          'En gelişmiş sanayi ürünlerini ihraç edin',
          'Vatandaş mutluluğunu maksimumda tutun'
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

