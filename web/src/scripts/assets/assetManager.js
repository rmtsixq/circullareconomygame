import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import models from './models.js';

// Use base URL from import.meta.env or fallback to '/'
const baseUrl = import.meta.env.BASE_URL || '/';

export class AssetManager {
  textureLoader = new THREE.TextureLoader();
  gltfLoader = new GLTFLoader();
  fbxLoader = new FBXLoader();

  textures = {
    'base': this.#loadTexture(`${baseUrl}textures/base.png`),
    'specular': this.#loadTexture(`${baseUrl}textures/specular.png`),
    'grid': this.#loadTexture(`${baseUrl}textures/grid.png`),
    
  };

  statusIcons = {
    'no-power': this.#loadTexture(`${baseUrl}statusIcons/no-power.png`, true),
    'no-road-access': this.#loadTexture(`${baseUrl}statusIcons/no-road-access.png`, true),
    'critical-waste': this.#createWarningIcon(), // Create warning icon dynamically
    'missing-resources': this.#createMaterialShortageIcon() // Create material shortage icon dynamically
  }
  
  /**
   * Create a warning icon texture dynamically
   * @returns {THREE.Texture}
   */
  #createWarningIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Draw warning triangle
    context.fillStyle = '#FF9800';
    context.beginPath();
    context.moveTo(32, 8);
    context.lineTo(56, 52);
    context.lineTo(8, 52);
    context.closePath();
    context.fill();
    
    // Draw exclamation mark
    context.fillStyle = '#FFFFFF';
    context.font = 'bold 32px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('!', 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Create a material shortage icon texture dynamically
   * @returns {THREE.Texture}
   */
  #createMaterialShortageIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Draw red warning circle background
    context.fillStyle = '#f44336';
    context.beginPath();
    context.arc(32, 32, 28, 0, Math.PI * 2);
    context.fill();
    
    // Draw white border
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 3;
    context.stroke();
    
    // Draw material/box icon (simplified)
    context.fillStyle = '#FFFFFF';
    // Draw a box/cube shape
    context.fillRect(18, 20, 28, 20);
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 2;
    // Draw box outline
    context.strokeRect(18, 20, 28, 20);
    // Draw diagonal lines for 3D effect
    context.beginPath();
    context.moveTo(46, 20);
    context.lineTo(50, 16);
    context.lineTo(50, 36);
    context.lineTo(46, 40);
    context.stroke();
    context.beginPath();
    context.moveTo(18, 20);
    context.lineTo(22, 16);
    context.lineTo(50, 16);
    context.stroke();
    
    // Draw X mark to indicate shortage
    context.strokeStyle = '#f44336';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(24, 28);
    context.lineTo(40, 44);
    context.moveTo(40, 28);
    context.lineTo(24, 44);
    context.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  models = {};

  sprites = {};

  constructor(onLoad) {
    this.modelCount = Object.keys(models).length;
    this.loadedModelCount = 0;

    for (const [name, meta] of Object.entries(models)) {
      this.#loadModel(name, meta);
    }

    this.onLoad = onLoad;
  }

  /**
   * Returns a cloned copy of a mesh
   * @param {string} name The name of the mesh to retrieve
   * @param {Object} simObject The SimObject object that corresponds to this mesh
   * @param {boolean} transparent True if materials should be transparent. Default is false.
   * @returns {THREE.Mesh}
   */
  getModel(name, simObject, transparent = false) {
    if (!this.models[name]) {
      console.error(`Model "${name}" not found in AssetManager`);
      return null;
    }
    const mesh = this.models[name].clone();

    // Clone materials so each object has a unique material
    // This is so we can set the modify the texture of each
    // mesh independently (e.g. highlight on mouse over,
    // abandoned buildings, etc.))
    mesh.traverse((obj) => {
      obj.userData = simObject;
      if(obj.material) {
        obj.material = obj.material.clone();
        obj.material.transparent = transparent;
      }
    });

    return mesh;
  }
  
  /**
   * Loads the texture at the specified URL
   * @param {string} url 
   * @returns {THREE.Texture} A texture object
   */
  #loadTexture(url, flipY = false) {
    const texture = this.textureLoader.load(url)
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = flipY;
    return texture;
  }

  /**
   * Load the 3D models
   * @param {string} url The URL of the model to load
   */
  #loadModel(name, {filename, scale = 1, rotation = 0, receiveShadow = true, castShadow = true, format = 'glb', preserveMaterials = false}) {
    const url = `${baseUrl}models/${filename}`;
    const loader = format === 'fbx' ? this.fbxLoader : this.gltfLoader;
    
    const onLoad = (loaded) => {
      let mesh = format === 'fbx' ? loaded : loaded.scene;
      
      mesh.name = filename;

      mesh.traverse((obj) => {
        if (obj.material) {
          if (!preserveMaterials) {
            obj.material = new THREE.MeshLambertMaterial({
              map: this.textures.base,
              specularMap: this.textures.specular
            });
          }
          obj.receiveShadow = receiveShadow;
          obj.castShadow = castShadow;
        }
      });

      mesh.rotation.set(0, THREE.MathUtils.degToRad(rotation), 0);
      mesh.scale.set(scale / 30, scale / 30, scale / 30);

      this.models[name] = mesh;

      // Once all models are loaded
      this.loadedModelCount++;
      if (this.loadedModelCount == this.modelCount) {
        this.onLoad()
      }
    };

    const onProgress = (xhr) => {
      //console.log(`${name} ${(xhr.loaded / xhr.total) * 100}% loaded`);
    };

    const onError = (error) => {
      console.error(error);
    };

    if (format === 'fbx') {
      this.fbxLoader.load(url, onLoad, onProgress, onError);
    } else {
      this.gltfLoader.load(url, onLoad, onProgress, onError);
    }
  }
}