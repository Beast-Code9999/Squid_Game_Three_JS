// client/src/main.js
import './style.css'
import * as THREE from 'three'
import { scene } from './core/scene.js'
import { Renderer } from './core/renderer.js'
import { Camera } from './core/camera.js'
import { Player } from './game/player.js'
import { Playground } from './game/playground.js'
import { keys, setupControls, getMovementVector } from './core/controls.js'
import { Doll } from './game/doll.js'

// Create camera and renderer
const camera = Camera()
const renderer = Renderer()

// Add lights
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

// Add playground
const playground = Playground()
scene.add(playground)

// add doll
const doll = Doll()
doll.position.set(0, 0, -45)  // At the far end, past the finish line
doll.rotation.y = Math.PI  // Face toward players initially
scene.add(doll)

// Create and add player
const player = Player()
player.position.set(0, 0, 40)  // Start at the back (position 0 in your diagram)
scene.add(player)

// Add a marker cube at the origin to see orientation
const marker = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
)
marker.position.set(0, 1, 0)  // At origin, slightly up
scene.add(marker)

// Add another marker at the finish line
const finishMarker = new THREE.Mesh(
    new THREE.BoxGeometry(2, 10, 2),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
finishMarker.position.set(0, 5, -50 + 1)  // At finish line
scene.add(finishMarker)


// Attach camera to player for first-person view
player.add(camera)
camera.position.set(0, 1.6, 0)  // Eye height

// Setup FPS controls - pass camera and player
setupControls(camera, player)

// Movement settings
const moveSpeed = 10  // Units per second
const sprintMultiplier = 1.5

// Time tracking
let previousTime = performance.now()

// Animation loop
function animate() {
    requestAnimationFrame(animate)
    
    const currentTime = performance.now()
    const deltaTime = (currentTime - previousTime) / 1000  // Convert to seconds
    previousTime = currentTime
    
    // Handle movement
    const speed = keys.shift ? moveSpeed * sprintMultiplier : moveSpeed
    const movement = getMovementVector(player, speed, deltaTime)
    player.position.add(movement)
    
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


