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


const SocketMock = require('../../../node_modules/socket.io-mock/dist/index.min.js'); //temp
const EventEmitter = require('events');
var kdb = require('../../../server/kdb');

global.app = new EventEmitter();


describe('Test KIO', ()=> {
    it('Wait for KDB to Load', (done)=> {
      console.log('::: Waiting on KDB to load');
      kdb.initialize().then(()=>{
        done();
      });
    });

    it('Demo KIO Server Test', (done) => {
      var kio = require('../../../server/koheseIO');
      console.log('KIO Started');

      // Mock initialization by setting kio.server to mock interface
      kio.server = new EventEmitter();

      // Mock the client socket
      var socket = new EventEmitter();

      // Initialize additional socket parameters

      socket.id = 'Session-01';
      socket.handshake = {address: '1.2.3.4'};
      socket.koheseUser = {username: 'TestUser'};

      // Initialize KIO Item Server
      console.log('::: Initialize kio Item Server');
      var itemServer = require('../../../server/kio-itemServer');
      global.app.emit('newSession', socket);

      // Request items be staged
      var itemId = '748b7880-b509-11e7-ba1e-cbd891de1f92';
      var request = {
          proxyIds: undefined
      };

      var eventOrder = [];

      function receivedEvent (event) {
        console.log('--- Received event: ' + event);
        eventOrder.push(event);
        if (eventOrder.length === 2){
          console.log('::: Checking order');
          expect(eventOrder).toBe(['statusUpdated', 'response']);
          done();
        }
      }

      var expectedStatusMap = {};
      expectedStatusMap[itemId] = ['INDEX_MODIFIED'];

      var expectedResponse = {};
      expectedResponse[itemId] = true;

      // Register for notification that would be sent to all connected clients
      kio.server.on('VersionControl/statusUpdated', (statusMap)=>{
        console.log('::: Received statusUpdated');
        console.log(statusMap);
        expect(statusMap).toEqual(expectedStatusMap);
        receivedEvent('statusUpdated');
      });

      console.log('::: Invoke add');
      socket.emit('VersionControl/stage', request, (response) => {
        console.log('::: Add Results');
        console.log(response);
        expect(response).toEqual(expectedResponse);
        receivedEvent('response');
      });

    });

});
