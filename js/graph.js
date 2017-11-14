function Edge(line = undefined, point = undefined, height = undefined) {
	this.line = line;
	this.point = point;
	let diff = new THREE.Vector3(0,0,0);
	diff.subVectors(line.geometry.vertices[1], line.geometry.vertices[0]);
	diff.setLength(height);
	let dir = new THREE.Vector3(0,0,0); 
	dir.subVectors(line.geometry.vertices[1], line.geometry.vertices[0]);
	dir.setLength(1);
	let correct = new THREE.Quaternion();
	correct.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
	this.point.position.subVectors(line.geometry.vertices[1], diff);
	this.point.applyQuaternion(correct);
	this.getID = () => {
		return this.line.uuid;
	};
}

function Vertex(sphere = undefined, position = undefined) {
	this.sphere = sphere;
	this.sphere.position.set(position.x, position.y, position.z);
	this.getID = () => {
		return this.sphere.uuid;
	};
}

function EdgeFactory(line_props, pt_props, begin, end) {
	let pt_geom = new THREE.ConeGeometry(pt_props.radius, pt_props.height);
	let pt_mat = new pt_props.mat_func(pt_props.material);
	let line_geom = new THREE.Geometry();
	line_geom.vertices.push(begin);
	line_geom.vertices.push(end);
	let line_mat = new line_props.mat_func(line_props.mat_props);
	let edge = new Edge(
		new THREE.Line(line_geom, line_mat),
		new THREE.Mesh(pt_geom, pt_mat),
		pt_props.height
	);
	return edge;
}

function VertexFactory(sphere_props, position) {
	let sphere_geom = new THREE.SphereGeometry(sphere_props.radius * 2);
	let mat_props = sphere_props.material;
	let sphere_mat = new sphere_props.mat_func(mat_props);
	let vertex = new Vertex(new THREE.Mesh(sphere_geom, sphere_mat), position);
	return vertex;
}

function Graph(my_props) {
	this.can_move = false;
	let vertices = {};
	let edges = {};
	let props = my_props;
	let scene = props.scene;
	this.center = props.center;
	window.addEventListener("mousemove", rotateOnMouse.bind(this));
	window.addEventListener("mousedown", allowMove.bind(this));
	window.addEventListener("mouseup", disableMove.bind(this));
	this.addEdge = (p1, p2) => {
		this.addVertex(p1);
		this.addVertex(p2);
		if(!([p1.toArray(), p2.toArray()] in edges)) {
			let edge = EdgeFactory(props.line_props, props.pt_props, p1, p2);
			edges[[p1.toArray(), p2.toArray()]] = edge;
			scene.add(edge.line);
			scene.add(edge.point);
		}
	};
	this.addVertex = (position) => {
		if (!(position in vertices)) {
			let v = VertexFactory(props.vertex_props, position);
			vertices[position.toArray()] = v;
			scene.add(v.sphere);
		}
	};
}
