// client/src/game/gameState.js
import { GameConfig } from '../config/gameConfig.js'

let gameState = {
    phase: 'waiting',
    startTime: 0,
    phaseStartTime: 0,
    dollTurning: false,
    turnStartTime: 0,
    turnDuration: 1.5,
    lastPlayerPosition: { x: 0, z: 0 },
    eliminated: false,
    won: false,
    roundNumber: 0
}

const timings = {
    redLightDuration: 3000,
    turnSpeed: 6,
    gameTimeout: 120000,
    initialAudioSpeed: 0.8,
    speedIncrement: 0.25
}

let dollAudio = null

function startGame() {
    gameState.phase = 'greenLight'
    gameState.startTime = Date.now()
    gameState.phaseStartTime = Date.now()
    gameState.eliminated = false
    gameState.won = false
    gameState.roundNumber = 0

    setTimeout(() => {
        if (gameState.phase === 'greenLight') {
            playSongAndTurn()
        }
    }, 50)
}

function scheduleNextSong() {
    if (gameState.phase === 'ended') return

    const baseWait = 1500
    const waitReduction = Math.min(gameState.roundNumber * 150, 1000)
    const waitTime = Math.max(500, baseWait - waitReduction + Math.random() * 500)

    setTimeout(() => {
        if (gameState.phase === 'greenLight') {
            playSongAndTurn()
        }
    }, waitTime)
}

function playSongAndTurn() {
    const playbackRate = timings.initialAudioSpeed * Math.pow(1.3, gameState.roundNumber)

    try {
        dollAudio = new Audio('/sounds/doll-song.mp3')
        dollAudio.volume = 0.5
        dollAudio.playbackRate = Math.min(3.0, Math.max(0.5, playbackRate))

        dollAudio.addEventListener('ended', () => {
            startRedLight()
        })

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

function startRedLight() {
    gameState.phase = 'redLight'
    gameState.phaseStartTime = Date.now()
    gameState.dollTurning = true
    gameState.turnStartTime = Date.now()
    gameState.roundNumber++

    const redDuration = Math.max(1500, timings.redLightDuration - (gameState.roundNumber * 100))

    setTimeout(() => {
        if (gameState.phase === 'redLight') {
            startGreenLight()
        }
    }, redDuration)
}

function startGreenLight() {
    gameState.phase = 'greenLight'
    gameState.phaseStartTime = Date.now()
    gameState.dollTurning = true
    gameState.turnStartTime = Date.now()
    scheduleNextSong()
}

function checkMovement(currentPosition) {
    if (gameState.phase === 'greenLight') {
        gameState.lastPlayerPosition = { x: currentPosition.x, z: currentPosition.z }
        return false
    }

    if (gameState.phase === 'redLight' && !gameState.dollTurning) {
        const dx = currentPosition.x - gameState.lastPlayerPosition.x
        const dz = currentPosition.z - gameState.lastPlayerPosition.z
        const distance = Math.sqrt(dx * dx + dz * dz)

        gameState.lastPlayerPosition = { x: currentPosition.x, z: currentPosition.z }

        const movementThreshold = 0.03

        if (distance > movementThreshold) {
            gameState.eliminated = true
            gameState.phase = 'ended'
            if (dollAudio) {
                dollAudio.pause()
                dollAudio = null
            }
            return true
        }
    } else {
        gameState.lastPlayerPosition = { x: currentPosition.x, z: currentPosition.z }
    }

    return false
}

function updateDoll(doll, deltaTime) {
    if (!doll || !doll.userData.model) return
    
    const model = doll.userData.model
    
    if (gameState.dollTurning) {
        const elapsed = (Date.now() - gameState.turnStartTime) / 1000
        const progress = Math.min(elapsed / gameState.turnDuration, 1)
        
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2
        
        const startRotation = gameState.phase === 'redLight' ? 0 : Math.PI
        const endRotation = gameState.phase === 'redLight' ? Math.PI : 0
        
        model.rotation.y = startRotation + (endRotation - startRotation) * easeProgress
        
        if (progress >= 1) {
            gameState.dollTurning = false
        }
    }
}

function checkWinCondition(playerZ) {
    const finishZ = -GameConfig.field.depth * GameConfig.finishLine.zRatio + GameConfig.finishLine.zOffset
    const buffer = 1.5

    if (playerZ <= finishZ - buffer && !gameState.won) {
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

function resetGame() {
    gameState.phase = 'waiting'
    gameState.startTime = 0
    gameState.phaseStartTime = 0
    gameState.dollTurning = false
    gameState.turnStartTime = 0
    gameState.lastPlayerPosition = { x: 0, z: 0 }
    gameState.eliminated = false
    gameState.won = false
    gameState.roundNumber = 0
    
    if (dollAudio) {
        dollAudio.pause()
        dollAudio = null
    }
}

export { 
    gameState, 
    startGame, 
    resetGame,
    checkMovement, 
    updateDoll, 
    checkWinCondition,
    checkTimeout
}