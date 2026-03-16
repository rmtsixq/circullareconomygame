import * as THREE from 'three';

// -- Constants --
const DEG2RAD = Math.PI / 180.0;
const RIGHT_MOUSE_BUTTON = 2;

// Camera constraints
const CAMERA_SIZE = 5;
const MIN_CAMERA_RADIUS = 0.1;
const MAX_CAMERA_RADIUS = 5;
const MIN_CAMERA_ELEVATION = 45;
const MAX_CAMERA_ELEVATION = 45;

// Camera sensitivity
const AZIMUTH_SENSITIVITY = 0.2;
const ELEVATION_SENSITIVITY = 0.2;
const ZOOM_SENSITIVITY = 0.002;
const PAN_SENSITIVITY = -0.01;
const TOUCH_ZOOM_SENSITIVITY = 0.005;
const TOUCH_PAN_SENSITIVITY = -0.01;

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export class CameraManager {
  constructor() {
    const aspect = window.ui.gameWindow.clientWidth / window.ui.gameWindow.clientHeight;

    this.camera = new THREE.OrthographicCamera(
      (CAMERA_SIZE * aspect) / -2,
      (CAMERA_SIZE * aspect) / 2,
      CAMERA_SIZE / 2,
      CAMERA_SIZE / -2, 1, 1000);
    this.camera.layers.enable(1);
    
    this.cameraOrigin = new THREE.Vector3(8, 0, 8);
    this.cameraRadius = 0.5;
    this.cameraAzimuth = 225;
    this.cameraElevation = 45;

    this.updateCameraPosition();

    window.ui.gameWindow.addEventListener('wheel', this.onMouseScroll.bind(this), false);
    window.ui.gameWindow.addEventListener('mousedown', this.onMouseMove.bind(this), false);
    window.ui.gameWindow.addEventListener('mousemove', this.onMouseMove.bind(this), false);

    // Touch support
    window.ui.gameWindow.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    window.ui.gameWindow.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    window.ui.gameWindow.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
    
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.lastTouchDistance = 0;
  }

  /**
    * Applies any changes to camera position/orientation
    */
  updateCameraPosition() {
    this.camera.zoom = this.cameraRadius;
    this.camera.position.x = 100 * Math.sin(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.y = 100 * Math.sin(this.cameraElevation * DEG2RAD);
    this.camera.position.z = 100 * Math.cos(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.add(this.cameraOrigin);
    this.camera.lookAt(this.cameraOrigin);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  /**
   * Event handler for `mousemove` event
   * @param {MouseEvent} event Mouse event arguments
   */
  onMouseMove(event) {
    // Handles the rotation of the camera
    if (event.buttons & RIGHT_MOUSE_BUTTON && !event.ctrlKey) {
      this.cameraAzimuth += -(event.movementX * AZIMUTH_SENSITIVITY);
      this.cameraElevation += (event.movementY * ELEVATION_SENSITIVITY);
      this.cameraElevation = Math.min(MAX_CAMERA_ELEVATION, Math.max(MIN_CAMERA_ELEVATION, this.cameraElevation));
    }

    // Handles the panning of the camera
    if (event.buttons & RIGHT_MOUSE_BUTTON && event.ctrlKey) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      this.cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * event.movementY));
      this.cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * event.movementX));
    }

    this.updateCameraPosition();
  }

  /**
   * Event handler for `wheel` event
   * @param {MouseEvent} event Mouse event arguments
   */
  onMouseScroll(event) {
    this.cameraRadius *= 1 - (event.deltaY * ZOOM_SENSITIVITY);
    this.cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, this.cameraRadius));

    this.updateCameraPosition();
  }

  /**
   * Event handler for `touchstart` event
   * @param {TouchEvent} event 
   */
  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      this.lastTouchDistance = this.getTouchDistance(event.touches);
    }
  }

  /**
   * Event handler for `touchmove` event
   * @param {TouchEvent} event 
   */
  onTouchMove(event) {
    if (event.touches.length === 1) {
      // Rotation or Panning based on tool
      const dx = event.touches[0].clientX - this.lastTouchX;
      const dy = event.touches[0].clientY - this.lastTouchY;

      // If 'select' is NOT the active tool, we use one finger for tool action (handled in game.js)
      // But we can also use it for rotation if right click equivalent is needed
      
      // Equivoalent of right click drag (rotation)
      if (window.ui.activeToolId === 'select') {
         this.cameraAzimuth += -(dx * AZIMUTH_SENSITIVITY);
         this.cameraElevation += (dy * ELEVATION_SENSITIVITY);
         this.cameraElevation = Math.min(MAX_CAMERA_ELEVATION, Math.max(MIN_CAMERA_ELEVATION, this.cameraElevation));
      }

      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      // Pinch to zoom
      const distance = this.getTouchDistance(event.touches);
      const delta = distance - this.lastTouchDistance;
      
      this.cameraRadius *= 1 - (delta * TOUCH_ZOOM_SENSITIVITY);
      this.cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, this.cameraRadius));
      
      // Two finger pan
      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      
      if (this.lastTouchCenterX !== undefined) {
        const pdx = centerX - this.lastTouchCenterX;
        const pdy = centerY - this.lastTouchCenterY;
        
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
        const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
        
        this.cameraOrigin.add(forward.multiplyScalar(TOUCH_PAN_SENSITIVITY * pdy));
        this.cameraOrigin.add(left.multiplyScalar(TOUCH_PAN_SENSITIVITY * pdx));
      }

      this.lastTouchDistance = distance;
      this.lastTouchCenterX = centerX;
      this.lastTouchCenterY = centerY;
    }

    this.updateCameraPosition();
  }

  /**
   * Event handler for `touchend` event
   * @param {TouchEvent} event 
   */
  onTouchEnd(event) {
    this.lastTouchCenterX = undefined;
    this.lastTouchCenterY = undefined;
  }

  /**
   * Calculate distance between two touch points
   * @param {TouchList} touches 
   * @returns {number}
   */
  getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  resize() {
    const aspect = window.ui.gameWindow.clientWidth / window.ui.gameWindow.clientHeight;
    this.camera.left = (CAMERA_SIZE * aspect) / -2;
    this.camera.right = (CAMERA_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
  }
}