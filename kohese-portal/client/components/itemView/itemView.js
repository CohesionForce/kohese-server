/**
 * Created by josh on 7/13/15.
 */
angular.module('app.itemview', [])
    .controller('ItemviewController', ['$location', 'Item', 'ItemRepository', '$rootScope',
        function ($location, Item, ItemRepository, $rootScope) {

            var detailsCtrl = this;

            detailsCtrl.listTitle = "Children";
            detailsCtrl.editedItem = {description: "No item selected"};
            detailsCtrl.enableEdit = false;
            detailsCtrl.defaultTab = {active: true};
            detailsCtrl.showChunksInAnalysis = true;
            detailsCtrl.showTokensInAnalysis = true;
            detailsCtrl.showChunksInDetails = false;
            detailsCtrl.showTokensInDetails = false;

            detailsCtrl.newTree = ItemRepository.internalTree;

            detailsCtrl.$on('newItem', function (event, parentId) {
                detailsCtrl.editedItem = {};
                detailsCtrl.editedItem.parentId = parentId;
                detailsCtrl.enableEdit = true;
            });

            detailsCtrl.$on('editItem', function (event, itemId) {
                detailsCtrl.isEdit = true;
                ItemRepository.fetchAnalysis(itemId);
                detailsCtrl.itemProxy = ItemRepository.getItem(itemId);
                detailsCtrl.editedItem = detailsCtrl.itemProxy.item;
                ItemRepository.setCurrentItem(detailsCtrl.editedItem);
                detailsCtrl.defaultTab.active = true;

            });

            detailsCtrl.upsertItem = function () {
                var itemForm = this.itemForm;
                Item
                    .upsert(detailsCtrl.editedItem)
                    .$promise
                    .then(function (updatedItem) {
                        ItemRepository.fetchItem(detailsCtrl.editedItem.id);
                        itemForm.$setPristine();
                    });
            };

            detailsCtrl.cancel = function () {

                if (this.itemForm.$dirty) {
                    ItemRepository.fetchItem(detailsCtrl.editedItem.id);
                    this.itemForm.$setPristine();
                }
            };

            detailsCtrl.newItem = function () {
                $rootScope.$broadcast('newItem', detailsCtrl.editedItem.id)
            };

            detailsCtrl.editItem = function (item) {
                $rootScope.$broadcast('editItem', item.id);
                console.log("Item edit: Edit Item");
            };

            detailsCtrl.removeItem = function (item) {
                Item
                    .deleteById(item)
                    .$promise
                    .then(function () {
                        // TBD:  May need to do something special if the delete fails
                    });
            };


        }
    ]);