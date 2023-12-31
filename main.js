import './style.css'
import scene from './Scene'
import {
	AmbientLight,
	BoxGeometry,
	DirectionalLight,
	Mesh,
	MeshBasicMaterial,
	MeshNormalMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	Raycaster,
	Vector2,
	WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Cell from './Cell'

const cursor = new Vector2(0, 0)

const speed = 0.15

/**
 * Grid resolution
 */
const d = Math.max(window.innerWidth, window.innerHeight) / 30
const resolution = {
	x: Math.max(Math.floor(d), 50),
	y: Math.max(Math.floor(d), 50),
}

/**
 * Generate cells
 */
for (let i = 0; i < resolution.x; i++) {
	for (let j = 0; j < resolution.y; j++) {
		new Cell(resolution, 0.9, speed)
	}
}
Cell.cells.forEach((c) => c.computeNeighborsIndexes())

/**
 * Plane for ray caster
 */
const planeGeometry = new PlaneGeometry(
	resolution.x,
	resolution.y,
	resolution.x,
	resolution.y
)
planeGeometry.rotateX(-Math.PI * 0.5)
const planeMaterial = new MeshBasicMaterial({
	color: 0xff0000,
	wireframe: true,
	opacity: 0,
	transparent: true,
})
planeGeometry.translate(-0.5, 0, -0.5)
const plane = new Mesh(planeGeometry, planeMaterial)
scene.add(plane)

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
controls.enableRotate = false
controls.enablePan = false
controls.enableZoom = false

onResize()

/**
 * lights
 */
const dLight = new DirectionalLight(0xffffff, 0.2)
dLight.position.set(0, 10, 0)
dLight.position.z *= -1
dLight.target.position.set(0, 0, 0)

const pLight = new PointLight(0xffffdd, 5, resolution.x)
pLight.position.y = 10

scene.add(pLight, dLight, dLight.target)

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

	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

/**
 * Raycaster
 */
const raycaster = new Raycaster()
const coords = new Vector2()

/**
 * Frame loop
 */
function animate() {
	requestAnimationFrame(animate)

	camera.rotation.z += 0.0002

	raycaster.setFromCamera(cursor, camera)

	const intersects = raycaster.intersectObject(plane)

	let point = intersects[0]?.point
	console.log(point)
	if (point) {
		coords.x = point.x
		coords.y = point.z

		const cell = Cell.getCellFromCoords(coords, resolution)
		if (!cell.isAlive) {
			cell.born()
		}
	}

	// controls.update()
	renderer.render(scene, camera)
}

requestAnimationFrame(animate)

/**
 * Cellular automata lifecycle
 */
function step() {
	const mustDieCell = []
	const mustBeBornCell = []

	Cell.cells.forEach((cell) => {
		if (cell.mustDie) {
			mustDieCell.push(cell.index)
		}

		if (cell.mustBeBorn) {
			mustBeBornCell.push(cell.index)
		}
	})

	mustDieCell.forEach((i) => Cell.cells[i].die())
	mustBeBornCell.forEach((i) => Cell.cells[i].born())

	setTimeout(step, speed * 1000)
}

// window.addEventListener('click', step)
step()

/**
 * Cursor coordinates for raycasting
 * @param {*} event
 */
function onMouseMove(event) {
	// console.log(event)
	if ((event.touches || []).length) {
		event = event.touches[0]
	}
	cursor.x = 2 * (event.clientX / window.innerWidth) - 1
	cursor.y = -2 * (event.clientY / window.innerHeight) + 1

	// console.log(cursor)
}

window.addEventListener('mousemove', onMouseMove)
window.addEventListener('touchmove', onMouseMove)
