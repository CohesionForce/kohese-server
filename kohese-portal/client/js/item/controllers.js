'use strict';

angular
  .module('app')
  .controller('ItemController', ['$scope', '$state', '$location', 'Item', function($scope,
      $state, $location, Item) {
    $scope.items = [];
    $scope.listTitle = "Item List"
    function getItems() {
      Item
        .find()
        .$promise
        .then(function(results) {
          $scope.items = results;
        });
    }
    getItems();

    $scope.newItem = function() {
        $state.go('newItem');
      }

    $scope.editItem = function(item) {
        $state.go('editItem', {itemId: item.id});
      };

    $scope.removeItem = function(item) {
      Item
        .deleteById(item)
        .$promise
        .then(function() {
          getItems();
        });
    };
  }]);

angular
.module('app')
.controller('ItemEditController', ['$scope', '$state', '$location', 'Item'	, function($scope,
    $state, $location, Item) {

    $scope.listTitle = "Children"
    $scope.editedItem = new Item;
    
    if (angular.isDefined($state.params.parentId)){
    	$scope.editedItem.parentId = $state.params.parentId;
    }
    
    $scope.items = [];
    
    function getChildren() {
      Item.children($scope.editedItem)
        .$promise
        .then(function(results) {
          $scope.items = results;
        });
    }

	function getItem() {
		$scope.isEdit = false;
		if (angular.isDefined($state.params.itemId)){
          Item
            .findById({id: $state.params.itemId})
            .$promise
            .then(function(results) {
              $scope.isEdit = true;
              $scope.editedItem = results;
              getChildren();
            });
		}
      }
      getItem();

    $scope.upsertItem = function() {
        Item
          .upsert($scope.editedItem)
          .$promise
          .then(function(updatedItem) {
        	 if (angular.isDefined($state.params.parentId)){
                 $state.go('editItem', {itemId: $state.params.parentId});
        	 } else {
                 $state.go('items');        		 
        	 }
          });
      };
      
      $scope.newItem = function() {
          $state.go('newItem', {parentId: $scope.editedItem.id});
        }

      $scope.editItem = function(item) {
          $state.go('editItem', {itemId: item.id});
        };

      $scope.removeItem = function(item) {
        Item
          .deleteById(item)
          .$promise
          .then(function() {
            getChildren();
          });
      };

}]);