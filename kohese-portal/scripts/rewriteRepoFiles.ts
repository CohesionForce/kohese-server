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



var kdb = require('../server/kdb.js');
var ItemProxy = kdb.ItemProxy;

var root;
var itemId;

kdb.initialize('kohese-kdb').then(function () {

  if(process.argv[2]) {
    itemId = process.argv[2];
    root = ItemProxy.getWorkingTree().getProxyFor(itemId);
    if (root === undefined) {
      console.log('*** Could not find an item by id:  ' + itemId);
      process.exit();
    }
  } else {
    console.log('::: No item id provided, so selected the root repository');
    root = ItemProxy.getWorkingTree().getRootProxy();
  }

  var descendants = root.getDescendants();
  var descendantCount = descendants.length;

  console.log('::: Found item "' + root.item.name + '" with ' + descendantCount + ' children.');

  var prompt = require('prompt');
  prompt.start();

  var contPrompt =
  {
    properties : {
      answer : {
        description : '??? Rewrite the item and all its descendants? (Y/N): ',
        pattern : /^[YNyn]{1}$/,
        message : 'Please enter Y or N',
        required : true
      }
    }
  };

  prompt.get(contPrompt, function (err, result) {
    if(err) {
      process.exit();
    }
    if(result.answer === 'n' || result.answer === 'N') {
      console.log('::: Exiting without making changes');
      process.exit();
    } else if (result.answer === 'y' || result.answer === 'Y'){
      console.log('::: Rewriting item and all descendents...');
      for(var idx in descendants){
        var proxy = descendants[idx];
        console.log("--> rewrite[" + idx + "/" + descendantCount + "]: " + proxy.kind + " - " + proxy.item.id + " - " + proxy.item.name);
        kdb.storeModelInstance(proxy, true);
      }
    }
  });

});
