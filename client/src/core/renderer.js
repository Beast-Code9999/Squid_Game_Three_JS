import * as THREE from 'three';

function Renderer() {
  const canvas = document.getElementById('game');
  
  // WebGL renderer tied to the canvas
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true, // smoother edges
    alpha: true      // transparent background support
  });
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // avoid high-DPI lag
  renderer.setSize(window.innerWidth, window.innerHeight);      // match window size
  renderer.shadowMap.enabled = true;                            // enable shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;             // softer shadows
  
  return renderer;
}

export { Renderer };
