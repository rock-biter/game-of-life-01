import {
	BoxGeometry,
	MeshNormalMaterial,
	Mesh,
	MeshStandardMaterial,
	MeshPhysicalMaterial,
	Vector2,
} from 'three'
import scene from './Scene'
import { gsap } from 'gsap'

export default class Cell extends Mesh {
	static numOfCell = 0
	static cells = []

	neighborsIndexes = []

	uniforms = {
		uAlive: { value: false },
	}

	constructor(resolution, d = 1, speed = 0.2) {
		const geometry = new BoxGeometry(d, d / 10, d)
		const material = new MeshPhysicalMaterial({
			transparent: true,
			color: 0x335597,
		})

		super(geometry, material)

		this.speed = speed * 10

		this.index = Cell.numOfCell
		Cell.numOfCell++

		this.resolution = resolution

		this.setIndexPosition()
		this.setAlive(Math.random() < 0.15)

		this.scale.multiplyScalar(this.isAlive ? 1 : 0.05)

		scene.add(this)
		Cell.cells.push(this)
	}

	setIndexPosition() {
		const x = this.index % this.resolution.x
		const z = Math.floor(this.index / this.resolution.x)

		this.position.x = x - this.resolution.x / 2
		this.position.z = z - this.resolution.y / 2
	}

	born() {
		this.setAlive(true)
	}

	die() {
		this.setAlive(false)
	}

	setAlive(isAlive) {
		const value = isAlive ? 1 : 0.05
		this.uniforms.uAlive.value = this.isAlive = isAlive
		// this.material.opacity = value

		// gsap.fromTo(
		// 	this.scale,
		// 	{ y: 1 - isAlive, x: 1 - isAlive, z: 1 - isAlive },
		// 	{ duration: this.speed, y: isAlive, x: isAlive, z: isAlive }
		// )

		let speed = isAlive ? this.speed * 0.5 : this.speed

		gsap.killTweensOf(this.scale)
		gsap.to(this.scale, {
			duration: speed,
			y: value,
			x: value,
			z: value,
		})
	}

	get isFirstRow() {
		return Math.floor(this.index / this.resolution.x) === 0
	}

	get isLastRow() {
		return Math.floor(this.index / this.resolution.x) === this.resolution.y - 1
	}

	get isFirstCol() {
		return this.index % this.resolution.x === 0
	}

	get isLastCol() {
		return this.index % this.resolution.x === this.resolution.x - 1
	}

	get neighbors() {
		return this.neighborsIndexes.map((i) => Cell.cells[i])
	}

	get aliveNeighbors() {
		return this.neighbors.filter((n) => n.isAlive)
	}

	get mustDie() {
		return (
			this.isAlive &&
			(this.aliveNeighbors.length > 3 || this.aliveNeighbors.length < 2)
		)
	}

	get mustBeBorn() {
		return !this.isAlive && this.aliveNeighbors.length === 3
	}

	computeNeighborsIndexes() {
		const i = this.index
		const { x } = this.resolution

		if (!this.isFirstRow) {
			// top cell
			this.neighborsIndexes.push(i - x)

			if (!this.isFirstCol) {
				// top left cell
				this.neighborsIndexes.push(i - x - 1)
			}

			if (!this.isLastCol) {
				//top right cell
				this.neighborsIndexes.push(i - x + 1)
			}
		}

		if (!this.isLastRow) {
			// bottom cell
			this.neighborsIndexes.push(i + x)

			if (!this.isFirstCol) {
				// bottom left
				this.neighborsIndexes.push(i + x - 1)
			}

			if (!this.isLastCol) {
				// bottom right
				this.neighborsIndexes.push(i + x + 1)
			}
		}

		if (!this.isFirstCol) {
			// left cell
			this.neighborsIndexes.push(i - 1)
		}

		if (!this.isLastCol) {
			// right cell
			this.neighborsIndexes.push(i + 1)
		}
	}

	static getIndexFromCoords(x, y, resolution) {
		x = Math.floor(x) + resolution.x / 2
		y = Math.floor(y) + resolution.y / 2

		let i = (x % resolution.x) + y * resolution.x

		return i
	}

	static getCellFromCoords(
		position = new Vector2(),
		resolution = new Vector2()
	) {
		let i = Cell.getIndexFromCoords(...position, resolution)

		return Cell.cells[i]
	}
}
