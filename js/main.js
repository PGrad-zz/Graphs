let env = {};

function initEnv() {
	env.renderer = new THREE.WebGLRenderer();
	env.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(env.renderer.domElement);

	env.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	env.camera.position.set(5, 10, 5);
	env.camera.lookAt(new THREE.Vector3(0, 0, 0));

	env.light = new THREE.PointLight(0xdd90a5, 20, 0);
	env.light.position.set(0, 20, 0);

	env.scene = new THREE.Scene();
	env.scene.add(env.light);
}

let animate = function () {
	requestAnimationFrame( animate );

	env.renderer.render(env.scene, env.camera);
};

function makeGraph() {
	let graph = new Graph({
		line_props: {
			material: { color: 0xffffff },
			mat_func: THREE.LineBasicMaterial
		},
		pt_props: {
			material: { color: 0xff0000 },
			radius: 0.2,
			height: 0.4,
			mat_func: THREE.MeshLambertMaterial
		},
		vertex_props: {
			material: { color: 0x0000ff },
			radius: 0.1,
			mat_func: THREE.MeshLambertMaterial
		},
		scene: env.scene
	});
	pos = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(5, 0, 0),
		new THREE.Vector3(-5, 0, 0),
		new THREE.Vector3(0, 0, 5),
		new THREE.Vector3(0, 0, -5),
		new THREE.Vector3(0, 5, 0),
		new THREE.Vector3(0, -5, 0)
	];
	graph.addEdge(pos[0], pos[1]);
	graph.addEdge(pos[0], pos[2]);
	graph.addEdge(pos[1], pos[3]);
	graph.addEdge(pos[0], pos[3]);
	graph.addEdge(pos[0], pos[4]);
	graph.addEdge(pos[0], pos[5]);
	graph.addEdge(pos[0], pos[6]);
}

initEnv();
makeGraph();
animate();
