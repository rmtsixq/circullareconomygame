import * as THREE from 'three';

/**
 * Floating Text Effect - Shows floating text above buildings
 */
export class FloatingTextEffect {
  /**
   * @type {THREE.Sprite}
   */
  sprite = null;
  
  /**
   * @type {THREE.Object3D}
   */
  target = null;
  
  /**
   * @type {number}
   */
  duration = 2.5; // seconds
  
  /**
   * @type {number}
   */
  startTime = 0;
  
  /**
   * @type {number}
   */
  startY = 0;
  
  /**
   * @type {number}
   */
  offsetX = 0;
  
  /**
   * @type {number}
   */
  offsetZ = 0;
  
  /**
   * @type {number}
   */
  totalHeight = 2; // units to float up
  
  /**
   * @param {string} text - Text to display (e.g., "+5 ✅")
   * @param {THREE.Object3D} target - Building to attach effect to
   * @param {string} color - Color hex string (e.g., "#4CAF50")
   * @param {number} offsetX - Random X offset to avoid overlap
   * @param {number} offsetZ - Random Z offset to avoid overlap
   */
  constructor(text, target, color = "#ffffff", offsetX = 0, offsetZ = 0) {
    this.target = target;
    this.startTime = Date.now();
    this.offsetX = offsetX;
    this.offsetZ = offsetZ;
    
    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Set font
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Add text shadow for better visibility
    context.shadowColor = 'rgba(0, 0, 0, 0.8)';
    context.shadowBlur = 10;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    
    // Fill text
    context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Create sprite material
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    
    // Create sprite
    this.sprite = new THREE.Sprite(material);
    this.sprite.scale.set(0.5, 0.25, 1);
    this.sprite.layers.set(1); // Render on layer 1 (same as camera)
    
    // Position sprite above building
    if (target) {
      // Get building position
      const worldPos = new THREE.Vector3();
      target.getWorldPosition(worldPos);
      
      this.startY = worldPos.y + 0.5; // Start 0.5 units above building
      this.sprite.position.set(
        worldPos.x + offsetX,
        this.startY,
        worldPos.z + offsetZ
      );
    }
  }
  
  /**
   * Update effect animation
   * @param {THREE.Scene} scene - Scene to add/remove from
   * @returns {boolean} True if effect is still active
   */
  update(scene) {
    const elapsed = (Date.now() - this.startTime) / 1000; // seconds
    const progress = elapsed / this.duration;
    
    if (progress >= 1) {
      // Effect finished, remove from scene
      if (this.sprite && scene) {
        scene.remove(this.sprite);
        if (this.sprite.material) {
          this.sprite.material.dispose();
        }
        if (this.sprite.material.map) {
          this.sprite.material.map.dispose();
        }
      }
      return false;
    }
    
    // Update position (float upward)
    if (this.sprite) {
      const currentY = this.startY + (this.totalHeight * progress);
      this.sprite.position.y = currentY;
      
      // Fade out as it rises
      const fadeStart = 0.7; // Start fading at 70% progress
      if (progress > fadeStart) {
        const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
        this.sprite.material.opacity = 1 - fadeProgress;
      }
    }
    
    return true;
  }
  
  /**
   * Add effect to scene
   * @param {THREE.Scene} scene 
   */
  addToScene(scene) {
    if (this.sprite && scene) {
      scene.add(this.sprite);
    }
  }
}

/**
 * Visual Effects Manager - Manages all floating text effects
 */
export class VisualEffectsManager {
  /**
   * @type {Array<FloatingTextEffect>}
   */
  effects = [];
  
  /**
   * @type {THREE.Scene}
   */
  scene = null;
  
  constructor(scene) {
    this.scene = scene;
  }
  
  /**
   * Show production complete effect
   * @param {THREE.Object3D} building 
   * @param {number} amount 
   * @param {string} resourceName 
   */
  showProductionEffect(building, amount, resourceName = '') {
    const text = `+${amount} ✅`;
    const color = "#4CAF50"; // Green
    const offsetX = (Math.random() - 0.5) * 0.3; // Random -0.15 to 0.15
    const offsetZ = (Math.random() - 0.5) * 0.3;
    
    const effect = new FloatingTextEffect(text, building, color, offsetX, offsetZ);
    effect.addToScene(this.scene);
    this.effects.push(effect);
  }
  
  /**
   * Show waste production effect
   * @param {THREE.Object3D} building 
   * @param {number} amount 
   */
  showWasteEffect(building, amount) {
    const text = `+${amount.toFixed(1)} 🗑️`;
    const color = "#FF9800"; // Orange
    const offsetX = (Math.random() - 0.5) * 0.3;
    const offsetZ = (Math.random() - 0.5) * 0.3;
    
    const effect = new FloatingTextEffect(text, building, color, offsetX, offsetZ);
    effect.addToScene(this.scene);
    this.effects.push(effect);
  }
  
  /**
   * Show energy production effect
   * @param {THREE.Object3D} building 
   * @param {number} amount 
   */
  showEnergyEffect(building, amount) {
    const text = `+${amount} ⚡`;
    const color = "#FFD700"; // Gold
    const offsetX = (Math.random() - 0.5) * 0.3;
    const offsetZ = (Math.random() - 0.5) * 0.3;
    
    const effect = new FloatingTextEffect(text, building, color, offsetX, offsetZ);
    effect.addToScene(this.scene);
    this.effects.push(effect);
  }
  
  /**
   * Add a generic floating text effect
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} message - Text to display
   * @param {string} type - 'success', 'error', 'info'
   */
  addEffect(x, y, message, type = 'info') {
    const color = {
      'success': '#4CAF50', // Green
      'error': '#F44336',   // Red
      'info': '#2196F3'     // Blue
    }[type] || '#FFFFFF';

    // Create a temporary object for positioning
    const tempObj = new THREE.Object3D();
    tempObj.position.set(x + 0.5, 0, y + 0.5);
    
    const offsetX = (Math.random() - 0.5) * 0.5;
    const offsetZ = (Math.random() - 0.5) * 0.5;
    
    const effect = new FloatingTextEffect(message, tempObj, color, offsetX, offsetZ);
    effect.addToScene(this.scene);
    this.effects.push(effect);
  }

  /**
   * Update all effects
   */
  update() {
    // Update all effects and remove finished ones
    this.effects = this.effects.filter(effect => effect.update(this.scene));
  }
  
  /**
   * Clear all effects
   */
  clear() {
    this.effects.forEach(effect => {
      if (effect.sprite && this.scene) {
        this.scene.remove(effect.sprite);
        if (effect.sprite.material) {
          effect.sprite.material.dispose();
        }
        if (effect.sprite.material && effect.sprite.material.map) {
          effect.sprite.material.map.dispose();
        }
      }
    });
    this.effects = [];
  }
}

// Global instance
window.visualEffects = null;

