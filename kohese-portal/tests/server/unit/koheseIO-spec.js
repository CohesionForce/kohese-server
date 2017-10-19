const SocketMock = require('../../../node_modules/socket.io-mock/dist/index.min.js'); //temp
const EventEmitter = require('events');
var kdb = require("../../../server/kdb.js");

global.app = new EventEmitter();


describe("Test KIO", ()=> {
    it("Tests KIO Running", ()=> {
        expect(true).toBeTruthy();
    });
    
    it("Waits for KDB to Load", (done)=> {
      console.log("::: Waiting on KDB to load");
      kdb.initialize().then(()=>{
        done();
      });
    });

    it("Tests Launching Server", () => {
      var kio = require("../../../server/koheseIO.js");
      console.log("KIO Started");
      console.log(kio.Server);

      kio.server = new SocketMock();
      console.log(kio.server);
      
            
    });

    it("Tests Launching Server Again", (done) => {
      var kio = require("../../../server/koheseIO.js");
      console.log("KIO Started Again");
      console.log(kio.server);

      // Initialize additional socket parameters
      var socket = kio.server.socketClient;
      
      socket.id = "Session-01";
      
      socket.handshake = {};
      socket.handshake.address = "1.2.3.4";
      
      socket.koheseUser = {};
      socket.koheseUser.username = "TestUser";

      // Initialize KIO Item Server
      var itemServer = require("../../../server/kio-itemServer.js");
      global.app.emit("newSession", socket);
      
      // Request items be staged
      var request = ["1","2","3"];

      kio.server.onEmit('VersionControl/statusUpdated', (statusMap)=>{
        console.log("::: Received statusUpdated");
        console.log(statusMap);
        done();
      });

      console.log("::: First try");
      kio.server.socketClient.emit('VersionControl/add', request);

      console.log("::: Second try");
      kio.server.emitEvent('VersionControl/add', request);
      
      console.log("::: Third try");
      kio.server.socketClient.emit('VersionControl/add', request, (results)=> {
        console.log("::: Add Results");
        console.log(results);
      });

    });

    it("Should indicate unmodified item can not be staged", (done) => {
      console.log("::: Trying to call the kdbRepo.add with an item that is not modified");
      var proxies = [];
      var itemId = "87a2bf30-9a96-11e5-a88b-13b67c50fa38";
      var proxy = kdb.ItemProxy.getProxyFor(itemId);
      proxies.push(proxy);

      kdb.kdbRepo.add(proxies).then(function (addStatusMap) {
        console.log('::: Added proxy');
        //sendResponse(addStatusMap);
        //sendStatusUpdates(proxies);
        console.log(addStatusMap);
        expect(addStatusMap[itemId]).toBe(false);
        
        done();
      }).catch(function (err) {
        console.log("*** Received expected error");
        console.log(err);
//        sendResponse({
//          error: err
//        });
        done();
      });
    });

    it("Should detect invalid id", (done) => {
      console.log("::: Trying to call the kdbRepo.add with an item that is not modified");
      var proxies = [];
      var itemId = "invalid-id";
      var proxy = kdb.ItemProxy.getProxyFor(itemId);
      proxies.push(proxy);

      kdb.kdbRepo.add(proxies).then(function (addStatusMap) {
        console.log('::: Added proxy');
        //sendResponse(addStatusMap);
        //sendStatusUpdates(proxies);
        console.log(addStatusMap);
        expect(addStatusMap[itemId]).toBe(false);
        
        done();
      }).catch(function (err) {
        console.log("*** Received expected error");
        console.log(err);
//        sendResponse({
//          error: err
//        });
        done();
      });
    });

    

});