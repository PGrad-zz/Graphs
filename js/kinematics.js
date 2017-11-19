function allowMove(e) {
	this.can_move = true;
}
function disableMove(e) {
	this.can_move = false;
}
function rotateOnMouse(e) {
	if(!this.can_move)
		return
	let translation = new THREE.Vector3(e.movementX, e.movementY);
	movementX = 0; movementY = 0;
	let rotation = screen_angle(translation);
	let y_axis = new THREE.Vector3(0, 1, 0);
	y_axis.add(this.center);
	let x_axis = new THREE.Vector3(-1, 0, 0);
	x_axis.add(this.center);
	rotateGeometry(env.camera, this.center, y_axis, rotation.x);
	rotateGeometry(env.camera, this.center, x_axis, rotation.y);
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
