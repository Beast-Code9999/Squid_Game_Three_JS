// client/src/game/levelTransition.js
import * as THREE from 'three'
import { createTugOfWarScene } from './tugofwar/TugOfWarScene.js'
import { createTypingUI } from './tugofwar/typingUI.js'
import { createTugOfWarInstructions } from '../ui/InstructionsUI.js'
import { createTugReadyUI } from '../ui/TugReadyUI.js'

let sceneElements = []
let originalCameraParent = null
let tugScene = null
let hasShownTugInstructions = false
let hasCreatedTugUI = false

function clearRLGLElements(scene, walls, playground, doll, timer, bots) {
    scene.remove(walls)
    scene.remove(playground)
    scene.remove(doll)
    scene.remove(timer)
    
    bots.forEach(bot => {
        scene.remove(bot)
    })
}

async function transitionToTugOfWar(scene, player, walls, playground, doll, timer, bots, camera, networkManager) {
    // Prevent duplicate UI creation
    if (hasCreatedTugUI) {
        console.log('Tug of War UI already created, skipping...')
        return
    }
    
    // Clear RLGL elements
    clearRLGLElements(scene, walls, playground, doll, timer, bots)
    
    // Detach camera from player for fixed view
    originalCameraParent = camera.parent
    if (originalCameraParent) {
        originalCameraParent.remove(camera)
    }
    
    // Set fixed camera position looking at the platforms
    camera.position.set(0, 35, 30)
    camera.lookAt(0, 0, 0)
    
    // Hide player model
    player.visible = false
    
    // Load Tug of War scene
    tugScene = createTugOfWarScene()
    scene.add(tugScene)
    
    sceneElements = [tugScene]
    
    // Change scene atmosphere
    scene.background = new THREE.Color(0x333333)
    scene.fog = new THREE.Fog(0x333333, 10, 100)
    
    // Show instructions only once
    if (!hasShownTugInstructions) {
        await createTugOfWarInstructions()
        hasShownTugInstructions = true
    }
    
    // Create typing UI (pass networkManager) but don't start yet
    createTypingUI((result) => {
        console.log('Typing complete!', result)
    }, networkManager)
    
    // Create ready system only once
    const tugReadyUI = createTugReadyUI()
    let isTugReady = false
    
    tugReadyUI.readyButton.addEventListener('click', () => {
        isTugReady = !isTugReady
        
        if (isTugReady) {
            networkManager.sendTugReady()
            tugReadyUI.readyButton.textContent = 'NOT READY'
            tugReadyUI.readyButton.style.background = '#ff6b6b'
        } else {
            networkManager.sendTugNotReady()
            tugReadyUI.readyButton.textContent = 'READY TO TYPE'
            tugReadyUI.readyButton.style.background = '#4ecdc4'
        }
    })
    
    hasCreatedTugUI = true
    console.log('Waiting for race to start from server...')
}

export { transitionToTugOfWar, clearRLGLElements }