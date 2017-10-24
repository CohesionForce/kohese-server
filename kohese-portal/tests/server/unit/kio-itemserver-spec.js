var SocketMock = require('../../../node_modules/socket.io-mock/dist/index.min.js'); //temp

describe("Test the Item Server", ()=> {
    var socket;
    var rcvdStatusMap;
    var expectedStatusMap 
    
    beforeEach(()=>{
        socket = new SocketMock();


        socket.onEmit('VersionControl/statusUpdated', (statusMap)=>{
            rcvdStatusMap = statusMap;
        })
    })

    describe("Test the Version Control Functionality", ()=>{
        describe("Test the Add Message", ()=>{
            it("should add an updated item to the index", ()=>{

                
                var req = ["1","2","3"];
                var expectedStatusMap = {"1":["INDEX_ADD"]}//2:INDEX_ADD,3:INDEX_ADD}
                var expectedResults = {"1": true, "2": true,"3":true}

                            
                socket.socketClient.emit('VersionControl/add',req, (results)=> {
                    expect(rcvdStatusMap).toBe(expectedStatusMap);
                    expect(results).toBe(expectedResults);
                })
                
            })
            it("should add a new item to the index", ()=>{

            })
            it("should send an error on non-existant item", ()=>{

            })
            it("should do nothing if indexed item is unmodified", ()=>{
                // expect rcvdstatusmap tobe undefined
            })
            it("should add an indexed item with new modifications", ()=>{
                
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