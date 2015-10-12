/**
 * Created by josh on 7/13/15.
 */

function DetailsViewController($state, ItemRepository, analysisService, Item, DecisionService, ActionService,
                               CategoryService, UserService, tabService, $scope, $stateParams) {

    var detailsCtrl = this;

    detailsCtrl.tab = tabService.getCurrentTab();
    detailsCtrl.tab.route = $stateParams.id;
    detailsCtrl.filterString = "";
    detailsCtrl.analysisFilterString = "";
    detailsCtrl.analysisSummarySortField = ['-count','text'];
    detailsCtrl.analysisDetailsSortField = "";
    detailsCtrl.enableEdit = false;
    detailsCtrl.itemProxy = {};
    detailsCtrl.defaultTab = {active: true};
    detailsCtrl.showChunksInAnalysis = true;
    detailsCtrl.showTokensInAnalysis = true;
    detailsCtrl.showChunksInDetails = false;
    detailsCtrl.showTokensInDetails = false;
    detailsCtrl.filterList = [];
    detailsCtrl.kindList = ItemRepository.modelTypes;
    detailsCtrl.decisionStates = DecisionService.getDecisionStates();
    detailsCtrl.actionStates = ActionService.getActionStates();
    detailsCtrl.categoryTags = CategoryService.getTags();
    detailsCtrl.userList = UserService.getAllUsers();
    detailsCtrl.analysisFilterPOS = analysisService.filterPOS;
    detailsCtrl.analysisPOSFilterCriteria = analysisService.posFilterCriteria;
    detailsCtrl.analysisPOSFilterCriteriaList = Object.keys(analysisService.posFilterCriteria);
    detailsCtrl.analysisPOSFilterName = "Standard";

    $scope.$on('$stateChangeSuccess', function () {
        $scope.$emit('newItemSelected', $stateParams.id);
    });

    if (detailsCtrl.tab.state === 'kohese.investigate') {
        detailsCtrl.tab.setTitle('Investigate');
        detailsCtrl.tab.params = {
            id: $stateParams.id
        };
    }

    if (angular.isDefined($stateParams.id)) {
        detailsCtrl.itemProxy = ItemRepository.getItemProxy($stateParams.id);

    } else if (angular.isDefined($stateParams.parentId)) {
        {
            detailsCtrl.itemProxy.item = new Item();
            detailsCtrl.itemProxy.item.parentId = $stateParams.parentId;
        }
    } else {
        detailsCtrl.itemProxy.item = new Item();
    }

    if (detailsCtrl.tab.state === 'kohese.explore.create') {
        detailsCtrl.enableEdit = true;
    }


    $scope.$on('itemRepositoryReady', function () {
        detailsCtrl.itemProxy = ItemRepository.getItemProxy($stateParams.id);
        detailsCtrl.decisionStates = DecisionService.getDecisionStates();
        detailsCtrl.actionStates = ActionService.getActionStates();
        detailsCtrl.categoryTags = CategoryService.getTags();
        detailsCtrl.userList = UserService.getAllUsers();

    });

    $scope.$on('tabSelected', function () {
        detailsCtrl.tab = tabService.getCurrentTab();
    });

    detailsCtrl.updateTab = function (state, id, view) {
        detailsCtrl.tab.setState(state);
        detailsCtrl.tab.params.id = id;
        if (view) {
            detailsCtrl.tab.toggleType();
            detailsCtrl.tab.setType = view;
        }
    };

    detailsCtrl.actionAssigned = function(selected){
        if(selected){
        detailsCtrl.itemProxy.item.assignedTo = selected.title;
        }
    };

    detailsCtrl.decisionApproved = function(selected){
        if(selected){
        detailsCtrl.itemProxy.item.approvedBy = selected.title;
        }
    };

    detailsCtrl.updateItem = function () {
        var newModel = ItemRepository.modelTypes[detailsCtrl.itemProxy.kind];
        var newItem = new newModel();
        ItemRepository.copyAttributes(detailsCtrl.itemProxy.item, newItem);
        detailsCtrl.itemProxy.item = newItem;
        if(detailsCtrl.itemProxy.kind === 'Action' || detailsCtrl.itemProxy.kind === 'Decision'){
            detailsCtrl.itemProxy.item.alternatives = [];
            detailsCtrl.itemProxy.item.alternatives[0] = {text : ''};
        }
    };

    detailsCtrl.addAlternative = function () {
        var altLength = detailsCtrl.itemProxy.item.alternatives.length;
        detailsCtrl.itemProxy.item.alternatives[altLength] = {text:''};
        console.log(detailsCtrl.itemProxy.item.alternatives);
    };

    detailsCtrl.tagSelected = function(selected) {
        if (selected) {
            //window.alert('You have selected ' + selected);
            console.log(selected);
        } else {
            console.log('cleared');
        }
    };

    detailsCtrl.toggleView = function (state) {
        detailsCtrl.tab.toggleType();
        detailsCtrl.tab.setState(state);
    };

    detailsCtrl.fetchAnalysis = function () {
        analysisService.fetchAnalysis(detailsCtrl.itemProxy);
    };

    detailsCtrl.upsertItem = function () {
        ItemRepository.upsertItem(detailsCtrl.itemProxy.item)
            .then(function (updatedItem) {
                ItemRepository.fetchItem(updatedItem)
                    .then(function () {
                        if (updatedItem.parentId != '') {
                            $state.go('kohese.explore.edit', {id: updatedItem.parentId})
                        } else {
                            $state.go('kohese.explore.edit', {id: updatedItem.id})
                        }
                    }
                )
                ;
                detailsCtrl.itemForm.$setPristine();
            });
    };

    detailsCtrl.getLastFilter = function () {
        detailsCtrl.analysisFilterString = detailsCtrl.filterList.pop();
        detailsCtrl.analysisFilterInput = detailsCtrl.analysisFilterString;
    };

    detailsCtrl.submitFilter = function () {
        detailsCtrl.filterList.push(detailsCtrl.analysisFilterString);
        detailsCtrl.analysisFilterString = detailsCtrl.analysisFilterInput;
    };

    detailsCtrl.cancel = function () {

        if (this.itemForm.$dirty) {
            ItemRepository.fetchItem(detailsCtrl.itemProxy.item);
            this.itemForm.$setPristine();
        }
    };

    detailsCtrl.removeItem = function (item) {
        ItemRepository.deleteItem(item)
            .then(function () {
                // TBD:  May need to do something special if the delete fails
            });
    }


}

export default () => {
    angular.module('app.detailsview', [
        'app.services.tabservice',
        'app.services.decisionservice',
        'app.services.actionservice',
        'app.services.categoryservice',
        'app.services.userservice'])
        .controller('DetailsViewController', DetailsViewController);
}
