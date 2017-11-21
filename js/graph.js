'use strict';
function Edge(line = undefined) {
	this.line = line;
	this.remove = () => {
		env.scene.remove(this.line);
	}
}

function DirEdge(line = undefined, point = undefined, height = undefined) {
	Edge.call(this, line);
	let dir = new THREE.Vector3(0,0,0); 
	dir.subVectors(line.geometry.vertices[1], line.geometry.vertices[0]);
	dir.setLength(1);
	let correct = new THREE.Quaternion();
	correct.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
	let diff = new THREE.Vector3(0,0,0);
	diff.subVectors(line.geometry.vertices[1], line.geometry.vertices[0]);
	diff.setLength(height);
	this.point = point;
	this.point.position.subVectors(line.geometry.vertices[1], diff);
	this.point.applyQuaternion(correct);
	this.getID = () => {
		return this.line.uuid;
	};
	this.remove = () => {
		env.scene.remove(this.line);
		env.scene.remove(this.point);
	}
}

function Vertex(sphere = undefined, position = undefined) {
	this.sphere = sphere;
	this.sphere.position.set(position.x, position.y, position.z);
	this.getID = () => {
		return this.sphere.uuid;
	};
	this.remove = () => {
		env.scene.remove(this.sphere);
	}
}

function EdgeFactory(line_props, begin, end) {
	let line_geom = new THREE.Geometry();
	line_geom.vertices.push(begin);
	line_geom.vertices.push(end);
	let line_mat = new line_props.mat_func(line_props.mat_props);
	let edge = new Edge(
		new THREE.Line(line_geom, line_mat)
	);
	return edge;
}

function DirEdgeFactory(line_props, pt_props, begin, end) {
	let pt_geom = new THREE.ConeGeometry(pt_props.radius, pt_props.height);
	let pt_mat = new pt_props.mat_func(pt_props.material);
	let line_geom = new THREE.Geometry();
	line_geom.vertices.push(begin);
	line_geom.vertices.push(end);
	let line_mat = new line_props.mat_func(line_props.mat_props);
	let edge = new DirEdge(
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
	let vertices = {};
	let edges = {};
	let props = my_props;
	let scene = props.scene;
	this.center = env.center;
	this.edge_pair = [];
	this.addEdge = (p1, p2) => {
		if(this.findVertex(p1) === null || this.findVertex(p2) === null)
			return;
		let p1_index = p1.toArray(), p2_index = p2.toArray();
		if(!([p1_index, p2_index] in edges)) {
			let edge = EdgeFactory(props.line_props, p1, p2);
			edges[[p1_index, p2_index]] = [edge, 0];
			this.edge_pair[edge.line.uuid] = [p1, p2];
			env.edge_parent[edge.line.uuid] = this;
			scene.add(edge.line);
		}
	};
	this.addDirEdge = (p1, p2) => {
		if(this.findVertex(p1) === null || this.findVertex(p2) === null)
			return;
		let p1_index = p1.toArray(), p2_index = p2.toArray();
		if(!([p1_index, p2_index] in edges) || edges[[p1_index, p2_index]][1] == 0) {
			if([p1_index, p2_index] in edges)
				edges[[p1_index,p2_index]][0].remove();
			let edge = DirEdgeFactory(props.line_props, props.pt_props, p1, p2);
			edges[[p1_index, p2_index]] = [edge, 1];
			this.edge_pair[edge.line.uuid] = [p1, p2];
			env.edge_parent[edge.line.uuid] = this;
			scene.add(edge.line);
			scene.add(edge.point);
		}
	};
	this.addVertex = (position) => {
		if (!(position.toArray() in vertices)) {
			let v = VertexFactory(props.vertex_props, position);
			vertices[v.sphere.position.toArray()] = v;
			env.vertex_parent[v.sphere.uuid] = this;
			scene.add(v.sphere);
		}
		if(vertices.length === 1)
			this.center = v.sphere.position;
	};
	this.findVertex = (position) => {
		if(position.toArray() in vertices)
			return vertices[position.toArray()];
		return null;
	};
}
