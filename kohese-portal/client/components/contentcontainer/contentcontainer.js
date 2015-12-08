/**
 * Created by josh on 7/28/15.
 */

function ContainerController(tabService, $scope, $state, $stateParams) {
    var containerCtrl = this;

    containerCtrl.tabService = tabService;

    var Tab = function (state, params, type) {
        var tab = this;
        var bundleListener;
        tab.title = 'Kohese';
        tab.scope = {};
        tab.content = {};
        tab.id = tabService.getTabId();


        if (params) {
            tab.params = params;
        } else {
            tab.params = {}
        }

        if (state) {
            tab.state = state;
        } else {
            tab.state = 'kohese.dashboard';
        }

        if (type) {
            tab.type = type;
        } else {
            tab.type = 'singleview';
        }

        tab.setType = function (type) {
            tab.type = type;
        };
        tab.toggleType = function () {
            if (tab.type == 'dualview') {
                tab.type = 'singleview';
            } else {
                tab.type = 'dualview';
            }
        };
        tab.setScope = function (scope) {
            tab.scope = scope;
            bundleListener = tab.scope.$on('tabSelected', function (event, data) {
                console.log(data);
                console.log(tab);
                if (data === tab.id) {
                    console.log('Tab Selected :: Bundle Listener');
                    console.log(tab);
                    console.log(data);
                    tab.scope.$broadcast('bundleReady');
                    bundleListener();
                }
            })
        };

        tab.setTitle = function (title) {
            tab.title = title;
        };

        tab.setState = function (state) {
            if (state === 'investigate') {
                tab.state = 'kohese.investigate'
            } else if (state === 'explore') {
                tab.state = 'kohese.explore'
            } else if (state === 'search') {
                tab.state = 'kohese.search'
            } else if (state === 'search') {
                tab.state = 'kohese.search.edit'
            } else if (state === 'edit') {
                // Will remove once references are gone
                tab.state = 'kohese.explore.edit'
            } else if (state === 'explore.edit') {
                tab.state = 'kohese.explore.edit'
            } else if (state === 'create') {
                tab.state = 'kohese.explore.create'
            } else {
                tab.state = state;
            }
        };
        tab.updateFilter = function (string) {
            tab.scope.$broadcast('newFilterString', string);
        };

        tab.toggleBundle = function () {
            bundleListener();
        };
    };

    $scope.$on('navigationEvent', function onNavigationEvent(event, data) {
        let newTab = createTab(data.state, data.params, data.type);
        containerCtrl.setTab(newTab);
        $state.go(newTab.state, newTab.params);
    });


    function createBaseTab() {
        var currentState = $state.current.name;

        if (currentState === 'kohese.explore') {
            containerCtrl.baseTab = new Tab('kohese.explore', {}, 'dualview');
        } else if (currentState === 'kohese.explore.edit') {
            containerCtrl.baseTab = new Tab('kohese.explore.edit', {id: $stateParams.id}, 'dualview')
        } else if (currentState === 'kohese.explore.create') {
            containerCtrl.baseTab = new Tab('kohese.explore.create', {parentId: $stateParams.parentId}, 'dualview')
        } else if (currentState === 'kohese.search') {
            containerCtrl.baseTab = new Tab('kohese.search', {id: $stateParams.id}, 'dualview')
        } else if (currentState === 'kohese.search.edit') {
            containerCtrl.baseTab = new Tab('kohese.search.edit', {id: $stateParams.id}, 'dualview')
        } else if (currentState === 'kohese.search.create') {
            containerCtrl.baseTab = new Tab('kohese.search.create', {parentId: $stateParams.parentId}, 'dualview')
        } else {
            containerCtrl.baseTab = new Tab('kohese.dashboard', {}, 'singleview')
        }

    }


    createBaseTab();


//Will need refactoring to account for refreshing the page at some point

    containerCtrl.tabs = [containerCtrl.baseTab];
    containerCtrl.tabService.setCurrentTab(containerCtrl.tabs[0]);

    containerCtrl.addTab = function (state, params) {
        var tab = createTab(state, params);
        containerCtrl.setTab(tab);
    };

    function createTab(state, params, type) {
        tabService.incrementTabs();
        var newTab = new Tab(state, params, type);
        newTab.position = containerCtrl.tabs.length;
        tabService.setCurrentTab(newTab);
        containerCtrl.tabs.push(newTab);
        newTab.active = true;

        return newTab;
    }


    containerCtrl.setTab = function (tab) {
        $scope.$broadcast('tabSelected', tab.id);
        tab.active = true;
        containerCtrl.tabService.setCurrentTab(tab);
        $state.go(tab.state, tab.params);
    };

    containerCtrl.deleteTab = function (tab) {
        containerCtrl.tabs.splice(tab.position, 1);
        updatePositions();
    };

    function updatePositions() {
        for (var i = 0; i < containerCtrl.tabs.length; i++) {
            containerCtrl.tabs[i].position = i;
        }
    }

}

var ContentContainer = function () {
    return {
        restrict: 'EA',
        controller: 'ContainerController',
        templateUrl: 'components/contentcontainer/contentcontainer.html'
    }
};


export default () => {

    var containerModule = angular.module('app.contentcontainer', [
        'app.services.tabservice'])
        .controller('ContainerController', ContainerController)
        .directive('contentContainer', ContentContainer);

    require('./subviews/dualview/dualview')(containerModule);
    require('./subviews/singleview/singleview')(containerModule);

}



