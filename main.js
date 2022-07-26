import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

//CANVAS
const canvas = document.querySelector("#webgl")

//SIZES
const sizes = {
	width: window.innerWidth, height: window.innerHeight
}

addEventListener("resize", () => {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight
	renderer.setSize(sizes.width, sizes.height)
	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()
})

// PARAMETERS
const params = {}

//SCENE
const scene = new THREE.Scene()

//LIGHT
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 2, 2)
directionalLight.lookAt(new THREE.Vector3())
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 500


// const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(directionalLight, ambientLight)

//HELPERS
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10)
scene.add(directionalLightHelper)

//CAMERA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5

scene.add(camera)

//HELPERS
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

/*
* OBJECTS
* */

const material = new THREE.MeshStandardMaterial({
	color: 0xffffff
})
// material.wireframe = true

//GROUND

const groundGeometry = new THREE.BoxBufferGeometry(1, 0.25, 1, 10, 1, 10)

groundGeometry.attributes.position.array.forEach((value, index) => {
		if (index % 3 === 1) {
			if (groundGeometry.attributes.position.array[index - 1] !== 0.5 && groundGeometry.attributes.position.array[index + 1] !== 0.5) {
				if (groundGeometry.attributes.position.array[index - 1] !== -0.5 && groundGeometry.attributes.position.array[index + 1] !== -0.5) {
					groundGeometry.attributes.position.array[index] += (Math.random() * 0.1) - 0.05
				}
			}
		}
	}
)

const ground = new THREE.Mesh(
	groundGeometry,
	material
)
ground.castShadow = true
ground.receiveShadow = true
scene.add(ground)

//RENDERER
const renderer = new THREE.WebGLRenderer({
	canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.render(scene, camera)

//CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.update()

//ANIMATION
const clock = new THREE.Clock()

const animate = () => {
	requestAnimationFrame(animate)

	directionalLight.position.x = Math.sin(clock.getElapsedTime() * 0.10) * 10
	directionalLight.position.z = Math.cos(clock.getElapsedTime()* 0.10) * 10
	directionalLight.lookAt(ground.position)

	renderer.render(scene, camera)
}
animate()