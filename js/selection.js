'use strict';
let raycaster = new THREE.Raycaster();
let first_pt = null;
let newVert = false;
//Shift + mousedown to create point
function make_point(e) {
	if(!e.shiftKey)
		return;
	let s = getScreenCoords(e);
	let hits = raycastHit(s);
	for(var i = 0; i < hits.length; ++i)
		if(graph.findVertex(hits[i].object.position) !== null)
			return;
	let pos = sc2wc(s, 'y');
	graph.addVertex(pos);
}

//mousedown b/w 2 points creates an edge
//Ctrl key to chain edges
function make_edge(e) {
	if(!e.ctrlKey && !newVert)
		first_pt = null;
	let s = getScreenCoords(e);
	let hits = raycastHit(s);
	if(hits.length === 0)
		return;
	let hit = hits[0].object;
	if(first_pt === null) {
		first_pt = hit;
		newVert = true;
		return;
	}
	if(hit.uuid !== first_pt.uuid) {
		if(e.button == 2)
			graph.addDirEdge(first_pt.position, hit.position);
		else
			graph.addEdge(first_pt.position, hit.position);
		first_pt = e.ctrlKey ? hit : null;
		newVert = false;
	}
}

function to_radians(x) {
	return x * Math.PI / 180;
}

function sc2wc(s, axis) {
	s.unproject( env.camera );

	let dir = s.sub( env.camera.position ).normalize();

	let distance = - env.camera.position[axis] / dir[axis];

	let pos = env.camera.position.clone().add( dir.multiplyScalar( distance ) );
	return pos;
}

function getScreenCoords(e) {
	return new THREE.Vector3(
		( e.clientX / window.innerWidth ) * 2 - 1,
		-( e.clientY / window.innerHeight ) * 2 + 1
	);
}

function raycastHit(s) {
	raycaster.setFromCamera(s, env.camera);
	return raycaster.intersectObjects(env.scene.children);
}

function weightPrimed(e) {
	if(e.code === "KeyA")
		env.can_add_text = true;
}

function weightLost(e) {
	env.can_add_text = false;
}

function addWeight(e) {
	if(!env.can_add_text)
		return;
	let hits = raycastHit(getScreenCoords(e));
	if(hits.length === 0)
		return;
	let obj = hits[0].object;
	let val = prompt("Enter a value",0);
	make_text(val, obj);
}

function make_text(text, obj) {
	let text_geom = new THREE.TextGeometry(text, {
		font: env.text.font,
		size: env.text.size,
		height: env.text.height
	});
	let text_mesh = new THREE.Mesh(text_geom, env.text.material)
	let pos = new THREE.Vector3();
	if(obj.type != "Line")
		pos = pos.copy(obj.position);
	else {
		let vertexes = env.edge_parent[obj.uuid].edge_pair[obj.uuid]
		pos.addVectors(vertexes[0], vertexes[1]);
		pos.multiplyScalar(0.5);
	}
	text_mesh.position.set(pos.x, pos.y, pos.z);
	text_mesh.parent = obj;
	text_mesh.lookAt(env.camera.position);
	env.scene.add(text_mesh);
	env.can_add_text = false;
	env.texts.push(text_mesh);
}

window.addEventListener('contextmenu', function (e) { // Not compatible with IE < 9
    e.preventDefault();
}, false);

window.addEventListener("mousedown", make_point);
window.addEventListener("mousedown", make_edge);
window.addEventListener("mousedown", addWeight);
window.addEventListener("keydown", weightPrimed);
window.addEventListener("keyup", weightLost);
