import { GameConfig } from '../config/gameConfig.js'
// client/src/game/gameState.js

// Central state of the game
let gameState = {
   phase: 'waiting',          // Current phase: 'waiting', 'greenLight', 'redLight', 'ended'
   startTime: 0,              // Game start timestamp
   phaseStartTime: 0,         // Current phase start timestamp
   dollTurning: false,        // True while doll is rotating
   lastPlayerPosition: { x: 0, z: 0 }, // Track last player position
   eliminated: false,         // True if player is caught moving
   won: false,                // True if player wins
   roundNumber: 0             // Current round count (used for difficulty scaling)
}

// Timing configuration for lights, audio, and game length
const timings = {
   redLightDuration: 3000,    // Base red light duration (ms)
   turnSpeed: 6,              // Speed of doll rotation
   gameTimeout: 120000,       // Max game duration (ms)
   initialAudioSpeed: 0.8,    // Starting song playback speed
   speedIncrement: 0.25       // Unused here, but intended increment per round
}

// Audio reference for doll’s song
let dollAudio = null

// Start a new game session
function startGame() {
   gameState.phase = 'greenLight'
   gameState.startTime = Date.now()
   gameState.phaseStartTime = Date.now()
   gameState.eliminated = false
   gameState.won = false
   gameState.roundNumber = 0

   // Start first song quickly after 1 second
   setTimeout(() => {
       if (gameState.phase === 'greenLight') {
           playSongAndTurn()
       }
   }, 50)
}

// Schedule the next doll song after a random wait
function scheduleNextSong() {
   if (gameState.phase === 'ended') return

   // Decrease wait time as rounds progress, min 500ms
   const baseWait = 1500
   const waitReduction = Math.min(gameState.roundNumber * 150, 1000)
   const waitTime = Math.max(500, baseWait - waitReduction + Math.random() * 500)

   setTimeout(() => {
       if (gameState.phase === 'greenLight') {
           playSongAndTurn()
       }
   }, waitTime)
}

// Play the doll’s song, then switch to red light when it ends
function playSongAndTurn() {
   // Exponentially increase playback speed with rounds
   const playbackRate = timings.initialAudioSpeed * Math.pow(1.3, gameState.roundNumber)

   try {
       dollAudio = new Audio('/sounds/doll-song.mp3')
       dollAudio.volume = 0.5
       dollAudio.playbackRate = Math.min(3.0, Math.max(0.5, playbackRate))

       // When the song finishes, trigger red light
       dollAudio.addEventListener('ended', () => {
           startRedLight()
       })

       // If audio fails, fallback to red light after 2s
       dollAudio.addEventListener('error', () => {
           setTimeout(() => startRedLight(), 2000)
       })

       dollAudio.play().catch(() => {
           setTimeout(() => startRedLight(), 2000)
       })
   } catch {
       setTimeout(() => startRedLight(), 2000)
   }
}

// Switch to red light phase
function startRedLight() {
   gameState.phase = 'redLight'
   gameState.phaseStartTime = Date.now()
   gameState.dollTurning = true
   gameState.roundNumber++  // Increase round difficulty

   // Red light duration shortens each round (min 1.5s)
   const redDuration = Math.max(1500, timings.redLightDuration - (gameState.roundNumber * 100))

   setTimeout(() => {
       if (gameState.phase === 'redLight') {
           startGreenLight()
       }
   }, redDuration)
}

// Switch back to green light phase
function startGreenLight() {
   gameState.phase = 'greenLight'
   gameState.phaseStartTime = Date.now()
   gameState.dollTurning = true
   scheduleNextSong()
}

// Check if player moved illegally during red light
function checkMovement(currentPosition) {
   // Always allowed during green light
   if (gameState.phase === 'greenLight') {
       gameState.lastPlayerPosition = { x: currentPosition.x, z: currentPosition.z }
       return false
   }

   // During red light, check if doll has finished turning
   if (gameState.phase === 'redLight' && !gameState.dollTurning) {
       const dx = currentPosition.x - gameState.lastPlayerPosition.x
       const dz = currentPosition.z - gameState.lastPlayerPosition.z
       const distance = Math.sqrt(dx * dx + dz * dz)

       gameState.lastPlayerPosition = { x: currentPosition.x, z: currentPosition.z }

       const movementThreshold = 0.03

       if (distance > movementThreshold) {
           // Player caught moving → eliminated
           gameState.eliminated = true
           gameState.phase = 'ended'
           if (dollAudio) {
               dollAudio.pause()
               dollAudio = null
           }
           return true
       }
   } else {
       // Just update position tracking
       gameState.lastPlayerPosition = { x: currentPosition.x, z: currentPosition.z }
   }

   return false
}

// Smoothly rotate doll depending on phase
function updateDoll(doll, deltaTime) {
   if (!gameState.dollTurning) return

   const targetRotation = gameState.phase === 'greenLight' ? Math.PI : 0
   const currentRotation = doll.rotation.y
   const diff = targetRotation - currentRotation

   if (Math.abs(diff) > 0.01) {
       doll.rotation.y += diff * timings.turnSpeed * deltaTime
   } else {
       doll.rotation.y = targetRotation
       gameState.dollTurning = false
   }
}

// Check if player has crossed finish line
function checkWinCondition(playerZ) {
   const finishZ = -GameConfig.field.depth * GameConfig.finishLine.zRatio
   if (playerZ <= finishZ && !gameState.won) {
       gameState.won = true
       gameState.phase = 'ended'
       if (dollAudio) {
           dollAudio.pause()
           dollAudio = null
       }
       return true
   }
   return false
}

// Check if the game timed out
function checkTimeout() {
   if (Date.now() - gameState.startTime > timings.gameTimeout) {
       gameState.phase = 'ended'
       if (dollAudio) {
           dollAudio.pause()
           dollAudio = null
       }
       return true
   }
   return false
}

export { 
   gameState, 
   startGame, 
   checkMovement, 
   updateDoll, 
   checkWinCondition,
   checkTimeout
}
