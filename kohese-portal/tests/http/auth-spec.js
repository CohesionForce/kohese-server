/** This will verify basic authentication via http commands
 * 
 */
var http = require('http');

describe("User authentication", function() {
	it("should require a valid password", function(done) {
		var loginData = '{"username":"admin","password":"NotThePassword"}';
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
		
		var loginRequest = http.request(options, function(response) {
			expect(response.statusCode).toBe(401);
			done();
		});
		
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
	});
	
	it("should require a valid user", function(done) {
		var loginData = '{"username":"NotAUser","password":"kohese"}';
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
		
		var loginRequest = http.request(options, function(response) {
			expect(response.statusCode).toBe(401);
			done();
		});
		
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
	});
});

describe("Authentication for rest requests", function() {
	it("should require a valid token to attempt a GET", function(done) {
		var options = {
				host: 'localhost',
				port: 3000,
				path: '/api/Items/' + 'NotanID',
				method: 'GET',
				headers: {
					'Authorization': 'Bearer NotaToken'
				}
		};
		var getRequest = http.request(options, function(response) {
			expect(response.statusCode).toBe(401);
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