const SocketMock = require('../../../node_modules/socket.io-mock/dist/index.min.js'); //temp

describe('Fast and isolated socket tests', function(){
    it('Sockets should be able to talk to each other without a server', function(done) {
        var socket = new SocketMock();

        socket.on('message', function (message) {
            console.log("::: Received message");
            console.log(message);
            expect(message).toBe('Hello World!');
            done();
        });
        socket.socketClient.emit('message', 'Hello World!');
    });
});
