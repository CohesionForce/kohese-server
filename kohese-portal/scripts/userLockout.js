/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/** This script launches as arbitrary number of GET requests against the server
 *  to test server performance under load.
 *
 *  usage: node scripts/userLockout.ts <username>
 */

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; /* <--- only use for testing purposes */
const socket = require('socket.io-client')('https://localhost:3010');

let username = process.argv[2];
if (!username) {
  console.log('Usage: node scripts/userLockout.ts <username>');
  process.exit();
}

var accessToken = getAccessToken();

socket.on('connect', function () {

  socket.emit('authenticate', {token: accessToken});

  socket.on('authenticated', function () {
    makeRequest(username);
  });

});

function makeRequest(username) {

  socket.emit('Admin/lockoutUser', {username: username}, function(response) {
    if(response.error) {
      console.log(response.error);
      process.exit();
    } else {
      console.log(response);
    }

    process.exit();
  });
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

