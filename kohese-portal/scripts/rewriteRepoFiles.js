
var kdb = require('../server/kdb.js');
var ItemProxy = kdb.ItemProxy;
 
var root = ItemProxy.getRootProxy();
 
var descendants = root.getDescendants();
for(var idx in descendants){
  var proxy = descendants[idx];
  console.log("--> rewrite: " + proxy.kind + " - " + proxy.item.id + " - " + proxy.item.name);
  kdb.storeModelInstance(proxy.kind, proxy.item);
}
