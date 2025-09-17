// client/src/game/boundaries.js
function checkBoundaries(position, boundaries) {
    const { minX, maxX, minZ, maxZ } = boundaries
    
    // Clamp position to stay within boundaries
    const clampedPosition = {
        x: Math.max(minX, Math.min(maxX, position.x)),
        y: position.y,
        z: Math.max(minZ, Math.min(maxZ, position.z))
    }
    
    return clampedPosition
}

export { checkBoundaries }