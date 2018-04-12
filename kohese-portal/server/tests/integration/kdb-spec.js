describe('KDB Test', function() {

  var kdb = require('../../../server/kdb.js');
  var ItemProxy = require('../../../common/src/item-proxy.js');
  var root = ItemProxy.getWorkingTree().getRootProxy();
  var lostAndFound = ItemProxy.getWorkingTree().getProxyFor('LOST+FOUND');

  var dumpEnabled = false;

  //////////////////////////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////////////////////////
  function dump(message) {
    if (dumpEnabled){
      if (message) {
         console.log('>>> ' + message);
      }

      ItemProxy.getWorkingTree().dumpAllProxies();
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


    kdb.initialize('testKDB').then(() => {

      console.log('::: KDB is initialized');

      var rootProxy = kdb.ItemProxy.getWorkingTree().getRootProxy();
      console.log(rootProxy.item);


      ItemProxy.getWorkingTree().loadingComplete();
//      dump();

//      var modelDef = KoheseModel.getModelDefinitions();

      var repoTreeHashes = kdb.ItemProxy.getWorkingTree().getRepoTreeHashes();
//      console.log(repoTreeHashes);

      var timeBefore = new Date();
      var treeHashMap = kdb.ItemProxy.getWorkingTree().getAllTreeHashes();
      var timeAfter = new Date();
      var deltaTime = timeAfter - timeBefore;
      console.log('Time to getAllTH: ' + deltaTime);

      var fs = require('fs');

      console.log('::: Writing the file');
      fs.writeFileSync('thm.out', JSON.stringify(treeHashMap, null, '  '), {encoding: 'utf8', flag: 'w'});

      var repoTreeHashMap = kdb.ItemProxy.getWorkingTree().getRepoTreeHashes();
      fs.writeFileSync('rthm.out', JSON.stringify(repoTreeHashMap, null, '  '), {encoding: 'utf8', flag: 'w'});

      var timeBeforeGetDoc = new Date();
      let repoAsList = rootProxy.getSubtreeAsList();
      var timeAfterGetDoc = new Date();
      var deltaTimeGetDoc = timeAfterGetDoc - timeBeforeGetDoc;
      console.log('Item Count in Repo List:  ' + repoAsList.length);
      console.log('Time to get entire repo as doc: ' + deltaTimeGetDoc);

      done();
    });
  });

});
