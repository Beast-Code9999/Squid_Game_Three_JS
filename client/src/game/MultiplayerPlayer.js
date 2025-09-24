import * as THREE from 'three'

function MultiplayerPlayer(name) {
    const player = new THREE.Group()
    
    // Same body as local player but different color
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 1.2, 0.4),
        new THREE.MeshStandardMaterial({ 
            color: 0x00ff00,  // Green for other players
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
            color: 0xfdbcb4,
            flatShading: true 
        })
    )
    head.position.y = 1.6
    head.castShadow = true
    player.add(head)
    
    // Name label (using sprite)
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const context = canvas.getContext('2d')
    context.font = '24px Arial'
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.fillText(name, 128, 32)
    
    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(2, 0.5, 1)
    sprite.position.y = 2.5
    player.add(sprite)
    
    return player
}

export { MultiplayerPlayer }