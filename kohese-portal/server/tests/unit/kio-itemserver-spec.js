var SocketMock = require('../../../node_modules/socket.io-mock/dist/index.min.js'); //temp
var KIOItemServer = require('../../kio-itemServer.js');

describe("Test the Item Server", ()=> {
    var socket;
    var rcvdStatusMap;
    var expectedStatusMap 
    console.log(KIOItemServer);
    
    beforeEach(()=>{
        socket = new SocketMock();
        socket.id = "Session-01";
        socket.handshake = {address: "1.2.3.4"};
        socket.koheseUser = {username: "TestUser"};

        var ItemServer = new KIOItemServer.KIOItemServer(socket);

        socket.onEmit('VersionControl/statusUpdated', (statusMap)=>{
            rcvdStatusMap = statusMap;
        })
    })

    describe("Test the Version Control Functionality", ()=>{
        describe("Test the Add Message", ()=>{
            it("should add an updated item to the index", (done)=>{

                
                var req = {proxyIds: ["1","2","3"]};
                var expectedStatusMap = {"1":["INDEX_ADD"]}//2:INDEX_ADD,3:INDEX_ADD}
                var expectedResults = {"1": true, "2": true,"3":true}

                            
                socket.socketClient.emit('VersionControl/add',req, (results)=> {
                    expect(rcvdStatusMap).toBe(expectedStatusMap);
                    expect(results).toBe(expectedResults);
                    done();
                })
                
            })
            it("should add a new item to the index", (done)=>{
                done()
            })
            it("should send an error on non-existant item", (done)=>{
                done();
            })
            it("should do nothing if indexed item is unmodified", (done)=>{
                // expect rcvdstatusmap tobe undefined
                done();
            })
            it("should add an indexed item with new modifications", (done)=>{
                done();
            })
        })
        describe("Test the Push Message", ()=>{
            
        })
        describe("Test the Commit message", ()=>{

        })
        describe("Test the Add Remote Message", ()=>{

        })
        describe("Test the Get Remotes message", ()=>{

        })
    })
})