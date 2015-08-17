/**
 * Created by josh on 7/28/15.
 */

function ContainerController(tabService) {
    var containerCtrl = this;

    console.log("Container is linked")

    containerCtrl.tabs = [{title: 'Test Tab', type: 'dualview'}];
    containerCtrl.tabService = tabService;
    containerCtrl.tabService.setCurrentTab(containerCtrl.tabs[0]);

    var Tab = function (title, route) {
        var tab = this;
        this.title = title;
        this.route = route;
        // Flag for determining number of viewports on container
        this.type = 'dualview';
        this.toggleType = function () {
            console.log("Type toggled");
            if (tab.type == 'dualview') {
                tab.type = 'singleview';
            } else {
                tab.type = 'dualview';
            }

        };
    };

    containerCtrl.createTab = function (title, route) {
        console.log("Tab created");
        var newTab = new Tab("Tab", route);
        // hack: will break if we change tab positions
        newTab.position = containerCtrl.tabs.length;
        containerCtrl.tabs.push(newTab);
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

angular.module('app.contentcontainer', ['app.services.tabservice'])
    .controller('ContainerController', ContainerController)
    .directive('contentContainer', ContentContainer);

