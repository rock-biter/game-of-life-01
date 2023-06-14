import './style.css'
import scene from './Scene'
import {
	AmbientLight,
	BoxGeometry,
	DirectionalLight,
	Mesh,
	MeshNormalMaterial,
	PerspectiveCamera,
	PointLight,
	WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Cell from './Cell'

// const geometry = new BoxGeometry(1, 1, 1)
// const material = new MeshNormalMaterial()
// const mesh = new Mesh(geometry, material)

const speed = 0.1

const resolution = {
	x: 80,
	y: 50,
}

for (let i = 0; i < resolution.x; i++) {
	for (let j = 0; j < resolution.y; j++) {
		new Cell(resolution, 0.9, speed)
	}
}
Cell.cells.forEach((c) => c.computeNeighborsIndexes())

// scene.add(mesh)

/**
 * camera
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}
const camera = new PerspectiveCamera(60)
// camera.position.z = resolution.x / 2
// camera.position.x = -resolution.x / 2
camera.position.y = resolution.x / 2

/**
 * Renderer
 */
const renderer = new WebGLRenderer({ antialias: true })
document.body.appendChild(renderer.domElement)

/**
 * controls
 */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

onResize()

/**
 * lights
 */
const aLight = new AmbientLight(0xffffff, 0.2)
// scene.add(aLight)

const dLight = new DirectionalLight(0xffffff, 0.2)
dLight.position.set(0, 10, 0)
dLight.position.z *= -1
dLight.target.position.set(0, 0, 0)
scene.add(dLight, dLight.target)

const pLight = new PointLight(0xffffdd, 5, resolution.x)
pLight.position.y = 10
scene.add(pLight)

/**
 * Handle resize
 */
window.addEventListener('resize', onResize)

function onResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()
	renderer.setSize(sizes.width, sizes.height)
}

/**
 * Frame loop
 */
function animate() {
	requestAnimationFrame(animate)

	controls.update()
	renderer.render(scene, camera)
}

requestAnimationFrame(animate)

step()

// Cell.cells[index].neighbors.forEach((n) => (n.material.opacity = 0.5))

// console.log(Cell.cells[index].neighbors.length)

function step() {
	const mustDieCell = []
	const mustBeBornCell = []

	Cell.cells.forEach((c) => {
		if (c.mustDie) {
			mustDieCell.push(c.index)
		}

		if (c.mustBeBorn) {
			mustBeBornCell.push(c.index)
		}
	})

	mustDieCell.forEach((i) => Cell.cells[i].die())
	mustBeBornCell.forEach((i) => Cell.cells[i].born())
}

// window.addEventListener('click', step)
setInterval(step, speed * 1000)
