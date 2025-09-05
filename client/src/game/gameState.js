// client/src/game/gameState.js
let gameState = {
   phase: 'waiting',  // 'waiting', 'greenLight', 'redLight', 'ended'
   startTime: 0,
   phaseStartTime: 0,
   dollTurning: false,
   lastPlayerPosition: { x: 0, z: 0 },
   eliminated: false,
   won: false
}

// Timing configuration
const timings = {
   greenLightMin: 3000,  // 3 seconds minimum
   greenLightMax: 6000,  // 6 seconds maximum
   redLightDuration: 3000,  // 3 seconds watching
   turnSpeed: 6,  // Fast turn
   gameTimeout: 120000,  // 2 minutes total
}

// Audio reference
let dollAudio = null

function startGame() {
   gameState.phase = 'greenLight'
   gameState.startTime = Date.now()
   gameState.phaseStartTime = Date.now()
   gameState.eliminated = false
   gameState.won = false
   
   console.log("🟢 GREEN LIGHT - GO!")
   scheduleNextTurn()
}

function scheduleNextTurn() {
   if (gameState.phase === 'ended') return
   
   // Random green light duration
   const greenDuration = timings.greenLightMin + 
       Math.random() * (timings.greenLightMax - timings.greenLightMin)
   
   // Schedule the turn
   setTimeout(() => {
       if (gameState.phase === 'greenLight') {
           startRedLight()
       }
   }, greenDuration)
}

function startRedLight() {
   gameState.phase = 'redLight'
   gameState.phaseStartTime = Date.now()
   gameState.dollTurning = true
   
   console.log("🔴 RED LIGHT - FREEZE!")
   
   // Play audio with correct path
   try {
       dollAudio = new Audio('/sounds/doll-song.mp3')
       dollAudio.volume = 0.5
       dollAudio.play()
           .then(() => console.log("Audio playing"))
           .catch(e => console.error("Audio failed to play:", e))
   } catch (error) {
       console.error("Could not load audio:", error)
   }
   
   setTimeout(() => {
       if (gameState.phase === 'redLight') {
           startGreenLight()
       }
   }, timings.redLightDuration)
}

function startGreenLight() {
   // Stop audio if still playing
   if (dollAudio) {
       dollAudio.pause()
       dollAudio.currentTime = 0
   }
   
   gameState.phase = 'greenLight'
   gameState.phaseStartTime = Date.now()
   gameState.dollTurning = true
   
   console.log("🟢 GREEN LIGHT - GO!")
   
   scheduleNextTurn()
}

function checkMovement(currentPosition) {
   // Only check during red light when doll is NOT turning
   if (gameState.phase !== 'redLight' || gameState.dollTurning) {
       // Update position for next check
       gameState.lastPlayerPosition = { 
           x: currentPosition.x, 
           z: currentPosition.z 
       }
       return false
   }
   
   // Check movement distance
   const dx = currentPosition.x - gameState.lastPlayerPosition.x
   const dz = currentPosition.z - gameState.lastPlayerPosition.z
   const distance = Math.sqrt(dx * dx + dz * dz)
   
   // Update for next frame
   gameState.lastPlayerPosition = { 
       x: currentPosition.x, 
       z: currentPosition.z 
   }
   
   // Movement threshold
   const movementThreshold = 0.03
   
   if (distance > movementThreshold) {
       gameState.eliminated = true
       gameState.phase = 'ended'
       
       // Stop audio on elimination
       if (dollAudio) {
           dollAudio.pause()
           dollAudio.currentTime = 0
       }
       
       return true
   }
   
   return false
}

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

function checkWinCondition(playerZ) {
   if (playerZ <= -35 && !gameState.won) {
       gameState.won = true
       gameState.phase = 'ended'
       
       // Stop audio on win
       if (dollAudio) {
           dollAudio.pause()
           dollAudio.currentTime = 0
       }
       
       return true
   }
   return false
}

function checkTimeout() {
   if (Date.now() - gameState.startTime > timings.gameTimeout) {
       gameState.phase = 'ended'
       
       // Stop audio on timeout
       if (dollAudio) {
           dollAudio.pause()
           dollAudio.currentTime = 0
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