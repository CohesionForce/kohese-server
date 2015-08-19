/**
 * Created by josh on 7/28/15.
 */

function ContainerController(tabService, $scope, $state) {
    var containerCtrl = this;

    containerCtrl.tabService = tabService;

    var Tab = function (title, route) {
        var tab = this;
        tab.title = title;
        tab.route = route;
        tab.state = 'kohese.explore';
        // Flag for determining number of viewports on container
        tab.type = 'dualview';
        this.toggleType = function () {
            if (tab.type == 'dualview') {
                tab.type = 'singleview';
            } else {
                tab.type = 'dualview';
            }
            console.log(tab.type);
        };

        this.toggleState = function(){
            if(tab.state === 'kohese.explore') {
                tab.state = 'kohese.investigate'
            } else if (tab.state === 'kohese.investigate') {
                tab.state = 'kohese.explore'
            }
            console.log(tab.state);
        }
    };

    containerCtrl.baseTab = new Tab("Tab");
    containerCtrl.tabs = [containerCtrl.baseTab];
    containerCtrl.tabService.setCurrentTab(containerCtrl.tabs[0]);

    containerCtrl.createTab = function (title, route) {
        tabService.incrementTabs();
        //console.log("Tab " + tabService.getTabId() + " created");
        var newTab = new Tab("Tab", route);
        // hack: will break if we change tab positions
        newTab.position = containerCtrl.tabs.length;
        containerCtrl.tabs.push(newTab);
    };


    containerCtrl.setTab = function(tab) {
        console.log(tab);
        containerCtrl.tabService.setCurrentTab(tab);
        $state.go(tab.state, {id:tab.route});
        $scope.$broadcast('tabSelected');
        //console.log('Event emitted');
    };

    containerCtrl.deleteTab = function (tab) {
        // hack: will break if we change tab positions
        containerCtrl.tabs.splice(tab.position, 1);
    };


}

var ContentContainer = function () {
    return {
        restrict: 'EA',
        controller: 'ContainerController',
        templateUrl: 'components/contentcontainer/contentcontainer.html'
    }
};

/**
 * Convention exception: This directive is not in the common folder because it is only used on the index level of the
 * application Eventually it is likely that the content container might be switched on and off based on users location in the
 * app
 */

angular.module('app.contentcontainer', ['app.services.tabservice', 'app.contentcontainer.dualview'])
    .controller('ContainerController', ContainerController)
    .directive('contentContainer', ContentContainer);

