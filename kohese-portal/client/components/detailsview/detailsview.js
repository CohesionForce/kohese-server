/**
 * Created by josh on 7/13/15.
 */

function DetailsViewController(Item, ItemRepository, $rootScope, tabService, $scope, $stateParams) {

    var detailsCtrl = this;

    detailsCtrl.tab = tabService.getCurrentTab();
    detailsCtrl.tab.route = $stateParams.id;
    detailsCtrl.listTitle = "Children";
    detailsCtrl.enableEdit = false;
    detailsCtrl.itemProxy = {};
    detailsCtrl.defaultTab = {active: true};
    detailsCtrl.showChunksInAnalysis = true;
    detailsCtrl.showTokensInAnalysis = true;
    detailsCtrl.showChunksInDetails = false;
    detailsCtrl.showTokensInDetails = false;

    if (angular.isDefined($stateParams.id)) {
        console.log($stateParams.id);
        detailsCtrl.itemProxy = ItemRepository.getItemProxy($stateParams.id);
    } else if(angular.isDefined($stateParams.parentId)){
        {
            detailsCtrl.itemProxy.item = {};
            console.log("Parent id defined");
            console.log(detailsCtrl.itemProxy);
            detailsCtrl.itemProxy.item.parentId = $stateParams.parentId;
        }
    } else {
        console.log("State params undefined");
        detailsCtrl.itemProxy.item = {description: "No item selected"};
    }


    $scope.$on('itemRepositoryReady', function () {
        detailsCtrl.itemProxy = ItemRepository.getItemProxy($stateParams.id);
    });

    $scope.$on('tabSelected', function () {
        detailsCtrl.tab = tabService.getCurrentTab();
    });

    $scope.$on('newItem', function (event, parentId) {
        detailsCtrl.itemProxy.item = {};
        detailsCtrl.itemProxy.item.parentId = parentId;
        detailsCtrl.enableEdit = true;
    });

    detailsCtrl.setTabState = function(state) {
        detailsCtrl.tab.setState(state);
    };

    detailsCtrl.toggleView = function (state) {
        detailsCtrl.tab.toggleType();
        detailsCtrl.tab.setState(state);
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

export default () => {
    angular.module('app.detailsview', ['app.services.tabservice'])
        .controller('DetailsViewController', ['Item', 'ItemRepository', '$rootScope', 'tabService', '$scope', '$stateParams',
            DetailsViewController]);
}
