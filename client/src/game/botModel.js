// client/src/game/BotModel.js
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

let cachedModel = null
let isLoading = false
let loadCallbacks = []

function BotModel(color, onLoad) {
    const group = new THREE.Group()
    
    // If model is already cached, clone it immediately
    if (cachedModel) {
        const clonedModel = cachedModel.clone()
        setupBotModel(clonedModel, group, color)
        if (onLoad) onLoad(group)
        return group
    }
    
    // If already loading, queue this callback
    if (isLoading) {
        loadCallbacks.push({ group, color, onLoad })
        return group
    }
    
    // Start loading the model
    isLoading = true
    const loader = new GLTFLoader()
    
    loader.load(
        '/models/squid_game_player.glb',
        (gltf) => {
            cachedModel = gltf.scene
            
            // Setup the first bot
            const clonedModel = cachedModel.clone()
            setupBotModel(clonedModel, group, color)
            
            // Process all queued bots
            loadCallbacks.forEach(({ group: qGroup, color: qColor, onLoad: qOnLoad }) => {
                const qClonedModel = cachedModel.clone()
                setupBotModel(qClonedModel, qGroup, qColor)
                if (qOnLoad) qOnLoad(qGroup)
            })
            
            loadCallbacks = []
            isLoading = false
            
            if (onLoad) onLoad(group)
            
            console.log('Bot model loaded and cached')
        },
        undefined,
        (error) => {
            console.error('Error loading bot model:', error)
            isLoading = false
        }
    )
    
    return group
}

function setupBotModel(model, group, color) {
    // Scale appropriately
    model.scale.set(1, 1, 1)
    
    // Enable shadows and apply color
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            
            // Apply team color to clothing
            if (child.material) {
                // Clone material so each bot can have unique color
                child.material = child.material.clone()
                
                // Color the main outfit parts
                if (child.name.includes('Body') || child.name.includes('Shirt') || 
                    child.name.includes('Uniform') || child.name.includes('Clothing')) {
                    child.material.color = new THREE.Color(color)
                }
                
                // Brighten materials slightly
                if (child.material.color) {
                    child.material.color.multiplyScalar(1.2)
                }
                
                child.material.needsUpdate = true
            }
        }
    })
    
    group.add(model)
    group.userData.model = model
}

export { BotModel }