// client/src/main.js
import './style.css'
import * as THREE from 'three'
import { scene } from './core/scene.js'
import { Renderer } from './core/renderer.js'
import { Camera } from './core/camera.js'
import { Player } from './game/player.js'
import { Playground } from './game/playground.js'
import { keys, setupControls, getMovementVector } from './core/controls.js'

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

// Create and add player
const player = Player()
player.position.set(0, 0, 85)  // Start at the back
scene.add(player)

// Temporary reference cube to see movement
const refGeometry = new THREE.BoxGeometry(2, 2, 2)
const refMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
const refCube = new THREE.Mesh(refGeometry, refMaterial)
refCube.position.set(0, 1, 70)  // Place it ahead of starting position
scene.add(refCube)

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


