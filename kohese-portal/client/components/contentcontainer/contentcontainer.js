/**
 * Created by josh on 7/28/15.
 */

function ContainerController(tabService, navigationService, $scope, $state) {
    var containerCtrl = this;

    containerCtrl.tabService = tabService;

    var Tab = function (title, route) {
        var tab = this;
        tab.title = title;
        tab.route = route;
        tab.state = 'kohese.explore';
        // Flag for determining number of viewports on container
        tab.type = 'dualview';
        tab.content = {};
        this.setType = function(type){
            tab.type = type;
        };
        this.toggleType = function () {
            if (tab.type == 'dualview') {
                tab.type = 'singleview';
            } else {
                tab.type = 'dualview';
            }
            //console.log(tab.type);
        };

        this.setState = function (state) {
            if (state === 'investigate') {
                tab.state = 'kohese.investigate'
            }

            if (state === 'explore') {
                tab.state = 'kohese.explore'
            }

            if (state === 'edit') {
                tab.state = 'kohese.explore.edit'
            }

            if (state === 'create') {
                tab.state = 'kohese.explore.create'
            }
            //console.log(tab.state);
        };
        this.updateFilter = function(string){
            //console.log('update');
            //console.log(tab);
            //console.log($scope);
            $scope.$broadcast('newFilterString', string);
        }
    };

    $scope.$on('navigationEvent', function onNavigationEvent(){
        let currentTab = tabService.getCurrentTab();
        console.log('navEvent');
        console.log(currentTab);
        if(currentTab.type === 'singleview'){
            $state.go('kohese.explore');
            currentTab.setState('explore');
            currentTab.setType('dualview');
        }
        currentTab.updateFilter(navigationService.getFilterString());
    });



    containerCtrl.baseTab = new Tab("Tab");
    containerCtrl.tabs = [containerCtrl.baseTab];
    containerCtrl.tabService.setCurrentTab(containerCtrl.tabs[0]);

    containerCtrl.createTab = function (title, route) {
        tabService.incrementTabs();
        var newTab = new Tab("Tab", route);
        newTab.position = containerCtrl.tabs.length;
        containerCtrl.tabs.push(newTab);
    };


    containerCtrl.setTab = function (tab) {
        containerCtrl.tabService.setCurrentTab(tab);
        $state.go(tab.state, {id: tab.route});
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
        'app.services.tabservice',
        'app.services.navigationservice'])
        .controller('ContainerController', ContainerController)
        .directive('contentContainer', ContentContainer);

    require('./subviews/dualview/dualview')(containerModule);
    require('./subviews/singleview/singleview')(containerModule);

}



