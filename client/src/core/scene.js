// client/src/core/scene.js
import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'

const scene = new THREE.Scene()

// Create realistic sky for RLGL
const sky = new Sky()
sky.scale.setScalar(450000)
sky.name = 'rlglSky' // Name it so we can remove it later
scene.add(sky)

const sun = new THREE.Vector3()

// Brighter, clearer sky for better visibility
const effectController = {
turbidity: 2,
rayleigh: 1.2,
mieCoefficient: 0.005,
mieDirectionalG: 0.7,
elevation: 10,
azimuth: 90,
exposure: 0.4

}

const uniforms = sky.material.uniforms
uniforms['turbidity'].value = effectController.turbidity
uniforms['rayleigh'].value = effectController.rayleigh
uniforms['mieCoefficient'].value = effectController.mieCoefficient
uniforms['mieDirectionalG'].value = effectController.mieDirectionalG

const phi = THREE.MathUtils.degToRad(90 - effectController.elevation)
const theta = THREE.MathUtils.degToRad(effectController.azimuth)

sun.setFromSphericalCoords(1, phi, theta)
uniforms['sunPosition'].value.copy(sun)

scene.fog = new THREE.Fog(0x87CEEB, 100, 500)

// Function to switch to Tug of War scene
function setupTugScene() {
    // Remove RLGL sky
    const rlglSky = scene.getObjectByName('rlglSky')
    if (rlglSky) {
        scene.remove(rlglSky)
    }
    
    // Set dark background for tug of war
    scene.background = new THREE.Color(0x1a1a2e)
    scene.fog = new THREE.FogExp2(0x000000, 0.006)
}

// Function to restore RLGL scene
function setupRLGLScene() {
    // Re-add sky if not present
    if (!scene.getObjectByName('rlglSky')) {
        scene.add(sky)
    }
    
    scene.background = null // Let sky show through
    scene.fog = new THREE.Fog(0x87CEEB, 100, 500)
}

export { scene, setupTugScene, setupRLGLScene }