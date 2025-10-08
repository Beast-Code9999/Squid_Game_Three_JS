// client/src/game/playground.js
import * as THREE from 'three'
import { GameConfig } from '../config/gameConfig.js'

function Playground() {
    const group = new THREE.Group()
    
    const textureLoader = new THREE.TextureLoader()
    
    // Load local sand textures
    const sandColor = textureLoader.load('/textures/sand/coast_sand_01_diff_2k.jpg')
    const sandNormal = textureLoader.load('/textures/sand/coast_sand_01_nor_gl_2k.jpg')
    const sandRoughness = textureLoader.load('/textures/sand/coast_sand_01_rough_2k.jpg')
    const sandAO = textureLoader.load('/textures/sand/coast_sand_01_ao_2k.jpg')
    
    // Configure texture tiling
    const textures = [sandColor, sandNormal, sandRoughness, sandAO]
    
    // Calculate repeat based on field size (1 texture = ~10 units in world space)
    const repeatX = GameConfig.field.width / 10
    const repeatY = GameConfig.field.depth / 10
    
    textures.forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(repeatX, repeatY)
        texture.anisotropy = 16  // Better quality at angles
    })
    
    // Create ground with realistic material
    const groundGeometry = new THREE.PlaneGeometry(
        GameConfig.field.width,
        GameConfig.field.depth
    )
    
    const groundMaterial = new THREE.MeshStandardMaterial({
        map: sandColor,
        normalMap: sandNormal,
        roughnessMap: sandRoughness,
        aoMap: sandAO,
        aoMapIntensity: 1.0,
        roughness: 0.9,  // Sand is very rough
        metalness: 0
    })
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    
    // AO map requires a second UV channel
    ground.geometry.setAttribute('uv2', ground.geometry.attributes.uv)
    
    group.add(ground)
    
    // Finish line (glowing yellow stripe)
    const finishLineGeometry = new THREE.PlaneGeometry(
        GameConfig.field.width,
        5
    )
    
    const finishLineMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.4,
        metalness: 0.2,
        roughness: 0.6
    })
    
    const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial)
    finishLine.rotation.x = -Math.PI / 2
    finishLine.position.z = -GameConfig.field.depth * GameConfig.finishLine.zRatio + GameConfig.finishLine.zOffset
    finishLine.position.y = 0.02
    finishLine.receiveShadow = true
    group.add(finishLine)
    
    return group
}

export { Playground }