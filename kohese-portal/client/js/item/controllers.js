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
        for (let id in $scope.collapsed) {
          $scope.collapsed[id] = false;
        }
        // Set all nodes to visible
        for (let id in $scope.hidden) {
          $scope.hidden[id] = false;
        }
      };

      $scope.collapseAll = function () {
        // Collapse all root nodes that are current expanded
        for (let id = 0; id < $scope.newTree.roots.length; id++) {
          var rootNode = $scope.newTree.roots[id];
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
          for (let id = 0; id < proxy.children.length; id++) {
            childId = proxy.children[id].item.id;
            childIdStack.push(childId);
          }

          while (childId = childIdStack.pop()) {
            if (isNowCollapsed && !$scope.hidden[childId]) {
              // New state is collapsed
              $scope.collapsed[childId] = true;
              proxy = ItemRepository.getItem(childId);
              for (var idx = 0; idx < proxy.children.length; idx++) {
                var grandChildId = proxy.children[idx].item.id;
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
    $scope.editedItem = new Item;
    $scope.enableEdit = false;
    $scope.defaultTab = {active: true};

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

