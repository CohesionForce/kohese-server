'use strict';

angular
  .module('app')
  .controller('ItemController', ['$scope', '$state', '$location', 'Item', function($scope,
      $state, $location, Item) {
    $scope.items = [];
    $scope.tree_data = [];
    $scope.my_tree = {};
    $scope.filterString = "";
    
    $scope.listTitle = "Item List"
    function getItems() {
      Item
        .find()
        .$promise
        .then(function(results) {
          $scope.items = results;
          $scope.tree_data = getTree($scope.items, 'id', 'parentId');
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
//    		cellTemplate: "<textarea cols=\"70\" type=\"text\" ng-model=\"row.branch[col.field]\"/>",
//    			"<img ng-click="cellTemplateScope.click('example')" ng-src="{{ row.branch[col.field] }}" />",
    		filterable: true
        }
    ];

    $scope.my_tree_handler = function (branch) {
        console.log('you clicked on', branch)
    }

    function getTree(data, primaryIdName, parentIdName) {
        if (!data || data.length == 0 || !primaryIdName || !parentIdName)
            return [];

        var tree = [],
            rootIds = [],
            item = data[0],
            primaryKey = item[primaryIdName],
            parentId,
            parent,
            len = data.length,
            i = 0;

        $scope.treeObjs = {};
        
        while (i < len) {
        	var itemProxy = {};
            itemProxy.data = data[i++];
            itemProxy.id = itemProxy.data.id;
            itemProxy.parentId = itemProxy.data.parentId;
            itemProxy.title = itemProxy.data.title;
            itemProxy.description = itemProxy.data.description;
            primaryKey = itemProxy.data[primaryIdName];
        	if(angular.isDefined($scope.treeObjs[primaryKey])){
        		// Some forward declaration of children occurred, so copy them here
        		itemProxy.children = $scope.treeObjs[primaryKey].children;
        	}
            $scope.treeObjs[primaryKey] = itemProxy;
            parentId = itemProxy.data[parentIdName];

            if (parentId) {
            	if(angular.isDefined($scope.treeObjs[parentId])){
                    parent = $scope.treeObjs[parentId];            		
            	} else {
            		// Create the parent before it is found
            		parent = {};
            		$scope.treeObjs[parentId] = parent;
            	}  

                if (parent.children) {
                    parent.children.push(itemProxy);
                } else {
                    parent.children = [itemProxy];
                }
            } else {
                rootIds.push(primaryKey);
            }
        }

        for (var i = 0; i < rootIds.length; i++) {
            tree.push($scope.treeObjs[rootIds[i]]);
        };

        return tree;
    }

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

    $scope.cancel = function() {
      if (angular.isDefined($state.params.parentId)){
        $state.go('editItem', {itemId: $state.params.parentId});
   	  } else {
        $state.go('items');        		 
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