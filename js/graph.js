'use strict';
function Edge(line = undefined) {
	this.line = line;
	this.type = "undirected";
	this.getWeight = () => {
		return this.line.val;
	}
	this.remove = () => {
		env.scene.remove(this.line);
	}
	this.getID = () => {
		return this.line.uuid;
	};
	this.setColor = (color) => {
		this.line.material.color.set(color);
	}
}

function DirEdge(line = undefined, point = undefined, height = undefined) {
	Edge.call(this, line);
	this.type = "directed";
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
	this.remove = () => {
		env.scene.remove(this.line);
		env.scene.remove(this.point);
	}
}

function Vertex(sphere = undefined, position = undefined) {
	this.sphere = sphere;
	this.sphere.position.set(position.x, position.y, position.z);
	this.getWeight = () => {
		return this.sphere.val;
	}
	this.getPosition = () => {
		return this.sphere.position;
	}
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
	let props = my_props;
	let scene = props.scene;
	this.center = env.center;
	this.edges = {};
	this.edge_pair = [];
	this.vertices = {};
	this.neighbors = new Map();
	let map_neighbors = (v1, v2) => {
		if(!this.neighbors.has(v1))
			this.neighbors.set(v1, new Set([v2]));
		else
			this.neighbors.set(v1, this.neighbors.get(v1).add(v2));
	};
	this.addEdge = (p1, p2) => {
		if(this.findVertex(p1) === undefined || this.findVertex(p2) === undefined)
			return;
		let p1_index = p1.toArray(), p2_index = p2.toArray();
		let edge_pts_1 = [p1_index, p2_index];
		let edge_pts_2 = [p2_index, p1_index];
		if(!(edge_pts_1 in this.edges || edge_pts_2 in this.edges)) {
			let edge = EdgeFactory(props.line_props, p1, p2);
			this.edges[edge_pts_1] = edge;
			this.edges[edge_pts_2] = edge;
			this.edge_pair[edge.line.uuid] = [p1, p2];
			env.edge_parent[edge.line.uuid] = this;
			scene.add(edge.line);
		}
		let v1 = this.findVertex(p1);
		let v2 = this.findVertex(p2);
		map_neighbors(v1, v2);
		map_neighbors(v2, v1);
	};
	this.addDirEdge = (p1, p2) => {
		if(this.findVertex(p1) === undefined || this.findVertex(p2) === undefined)
			return;
		let p1_index = p1.toArray(), p2_index = p2.toArray();
		let edge_pts = [p1_index, p2_index];
		if(!(edge_pts in this.edges || this.edges[edge_pts].type === "undirected")) {
			if(edge_pts in this.edges)
				this.edges[edge_pts].remove();
			let edge = DirEdgeFactory(props.line_props, props.pt_props, p1, p2);
			this.edges[edge_pts] = edge;
			this.edge_pair[edge.line.uuid] = [p1, p2];
			env.edge_parent[edge.line.uuid] = this;
			scene.add(edge.line);
			scene.add(edge.point);
		}
		let v1 = this.findVertex(p1);
		let v2 = this.findVertex(p2);
		map_neighbors(v1, v2);
	};
	this.addVertex = (position) => {
		if (!(position.toArray() in this.vertices)) {
			let v = VertexFactory(props.vertex_props, position);
			this.vertices[v.getPosition().toArray()] = v;
			env.vertex_parent[v.sphere.uuid] = this;
			scene.add(v.sphere);
			if(Object.keys(this.vertices).length === 1)
				this.center = v.getPosition();
		}
	};
	this.findVertex = (position) => {
		if (position.toArray() in this.vertices)
			return this.vertices[position.toArray()];
		return null;
	};
}
