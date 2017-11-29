function dijkstra(start_vtx) {
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
		make_weight(cur.sphere, vtx_map.get(cur));
		unvisited.delete(cur);
		for(var neighbor of graph.neighbors.get(cur).values()) {
			var cur_weight = vtx_map.get(cur);
			var neighbor_weight = vtx_map.get(neighbor);
			var edge_index = [cur.getPosition().toArray(), neighbor.getPosition().toArray()];
			var edge_weight = graph.edges[edge_index].getWeight();
			if(neighbor_weight > (cur_weight + edge_weight)) {
				vtx_map.set(neighbor, cur_weight + edge_weight);
				tree_edges.set(neighbor, graph.edges[edge_index]);
			}
			pq.queue([neighbor, vtx_map.get(neighbor)]);
		}
	}
	for (var edge of tree_edges.values())
		edge.setColor("#ffff00")
}

let count = 0;
function DFS_helper(start_vtx, visited, tree_edges) {
	let cur = start_vtx;
	for(var neighbor of graph.neighbors.get(cur).values())
		if(!visited.has(neighbor)) {
			visited.add(neighbor)
			var edge_index = [cur.getPosition().toArray(), neighbor.getPosition().toArray()];
			tree_edges.set(neighbor, [graph.edges[edge_index], ++count]);
			DFS_helper(neighbor, visited, tree_edges);
		}
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

function DFS(start_vtx) {
	let tree_edges = new Map();
	let visited = new Set();
	count = 0;
	visited.add(start_vtx);
	DFS_helper(start_vtx, visited, tree_edges);
	for (var edge of tree_edges.values()) {
		edge[0].setColor("#ffff00");
		make_weight(edge[0].line, edge[1]);
	}
}

function BFS(start_vtx) {
	let q = new Queue(10);
	let visited = new Set();
	let parent = new Map();
	let level = new Map();
	q.enqueue(start_vtx);
	level.set(start_vtx, 0);
	let tree_edges = new Map();
	while(!q.empty()) {
		var cur = q.dequeue();
		visited.add(cur);
		for(var neighbor of graph.neighbors.get(cur).values())
			if(!visited.has(neighbor)) {
				q.enqueue(neighbor);
				var edge_index = [cur.getPosition().toArray(), neighbor.getPosition().toArray()];
				parent.set(neighbor, cur);
				level.set(neighbor, level.get(cur) + 1);
				tree_edges.set(neighbor, [graph.edges[edge_index], level.get(neighbor)]);
			}
	}
	for (var edge of tree_edges.values()) {
		edge[0].setColor("#ffff00");
		make_weight(edge[0].line, edge[1]);
	}
}
