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
		/**
		 * Create geometry
		 */
		const geometry = new BoxGeometry(d, d / 10, d)
		/**
		 * Create material
		 */
		const material = new MeshPhysicalMaterial({
			transparent: true,
			color: 0x335597,
		})

		super(geometry, material)

		this.speed = speed * 10
		this.resolution = resolution
		this.index = Cell.numOfCell
		Cell.numOfCell++

		this.setIndexPosition()
		this.setAlive(Math.random() < 0.15)

		/**
		 * set initial scale
		 */
		this.scale.multiplyScalar(this.isAlive ? 1 : 0.05)

		/**
		 * add cell to scene
		 */
		scene.add(this)
		Cell.cells.push(this)
	}

	/**
	 * Use index of cell to set space coordinates
	 */
	setIndexPosition() {
		const x = this.index % this.resolution.x
		const z = Math.floor(this.index / this.resolution.x)

		this.position.x = x - this.resolution.x / 2
		this.position.z = z - this.resolution.y / 2
	}

	/**
	 * Set Cell to be born
	 */
	born() {
		this.setAlive(true)
	}

	/**
	 * Set Cell to die
	 */
	die() {
		this.setAlive(false)
	}

	/**
	 *
	 * @param {*} isAlive
	 */
	setAlive(isAlive) {
		const value = isAlive ? 1 : 0.05
		/**
		 * set isAlive and uniform value
		 */
		this.uniforms.uAlive.value = this.isAlive = isAlive

		/**
		 * set different speed for born and die animation
		 */
		let speed = isAlive ? this.speed * 0.5 : this.speed

		/**
		 * start animation
		 */
		gsap.killTweensOf(this.scale)
		gsap.to(this.scale, {
			duration: speed,
			y: value,
			x: value,
			z: value,
		})
	}

	/**
	 * Tell if cell is on the first row of the grid
	 */
	get isFirstRow() {
		return Math.floor(this.index / this.resolution.x) === 0
	}

	/**
	 * Tell if cell is on the last row of the grid
	 */
	get isLastRow() {
		return Math.floor(this.index / this.resolution.x) === this.resolution.y - 1
	}

	/**
	 * Tell if cell is on the first column of the grid
	 */
	get isFirstCol() {
		return this.index % this.resolution.x === 0
	}

	/**
	 * Tell if cell is on the last column of the grid
	 */
	get isLastCol() {
		return this.index % this.resolution.x === this.resolution.x - 1
	}

	/**
	 * Get neighbors cell of this cell
	 */
	get neighbors() {
		return this.neighborsIndexes.map((i) => Cell.cells[i])
	}

	/**
	 * Get only alive neighbors cell of this cell
	 */
	get aliveNeighbors() {
		return this.neighbors.filter((n) => n.isAlive)
	}

	/**
	 * Tell if cell must die
	 * based of number of alive neighbors and state of cell
	 */
	get mustDie() {
		return (
			this.isAlive &&
			(this.aliveNeighbors.length > 3 || this.aliveNeighbors.length < 2)
		)
	}

	/**
	 * Tell if cell must be born
	 * based of number of alive neighbors and state of cell
	 */
	get mustBeBorn() {
		return !this.isAlive && this.aliveNeighbors.length === 3
	}

	/**
	 * Retrieve the neighbors index cell based on index of this cell
	 * and set the neighborsIndexes property
	 */
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

	/**
	 * Retrive the index of a cell based on space coordinates and grid resolution
	 * @param {*} x
	 * @param {*} y
	 * @param {*} resolution
	 * @returns
	 */
	static getIndexFromCoords(x, y, resolution) {
		x = Math.floor(x) + resolution.x / 2
		y = Math.floor(y) + resolution.y / 2

		let i = (x % resolution.x) + y * resolution.x

		return i
	}

	/**
	 * Retrive a cell based on space coordinates and grid resolution
	 * @param {*} position
	 * @param {*} resolution
	 * @returns
	 */
	static getCellFromCoords(
		position = new Vector2(),
		resolution = new Vector2()
	) {
		let i = Cell.getIndexFromCoords(...position, resolution)

		return Cell.cells[i]
	}
}
