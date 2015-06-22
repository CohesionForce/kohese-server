'use strict';

angular
  .module('app')
  .controller('ItemController', ['$scope', '$state', '$location', 'Item', 'ItemRepository', '$anchorScroll',
    function($scope, $state, $location, Item, ItemRepository, $anchorScroll) {

    $scope.filterString = "";
    $scope.hidden = {};
    $scope.collapsed = {};

    $scope.newTree = ItemRepository.internalTree;

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
          console.log("::: Item has been deleted: " + item.id);
        });
    };

    $scope.$on('currentItemUpdate', function(event, data){
        $location.hash(data.id);
        $anchorScroll();
      }
    );

    $scope.syncLocation = function(){
        $anchorScroll();
    }

    $scope.expandAll = function(){
      // Set all nodes to expanded
      for(var id in $scope.collapsed){
        $scope.collapsed[id] = false;
      }
      // Set all nodes to visible
      for(var id in $scope.hidden){
        $scope.hidden[id] = false;
      }
    }
    
    $scope.collapseAll = function(){
      // Collapse all root nodes that are current expanded
      for(var idx=0; idx < $scope.newTree.roots.length; idx++){
        var rootNode = $scope.newTree.roots[idx];
        if (!$scope.collapsed[rootNode.item.id]){
          changeVisibilityOn(rootNode);
        }
      }        

    }
    
    function changeVisibilityOn (proxy){
      if ($scope.showAsTree){
        $scope.collapsed[proxy.item.id] = !$scope.collapsed[proxy.item.id];
        var isNowCollapsed = $scope.collapsed[proxy.item.id];
        var childIdStack = [];
        var childId = "";

        // Add immediate descendants to stack
        for(var idx=0; idx < proxy.children.length; idx++){
          childId = proxy.children[idx].item.id;
          childIdStack.push(childId);
        }        

        while (childId = childIdStack.pop()){
          if(isNowCollapsed && !$scope.hidden[childId]){
            // New state is collapsed
            $scope.collapsed[childId] = true;
            proxy = ItemRepository.getItem(childId);
            for(var idx=0; idx < proxy.children.length; idx++){
              var grandChildId = proxy.children[idx].item.id;
              childIdStack.push(grandChildId);
            }        
          }
          $scope.hidden[childId] = isNowCollapsed;
        }    
      }
    }
    
    $scope.changeVisibility = function(){
      changeVisibilityOn(this.itemProxy);
    }

  }]);

angular
.module('app')
.controller('ItemEditController', ['$scope', '$state', '$location', 'Item', 'ItemRepository', function($scope,
    $state, $location, Item, ItemRepository) {

    $scope.listTitle = "Children"
    $scope.editedItem = new Item;
    $scope.enableEdit = false;

    $scope.newTree = ItemRepository.internalTree;

    if (angular.isDefined($state.params.parentId)){
    	$scope.editedItem.parentId = $state.params.parentId;
    	$scope.enableEdit=true;
    }

	  function getItem() {
		  $scope.isEdit = false;
		  if (angular.isDefined($state.params.itemId)){
		    $scope.isEdit = true;
	      $scope.itemProxy = ItemRepository.getItem($state.params.itemId);
	      $scope.editedItem = $scope.itemProxy.item;
	      ItemRepository.setCurrentItem($scope.editedItem);
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

    $scope.cancel = function() {
      if (angular.isDefined($state.params.parentId)){
        $state.go('editItem', {itemId: $state.params.parentId});
   	  } else {
   	    if(this.itemForm.$dirty){
          ItemRepository.fetchItem($scope.editedItem.id);
          this.itemForm.$setPristine();
   	    }
       }
     }

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
            // TBD:  May need to do something special if the delete fails
          });
      };

}]);

angular
.module('app')
.controller('NavigationController', ['$scope', '$state', '$location', 'Item', function($scope,
    $state, $location, Item) {

    $('#side-menu').metisMenu();

}]);
