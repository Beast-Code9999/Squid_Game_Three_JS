// client/src/main.js
import './style.css'
import * as THREE from 'three'
import { scene } from './core/scene.js'
import { Renderer } from './core/renderer.js'
import { Camera } from './core/camera.js'
import { Player } from './game/player.js'
import { Playground } from './game/playground.js'
import { DollModel } from './game/DollModel.js'
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
import { transitionToTugOfWar } from './game/levelTransition.js'
import { createRLGLInstructions } from './ui/InstructionsUI.js'
import { removeTugReadyUI } from './ui/TugReadyUI.js'
import { createTugPlayer, animateTugPlayer } from './game/tugofwar/TugPlayer.js'
import { createProgressUI, updateProgressUI, setPlayerNames, removeProgressUI } from './game/tugofwar/ProgressUI.js'
import { createRLGLDefeatedUI, createRLGLVictoryUI } from './ui/RLGLEndGameUI.js'

// Create camera and renderer
const camera = Camera()
const renderer = Renderer()

// Current level tracking
let currentLevel = 'rlgl'
window.currentLevel = currentLevel

// Tug of War state
let tugPlayers = {
    left: null,
    right: null
}
let tugScene = null
let localPlayerProgress = 0
let opponentProgress = 0

// Add walls
const walls = Walls()
scene.add(walls)

// Add lights - IMPROVED LIGHTING SYSTEM
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xfff4e6, 1.2)
sunLight.position.set(100, 150, 50)
sunLight.castShadow = true

sunLight.shadow.mapSize.width = 4096
sunLight.shadow.mapSize.height = 4096
sunLight.shadow.camera.left = -150
sunLight.shadow.camera.right = 150
sunLight.shadow.camera.top = 150
sunLight.shadow.camera.bottom = -150
sunLight.shadow.camera.near = 0.5
sunLight.shadow.camera.far = 500
sunLight.shadow.bias = -0.0001
scene.add(sunLight)

const fillLight = new THREE.DirectionalLight(0x87CEEB, 0.4)
fillLight.position.set(-80, 100, -50)
fillLight.castShadow = false
scene.add(fillLight)

const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0xd4a574, 0.5)
hemiLight.position.set(0, 50, 0)
scene.add(hemiLight)

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

// Track if local player finished RLGL
let localPlayerFinishedRLGL = false

// RLGL Completion tracking
networkManager.onWaitForPlayers = (data) => {
    console.log(`Waiting... ${data.completed}/${data.total} players finished`)
    showWaitingOverlay(data.completed, data.total)
}

networkManager.onRLGLCompletionUpdate = (data) => {
    console.log(`Progress: ${data.completed}/${data.total} players finished`)
    updateWaitingOverlay(data.completed, data.total)
}

networkManager.onAllPlayersReadyTug = () => {
    console.log('All players finished! Transitioning to Tug of War...')
    hideWaitingOverlay()
    
    setTimeout(() => {
        currentLevel = 'tug'
        window.currentLevel = 'tug'
        
        import('./core/scene.js').then(sceneModule => {
            sceneModule.setupTugScene()
        })
        
        transitionToTugOfWar(scene, player, walls, playground, doll, timer, bots, camera, networkManager)
        
        setTimeout(() => {
            const sceneChildren = scene.children
            tugScene = null
            
            for (let i = sceneChildren.length - 1; i >= 0; i--) {
                if (sceneChildren[i].userData && sceneChildren[i].userData.rope) {
                    tugScene = sceneChildren[i]
                    break
                }
            }
            
            if (!tugScene) {
                console.error('Could not find tug scene!')
                return
            }
            
            const platformHeight = tugScene.userData.platformHeight || 40
            const platformThickness = 2
            const platformTopY = platformHeight + (platformThickness / 2)
            const playerY = platformTopY + 2
            
            if (!tugPlayers.left) {
                tugPlayers.left = createTugPlayer(0x4ecdc4, 'You', 'left')
                tugPlayers.left.userData.baseY = playerY
                tugPlayers.left.position.set(-40, playerY, 0)
                scene.add(tugPlayers.left)
            }
            
            if (!tugPlayers.right) {
                const opponents = Array.from(networkManager.players.values()).filter(p => !p.eliminated)
                const opponentName = opponents.length > 0 ? opponents[0].name : 'Opponent'
                
                tugPlayers.right = createTugPlayer(0xff6b6b, opponentName, 'right')
                tugPlayers.right.userData.baseY = playerY
                tugPlayers.right.position.set(40, playerY, 0)
                scene.add(tugPlayers.right)
                
                createProgressUI()
                setPlayerNames('You', opponentName)
            }
        }, 200)
    }, 1000)
}

// Tug of War network callbacks
networkManager.onTugRaceStart = (data) => {
    console.log('Race starting with paragraph index:', data.paragraphIndex)
    
    import('./game/tugofwar/paragraphs.js').then(module => {
        const paragraphs = module.tugOfWarParagraphs || []
        const paragraph = paragraphs[data.paragraphIndex]
        
        if (paragraph) {
            window.tugParagraph = paragraph
            console.log('Paragraph loaded, waiting for all players to ready up...')
        } else {
            console.error('Paragraph not found at index:', data.paragraphIndex)
        }
    })
}

networkManager.onRaceProgress = (data) => {
    console.log(`Player ${data.playerId} is at ${data.percentage.toFixed(1)}%`)
    
    opponentProgress = data.percentage
    updateProgressUI(localPlayerProgress, opponentProgress)
}

networkManager.onPlayerFinished = (data) => {
    console.log(`${data.name} finished in place ${data.place}!`)
}

networkManager.onTugRaceEnd = (data) => {
    console.log('Race ended! Winner:', data.winner.name)
    
    const isWinner = data.winner.playerId === networkManager.playerId
    
    animateWinnerPullLoser(isWinner)
    
    setTimeout(() => {
        import('./game/tugofwar/EndGameUI.js').then(ui => {
            const loserData = {
                name: isWinner ? 
                    (Array.from(networkManager.players.values())[0]?.name || 'Opponent') : 
                    'You',
                playerId: isWinner ? data.winner.playerId : networkManager.playerId
            }
            
            ui.createEndGameUI(
                isWinner,
                data.winner,
                loserData,
                {
                    eliminatedCount: data.eliminatedCount || 0
                }
            )
        })
        
        removeProgressUI()
    }, 3500)
}

networkManager.onTugReadyUpdate = (data) => {
    const tugStatus = document.getElementById('tug-ready-status')
    if (tugStatus) {
        tugStatus.textContent = `${data.ready}/${data.total} players ready`
    }
}

networkManager.onTugTypingStart = () => {
    console.log('All players ready! Starting typing race...')
    
    removeTugReadyUI()
    
    if (window.tugParagraph) {
        setTimeout(() => {
            import('./game/tugofwar/typingUI.js').then(ui => {
                ui.startTyping(window.tugParagraph)
            })
        }, 1000)
    }
}

const networkPlayers = new Map()
let lastSentPosition = { x: 0, y: 0, z: 0 }
let lastSentRotation = { x: 0, y: 0, z: 0 }
const POSITION_THRESHOLD = 0.1

const readyUI = createReadyUI()
let isReady = false
let gameStartedFromNetwork = false
let hasShownInstructions = false

// Create doll with async loading
const doll = new THREE.Group()
doll.position.set(0, 0, -GameConfig.field.depth * GameConfig.doll.zRatio - 40)
doll.rotation.y = Math.PI
scene.add(doll)

DollModel((loadedDollGroup) => {
    const model = loadedDollGroup.userData.model
    doll.add(model)
    doll.userData.model = model
    console.log('✅ Doll integrated into scene')
})

const timer = TimerDisplay()
timer.position.set(0, 10, -GameConfig.field.depth * GameConfig.timer.zRatio - 65)
scene.add(timer)

const cameraRig = new THREE.Object3D()
player.add(cameraRig)
cameraRig.position.set(0, 1.6, 0)
cameraRig.add(camera)
camera.position.set(0, 0, 0)

const gameUI = new GameUI3D(scene, camera)

setupControls(camera, player)

const moveSpeed = 70.5
const sprintMultiplier = 1.2
let previousTime = performance.now()

createRLGLInstructions().then(() => {
    hasShownInstructions = true
})

readyUI.readyButton.addEventListener('click', () => {
    if (!hasShownInstructions) return
    
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
    
    gameStartedFromNetwork = true
    startGame()
    gameState.startTime = data.startTime
}

const bots = []
for (let i = 0; i < 15; i++) {
    const bot = Bot(`Bot ${i+1}`, 1 + Math.random() * 0.5)
    scene.add(bot)
    bots.push(bot)
}

function animateWinnerPullLoser(isWinner) {
    const winner = isWinner ? tugPlayers.left : tugPlayers.right
    const loser = isWinner ? tugPlayers.right : tugPlayers.left
    const rope = tugScene ? tugScene.userData.rope : null
    
    if (!winner || !loser) return
    
    const platformHeight = tugScene && tugScene.userData.platformHeight ? tugScene.userData.platformHeight : 40
    const baseY = winner.userData.baseY || 43
    
    let animationProgress = 0
    const animationDuration = 3
    
    const animateInterval = setInterval(() => {
        animationProgress += 0.016
        const progress = Math.min(animationProgress / animationDuration, 1)
        
        const targetX = 0
        loser.position.x += (targetX - loser.position.x) * 0.05
        
        if (rope) {
            const ropeTarget = isWinner ? -10 : 10
            rope.position.x += (ropeTarget - rope.position.x) * 0.05
        }
        
        loser.rotation.z = progress * (isWinner ? -1.5 : 1.5)
        loser.position.y = Math.max(-20, baseY - progress * 63)
        
        winner.rotation.z = (isWinner ? -0.5 : 0.5) * (1 + progress * 0.5)
        
        if (progress >= 1) {
            clearInterval(animateInterval)
        }
    }, 16)
}

function animate() {
    requestAnimationFrame(animate)
    
    const currentTime = performance.now()
    const deltaTime = (currentTime - previousTime) / 1000
    previousTime = currentTime
    
    if (currentLevel === 'rlgl') {
        updateDoll(doll, deltaTime)
        
        const finishZ = -GameConfig.field.depth * GameConfig.finishLine.zRatio + GameConfig.finishLine.zOffset
        bots.forEach(bot => {
            updateBot(bot, deltaTime, finishZ, gameState)
        })
    }
    
    if (currentLevel === 'rlgl') {
        networkManager.players.forEach((playerData, playerId) => {
            if (!networkPlayers.has(playerId)) {
                const newPlayer = MultiplayerPlayer(playerData.name)
                newPlayer.position.set(
                    playerData.position.x,
                    playerData.position.y,
                    playerData.position.z
                )
                scene.add(newPlayer)
                networkPlayers.set(playerId, newPlayer)
            } else {
                const playerMesh = networkPlayers.get(playerId)
                playerMesh.position.lerp(
                    new THREE.Vector3(
                        playerData.position.x,
                        playerData.position.y,
                        playerData.position.z
                    ),
                    0.1
                )
                
                if (playerData.rotation) {
                    playerMesh.rotation.y = playerData.rotation.y
                }
                
                if (playerData.eliminated) {
                    playerMesh.visible = false
                }
            }
        })
        
        networkPlayers.forEach((playerMesh, playerId) => {
            if (!networkManager.players.has(playerId)) {
                scene.remove(playerMesh)
                networkPlayers.delete(playerId)
            }
        })
    } else if (currentLevel === 'tug') {
        networkPlayers.forEach((playerMesh) => {
            playerMesh.visible = false
        })
        
        if (tugPlayers.left && tugPlayers.right && tugScene && 
            tugPlayers.left.userData.baseY !== undefined && 
            tugPlayers.right.userData.baseY !== undefined) {
            
            const pullDifference = localPlayerProgress - opponentProgress
            const normalizedPull = Math.max(-1, Math.min(1, pullDifference / 50))
            
            animateTugPlayer(tugPlayers.left, deltaTime, normalizedPull)
            animateTugPlayer(tugPlayers.right, deltaTime, -normalizedPull)
            
            if (tugScene.userData.rope) {
                const rope = tugScene.userData.rope
                const targetX = normalizedPull * 5
                rope.position.x += (targetX - rope.position.x) * 0.1
            }
        }
    }
    
    if (currentLevel === 'rlgl' && gameState.phase !== 'ended' && gameState.phase !== 'waiting' && gameState.phase !== 'waiting-for-players') {
        const timeElapsed = (Date.now() - gameState.startTime) / 1000
        const timeRemaining = Math.max(0, 45 - timeElapsed)
        updateTimerDisplay(timer, timeRemaining)
        
        if (timeRemaining <= 0 && gameState.phase !== 'ended') {
            gameState.phase = 'ended'
            gameState.won = false
            gameState.eliminated = false
            
            // Show defeated popup for timeout
            createRLGLDefeatedUI()
        }
    }
    
    if (currentLevel === 'rlgl' && gameState.phase !== 'ended' && gameState.phase !== 'waiting' && gameState.phase !== 'waiting-for-players') {
        const speed = keys.shift ? moveSpeed * sprintMultiplier : moveSpeed
        const movement = getMovementVector(player, speed, deltaTime)
        
        const newPosition = {
            x: player.position.x + movement.x,
            y: player.position.y + movement.y,
            z: player.position.z + movement.z
        }
        
        const clampedPosition = checkBoundaries(newPosition, walls.userData.boundaries)
        player.position.set(clampedPosition.x, clampedPosition.y, clampedPosition.z)
        
        const isMoving = keys.w || keys.a || keys.s || keys.d
        const isRunning = keys.shift
        applyHeadBob(camera, isMoving, isRunning, deltaTime)
        
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
        
        // Check if player moved during red light
        if (checkMovement(player.position)) {
            networkManager.sendEliminated()
            
            // Show defeated popup immediately
            createRLGLDefeatedUI()
        }
        
        // Check if player reached finish line
        if (checkWinCondition(player.position.z)) {
            networkManager.sendLevelComplete('rlgl')
            gameState.phase = 'waiting-for-players'
            localPlayerFinishedRLGL = true
            console.log('Finished RLGL! Waiting for other players...')
            
            // Show victory popup
            createRLGLVictoryUI()
        }
        
        checkTimeout()
    }
    
    renderer.render(scene, camera)
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

window.addEventListener('keydown', (e) => {
    if (e.key === 'T') {
        currentLevel = 'tug'
        window.currentLevel = 'tug'
        transitionToTugOfWar(scene, player, walls, playground, doll, timer, bots, camera, networkManager)
    }
})

let waitingOverlay = null

function showWaitingOverlay(completed, total) {
    if (waitingOverlay) return
    
    waitingOverlay = document.createElement('div')
    waitingOverlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 40px 60px;
        border-radius: 15px;
        color: white;
        font-family: monospace;
        text-align: center;
        z-index: 1000;
        border: 3px solid #4ecdc4;
    `
    
    waitingOverlay.innerHTML = `
        <h2 style="margin: 0 0 20px 0; font-size: 32px; color: #4ecdc4;">You Finished!</h2>
        <p style="margin: 0; font-size: 20px;">Waiting for other players...</p>
        <p id="waiting-count" style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold;">${completed}/${total} completed</p>
    `
    
    document.body.appendChild(waitingOverlay)
}

function updateWaitingOverlay(completed, total) {
    const countElement = document.getElementById('waiting-count')
    if (countElement) {
        countElement.textContent = `${completed}/${total} completed`
    }
}

function hideWaitingOverlay() {
    if (waitingOverlay && waitingOverlay.parentNode) {
        waitingOverlay.parentNode.removeChild(waitingOverlay)
        waitingOverlay = null
    }
}

animate()

window.updateTugProgress = (localProgress) => {
    localPlayerProgress = localProgress
    updateProgressUI(localPlayerProgress, opponentProgress)
}