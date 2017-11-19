'use strict';
let env = {};
var graph;
function initEnv() {
	env.renderer = new THREE.WebGLRenderer({antialias: true});
	env.renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(env.renderer.domElement);

	env.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	env.camera.position.set(0, 10, 0);
	env.camera.lookAt(new THREE.Vector3(0, 0, 0));

	env.light = new THREE.PointLight(0xdd90a5, 20, 0);
	env.light.position.set(0, 20, 0);
	env.light2 = new THREE.PointLight(0xdd90a5, 20, 0);
	env.light2.position.set(0, -20, 0);

	env.scene = new THREE.Scene();
	env.scene.add(env.light);
	env.scene.add(env.light2);
	env.can_move = false;
	env.center = new THREE.Vector3(0,0,0);
}

let animate = function () {
	requestAnimationFrame( animate );

	env.renderer.render(env.scene, env.camera);
};

function makeGraph() {
	graph = new Graph({
		center: new THREE.Vector3(0,0,0),
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
}

initEnv();
makeGraph();
animate();
