/**
 * Resource Management System
 * Manages all game resources: raw materials, products, waste, and recycled materials
 */
export class ResourceManager {
  constructor() {
    // Starting resources
    this.resources = {
      // Raw Materials
      'raw-fabric': 50,
      'raw-plastic': 30,
      'raw-metal': 20,
      'raw-electronics': 15,
      'raw-glass': 10,
      
      // Products
      'clothing': 0,
      'sports-gear': 0,
      'smartphone': 0,
      'laptop': 0,
      'steel-beam': 0,
      'steel-structure': 0,
      'electric-car': 0,
      'electric-bike': 0,
      'fertilizer': 0,
      'compost': 0,
      
      // Waste
      'textile-waste': 0,
      'e-waste': 0,
      'scrap-metal': 0,
      'plastic-waste': 0,
      'organic-waste': 0,
      
      // Recycled Materials
      'recycled-fabric': 0,
      'recycled-metal': 0,
      'recycled-plastic': 0,
      'recycled-electronics': 0
    };

    // Resource limits (0 = unlimited)
    this.limits = {
      'textile-waste': 100,
      'e-waste': 100,
      'scrap-metal': 100,
      'plastic-waste': 100,
      'organic-waste': 100
    };
  }

  /**
   * Add resource
   * @param {string} resourceType 
   * @param {number} amount 
   * @returns {boolean} True if successful, false if limit reached
   */
  addResource(resourceType, amount) {
    if (!this.resources.hasOwnProperty(resourceType)) {
      console.warn(`Unknown resource type: ${resourceType}`);
      return false;
    }

    const limit = this.limits[resourceType] || 0;
    const current = this.resources[resourceType];
    
    if (limit > 0 && current + amount > limit) {
      // Limit reached
      this.resources[resourceType] = limit;
      this.updateUI();
      return false;
    }

    this.resources[resourceType] += amount;
    this.updateUI();
    return true;
  }

  /**
   * Remove resource
   * @param {string} resourceType 
   * @param {number} amount 
   * @returns {boolean} True if successful, false if not enough
   */
  removeResource(resourceType, amount) {
    if (!this.resources.hasOwnProperty(resourceType)) {
      console.warn(`Unknown resource type: ${resourceType}`);
      return false;
    }

    if (this.resources[resourceType] >= amount) {
      this.resources[resourceType] -= amount;
      this.updateUI();
      return true;
    }

    return false;
  }

  /**
   * Get resource amount
   * @param {string} resourceType 
   * @returns {number}
   */
  getResource(resourceType) {
    return this.resources[resourceType] || 0;
  }

  /**
   * Check if has enough resources
   * @param {Object} requirements Object with resource types as keys and amounts as values
   * @returns {boolean}
   */
  hasResources(requirements) {
    for (const [resourceType, amount] of Object.entries(requirements)) {
      if (this.getResource(resourceType) < amount) {
        return false;
      }
    }
    return true;
  }

  /**
   * Consume resources (remove multiple resources at once)
   * @param {Object} requirements Object with resource types as keys and amounts as values
   * @returns {boolean} True if successful, false if not enough
   */
  consumeResources(requirements) {
    // First check if we have all resources
    if (!this.hasResources(requirements)) {
      return false;
    }

    // Then remove them
    for (const [resourceType, amount] of Object.entries(requirements)) {
      this.removeResource(resourceType, amount);
    }

    return true;
  }

  /**
   * Get total waste amount
   * @returns {number}
   */
  getTotalWaste() {
    return (
      this.resources['textile-waste'] +
      this.resources['e-waste'] +
      this.resources['scrap-metal'] +
      this.resources['plastic-waste'] +
      this.resources['organic-waste']
    );
  }

  /**
   * Get waste percentage (0-100)
   * @returns {number}
   */
  getWastePercentage() {
    const totalWaste = this.getTotalWaste();
    const totalCapacity = 100 * 5; // 5 waste types, 100 each
    return (totalWaste / totalCapacity) * 100;
  }

  /**
   * Get all resources as object
   * @returns {Object}
   */
  getAllResources() {
    return { ...this.resources };
  }

  /**
   * Update UI
   */
  updateUI() {
    if (window.ui && window.ui.updateResources) {
      window.ui.updateResources(this);
    }
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.resources = {
      'raw-fabric': 50,
      'raw-plastic': 30,
      'raw-metal': 20,
      'raw-electronics': 15,
      'raw-glass': 10,
      'clothing': 0,
      'sports-gear': 0,
      'smartphone': 0,
      'laptop': 0,
      'steel-beam': 0,
      'steel-structure': 0,
      'electric-car': 0,
      'electric-bike': 0,
      'fertilizer': 0,
      'compost': 0,
      'textile-waste': 0,
      'e-waste': 0,
      'scrap-metal': 0,
      'plastic-waste': 0,
      'organic-waste': 0,
      'recycled-fabric': 0,
      'recycled-metal': 0,
      'recycled-plastic': 0,
      'recycled-electronics': 0
    };
    this.updateUI();
  }
}

// Global resource manager instance
window.resourceManager = new ResourceManager();

