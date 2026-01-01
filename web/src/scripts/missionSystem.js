/**
 * Mission & Event System
 * Handles story missions, crises, and random events
 */
export class MissionSystem {
  constructor() {
    this.activeMissions = [];
    this.completedMissions = [];
    this.activeEvents = [];
    this.eventCooldown = 0;
    this.eventInterval = 60; // Events can occur every 60 seconds (60 ticks)
  }

  /**
   * Update mission system (called every tick)
   */
  update() {
    // Check for new events
    this.eventCooldown++;
    if (this.eventCooldown >= this.eventInterval) {
      this.eventCooldown = 0;
      this.checkRandomEvent();
    }

    // Update active missions
    this.activeMissions.forEach(mission => {
      if (mission.checkProgress) {
        mission.checkProgress();
      }
    });

    // Remove completed missions
    this.activeMissions = this.activeMissions.filter(mission => {
      if (mission.completed) {
        this.completedMissions.push(mission);
        this.completeMission(mission);
        return false;
      }
      return true;
    });
  }

  /**
   * Check for random events
   */
  checkRandomEvent() {
    // 20% chance of random event
    if (Math.random() < 0.2) {
      this.triggerRandomEvent();
    }
  }

  /**
   * Trigger a random event
   */
  triggerRandomEvent() {
    const events = [
      {
        id: 'energy-shortage',
        type: 'crisis',
        title: '⚡ Enerji Kıtlığı',
        description: 'Bölgede enerji kıtlığı yaşanıyor! Enerji tüketimi %20 artacak.',
        duration: 30, // 30 seconds
        effect: () => {
          // Increase energy consumption by 20%
          if (window.game && window.game.city) {
            window.game.city.traverse((obj) => {
              if (obj.building && obj.building.energyConsumption) {
                obj.building.energyConsumption *= 1.2;
              }
            });
          }
        },
        endEffect: () => {
          // Restore normal energy consumption
          if (window.game && window.game.city) {
            window.game.city.traverse((obj) => {
              if (obj.building && obj.building.energyConsumption) {
                obj.building.energyConsumption /= 1.2;
              }
            });
          }
        }
      },
      {
        id: 'recycling-regulation',
        type: 'regulation',
        title: '♻️ Yeni Geri Dönüşüm Yönetmeliği',
        description: 'Yeni yönetmelik gereği geri dönüşüm verimliliği %15 artacak!',
        duration: 0, // Permanent until next event
        effect: () => {
          if (window.cityPolicies) {
            window.cityPolicies.recyclingPriority = Math.min(100, window.cityPolicies.recyclingPriority + 15);
          }
        }
      },
      {
        id: 'market-boom',
        type: 'opportunity',
        title: '📈 Pazar Patlaması',
        description: 'Piyasada talep arttı! Ürün fiyatları %25 yükseldi.',
        duration: 45,
        effect: () => {
          // This would affect market prices in the trade panel
          // For now, we'll just show the event
        }
      },
      {
        id: 'waste-crisis',
        type: 'crisis',
        title: '🗑️ Atık Krizi',
        description: 'Atık seviyesi kritik! Atık üretimi %30 artacak.',
        duration: 40,
        effect: () => {
          if (window.game && window.game.city) {
            window.game.city.traverse((obj) => {
              if (obj.building && obj.building.baseWasteProduction) {
                obj.building.baseWasteProduction *= 1.3;
              }
            });
          }
        },
        endEffect: () => {
          if (window.game && window.game.city) {
            window.game.city.traverse((obj) => {
              if (obj.building && obj.building.baseWasteProduction) {
                obj.building.baseWasteProduction /= 1.3;
              }
            });
          }
        }
      },
      {
        id: 'green-initiative',
        type: 'opportunity',
        title: '🌱 Yeşil Girişim',
        description: 'Yenilenebilir enerji teşviki! Enerji üretimi %20 artacak.',
        duration: 50,
        effect: () => {
          // Increase energy production
          if (window.game && window.game.city) {
            window.game.city.traverse((obj) => {
              if (obj.building && (obj.building.type === 'solar-panel' || 
                  obj.building.type === 'wind-turbine' || 
                  obj.building.type === 'hydro-plant')) {
                obj.building.powerProduction = (obj.building.powerProduction || 0) * 1.2;
              }
            });
          }
        },
        endEffect: () => {
          if (window.game && window.game.city) {
            window.game.city.traverse((obj) => {
              if (obj.building && (obj.building.type === 'solar-panel' || 
                  obj.building.type === 'wind-turbine' || 
                  obj.building.type === 'hydro-plant')) {
                obj.building.powerProduction = (obj.building.powerProduction || 0) / 1.2;
              }
            });
          }
        }
      }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    this.activateEvent(event);
  }

  /**
   * Activate an event
   */
  activateEvent(event) {
    const activeEvent = {
      ...event,
      startTime: Date.now(),
      endTime: event.duration > 0 ? Date.now() + (event.duration * 1000) : null,
      active: true
    };

    this.activeEvents.push(activeEvent);
    
    // Apply effect
    if (activeEvent.effect) {
      activeEvent.effect();
    }

    // Show notification
    if (window.ui) {
      window.ui.showEventNotification(activeEvent);
    }

    // Set timeout for event end if it has duration
    if (activeEvent.endTime) {
      setTimeout(() => {
        this.endEvent(activeEvent);
      }, activeEvent.duration * 1000);
    }
  }

  /**
   * End an event
   */
  endEvent(event) {
    event.active = false;
    if (event.endEffect) {
      event.endEffect();
    }
    this.activeEvents = this.activeEvents.filter(e => e.id !== event.id);
    
    if (window.ui) {
      window.ui.showEventEndNotification(event);
    }
  }

  /**
   * Start a story mission
   */
  startMission(mission) {
    mission.completed = false;
    mission.progress = 0;
    this.activeMissions.push(mission);
    
    if (window.ui) {
      window.ui.showMissionNotification(mission);
    }
  }

  /**
   * Complete a mission
   */
  completeMission(mission) {
    // Give rewards
    if (mission.rewards) {
      if (mission.rewards.money && window.gameState) {
        window.gameState.addMoney(mission.rewards.money);
      }
      if (mission.rewards.xp && window.gameState) {
        window.gameState.addXP(mission.rewards.xp);
      }
      if (mission.rewards.resources && window.resourceManager) {
        Object.entries(mission.rewards.resources).forEach(([resource, amount]) => {
          window.resourceManager.addResource(resource, amount);
        });
      }
    }

    if (window.ui) {
      window.ui.showMissionCompleteNotification(mission);
    }
  }

  /**
   * Get initial story missions
   */
  getInitialMissions() {
    return [
      {
        id: 'first-factory',
        title: '🏭 İlk Fabrikanızı Kurun',
        description: 'Bir tekstil fabrikası kurarak üretime başlayın.',
        type: 'tutorial',
        checkProgress: () => {
          if (window.game && window.game.city) {
            let hasFactory = false;
            window.game.city.traverse((obj) => {
              if (obj.building && obj.building.type === 'textile-factory') {
                hasFactory = true;
              }
            });
            if (hasFactory) {
              this.activeMissions.find(m => m.id === 'first-factory').completed = true;
            }
          }
        },
        rewards: {
          money: 5000,
          xp: 50
        }
      },
      {
        id: 'first-recycling',
        title: '♻️ Geri Dönüşüm Merkezi',
        description: 'Bir geri dönüşüm merkezi kurun ve atıkları geri dönüştürün.',
        type: 'tutorial',
        checkProgress: () => {
          if (window.game && window.game.city) {
            let hasRecycling = false;
            window.game.city.traverse((obj) => {
              if (obj.building && obj.building.type === 'recycling-center') {
                hasRecycling = true;
              }
            });
            if (hasRecycling && window.resourceManager) {
              const recycled = window.resourceManager.getResource('recycled-fabric') + 
                               window.resourceManager.getResource('recycled-metal') + 
                               window.resourceManager.getResource('recycled-plastic');
              if (recycled > 0) {
                this.activeMissions.find(m => m.id === 'first-recycling').completed = true;
              }
            }
          }
        },
        rewards: {
          money: 3000,
          xp: 75
        }
      },
      {
        id: 'energy-independence',
        title: '⚡ Enerji Bağımsızlığı',
        description: 'En az 3 enerji üreten bina kurun (Solar, Rüzgar veya Hidro).',
        type: 'goal',
        checkProgress: () => {
          if (window.game && window.game.city) {
            let energyCount = 0;
            window.game.city.traverse((obj) => {
              if (obj.building && (obj.building.type === 'solar-panel' || 
                  obj.building.type === 'wind-turbine' || 
                  obj.building.type === 'hydro-plant')) {
                energyCount++;
              }
            });
            if (energyCount >= 3) {
              this.activeMissions.find(m => m.id === 'energy-independence').completed = true;
            }
          }
        },
        rewards: {
          money: 10000,
          xp: 150
        }
      }
    ];
  }

  /**
   * Initialize missions
   */
  initialize() {
    const initialMissions = this.getInitialMissions();
    initialMissions.forEach(mission => {
      this.startMission(mission);
    });
  }
}

// Global instance
window.missionSystem = new MissionSystem();

