'use strict';

angular
  .module('app')
  .controller('ItemCtrl', ['$scope', '$state', 'Item', function($scope,
      $state, Item) {
    $scope.todos = [];
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
        .create($scope.newItem)
        .$promise
        .then(function(item) {
          $scope.newItem = '';
          $scope.itemForm.content.$setPristine();
          $('.focus').focus(); //JQuery hack for refocusing text input
          getItems();
        });
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