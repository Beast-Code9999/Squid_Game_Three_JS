// client/src/core/controls.js - Complete rewrite for FPS controls
import * as THREE from 'three'

// Object to keep track of pressed keys
// (true = pressed, false = not pressed)
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false
}

// Euler is used for handling 3D rotations (yaw, pitch, roll)
let euler = new THREE.Euler(0, 0, 0, 'YXZ')

// We'll store references to the camera and player container
let pitchObject = null // Controls up/down look
let yawObject = null   // Controls left/right look

// Enable pointer lock (so mouse stays captured in the game window)
function setupPointerLock() {
    const canvas = document.getElementById('game')
    
    // Clicking the canvas requests pointer lock
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock()
    })
    
    // Listen for pointer lock changes
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            // If locked, enable mouse movement
            document.addEventListener('mousemove', onMouseMove)
        } else {
            // If unlocked, disable mouse movement
            document.removeEventListener('mousemove', onMouseMove)
        }
    })
}

// Handle mouse movement to rotate the camera/player
function onMouseMove(event) {
    if (!pitchObject || !yawObject) return
    
    // Get movement deltas from mouse
    const movementX = event.movementX || 0
    const movementY = event.movementY || 0
    
    // Rotate player left/right (yaw)
    yawObject.rotation.y -= movementX * 0.002
    // Rotate camera up/down (pitch)
    pitchObject.rotation.x -= movementY * 0.002
    
    // Clamp pitch so the player can't flip upside down
    pitchObject.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitchObject.rotation.x))
}

// Setup keyboard and mouse controls
function setupControls(camera, player) {
    // Setup pointer lock
    setupPointerLock()
    
    // Save references for mouse look
    pitchObject = camera
    yawObject = player
    
    // Key pressed
    window.addEventListener('keydown', (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': keys.w = true; break
            case 'a': keys.a = true; break
            case 's': keys.s = true; break
            case 'd': keys.d = true; break
            case 'shift': keys.shift = true; break
        }
    })
    
    // Key released
    window.addEventListener('keyup', (e) => {
        switch(e.key.toLowerCase()) {
            case 'w': keys.w = false; break
            case 'a': keys.a = false; break
            case 's': keys.s = false; break
            case 'd': keys.d = false; break
            case 'shift': keys.shift = false; break
        }
    })
}

// Calculate player movement vector based on keys + direction
function getMovementVector(player, speed, deltaTime) {
    const movement = new THREE.Vector3()
    const forward = new THREE.Vector3(0, 0, -1) // Forward direction
    const right = new THREE.Vector3(1, 0, 0)    // Right direction
    
    // Rotate directions to match player's orientation
    forward.applyQuaternion(player.quaternion)
    right.applyQuaternion(player.quaternion)
    
    // Keep movement on the ground (ignore vertical tilt)
    forward.y = 0
    right.y = 0
    forward.normalize()
    right.normalize()
    
    // Move based on keys pressed
    if (keys.w) movement.add(forward) // Move forward
    if (keys.s) movement.sub(forward) // Move backward
    if (keys.d) movement.add(right)   // Move right
    if (keys.a) movement.sub(right)   // Move left
    
    // If moving, normalize so diagonal isn’t faster,
    // then apply speed and deltaTime for smooth movement
    if (movement.length() > 0) {
        movement.normalize()
        movement.multiplyScalar(speed * deltaTime)
    }
    
    return movement
}

// Export so other files can use these
export { keys, setupControls, getMovementVector }
