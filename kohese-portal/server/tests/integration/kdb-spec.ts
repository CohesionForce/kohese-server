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


import { ItemProxy } from '../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../common/src/tree-configuration';

describe('KDB Test', function() {

  let kdb = require ('../../../server/kdb');

  var root = TreeConfiguration.getWorkingTree().getRootProxy();
  var lostAndFound = TreeConfiguration.getWorkingTree().getProxyFor('LOST+FOUND');

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


    kdb.initialize('kohese-kdb').then(() => {

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
      var deltaTime : number = timeAfter.getTime() - timeBefore.getTime();
      console.log('Time to getAllTH: ' + deltaTime);

      var fs = require('fs');

      console.log('::: Writing the file');
      fs.writeFileSync('thm.out', JSON.stringify(treeHashMap, null, '  '), {encoding: 'utf8', flag: 'w'});

      var repoTreeHashMap = kdb.ItemProxy.getWorkingTree().getRepoTreeHashes();
      fs.writeFileSync('rthm.out', JSON.stringify(repoTreeHashMap, null, '  '), {encoding: 'utf8', flag: 'w'});

      var timeBeforeGetDoc = new Date();
      let repoAsList = rootProxy.getSubtreeAsList();
      var timeAfterGetDoc = new Date();
      var deltaTimeGetDoc : number = timeAfterGetDoc.getTime() - timeBeforeGetDoc.getTime();
      console.log('Item Count in Repo List:  ' + repoAsList.length);
      console.log('Time to get entire repo as doc: ' + deltaTimeGetDoc);

      done();
    });
  });

});
