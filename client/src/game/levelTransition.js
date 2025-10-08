// client/src/game/levelTransition.js
import * as THREE from 'three'
import { createTugOfWarScene } from './tugofwar/TugOfWarScene.js'
import { createTypingUI } from './tugofwar/typingUI.js'
import { createTugOfWarInstructions } from '../ui/InstructionsUI.js'
import { createTugReadyUI } from '../ui/TugReadyUI.js'

let sceneElements = []
let originalCameraParent = null
let tugSceneObject = null
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
    // Exit pointer lock
    if (document.pointerLockElement) {
        document.exitPointerLock()
    }
    
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
        scene.add(camera)
    }
    
    // Set camera to look at platforms at the right height
    camera.position.set(0, 45, 70)
    camera.lookAt(0, 42, 0)
    
    // Hide player model
    player.visible = false
    
    // Load Tug of War scene
    tugSceneObject = createTugOfWarScene()
    scene.add(tugSceneObject)
    
    sceneElements = [tugSceneObject]
    
    // DON'T set background/fog here - it's handled in scene.js
    
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