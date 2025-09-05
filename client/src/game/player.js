import * as THREE from 'three'

function Player() {
    const player = new THREE.Group()
    
    // Body (main part)
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 1.2, 0.4),
        new THREE.MeshStandardMaterial({ 
            color: 0xff6b6b,  // Red/pink color
            flatShading: true 
        })
    )
    body.position.y = 0.8
    body.castShadow = true
    body.receiveShadow = true
    player.add(body)
    
    // Head
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        new THREE.MeshStandardMaterial({ 
            color: 0xfdbcb4,  // Skin tone
            flatShading: true 
        })
    )
    head.position.y = 1.6
    head.castShadow = true
    player.add(head)
    
    // Simple cap/hair
    const cap = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.2, 0.45),
        new THREE.MeshStandardMaterial({ 
            color: 0x333333,  // Dark color
            flatShading: true 
        })
    )
    cap.position.y = 1.85
    cap.castShadow = true
    player.add(cap)
    
    return player
}

export { Player }