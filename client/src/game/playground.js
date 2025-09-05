// client/src/game/playground.js
import * as THREE from 'three'

function Playground() {
    const playground = new THREE.Group()
    
    // Main ground - rectangular field
    const groundGeometry = new THREE.PlaneGeometry(60, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd4b896,
        roughness: 0.9
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    playground.add(ground)
    
    
    // Finish line (horizontal line near the doll)
    const lineGeometry = new THREE.PlaneGeometry(60, 1)
    const finishLineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.8
    })
    const finishLine = new THREE.Mesh(lineGeometry, finishLineMaterial)
    finishLine.rotation.x = -Math.PI / 2
    finishLine.position.y = 0.01
    finishLine.position.z = -35
    playground.add(finishLine)
    
    return playground
}

export { Playground }