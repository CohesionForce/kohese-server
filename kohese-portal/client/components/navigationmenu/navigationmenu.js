/**
 * Created by josh on 9/1/15.
 */

function NavigationController($rootScope, navigationService, $scope, AuthTokenFactory) {
    var ctrl = this;
    ctrl.userLoggedIn = AuthTokenFactory.getToken() !== null;

    ctrl.search = function(searchString){
        navigationService.setFilterString(searchString);
        $rootScope.$broadcast('navigationEvent');
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
var collapsingMenuDirective = function () {
    return {
        restrict: 'A',
        link: function (scope, element, attribute) {
            element.metisMenu();
            //console.log("This is the cm link")
        }
    }
};

export default () => {
    angular.module('app.navigationmenu', ['app.services.navigationservice'])
        .directive('sideNav', sideNavDirective)
        .directive('collapsingMenu', collapsingMenuDirective)
        .controller('NavigationController', NavigationController);
}