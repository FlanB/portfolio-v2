import "./style.css"
import * as THREE from "three"
import Stats from "three/examples/jsm/libs/stats.module.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

import * as dat from "dat.gui"

const gui = new dat.GUI()

// STATS
const stats = Stats()
document.body.appendChild(stats.dom)

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
const parameters = {
	backgroundColor: "#536375",
	"groundSize": 10,
	"water": {
		"height": 0.3,
		"color": "#00ffff"
	}
}

//SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color(parameters.backgroundColor)
scene.fog = new THREE.Fog(scene.background, 1, 20)

//LIGHT
const directionalLight = new THREE.DirectionalLight("#fff5ee", 1)
directionalLight.position.y = 10
directionalLight.lookAt(new THREE.Vector3())
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 500

const ambientLight = new THREE.AmbientLight("#ffffff", 0.5)

scene.add(directionalLight, ambientLight)

//HELPERS
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10)
scene.add(directionalLightHelper)

//CAMERA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
camera.position.y = 2

scene.add(camera)

/*
* OBJECTS
* */

const material = new THREE.MeshStandardMaterial({
	color: 0xffffff
})

// material.wireframe = true

//GROUND
const groundGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 1, 10)

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
ground.scale.set(parameters.groundSize, 1, parameters.groundSize)
ground.castShadow = true
ground.receiveShadow = true

scene.add(ground)

//WATER
const waterGeometry = new THREE.PlaneBufferGeometry()
const water = new THREE.Mesh(
	waterGeometry,
	new THREE.MeshStandardMaterial({
		color: parameters.water.color,
		roughness: 0.5,
		metalness: 0.5
	})
)
water.position.y = parameters.water.height
water.rotation.x = -Math.PI * 0.5
water.scale.set(parameters.groundSize, parameters.groundSize)

scene.add(water)

// TREE
const trunkGeometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 1, 6)
const leavesGeometry = new THREE.ConeBufferGeometry(1, 1, 6)

function createTreeObject () {
	const tree = new THREE.Group()

	//TRUNK
	const trunk = new THREE.Mesh(
		trunkGeometry,
		material
	)
	trunk.position.y = -trunk.geometry.parameters.height / 2

	trunk.castShadow = true
	trunk.receiveShadow = true

	tree.add(trunk)

	//LEAVES
	const leavesCount = Math.floor(Math.random() * 4) + 2

	for (let i = 1; i <= leavesCount; i++) {
		const leaves = new THREE.Mesh(
			leavesGeometry,
			material
		)
		leaves.position.y = i ** 0.25 - 1
		leaves.scale.set(1 / (i + 1), 1 / (i + 1), 1 / (i + 1))
		leaves.rotation.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1)

		leaves.castShadow = true
		leaves.receiveShadow = true

		tree.add(leaves)
	}

	//TREE ATTRIBUTES
	tree.position.y = Math.random() * (2 - 1.5) + 1.5
	tree.position.x = Math.random() * (parameters.groundSize / 2 - (-parameters.groundSize / 2 + 1)) - parameters.groundSize / 2 + 1
	tree.position.z = Math.random() * (parameters.groundSize / 2 - (-parameters.groundSize / 2 + 1)) - parameters.groundSize / 2 + 1
	tree.scale.set(Math.random() * (2 - 1.5) + 1.5, Math.random() * (2 - 1.5) + 1.5, Math.random() * (2 - 1.5) + 1.5)
	tree.rotation.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1)
	scene.add(tree)
}

for (let i = 0; i < 10; i++) {
	createTreeObject()
}

// GUI
console.log(scene.background)
gui.addColor(parameters, "backgroundColor").onChange(() => {
	scene.background.set(parameters.backgroundColor)
	scene.fog.color.set(parameters.backgroundColor)
})
const groundFolder = gui.addFolder("Ground")
groundFolder.add(parameters, "groundSize", 1, 20, 1).onChange(() => {
	ground.scale.x = parameters.groundSize
	ground.scale.z = parameters.groundSize

	water.scale.x = parameters.groundSize
	water.scale.y = parameters.groundSize
})
const waterFolder = gui.addFolder("Water")
waterFolder.add(parameters.water, "height", 0.2, 0.4, 0.01).onChange(() => {
	water.position.y = parameters.water.height
})
waterFolder.addColor(parameters.water, "color").onChange(() => {
	water.material.color.set(parameters.water.color)
})

//RENDERER
const renderer = new THREE.WebGLRenderer({
	canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.shadowMap.enabled = true
renderer.render(scene, camera)

//CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.update()

//ANIMATION
const clock = new THREE.Clock()

const animate = () => {
	requestAnimationFrame(animate)

	directionalLight.position.x = Math.sin(clock.getElapsedTime() * 0.1) * 20
	directionalLight.position.z = Math.cos(clock.getElapsedTime() * 0.1) * 10
	directionalLight.lookAt(ground.position)

	stats.update()
	renderer.render(scene, camera)
}
animate()