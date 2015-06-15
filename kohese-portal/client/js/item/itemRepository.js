/**
 *
 */

var module = angular.module("itemServices", []);

module.service("ItemRepository", ['Item', 'socket', function (Item, socket) {

  var items = [];
  var currentItem = {};

  socket.on('change', function (msg) {
    var msgStruct = JSON.parse(msg);
    console.log("ItemRepository Detected Change:  " + msgStruct);
    console.log("ItemRepository Detected Change on Id:  " + msgStruct.id);
    fetchItem(msgStruct.id);
    // getItems();
  });

  function fetchItems() {
    Item.find().$promise.then(function (results) {
      items = results;
      // $scope.tree = convertListToTree($scope.items, 'id', 'parentId');
      // $scope.tree_data = $scope.tree.data;
      console.log("items.length: " + items.length);
    });
  }

  fetchItems();

  function setCurrentItem(item) {
    currentItem = item;
    console.log(currentItem);
  }

  function getCurrentItem() {
    return currentItem;
  }

  function getChildren() {
    Item.children($scope.editedItem).$promise.then(function (results) {
      $scope.items = results;
    });
  }

  function fetchItem(byId) {
    console.log("Fetching: " + byId);
    Item.findById({
      id: byId
    }).$promise.then(function (results) {
        // $scope.editedItem = results;
        // getChildren();
        console.log("Received:" + results);
      });
  }

  return {
    fetchItem: fetchItem,
    setCurrentItem: setCurrentItem,
    getCurrentItem: getCurrentItem
  }

}]);
