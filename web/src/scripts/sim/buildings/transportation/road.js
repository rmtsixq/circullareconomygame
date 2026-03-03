import * as THREE from 'three';
import { Building } from '../building.js';
import { City } from '../../city.js';
import { DEG2RAD } from 'three/src/math/MathUtils.js';

export class Road extends Building {
  constructor(x, y) {
    super(x, y);
    this.type = 'road';
    this.name = 'Road';
    this.style = 'straight';
    this.hideTerrain = true;
    this.roadAccess.enabled = false;
  }

  /**
   * Updates the road mesh based on which adjacent tiles are roads as well
   * @param {City} city 
   */
  refreshView(city) {
    // Check which adjacent tiles are roads
    let top = (city.getTile(this.x, this.y - 1)?.building?.type === this.type) ?? false;
    let bottom = (city.getTile(this.x, this.y + 1)?.building?.type === this.type) ?? false;
    let left = (city.getTile(this.x - 1, this.y)?.building?.type === this.type) ?? false;
    let right = (city.getTile(this.x + 1, this.y)?.building?.type === this.type) ?? false;
    
    // Check for police station (treat as road connection but not visual road)
    const topBuilding = city.getTile(this.x, this.y - 1)?.building;
    const bottomBuilding = city.getTile(this.x, this.y + 1)?.building;
    const leftBuilding = city.getTile(this.x - 1, this.y)?.building;
    const rightBuilding = city.getTile(this.x + 1, this.y)?.building;
    
    // If adjacent tile is police station, treat it as a road connection for pathing
    // but don't show road visually on that tile
    if (topBuilding?.type === 'police-station') {
      // Check if police station entrance is towards this road
      const entranceDir = topBuilding.entranceDirection || 0;
      if (entranceDir === 2) { // top (north) - entrance facing this road
        top = true; // Treat as connected for pathing
      }
    }
    if (bottomBuilding?.type === 'police-station') {
      const entranceDir = bottomBuilding.entranceDirection || 0;
      if (entranceDir === 0) { // bottom (south) - entrance facing this road
        bottom = true;
      }
    }
    if (leftBuilding?.type === 'police-station') {
      const entranceDir = leftBuilding.entranceDirection || 0;
      if (entranceDir === 1) { // right (east) - entrance facing this road
        left = true;
      }
    }
    if (rightBuilding?.type === 'police-station') {
      const entranceDir = rightBuilding.entranceDirection || 0;
      if (entranceDir === 3) { // left (west) - entrance facing this road
        right = true;
      }
    }

    // Check all combinations
    // Four-way intersection
    if (top && bottom && left && right) {
      this.style = 'four-way';
      this.rotation.y = 0;
    // T intersection
    } else if (!top && bottom && left && right) { // bottom-left-right
      this.style = 'three-way';
      this.rotation.y  = 0;
    } else if (top && !bottom && left && right) { // top-left-right
      this.style = 'three-way';
      this.rotation.y  = 180 * DEG2RAD;
    } else if (top && bottom && !left && right) { // top-bottom-right
      this.style = 'three-way';
      this.rotation.y  = 90 * DEG2RAD;
    } else if (top && bottom && left && !right) { // top-bottom-left
      this.style = 'three-way';
      this.rotation.y  = 270 * DEG2RAD;
    // Corner
    } else if (top && !bottom && left && !right) { // top-left
      this.style = 'corner';
      this.rotation.y  = 180 * DEG2RAD;
    } else if (top && !bottom && !left && right) { // top-right
      this.style = 'corner';
      this.rotation.y  = 90 * DEG2RAD;
    } else if (!top && bottom && left && !right) { // bottom-left
      this.style = 'corner';
      this.rotation.y  = 270 * DEG2RAD;
    } else if (!top && bottom && !left && right) { // bottom-right
      this.style = 'corner';
      this.rotation.y  = 0;
    // Straight
    } else if (top && bottom && !left && !right) { // top-bottom
      this.style = 'straight';
      this.rotation.y  = 0;
    } else if (!top && !bottom && left && right) { // left-right
      this.style = 'straight';
      this.rotation.y  = 90 * DEG2RAD;
    // Dead end
    } else if (top && !bottom && !left && !right) { // top
      this.style = 'end';
      this.rotation.y  = 180 * DEG2RAD;
    } else if (!top && bottom && !left && !right) { // bottom
      this.style = 'end';
      this.rotation.y  = 0;
    } else if (!top && !bottom && left && !right) { // left
      this.style = 'end';
      this.rotation.y  = 270 * DEG2RAD;
    } else if (!top && !bottom && !left && right) { // right
      this.style = 'end';
      this.rotation.y  = 90 * DEG2RAD;
    }

    const mesh = window.assetManager.getModel(`road-${this.style}`, this);
    this.setMesh(mesh);
    city.vehicleGraph.updateTile(this.x, this.y, this);
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `
    <span class="info-label">Style </span>
    <span class="info-value">${this.style}</span>
    <br>
    `;
    return html;
  }
}