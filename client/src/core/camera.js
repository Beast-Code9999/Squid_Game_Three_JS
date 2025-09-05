// client/src/core/camera.js
import * as THREE from 'three'

function Camera() {
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  )
  
  
  return camera
}

export { Camera }