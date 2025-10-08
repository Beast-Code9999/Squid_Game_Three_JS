// client/src/game/tugofwar/TugOfWarScene.js
import * as THREE from 'three'

function createTugOfWarScene() {
    const group = new THREE.Group()
    
    // Platform dimensions
    const platformWidth = 30
    const platformDepth = 20
    const platformHeight = 40 // Show how high up they are
    const gap = 30
    
    // Store platform height for player positioning
    group.userData.platformHeight = platformHeight
    
    // Left platform (cold steel/concrete)
    const leftPlatformGeometry = new THREE.BoxGeometry(platformWidth, 2, platformDepth)
    const leftPlatformMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x555555,
        metalness: 0.6,
        roughness: 0.4
    })
    const leftPlatform = new THREE.Mesh(leftPlatformGeometry, leftPlatformMaterial)
    leftPlatform.position.set(-gap/2 - platformWidth/2, platformHeight, 0)
    leftPlatform.receiveShadow = true
    leftPlatform.castShadow = true
    group.add(leftPlatform)
    
    // Right platform (cold steel/concrete)
    const rightPlatformMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x555555,
        metalness: 0.6,
        roughness: 0.4
    })
    const rightPlatform = new THREE.Mesh(leftPlatformGeometry, rightPlatformMaterial)
    rightPlatform.position.set(gap/2 + platformWidth/2, platformHeight, 0)
    rightPlatform.receiveShadow = true
    rightPlatform.castShadow = true
    group.add(rightPlatform)
    
    // Metal scaffolding frames
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        metalness: 0.8,
        roughness: 0.3
    })
    
    // Left platform support beams
    for (let i = 0; i < 4; i++) {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(1, platformHeight, 1),
            frameMaterial
        )
        const xOffset = i < 2 ? -platformWidth/2 + 2 : platformWidth/2 - 2
        const zOffset = i % 2 === 0 ? -platformDepth/2 + 2 : platformDepth/2 - 2
        beam.position.set(-gap/2 - platformWidth/2 + xOffset, platformHeight/2, zOffset)
        beam.castShadow = true
        group.add(beam)
    }
    
    // Right platform support beams
    for (let i = 0; i < 4; i++) {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(1, platformHeight, 1),
            frameMaterial
        )
        const xOffset = i < 2 ? -platformWidth/2 + 2 : platformWidth/2 - 2
        const zOffset = i % 2 === 0 ? -platformDepth/2 + 2 : platformDepth/2 - 2
        beam.position.set(gap/2 + platformWidth/2 + xOffset, platformHeight/2, zOffset)
        beam.castShadow = true
        group.add(beam)
    }
    
    // Cross beams for stability (left)
    const crossBeamGeo = new THREE.BoxGeometry(platformWidth, 0.5, 0.5)
    for (let i = 1; i < 4; i++) {
        const crossBeam = new THREE.Mesh(crossBeamGeo, frameMaterial)
        crossBeam.position.set(-gap/2 - platformWidth/2, (platformHeight / 4) * i, 0)
        group.add(crossBeam)
    }
    
    // Cross beams (right)
    for (let i = 1; i < 4; i++) {
        const crossBeam = new THREE.Mesh(crossBeamGeo, frameMaterial)
        crossBeam.position.set(gap/2 + platformWidth/2, (platformHeight / 4) * i, 0)
        group.add(crossBeam)
    }
    
    // Deep dark abyss below
    const abyssGeometry = new THREE.BoxGeometry(gap + platformWidth * 2, 20, platformDepth + 20)
    const abyssMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000,
        emissive: 0x000000
    })
    const abyss = new THREE.Mesh(abyssGeometry, abyssMaterial)
    abyss.position.y = -10
    abyss.receiveShadow = true
    group.add(abyss)
    
    // Rope (worn, frayed look)
    const ropeGeometry = new THREE.CylinderGeometry(0.3, 0.3, gap + platformWidth * 2)
    const ropeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x6b5d4f,
        roughness: 0.9
    })
    const rope = new THREE.Mesh(ropeGeometry, ropeMaterial)
    rope.rotation.z = Math.PI / 2
    rope.position.y = platformHeight + 3
    rope.castShadow = true
    group.add(rope)
    
    group.userData.rope = rope
    
    // Dark ground far below (barely visible)
    const groundGeometry = new THREE.PlaneGeometry(200, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        roughness: 1
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -20
    ground.receiveShadow = true
    group.add(ground)
    
    // Spotlights on platforms (harsh lighting)
    const spotlightLeft = new THREE.SpotLight(0xffffff, 1.5)
    spotlightLeft.position.set(-gap/2 - platformWidth/2, platformHeight + 20, 0)
    spotlightLeft.target.position.set(-gap/2 - platformWidth/2, platformHeight, 0)
    spotlightLeft.angle = 0.3
    spotlightLeft.penumbra = 0.2
    spotlightLeft.castShadow = true
    group.add(spotlightLeft)
    group.add(spotlightLeft.target)
    
    const spotlightRight = new THREE.SpotLight(0xffffff, 1.5)
    spotlightRight.position.set(gap/2 + platformWidth/2, platformHeight + 20, 0)
    spotlightRight.target.position.set(gap/2 + platformWidth/2, platformHeight, 0)
    spotlightRight.angle = 0.3
    spotlightRight.penumbra = 0.2
    spotlightRight.castShadow = true
    group.add(spotlightRight)
    group.add(spotlightRight.target)
    
    return group
}

export { createTugOfWarScene }