// client/src/game/bot.js
import * as THREE from 'three'
import { BotModel } from './BotModel.js'
import { GameConfig } from '../config/gameConfig.js'

function Bot(name, speedMultiplier = 1) {
    // Random vibrant colors for variety
    const colors = [0x4ecdc4, 0xff6b6b, 0xffe66d, 0x95e1d3, 0xf38181, 0xaa96da, 0x6a89cc, 0xff9ff3]
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    const bot = new THREE.Group()
    
    bot.userData.name = name
    bot.userData.speedMultiplier = speedMultiplier
    bot.userData.isMoving = false
    bot.userData.eliminated = false
    bot.userData.animationTime = Math.random() * Math.PI * 2
    bot.userData.modelLoaded = false
    
    // Random starting position
    const startX = (Math.random() - 0.5) * (GameConfig.field.width - 20)
    const startZ = GameConfig.field.depth * GameConfig.player.startZRatio + (Math.random() - 0.5) * 20
    
    bot.position.set(startX, 0, startZ)
    
    // Load the 3D model
    BotModel(color, (loadedModel) => {
        // Rotate model to face forward (toward doll/finish line)
        loadedModel.rotation.y = Math.PI // 180 degrees turn
        
        bot.add(loadedModel)
        bot.userData.modelLoaded = true
        bot.userData.modelGroup = loadedModel
        
        // Store references to body parts for animation
        const model = loadedModel.userData.model
        bot.userData.parts = {
            leftArm: null,
            rightArm: null,
            leftLeg: null,
            rightLeg: null,
            leftForearm: null,
            rightForearm: null,
            leftShin: null,
            rightShin: null,
            spine: null,
            hips: null
        }
        
        // Find and store body part references
        model.traverse((child) => {
            const name = child.name.toLowerCase()
            
            // Arms
            if (name.includes('upperarm') || name.includes('arm_l') || name.includes('leftarm')) {
                if (name.includes('left') || name.includes('_l')) {
                    bot.userData.parts.leftArm = child
                }
            }
            if (name.includes('upperarm') || name.includes('arm_r') || name.includes('rightarm')) {
                if (name.includes('right') || name.includes('_r')) {
                    bot.userData.parts.rightArm = child
                }
            }
            
            // Forearms
            if (name.includes('forearm') || name.includes('lowerarm')) {
                if (name.includes('left') || name.includes('_l')) {
                    bot.userData.parts.leftForearm = child
                } else if (name.includes('right') || name.includes('_r')) {
                    bot.userData.parts.rightForearm = child
                }
            }
            
            // Legs (thighs)
            if (name.includes('upleg') || name.includes('thigh') || name.includes('leg_l') || name.includes('leftleg')) {
                if (name.includes('left') || name.includes('_l')) {
                    bot.userData.parts.leftLeg = child
                }
            }
            if (name.includes('upleg') || name.includes('thigh') || name.includes('leg_r') || name.includes('rightleg')) {
                if (name.includes('right') || name.includes('_r')) {
                    bot.userData.parts.rightLeg = child
                }
            }
            
            // Shins (lower legs)
            if (name.includes('lowleg') || name.includes('shin') || name.includes('calf')) {
                if (name.includes('left') || name.includes('_l')) {
                    bot.userData.parts.leftShin = child
                } else if (name.includes('right') || name.includes('_r')) {
                    bot.userData.parts.rightShin = child
                }
            }
            
            // Spine/Torso
            if (name.includes('spine') || name.includes('chest') || name.includes('torso')) {
                bot.userData.parts.spine = child
            }
            
            // Hips
            if (name.includes('hip') || name.includes('pelvis')) {
                bot.userData.parts.hips = child
            }
        })
        
        console.log('Bot parts found:', bot.userData.parts)
    })
    
    return bot
}

function updateBot(bot, deltaTime, finishZ, gameState) {
    if (bot.userData.eliminated || gameState.phase === 'ended') return
    if (!bot.userData.modelLoaded) return
    
    const parts = bot.userData.parts
    const model = bot.userData.modelGroup
    
    if (gameState.phase === 'greenLight' && !gameState.dollTurning) {
        bot.userData.isMoving = true
        const speed = 7 * bot.userData.speedMultiplier
        bot.position.z -= speed * deltaTime
        
        // Increase animation time for running
        bot.userData.animationTime += deltaTime * 8
        
        // RUNNING ANIMATION
        const runCycle = bot.userData.animationTime
        const armSwing = Math.sin(runCycle) * 0.8
        const legSwing = Math.sin(runCycle) * 1.2
    
        
        // Arms swing (opposite to legs)
        if (parts.leftArm) {
            parts.leftArm.rotation.x = armSwing
        }
        if (parts.rightArm) {
            parts.rightArm.rotation.x = -armSwing
        }
        
        // Forearms bend slightly
        if (parts.leftForearm) {
            parts.leftForearm.rotation.x = -0.5 + Math.abs(armSwing) * 0.3
        }
        if (parts.rightForearm) {
            parts.rightForearm.rotation.x = -0.5 + Math.abs(-armSwing) * 0.3
        }
        
        // Legs swing
        if (parts.leftLeg) {
            parts.leftLeg.rotation.x = -legSwing
        }
        if (parts.rightLeg) {
            parts.rightLeg.rotation.x = legSwing
        }
        
        // Shins bend when leg is back
        if (parts.leftShin) {
            parts.leftShin.rotation.x = Math.min(0, legSwing) * 1.5
        }
        if (parts.rightShin) {
            parts.rightShin.rotation.x = Math.min(0, -legSwing) * 1.5
        }
        
        // Body movement
        if (model && model.userData.model) {
            const actualModel = model.userData.model
            
            // Vertical bob while running
            actualModel.position.y = Math.abs(Math.sin(runCycle * 2)) * 0.15
            
            // Slight forward lean
            if (parts.spine) {
                parts.spine.rotation.x = 0.15
            }
            
            // Slight side-to-side rotation
            if (parts.hips) {
                parts.hips.rotation.y = Math.sin(runCycle) * 0.1
            }
        }
        
        // Check if reached finish
        if (bot.position.z <= finishZ) {
            bot.userData.eliminated = true
        }
        
    } else if (gameState.phase === 'redLight' && !gameState.dollTurning) {
        if (bot.userData.isMoving) {
            const catchChance = 0.3 + (0.4 * bot.userData.speedMultiplier)
            if (Math.random() < catchChance * deltaTime) {
                bot.userData.eliminated = true
                // Fall over
                bot.rotation.x = Math.PI / 2
            }
        }
        bot.userData.isMoving = false
        
        // FREEZE - smoothly return to standing pose
        if (parts.leftArm) parts.leftArm.rotation.x *= 0.85
        if (parts.rightArm) parts.rightArm.rotation.x *= 0.85
        if (parts.leftLeg) parts.leftLeg.rotation.x *= 0.85
        if (parts.rightLeg) parts.rightLeg.rotation.x *= 0.85
        if (parts.leftForearm) parts.leftForearm.rotation.x *= 0.85
        if (parts.rightForearm) parts.rightForearm.rotation.x *= 0.85
        if (parts.leftShin) parts.leftShin.rotation.x *= 0.85
        if (parts.rightShin) parts.rightShin.rotation.x *= 0.85
        
        if (model && model.userData.model) {
            const actualModel = model.userData.model
            actualModel.position.y *= 0.85
            
            if (parts.spine) parts.spine.rotation.x *= 0.85
            if (parts.hips) parts.hips.rotation.y *= 0.85
        }
    }
    
    // Fade out eliminated bots
    if (bot.userData.eliminated) {
        bot.traverse((child) => {
            if (child.material) {
                if (!child.material.transparent) {
                    child.material.transparent = true
                    child.material.opacity = 1
                }
                child.material.opacity = Math.max(0, child.material.opacity - deltaTime * 0.5)
            }
        })
    }
}

export { Bot, updateBot }