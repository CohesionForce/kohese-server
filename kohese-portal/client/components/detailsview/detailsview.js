/**
 * Created by josh on 7/13/15.
 */
angular.module('app.detailsview', ['app.services.tabservice'])
    .controller('DetailsViewController', ['Item', 'ItemRepository', '$rootScope', 'tabService', '$scope', DetailsViewController]);


function DetailsViewController(Item, ItemRepository, $rootScope, tabService, $scope) {

    var detailsCtrl = this;
    //console.log("DetailsCtrl init");

    detailsCtrl.tab = tabService.getCurrentTab();
    detailsCtrl.listTitle = "Children";
    detailsCtrl.enableEdit = false;
    detailsCtrl.itemProxy = {};
    detailsCtrl.itemProxy.item = {description: "No item selected"};
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
        detailsCtrl.itemProxy.item = {};
        detailsCtrl.itemProxy.item.parentId = parentId;
        detailsCtrl.enableEdit = true;
    });

    $scope.$on('editItem', function (event, itemId) {
        detailsCtrl.isEdit = true;
        detailsCtrl.itemProxy = ItemRepository.getItem(itemId);
        ItemRepository.setCurrentItem(detailsCtrl.itemProxy.item);
        detailsCtrl.defaultTab.active = true;

    });

    detailsCtrl.toggleView = function() {
        detailsCtrl.tab.toggleType();
        detailsCtrl.tab.toggleState();
    };

    detailsCtrl.fetchAnalysis = function () {
        ItemRepository.fetchAnalysis(detailsCtrl.itemProxy.item.id);
    };

    detailsCtrl.upsertItem = function () {
        var itemForm = this.itemForm;
        Item
            .upsert(detailsCtrl.itemProxy.item)
            .$promise
            .then(function (updatedItem) {
                ItemRepository.fetchItem(detailsCtrl.itemProxy.item.id);
                itemForm.$setPristine();
            });
    };

    detailsCtrl.cancel = function () {

        if (this.itemForm.$dirty) {
            ItemRepository.fetchItem(detailsCtrl.itemProxy.item.id);
            this.itemForm.$setPristine();
        }
    };

    detailsCtrl.newItem = function () {
        $rootScope.$broadcast('newItem', detailsCtrl.itemProxy.item.id)
    };

    detailsCtrl.editItem = function (item) {
        $rootScope.$broadcast('editItem', item.id);
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
