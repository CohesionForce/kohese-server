/** This script launches as arbitrary number of GET requests against the server
 *  to test server performance under load.
 *  
 *  usage: node tests/stressTest.js <itemId> <numberOfReqs>
 */

const http = require('http');

var itemId;
var numOfRequests;

if(process.argv[3] && !isNaN(Number(process.argv[3]))) {
    itemId = process.argv[2];
    numOfRequests = Number(process.argv[3]);
    
} else {
    console.log('Usage: node tests/stressTest.js <itemId> <numberOfReqs>');
    process.exit();
}

var accessToken = getAccessToken();

// Begin stress tests

var successful = 0;
for(var i = 0; i < numOfRequests; i++) {
    makeGET(i);
}

function makeGET(count) {
    var options = {
            host: 'localhost',
            port: 3000,
            path: '/api/Items/' + itemId,
            method: 'GET',
            headers: {
                'Authorization': accessToken
            }
    };
    
    var getRequest = http.request(options, function(response) {
        if(response.statusCode !== 200) {
            console.log('Failed with status ' + response.statusCode + ' after ' + (count+1) + ' requests.');
            console.log(successful + ' requests completed successfully.');
            process.exit();
        } else {
            successful++;
        }
            
        if (count === numOfRequests - 1) {
            console.log('All ' + (count+1) + ' requests completed successfully.');
        }
    });
    
    getRequest.setTimeout(5000, function() {
        console.log('Timeout after 5s. Aborting after ' + (count+1) + ' requests.'); 
        console.log(successful + ' requests completed successfully.');
        process.exit();
    });
    
    getRequest.on('error', function(e) {
        console.log(e);
        console.log('Error after ' + (count+1) + ' requests.');
        console.log(successful + ' requests completed successfully.');
        process.exit();
    });
    
    getRequest.end();
}


function getAccessToken() {
    const fs = require('fs');
    var token;
    
    try {
        token = fs.readFileSync('scripts/token.jwt', {encoding: 'utf8'}); 
    } catch(err) {
        console.log('Unable to read scripts/token.jwt');
        console.log('Please run "node . scripts/login.js" to continue');
        process.exit();
    }
    
    return token;
}

