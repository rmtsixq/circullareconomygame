import { CommercialZone } from './buildings/zones/commercial.js';
import { IndustrialZone } from './buildings/zones/industrial.js';
import { ResidentialZone } from './buildings/zones/residential.js';
import config from '../config.js';

export class Citizen {
  /**
   * @param {ResidentialZone} residence 
   */
  constructor(residence) {
    /**
     * Unique identifier for the citizen
     * @type {string}
     */
    this.id = crypto.randomUUID();

    /**
     * Name of this citizen
     * @type {string}
     */
    this.name = generateRandomName();

    /**
     * Age of the citizen in years
     * @type {number}
     */
    this.age = 1 + Math.floor(100*Math.random());

    /**
     * The current state of the citizen
     * @type {'idle' | 'school' | 'employed' | 'unemployed' | 'retired'}
     */
    this.state = 'idle';

    /**
     * Number of simulation steps in the current state
     */
    this.stateCounter = 0;

    /**
     * Reference to the building the citizen lives at
     * @type {ResidentialZone}
     */
    this.residence = residence;

    /**
     * Reference to the building the citizen works at
     * @type {CommercialZone | IndustrialZone}
     */
    this.workplace = null;

    this.#initializeState();
  }

  /**
   * Sets the initial state of the citizen
   */
  #initializeState() {
    if (this.age < config.citizen.minWorkingAge) {
      this.state = 'school';
    } else if (this.age >= config.citizen.retirementAge) {
      this.state = 'retired';
    } else {
      this.state = 'unemployed';
    }
  }

  /**
   * Steps the state of the citizen forward in time by one simulation step
   * @param {object} city 
   */
  simulate(city) {
    switch (this.state) {
      case 'idle':
      case 'school':
      case 'retired':
        // Action - None

        // Transitions - None

        break;
      case 'unemployed':
        // Action - Look for a job (try every tick until found)
        // Only search if we don't have a workplace
        if (!this.workplace) {
          // Search for job every tick (changed from every 5 ticks for faster job assignment)
          this.workplace = this.#findJob(city);
        }

        // Transitions
        if (this.workplace) {
          // Found a job - ensure we're in the workers list
          if (this.workplace.jobs && this.workplace.jobs.workers) {
            if (!this.workplace.jobs.workers.includes(this)) {
              this.workplace.jobs.workers.push(this);
            }
          }
          this.state = 'employed';
          this.stateCounter = 0; // Reset counter for new state
        }

        break;
      case 'employed':
        // Actions - None

        // Transitions
        // Only change to unemployed if workplace building is actually removed/destroyed
        // OR if citizen is no longer in the workers list (was laid off)
        if (!this.workplace) {
          // Workplace reference is null - become unemployed
          this.state = 'unemployed';
          this.stateCounter = 0;
        } else {
          // Check if citizen is still in workers list (quick check every tick)
          let stillEmployed = false;
          if (this.workplace.jobs && this.workplace.jobs.workers) {
            stillEmployed = this.workplace.jobs.workers.includes(this);
            
            // If not in list but workplace exists, try to re-add (might have been temporary removal)
            if (!stillEmployed) {
              // Check if building still has room
              const currentWorkers = this.workplace.jobs.workers.length;
              const maxWorkers = this.workplace.maxWorkers || 
                                (this.workplace.requiredWorkers ? this.workplace.requiredWorkers * 2 : 
                                 this.workplace.jobs.maxWorkers || 10);
              
              if (currentWorkers < maxWorkers) {
                // Re-add to workers list
                this.workplace.jobs.workers.push(this);
                stillEmployed = true;
              }
            }
          } else {
            // No jobs module - workplace is invalid
            stillEmployed = false;
          }
          
          // Verify workplace building still exists in city (only check occasionally, not every tick)
          // Use stateCounter to check less frequently (every 20 ticks)
          if (stillEmployed && this.stateCounter % 20 === 0) {
            let buildingExists = false;
            for (let x = 0; x < city.size; x++) {
              for (let y = 0; y < city.size; y++) {
                const tile = city.getTile(x, y);
                if (tile && tile.building === this.workplace) {
                  buildingExists = true;
                  break;
                }
              }
              if (buildingExists) break;
            }
            
            if (!buildingExists) {
              // Building was removed - clean up and become unemployed
              if (this.workplace.jobs && this.workplace.jobs.workers) {
                const workerIndex = this.workplace.jobs.workers.indexOf(this);
                if (workerIndex > -1) {
                  this.workplace.jobs.workers.splice(workerIndex, 1);
                }
              }
              this.workplace = null;
              this.state = 'unemployed';
              this.stateCounter = 0; // Reset counter for new state
              return; // Exit early
            }
          }
          
          // If citizen is no longer in workers list and couldn't be re-added, become unemployed
          if (!stillEmployed) {
            this.workplace = null;
            this.state = 'unemployed';
            this.stateCounter = 0;
            return; // Exit early
          }
          
          // Increment state counter
          this.stateCounter++;
        }

        break;
      default:
        console.error(`Citizen ${this.id} is in an unknown state (${this.state})`);
    }
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    // Remove resident from its workplace
    if (this.workplace && this.workplace.jobs && this.workplace.jobs.workers) {
      const workerIndex = this.workplace.jobs.workers.indexOf(this);
      if (workerIndex > -1) {
        this.workplace.jobs.workers.splice(workerIndex, 1);
      }
    }
    this.workplace = null;
  }

  /**
   * Search for a job nearby (respects workforce distribution policy)
   * @param {object} city 
   * @returns 
   */
  #findJob(city) {
    // If citizen already has a workplace, don't search for a new one
    // (This prevents job hopping and state instability)
    if (this.workplace) {
      // Verify current workplace still exists and has room
      let workplaceStillValid = false;
      for (let x = 0; x < city.size; x++) {
        for (let y = 0; y < city.size; y++) {
          const tile = city.getTile(x, y);
          if (tile && tile.building === this.workplace) {
            // Check if building still has room for this worker
            if (this.workplace.jobs && this.workplace.jobs.workers) {
              if (this.workplace.jobs.workers.includes(this)) {
                workplaceStillValid = true;
              }
            }
            break;
          }
        }
        if (workplaceStillValid) break;
      }
      
      if (workplaceStillValid) {
        return this.workplace; // Keep current job
      } else {
        // Current workplace is invalid - clean it up
        if (this.workplace.jobs && this.workplace.jobs.workers) {
          const workerIndex = this.workplace.jobs.workers.indexOf(this);
          if (workerIndex > -1) {
            this.workplace.jobs.workers.splice(workerIndex, 1);
          }
        }
        this.workplace = null;
      }
    }
    
    // Find the tile where the residence is located
    let residenceTile = null;
    for (let x = 0; x < city.size; x++) {
      for (let y = 0; y < city.size; y++) {
        const tile = city.getTile(x, y);
        if (tile && tile.building === this.residence) {
          residenceTile = tile;
          break;
        }
      }
      if (residenceTile) break;
    }

    if (!residenceTile) {
      return null;
    }

    // Get workforce distribution policy (Level 4+)
    let workforceDistribution = null;
    if (window.cityPolicies && window.gameState && window.levelUnlocks &&
        window.levelUnlocks.isUnlocked('hq-policy-panel', window.gameState.level)) {
      workforceDistribution = window.cityPolicies.workforceDistribution;
    }

    // Collect all available jobs with their types
    const availableJobs = [];
    
    // Search all tiles within range
    for (let distance = 1; distance <= config.citizen.maxJobSearchDistance; distance++) {
      for (let dx = -distance; dx <= distance; dx++) {
        for (let dy = -distance; dy <= distance; dy++) {
          if (Math.abs(dx) + Math.abs(dy) !== distance) continue; // Manhattan distance
          
          const x = residenceTile.x + dx;
          const y = residenceTile.y + dy;
          const tile = city.getTile(x, y);
          
          if (!tile || !tile.building) continue;
          
          const building = tile.building;
          let jobType = null;
          let hasAvailableJob = false;
          
          // Check if it's a factory
          if (building.jobs && building.requiredWorkers !== undefined) {
            const currentWorkers = building.jobs.workers ? building.jobs.workers.length : 0;
            // Calculate max workers: use building.maxWorkers if available, otherwise requiredWorkers * 2
            let maxWorkers;
            if (building.maxWorkers !== undefined) {
              maxWorkers = building.maxWorkers;
            } else if (building.jobs.maxWorkers !== undefined) {
              maxWorkers = building.jobs.maxWorkers;
            } else {
              maxWorkers = building.requiredWorkers * 2; // Default: 2x required workers
            }
            
            // Check if factory has space for more workers
            if (currentWorkers < maxWorkers && 
                (!building.jobs.workers || !building.jobs.workers.includes(this))) {
              jobType = 'factories';
              hasAvailableJob = true;
            }
          }
          // Check if it's a recycling center
          else if (building.type === 'recycling-center' && building.jobs) {
            const currentWorkers = building.jobs.workers ? building.jobs.workers.length : 0;
            const maxWorkers = building.jobs.maxWorkers || 10;
            if (currentWorkers < maxWorkers &&
                (!building.jobs.workers || !building.jobs.workers.includes(this))) {
              jobType = 'recycling';
              hasAvailableJob = true;
            }
          }
          // Check if it's commercial
          else if (building.type === 'commercial' && building.jobs) {
            if (building.jobs.availableJobs > 0 &&
                (!building.jobs.workers || !building.jobs.workers.includes(this))) {
              jobType = 'commercial';
              hasAvailableJob = true;
            }
          }
          
          if (hasAvailableJob && jobType) {
            availableJobs.push({ tile, building, jobType, distance });
          }
        }
      }
    }

    // If no jobs available, return null
    if (availableJobs.length === 0) {
      // Debug: Log why no jobs found (only occasionally to avoid spam)
      if (Math.random() < 0.01) { // 1% chance to log
        console.log(`[Job Search] Citizen ${this.id} found no jobs. Residence at (${residenceTile.x}, ${residenceTile.y})`);
      }
      return null;
    }

    // Apply workforce distribution policy if available
    if (workforceDistribution) {
      // Calculate current worker distribution
      // Note: Don't count this citizen if they're already in a workers list (to avoid double counting)
      const currentDistribution = { factories: 0, recycling: 0, commercial: 0 };
      
      // Traverse all tiles to count workers
      for (let x = 0; x < city.size; x++) {
        for (let y = 0; y < city.size; y++) {
          const tile = city.getTile(x, y);
          if (tile && tile.building && tile.building.jobs && tile.building.jobs.workers) {
            const building = tile.building;
            // Count workers, but exclude this citizen if they're in this building's workers list
            // (to avoid counting them twice when they're switching jobs)
            let workerCount = building.jobs.workers.length;
            if (building.jobs.workers.includes(this)) {
              workerCount--; // Don't count this citizen if they're already here
            }
            
            if (building.requiredWorkers !== undefined) {
              currentDistribution.factories += workerCount;
            } else if (building.type === 'recycling-center') {
              currentDistribution.recycling += workerCount;
            } else if (building.type === 'commercial') {
              currentDistribution.commercial += workerCount;
            }
          }
        }
      }
      
      const totalCurrent = currentDistribution.factories + currentDistribution.recycling + currentDistribution.commercial;
      
      // Calculate desired distribution percentages
      const desiredPercentages = {
        factories: workforceDistribution.factories / 100,
        recycling: workforceDistribution.recycling / 100,
        commercial: workforceDistribution.commercial / 100
      };
      
      // Calculate current percentages
      const currentPercentages = totalCurrent > 0 ? {
        factories: currentDistribution.factories / totalCurrent,
        recycling: currentDistribution.recycling / totalCurrent,
        commercial: currentDistribution.commercial / totalCurrent
      } : { factories: 0, recycling: 0, commercial: 0 };
      
      // Score jobs based on how far they are from desired distribution
      availableJobs.forEach(job => {
        const desired = desiredPercentages[job.jobType] || 0;
        const current = currentPercentages[job.jobType] || 0;
        const deficit = desired - current; // Positive if we need more workers in this category
        job.priority = deficit * 1000 - job.distance; // Higher priority for jobs we need more, closer jobs preferred
      });
      
      // Sort by priority (highest first)
      availableJobs.sort((a, b) => b.priority - a.priority);
    } else {
      // No policy: prefer factories, then recycling, then commercial, and closer is better
      availableJobs.sort((a, b) => {
        const typeOrder = { factories: 3, recycling: 2, commercial: 1 };
        const orderDiff = (typeOrder[b.jobType] || 0) - (typeOrder[a.jobType] || 0);
        if (orderDiff !== 0) return orderDiff;
        return a.distance - b.distance; // Closer is better
      });
    }

    // Take the highest priority job
    const selectedJob = availableJobs[0];
    if (!selectedJob) {
      return null;
    }
    
    const building = selectedJob.building;
    
    // Employ the citizen at the building
    if (!building.jobs) {
      console.warn(`Building ${building.type} has no jobs module`);
      return null;
    }
    
    if (!building.jobs.workers) {
      building.jobs.workers = [];
    }
    
    // Check if citizen is already in the workers list
    if (!building.jobs.workers.includes(this)) {
      building.jobs.workers.push(this);
    }
    
    // Set workplace for the citizen
    this.workplace = building;
    
    return building;
  }

  /**
   * Sets the workplace for the citizen
   * @param {CommercialZone | IndustrialZone} workplace 
   */
  setWorkplace(workplace) {
    this.workplace = workplace;
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let workplaceInfo = '';
    if (this.workplace) {
      // Get factory/building name
      let workplaceName = '';
      if (this.workplace.name) {
        workplaceName = this.workplace.name;
      } else if (this.workplace.type) {
        // Map building types to readable names
        const typeNames = {
          'textile-factory': 'Tekstil Fabrikası',
          'technology-factory': 'Teknoloji Fabrikası',
          'steel-factory': 'Çelik Fabrikası',
          'automotive-factory': 'Otomotiv Fabrikası',
          'commercial': 'Ticari Bina',
          'industrial': 'Endüstriyel Bina',
          'recycling-center': 'Geri Dönüşüm Merkezi',
          'farming': 'Tarım Alanı'
        };
        workplaceName = typeNames[this.workplace.type] || this.workplace.type;
      } else {
        workplaceName = 'Bilinmeyen İş Yeri';
      }
      workplaceInfo = `
          <span>
            <img class="info-citizen-icon" src="/icons/job.png">
            ${workplaceName}
          </span>
        `;
    } else {
      // No workplace - show state
      workplaceInfo = `
          <span>
            <img class="info-citizen-icon" src="/icons/job.png">
            ${this.state}
          </span>
        `;
    }
    
    return `
      <li class="info-citizen">
        <span class="info-citizen-name">${this.name}</span>
        <br>
        <span class="info-citizen-details">
          <span>
            <img class="info-citizen-icon" src="/icons/calendar.png">
            ${this.age} yaş
          </span>
          ${workplaceInfo}
        </span>
      </li>
    `;
  }
}

function generateRandomName() {
  const firstNames = [
    'Emma', 'Olivia', 'Ava', 'Sophia', 'Isabella',
    'Liam', 'Noah', 'William', 'James', 'Benjamin',
    'Elizabeth', 'Margaret', 'Alice', 'Dorothy', 'Eleanor',
    'John', 'Robert', 'William', 'Charles', 'Henry',
    'Alex', 'Taylor', 'Jordan', 'Casey', 'Robin'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Jones', 'Brown',
    'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
    'Anderson', 'Thomas', 'Jackson', 'White', 'Harris',
    'Clark', 'Lewis', 'Walker', 'Hall', 'Young',
    'Lee', 'King', 'Wright', 'Adams', 'Green'
  ];

  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return randomFirstName + ' ' + randomLastName;
}