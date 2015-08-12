/**
 * Created by josh on 7/28/15.
 */

function ContainerController($scope) {
    var containerCtrl = this;

    containerCtrl.tabs = [{title: 'Test Tab', type: 'dualview'}];

    var Tab = function (title, route) {
        var tab = this;
        this.title = title;
        this.route = route;
        // Set default view type
        this.type = 'dualview';
        this.toggleType = function () {
            if (tab.type == 'dualview') {
                tab.type = 'singleview';
            } else {
                tab.type = 'dualview';
            }

        };

        $scope.$on('toggleViewType', function () {
            console.log("Toggle received");
        })

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
}

var ContentContainer = function () {
    return {
        restrict: 'EA',
        controller: 'ContainerController',
        templateUrl: 'components/contentcontainer/contentcontainer.html'
    }
};

angular.module('container-directive', [])
    .controller('ContainerController', ContainerController)
    .directive('contentContainer', ContentContainer);

