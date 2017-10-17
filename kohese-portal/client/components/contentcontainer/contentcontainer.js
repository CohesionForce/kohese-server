/**
 * Created by josh on 7/28/15.
 */

function ContainerController(tabService, $scope, $state, $stateParams) {
    var containerCtrl = this;
    containerCtrl.tabs = []

    $scope.$on('navigationEvent', function onNavigationEvent(event, data) {
        let newTab = containerCtrl.createTab(data.state, data.params);
        containerCtrl.setTab(newTab);
        $state.go(newTab.state, newTab.params);
    });


    containerCtrl.createBaseTab = function() {
        containerCtrl.baseTab = containerCtrl.createTab($state.current.name, $stateParams);
    }

    containerCtrl.addTab = function () {
        var tab = containerCtrl.createTab('kohese.dashboard', false);
        containerCtrl.setTab(tab);
    };

    containerCtrl.createTab = function(state, params) {
        var newTab = tabService.createTab(state, params);
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
            console.log(tab.position);
            console.log(containerCtrl.tabs.length);
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
            else if (tab.position === containerCtrl.tabs.length -1)
                {
                console.log("-1")
                containerCtrl.setTab(containerCtrl.tabs[tab.position - 1]);
                }
            else 
                {
                console.log("+1")
                containerCtrl.setTab(containerCtrl.tabs[tab.position + 1]);
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

    // Initialization Block
    containerCtrl.createBaseTab();  
    //Will need refactoring to account for refreshing the page at some point

    containerCtrl.tabs = [containerCtrl.baseTab];
    tabService.setCurrentTab(containerCtrl.tabs[0]);
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



