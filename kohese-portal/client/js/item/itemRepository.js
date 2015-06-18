/**
 * 
 */

var module = angular.module("itemServices", []);

module.service("ItemRepository", ['Item', 'socket', '$rootScope', function(Item, socket, $rootScope) {

  var tree = {};
  var currentItem = {};
  
  socket.on('item/create', function(notification) {
    console.log("IR Item Created:  " + notification);
    console.log("Id:  " + notification.id);
    fetchItem(notification.id);
  });

  socket.on('item/update', function(notification) {
    console.log("IR Item Updated:  " + notification);
    console.log("Id:  " + notification.id);
    fetchItem(notification.id);
  });

  socket.on('item/delete', function(notification) {
    console.log("IR Item Deleted:  " + notification);
    console.log("Id:  " + notification.id);
    removeItemFromTree(notification.id);
    
  });

  function fetchItems() {
    Item.find().$promise.then(function(results) {
      convertListToTree(results, 'id', 'parentId');
    });
  }
  
  fetchItems();

  function setCurrentItem (item){
    currentItem = item;
    $rootScope.$broadcast('currentItemUpdate', currentItem);
  }

  function getCurrentItem() {
    return currentItem;
  }
    
  function getChildren(ofId) {
    Item.children(ofId).$promise.then(function(results) {
      // TBD:  This needs to be a specific location instead of a global
      tmpChildList = results;
    });
  }

  function fetchItem(byId) {
    Item.findById({
      id : byId
    }).$promise.then(function(results) {
      var temp = results;
      var proxy = tree.objs[byId];
      
      if (angular.isDefined(proxy)){
        // Copy the results into the current proxy
        for (var key in proxy.item){
          if(!_.isEqual(proxy.item[key],results[key])){
            proxy.item[key]=results[key];
          }
        }        
      } else {
        addItemToTree(results);
      }
    });      
  }
  
  function getItem(byId) {
    return tree.objs[byId];
  }

  function addItemToTree(item){
    
    // Create the proxy and add it to tree structures
    createItemProxy(item);
    
    // Add the node to the tree rows
    updateTreeRows();
    
  }
  
  function removeItemFromTree(byId){
    var itemProxy = getItem(byId);
    var parentProxy = getItem(itemProxy.item.parentId);
    
    if(parentProxy){
      parentProxy.children = _.reject(parentProxy.children, function(childProxy) { return childProxy.item.id === byId; });
    }
    
    delete tree.objs[byId];
    
    updateTreeRows();
  }
  
  function createItemProxy(forItem){
    var itemProxy = {};
    var primaryKey = forItem.id;
    if(angular.isDefined(tree.objs[primaryKey])){
      // Some forward declaration occurred, so copy the existing data
      itemProxy = tree.objs[primaryKey];
    }
    itemProxy.item = forItem;
    tree.objs[primaryKey] = itemProxy;
    var parentId = itemProxy.item.parentId;

    if (parentId) {
      if (angular.isDefined(tree.objs[parentId])){
        parent = tree.objs[parentId];
      } else {
        // Create the parent before it is found
        parent = {};
        tree.objs[parentId] = parent;
      }

      if (parent.children) {
         parent.children.push(itemProxy);
      } else {
         parent.children = [itemProxy];
      }              
    } else {
      tree.roots.push(itemProxy);
    }
  }
  
  function convertListToTree(dataList, primaryIdFieldName, parentIdFieldName) {
    if (!dataList || dataList.length == 0 || !primaryIdFieldName || !parentIdFieldName)
      return [];

    tree.items = dataList;
    tree.roots = [];
    tree.objs = {};

    for(var idx = 0; idx < dataList.length; idx++){
      createItemProxy(dataList[idx]);  
    }
    
    // Create Lost And Found Node
    var lostAndFound = {};
    lostAndFound.item = new Item;
    lostAndFound.item.title = "Lost-And-Found";
    lostAndFound.item.description = "Collection of node(s) that are no longer connected.";
    lostAndFound.item.id = "LOST+FOUND";
    lostAndFound.children = [];
    tree.objs[lostAndFound.item.id] = lostAndFound;
    tree.roots.push(lostAndFound);
    
    // Gather unconnected nodes into Lost And Found
    for(var id in tree.objs){
      if(angular.isUndefined(tree.objs[id].item)){
        var lostProxy = tree.objs[id];
        lostProxy.item = new Item;
        lostProxy.item.title = "Lost Item: " + id;
        lostProxy.item.description = "Found children nodes referencing this node as a parent.";
        lostProxy.item.id = id;
        lostProxy.parentId = "LOST+FOUND"
        lostAndFound.children.push(lostProxy);
      }
    }

    updateTreeRows();
  }

  function updateTreeRows() {
    var rowStack = [];
    
    // Push the nodes onto the rowStack in reverse order
    for(var idx = tree.roots.length - 1; idx >= 0; idx--){
      rowStack.push(tree.roots[idx]);
    }
    
    newTreeRows = [];
    var node;
    
    // Process each node from the top of the stack.  This will behave like
    // a pre-ordered depth first iteration over the tree.
    while (node = rowStack.pop()) {
      var parentRef = getItem(node.item.parentId);
      if (angular.isDefined(parentRef)){
        node.level = parentRef.level + 1;
      } else {
        node.level = 1;
      }
      newTreeRows.push(node);
      
      if (angular.isDefined(node.children)){
        for(var childIdx = node.children.length - 1; childIdx >= 0; childIdx--){
          rowStack.push(node.children[childIdx]);
        }  
      } else {
        // Create an empty children list
        node.children=[];
      }
      
      tree.rows = newTreeRows;
    }
    
    // Detect any remaining unconnected nodes
    for(var id in tree.objs){
      if(angular.isUndefined(tree.objs[id].level)){
        console.log("Warning:  Node parent is missing for " + id);
        console.log(tree.objs[id]);
      }
      if(angular.isUndefined(tree.objs[id].item)){
        console.log("Warning:  Found " + id);
        console.log(tree.objs[id]);
      }
    }
    
  }

  
  return {
    internalTree : tree,
    getItem : getItem,
    fetchItem : fetchItem,
    setCurrentItem: setCurrentItem,
    getCurrentItem: getCurrentItem    
  }
} ]);
