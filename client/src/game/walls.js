// client/src/game/walls.js
import * as THREE from 'three'
import { GameConfig } from '../config/gameConfig.js'

function Walls() {
    const walls = new THREE.Group()
    
    const wallHeight = 20
    const wallThickness = 1
    
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcc9966,
        roughness: 0.9,
        side: THREE.DoubleSide
    })
    
    // Left wall
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, GameConfig.field.depth)
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial)
    leftWall.position.set(-GameConfig.field.width/2, wallHeight/2, 0)
    leftWall.castShadow = true
    leftWall.receiveShadow = true
    walls.add(leftWall)
    
    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial)
    rightWall.position.set(GameConfig.field.width/2, wallHeight/2, 0)
    rightWall.castShadow = true
    rightWall.receiveShadow = true
    walls.add(rightWall)
    
    // Back wall (behind players)
    const backWallGeometry = new THREE.BoxGeometry(GameConfig.field.width, wallHeight, wallThickness)
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial)
    backWall.position.set(0, wallHeight/2, GameConfig.field.depth/2)
    backWall.castShadow = true
    backWall.receiveShadow = true
    walls.add(backWall)

    // Front wall (near the doll) - one continuous wall
    const frontWallGeometry = new THREE.BoxGeometry(GameConfig.field.width, wallHeight, wallThickness)
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial)
    frontWall.position.set(0, wallHeight/2, -GameConfig.field.depth/2)
    frontWall.castShadow = true
    frontWall.receiveShadow = true
    walls.add(frontWall)
    
    // Store boundaries for collision detection
    walls.userData = {
        boundaries: {
            minX: -GameConfig.field.width/2 + 2,
            maxX: GameConfig.field.width/2 - 2,
            minZ: -GameConfig.field.depth/2 + 2,
            maxZ: GameConfig.field.depth/2 - 2
        }
    }
    
    return walls
}

export { Walls }