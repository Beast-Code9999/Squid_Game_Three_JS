// client/src/game/tugofwar/TugOfWarScene.js
import * as THREE from 'three'

function createTugOfWarScene() {
    const group = new THREE.Group()
    
    // Platform dimensions
    const platformWidth = 30
    const platformDepth = 20
    const gap = 20
    
    // Left platform
    const leftPlatformGeometry = new THREE.BoxGeometry(platformWidth, 2, platformDepth)
    const leftPlatformMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    const leftPlatform = new THREE.Mesh(leftPlatformGeometry, leftPlatformMaterial)
    leftPlatform.position.set(-gap/2 - platformWidth/2, 0, 0)
    leftPlatform.receiveShadow = true
    leftPlatform.castShadow = true
    group.add(leftPlatform)
    
    // Right platform
    const rightPlatform = new THREE.Mesh(leftPlatformGeometry, leftPlatformMaterial)
    rightPlatform.position.set(gap/2 + platformWidth/2, 0, 0)
    rightPlatform.receiveShadow = true
    rightPlatform.castShadow = true
    group.add(rightPlatform)
    
    // Simple rope for now
    const ropeGeometry = new THREE.CylinderGeometry(0.5, 0.5, gap + platformWidth * 2)
    const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 })
    const rope = new THREE.Mesh(ropeGeometry, ropeMaterial)
    rope.rotation.z = Math.PI / 2
    rope.position.y = 2
    group.add(rope)
    
    return group
}

export { createTugOfWarScene }