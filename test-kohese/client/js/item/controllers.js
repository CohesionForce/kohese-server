'use strict';

angular
  .module('app')
  .controller('ItemCtrl', ['$scope', '$state', '$location', 'Item', function($scope,
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

    $scope.addItem = function() {
        Item
          .create($scope.editedItem)
          .$promise
          .then(function(item) {
            $scope.editedItem = '';
            $location.path('/');
          });
      };

    $scope.evaluate = function() {
    	$scope.evaluated = true;
    }
    
    $scope.editItem = function(item) {
    	// TBD:  need to determine which scope this is in
        $scope.editedItem = item;
        $location.path('/editItem');
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