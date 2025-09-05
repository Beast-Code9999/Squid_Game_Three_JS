// client/src/game/doll.js
import * as THREE from 'three'

function Doll() {
    const doll = new THREE.Group()
    
    // Body (large figure)
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(4, 8, 2),
        new THREE.MeshStandardMaterial({ 
            color: 0xffaa00,  // Orange like in the show
            flatShading: true 
        })
    )
    body.position.y = 4
    body.castShadow = true
    doll.add(body)
    
    // Head (distinctive round shape)
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(2, 8, 6),
        new THREE.MeshStandardMaterial({ 
            color: 0xffcc99,  // Skin tone
            flatShading: true 
        })
    )
    head.position.y = 9
    head.castShadow = true
    doll.add(head)
    
    // Face indicator (so we know which way it's facing)
    const face = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1, 0.1),
        new THREE.MeshStandardMaterial({ 
            color: 0x000000  // Black eyes area
        })
    )
    face.position.y = 9
    face.position.z = 1.5  // Front of head
    doll.add(face)
    
    // Hair (pigtails on sides)
    const hairLeft = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 6, 6),
        new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            flatShading: true 
        })
    )
    hairLeft.position.set(-2.2, 9, 0)
    doll.add(hairLeft)
    
    const hairRight = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 6, 6),
        new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            flatShading: true 
        })
    )
    hairRight.position.set(2.2, 9, 0)
    doll.add(hairRight)
    
    return doll
}

export { Doll }