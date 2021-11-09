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
        let userLocked : boolean = userIsLockedOut(username);

        if (userLocked) {
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
              if(kio.sessions[data.id] !== '__proto__') {
                kio.sessions[data.id].numberOfConnections++;
                console.log('::: session %s for user %s added tab %s for a total of %s', socket.id, socket.koheseUser.username, data.clientTabId, kio.sessions[data.id].numberOfConnections);
              } else {
                return;
              }
            } else {
              console.log('*** session %s for user %s attempted to increment connection count for tab %s before establishing session.', socket.id, socket.koheseUser.username, data.clientTabId);
            }
          });
          socket.on('connectionRemoved', (data: any, sendResponse: () => void) => {
            if (kio.sessions[data.id]) {
              if(kio.sessions[data.id] !== '__proto__') {
                kio.sessions[data.id].numberOfConnections--;
                console.log('::: session %s for user %s removed tab %s for a total of %s', socket.id, socket.koheseUser.username, data.clientTabId, kio.sessions[data.id].numberOfConnections);
              } else {
                return;
              }
            } else {
              console.log('*** session %s for user %s attempted to decrement connection count for tab %s before establishing session.', socket.id, socket.koheseUser.username, data.clientTabId);
            }
          });
          socket.on('getSessionMap', (data: any, sendResponse: (data:
            any) => void) => {
            sendResponse(kio.sessions);
          });

          socket.on('Admin/lockoutUser', function(request, sendResponse) {
            console.log('::: session %s: Received lockoutUser for %s for user %s at %s',
              socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
            console.log(request);
            let userLockoutAdded = lockoutUser(request.username);
            sendResponse({
              username: request.username,
              userLockoutAdded: userLockoutAdded
            });
          });

          socket.on('Admin/reinstateUser', function(request, sendResponse) {
            console.log('::: session %s: Received reinstateUser for %s for user %s at %s',
              socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
            console.log(request);
            let userLockoutRemoved = reinstateUser(request.username);
            sendResponse({
              username: request.username,
              userLockoutRemoved: userLockoutRemoved
            });
          });

          socket.on('Admin/getUserLockoutList', function(request, sendResponse) {
            console.log('::: session %s: Received getUserLockoutList for %s for user %s at %s',
              socket.id, request.id, socket.koheseUser.username, socket.handshake.address);
            sendResponse({
              userLockoutList: userLockoutList
            });
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

let userLockoutList: Array<string> = kdbFS.loadJSONDocIfItExists(userLockoutFile) || [];
function userIsLockedOut(username: string): boolean {
  let userLocked : boolean = false;
  userLocked = (userLockoutList.indexOf(username) !== -1);
  if (userLocked) {
    console.log('*** User %s is locked out.', username);
  }

  return userLocked;
}

function lockoutUser(username: string): boolean {
  let lockoutListUpdated: boolean = false;
  if (!userIsLockedOut(username)) {
    userLockoutList.push(username);
    kdbFS.storeJSONDoc(userLockoutFile, userLockoutList);
    lockoutListUpdated = true;
  }

  return lockoutListUpdated;
}

function reinstateUser(username: string): boolean {
  let lockoutListUpdated: boolean = false;
  if (userIsLockedOut(username)) {
    let userIndex = userLockoutList.indexOf(username);
    userLockoutList.splice(userIndex,1);
    kdbFS.storeJSONDoc(userLockoutFile, userLockoutList);
    lockoutListUpdated = true;
  }

  return lockoutListUpdated;
}

// lockoutUser('test');

// reinstateUser('test');
