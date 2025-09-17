// client/src/main.js
import './style.css'
import * as THREE from 'three'
import { scene } from './core/scene.js'
import { Renderer } from './core/renderer.js'
import { Camera } from './core/camera.js'
import { Player } from './game/player.js'
import { Playground } from './game/playground.js'
import { Doll } from './game/doll.js'
import { keys, setupControls, getMovementVector } from './core/controls.js'
import { 
    gameState, 
    startGame, 
    checkMovement, 
    updateDoll,
    checkWinCondition,
    checkTimeout
} from './game/gameState.js'
import { TimerDisplay, updateTimerDisplay } from './game/timer.js'
import { GameConfig } from './config/gameConfig.js'
import { applyHeadBob } from './core/controls.js'
import { Walls } from './game/walls.js'
import { checkBoundaries } from './game/boundaries.js'
import { GameUI3D } from './ui/gameUI3D.js'

let popup = null


// Create camera and renderer
const camera = Camera()
const renderer = Renderer()

// add walsl
// Add walls
const walls = Walls()
scene.add(walls)

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
player.position.set(0, 0, GameConfig.field.depth * GameConfig.player.startZRatio - 5)
scene.add(player)

// Create and add doll
const doll = Doll()
doll.position.set(0, 0, -GameConfig.field.depth * GameConfig.doll.zRatio - 40)
doll.rotation.y = Math.PI
scene.add(doll)

// add timer
const timer = TimerDisplay()
timer.position.set(0, 10, -GameConfig.field.depth * GameConfig.timer.zRatio - 65)
scene.add(timer)

// Create a rig (empty Object3D) that holds the camera
const cameraRig = new THREE.Object3D()
player.add(cameraRig)
cameraRig.position.set(0, 1.6, 0) // eye level
cameraRig.add(camera)
camera.position.set(0, 0, 0) // reset camera local pos


// create the UI
const gameUI = new GameUI3D(scene, camera)


// // Attach camera to player
// player.add(camera)
// camera.position.set(0, 1.6, 0)

// Setup FPS controls
setupControls(camera, player)

// Movement settings
const moveSpeed = 50
const sprintMultiplier = 1.4

// // Start game after delay
// setTimeout(() => {
//     startGame()
// }, 2000)


// Time tracking
let previousTime = performance.now()

// Show start panel initially
gameUI.showStartPanel()

const startListener = (e) => {
  if (e.code === 'Space' || keys.w || keys.a || keys.s || keys.d) {
    gameUI.hideStartPanel()
    window.removeEventListener('keydown', startListener)
    startGame()
  }
}

window.addEventListener('keydown', startListener)

// Animation loop
function animate() {
    requestAnimationFrame(animate)
    
    const currentTime = performance.now()
    const deltaTime = (currentTime - previousTime) / 1000
    previousTime = currentTime
    
    // Update doll rotation
    updateDoll(doll, deltaTime)

    // check for movement
    if (gameState.phase === 'waiting') {
        const isMoving = keys.w || keys.a || keys.s || keys.d
        if (isMoving) {
            startGame()
            gameState.startTime = Date.now() // start the timer
            console.log("🏁 Game started!")
        }
    }

    if (gameState.phase !== 'waiting' && gameState.phase !== 'ended') {
        const timeElapsed = (Date.now() - gameState.startTime) / 1000
        const timeRemaining = Math.max(0, 45 - timeElapsed) // 60 second time
        updateTimerDisplay(timer, timeRemaining)

        if (timeRemaining <= 0 && gameState.phase !== 'ended') {
            gameState.phase = 'ended'
            gameState.won = false
            gameState.eliminated = false
        }
    }
    
    // Handle movement only if game is active
    if (gameState.phase !== 'ended' && gameState.phase !== 'waiting') {
        const speed = keys.shift ? moveSpeed * sprintMultiplier : moveSpeed
        const movement = getMovementVector(player, speed, deltaTime)
        player.position.add(movement)

        const isMoving = keys.w || keys.a || keys.s || keys.d
        const isRunning = keys.shift
        applyHeadBob(camera, isMoving, isRunning, deltaTime)

        // Calculate new position
        const newPosition = {
            x: player.position.x + movement.x,
            y: player.position.y + movement.y,
            z: player.position.z + movement.z
        }
        
        // Apply boundary checking - THIS IS WHERE IT HAPPENS
        const clampedPosition = checkBoundaries(newPosition, walls.userData.boundaries)
        player.position.set(clampedPosition.x, clampedPosition.y, clampedPosition.z)

        
        // Check for illegal movement
        if (checkMovement(player.position)) {
            console.log("ELIMINATED! You moved during red light!")
        }
        
        // Check win condition
        if (checkWinCondition(player.position.z)) {
            console.log("YOU WIN! Reached the finish line!")
        }
        
        // Check timeout
        if (checkTimeout()) {
            console.log("TIME'S UP! Game Over!")
        }
    }
    
    // Visual feedback for game state
    if (gameState.phase === 'ended') {
        if (gameState.won) {
            // Win state - golden sky
            scene.background = new THREE.Color(0xffd700)
            scene.fog = new THREE.Fog(0xffd700, 50, 200)
        } else if (gameState.eliminated) {
            // Death state - dark red sky
            scene.background = new THREE.Color(0x8b0000)
            scene.fog = new THREE.Fog(0x8b0000, 30, 150)
        } else {
            // Timeout - gray sky
            scene.background = new THREE.Color(0x666666)
            scene.fog = new THREE.Fog(0x666666, 50, 200)
        }
    } else if (gameState.phase === 'redLight' && !gameState.dollTurning) {
        // Red light - must be frozen
        scene.background = new THREE.Color(0xffaaaa)
        scene.fog = new THREE.Fog(0xffaaaa, 80, 300)
    } else if (gameState.phase === 'greenLight' && !gameState.dollTurning) {
        // Green light - can move
        scene.background = new THREE.Color(0x87CEEB)
        scene.fog = new THREE.Fog(0x87CEEB, 100, 500)
    } else {
        // Turning phase - neutral
        scene.background = new THREE.Color(0xddddaa)
        scene.fog = new THREE.Fog(0xddddaa, 90, 400)
    }
    
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