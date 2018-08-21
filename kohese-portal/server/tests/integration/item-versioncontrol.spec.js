/*
    This spec tests the version control systems ability to perform various
    functionalities such as add, commit, delete, and pushing of items
*/

const SocketMock = require('../../../node_modules/socket.io-mock/dist/index.min.js'); //temp
const EventEmitter = require('events');
var kdb = require('../../../server/kdb');

global.app = new EventEmitter();


describe('Version Control', ()=>{
    describe('Add Message', ()=>{
        it('should add an updated item to the index', (done)=>{


            var req = {proxyIds: ['748b7880-b509-11e7-ba1e-cbd891de1f92']};
            var expectedStatusMap = {'1':['INDEX_ADD']};
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
