describe("KDB Test", function() {

  var kdb = require('../../../server/kdb.js');
  var ItemProxy = require('../../../common/models/item-proxy.js');
  var root = ItemProxy.getRootProxy();
  var lostAndFound = ItemProxy.getProxyFor("LOST+FOUND");

  var dumpEnabled = false;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dump(message) {
    if (dumpEnabled){
      if (message) {
         console.log(">>> " + message);
      }

      ItemProxy.dumpAllProxies();
      // console.log("");
      root.dumpProxy();
      // console.log("Root Descendants: " + root.descendantCount);
      // console.log("");
      lostAndFound.dumpProxy();
      console.log("-----------------------------------------");      
    }
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dumpHashFor(proxy, message) {
    if (dumpEnabled){
      console.log("::: Hash for " + proxy.item.name)
      if (message) {
         console.log(">>> " + message);
      }

      console.log(proxy.treeHashEntry);
      console.log("-----------------------------------------");      
    }
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it("Should Load Kohese KDB", (done)=>{
    dumpEnabled = true;

   
    kdb.initialize('kohese-kdb').then(() => {

      console.log("::: KDB is initialized");
      try {
        var rootProxy = kdb.ItemProxy.getRootProxy();
        console.log(rootProxy.item);
    
      }
      catch (error){
        console.log("::: Error ")
        console.log(error);
        console.log(error.stack);
        
      }
      
      console.log("------------");

      ItemProxy.loadingComplete();
//      dump();
    
//      var modelDef = ItemProxy.getModelDefinitions();
      
      var repoTreeHashes = kdb.ItemProxy.getRepoTreeHashes();
//      console.log(repoTreeHashes);
      
      console.log("===> Begin Get");
      var timeBefore = new Date();
      var treeHashMap = kdb.ItemProxy.getAllTreeHashes();
      var timeAfter = new Date();
      console.log("===> After Get");
      var deltaTime = timeAfter - timeBefore;
      console.log("Time to getAllTH: " + deltaTime);
      console.log(timeBefore);
      console.log(timeAfter);

      done();
    });
  });

});
