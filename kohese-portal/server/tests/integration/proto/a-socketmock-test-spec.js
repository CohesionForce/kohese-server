const SocketMock = require('../../../node_modules/socket.io-mock/dist/index.min.js'); //temp
const EventEmitter = require('events');

describe('Fast and isolated socket tests', function(){
    it('Sockets should be able to talk to each other without a server', function(done) {
        var socket = new SocketMock();

        socket.on('message', function (message) {
            console.log('::: Received message');
            console.log(message);
            expect(message).toBe('Hello World!');
            socket.emit('response', 'Howdy');
        });
        
        socket.socketClient.on('response', function (ack){
          console.log('::: Received ack');
          console.log(ack);
          done();
        });

    socket.socketClient.emit('message', 'Hello World!');
    });
    
    it('Simple mock socket', (done) => {
      console.log('::: Trying simple socket mock');
      var server = new EventEmitter();
      
      server.on('command', (request, sendResponse) => {
        console.log('::: Got request');
        console.log(request);
        sendResponse('A Response');
      });
      
      function processResponse(response){
        console.log('::: Got response');
        console.log(response);
        done();
      }
      
      server.emit('command', 'A Request', processResponse);
      
    });
});
