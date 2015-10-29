console.log(__dirname);

var ItemProxy = require('../../../common/models/item-proxy.js');
console.log("::: Starting Item Proxy Test");

var root = ItemProxy.getRootProxy();
var lostAndFound = ItemProxy.getProxyFor("LOST+FOUND");

function dump(message) {
  if (message) {
    console.log(">>> " + message);
  }

  ItemProxy.dumpAllProxies();
  console.log("");
  root.dumpProxy();
  console.log("");
  lostAndFound.dumpProxy();
  console.log("-----------------------------------------");
}

dump('--- Beginning state');

console.log("::: Adding node without parent");
var aa = new ItemProxy("Test", {id: "aa", name:"AA", parentId:"a", uniq: "unique"});
dump("Added node without parent");

console.log("::: Adding parent");
var a = new ItemProxy("Test", {id: "a", name:"A", parentId:""});
dump("Added parent"); 

console.log("::: Adding b, bbb");
var b = new ItemProxy("Test", {id: "b", name:"B", parentId:""});
var bbb = new ItemProxy("Test", {id: "bbb", name:"BBB", parentId:"bb"});
dump("Added b's");

console.log("::: Adding bb");
var bb = new ItemProxy("Test", {id: "bb", name:"BB", parentId:"b"});
dump("Added bb");

console.log("::: Deleting a");
a.deleteItem();
dump("Deleted a");

console.log("::: Changing parent of aa");
console.log(aa.item);
var newAAItem = JSON.parse(JSON.stringify(aa.item)); 
newAAItem.parentId = "b";
newAAItem.description = "b with changes";
delete newAAItem.uniq;
console.log(newAAItem);
aa.updateItem("Test", newAAItem);
console.log(aa.item);
dump("Changed aa parent");

console.log("::: Deleting description for aa");
delete newAAItem.description;
aa.updateItem("Test", newAAItem);
console.log(aa.item);
dump("Deleted aa description");

console.log("::: Changing parent of bb to ROOT");
var newBBItem = JSON.parse(JSON.stringify(bb.item)); 
newBBItem.parentId = "";
bb.updateItem("Test", newBBItem);
dump("Changed bb parent to ROOT");

console.log("::: Changing parent of bb to c");
var newBBItem = JSON.parse(JSON.stringify(bb.item)); 
newBBItem.parentId = "c";
bb.updateItem("Test", newBBItem);
dump("Changed bb parent to c");

console.log("::: Morph b into a NewTest");
var newBItem = JSON.parse(JSON.stringify(b.item)); 
b.updateItem("NewTest", newBItem);
dump("Change b to a NewTest kind");



console.log("::: Finishing Item Proxy Test");