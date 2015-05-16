'use strict';

angular
  .module('app')
  .controller('ItemController', ['$scope', '$state', '$location', 'Item', function($scope,
      $state, $location, Item) {
    $scope.items = [];
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
    	// TBD:  need to determine which scope this is in
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

    $scope.editedItem = null;
    
	function getItem() {
		if ($state.params.hasOwnProperty('itemId')){
          Item
            .findById({id: $state.params.itemId})
            .$promise
            .then(function(results) {
              $scope.editedItem = results;
            });
		}
      }
      getItem();

    $scope.upsertItem = function() {
        Item
          .upsert($scope.editedItem)
          .$promise
          .then(function(updatedItem) {
             $state.go('items');
          });
      };

}]);