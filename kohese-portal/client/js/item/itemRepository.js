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

  function convertListToTree(dataList, primaryIdName, parentIdName) {
    if (!dataList || dataList.length == 0 || !primaryIdName || !parentIdName)
      return [];

    var rootIds = [],
        primaryKey,
        parentId,
        parent,
        len = dataList.length,
        i = 0;

    tree.items = dataList;
    tree.data = [];
    tree.objs = {};

    while (i < len) {
      var itemProxy = {};
      primaryKey = dataList[i][primaryIdName];
      if(angular.isDefined(tree.objs[primaryKey])){
        // Some forward declaration occurred, so copy the existing data
        itemProxy = tree.objs[primaryKey];
      }
      itemProxy.data = dataList[i++];
      itemProxy.id = itemProxy.data.id;
      itemProxy.parentId = itemProxy.data.parentId;
      itemProxy.title = itemProxy.data.title;
      itemProxy.description = itemProxy.data.description;
      primaryKey = itemProxy.data[primaryIdName];
      tree.objs[primaryKey] = itemProxy;
      parentId = itemProxy.data[parentIdName];

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

        // itemProxy.parentRef = parent;
      } else {
        rootIds.push(primaryKey);
      }
    }

    for (var i = 0; i < rootIds.length; i++) {
      tree.data.push(tree.objs[rootIds[i]]);
    };

  }

  return {
    internalTree : tree,
    setCurrentItem: setCurrentItem,
    getCurrentItem: getCurrentItem
  }
} ]);
