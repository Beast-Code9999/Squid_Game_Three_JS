// client/src/main.js
import './style.css'
import * as THREE from 'three'
import { scene } from './core/scene.js'
import { Renderer } from './core/renderer.js'
import { Camera } from './core/camera.js'
import { Playground } from './game/playground.js'
import { Player } from './game/player.js'

// Create camera and renderer
const camera = Camera()
const renderer = Renderer()

// Add lights (same as before)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(50, 100, 50)
directionalLight.castShadow = true
directionalLight.shadow.camera.left = -100
directionalLight.shadow.camera.right = 100
directionalLight.shadow.camera.top = 100
directionalLight.shadow.camera.bottom = -100
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
scene.add(directionalLight)

// Add ground
const groundGeometry = new THREE.PlaneGeometry(100, 100)
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a9b4a,
    roughness: 0.8
})

// add Playground into the scene
const playground = Playground()
scene.add(playground)

// Create and add player
const player = Player()
player.position.z = 85  // Start at the back
player.position.x = 0   // Center on the pink line
player.rotation.y = 0  // Rotate 90 degrees to face forward
scene.add(player)

// Camera attached to player
player.add(camera)
camera.position.set(0, 1.6, 0)  // Eye height

// Animation loop
function animate() {
    requestAnimationFrame(animate)
    
    renderer.render(scene, camera)
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

// Start animation
animate()