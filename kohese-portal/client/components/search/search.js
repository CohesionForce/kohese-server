/**
 * Created by josh on 9/16/15.
 */

function SearchController(ItemRepository, UserService, DecisionService, ActionService, tabService, SearchService, $state, $scope, $stateParams, $filter) {
    var ctrl = this;
    var tab = tabService.getCurrentTab();
    var id = tabService.getTabId();


    ctrl.searchString = tab.params.filter;
    ctrl.itemList = ItemRepository.getAllItemProxies();
    ctrl.kindList = ItemRepository.modelTypes;
    ctrl.userList = UserService.getAllUsers();
    ctrl.actionStates = ActionService.getActionStates();
    ctrl.decisionStates = DecisionService.getDecisionStates();

    ctrl.categories = $filter('categories')(ctrl.itemList);

    for (var index = 0; index < ctrl.itemList.length; index++) {
        var currentItem = ctrl.itemList[index];
        currentItem.parentProxy = ItemRepository.getProxyFor(currentItem.item.parentId);
    }

    if (!ctrl.searchString) {
        ctrl.searchString = '';
    }

    ctrl.customFilter = SearchService.getFilterObject(id);
    if (!ctrl.customFilter) {
        ctrl.customFilter = {
            item: {
                $: ctrl.searchString
            }
        };
    }


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

    ctrl.resetSearch = function () {
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
    };

    //Filter updates

    ctrl.updateAssignedToFilter = function (selected) {
        if (selected) {
            ctrl.customFilter.item.assignedTo = selected.title;
        }
    };

    ctrl.updateSearchStringFilter = function () {
        ctrl.customFilter.item.$ = ctrl.searchString;
    };

    $scope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            SearchService.setFilterObject(ctrl.customFilter, id);
        })

}


export default () => {

    angular.module('app.search', [
        'app.services.itemservice',
        'app.services.tabservice',
        'app.services.userservice',
        'app.services.actionservice',
        'app.services.decisionservice',
        'app.services.searchservice'])
        .controller('SearchController', SearchController)
}