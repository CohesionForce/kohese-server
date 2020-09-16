/** This script launches as arbitrary number of GET requests against the server
 *  to test server performance under load.
 *
 *  usage: node tests/kio-stressTest.js <itemId> <numberOfReqs> <delayInMS>
 */

const socket = require('socket.io-client')('https://localhost:3010');

var itemId;
var numOfRequests;
var displayResponse = false;
var exitOnErrorResponse = false;

if(process.argv[4] && !isNaN(Number(process.argv[4]))) {
    itemId = process.argv[2];
    numOfRequests = Number(process.argv[3]);
    delayInMS = Number(process.argv[4]);

} else {
    console.log('Usage: node server/tests/stress/kio-stressTest.js <itemId> <numberOfReqs> <delayInMS>');
    process.exit();
}

var accessToken = getAccessToken();

// Begin stress tests

var successful = 0;

socket.on('connect', function () {

  socket.emit('authenticate', {token: accessToken});

  socket.on('authenticated', function () {
    for(var i = 0; i < numOfRequests; i++) {
        setTimeout(makeGET, i*delayInMS, i);
    }
  });

});


function fetchItem(byId) {

  var promise = new Promise((resolve, reject) => {
    KoheseIO.socket.emit('Item/findById', {id: byId}, function (response) {
      proxy.updateItem(response.kind, response.item);
      proxy.dirty = false;
      resolve(response);
    });
  });

  return promise;
}

function makeGET(count) {

    socket.emit('Item/findById', {id: itemId}, function(response) {
        if(response.error) {
          console.log(e);
          console.log('Error after ' + (count+1) + ' requests.');
          console.log(successful + ' requests completed successfully.');
          process.exit();
        } else {
            successful++;

//            if (displayResponse){
//              response.on('data', (chunk) => {
//                console.log("::: Response - " + count);
//                console.log(`BODY: ${chunk}`);
//              });
//              response.on('end', () => {
//                console.log('No more data in response.');
//              });
//            }
        }

        if (count === numOfRequests - 1) {
            console.log('All ' + (count+1) + ' requests completed successfully.');
            process.exit();
        }
    });

//    getRequest.setTimeout(5000, function() {
//        console.log('Timeout after 5s. Aborting after ' + (count+1) + ' requests.');
//        console.log(successful + ' requests completed successfully.');
//        process.exit();
//    });
//
//    getRequest.on('error', function(e) {
//        console.log(e);
//        console.log('Error after ' + (count+1) + ' requests.');
//        console.log(successful + ' requests completed successfully.');
//        process.exit();
//    });
//
//    getRequest.end();
}


function getAccessToken() {
    const fs = require('fs');
    var token;

    try {
        token = fs.readFileSync('scripts/token.jwt', {encoding: 'utf8'});
        token = token.replace(/^Bearer /, "");
    } catch(err) {
        console.log('Unable to read scripts/token.jwt');
        console.log('Please run "node . scripts/login.js" to continue');
        process.exit();
    }

    return token;
}

