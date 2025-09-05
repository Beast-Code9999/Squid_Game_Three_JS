// client/src/core/camera.js
import * as THREE from 'three'

// Creates a perspective camera for the scene
function Camera() {
  // PerspectiveCamera setup:
  //  - 75 = field of view in degrees (pretty standard for FPS view)
  //  - aspect ratio = screen width / screen height
  //  - 0.1 = near clipping plane (objects closer than this aren’t shown)
  //  - 500 = far clipping plane (objects farther than this aren’t shown)
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  )
  
  // Default camera position is (0, 0, 0) looking at -Z.
  // Usually, we’ll move this later in the main scene setup.
  
  return camera
}

// Exporting so the main game file can use this camera
export { Camera }
