// client/src/ui/gameUI3D.js
import * as THREE from 'three'
import { GameConfig } from '../config/gameConfig.js'

class GameUI3D {
    constructor(scene, camera) {
        this.scene = scene
        this.camera = camera
        this.startPanel = null
        this.endPanel = null
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.activeButtons = []
        
        this.createStartPanel()
        this.createEndPanel()
        this.setupEventListeners()
    }
    
    createStartPanel() {
        const panel = new THREE.Group()
        
        // Main panel background
        const panelGeometry = new THREE.PlaneGeometry(40, 30)
        const panelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            opacity: 0.9,
            transparent: true,
            side: THREE.DoubleSide
        })
        const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial)
        panel.add(panelMesh)
        
        // Title text (using canvas texture)
        const titleTexture = this.createTextTexture(
            'RED LIGHT, GREEN LIGHT',
            '30px Arial',
            '#ffffff',
            512, 128
        )
        const titleMaterial = new THREE.MeshBasicMaterial({ 
            map: titleTexture, 
            transparent: true 
        })
        const titleMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 5),
            titleMaterial
        )
        titleMesh.position.y = 10
        panel.add(titleMesh)
        
        // Instructions
        const instructionsTexture = this.createTextTexture(
            'Reach the finish line without moving when the doll is watching!\n\n' +
            'WASD - Move    SHIFT - Sprint    MOUSE - Look\n\n' +
            'When you hear the song, the doll will turn!\n' +
            'FREEZE immediately or be eliminated!',
            '18px Arial',
            '#ffffff',
            512, 256
        )
        const instructionsMaterial = new THREE.MeshBasicMaterial({ 
            map: instructionsTexture, 
            transparent: true 
        })
        const instructionsMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 10),
            instructionsMaterial
        )
        instructionsMesh.position.y = 2
        panel.add(instructionsMesh)
        
        // Start button
        const startButton = this.createButton(
            'Move to start',
            { x: 0, y: -8, z: 0.1 },
            () => this.onStartGame()
        )
        panel.add(startButton)
        
        // Position panel in front of player
        panel.position.set(0, 10, GameConfig.field.depth * 0.4 - 15)
        panel.visible = false
        
        this.startPanel = panel
        this.scene.add(panel)
    }
    
    createEndPanel() {
        const panel = new THREE.Group()
        
        // Background
        const panelGeometry = new THREE.PlaneGeometry(40, 25)
        const panelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            opacity: 0.9,
            transparent: true,
            side: THREE.DoubleSide
        })
        const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial)
        panel.add(panelMesh)
        
        // Dynamic result text (will be updated based on win/lose)
        this.resultTexture = this.createTextTexture(
            'GAME OVER',
            '60px Arial',
            '#ff0000',
            512, 128
        )
        const resultMaterial = new THREE.MeshBasicMaterial({ 
            map: this.resultTexture, 
            transparent: true 
        })
        this.resultMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 5),
            resultMaterial
        )
        this.resultMesh.position.y = 7
        panel.add(this.resultMesh)
        
        // Restart button
        const restartButton = this.createButton(
            'RESTART',
            { x: -8, y: -5, z: 0.1 },
            () => this.onRestart()
        )
        panel.add(restartButton)
        
        // Next level button (for winners only)
        this.nextButton = this.createButton(
            'NEXT LEVEL',
            { x: 8, y: -5, z: 0.1 },
            () => this.onNextLevel()
        )
        this.nextButton.visible = false
        panel.add(this.nextButton)
        
        // Position panel
        panel.visible = false
        
        this.endPanel = panel
        this.scene.add(panel)
    }
    
    createButton(text, position, callback) {
        const button = new THREE.Group()
        
        // Button background
        const buttonGeometry = new THREE.PlaneGeometry(12, 4)
        const buttonMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x4ecdc4,
            side: THREE.DoubleSide
        })
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial)
        buttonMesh.userData = { 
            isButton: true, 
            callback: callback,
            defaultColor: 0x4ecdc4,
            hoverColor: 0x6eded6
        }
        button.add(buttonMesh)
        
        // Button text
        const textTexture = this.createTextTexture(
            text,
            '32px Arial',
            '#ffffff',
            256, 64
        )
        const textMaterial = new THREE.MeshBasicMaterial({ 
            map: textTexture, 
            transparent: true 
        })
        const textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 2),
            textMaterial
        )
        textMesh.position.z = 0.01
        button.add(textMesh)
        
        button.position.set(position.x, position.y, position.z)
        this.activeButtons.push(buttonMesh)
        
        return button
    }
    
    createTextTexture(text, font, color, width, height) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        
        context.font = font
        context.fillStyle = color
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        
        // Handle multi-line text
        const lines = text.split('\n')
        const lineHeight = parseInt(font) * 1.2
        const startY = height / 2 - (lines.length - 1) * lineHeight / 2
        
        lines.forEach((line, i) => {
            context.fillText(line, width / 2, startY + i * lineHeight)
        })
        
        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        return texture
    }
    
    setupEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
            
            // Check button hovers
            this.checkButtonHover()
        })
        
        window.addEventListener('click', (e) => {
            this.checkButtonClick()
        })
    }
    
    checkButtonHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const intersects = this.raycaster.intersectObjects(this.activeButtons)
        
        // Reset all buttons
        this.activeButtons.forEach(button => {
            if (button.userData.isButton) {
                button.material.color.setHex(button.userData.defaultColor)
            }
        })
        
        // Highlight hovered button
        if (intersects.length > 0) {
            const button = intersects[0].object
            if (button.userData.isButton) {
                button.material.color.setHex(button.userData.hoverColor)
                document.body.style.cursor = 'pointer'
            }
        } else {
            document.body.style.cursor = 'default'
        }
    }
    
    checkButtonClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const intersects = this.raycaster.intersectObjects(this.activeButtons)
        
        if (intersects.length > 0) {
            const button = intersects[0].object
            if (button.userData.isButton && button.userData.callback) {
                button.userData.callback()
            }
        }
    }
    
    showStartPanel() {
        this.startPanel.visible = true
        this.endPanel.visible = false
        document.exitPointerLock()
    }
    
    hideStartPanel() {
        this.startPanel.visible = false
    }
    
    showEndPanel(won, message) {
        // Update result text
        this.resultTexture = this.createTextTexture(
            won ? 'YOU WIN!' : 'GAME OVER',
            '60px Arial',
            won ? '#4ecdc4' : '#ff0000',
            512, 128
        )
        this.resultMesh.material.map = this.resultTexture
        this.resultMesh.material.needsUpdate = true
        
        // Show next button only if won
        this.nextButton.visible = won
        
        this.endPanel.visible = true
        document.exitPointerLock()
    }
    
    hideEndPanel() {
        this.endPanel.visible = false
    }
    
    onStartGame() {
        this.hideStartPanel()
        // Game will start when player moves
    }
    
    onRestart() {
        window.location.reload() // Simple reload for now
    }
    
    onNextLevel() {
        console.log('Next level coming soon!')
        // Implement next level logic later
    }
}

export { GameUI3D }