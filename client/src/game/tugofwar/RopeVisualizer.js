// client/src/game/tugofwar/RopeVisualizer.js
import * as THREE from 'three'

class RopeVisualizer {
    constructor(scene) {
        this.scene = scene
        this.group = new THREE.Group()
        this.ropePosition = 0 // -1 (left wins) to 1 (right wins)
        this.players = new Map() // playerId -> {name, progress, side}
        
        this.createRope()
        this.createPlatformIndicators()
        this.createCenterMarker()
        this.createPlayerIndicators()
        
        scene.add(this.group)
    }
    
    createRope() {
        // Main rope segments
        const segments = 20
        const segmentLength = 4
        const ropeGroup = new THREE.Group()
        
        for (let i = 0; i < segments; i++) {
            const segment = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, segmentLength, 8),
                new THREE.MeshStandardMaterial({ 
                    color: 0x8b7355,
                    roughness: 0.8
                })
            )
            segment.rotation.z = Math.PI / 2
            segment.position.x = (i - segments / 2) * segmentLength
            segment.position.y = 2
            segment.castShadow = true
            ropeGroup.add(segment)
        }
        
        // Red center marker on rope
        const centerSegment = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.35, segmentLength, 8),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        )
        centerSegment.rotation.z = Math.PI / 2
        centerSegment.position.y = 2
        centerSegment.castShadow = true
        ropeGroup.add(centerSegment)
        
        this.ropeGroup = ropeGroup
        this.group.add(ropeGroup)
    }
    
    createPlatformIndicators() {
        // Left platform indicator
        const leftIndicator = new THREE.Mesh(
            new THREE.BoxGeometry(2, 6, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x4ecdc4 })
        )
        leftIndicator.position.set(-45, 3, 0)
        this.group.add(leftIndicator)
        
        // Right platform indicator
        const rightIndicator = new THREE.Mesh(
            new THREE.BoxGeometry(2, 6, 0.5),
            new THREE.MeshStandardMaterial({ color: 0xff6b6b })
        )
        rightIndicator.position.set(45, 3, 0)
        this.group.add(rightIndicator)
    }
    
    createCenterMarker() {
        // Vertical pole at center
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 8),
            new THREE.MeshStandardMaterial({ color: 0xffff00 })
        )
        pole.position.y = 4
        this.group.add(pole)
        
        // Ground marker
        const groundMarker = new THREE.Mesh(
            new THREE.CircleGeometry(1, 16),
            new THREE.MeshStandardMaterial({ color: 0xffff00 })
        )
        groundMarker.rotation.x = -Math.PI / 2
        groundMarker.position.y = 0.1
        this.group.add(groundMarker)
    }
    
    createPlayerIndicators() {
        this.playerIndicatorsGroup = new THREE.Group()
        this.playerIndicatorsGroup.position.y = 8
        this.group.add(this.playerIndicatorsGroup)
    }
    
    addPlayer(playerId, playerName, isLocalPlayer = false) {
        this.players.set(playerId, {
            name: playerName,
            progress: 0,
            isLocal: isLocalPlayer
        })
    }
    
    updatePlayerProgress(playerId, progress) {
        const player = this.players.get(playerId)
        if (player) {
            player.progress = progress
            this.calculateRopePosition()
        }
    }
    
    calculateRopePosition() {
        if (this.players.size === 0) return
        
        // Find local player
        let localPlayer = null
        for (const [id, player] of this.players) {
            if (player.isLocal) {
                localPlayer = player
                break
            }
        }
        
        if (!localPlayer) return
        
        // Calculate average opponent progress
        let opponentTotal = 0
        let opponentCount = 0
        
        for (const [id, player] of this.players) {
            if (!player.isLocal) {
                opponentTotal += player.progress
                opponentCount++
            }
        }
        
        if (opponentCount === 0) return
        
        const opponentAvg = opponentTotal / opponentCount
        const progressDiff = localPlayer.progress - opponentAvg
        
        // Map difference to rope position (-10 to +10 range, clamped)
        this.ropePosition = Math.max(-10, Math.min(10, progressDiff * 0.2))
    }
    
    update() {
        // Smoothly move rope
        if (this.ropeGroup) {
            const targetX = this.ropePosition
            this.ropeGroup.position.x += (targetX - this.ropeGroup.position.x) * 0.1
        }
        
        // Update player indicators
        this.updatePlayerIndicators()
    }
    
    updatePlayerIndicators() {
        // Clear old indicators
        while (this.playerIndicatorsGroup.children.length > 0) {
            this.playerIndicatorsGroup.remove(this.playerIndicatorsGroup.children[0])
        }
        
        // Sort players by progress
        const sortedPlayers = Array.from(this.players.entries())
            .sort((a, b) => b[1].progress - a[1].progress)
        
        // Create indicators for top 3
        sortedPlayers.slice(0, 3).forEach(([id, player], index) => {
            const indicator = this.createPlayerIndicator(
                player.name,
                player.progress,
                index,
                player.isLocal
            )
            indicator.position.y = -index * 1.5
            this.playerIndicatorsGroup.add(indicator)
        })
    }
    
    createPlayerIndicator(name, progress, rank, isLocal) {
        const group = new THREE.Group()
        
        // Background
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(15, 1.2),
            new THREE.MeshBasicMaterial({ 
                color: isLocal ? 0x4ecdc4 : 0x555555,
                transparent: true,
                opacity: 0.8
            })
        )
        group.add(bg)
        
        // Progress bar
        const progressBar = new THREE.Mesh(
            new THREE.PlaneGeometry(14 * (progress / 100), 1),
            new THREE.MeshBasicMaterial({ 
                color: isLocal ? 0x44ffaa : 0xffaa44
            })
        )
        progressBar.position.x = -7 + (14 * progress / 200)
        progressBar.position.z = 0.01
        group.add(progressBar)
        
        // Add text using canvas texture
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 128
        const ctx = canvas.getContext('2d')
        
        ctx.fillStyle = 'white'
        ctx.font = 'bold 48px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(`${rank + 1}. ${name}`, 20, 70)
        ctx.fillText(`${Math.round(progress)}%`, 400, 70)
        
        const texture = new THREE.CanvasTexture(canvas)
        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(15, 1.2),
            new THREE.MeshBasicMaterial({ 
                map: texture,
                transparent: true
            })
        )
        textMesh.position.z = 0.02
        group.add(textMesh)
        
        return group
    }
    
    destroy() {
        this.scene.remove(this.group)
    }
}

export { RopeVisualizer }