/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


/**
 *  Connect to a remote Kohese server to access administrative console
 *  usage: node scripts/remoteConnect.js <serverAddress:port>
 *
 *  Note: server must have been launched with an argument 'repl'
 */

var net = require('net');

var server = 'localhost:5001';

if(process.argv[2]) {
    server = process.argv[2];
}
var host = server.split(':')[0];
if(host === 'localhost') {
    host = '127.0.0.1';
}

var port = Number(server.split(':')[1]);
var socket;
var retryCount = 0;

connect();
function connect() {
    socket = net.connect({'host': host, 'port': port}, function() {
        //  redirect I/O for console to socket
        console.log('Connected to REPL Server.');
        retryCount = 0;
        process.stdin.pipe(socket)
        socket.pipe(process.stdout)

        socket.on('close', function() {
           console.log('REPL Server Disconnected');
           retry();
        });
    });

    socket.on('error', function(err) {
        console.log('Error: ' + err.code);
        retry();
    });
}

function retry() {
    console.log('Retrying connection...');
    retryCount++;
    if(retryCount === 11) {
        console.log('Could not connect after 10 tries. Exiting.');
        process.exit();
    }
    setTimeout(connect, 1000);
}
