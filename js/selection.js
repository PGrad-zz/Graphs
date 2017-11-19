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

window.addEventListener("mousedown", make_point);
window.addEventListener("mousedown", make_edge);
