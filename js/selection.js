'use strict';
let raycaster = new THREE.Raycaster();
let first_pt = null;
let newVert = false;
function master(e) {
	switch(env.mode) {
		case env.modes.normal:
			if(e.shiftKey)
				make_point(e);
			else
				make_edge(e);
			break;
		case env.modes.weight:
			addWeight(e);
			break;
		case env.modes.connected:
			connected_components();
			break;
		default:
			do_algorithm(e);
	}
}

function clean(e) {
	if(e.code !== "KeyC")
		return;
	clean_nodes();
	clean_edges(true);
}
//Shift + mousedown to create point
function make_point(e) {
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

var start_select;

function enable_selection(e) {
	env.can_select = true;
	start_select = sc2wc(getScreenCoords(e), 'y');
}

function disable_selection(e) {
	if(env.selector != null)
		env.scene.remove(env.selector);
	env.can_select = false;
}

function selection(e) {
	if(!env.can_select || env.mode !== env.modes.selection)
		return;
	if(env.selector != null)
		env.scene.remove(env.selector);
	if(env.selector != null)
		env.scene.remove(env.selector);
	let mouse_pos = sc2wc(getScreenCoords(e), 'y');
	let diff = new THREE.Vector3();
	diff.subVectors(mouse_pos, start_select);
	let color = (diff.x * diff.z) > 0 ? 0x0000ff : 0x00ff00;
	let plane_mat = new THREE.MeshLambertMaterial({color: color});
	plane_mat.transparent = true;
	plane_mat.opacity = 0.5;
	let geom = new THREE.Geometry();
	let xsgn = (mouse_pos.x / Math.abs(mouse_pos.x));
	let zsgn = (mouse_pos.z / Math.abs(mouse_pos.z));
	let vtx_normal = new THREE.Vector3(0, 1, 0);
	//x, y, z -> x, -z, y
	geom.vertices.push(
		new THREE.Vector3(mouse_pos.x, 0, mouse_pos.z),
		new THREE.Vector3(mouse_pos.x, 0, start_select.z),
		start_select,
		new THREE.Vector3(start_select.x, 0, mouse_pos.z)
	);
	if((xsgn * zsgn) > 0)
		geom.faces.push(
			new THREE.Face3(0, 1, 2, [vtx_normal, vtx_normal, vtx_normal]),
			new THREE.Face3(2, 3, 0, [vtx_normal, vtx_normal, vtx_normal]),
		);
	else
		geom.faces.push(
			new THREE.Face3(2, 1, 0, [vtx_normal, vtx_normal, vtx_normal]),
			new THREE.Face3(0, 3, 2, [vtx_normal, vtx_normal, vtx_normal]),
		);
	let plane = new THREE.Mesh(geom, plane_mat);
	env.selector = plane;
	env.scene.add(env.selector);
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
	if(env.ctrls[e.code] === undefined)
		return;
	if(env.mode === env.ctrls[e.code])
		env.mode = env.modes.normal;
	else
		env.mode = env.ctrls[e.code];
	env.mode_gui.innerText = env.mode + " Mode";
}

function addWeight(e) {
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
		remove_weight(obj);
	let text_mesh = make_text(val, obj_text_position(obj));
	obj.text = text_mesh;
	obj.val = parseInt(val);
}

function remove_weight(obj) {
		env.scene.remove(obj.text);
}

function do_algorithm(e) {
	let hits = raycastHit(getScreenCoords(e));
	if(hits.length === 0)
		return;
	let obj = hits[0].object;
	switch(env.mode) {
		case env.modes.dijkstra:
			dijkstra(graph.vertices[obj.position.toArray()]);
			break;
		case env.modes.dfs:
			DFS(graph.vertices[obj.position.toArray()])
			break;
		case env.modes.bfs:
			BFS(graph.vertices[obj.position.toArray()])
			break;
		case env.modes.prim:
			prim(graph.vertices[obj.position.toArray()])
			break;
	}
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


window.addEventListener("mousedown", master);
window.addEventListener("mousedown", enable_selection);
window.addEventListener("mousemove", selection);
window.addEventListener("mouseup", disable_selection);
window.addEventListener("keydown", modeToggle);
window.addEventListener("keydown", clean);
