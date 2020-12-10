
var kio : any = {};
var kdbFS = require('./kdb-fs');
const userLockoutFile = 'koheseUserLockout.json';

kio.sessions = {};

function Server(httpsServer, options){

  if (!kio.server){
    console.log('::: Starting KIO Server');
    kio.server =  require('socket.io')(httpsServer, options);
  } else {
    // Server has already been created
    console.log('!!! Attempted to start KIO Server again');
    return kio.server;
  }

  var decodeAuthToken = require('./boot/routes').decodeAuthToken;

  kio.server.on('connection', function (socket) {
      console.log('>>> session %s connected from %s', socket.id, socket.handshake.address);

      socket.on('authenticate', function(request) {
        socket.koheseUser = decodeAuthToken(request.token);
        console.log('>>>> session %s is user %s', socket.id, socket.koheseUser.username);

        let username = socket.koheseUser.username;
        let userLockoutList;
        let userIsLockedOut : boolean = false;
        try {
          userLockoutList = kdbFS.loadJSONDocIfItExists(userLockoutFile)
          if (userLockoutList && userLockoutList.length){
            console.log("::: Found User Lockout List: " + userLockoutList);
            userIsLockedOut = userLockoutList.indexOf(username) > -1;
          }
        } catch (error) {
          console.log('*** Error: ' + error);
        }

        if (userIsLockedOut) {
          console.log('*** User is locked out: ' + username);
          socket.emit('userLockedOut');
        } else {

          socket.emit('authenticated');

          kio.sessions[socket.id] = {
            sessionId: socket.id,
            address: socket.handshake.address,
            username: socket.koheseUser.username,
            numberOfConnections: 0
          };
          global['app'].emit('newSession', socket);
          socket.on('connectionAdded', (data: any, sendResponse: () => void) => {
            if (kio.sessions[data.id]) {
              kio.sessions[data.id].numberOfConnections++;
              console.log('::: session %s for user %s added tab %s for a total of %s', socket.id, socket.koheseUser.username, data.clientTabId, kio.sessions[data.id].numberOfConnections);
            } else {
              console.log('*** session %s for user %s attempted to increment connection count for tab %s before establishing session.', socket.id, socket.koheseUser.username, data.clientTabId);
            }
          });
          socket.on('connectionRemoved', (data: any, sendResponse: () => void) => {
            if (kio.sessions[data.id]) {
              kio.sessions[data.id].numberOfConnections--;
              console.log('::: session %s for user %s removed tab %s for a total of %s', socket.id, socket.koheseUser.username, data.clientTabId, kio.sessions[data.id].numberOfConnections);
            } else {
              console.log('*** session %s for user %s attempted to decrement connection count for tab %s before establishing session.', socket.id, socket.koheseUser.username, data.clientTabId);
            }
          });
          socket.on('getSessionMap', (data: any, sendResponse: (data:
            any) => void) => {
            sendResponse(kio.sessions);
          });
        }
      });
      socket.on('disconnect', function () {
        var username = 'Unknown';
        if (socket.koheseUser){
          username = socket.koheseUser.username;
        }
        console.log('>>> session %s: user %s disconnected from %s', socket.id, username, socket.handshake.address);
        if(kio.sessions[socket.id]){
          delete kio.sessions[socket.id];
        }
      });
  });

  return kio.server;

}

module.exports = kio;
module.exports.Server = Server;
