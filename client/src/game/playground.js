// client/src/game/playground.js
import * as THREE from 'three'
import { GameConfig } from '../config/gameConfig.js'

function Playground() {
    const playground = new THREE.Group()
    
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(GameConfig.field.width, GameConfig.field.depth)
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xd4b896,
        roughness: 0.9
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    playground.add(ground)
    
    // Finish line
    const lineGeometry = new THREE.PlaneGeometry(GameConfig.field.width, 1)
    const finishLineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff0000,
        roughness: 0.8
    })
    const finishLine = new THREE.Mesh(lineGeometry, finishLineMaterial)
    finishLine.rotation.x = -Math.PI / 2
    finishLine.position.y = 0.01
    finishLine.position.z = -GameConfig.field.depth * GameConfig.finishLine.zRatio
    playground.add(finishLine)
    
    return playground
}

export { Playground }
