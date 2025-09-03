// client/src/main.js
import './style.css';
import * as THREE from 'three';

class Game {
  constructor() {
    // Basic Three.js setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
    
    // Clock for animation
    this.clock = new THREE.Clock();
    
    // Setup the scene
    this.setupLights();
    this.createGround();
    this.createTestCube();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Start animation loop
    this.animate();
  }
  
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }
  
  createGround() {
    // Create a simple ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a9b4a,  // Green grass color
      roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Add grid helper for reference
    const gridHelper = new THREE.GridHelper(50, 50, 0x000000, 0x000000);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }
  
  createTestCube() {
    // Create a test cube to verify everything works
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      metalness: 0.3,
      roughness: 0.4
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.y = 1;
    this.cube.castShadow = true;
    this.scene.add(this.cube);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const delta = this.clock.getDelta();
    
    // Rotate the test cube
    if (this.cube) {
      this.cube.rotation.x += delta * 0.5;
      this.cube.rotation.y += delta * 0.7;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Start the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});