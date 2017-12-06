'use strict';
function allowMove(e) {
	env.can_move = true;
}
function disableMove(e) {
	env.can_move = false;
}
function rotateOnMouse(e) {
	if(!env.can_move || env.mode !== env.modes.rotate)
		return
	let translation = new THREE.Vector3(e.movementX, e.movementY);
	let movementX = 0;
	let movementY = 0;
	let rotation = screen_angle(translation).multiplyScalar(env.sensitivity);
	let y_axis = new THREE.Vector3(0, 1, 0);
	y_axis.add(env.center);
	let x_axis = new THREE.Vector3(-1, 0, 0);
	x_axis.add(env.center);
	rotateGeometry(env.camera, env.center, y_axis, rotation.x);
	rotateGeometry(env.camera, env.center, x_axis, rotation.y);
	env.texts.forEach((obj) => {
		obj.lookAt(env.camera.position);
	});
}

function screen_angle(s) {
	return new THREE.Vector3((s.x / window.innerWidth) * 2 * Math.PI, -(s.y / window.innerHeight) * 2 * Math.PI);
}

function rotateGeometry(obj, point, axis, theta) {
	let revolution = new THREE.Quaternion();
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

function zoom(e) {
	let factor = 0.1;
	let delta = factor * e.deltaY;
	let dir = env.camera.position.clone().normalize();
	env.camera.position.add(dir.multiplyScalar(delta));
}

window.addEventListener("mousemove", rotateOnMouse);
window.addEventListener("mousedown", allowMove);
window.addEventListener("mouseup", disableMove);
window.addEventListener("wheel", zoom);
