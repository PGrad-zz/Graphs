function rotateOnMouse(e) {
	let oldX = e.clientX - e.movementX;
	let oldY = e.clientY - e.movementY;
	let newVec = sc2wc(new THREE.Vector3(e.clientX, e.clientY));
	let oldVec = sc2wc(new THREE.Vector3(oldX, oldY));
	let rotation = new THREE.Quaternion();
	rotation.setFromUnitVectors(oldVec, newVec);
	let center = new THREE.Vector3(0,0,0);
	let axis = new THREE.Vector3(0,1,0);
	env.scene.children.forEach((el) => {
		rotateAboutPoint(el, el.type === "Line" ? el.geometry.vertices[1] : el.position, center, axis, rotation);
	});
}

function sc2wc(s) {
	let vector = new THREE.Vector3();

	vector.set(
		( s.x / window.innerWidth ) * 2 - 1,
		-( s.y / window.innerHeight ) * 2 + 1,
		0.5
	);

	vector.unproject( env.camera );

	return vector.sub( env.camera.position ).normalize();
}

function rotateAboutPoint(obj, end, point, axis, rotation) {
	let distance = new THREE.Vector3();
	distance.subVectors(point, end);
	let revolution = new THREE.Quaternion();
	revolution.setFromUnitVectors(axis, rotation);
	obj.position.add(distance);
	distance.applyQuaternion(revolution);
	obj.position.sub(distance);
}

window.addEventListener("mousemove", rotateOnMouse);
