/**
 * 
 */

var module = angular.module("itemServices", []);

module.service("ItemRepository", ['Item', 'socket', '$rootScope', function(Item, socket, $rootScope) {

  var tree = {};
  var currentItem = {};
  
  socket.on('item/create', function(notification) {
    console.log("::: Received notification of Item Created:  " + notification.id);
    fetchItem(notification.id);
  });

  socket.on('item/update', function(notification) {
    console.log("::: Received notification of Item Updated:  " + notification.id);
    fetchItem(notification.id);
  });

  socket.on('item/delete', function(notification) {
    console.log("::: Received notification of Item Deleted:  " + notification.id);
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
      var proxy = tree.proxyMap[byId];
      
      if (angular.isDefined(proxy)){

        // Copy the results into the current proxy
        for (var key in proxy.item){
          if(!_.isEqual(proxy.item[key],results[key])){
            proxy.item[key]=results[key];
          }
        }        

        // Determine if the parent changed
        var parentProxy = tree.parentOf[byId];
        if(parentProxy.item.id !== results.parentId){
          var newParentId = results.parentId;
          
          if(parentProxy){
            parentProxy.children = _.reject(parentProxy.children, function(childProxy) { return childProxy.item.id === byId; });
          }

          var newParentProxy = getItem(newParentId);
          
          if(newParentProxy){
            newParentProxy.children.push(proxy);
          } else {
            // Parent not found, so create one
            newParentProxy = {};
            tree.proxyMap[newParentId] = newParentProxy;
            newParentProxy.children = [proxy];
            attachToLostAndFound(newParentId);
          }
          tree.parentOf[byId] = newParentProxy;
          
          // Determine if the old parent was in LostAndFound
          if (parentProxy.item.parentId === "LOST+FOUND"){
            if (parentProxy.children.length == 0){
              // All unallocated children have been moved or deleted
              removeItemFromTree(parentProxy.item.id);
            }
          }
          updateTreeRows();
        }
      
      } else {
        addItemToTree(results);
      }
    });      
  }

  function getItem(byId) {
    return tree.proxyMap[byId];
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
    
    delete tree.proxyMap[byId];
    
    updateTreeRows();
  }
  
  function createItemProxy(forItem){
    var itemProxy = {};
    var primaryKey = forItem.id;
    if(angular.isDefined(tree.proxyMap[primaryKey])){
      // Some forward declaration occurred, so copy the existing data
      itemProxy = tree.proxyMap[primaryKey];
    }
    itemProxy.item = forItem;
    tree.proxyMap[primaryKey] = itemProxy;
    var parentId = itemProxy.item.parentId;

    if (parentId) {
      if (angular.isDefined(tree.proxyMap[parentId])){
        parent = tree.proxyMap[parentId];
      } else {
        // Create the parent before it is found
        parent = {};
        tree.proxyMap[parentId] = parent;
      }

      if (parent.children) {
         parent.children.push(itemProxy);
      } else {
         parent.children = [itemProxy];
      }
      
      tree.parentOf[primaryKey] = parent;
      
    } else {
      tree.roots.push(itemProxy);
    }
  }
  
  function convertListToTree(dataList, primaryIdFieldName, parentIdFieldName) {
    if (!dataList || dataList.length == 0 || !primaryIdFieldName || !parentIdFieldName)
      return [];

    tree.roots = [];
    tree.proxyMap = {};
    tree.parentOf ={};

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
    tree.proxyMap[lostAndFound.item.id] = lostAndFound;
    tree.roots.push(lostAndFound);
    
    // Gather unconnected nodes into Lost And Found
    for(var id in tree.proxyMap){
      if(angular.isUndefined(tree.proxyMap[id].item)){
        attachToLostAndFound(id);
      }
    }

    updateTreeRows();
  }

  function attachToLostAndFound (byId) {
    var lostProxy = tree.proxyMap[byId];
    lostProxy.item = new Item;
    lostProxy.item.title = "Lost Item: " + byId;
    lostProxy.item.description = "Found children nodes referencing this node as a parent.";
    lostProxy.item.id = byId;
    lostProxy.item.parentId = "LOST+FOUND";
    
    var lostAndFound = getItem(lostProxy.item.parentId)
    lostAndFound.children.push(lostProxy);    
    tree.parentOf[byId] = lostAndFound;
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
    for(var id in tree.proxyMap){
      if(angular.isUndefined(tree.proxyMap[id].level)){
        console.log("Warning:  Node parent is missing for " + id);
        console.log(tree.proxyMap[id]);
      }
      if(angular.isUndefined(tree.proxyMap[id].item)){
        console.log("Warning:  Found " + id);
        console.log(tree.proxyMap[id]);
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
