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
import { Bot, updateBot } from './game/bot.js'
import { NetworkManager } from './networking/NetworkManager.js'
import { MultiplayerPlayer } from './game/MultiplayerPlayer.js'
import { createReadyUI } from './ui/ReadyUI.js'

// Create camera and renderer
const camera = Camera()
const renderer = Renderer()

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

// Network setup
const networkManager = new NetworkManager()
networkManager.connect()

// Store network players
const networkPlayers = new Map()

// Position sync variables
let lastSentPosition = { x: 0, y: 0, z: 0 }
let lastSentRotation = { x: 0, y: 0, z: 0 }
const POSITION_THRESHOLD = 0.1

// Ready system
const readyUI = createReadyUI()
let isReady = false
let gameStartedFromNetwork = false

// Create and add doll
const doll = Doll()
doll.position.set(0, 0, -GameConfig.field.depth * GameConfig.doll.zRatio - 40)
doll.rotation.y = Math.PI
scene.add(doll)

// Add timer
const timer = TimerDisplay()
timer.position.set(0, 10, -GameConfig.field.depth * GameConfig.timer.zRatio - 65)
scene.add(timer)

// Create camera rig
const cameraRig = new THREE.Object3D()
player.add(cameraRig)
cameraRig.position.set(0, 1.6, 0)
cameraRig.add(camera)
camera.position.set(0, 0, 0)

// Create the UI
const gameUI = new GameUI3D(scene, camera)

// Setup FPS controls
setupControls(camera, player)

// Movement settings
const moveSpeed = 4
const sprintMultiplier = 1.2

// Time tracking
let previousTime = performance.now()

// Hide start panel for multiplayer (using ready system instead)
// gameUI.showStartPanel()

// Setup ready button
readyUI.readyButton.addEventListener('click', () => {
  isReady = !isReady
  
  if (isReady) {
    networkManager.sendReady()
    readyUI.readyButton.textContent = 'NOT READY'
    readyUI.readyButton.style.background = '#ff6b6b'
  } else {
    networkManager.sendNotReady()
    readyUI.readyButton.textContent = 'READY'
    readyUI.readyButton.style.background = '#4ecdc4'
  }
})

// Setup network callbacks
networkManager.onReadyUpdate = (data) => {
  readyUI.readyStatus.textContent = `${data.totalReady}/${data.totalPlayers} players ready`
  
  if (data.totalPlayers < 2) {
    readyUI.readyStatus.textContent += ' (Need at least 2 players)'
  }
}

networkManager.onCountdown = (count) => {
  if (count > 0) {
    readyUI.countdownDisplay.style.display = 'block'
    readyUI.countdownDisplay.textContent = count
    readyUI.countdownDisplay.style.animation = 'none'
    setTimeout(() => {
      readyUI.countdownDisplay.style.animation = 'pulse 1s ease-in-out'
    }, 10)
    readyUI.container.style.display = 'none'
  } else {
    readyUI.countdownDisplay.textContent = 'GO!'
    setTimeout(() => {
      readyUI.countdownDisplay.style.display = 'none'
    }, 500)
  }
}

networkManager.onGameStart = (data) => {
  gameUI.hideStartPanel()
  readyUI.container.style.display = 'none'
  
  // Start game for everyone at the same time
  gameStartedFromNetwork = true
  startGame()
  // Use server's synchronized start time
  gameState.startTime = data.startTime
}

// Create bots
const bots = []
for (let i = 0; i < 15; i++) {
    const bot = Bot(`Bot ${i+1}`, 1 + Math.random() * 0.5)
    scene.add(bot)
    bots.push(bot)
}

// Animation loop
function animate() {
    requestAnimationFrame(animate)
    
    const currentTime = performance.now()
    const deltaTime = (currentTime - previousTime) / 1000
    previousTime = currentTime
    
    // Update doll rotation
    updateDoll(doll, deltaTime)

    // Update each bot
    const finishZ = -GameConfig.field.depth * GameConfig.finishLine.zRatio + GameConfig.finishLine.zOffset
    bots.forEach(bot => {
        updateBot(bot, deltaTime, finishZ, gameState)
    })

    // Update network players
    networkManager.players.forEach((playerData, playerId) => {
        if (!networkPlayers.has(playerId)) {
            // Create new player mesh
            const newPlayer = MultiplayerPlayer(playerData.name)
            newPlayer.position.set(
                playerData.position.x,
                playerData.position.y,
                playerData.position.z
            )
            scene.add(newPlayer)
            networkPlayers.set(playerId, newPlayer)
        } else {
            // Update existing player position with smoothing
            const playerMesh = networkPlayers.get(playerId)
            playerMesh.position.lerp(
                new THREE.Vector3(
                    playerData.position.x,
                    playerData.position.y,
                    playerData.position.z
                ),
                0.1  // Smoothing factor
            )
            
            if (playerData.rotation) {
                playerMesh.rotation.y = playerData.rotation.y
            }
            
            // Hide eliminated players
            if (playerData.eliminated) {
                playerMesh.visible = false
            }
        }
    })

    // Remove disconnected players
    networkPlayers.forEach((playerMesh, playerId) => {
        if (!networkManager.players.has(playerId)) {
            scene.remove(playerMesh)
            networkPlayers.delete(playerId)
        }
    })

    // Don't allow movement-based game start anymore
    // Game only starts from synchronized network signal

    // Update timer
    if (gameState.phase !== 'waiting' && gameState.phase !== 'ended') {
        const timeElapsed = (Date.now() - gameState.startTime) / 1000
        const timeRemaining = Math.max(0, 45 - timeElapsed)
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

        // Calculate new position
        const newPosition = {
            x: player.position.x + movement.x,
            y: player.position.y + movement.y,
            z: player.position.z + movement.z
        }
        
        // Apply boundary checking
        const clampedPosition = checkBoundaries(newPosition, walls.userData.boundaries)
        player.position.set(clampedPosition.x, clampedPosition.y, clampedPosition.z)

        const isMoving = keys.w || keys.a || keys.s || keys.d
        const isRunning = keys.shift
        applyHeadBob(camera, isMoving, isRunning, deltaTime)

        // Send position to server if changed
        const positionChanged = 
            Math.abs(player.position.x - lastSentPosition.x) > POSITION_THRESHOLD ||
            Math.abs(player.position.y - lastSentPosition.y) > POSITION_THRESHOLD ||
            Math.abs(player.position.z - lastSentPosition.z) > POSITION_THRESHOLD
        
        if (positionChanged) {
            networkManager.sendPosition(
                { x: player.position.x, y: player.position.y, z: player.position.z },
                { x: player.rotation.x, y: player.rotation.y, z: player.rotation.z }
            )
            lastSentPosition = { ...player.position }
            lastSentRotation = { ...player.rotation }
        }
        
        // Check for illegal movement
        if (checkMovement(player.position)) {
            networkManager.sendEliminated()
        }
        
        // Check win condition
        checkWinCondition(player.position.z)
        
        // Check timeout
        checkTimeout()
    }
    
    // Visual feedback for game state
    if (gameState.phase === 'ended') {
        if (gameState.won) {
            scene.background = new THREE.Color(0xffd700)
            scene.fog = new THREE.Fog(0xffd700, 50, 200)
        } else if (gameState.eliminated) {
            scene.background = new THREE.Color(0x8b0000)
            scene.fog = new THREE.Fog(0x8b0000, 30, 150)
        } else {
            scene.background = new THREE.Color(0x666666)
            scene.fog = new THREE.Fog(0x666666, 50, 200)
        }
    } else if (gameState.phase === 'redLight' && !gameState.dollTurning) {
        scene.background = new THREE.Color(0xffaaaa)
        scene.fog = new THREE.Fog(0xffaaaa, 80, 300)
    } else if (gameState.phase === 'greenLight' && !gameState.dollTurning) {
        scene.background = new THREE.Color(0x87CEEB)
        scene.fog = new THREE.Fog(0x87CEEB, 100, 500)
    } else {
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