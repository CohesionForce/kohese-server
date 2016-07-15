
var forItemId="db13bfc0-ae41-11e5-af49-9b039241499e";
console.log("::: Begin dumping for " + forItemId);
var KDB = require('../server/kdb.js');

var document = KDB.ItemProxy.getProxyFor(forItemId);

console.log("KUID,Parent KUID,Child Count,Name,Description");
var displayItem = function(proxy){
  console.log(proxy.item.id + ",|" + proxy.item.parentId + "|,|" + proxy.children.length + "|,|" + proxy.item.name + "|,|" + proxy.item.description + "|");
};

document.visitDescendants(displayItem);
