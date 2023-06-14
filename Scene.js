import { Scene as THREEScene } from 'three'

class Scene extends THREEScene {
	el

	constructor() {
		if (Scene.el) {
			return Scene.el
		}

		super()
	}
}

export default new Scene()
