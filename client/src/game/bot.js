// client/src/game/bot.js
import * as THREE from 'three'
import { GameConfig } from '../config/gameConfig.js'

function Bot(name = 'Bot', speedMultiplier = 1.2) {
    const bot = new THREE.Object3D()
    bot.name = name

    const geometry = new THREE.BoxGeometry(2, 4, 2)
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    bot.add(mesh)

    bot.position.set(
        (Math.random() - 0.5) * GameConfig.field.width * 0.8,
        0,
        GameConfig.field.depth * 0.5 - Math.random() * 10
    )

    bot.userData = {
        speed: 4 * speedMultiplier,
        finished: false,
        eliminated: false,
        mistakeChance: 0.05
    }

    return bot
}

function updateBot(bot, deltaTime, finishZ, gameState) {
    if (bot.userData.finished || bot.userData.eliminated) return

    if (gameState.phase === 'greenLight') {
        const randomSpeed = bot.userData.speed * (0.8 + Math.random() * 0.4)
        bot.position.z -= randomSpeed * deltaTime
    } else if (gameState.phase === 'redLight' && !gameState.dollTurning) {
        if (Math.random() < bot.userData.mistakeChance) {
            const mistakeSpeed = bot.userData.speed * 0.5
            bot.position.z -= mistakeSpeed * deltaTime
        }
    }

    if (bot.position.z <= finishZ) {
        bot.userData.finished = true
        console.log(`${bot.name} finished the race!`)
    }
}

export { Bot, updateBot }
