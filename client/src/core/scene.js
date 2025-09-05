import * as THREE from 'three'

const scene = new THREE.Scene()

scene.background = new THREE.Color(0x87CEEB)
scene.fog = new THREE.Fog(0x87CEEB, 100, 500) // add some fog

export { scene };