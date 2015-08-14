/**
 * Created by josh on 7/13/15.
 */
angular.module('app.detailsview', ['app.tabservice'])
    .controller('DetailsviewController', ['Item', 'ItemRepository', '$rootScope', 'tabService', DetailsviewController]);


function DetailsviewController(Item, ItemRepository, $rootScope, tabService) {

    console.log("Before detailsCtrl dec");
    var detailsCtrl = this;

    detailsCtrl.tab = tabService.getCurrentTab();
    detailsCtrl.listTitle = "Children";
    detailsCtrl.enableEdit = false;
    detailsCtrl.editedItem = { description: "No item selected"};
    detailsCtrl.defaultTab = {active: true};
    detailsCtrl.showChunksInAnalysis = true;
    detailsCtrl.showTokensInAnalysis = true;
    detailsCtrl.showChunksInDetails = false;
    detailsCtrl.showTokensInDetails = false;

    console.log("Details Tab:");
    console.log(detailsCtrl.tab);

    detailsCtrl.activate = function($scope)
    {
        console.log("Activate called");
        $scope.$on('newItem', function (event, parentId) {
            detailsCtrl.editedItem = {};
            detailsCtrl.editedItem.parentId = parentId;
            detailsCtrl.enableEdit = true;
        });

        $scope.$on('editItem', function (event, itemId) {
            console.log(detailsCtrl);
            detailsCtrl.isEdit = true;
            ItemRepository.fetchAnalysis(itemId);
            detailsCtrl.itemProxy = ItemRepository.getItem(itemId);
            detailsCtrl.editedItem = detailsCtrl.itemProxy.item;
            ItemRepository.setCurrentItem(detailsCtrl.editedItem);
            detailsCtrl.defaultTab.active = true;

        });

    };

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
    }


}
