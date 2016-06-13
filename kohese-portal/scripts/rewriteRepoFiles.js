
var kdb = require('../server/kdb.js');
var ItemProxy = kdb.ItemProxy;
 
var root = ItemProxy.getRootProxy();
//var root = ItemProxy.getProxyFor("80b4be90-0f99-11e5-9d90-27fe940861ba");
 
var descendants = root.getDescendants();
var descendantCount = descendants.length;
for(var idx in descendants){
  var proxy = descendants[idx];
  console.log("--> rewrite[" + idx + "/" + descendantCount + "]: " + proxy.kind + " - " + proxy.item.id + " - " + proxy.item.name);
  kdb.storeModelInstance(proxy.kind, proxy.item);
}
