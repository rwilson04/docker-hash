var app = (function(app) {
// Load the http module to create an http server.
var http         = require('http');
var url          = require('url');
var lowers       = "abcdefghjkmnpqrstuvwxyz";
var capitals     = "ABCDEFGHJKLMNPQRSTUVWXYZ";
var numbers      = "123456789";
var specials     = "*#$!.";
//var letters      = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!*$";
var letters = lowers + capitals + numbers + specials;
var outputLength = 10;

function hash(input) {
	var hash = 0, i, chr, len;
	if (input.length == 0) return hash;
	for (i = 0, len = input.length; i < len; i++) {
		chr   = input.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash = hash >>> 0; // Convert to 32bit unsigned integer
	}
	return hash;
}

function generate(seed, length, available) {
	seed = seed % 2147483647;
	if (seed <= 0) {
		seed += 2147483646;
	}
	console.log("generating length " + length + "for seed " + seed);
	var output = "";
	var i;
	var index;
	for (i = 0; i < length; i++) {
		seed = seed * 16807 % 2147483647;
		index = seed % available.length;
		output = output + available.substring(index, index + 1);
	}
	return output;
}

function next(input, callbacks) {
	console.log("next on " + input);
	var callback = callbacks.shift();
	return callback(input, callbacks);
}

function lower(input, callbacks) {
	console.log("lower");
	//if (input.match(new RegExp("[a-z]")) === null) {
		input = add(input, lowers);
	//}
	return next(input, callbacks);
}

function capital(input, callbacks) {
	console.log("capital");
	//if (input.match(new RegExp("[A-Z]")) === null) {
		input = add(input, capitals);
	//}
	return next(input, callbacks);
}

function num(input, callbacks) {
	console.log("num");
	//if (input.match(new RegExp("[0-9]")) === null) {
		input = add(input, numbers);
	//}
	return next(input, callbacks);
}

function special(input, callbacks) {
	console.log("special");
	//if (input.match(new RegExp("[" + specials + ]")) === null) {
		input = add(input, specials);
	//}
	return next(input, callbacks);
}

function add(input, range) {
	var output = generate(app.hash, 1, range);
	output = input + output;
	return output;
}

function write(text) {
	console.log("writing:" + text);
	app.response.write(text);
	return text;
	//response.write(text);
}

function route(path) {
	console.log("routing: " + path);
	var components = path.split("/");
	var base = components[0];
	if (base === "favicon.ico") {
		console.log("skipping favicon");
		return "";
	}
	var callbacks = [];
	if (components.length === 1) {
		//default
		callbacks = [lower, num, special, capital, write];
	} else {
		callbacks = [write];
	}

	app.hash = hash(base.toLowerCase());
	var generated = generate(app.hash, outputLength - (callbacks.length - 1), letters);
	return next(generated, callbacks);
}

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
		app.request  = request;
		app.response = response;
		app.path     = url.parse(request.url).pathname.substring(1);
		console.log("Serving " + request.url);
		response.writeHead(200, {"Content-Type": "text/plain"});
		//var seed      = hash(path);
		//var generated = generate(seed);
		var result = route(app.path);
		console.log("result:" + result);
		//response.write(result);
		response.end();
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(80);

// Put a friendly message on the terminal
console.log("Server running again");
})(app || {});
