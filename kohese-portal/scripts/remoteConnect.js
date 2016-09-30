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