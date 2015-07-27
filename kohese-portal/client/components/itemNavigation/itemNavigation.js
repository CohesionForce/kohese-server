/**
 * Created by josh on 7/13/15.
 */
angular.module('app.itemnavigation', [])
    .controller('ItemnavigationController', ['$location', 'Item', 'ItemRepository', '$anchorScroll', '$rootScope',
        function ($location, Item, ItemRepository, $anchorScroll, $rootScope) {

            var itemNavCtrl = this;

            itemNavCtrl.filterString = "";
            itemNavCtrl.analysisFilterString = "";
            itemNavCtrl.hidden = {};
            itemNavCtrl.collapsed = {};

            itemNavCtrl.newTree = ItemRepository.internalTree;

            itemNavCtrl.newItem = function () {
                $rootScope.$broadcast('newItem');
            };

            itemNavCtrl.editItem = function (item) {
                $rootScope.$broadcast('editItem', item.id);
            };


            itemNavCtrl.removeItem = function (item) {
                Item
                    .deleteById(item)
                    .$promise
                    .then(function () {
                        console.log("::: Item has been deleted: " + item.id);
                    });
            };

            itemNavCtrl.$on('currentItemUpdate', function (event, data) {
                    $location.hash(data.id);
                    $anchorScroll();
                }
            );

            itemNavCtrl.syncLocation = function () {
                $anchorScroll();
            };

            itemNavCtrl.expandAll = function () {
                // Set all nodes to expanded
                for (var index in itemNavCtrl.collapsed) {
                    itemNavCtrl.collapsed[index] = false;
                }
                // Set all nodes to visible
                for (var index in itemNavCtrl.hidden) {
                    itemNavCtrl.hidden[index] = false;
                }
            };

            itemNavCtrl.collapseAll = function () {
                // Collapse all root nodes that are current expanded
                for (var index = 0; index < itemNavCtrl.newTree.roots.length; index++) {
                    var rootNode = itemNavCtrl.newTree.roots[index];
                    if (!itemNavCtrl.collapsed[rootNode.item.id]) {
                        changeVisibilityOn(rootNode);
                    }
                }

            };

            function changeVisibilityOn(proxy) {
                if (itemNavCtrl.showAsTree) {
                    itemNavCtrl.collapsed[proxy.item.id] = !itemNavCtrl.collapsed[proxy.item.id];
                    var isNowCollapsed = itemNavCtrl.collapsed[proxy.item.id];
                    var childIdStack = [];
                    var childId = "";

                    // Add immediate descendants to stack
                    for (var index = 0; index < proxy.children.length; index++) {
                        childId = proxy.children[index].item.id;
                        childIdStack.push(childId);
                    }

                    while (childId = childIdStack.pop()) {
                        if (isNowCollapsed && !itemNavCtrl.hidden[childId]) {
                            // New state is collapsed
                            itemNavCtrl.collapsed[childId] = true;
                            proxy = ItemRepository.getItem(childId);
                            for (var index = 0; index < proxy.children.length; index++) {
                                var grandChildId = proxy.children[index].item.id;
                                childIdStack.push(grandChildId);
                            }
                        }
                        itemNavCtrl.hidden[childId] = isNowCollapsed;
                    }
                }
            }

            itemNavCtrl.changeVisibility = function () {
                changeVisibilityOn(this.itemProxy);
            }

        }]);