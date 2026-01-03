import config from '../../../config.js';
import { Citizen } from '../../citizen.js';
import { City } from '../../city.js';
import { Zone } from '../../buildings/zones/zone.js';
import { DevelopmentState } from './development.js';
import { SimModule } from './simModule.js';

export class JobsModule extends SimModule {
  /**
   * @type {Zone | Building}
   */
  #building;

  /**
   * @type {Citizen[]}
   */
  workers = [];

  constructor(building) {
    super();
    this.#building = building;
  }

  /**
   * Maximuim number of workers that can work at this building
   * @returns {number}
   */
  get maxWorkers() {
    // If building is a Factory, use factory's maxWorkers
    if (this.#building.maxWorkers !== undefined) {
      return this.#building.maxWorkers;
    }
    
    // For Zone buildings, check development state
    if (this.#building.development) {
      // If building is not developed, there are no available jobs
      if (this.#building.development.state !== DevelopmentState.developed) {
        return 0;
      } else {
        return Math.pow(config.modules.jobs.maxWorkers, this.#building.development.level);
      }
    }
    
    // Default: no workers if building doesn't support jobs
    return 0;
  }

  /**
   * Returns the number of job openings
   * @returns {number}
   */
  get availableJobs() {
    return this.maxWorkers - this.workers.length;
  }

  /**
   * Returns the number of positions that are filled
   * @returns {number}
   */
  get filledJobs() {
    return this.workers.length;
  }

  /**
   * Steps the state of the building forward in time by one simulation step
   * @param {City} city 
   */
  simulate(city) {
    // For Zone buildings, check if abandoned
    if (this.#building.development) {
      // If building is abandoned, all workers are laid off and no
      // more workers are allowed to work here
      if (this.#building.development.state === DevelopmentState.abandoned) {
        this.#layOffWorkers();
      }
    }
    // For Factory buildings, no special simulation needed
    // Workers are managed by the city's job assignment system
  }

  /**
   * Lay off all existing workers
   */
  #layOffWorkers() {
    for (const worker of this.workers) {
      worker.workplace = null; // Directly set to null
      worker.state = 'unemployed'; // Also update state
      worker.stateCounter = 0; // Reset counter
    }
    this.workers = [];
  }

  /**
   * Handles any clean up needed before a building is removed
   */
  dispose() {
    this.#layOffWorkers();
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = `<div class="info-heading">Workers (${this.filledJobs}/${this.maxWorkers})</div>`;

    html += '<ul class="info-citizen-list">';
    for (const worker of this.workers) {
      html += worker.toHTML();
    }
    html += '</ul>';

    return html;
  }
}