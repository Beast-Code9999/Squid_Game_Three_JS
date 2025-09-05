// client/src/game/playground.js
import * as THREE from 'three'

function Playground() {
    const playground = new THREE.Group()
    
    // Main ground - sandy beige color from the show
    const groundGeometry = new THREE.PlaneGeometry(100, 200)
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd4b896,  // Sandy beige like in the image
        roughness: 0.9
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    playground.add(ground)
    
    // Pink/Red line down the middle (along Z axis)
    const centerLineGeometry = new THREE.PlaneGeometry(0.5, 200)
    const centerLineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff1493,  // Deep pink/magenta
        roughness: 0.8
    })
    const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial)
    centerLine.rotation.x = -Math.PI / 2
    centerLine.position.y = 0.01
    playground.add(centerLine)
    
    // Finish line (RED) - horizontal line in FRONT of players
    const lineGeometry = new THREE.PlaneGeometry(100, 1)
    const finishLineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.8
    })
    const finishLine = new THREE.Mesh(lineGeometry, finishLineMaterial)
    finishLine.rotation.x = -Math.PI / 2
    finishLine.position.y = 0.01
    finishLine.position.z = -90  // Far in front (negative Z)
    playground.add(finishLine)
    
    return playground
}

export { Playground }