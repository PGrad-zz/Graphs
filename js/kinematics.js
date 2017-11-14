function rotateOnMouse(e) {
	let translation = new THREE.Vector3(e.movementX, e.movementY);
	let rotation = sc2wc(translation);
	let center = new THREE.Vector3(0, 0, 0);
	let y_axis = new THREE.Vector3(0, 1, 0);
	let x_axis = new THREE.Vector3(-1, 0, 0);
	objs = env.scene.children.filter((el) => {
		return el.type === "Line" || el.type === "Mesh";
	});
	objs.forEach((el) => {
		rotateGeometry(el, center, y_axis, rotation.x);
		rotateGeometry(el, center, x_axis, rotation.y);
	});
}

function sc2wc(s) {
	return new THREE.Vector3((s.x / window.innerWidth) * 2 * Math.PI, -(s.y / window.innerHeight) * 2 * Math.PI);
}

function rotateGeometry(obj, point, axis, theta) {
	let revolution = new THREE.Quaternion();
	let look = new THREE.Vector3(0,0,0);
	revolution.setFromAxisAngle(axis, theta);
	rotateAboutPoint(obj.position, point, revolution);
	obj.applyQuaternion(revolution);
}

function rotateAboutPoint(pos, point, revolution) {
	let distance = new THREE.Vector3();
	distance.subVectors(point, pos);
	pos.add(distance);
	distance.applyQuaternion(revolution);
	pos.sub(distance);
}

window.addEventListener("mousemove", rotateOnMouse);
