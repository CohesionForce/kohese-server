/**
 * Created by josh on 7/28/15.
 */

function ContainerController() {
    var containerCtrl = this;

    containerCtrl.tabs = [{title: 'Test Tab'}];

    var Tab = function (title, route) {
        this.title = title;
        this.route = route;
    };

    containerCtrl.createTab = function (title, route) {
        console.log("Tab created");
        var newTab = new Tab("Tab Tab", route);
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
        templateUrl: 'js/directives/contentcontainer/contentcontainer.html'
    }
};

angular.module('container-directive', [])
    .controller('ContainerController', ContainerController)
    .directive('contentContainer', ContentContainer);

