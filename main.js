import "./style.css"
import * as THREE from "three"
import { Vector3 } from "three"
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
scene.background = new THREE.Color(0x536375)
scene.fog = new THREE.Fog(scene.background, 1, 20)

//LIGHT
const directionalLight = new THREE.DirectionalLight("#ffffff", 1)
directionalLight.position.set(0, 2, 2)
directionalLight.lookAt(new Vector3())
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 500

const ambientLight = new THREE.AmbientLight("#ffffff", 0.5)
scene.add(ambientLight)

scene.add(directionalLight)

//HELPERS
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10)
scene.add(directionalLightHelper)

//CAMERA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
camera.position.y = 2

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

const groundGeometry = new THREE.BoxBufferGeometry(10, 1, 10, 10, 1, 10)

groundGeometry.attributes.position.array.forEach((value, index) => {
		if (index % 3 === 1 && Math.random() > 0.66) {
			if (groundGeometry.attributes.position.array[index - 1] !== groundGeometry.parameters.width / 2 && groundGeometry.attributes.position.array[index + 1] !== groundGeometry.parameters.depth / 2) {
				if (groundGeometry.attributes.position.array[index - 1] !== -groundGeometry.parameters.width / 2 && groundGeometry.attributes.position.array[index + 1] !== -groundGeometry.parameters.depth / 2) {
					groundGeometry.attributes.position.array[index] += Math.random() - 0.5
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

// TREE

const trunkGeometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 1, 6)
const leavesGeometry = new THREE.ConeBufferGeometry(1, 1, 6)

function createTreeObject () {
	const tree = new THREE.Group()

	const trunk = new THREE.Mesh(
		trunkGeometry,
		material
	)
	trunk.position.y = -trunk.geometry.parameters.height / 2

	const leavesCount = Math.floor(Math.random() * 4) + 2

	for (let i = 1; i <= leavesCount; i++) {
		const leaves = new THREE.Mesh(
			leavesGeometry,
			material
		)
		leaves.position.y = i ** 0.25 - 1
		leaves.scale.set(1 / (i + 1), 1 / (i + 1), 1 / (i + 1))
		leaves.rotation.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1)

		tree.add(leaves)
	}

	tree.position.y = Math.random() * (2 - 1.5) + 1.5
	//use ground.geometry.parameters
	tree.position.x = Math.random() * (ground.geometry.parameters.width / 2 + ground.geometry.parameters.width / 2) - ground.geometry.parameters.width / 2
	tree.position.z = Math.random() * (ground.geometry.parameters.depth / 2 + ground.geometry.parameters.depth / 2) - ground.geometry.parameters.depth / 2
	tree.scale.set(2, 2, 2)
	tree.add(trunk)
	scene.add(tree)
}

Array(10).fill(0).forEach(createTreeObject)

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

	directionalLight.position.x = Math.sin(clock.getElapsedTime() * 0.1) * 10
	directionalLight.position.z = Math.cos(clock.getElapsedTime() * 0.1) * 10
	directionalLight.lookAt(ground.position)

	renderer.render(scene, camera)
}
animate()