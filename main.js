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
	"backgroundColor": "#536375",
	"showDirectionalLightHelper": true,
	"directionalLightColor": "#ffffff",
	"directionalLightIntensity": 1,
	"ground": {
		"size": 10,
		"color": "#dcdcdc",
		"roughness": 0.6,
		"metalness": 0.05
	},
	"water": {
		"height": 0.3,
		"color": "#00ffff",
		"roughness": 0.5,
		"metalness": 0.1
	},
	"trees": {
		"count": 20,
		"leaves": {
			"color": "#214829",
			"roughness": 0.9,
			"metalness": 0
		},
		"trunk": {
			"color": "#392400",
			"roughness": 0.9,
			"metalness": 0
		}
	},
	"snow": {
		"visible": true,
		"count": 200,
		"size": 0.1,
		"color": "#ffffff",
		"speed": 0.1
	}
}

//SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color(parameters.backgroundColor)
scene.fog = new THREE.Fog(scene.background, 1, 20)

//LIGHT
const directionalLight = new THREE.DirectionalLight(parameters.directionalLightColor, parameters.directionalLightIntensity)
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
directionalLightHelper.visible = parameters.showDirectionalLightHelper
scene.add(directionalLightHelper)

//CAMERA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
camera.position.y = 2

scene.add(camera)

//PARTICLES
const snowParticlesGeometry = new THREE.BufferGeometry()

function generateSnowParticlesAttributes () {
	const snowParticlesPosition = new Float32Array(parameters.snow.count * 3)
	const snowParticlesVelocity = new Float32Array(parameters.snow.count * 3)

	for (let i = 0; i < parameters.snow.count; i++) {
		snowParticlesPosition[i] = Math.random() * parameters.ground.size - parameters.ground.size / 2
		snowParticlesVelocity[i] = Math.random() * parameters.snow.speed
	}

	snowParticlesGeometry.setAttribute("position", new THREE.BufferAttribute(snowParticlesPosition, 3))
	snowParticlesGeometry.setAttribute("velocity", new THREE.BufferAttribute(snowParticlesVelocity, 3))
}

generateSnowParticlesAttributes()

const snowParticlesMaterial = new THREE.PointsMaterial({
	color: parameters.snow.color,
	roughness: parameters.snow.roughness,
	metalness: parameters.snow.metalness,
	size: parameters.snow.size,
	sizeAttenuation: true
})
const snowParticles = new THREE.Points(snowParticlesGeometry, snowParticlesMaterial)
snowParticles.name = "snowParticles"
snowParticles.visible = parameters.snow.visible

scene.add(snowParticles)

/*
* OBJECTS
* */

const material = new THREE.MeshStandardMaterial({
	color: 0xffffff
})

// material.wireframe = true

//GROUND
const groundGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 10, 1, 10)
const groundMaterial = new THREE.MeshStandardMaterial({
	color: parameters.ground.color,
	roughness: parameters.ground.roughness,
	metalness: parameters.ground.metalness,
	flatShading: true

})

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
	groundMaterial
)
ground.scale.set(parameters.ground.size, 1, parameters.ground.size)
ground.castShadow = true
ground.receiveShadow = true

scene.add(ground)

//WATER
const waterGeometry = new THREE.PlaneBufferGeometry()
const water = new THREE.Mesh(
	waterGeometry,
	new THREE.MeshStandardMaterial({
		color: parameters.water.color,
		roughness: parameters.water.roughness,
		metalness: parameters.water.metalness
	})
)
water.position.y = parameters.water.height
water.rotation.x = -Math.PI * 0.5
water.scale.set(parameters.ground.size, parameters.ground.size)

scene.add(water)

// TREE
const trunkGeometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 1, 6)
const trunkMaterial = new THREE.MeshStandardMaterial({
	color: parameters.trees.trunk.color,
	roughness: parameters.trees.trunk.roughness,
	metalness: parameters.trees.trunk.metalness,
	flatShading: true
})
const leavesGeometry = new THREE.ConeBufferGeometry(1, 1, 6)
const leavesMaterial = new THREE.MeshStandardMaterial({
	color: parameters.trees.leaves.color,
	roughness: parameters.trees.leaves.roughness,
	metalness: parameters.trees.leaves.metalness,
	flatShading: true
})

function createTreeObject () {
	const tree = new THREE.Group()

	//TRUNK
	const trunk = new THREE.Mesh(
		trunkGeometry,
		trunkMaterial
	)
	trunk.position.y = -trunk.geometry.parameters.height / 2

	trunk.castShadow = true
	trunk.receiveShadow = true

	trunk.name = "trunk"

	tree.add(trunk)

	//LEAVES
	const leavesCount = Math.floor(Math.random() * 4) + 2

	for (let i = 1; i <= leavesCount; i++) {
		const leaves = new THREE.Mesh(
			leavesGeometry,
			leavesMaterial
		)
		leaves.position.y = i ** 0.25 - 1
		leaves.scale.set(1 / (i + 1), 1 / (i + 1), 1 / (i + 1))
		leaves.rotation.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1)

		leaves.castShadow = true
		leaves.receiveShadow = true

		leaves.name = "leaves"

		tree.add(leaves)
	}

	//TREE ATTRIBUTES
	tree.position.y = Math.random() * (2 - 1.5) + 1.5
	tree.position.x = Math.random() * ((parameters.ground.size / 2 - 1) - (-parameters.ground.size / 2 + 1)) + (-parameters.ground.size / 2 + 1)
	tree.position.z = Math.random() * ((parameters.ground.size / 2 - 1) - (-parameters.ground.size / 2 + 1)) + (-parameters.ground.size / 2 + 1)
	tree.scale.set(Math.random() * (2 - 1.5) + 1.5, Math.random() * (2 - 1.5) + 1.5, Math.random() * (2 - 1.5) + 1.5)
	tree.rotation.set((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1)

	tree.name = "tree"

	scene.add(tree)
}

for (let i = 0; i < parameters.trees.count; i++) {
	createTreeObject()
}

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

	//light
	directionalLight.position.x = Math.sin(clock.getElapsedTime() * 0.1) * 20
	directionalLight.position.z = Math.cos(clock.getElapsedTime() * 0.1) * 10
	directionalLight.lookAt(ground.position)

	//snow
	for (let i = 0; i < snowParticlesGeometry.attributes.position.count; i++) {
		const i3 = i * 3
		snowParticlesGeometry.attributes.position.array[i3] += snowParticlesGeometry.attributes.velocity.array[i3] * parameters.snow.speed
		snowParticlesGeometry.attributes.position.array[i3 + 1] -= snowParticlesGeometry.attributes.velocity.array[i3 + 1] * parameters.snow.speed
		snowParticlesGeometry.attributes.position.array[i3 + 2] += snowParticlesGeometry.attributes.velocity.array[i3 + 2] * parameters.snow.speed
		if (snowParticlesGeometry.attributes.position.array[i3] > parameters.ground.size / 2) {
			snowParticlesGeometry.attributes.position.array[i3] = -parameters.ground.size / 2
		}
		if (snowParticlesGeometry.attributes.position.array[i3 + 1] < 0) {
			snowParticlesGeometry.attributes.position.array[i3 + 1] = Math.random() * 10
		}
		if (snowParticlesGeometry.attributes.position.array[i3 + 2] > parameters.ground.size / 2) {
			snowParticlesGeometry.attributes.position.array[i3 + 2] = -parameters.ground.size / 2
		}
	}
	snowParticlesGeometry.attributes.position.needsUpdate = true

	stats.update()
	renderer.render(scene, camera)
}
animate()

/*
* GUI
* */

//scene
gui.addColor(parameters, "backgroundColor").onChange(() => {
	scene.background.set(parameters.backgroundColor)
	scene.fog.color.set(parameters.backgroundColor)
})

//light
gui.addColor(parameters, "directionalLightColor").onChange(() => {
	directionalLight.color.set(parameters.directionalLightColor)
})
gui.add(parameters, "directionalLightIntensity", 0, 1).onChange(() => {
	directionalLight.intensity = parameters.directionalLightIntensity
})

//helper
gui.add(parameters, "showDirectionalLightHelper").onChange(() => {
	directionalLightHelper.visible = parameters.showDirectionalLightHelper
})

//ground
const groundFolder = gui.addFolder("Ground")
groundFolder.add(parameters.ground, "size", 1, 20, 1).onChange(() => {
	ground.scale.x = parameters.ground.size
	ground.scale.z = parameters.ground.size

	water.scale.x = parameters.ground.size
	water.scale.y = parameters.ground.size
})
groundFolder.addColor(parameters.ground, "color").onChange(() => {
	groundMaterial.color.set(parameters.ground.color)
})
groundFolder.add(parameters.ground, "roughness", 0, 1, 0.01).onChange(() => {
	groundMaterial.roughness = parameters.ground.roughness
})
groundFolder.add(parameters.ground, "metalness", 0, 1, 0.01).onChange(() => {
	groundMaterial.metalness = parameters.ground.metalness
})

//water
const waterFolder = gui.addFolder("Water")
waterFolder.add(parameters.water, "height", 0.2, 0.4, 0.01).onChange(() => {
	water.position.y = parameters.water.height
})
waterFolder.addColor(parameters.water, "color").onChange(() => {
	water.material.color.set(parameters.water.color)
})
waterFolder.add(parameters.water, "roughness", 0, 1, 0.01).onChange(() => {
	water.material.roughness = parameters.water.roughness
})
waterFolder.add(parameters.water, "metalness", 0, 1, 0.01).onChange(() => {
	water.material.metalness = parameters.water.metalness
})

//trees
const treesFolder = gui.addFolder("Trees")
let previousTreesCount = parameters.trees.count
treesFolder.add(parameters.trees, "count", 0, 100, 1).onChange((e) => {
	console.log()
	if (e > previousTreesCount) {
		for (let i = 0; i < e - previousTreesCount; i++) {
			createTreeObject()
		}
	} else {
		for (let i = 0; i < previousTreesCount - e; i++) {
			scene.remove(scene.getObjectByName("tree"))
		}
	}
	previousTreesCount = e
})
const treesLeavesFolder = treesFolder.addFolder("Leaves")
treesLeavesFolder.addColor(parameters.trees.leaves, "color").onChange(() => {
		scene.traverse((object) => {
			if (object.name === "tree") {
				object.traverse((object) => {
					if (object.name === "leaves") {
						object.material.color.set(parameters.trees.leaves.color)
					}
				})
			}
		})
	}
)
treesLeavesFolder.add(parameters.trees.leaves, "roughness", 0, 1, 0.01).onChange(() => {
	scene.traverse((object) => {
			if (object.name === "tree") {
				object.traverse((object) => {
					if (object.name === "leaves") {
						object.material.roughness = parameters.trees.leaves.roughness
					}
				})
			}
		}
	)
})
treesLeavesFolder.add(parameters.trees.leaves, "metalness", 0, 1, 0.01).onChange(() => {
	scene.traverse((object) => {
			if (object.name === "tree") {
				object.traverse((object) => {
					if (object.name === "leaves") {
						object.material.metalness = parameters.trees.leaves.metalness
					}
				})
			}
		}
	)
})
const treesTrunkFolder = treesFolder.addFolder("Trunk")
treesTrunkFolder.addColor(parameters.trees.trunk, "color").onChange(() => {
	scene.traverse((object) => {
		if (object.name === "tree") {
			object.traverse((object) => {
				if (object.name === "trunk") {
					object.material.color.set(parameters.trees.trunk.color)
				}
			})
		}
	})
})
treesTrunkFolder.add(parameters.trees.trunk, "roughness", 0, 1, 0.01).onChange(() => {
	scene.traverse((object) => {
			if (object.name === "tree") {
				object.traverse((object) => {
					if (object.name === "trunk") {
						object.material.roughness = parameters.trees.trunk.roughness
					}
				})
			}
		}
	)
})
treesTrunkFolder.add(parameters.trees.trunk, "metalness", 0, 1, 0.01).onChange(() => {
	scene.traverse((object) => {
			if (object.name === "tree") {
				object.traverse((object) => {
					if (object.name === "trunk") {
						object.material.metalness = parameters.trees.trunk.metalness
					}
				})
			}
		}
	)
})

//snow
const snowFolder = gui.addFolder("Snow")
snowFolder.add(parameters.snow, "visible").onChange(() => {
	snowParticles.visible = parameters.snow.visible
})
snowFolder.add(parameters.snow, "count", 0, 500, 1).onChange(() => {
	generateSnowParticlesAttributes()
	snowParticles.geometry.attributes.position.needsUpdate = true
})
snowFolder.add(parameters.snow, "size", 0, 1, 0.01).onChange(() => {
	snowParticlesMaterial.size = parameters.snow.size
})
snowFolder.addColor(parameters.snow, "color").onChange(() => {
	snowParticlesMaterial.color.set(parameters.snow.color)
})
snowFolder.add(parameters.snow, "speed", 0, 1, 0.01).onChange(() => {
	snowParticlesMaterial.speed = parameters.snow.speed
})