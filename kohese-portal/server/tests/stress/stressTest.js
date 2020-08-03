/** This script launches as arbitrary number of GET requests against the server
 *  to test server performance under load.
 *  
 *  usage: node tests/stressTest.js <itemId> <numberOfReqs> <delayInMS>
 */

  // TODO: Determine if there is an https change required

const http = require('http');

var itemId;
var numOfRequests;
var displayResponse = false;
var exitOnErrorResponse = false;

if(process.argv[4] && !isNaN(Number(process.argv[4]))) {
    itemId = process.argv[2];
    numOfRequests = Number(process.argv[3]);
    delayInMS = Number(process.argv[4]);
    
} else {
    console.log('Usage: node server/tests/stress/stressTest.js <itemId> <numberOfReqs> <delayInMS>');
    process.exit();
}

var accessToken = getAccessToken();

// Begin stress tests

var successful = 0;
for(var i = 0; i < numOfRequests; i++) {
    setTimeout(makeGET, i*delayInMS, i);
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
            if (displayResponse || exitOnErrorResponse){
              console.log('*** Received status response ' + response.statusCode + ' after ' + (count+1) + ' requests.');              
            }
            if (exitOnErrorResponse){
              console.log(successful + ' requests completed successfully.');
              process.exit();
            }
            successful++;
        } else {
            successful++;

            if (displayResponse){
              response.on('data', (chunk) => {
                console.log("::: Response - " + count);
                console.log(`BODY: ${chunk}`);
              });
              response.on('end', () => {
                console.log('No more data in response.');
              });              
            }
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

