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
