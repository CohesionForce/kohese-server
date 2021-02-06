/**
 *
 */


// TODO: Determine if there is an https change required
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; /* <--- only use for testing purposes */
var prompt = require('prompt');
var https = require('https');
var fs = require('fs');

var accessToken = 'Bearer ';

prompt.start();

var filePrompt = {properties: {proceed: {
	description: 'Proceed? (Y/N): ',
	pattern: /^[YNyn]{1}$/,
	message: 'Please enter Y or N',
	required: true}}};

fs.access('./scripts/token.jwt', function(err) {
	if(err && err.code  === 'ENOENT') {
		filePrompt.properties.proceed.description = 'Token file not found. Create new one? (Y/N)';
		prompt.get(filePrompt, function(err, result) {
			if(result.proceed === 'n' || result.proceed === 'N') {
				console.log('Cancelling...');
				process.exit();
			} else if (result.proceed === 'y' || result.proceed === 'Y') {
				beginLogin();
			}
		});
	} else {
		filePrompt.properties.proceed.description = 'Existing token found. Overwite? (Y/N)';
		prompt.get(filePrompt, function(err, result) {
			if(result.proceed === 'n' || result.proceed === 'N') {
				console.log('Cancelling...');
				process.exit();
			} else if (result.proceed === 'y' || result.proceed === 'Y') {
				beginLogin();
			}
		});
	}
});

function  beginLogin() {
	var loginPrompt = {properties: {username: {
		description: 'Username: ',
		type: 'string',
		required: true},

		password: {
			description:'Password: ',
			hidden: true,
			type: 'string',
			required: true
		}}};

	prompt.get(loginPrompt, function (err, result) {
		if(err) {
			console.log('Something unexpected happened during prompt.');
			process.exit();
		}

		var loginData = '{"username":"' + result.username + '","password":"' + result.password + '"}';
		var options = {
        host: 'localhost',
        port: 3010,
        cert: fs.readFileSync('./cert/servercert.pem'),
				path: '/login',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json;charset=UTF-8',
					'Content-Length': Buffer.byteLength(loginData)
				}
		};

		var loginRequest = https.request(options, loginCallback);
		loginRequest.write(loginData);
		loginRequest.end();

		function loginCallback(response) {
			if(response.statusCode !== 200) {
				console.log('Login failed.');
			} else {
				response.on('data', function (chunk) {
					accessToken += chunk;
				});
				response.on('end', function() {
					writeToken();
				});
			}
		};
	});
};

function writeToken() {
	fs.writeFileSync('./scripts/token.jwt', accessToken);
	console.log('Token written.');
};
