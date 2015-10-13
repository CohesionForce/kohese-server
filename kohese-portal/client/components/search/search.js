/**
 * Created by josh on 9/16/15.
 */

function SearchController(ItemRepository, UserService, DecisionService, ActionService, tabService, $state, $scope, $stateParams, $filter) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();

    ctrl.searchString = tab.params.filter;
    ctrl.itemList = ItemRepository.getAllItemProxies();
    ctrl.kindList = ItemRepository.modelTypes;
    ctrl.userList = UserService.getAllUsers();
    ctrl.actionStates = ActionService.getActionStates();
    ctrl.categories = $filter('categories')(ctrl.itemList);

    console.log(ctrl.categories);


    if (!ctrl.searchString) {
        ctrl.searchString = '';
    }

    ctrl.customFilter = {
        item: {
            $: ctrl.searchString
        }
    };

    $scope.$on('itemRepositoryReady', function () {
        ctrl.itemList = ItemRepository.getAllItemProxies();
        ctrl.decisionStates = DecisionService.getDecisionStates();
        ctrl.actionStates = ActionService.getActionStates();
        ctrl.categories = $filter('categories')(ctrl.itemList);
        ctrl.userList = UserService.getAllUsers();
    });


    if (ctrl.searchString !== '') {
        tab.setTitle('Search - ' + ctrl.searchString);
    } else {
        tab.setTitle('Search - All')
    }

    if ($stateParams.id) {
        ctrl.currentItem = $stateParams.id;
    }

    ctrl.resetSearch = function(){
        ctrl.customFilter = {
            item: {
                $: ctrl.searchString
            }
        };
    };

    ctrl.navigateToTree = function () {
        tab.setState('explore.edit');
        $state.go('kohese.explore.edit', {id: ctrl.currentItem})
    };

    ctrl.updateTab = function (itemId) {
        tab.params.id = itemId;
        ctrl.currentItem = itemId;
        console.log(ctrl.currentItem)
    };

    //Filter updates

    ctrl.updateAssignedToFilter = function(selected){
        if(selected){
            ctrl.customFilter.item.assignedTo = selected.title;
        }
    };

    ctrl.updateSearchStringFilter = function(){
        ctrl.customFilter.item.$ = ctrl.searchString;
    }

}


export default () => {

    angular.module('app.search', [
        'app.services.itemservice',
        'app.services.tabservice',
        'app.services.userservice',
        'app.services.actionservice',
        'app.services.decisionservice'])
        .controller('SearchController', SearchController)
}