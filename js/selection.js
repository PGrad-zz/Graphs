'use strict';
let raycaster = new THREE.Raycaster();
let first_pt = null;
let newVert = false;
//Shift + mousedown to create point
function make_point(e) {
	if(env.weight_mode.on)
		return;
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
	if(env.weight_mode.on)
		return;
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
	return screenNormal(e.clientX, e.clientY);
}

function screenNormal(x,y) {
	return new THREE.Vector3(
		( x / window.innerWidth ) * 2 - 1,
		-( y / window.innerHeight ) * 2 + 1
	);
}

function raycastHit(s) {
	raycaster.setFromCamera(s, env.camera);
	return raycaster.intersectObjects(env.scene.children);
}

function modeToggle(e) {
	let mode_data = env.ctrls[e.code];
	if(mode_data === undefined)
		return;
	if(!mode_data.on) {
		for(var mode in env.ctrls)
			env.ctrls[mode].on = false;
		mode_data.on = true;
		env.mode.innerText = mode_data.name + " Mode";
	} else {
		for(var mode in env.ctrls)
			env.ctrls[mode].on = false;
		env.mode.innerText = "Normal Mode";
	}
}

function addWeight(e) {
	if(!env.weight_mode.on)
		return;
	if(e.shiftKey)
		return;
	let hits = raycastHit(getScreenCoords(e));
	if(hits.length === 0)
		return;
	let obj = hits[0].object;
	let val = prompt("Enter a value",0);
	if(val === null)
		return;
	make_weight(obj, val);
}

function make_weight(obj, val) {
	if(obj.text !== undefined)
		env.scene.remove(obj.text);
	let text_mesh = make_text(val, obj_text_position(obj));
	obj.text = text_mesh;
	obj.val = parseInt(val);
}

function do_algorithm(e) {
	let hits = raycastHit(getScreenCoords(e));
	if(hits.length === 0)
		return;
	let obj = hits[0].object;
	if(env.dijkstra_mode.on)
		dijkstra(graph.vertices[obj.position.toArray()])
	else if(env.DFS_mode.on)
		DFS(graph.vertices[obj.position.toArray()])
	else if(env.BFS_mode.on)
		BFS(graph.vertices[obj.position.toArray()])
}

function obj_text_position(obj) {
	let pos = new THREE.Vector3();
	if(obj.type != "Line")
		pos = pos.copy(obj.position);
	else {
		let vertexes = env.edge_parent[obj.uuid].edge_pair[obj.uuid]
		pos.addVectors(vertexes[0], vertexes[1]);
		pos.multiplyScalar(0.5);
	}
	return pos;
}

function make_text(text, pos) {
	let text_geom = new THREE.TextGeometry(text, {
		font: env.text.font,
		size: env.text.size,
		height: env.text.height
	});
	let text_mesh = new THREE.Mesh(text_geom, env.text.material)
	text_mesh.position.set(pos.x, pos.y, pos.z);
	text_mesh.lookAt(env.camera.position);
	env.scene.add(text_mesh);
	env.texts.push(text_mesh);
	return text_mesh;
}


window.addEventListener("mousedown", make_point);
window.addEventListener("mousedown", make_edge);
window.addEventListener("mousedown", addWeight);
window.addEventListener("mousedown", do_algorithm);
window.addEventListener("keydown", modeToggle);
