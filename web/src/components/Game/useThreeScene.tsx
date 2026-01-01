import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AssetManager } from '../../scripts/assets/assetManager';
import { City } from '../../scripts/sim/city';
import { CameraManager } from '../../scripts/camera';
import { InputManager } from '../../scripts/input';

// Mock window.ui for compatibility
const mockUI = {
  gameWindow: null as HTMLDivElement | null,
  hideLoadingText: () => {},
  isPaused: false,
  updateTitleBar: () => {},
  updateInfoPanel: () => {},
  activeToolId: 'select',
};

export function useThreeScene(containerRef: React.RefObject<HTMLDivElement>) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraManagerRef = useRef<CameraManager | null>(null);
  const cityRef = useRef<City | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    mockUI.gameWindow = container;
    
    // Ensure container has dimensions
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      container.style.width = '100%';
      container.style.height = '100%';
    }

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup window.ui for compatibility (must be before CameraManager)
    (window as any).ui = mockUI;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup camera manager (needs window.ui)
    const cameraManager = new CameraManager();
    cameraManagerRef.current = cameraManager;

    // Setup input manager
    const inputManager = new InputManager(container);
    inputManagerRef.current = inputManager;

    // Setup lights
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(-10, 20, 0);
    sun.castShadow = true;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 50;
    sun.shadow.normalBias = 0.01;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    let simulateInterval: NodeJS.Timeout | null = null;

    // Load assets and create city
    (window as any).assetManager = new AssetManager(() => {
      setIsLoading(false);
      const city = new City(16);
      cityRef.current = city;
      scene.clear();
      scene.add(sun);
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      scene.add(city);
      
      // Setup grid
      const gridMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        map: (window as any).assetManager.textures['grid'],
        transparent: true,
        opacity: 0.2
      });
      gridMaterial.map.repeat = new THREE.Vector2(city.size, city.size);
      gridMaterial.map.wrapS = city.size;
      gridMaterial.map.wrapT = city.size;

      const grid = new THREE.Mesh(
        new THREE.BoxGeometry(city.size, 0.1, city.size),
        gridMaterial
      );
      grid.position.set(city.size / 2 - 0.5, -0.04, city.size / 2 - 0.5);
      scene.add(grid);

      // Start simulation
      simulateInterval = setInterval(() => {
        if (!mockUI.isPaused && city) {
          city.simulate(1);
        }
      }, 1000);
    });

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (cityRef.current) {
        cityRef.current.draw();
      }
      renderer.render(scene, cameraManager.camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container || !cameraManager || !renderer) return;
      cameraManager.resize();
      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (simulateInterval) {
        clearInterval(simulateInterval);
      }
      if (rendererRef.current && container) {
        try {
          container.removeChild(rendererRef.current.domElement);
        } catch (e) {
          // Element already removed
        }
      }
      rendererRef.current?.dispose();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraManagerRef.current = null;
      cityRef.current = null;
    };
  }, [containerRef]);

  return {
    scene: sceneRef.current,
    renderer: rendererRef.current,
    camera: cameraManagerRef.current?.camera || null,
    city: cityRef.current,
    isLoading,
  };
}

