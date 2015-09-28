/**
 * Created by josh on 9/1/15.
 */

function NavigationController($rootScope, navigationService, $scope, AuthTokenFactory, tabService) {
    var ctrl = this;
    ctrl.userLoggedIn = AuthTokenFactory.getToken() !== null;

    ctrl.searchInput = '';

    ctrl.search = function(searchString){
        $rootScope.$broadcast('navigationEvent', {
            state: 'kohese.search',
            params: {
                filter: searchString
            }
        });
    };

    ctrl.toggleSideBar = function(){
        $('.side-pane').toggleClass('open')
    };

    $scope.$on('userLoggedIn', function onUserLogin(){
        ctrl.userLoggedIn = true;
    });

    $scope.$on('userLoggedOut', function onUserLogout(){
        ctrl.userLoggedIn = false;
    })

}
var sideNavDirective = function () {
    return {
        restrict: 'EA',
        templateUrl: 'components/navigationmenu/navigation.html'
    }
};

export default () => {
    angular.module('app.navigationmenu', ['app.services.navigationservice', 'app.services.tabservice'])
        .directive('sideNav', sideNavDirective)
        .controller('NavigationController', NavigationController);
}