describe('KDB Test', function() {

  var kdb = require('../../../server/kdb.js');
  var ItemProxy = require('../../../common/models/item-proxy.js');
  var root = ItemProxy.getRootProxy();
  var lostAndFound = ItemProxy.getProxyFor('LOST+FOUND');

  var dumpEnabled = false;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dump(message) {
    if (dumpEnabled){
      if (message) {
         console.log('>>> ' + message);
      }

      ItemProxy.dumpAllProxies();
      // console.log('');
      root.dumpProxy();
      // console.log('Root Descendants: ' + root.descendantCount);
      // console.log('');
      lostAndFound.dumpProxy();
      console.log('-----------------------------------------');      
    }
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dumpHashFor(proxy, message) {
    if (dumpEnabled){
      console.log('::: Hash for ' + proxy.item.name);
      if (message) {
         console.log('>>> ' + message);
      }

      console.log(proxy.treeHashEntry);
      console.log('-----------------------------------------');      
    }
  }
  
  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  it('Should Load Kohese KDB', (done)=>{
    dumpEnabled = true;

   
    kdb.initialize('kohese-kdb').then(() => {

      console.log('::: KDB is initialized');

      var rootProxy = kdb.ItemProxy.getRootProxy();
      console.log(rootProxy.item);
    

      ItemProxy.loadingComplete();
//      dump();
    
//      var modelDef = ItemProxy.getModelDefinitions();
      
      var repoTreeHashes = kdb.ItemProxy.getRepoTreeHashes();
//      console.log(repoTreeHashes);
      
      var timeBefore = new Date();
      var treeHashMap = kdb.ItemProxy.getAllTreeHashes();
      var timeAfter = new Date();
      var deltaTime = timeAfter - timeBefore;
      console.log('Time to getAllTH: ' + deltaTime);
      
      var fs = require('fs');
      
      console.log('::: Writing the file');
      fs.writeFileSync('thm.out', JSON.stringify(treeHashMap, null, '  '), {encoding: 'utf8', flag: 'w'});      

      var repoTreeHashMap = kdb.ItemProxy.getRepoTreeHashes();
      fs.writeFileSync('rthm.out', JSON.stringify(repoTreeHashMap, null, '  '), {encoding: 'utf8', flag: 'w'});      
      

      done();
    });
  });

});
