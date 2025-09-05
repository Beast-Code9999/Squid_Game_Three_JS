import * as THREE from 'three'

const scene = new THREE.Scene()

scene.background = new THREE.Color(0x87CEEB)  // sky blue background
scene.fog = new THREE.Fog(0x87CEEB, 100, 500) // fog starting at 100, fully hides at 500

export { scene }
