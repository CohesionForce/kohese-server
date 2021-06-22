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


var SocketMock = require('../../../node_modules/socket.io-mock/dist/index.min.js'); //temp
var KIOItemServer = require('../../kio-itemServer');

describe('Test the Item Server', ()=> {
    var socket;
    var rcvdStatusMap;
    var expectedStatusMap;
    console.log(KIOItemServer);

    beforeEach(()=>{
        socket = new SocketMock();
        socket.id = 'Session-01';
        socket.handshake = {address: '1.2.3.4'};
        socket.koheseUser = {username: 'TestUser'};

        var ItemServer = new KIOItemServer.KIOItemServer(socket);

        socket.onEmit('VersionControl/statusUpdated', (statusMap)=>{
            rcvdStatusMap = statusMap;
        });
    });

    describe('Test the Version Control Functionality', ()=>{
        describe('Test the Add Message', ()=>{
            it('should add an updated item to the index', (done)=>{


                var req = {proxyIds: ['748b7880-b509-11e7-ba1e-cbd891de1f92']};
                var expectedStatusMap = {'1':['INDEX_ADD']}; //2:INDEX_ADD,3:INDEX_ADD}
                var expectedResults = {'1': true, '2': true,'3':true};


                socket.socketClient.emit('VersionControl/stage',req, (results)=> {
                    expect(rcvdStatusMap).toBe(expectedStatusMap);
                    expect(results).toBe(expectedResults);
                    done();
                });

            });

            it('should add a new item to the index', (done)=>{
                done();
            });

            it('should send an error on non-existant item', (done)=>{
                done();
            });

            it('should do nothing if indexed item is unmodified', (done)=>{
                // expect rcvdstatusmap tobe undefined
                done();
            });

            it('should add an indexed item with new modifications', (done)=>{
                done();
            });

        });

        describe('Test the Push Message', ()=>{

        });

        describe('Test the Commit message', ()=>{

        });

        describe('Test the Add Remote Message', ()=>{

        });

        describe('Test the Get Remotes message', ()=>{

        });

    });

});
