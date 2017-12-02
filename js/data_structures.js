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
