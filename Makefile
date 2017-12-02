all:
	wget "http://threejs.org/build/three.min.js" -O js/three.js && wget "https://raw.githubusercontent.com/adamhooper/js-priority-queue/master/priority-queue.min.js" -O js/priority-queue.js && chmod 644 js/*.js
