'use strict';

angular
  .module('app')
  .controller('ItemController', ['$scope', '$state', '$location', 'Item', 'ItemRepository', '$anchorScroll', '$rootScope',
    function ($scope, $state, $location, Item, ItemRepository, $anchorScroll, $rootScope) {

      $scope.filterString = "";
      $scope.analysisFilterString = "";
      $scope.hidden = {};
      $scope.collapsed = {};

      $scope.newTree = ItemRepository.internalTree;

      $state.go('editItem', {});

      $scope.newItem = function () {
        $rootScope.$broadcast('newItem');
      };

      $scope.editItem = function (item) {
        $rootScope.$broadcast('editItem', item.id);
      };


      $scope.removeItem = function (item) {
        Item
          .deleteById(item)
          .$promise
          .then(function () {
            console.log("::: Item has been deleted: " + item.id);
          });
      };

      $scope.$on('currentItemUpdate', function (event, data) {
          $location.hash(data.id);
          $anchorScroll();
        }
      );

      $scope.syncLocation = function () {
        $anchorScroll();
      };

      $scope.expandAll = function () {
        // Set all nodes to expanded
        for (var index in $scope.collapsed) {
          $scope.collapsed[index] = false;
        }
        // Set all nodes to visible
        for (var index in $scope.hidden) {
          $scope.hidden[index] = false;
        }
      };

      $scope.collapseAll = function () {
        // Collapse all root nodes that are current expanded
        for (var index = 0; index < $scope.newTree.roots.length; index++) {
          var rootNode = $scope.newTree.roots[index];
          if (!$scope.collapsed[rootNode.item.id]) {
            changeVisibilityOn(rootNode);
          }
        }

      };

      function changeVisibilityOn(proxy) {
        if ($scope.showAsTree) {
          $scope.collapsed[proxy.item.id] = !$scope.collapsed[proxy.item.id];
          var isNowCollapsed = $scope.collapsed[proxy.item.id];
          var childIdStack = [];
          var childId = "";

          // Add immediate descendants to stack
          for (var index = 0; index < proxy.children.length; index++) {
            childId = proxy.children[index].item.id;
            childIdStack.push(childId);
          }

          while (childId = childIdStack.pop()) {
            if (isNowCollapsed && !$scope.hidden[childId]) {
              // New state is collapsed
              $scope.collapsed[childId] = true;
              proxy = ItemRepository.getItem(childId);
              for (var index = 0; index < proxy.children.length; index++) {
                var grandChildId = proxy.children[index].item.id;
                childIdStack.push(grandChildId);
              }
            }
            $scope.hidden[childId] = isNowCollapsed;
          }
        }
      }

      $scope.changeVisibility = function () {
        changeVisibilityOn(this.itemProxy);
      }

    }]);

angular
  .module('app')
  .controller('ItemEditController', ['$scope', '$state', '$location', 'Item', 'ItemRepository', '$rootScope',
    function ($scope, $state, $location, Item, ItemRepository, $rootScope) {

    $scope.listTitle = "Children";
    $scope.editedItem = { description: "No item selected"};
    $scope.enableEdit = false;
    $scope.defaultTab = {active: true};
    $scope.showChunksInAnalysis = true;
    $scope.showTokensInAnalysis = true;
    $scope.showChunksInDetails = false;
    $scope.showTokensInDetails = false;

    $scope.newTree = ItemRepository.internalTree;

    $scope.$on('newItem', function(event, parentId) {
      $scope.editedItem = {};
      $scope.editedItem.parentId = parentId;
      $scope.enableEdit = true;
    });

    $scope.$on('editItem', function (event, itemId) {
      $scope.isEdit = true;
      ItemRepository.fetchAnalysis(itemId);
      $scope.itemProxy = ItemRepository.getItem(itemId);
      $scope.editedItem = $scope.itemProxy.item;
      ItemRepository.setCurrentItem($scope.editedItem);
      $scope.defaultTab.active = true;

    });

    if (angular.isDefined($state.params.parentId)) {
      //$scope.editedItem.parentId = $state.params.parentId;
      $scope.enableEdit = true;
    }

    $scope.upsertItem = function () {
      var itemForm = this.itemForm;
      Item
        .upsert($scope.editedItem)
        .$promise
        .then(function (updatedItem) {
            ItemRepository.fetchItem($scope.editedItem.id);
            itemForm.$setPristine();
        });
    };

    $scope.cancel = function () {
      if (angular.isDefined($state.params.parentId)) {
        $state.go('editItem', {itemId: $state.params.parentId});
      } else {
        if (this.itemForm.$dirty) {
          ItemRepository.fetchItem($scope.editedItem.id);
          this.itemForm.$setPristine();
        }
      }
    };

    $scope.newItem = function () {
      $rootScope.$broadcast('newItem', $scope.editedItem.id)
    };

    $scope.editItem = function (item) {
      $rootScope.$broadcast('editItem', item.id);
      console.log("Item edit: Edit Item");
    };

    $scope.removeItem = function (item) {
      Item
        .deleteById(item)
        .$promise
        .then(function () {
          // TBD:  May need to do something special if the delete fails
        });
    };



  }
  ])
;

