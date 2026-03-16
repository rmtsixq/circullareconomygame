/** 
 * Manages mouse and keyboard input
 */
export class InputManager {
  /**
   * Last mouse position
   * @type {x: number, y: number}
   */
  mouse = { x: 0, y: 0 };
  /**
   * True if left mouse button is currently down
   * @type {boolean}
   */
  isLeftMouseDown = false;
  /**
   * True if the middle mouse button is currently down
   * @type {boolean}
   */
  isMiddleMouseDown = false;
  /**
   * True if the right mouse button is currently down
   * @type {boolean}
   */
  isRightMouseDown = false;

  constructor() {
    window.ui.gameWindow.addEventListener('mousedown', this.#onMouseDown.bind(this), false);
    window.ui.gameWindow.addEventListener('mouseup', this.#onMouseUp.bind(this), false);
    window.ui.gameWindow.addEventListener('mousemove', this.#onMouseMove.bind(this), false);
    window.ui.gameWindow.addEventListener('contextmenu', (event) => event.preventDefault(), false);

    // Touch events
    window.ui.gameWindow.addEventListener('touchstart', this.#onTouchStart.bind(this), { passive: false });
    window.ui.gameWindow.addEventListener('touchmove', this.#onTouchMove.bind(this), { passive: false });
    window.ui.gameWindow.addEventListener('touchend', this.#onTouchEnd.bind(this), { passive: false });
    window.ui.gameWindow.addEventListener('touchcancel', this.#onTouchEnd.bind(this), { passive: false });
  }

  /**
   * Event handler for `mousedown` event
   * @param {MouseEvent} event 
   */
  #onMouseDown(event) {
    if (event.button === 0) {
      this.isLeftMouseDown = true;
    }
    if (event.button === 1) {
      this.isMiddleMouseDown = true;
    }
    if (event.button === 2) {
      this.isRightMouseDown = true;
    }
  }

  /**
   * Event handler for `mouseup` event
   * @param {MouseEvent} event 
   */
  #onMouseUp(event) {
    if (event.button === 0) {
      this.isLeftMouseDown = false;
    }
    if (event.button === 1) {
      this.isMiddleMouseDown = false;
    }
    if (event.button === 2) {
      this.isRightMouseDown = false;
    }
  }

  /**
   * Event handler for 'mousemove' event
   * @param {MouseEvent} event 
   */
  #onMouseMove(event) {
    this.isLeftMouseDown = event.buttons & 1;
    this.isRightMouseDown = event.buttons & 2;
    this.isMiddleMouseDown = event.buttons & 4;
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  /**
   * Event handler for 'touchstart' event
   * @param {TouchEvent} event 
   */
  #onTouchStart(event) {
    // Only handle touch if inside game window
    if (event.touches.length > 0) {
      if (event.touches.length === 1) {
        this.isLeftMouseDown = true;
      } else if (event.touches.length === 2) {
        this.isRightMouseDown = true;
      }
      this.mouse.x = event.touches[0].clientX;
      this.mouse.y = event.touches[0].clientY;
    }
  }

  /**
   * Event handler for 'touchmove' event
   * @param {TouchEvent} event 
   */
  #onTouchMove(event) {
    if (event.touches.length > 0) {
      this.mouse.x = event.touches[0].clientX;
      this.mouse.y = event.touches[0].clientY;
      
      // Prevent scrolling while interacting with the game
      if (event.touches.length <= 2) {
        event.preventDefault();
      }
    }
  }

  /**
   * Event handler for 'touchend' event
   * @param {TouchEvent} event 
   */
  #onTouchEnd(event) {
    if (event.touches.length === 0) {
      this.isLeftMouseDown = false;
      this.isRightMouseDown = false;
    } else if (event.touches.length === 1) {
      // If we went from 2 to 1 touch, stop "right click"
      this.isRightMouseDown = false;
      this.isLeftMouseDown = true;
    }
  }
}