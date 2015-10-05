/**
 * Created by josh on 7/28/15.
 */

function ContainerController(tabService, $scope, $state) {
    var containerCtrl = this;

    containerCtrl.tabService = tabService;

    var Tab = function (state, params, type) {
        var tab = this;
        tab.title = 'Explore';
        tab.scope = {};
        tab.content = {};
        console.log(type);

        if (params) {
            tab.params = params;
        } else {
            tab.params = {}
        }

        if (state) {
            tab.state = state;
        } else {
            tab.state = 'kohese.explore';
        }

        if (type){
            tab.type = type;
        } else {
            tab.type = 'dualview';
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
        };

        tab.setTitle = function (title){
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
            }
            //console.log(tab.state);
        };
        tab.updateFilter = function (string) {
            tab.scope.$broadcast('newFilterString', string);
        }
    };

    $scope.$on('navigationEvent', function onNavigationEvent(event, data) {
        console.log(data);
        let newTab = createTab(data.state, data.params, data.type);
        containerCtrl.setTab(newTab);
        $state.go(newTab.state);
    });


    //Will need refactoring to account for refreshing the page at some point
    containerCtrl.baseTab = new Tab();
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
        console.log(tab);
        tab.active = true;
        containerCtrl.tabService.setCurrentTab(tab);
        $state.go(tab.state, tab.params);
        $scope.$broadcast('tabSelected');
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



