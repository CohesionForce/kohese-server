/**
 * Created by josh on 7/28/15.
 */

function ContainerController(tabService, $scope, $state, $stateParams) {
    var containerCtrl = this;
    containerCtrl.tabs = []

    $scope.$on('navigationEvent', function onNavigationEvent(event, data) {
        let newTab = createTab(data.state, data.params);
        console.log(newTab);
        containerCtrl.setTab(newTab);
        $state.go(newTab.state, newTab.params);
    });


    function createBaseTab() {
        var currentState = $state.current.name;

        containerCtrl.baseTab = createTab($state.current.name, $stateParams);

    }


    createBaseTab();


//Will need refactoring to account for refreshing the page at some point

    containerCtrl.tabs = [containerCtrl.baseTab];
    tabService.setCurrentTab(containerCtrl.tabs[0]);

    containerCtrl.addTab = function () {
        var tab = createTab('kohese.dashboard', false);
        containerCtrl.setTab(tab);
    };

    function createTab(state, params) {
        var newTab = tabService.createTab(state, params)
        console.log(newTab);
        newTab.position = containerCtrl.tabs.length;
        tabService.setCurrentTab(newTab);
        containerCtrl.tabs.push(newTab);
        newTab.active = true;

        return newTab;
    }


    containerCtrl.setTab = function (tab) {
        $scope.$broadcast('tabSelected', tab.id);
        tab.active = true;
        tabService.setCurrentTab(tab);
        $state.go(tab.state, tab.params);
    };

    containerCtrl.deleteTab = function (tab) {
        // If tab is currently selected select the previous tab, 
        // If it is the first tab get the next one
        // If it is the only tab, recreate the base tab

        if (tab.id === tabService.getCurrentTab().id)
        {
            if (tab.position === 0)
            {
                if (containerCtrl.tabs.length === 1) 
                    {
                    containerCtrl.addTab();
                    } 
                else 
                    {
                    containerCtrl.setTab(containerCtrl.tabs[1]);
                    }   
            } 
            else 
                {
                containerCtrl.setTab(containerCtrl.tabs[tab.position - 1]);
                }
            
        }

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



