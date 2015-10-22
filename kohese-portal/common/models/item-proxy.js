/**
 * 
 */

var _ = require('underscore');

var tree = {};
tree.proxyMap = {};
tree.parentOf = {};

tree.root = new ItemProxy("Internal",{
  id: "ROOT", 
  name: "Root of Knowledge Tree"  
});

tree.lostAndFound = new ItemProxy("Internal",{
  id: "LOST+FOUND",
  name: "Lost-And-Found",
  description: "Collection of node(s) that are no longer connected."  
});

//////////////////////////////////////////////////////////////////////////
// Create ItemProxy from an existing Item
//////////////////////////////////////////////////////////////////////////
function ItemProxy(kind, forItem){
  var itemId = forItem.id;
  this.children = [];
  this.kind = kind;
  this.item = forItem;
  
//  console.log("::: IP:  Creating new proxy for " + this.item.id + " - " + this.item.name);
  
  if (tree.proxyMap[itemId]) {
      // Some forward declaration occurred, so copy the existing data
      this.children = tree.proxyMap[itemId].children;
  }
  tree.proxyMap[itemId] = this;
  
  if (kind === "Internal" || kind === "Placeholder"){
    // Don't continue
    return;
  };
  
  var parent = {};
  var parentId = this.item.parentId;

  if (parentId) {
      if (tree.proxyMap[parentId]) {
          parent = tree.proxyMap[parentId];
      } else {
          // Create the parent before it is found
          parent = new ItemProxy("Placeholder",{id:parentId});
      }

      if (parent.children) {
          parent.children.push(this);
      } else {
          parent.children = [this];
      }

      this.parentProxy = tree.parentOf[itemId] = parent;

  } else {
      tree.root.children.push(this);
      this.parentProxy = tree.parentOf[itemId] = tree.root;
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.addChild = function (childProxy){
  console.log("::: IP:  Adding child " + childProxy.item.name + " to " + this.item.name);
  this.children.push(childProxy);
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.getProxyFor = function (id){
  
  console.log("::: IP:  Getting proxy for " + id);
  return tree.proxyMap[id];
  
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.dumpAllProxies = function () {
  for(var proxyId in tree.proxyMap){
    var proxy = tree.proxyMap[proxyId];
    console.log("::: Dumping " + proxy.item.id + " - " + proxy.item.name);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.getRootProxy = function () {
  console.log("::: Getting Root Proxy");
  return tree.root;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.getChildByName = function (name) {
  for ( var childIdx in this.children) {
    var child = this.children[childIdx];
    if (child.item.name === name) {
      return child;
    }
  }
  return null;  
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.getDecendents = function() {
  var proxyStack = [];
  for(var childIdx = this.children.length - 1; childIdx > -1; childIdx--){
      proxyStack.push(this.children[childIdx]);
  }

  var decendantList = [];
  var decendant = proxyStack.pop()
  while(decendant){
      decendantList.push(decendant);
      for(var childIdx = decendant.children.length - 1; childIdx > -1; childIdx--){
          proxyStack.push(decendant.children[childIdx]);
      }
      decendant = proxyStack.pop();
  }
  return decendantList;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.dumpProxy = function(indent) {
  var thisIndent = "";
  var childIndent = "|-";
  if (indent){
    thisIndent = indent;
    childIndent = "| " + thisIndent;
  }
  
  console.log ("=== " + thisIndent + this.item.id + " - " + this.kind + " - " + this.item.name);
  
  for(var childIdx in this.children){
    var childProxy = this.children[childIdx];
    childProxy.dumpProxy(childIndent);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function attachToLostAndFound(byId, children) {
  console.log("!!! Attaching " + byId);
  var lostProxy = tree.proxyMap[byId];
  lostProxy = new ItemProxy("Internal-Lost", {
    id : byId,
    name : "Lost Item: " + byId,
    description : "Found children nodes referencing this node as a parent.",
    parentId : "LOST+FOUND"
  });

  lostProxy.children = children;
  
  // Make sure parentOf for each child is pointing to this lostProxy
  for (var childIdx in lostProxy.children){
    var child = lostProxy.children[childIdx];
    child.parentProxy = tree.parentOf[child.item.id] = lostProxy;
  }

  if (tree.lostAndFound.children.length === 1) {
      // This is the first child on lostAndFound, so make the node available
      console.log("!!! Adding lostAndFound ");
      tree.root.children.push(tree.lostAndFound);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.deleteItem = function() {
  var byId = this.item.id;
  var parentProxy = tree.proxyMap[this.item.parentId];
  var children = this.children;

  console.log("::: Deleting proxy for " + byId);

  if (!this.item.parentId){
    parentProxy = tree.root;
  }
  if (parentProxy) {
      parentProxy.children = _.reject(parentProxy.children, function (childProxy) {
          return childProxy.item.id === byId;
      });

      // Determine if the old parent was in LostAndFound
      if (parentProxy && (parentProxy.item.parentId === "LOST+FOUND")) {
        if (parentProxy.children.length == 0) {
          // All unallocated children have been moved or deleted
          parentProxy.deleteItem();
          if (tree.lostAndFound.children.length === 0) {
            // This is the last child on lostAndFound, so make the node
            // unavailable
            tree.root.children = _.reject(tree.root.children,
                function(childProxy) {
                  return childProxy.item.id === tree.lostAndFound.item.id;
                });
          }
        }
      }
  }

  delete tree.proxyMap[byId];
  delete tree.parentOf[byId];
  this.parentProxy = {}

  // If there were children to the node that was deleted, add them to lostAndFound
  if (children.length) {
      attachToLostAndFound(byId, children);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function copyAttributes(fromItem, toItem) {

  // Copy attributes proxy
  for (var key in fromItem) {
      if (fromItem.hasOwnProperty(key) && (key.charAt(0) !== '$') && !_.isEqual(fromItem[key], toItem[key])) {
          console.log("!!! Updating " + key);
          toItem[key] = fromItem[key];
      }
  }
}


//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.updateItem = function (modelKind, withItem) {
  console.log("!!! Updating " + modelKind + " - " + this.item.id);

      // Determine if item kind changed
  var newKind = modelKind;

  if (newKind !== this.kind) {
    console.log("::: Proxy kind changed from " + this.kind + " to " + newKind);
    this.kind = newKind;
  }

  // Copy the withItem into the current proxy
  copyAttributes(withItem, this.item);

  // Determine if the parent changed
  var parentProxy = tree.parentOf[this.item.id];
  var oldParentId = "";
  if (parentProxy) {
    oldParentId = parentProxy.item.id;
  }

  var newParentId = withItem.parentId;
  console.log("::: Eval Parent Id old: " + oldParentId + " new: " + newParentId)
  if (oldParentId !== newParentId) {
    console.log("::: Parent Id changed from " + oldParentId + " to " + newParentId)
    if (parentProxy) {
      var byId = this.item.id;
      parentProxy.children = _.reject(parentProxy.children,
          function(childProxy) {
            return childProxy.item.id === byId;
          });
    }

    var newParentProxy;

    if (newParentId === "") {
      newParentProxy = tree.root;
    } else {
      newParentProxy = tree.proxyMap[newParentId];
    }

    if (newParentProxy) {
      newParentProxy.children.push(this);
      this.parentProxy = tree.parentOf[this.item.id] = newParentProxy;
    } else {
      // Parent not found, so create one
      attachToLostAndFound(newParentId, [ this ]);
    }

    // Determine if the old parent was in LostAndFound
    if (parentProxy && (parentProxy.item.parentId === "LOST+FOUND")) {
      if (parentProxy.children.length == 0) {
        // All unallocated children have been moved or deleted
        parentProxy.deleteItem();
        if (tree.lostAndFound.children.length === 0) {
          // This is the last child on lostAndFound, so make the node
          // unavailable
          tree.root.children = _.reject(tree.root.children,
              function(childProxy) {
                return childProxy.item.id === tree.lostAndFound.item.id;
              });
        }
      }
    }
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
function gatherUnconnectedProxies() {
  // Gather unconnected nodes into Lost And Found
  for (var id in tree.proxyMap) {
      if (tree.proxyMap[id].kind == "Placeholder") {
          console.log("!!! IP:  Gathering lostAndFound:  " + id);
          attachToLostAndFound(id, tree.proxyMap[id].children);
      }
  }  
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.getAllItemProxies = function() {
  var itemProxyList = [];
  for (var key in tree.proxyMap) {
      itemProxyList.push(tree.proxyMap[key]);
  }
  return itemProxyList;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
module.exports = ItemProxy;
module.exports.getRootProxy = ItemProxy.getRootProxy;
module.exports.getProxyFor = ItemProxy.getProxyFor;
module.exports.getAllItemProxies = ItemProxy.getAllItemProxies;
module.exports.dumpAllProxies = ItemProxy.dumpAllProxies;

module.exports.gatherUnconnectedProxies = gatherUnconnectedProxies;