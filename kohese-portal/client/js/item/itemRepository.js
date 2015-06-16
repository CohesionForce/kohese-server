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
    console.log("Fetching: " + byId);
    Item.findById({
      id : byId
    }).$promise.then(function(results) {
      // TBD: $scope.editedItem = results;
      // getChildren();
      console.log("Received:" + results);
    });  
    
  }

  function convertListToTree(dataList, primaryIdFieldName, parentIdFieldName) {
    if (!dataList || dataList.length == 0 || !primaryIdFieldName || !parentIdFieldName)
      return [];

    var rootIds = [],
        primaryKey,
        parentId,
        parent,
        len = dataList.length,
        i = 0;

    tree.items = dataList;
    tree.roots = [];
    tree.objs = {};

    while (i < len) {
      var itemProxy = {};
      primaryKey = dataList[i][primaryIdFieldName];
      if(angular.isDefined(tree.objs[primaryKey])){
        // Some forward declaration occurred, so copy the existing data
        itemProxy = tree.objs[primaryKey];
      }
      itemProxy.item = dataList[i++];
      tree.objs[primaryKey] = itemProxy;
      parentId = itemProxy.item[parentIdFieldName];

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
              
        itemProxy.parentRef = parent;
      } else {
        tree.roots.push(itemProxy);
      }
    }

    updateTreeRows();
  }

  function updateTreeRows() {
    var rowStack = [];
    
    for(var idx = tree.roots.length - 1; idx >= 0; idx--){
      rowStack.push(tree.roots[idx]);
    }
    
    tree.rows = [];
    var node;
    while (node = rowStack.pop()) {
      if (angular.isDefined(node.parentRef)){
        node.level = node.parentRef.level + 1;
        // TBD: temporary remove the parentRef.
        node.parentRef = {};
      } else {
        node.level = 1;
      }
      tree.rows.push(node);
      
      if (angular.isDefined(node.children)){
        for(var childIdx = node.children.length - 1; childIdx >= 0; childIdx--){
          rowStack.push(node.children[childIdx]);
        }  
      }
    }
    
    for(id in tree.objs){
      if(angular.isUndefined(tree.objs[id].level)){
        console.log("Warning:  Node parent is missing for " + id);
        console.log(tree.objs[id]);
      }
    }
    
  }

  
  return {
    internalTree : tree,
    setCurrentItem: setCurrentItem,
    getCurrentItem: getCurrentItem    
  }
} ]);
