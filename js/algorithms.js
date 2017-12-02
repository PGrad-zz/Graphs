function clean_nodes() {
	for(var key in graph.vertices)
		remove_weight(graph.vertices[key].sphere);
}

function clean_edges(clean_weights) {
	if(clean_weights)
		for(var key in graph.edges) {
			graph.edges[key].setColor("#ffffff");
			remove_weight(graph.edges[key].line);
		}
	else
		for(var key in graph.edges)
			graph.edges[key].setColor("#ffffff");
}

function get_random_color() {
	let color = "#";
	for(i = 0; i < 6; ++i)
		color += Math.ceil(Math.random() * 15).toString(16);
	return color;
}


function connected_components() {
	clean_nodes();
	clean_edges();
	let all_visited = new Set();
	let color_set = new Set();
	for(var vert in graph.vertices) {
		if(all_visited.has(vert))
			continue;
		var tree_edges = new Map();
		var visited = new Set();
		var start_vtx = graph.vertices[vert];
		var color = "";
		do {
			color = get_random_color();
		} while(color_set.has(color));
		color_set.add(color);
		visited.add(start_vtx);
		DFS_helper(start_vtx, visited, (cur, neighbor) => {
			var edge_index = [cur.getPosition().toArray(), neighbor.getPosition().toArray()];
			tree_edges.set(neighbor, graph.edges[edge_index]);
		});
		for(var el of visited.values()) {
			all_visited.add(el);
			for(var neighbor of graph.neighbors.get(el).values()) {
					var edge_pts = [el.getPosition().toArray(), neighbor.getPosition().toArray()];
					graph.edges[edge_pts].setColor(color);
			}
		}
	}
}

function dijkstra_prim(start_vtx, weight_func, val_func) {
	let vtx_map = new Map();
	for(var v of graph.neighbors.keys())
		vtx_map.set(v, Infinity);
	let unvisited = new Set();
	for(var v of graph.neighbors.keys())
		unvisited.add(v);
	vtx_map.set(start_vtx, 0);
	let pairs = [];
	for(var [vtx, val] of vtx_map.entries())
		pairs.push([vtx, val]);
	let pq = new PriorityQueue({ comparator: (a,b) => { return a[1] - b[1] }, initialValues: pairs });
	let tree_edges = new Map();
	while(unvisited.size > 0) {
		var pair = pq.dequeue();
		var cur = pair[0];
		if(!unvisited.has(cur))
			continue;
		weight_func(cur.sphere, vtx_map.get(cur));
		unvisited.delete(cur);
		for(var neighbor of graph.neighbors.get(cur).values()) {
			if(!unvisited.has(neighbor))
				continue;
			var cur_weight = vtx_map.get(cur);
			var neighbor_weight = vtx_map.get(neighbor);
			var edge_index = [cur.getPosition().toArray(), neighbor.getPosition().toArray()];
			var edge_weight = graph.edges[edge_index].getWeight();
			if(neighbor_weight > val_func(edge_weight, cur_weight)) {
				vtx_map.set(neighbor, val_func(edge_weight, cur_weight));
				tree_edges.set(neighbor, graph.edges[edge_index]);
			}
			pq.queue([neighbor, vtx_map.get(neighbor)]);
		}
	}
	return tree_edges;
}

function prim(start_vtx) {
	let count = 1;
	let tree_edges = dijkstra_prim(start_vtx,
	(node, val) => {
		make_weight(node, count++);
	},
	(edgew, curw) => {
		return edgew;
	});
	clean_edges(false);
	for (var edge of tree_edges.values())
		edge.setColor(env.alg_colors[env.modes.prim])
}

function dijkstra(start_vtx) {
	let tree_edges = dijkstra_prim(start_vtx,
	(node, val) => {
		make_weight(node, val);
	},
	(edgew, curw) => {
		return edgew + curw;
	});
	clean_edges(false);
	for (var edge of tree_edges.values())
		edge.setColor(env.alg_colors[env.modes.dijkstra])
}

let count = 0;
function DFS_helper(start_vtx, visited, actor) {
	let cur = start_vtx;
	for(var neighbor of graph.neighbors.get(cur).values())
		if(!visited.has(neighbor)) {
			visited.add(neighbor)
			actor(cur, neighbor);
			DFS_helper(neighbor, visited, actor);
		}
}

function DFS(start_vtx) {
	let tree_edges = new Map();
	let visited = new Set();
	count = 0;
	visited.add(start_vtx);
	DFS_helper(start_vtx, visited, (cur, neighbor) => {
		var edge_index = [cur.getPosition().toArray(), neighbor.getPosition().toArray()];
		tree_edges.set(neighbor, [graph.edges[edge_index], ++count]);
	});
	clean_nodes();
	clean_edges(true);
	label(tree_edges, env.alg_colors[env.modes.dfs]);
}

function Queue (sz = 10) {
	let q = new Array(sz);
	q.fill(null);
	let size = sz, front = 0, end = 0, elems = 0;
	this.enqueue = (val) => {
	  if(elems === size) {
	    let old_size = size;
			this.double();
			let new_front = front + old_size;
			q.copyWithin(new_front, front, old_size);
			front = new_front;
		}
	  q[end] = val;
	  end = ++end % size;
	  ++elems;
	};
	this.double = () => {
	  if(size === 0)
	    ++size;
	  else {
	    for(i = 0; i < size; ++i)
	      q.push(null);
	   size *= 2;
	  }
	};
	this.empty = () => {
		return elems === 0;
	};
	this.dequeue = () => {
		if(this.empty())
			throw "Empty";
		val = q[front];
		front = ++front % size;
		--elems;
		return val;
	};
}

function BFS(start_vtx) {
	let q = new Queue(10);
	let visited = new Set();
	let parent = new Map();
	let level = new Map();
	q.enqueue(start_vtx);
	level.set(start_vtx, 0);
	visited.add(start_vtx);
	let tree_edges = new Map();
	while(!q.empty()) {
		var cur = q.dequeue();
		for(var neighbor of graph.neighbors.get(cur).values())
			if(!visited.has(neighbor)) {
				visited.add(neighbor);
				q.enqueue(neighbor);
				var edge_index = [cur.getPosition().toArray(), neighbor.getPosition().toArray()];
				parent.set(neighbor, cur);
				level.set(neighbor, level.get(cur) + 1);
				tree_edges.set(neighbor, [graph.edges[edge_index], level.get(neighbor)]);
			}
	}
	clean_nodes();
	clean_edges(true);
	label(tree_edges, env.alg_colors[env.modes.bfs]);
}

function label(tree_edges, color) {
	for (var edge of tree_edges.values()) {
		edge[0].setColor(color);
		make_weight(edge[0].line, edge[1]);
	}
}
