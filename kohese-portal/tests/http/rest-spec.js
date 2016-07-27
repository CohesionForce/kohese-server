/** This test performs the following operations to ensure the server
 *  has basic rest functionality.
 *  Login, PUT, GET, POST, GET, DELETE, GET
 */
var http = require('http');
var accessToken = 'Bearer ';
var random = Math.floor((Math.random() * 1000) + 1)
var initialItem = {
	parentId: "",
	name: "Test" + random,
	description: "Test",
	tags: "Test"
};

var item;
var newName = initialItem.name + "a";
var firstMod;

describe("Admin", function() {
	it("should login and retrieve access token", function(done) {
		var loginData = '{"username":"admin","password":"kohese"}';
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/login',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json;charset=UTF-8',
					'Content-Length': Buffer.byteLength(loginData)
				}
		};
		var loginRequest = http.request(options, loginCallback);

		loginRequest.on('error', function(e) {
			expect(e).toBe(false);
			console.log(e);
			done();
		});

		loginRequest.setTimeout(5000, function() {
			console.log('Timeout after 5s...Aborting...'); 
			expect(true).toBe(false);
			loginRequest.abort();
			done();
		});

		loginRequest.write(loginData);
		loginRequest.end();

		function loginCallback(response) {
			expect(response.statusCode).toBe(200);
			response.on('data', function (chunk) {
				accessToken += chunk;
			});
			response.on('end', function() {
				done();
			});
		};
	});
});

describe("POST new item", function() {
	it("should put item " + initialItem.name, function(done) {
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/api/Items/',
				method: 'POST',
				headers: {
					'Authorization': accessToken,
					'Content-Type': 'application/json;charset=UTF-8',
					'Content-Length': Buffer.byteLength(JSON.stringify(initialItem))
				}
		};

		var putRequest = http.request(options, putCallback);

		putRequest.on('error', function(e) {
			expect(e).toBe(false);
			console.log(e);
			done();
		});

		putRequest.setTimeout(5000, function() {
			console.log('Timeout after 5s...Aborting...'); 
			expect(true).toBe(false);
			putRequest.abort();
			done();
		});

		putRequest.write(JSON.stringify(initialItem));
		putRequest.end();

		function putCallback(response) {
			expect(response.statusCode).toBe(200);
			var tempitem = '';
			response.on('data', function (chunk) {
				tempitem += chunk;
			});
			response.on('end', function() {
				tempitem = JSON.parse(tempitem);
				item = tempitem;
				initialItem.id = item.id;
				firstMod = item.modifiedOn;
				expect(initialItem.id).not.toBe(false);
				expect(item.name).toBe(initialItem.name);
				done();
			});
		};
	});
});

describe("GET new item", function() {
	it("should get the new item", function(done) {
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/api/Items/' + initialItem.id,
				method: 'GET',
				headers: {
					'Authorization': accessToken
				}
		};
		var getRequest = http.request(options, getCallback);

		getRequest.on('error', function(e) {
			expect(e).toBe(false);
			console.log(e);
			done();
		});

		getRequest.setTimeout(5000, function() {
			console.log('Timeout after 5s...Aborting...'); 
			expect(true).toBe(false);
			loginRequest.abort();
			done();
		});

		getRequest.end();

		function getCallback(response) {
			expect(response.statusCode).toBe(200);
			var output = '';
			response.on('data', function (chunk) {
				output += chunk;
			});
			response.on('end', function() {
				output = JSON.parse(output);
				expect(JSON.stringify(output)).toBe(JSON.stringify(item));
				done();
			});
		};
	});
});

describe("Modify via PUT", function() {
	it("should modify " + initialItem.name + " to " + newName, function(done) {
		initialItem.name = newName;
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/api/Items/',
				method: 'PUT',
				headers: {
					'Authorization': accessToken,
					'Content-Type': 'application/json;charset=UTF-8',
					'Content-Length': Buffer.byteLength(JSON.stringify(initialItem))
				}
		};
		
		var putRequest = http.request(options, putCallback);

		putRequest.on('error', function(e) {
			expect(e).toBe(false);
			console.log(e);
			done();
		});

		putRequest.setTimeout(5000, function() {
			console.log('Timeout after 5s...Aborting...'); 
			expect(true).toBe(false);
			putRequest.abort();
			done();
		});

		putRequest.write(JSON.stringify(initialItem));
		putRequest.end();

		function putCallback(response) {
			expect(response.statusCode).toBe(200);
			var tempitem = '';
			response.on('data', function (chunk) {
				tempitem += chunk;
			});
			response.on('end', function() {
				item = JSON.parse(tempitem);
				expect(item.id).toBe(initialItem.id);
				expect(item.name).toBe(newName);
				expect(item.modifiedOn).not.toBe(firstMod);
				done();
			});
		};
	});
});

describe("GET modified item", function() {
	it("should verify the item has been changed", function(done) {
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/api/Items/' + initialItem.id,
				method: 'GET',
				headers: {
					'Authorization': accessToken
				}
		};
		var getRequest = http.request(options, getCallback);

		getRequest.on('error', function(e) {
			expect(e).toBe(false);
			console.log(e);
			done();
		});

		getRequest.setTimeout(5000, function() {
			console.log('Timeout after 5s...Aborting...'); 
			expect(true).toBe(false);
			loginRequest.abort();
			done();
		});

		getRequest.end();

		function getCallback(response) {
			expect(response.statusCode).toBe(200);
			var output = '';
			response.on('data', function (chunk) {
				output += chunk;
			});
			response.on('end', function() {
				output = JSON.parse(output);
				expect(JSON.stringify(output)).toBe(JSON.stringify(item));
				done();
			});
		};
	});
});

describe("DELETE item", function() {
	it("should DELETE " + initialItem.name, function(done) {
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/api/Items/' + initialItem.id,
				method: 'DELETE',
				headers: {
					'Authorization': accessToken
				}
			};
		var deleteReq = http.request(options, function(response) {
			expect(response.statusCode).toBe(200);
			done();
		});
		
		deleteReq.on('error', function(e) {
			expect(e).toBe(false);
			console.log(e);
			done();
		});

		deleteReq.setTimeout(5000, function() {
			console.log('Timeout after 5s...Aborting...'); 
			expect(true).toBe(false);
			deleteReq.abort();
			done();
		});

		deleteReq.end();
	});
});

describe("GET deleted item", function() {
	it("should return 404", function(done) {
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/api/Items/' + initialItem.id,
				method: 'GET',
				headers: {
					'Authorization': accessToken
				}
		};
		var getRequest = http.request(options, function(response) {
			expect(response.statusCode).toBe(404);
			done();
		});

		getRequest.on('error', function(e) {
			expect(e).toBe(false);
			console.log(e);
			done();
		});

		getRequest.setTimeout(5000, function() {
			console.log('Timeout after 5s...Aborting...'); 
			expect(true).toBe(false);
			loginRequest.abort();
			done();
		});

		getRequest.end();
	});
});
