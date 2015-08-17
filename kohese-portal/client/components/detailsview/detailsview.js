/**
 * Created by josh on 7/13/15.
 */
angular.module('app.detailsview', ['app.services.tabservice'])
    .controller('DetailsViewController', ['Item', 'ItemRepository', '$rootScope', 'tabService', '$scope', DetailsViewController]);


function DetailsViewController(Item, ItemRepository, $rootScope, tabService, $scope) {

    var detailsCtrl = this;
    console.log("DetailsCtrl init");

    detailsCtrl.tab = tabService.getCurrentTab();
    detailsCtrl.listTitle = "Children";
    detailsCtrl.enableEdit = false;
    detailsCtrl.editedItem = {description: "No item selected"};
    detailsCtrl.defaultTab = {active: true};
    detailsCtrl.showChunksInAnalysis = true;
    detailsCtrl.showTokensInAnalysis = true;
    detailsCtrl.showChunksInDetails = false;
    detailsCtrl.showTokensInDetails = false;

    $scope.$on('tabSelected', function(event){
        detailsCtrl.tab = tabService.getCurrentTab();
        console.log(detailsCtrl.tab);
    });

    $scope.$on('newItem', function (event, parentId) {
        detailsCtrl.editedItem = {};
        detailsCtrl.editedItem.parentId = parentId;
        detailsCtrl.enableEdit = true;
    });

    $scope.$on('editItem', function (event, itemId) {
        console.log(detailsCtrl);
        detailsCtrl.isEdit = true;
        detailsCtrl.itemProxy = ItemRepository.getItem(itemId);
        detailsCtrl.editedItem = detailsCtrl.itemProxy.item;
        ItemRepository.setCurrentItem(detailsCtrl.editedItem);
        detailsCtrl.defaultTab.active = true;

    });


    detailsCtrl.fetchAnalysis = function () {
        ItemRepository.fetchAnalysis(detailsCtrl.editedItem.id);
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
