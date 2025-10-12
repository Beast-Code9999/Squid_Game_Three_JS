// client/src/game/DollModel.js
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

function DollModel(onLoad) {
    const group = new THREE.Group()
    
    const loader = new GLTFLoader()
    
    // Load the Squid Game doll model
    loader.load(
        '/models/squid_game_doll_red_light_green_light.glb',
        (gltf) => {
            const model = gltf.scene
            
            // Scale
            model.scale.set(17, 17, 17)
            
            // Position
            model.position.y = 8.5
            
            // Enable shadows and BRIGHTEN materials
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                    
                    // Brighten ALL materials significantly
                    if (child.material) {
                        // Make materials brighter overall
                        if (child.material.color) {
                            // Brighten the base color
                            child.material.color.multiplyScalar(1.8)
                        }
                        
                        // Add slight emissive glow to make it pop
                        child.material.emissive = new THREE.Color(0x333333)
                        child.material.emissiveIntensity = 0.2
                        
                        // Adjust material properties for better lighting
                        child.material.roughness = 0.6
                        child.material.metalness = 0
                        
                        child.material.needsUpdate = true
                    }
                }
            })
            
            // STRONGER spotlight from above
            const dollSpotlight = new THREE.SpotLight(0xffffff, 3.5)
            dollSpotlight.position.set(0, 50, 10)
            dollSpotlight.target = model
            dollSpotlight.angle = Math.PI / 3
            dollSpotlight.penumbra = 0.2
            dollSpotlight.decay = 1.5
            dollSpotlight.castShadow = true
            group.add(dollSpotlight)
            
            // BRIGHTER front fill light for face
            const frontLight = new THREE.PointLight(0xffffff, 3)
            frontLight.position.set(0, 20, 25)
            frontLight.decay = 1.5
            group.add(frontLight)
            
            // Add back light for rim lighting effect
            const backLight = new THREE.PointLight(0xffd700, 1.5)
            backLight.position.set(0, 25, -15)
            group.add(backLight)
            
            // Add left and right fill lights
            const leftLight = new THREE.PointLight(0xffffff, 1.5)
            leftLight.position.set(-20, 20, 5)
            group.add(leftLight)
            
            const rightLight = new THREE.PointLight(0xffffff, 1.5)
            rightLight.position.set(20, 20, 5)
            group.add(rightLight)
            
            group.add(model)
            
            // Store the model for animations
            group.userData.model = model
            
            console.log('Doll model loaded successfully!')
            console.log('Doll scale:', model.scale)
            console.log('Doll position:', model.position)
            
            // Call callback when loaded
            if (onLoad) onLoad(group)
        },
        (progress) => {
            // Loading progress
            const percent = (progress.loaded / progress.total * 100).toFixed(0)
            console.log(`Doll loading: ${percent}%`)
        },
        (error) => {
            console.error('Error loading doll model:', error)
        }
    )
    
    return group
}

export { DollModel }