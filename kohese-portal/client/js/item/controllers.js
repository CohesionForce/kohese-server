'use strict';

angular
  .module('app')
  .controller('ItemController', ['$scope', '$state', '$location', 'Item', 'ItemRepository', '$anchorScroll',
    function($scope, $state, $location, Item, ItemRepository, $anchorScroll) {
    $scope.items = [];
    $scope.tree_data = [];
    $scope.tree = [];
    $scope.tree_control = {};
    $scope.filterString = "";
    $scope.hidden = {};
    $scope.collapsed = {};

    $scope.newTree = ItemRepository.internalTree;

    $scope.listTitle = "Item List"
    function getItems() {
      Item
        .find()
        .$promise
        .then(function(results) {
          $scope.items = results;
          $scope.tree = convertListToTree($scope.items, 'id', 'parentId');
          $scope.tree_data = $scope.tree.data;
        });
    }
    getItems();

    $scope.cancel = function() {
      if (angular.isDefined($state.params.parentId)){
        $state.go('editItem', {itemId: $state.params.parentId});
   	  } else {
        $state.go('items');
       }
     }

    $scope.newItem = function() {
        $state.go('newItem');
      }

    $scope.editItem = function(item) {
        $state.go('editItem', {itemId: item.id});
      };

    $scope.editItemById = function(id) {
        $state.go('editItem', {itemId: id});
      };

    $scope.removeItem = function(item) {
      Item
        .deleteById(item)
        .$promise
        .then(function() {
          getItems();
        });
    };

    $scope.expanding_property = {
        field: "title",
        displayName: "Title",
    	sortable : true,
    	filterable: true,
		sortingType : "string"
    };

    $scope.col_defs = [
        {
            field: "description",
            displayName: "Description",
    		sortable : false,
    		cellTemplate: "<span>{{ row.branch[col.field] | limitTo:70 }}<span ng-show=\"row.branch[col.field].length>70\">...</span></span>",
    		filterable: true
        }
    ];

    $scope.item_click_handler = function (branch) {
        $state.go('editItem', {itemId: branch.data.id});
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

        var tree = {};
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
            	if(angular.isDefined(tree.objs[parentId])){
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
            	// TBD: itemProxy.parentRef = parent;
            } else {
                rootIds.push(primaryKey);
            }
        }

        for (var i = 0; i < rootIds.length; i++) {
            tree.data.push(tree.objs[rootIds[i]]);
        };

        return tree;
    }

      $scope.$on('currentItemUpdate', function(event, data){
          console.log(event);
          console.log(data.id);
          $location.hash(data.id);
          $anchorScroll();
        }
      )
    $scope.syncLocation = function(){
        $anchorScroll();
    }
      
    $scope.changeVisibility = function(){
      console.log(this);
      $scope.collapsed[this.itemProxy.item.id] = !$scope.collapsed[this.itemProxy.item.id];
      var isNowCollapsed = $scope.collapsed[this.itemProxy.item.id];
      var childIdStack = [];
      var childId = "";
      var proxy = this.itemProxy;

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

  }]);

angular
.module('app')
.controller('ItemEditController', ['$scope', '$state', '$location', 'Item', 'ItemRepository', function($scope,
    $state, $location, Item, ItemRepository) {

    $scope.listTitle = "Children"
    $scope.editedItem = new Item;
    $scope.itemProxy = {};
    $scope.enableEdit = false;

    $scope.newTree = ItemRepository.internalTree;

    if (angular.isDefined($state.params.parentId)){
    	$scope.editedItem.parentId = $state.params.parentId;
    	$scope.enableEdit=true;
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
        ItemRepository.fetchItem($scope.editedItem.id);
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
            getChildren();
          });
      };

}]);

angular
.module('app')
.controller('NavigationController', ['$scope', '$state', '$location', 'Item', function($scope,
    $state, $location, Item) {

    $('#side-menu').metisMenu();

}]);
