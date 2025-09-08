// client/src/game/timer.js
import * as THREE from 'three'

function TimerDisplay() {
    const timerGroup = new THREE.Group()
    
    // Back wall/board for the timer
    const boardGeometry = new THREE.BoxGeometry(20, 10, 1)
    const boardMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        metalness: 0.3,
        roughness: 0.8
    })
    const board = new THREE.Mesh(boardGeometry, boardMaterial)
    board.position.y = 10  // Elevated above doll
    board.castShadow = true
    board.receiveShadow = true
    timerGroup.add(board)
    
    // Frame around timer
    const frameGeometry = new THREE.BoxGeometry(21, 11, 0.5)
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.5,
        roughness: 0.5
    })
    const frame = new THREE.Mesh(frameGeometry, frameMaterial)
    frame.position.y = 10
    frame.position.z = 0.5
    timerGroup.add(frame)
    
    // Digital display segments (we'll create digits)
    const digitGroups = []
    const digitPositions = [-5.5, -2.5, 2.5, 5.5]  // MM:SS layout (colon in middle)
    
    for (let i = 0; i < 4; i++) {
        const digitGroup = new THREE.Group()
        digitGroup.position.x = digitPositions[i]
        digitGroup.position.y = 10
        digitGroup.position.z = 1
        timerGroup.add(digitGroup)
        digitGroups.push(digitGroup)
    }
    
    // Colon separator
    const colonTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.2),
        new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000 })
    )
    colonTop.position.set(0, 11, 1)
    timerGroup.add(colonTop)
    
    const colonBottom = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.2),
        new THREE.MeshBasicMaterial({ color: 0xff0000, emissive: 0xff0000 })
    )
    colonBottom.position.set(0, 9, 1)
    timerGroup.add(colonBottom)
    
    // Store references for updating
    timerGroup.userData = { digitGroups }
    
    return timerGroup
}

// Create a single digit (7-segment display style)
function createDigit(number) {
    const group = new THREE.Group()
    const segmentMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000
    })
    const offMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x330000,
        emissive: 0x330000
    })
    
    // Segment definitions for 7-segment display
    const segments = [
        { pos: [0, 2, 0], size: [2, 0.3, 0.2], rot: 0 },     // Top
        { pos: [1, 1, 0], size: [0.3, 1.5, 0.2], rot: 0 },   // Top right
        { pos: [1, -1, 0], size: [0.3, 1.5, 0.2], rot: 0 },  // Bottom right
        { pos: [0, -2, 0], size: [2, 0.3, 0.2], rot: 0 },    // Bottom
        { pos: [-1, -1, 0], size: [0.3, 1.5, 0.2], rot: 0 }, // Bottom left
        { pos: [-1, 1, 0], size: [0.3, 1.5, 0.2], rot: 0 },  // Top left
        { pos: [0, 0, 0], size: [2, 0.3, 0.2], rot: 0 }      // Middle
    ]
    
    // Which segments are on for each digit
    const digitPatterns = [
        [1, 1, 1, 1, 1, 1, 0], // 0
        [0, 1, 1, 0, 0, 0, 0], // 1
        [1, 1, 0, 1, 1, 0, 1], // 2
        [1, 1, 1, 1, 0, 0, 1], // 3
        [0, 1, 1, 0, 0, 1, 1], // 4
        [1, 0, 1, 1, 0, 1, 1], // 5
        [1, 0, 1, 1, 1, 1, 1], // 6
        [1, 1, 1, 0, 0, 0, 0], // 7
        [1, 1, 1, 1, 1, 1, 1], // 8
        [1, 1, 1, 1, 0, 1, 1]  // 9
    ]
    
    const pattern = digitPatterns[number] || digitPatterns[0]
    
    segments.forEach((seg, i) => {
        const geom = new THREE.BoxGeometry(...seg.size)
        const mesh = new THREE.Mesh(geom, pattern[i] ? segmentMaterial : offMaterial)
        mesh.position.set(...seg.pos)
        group.add(mesh)
    })
    
    return group
}

function updateTimerDisplay(timer, timeInSeconds) {
    if (!timer.userData.digitGroups) return
    
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    
    const digits = [
        Math.floor(minutes / 10),  // Tens of minutes
        minutes % 10,               // Minutes
        Math.floor(seconds / 10),  // Tens of seconds
        seconds % 10                // Seconds
    ]
    
    timer.userData.digitGroups.forEach((group, i) => {
        // Clear old digit
        while (group.children.length > 0) {
            group.remove(group.children[0])
        }
        // Add new digit
        const digitMesh = createDigit(digits[i])
        group.add(digitMesh)
    })
}

export { TimerDisplay, updateTimerDisplay }