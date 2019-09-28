const http = require('http');
const os = require('os');

console.log("Node app starting...");

var handler = function(request, response) {
	var remoteIp = request.connection.remoteAddress
	console.log("Received request from " + remoteIp);
	response.writeHead(200);
	response.end("Hello world, you've reached this app version 1.1 running on Kubernetes pod " + os.hostname() + ".\n");
};

var www = http.createServer(handler);
www.listen(8080);
