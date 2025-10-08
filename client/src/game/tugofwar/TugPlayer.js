// client/src/game/tugofwar/TugPlayer.js
import * as THREE from 'three'

function createTugPlayer(color, name, side) {
    const group = new THREE.Group()
    
    // Body (bigger)
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 5, 1.5),
        new THREE.MeshStandardMaterial({ color })
    )
    body.position.y = 2.5
    body.castShadow = true
    group.add(body)
    
    // Head (bigger)
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(1, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffcc99 })
    )
    head.position.y = 5.5
    head.castShadow = true
    group.add(head)
    
    // Arms (pulling pose - reaching forward)
    const armGeometry = new THREE.BoxGeometry(0.6, 3, 0.6)
    const armMaterial = new THREE.MeshStandardMaterial({ color })
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.set(-1.5, 3.5, 0)
    leftArm.rotation.z = side === 'left' ? -0.3 : 0.3
    leftArm.rotation.x = 0.5
    leftArm.castShadow = true
    group.add(leftArm)
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.set(1.5, 3.5, 0)
    rightArm.rotation.z = side === 'left' ? -0.3 : 0.3
    rightArm.rotation.x = 0.5
    rightArm.castShadow = true
    group.add(rightArm)
    
    // Legs (bigger)
    const legGeometry = new THREE.BoxGeometry(0.8, 3, 0.8)
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.7, -0.5, 0)
    leftLeg.castShadow = true
    group.add(leftLeg)
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.7, -0.5, 0)
    rightLeg.castShadow = true
    group.add(rightLeg)
    
    group.userData = {
        name,
        color,
        side,
        pullAmount: 0,
        animationTime: 0,
        isWinning: false,
        baseY: 43 // Set default baseY immediately
    }
    
    return group
}

function animateTugPlayer(player, deltaTime, pullStrength = 0) {
    if (!player || !player.userData) return // Safety check
    player.userData.animationTime += deltaTime * 3
    
    // Base pulling animation - lean back
    const baseLean = player.userData.side === 'left' ? -0.2 : 0.2
    
    // Add dynamic lean based on who's winning
    const dynamicLean = pullStrength * 0.3
    
    const pullAngle = Math.sin(player.userData.animationTime) * 0.08
    player.rotation.z = baseLean + dynamicLean + pullAngle
    
    // Bob up and down slightly while pulling - with safe fallback
    const baseY = player.userData.baseY !== undefined ? player.userData.baseY : 43
    player.position.y = baseY + Math.abs(Math.sin(player.userData.animationTime * 1.5)) * 0.15
}

export { createTugPlayer, animateTugPlayer }