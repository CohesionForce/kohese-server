
var kio = {};

kio.sessions = {};

function Server(httpServer, options){
  
  if (!kio.server){
    console.log("::: Starting KIO Server");
    kio.server =  require('socket.io')(httpServer, options);
  } else {
    // Server has already been created
    console.log("!!! Attempted to start KIO Server again");
    return kio.server;
  }
  
  var decodeAuthToken = require('./boot/routes.js').decodeAuthToken;

  kio.server.on('connection', function (socket) {
      console.log('>>> session %s connected from %s', socket.id, socket.handshake.address);
      
      socket.on('authenticate', function(request) {
        socket.koheseUser = decodeAuthToken(request.token); 
        console.log('>>>> session %s is user %s', socket.id, socket.koheseUser.username);
        socket.emit('authenticated');
        socket.emit('session/list', kio.sessions);
        kio.sessions[socket.id] = {
            sessionId: socket.id,
            address: socket.handshake.address,
            username: socket.koheseUser.username
          };
        kio.server.emit('session/add',kio.sessions[socket.id]);
      });
      socket.on('disconnect', function () {
        var username = "Unknown";
        if (socket.koheseUser){
          username = socket.koheseUser.username;
        }
        console.log('>>> session %s: user %s disconnected from %s', socket.id, username, socket.handshake.address);
        if(kio.sessions[socket.id]){
          socket.broadcast.emit('session/remove',kio.sessions[socket.id]);
          delete kio.sessions[socket.id];                
        }
      });
  });

  kio.server.on('connection', function (socket) {

      console.log('>>>2 session %s connected from %s', socket.id, socket.handshake.address);
      socket.on('Item/findById', function(request, callback){
        console.log('::: session %s: Received findById for %s for user %s at %s', socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
        console.log(request);
        var proxy = kdb.ItemProxy.getProxyFor(request.id);
        callback({
          kind: proxy.kind,
          item: proxy.item
        });
        console.log("::: Sent findById response for " + request.id);
      });
  });
  
  return kio.server;
  
}

module.exports = kio;
module.exports.Server = Server;
