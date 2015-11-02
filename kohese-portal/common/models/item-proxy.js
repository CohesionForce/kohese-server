/**
 * 
 */

var _ = require('underscore');

var tree = {};
tree.proxyMap = {};

tree.root = new ItemProxy("Internal", {
  id: "ROOT",
  name : "Root of Knowledge Tree"
});

tree.lostAndFound = new ItemProxy("Internal", {
  id : "LOST+FOUND",
  name : "Lost-And-Found",
  description : "Collection of node(s) that are no longer connected."
});

// ////////////////////////////////////////////////////////////////////////
// Create ItemProxy from an existing Item
// ////////////////////////////////////////////////////////////////////////
function ItemProxy(kind, forItem) {
  var itemId = forItem.id;

  var proxy = tree.proxyMap[itemId];
  if (!proxy) {
    // console.log("::: IP: Creating " + forItem.id + " - " + forItem.name + " -
    // " + kind);
    proxy = this;
    proxy.children = [];
    tree.proxyMap[itemId] = proxy;
  }

  proxy.kind = kind;
  proxy.item = forItem;

  if (kind === "Internal") {
    // Don't continue
    return proxy;
  };

  var parentId = proxy.item.parentId || "ROOT";

  var parent = tree.proxyMap[parentId];

  if (!parent) {
    // Create the parent before it is found
    parent = createMissingProxy(parentId);
  }

  parent.addChild(proxy);

  return proxy;
}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
function createMissingProxy(forId) {
  var lostProxy = new ItemProxy("Internal-Lost", {
    id : forId,
    name : "Lost Item: " + forId,
    description : "Found children nodes referencing this node as a parent.",
    parentId : "LOST+FOUND"
  });

  return lostProxy;
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.sortChildren = function() {
  this.children.sort(function(a, b){
    return a.item.name > b.item.name;
  });
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.addChild = function(childProxy) {
  if (childProxy.parentProxy == this) {
    // console.log("::: IP: Child " + childProxy.item.name + " already
    // associated with " + this.item.name);
    return;
  }
  // console.log("::: IP: Adding child " + childProxy.item.name + " to " +
  // this.item.name);
  // Determine if this node is already attached to another parent
  if (childProxy.parentProxy) {
    childProxy.parentProxy.removeChild(childProxy);
  }

  // Determine where to insert the new child
  var insertAt = this.children.length;  
  for (var childIdx in this.children){
    if (childProxy.item.name < this.children[childIdx].item.name){
      insertAt = childIdx;
      break;
    }
  }

  this.children.splice(insertAt, 0, childProxy);
  childProxy.parentProxy = this;

  if (this == tree.lostAndFound && tree.lostAndFound.children.length === 1) {
    tree.root.addChild(tree.lostAndFound);
  }
}

//////////////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.removeChild = function(proxy) {
  // console.log("::: IP: Removing child " + proxy.item.name + " from " +
  // this.item.name);
  this.children = _.reject(this.children, function(childProxy) {
    return childProxy.item.id === proxy.item.id;
  });

  delete proxy.parentProxy;

  if (this == tree.lostAndFound && tree.lostAndFound.children.length === 0) {
    tree.root.removeChild(tree.lostAndFound);
  }

  if (this.kind === "Internal-Lost" && this.children.length === 0) {
    this.deleteItem();
  }

}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.getProxyFor = function(id) {

  // console.log("::: IP: Getting proxy for " + id);
  return tree.proxyMap[id];

}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.dumpAllProxies = function() {
  for ( var proxyId in tree.proxyMap) {
    var proxy = tree.proxyMap[proxyId];
    console.log("::: Dumping " + proxy.item.id + " - " + proxy.item.name
        + " - " + proxy.kind);
  }
}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.getRootProxy = function() {
  // console.log("::: IP: Getting Root Proxy");
  return tree.root;
}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.getChildByName = function(name) {
  for ( var childIdx in this.children) {
    var child = this.children[childIdx];
    if (child.item.name === name) {
      return child;
    }
  }
  return null;
}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.getDecendents = function() {
  var proxyStack = [];
  for (var childIdx = this.children.length - 1; childIdx > -1; childIdx--) {
    proxyStack.push(this.children[childIdx]);
  }

  var decendantList = [];
  var decendant = proxyStack.pop()
  while (decendant) {
    decendantList.push(decendant);
    for (var childIdx = decendant.children.length - 1; childIdx > -1; childIdx--) {
      proxyStack.push(decendant.children[childIdx]);
    }
    decendant = proxyStack.pop();
  }
  return decendantList;
}

//////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.dumpProxy = function(indent) {
  var thisIndent = "";
  var childIndent = "|-";
  if (indent) {
    thisIndent = indent;
    childIndent = "| " + thisIndent;
  }

  console.log("=== " + thisIndent + this.item.id + " - " + this.item.name
      + " - " + this.kind);

  for ( var childIdx in this.children) {
    var childProxy = this.children[childIdx];
    childProxy.dumpProxy(childIndent);
  }
}

//////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.dumpProxyNameAndDescription = function() {
  console.log(this.item.name);
  console.log(this.item.description);

  for ( var childIdx in this.children) {
    var childProxy = this.children[childIdx];
    childProxy.dumpProxyNameAndDescription();
  }
}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.deleteItem = function() {
  var byId = this.item.id;

  console.log("::: Deleting proxy for " + byId);

  if (this.parentProxy) {
    this.parentProxy.removeChild(this);
  }

  if (this.children.length !== 0) {
    console.log("::: -> Node still has children");
    createMissingProxy(byId);
  } else {
    console.log("::: -> Removing all references");
    delete tree.proxyMap[byId];
  }

}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
function copyAttributes(fromItem, toItem) {

  // Copy attributes proxy
  for ( var key in fromItem) {
    if (fromItem.hasOwnProperty(key) && (key.charAt(0) !== '$')
        && !_.isEqual(fromItem[key], toItem[key])) {
      console.log("!!! Updating " + key);
      toItem[key] = fromItem[key];
    }
  }
  // Check for unexpected values
  for ( var key in toItem) {
    if (key !== "__deletedProperty" && toItem.hasOwnProperty(key)
        && (key.charAt(0) !== '$') && !fromItem.hasOwnProperty(key)) {
      console.log("!!! Deleted Property: " + key);
      if (!toItem.__deletedProperty) {
        toItem.__deletedProperty = {};
      }
      toItem.__deletedProperty[key] = toItem[key];
      delete toItem[key];
    }
  }
}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.prototype.updateItem = function(modelKind, withItem) {
  console.log("!!! Updating " + modelKind + " - " + this.item.id);

  // Determine if item kind changed
  var newKind = modelKind;

  if (newKind !== this.kind) {
    console.log("::: Proxy kind changed from " + this.kind + " to " + newKind);
    this.kind = newKind;
  }

  // Copy the withItem into the current proxy
  copyAttributes(withItem, this.item);

  // Ensure sort order is maintained
  if(this.parentProxy){
    this.parentProxy.sortChildren();
  }

  // Determine if the parent changed
  var oldParentId = "";
  if (this.parentProxy) {
    oldParentId = this.parentProxy.item.id;
  }

  var newParentId = withItem.parentId;
  console
      .log("::: Eval Parent Id old: " + oldParentId + " new: " + newParentId)
  if (oldParentId !== newParentId) {
    console.log("::: Parent Id changed from " + oldParentId + " to "
        + newParentId)

    var newParentProxy;
    if (newParentId === "") {
      newParentProxy = tree.root;
    } else {
      newParentProxy = tree.proxyMap[newParentId];
    }

    if (!newParentProxy) {
      newParentProxy = createMissingProxy(newParentId);
    }

    newParentProxy.addChild(this);
  }
}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
ItemProxy.getAllItemProxies = function() {
  var itemProxyList = [];
  for ( var key in tree.proxyMap) {
    itemProxyList.push(tree.proxyMap[key]);
  }
  return itemProxyList;
}

// ////////////////////////////////////////////////////////////////////////
//
// ////////////////////////////////////////////////////////////////////////
module.exports = ItemProxy;
module.exports.getRootProxy = ItemProxy.getRootProxy;
module.exports.getProxyFor = ItemProxy.getProxyFor;
module.exports.getAllItemProxies = ItemProxy.getAllItemProxies;
module.exports.dumpAllProxies = ItemProxy.dumpAllProxies;
