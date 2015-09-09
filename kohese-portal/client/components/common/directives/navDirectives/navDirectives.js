/**
 * Created by josh on 6/17/15.
 */

function AppBarController(AuthTokenFactory, $scope) {
    var ctrl = this;

    ctrl.userLoggedIn = AuthTokenFactory.getToken() !== null;

    $scope.$on('userLoggedIn', function onUserLogin(){
       ctrl.userLoggedIn = true;
    });

    ctrl.logout = function () {
        AuthTokenFactory.setToken();
        ctrl.userLoggedIn = false;

    }
}
export default () => {

    var app = angular.module('app.directives.navigation', ['app.services.authentication']);
    var appBarDirective = function () {
        return {
            restrict: 'EA',
            templateUrl: 'components/common/directives/navDirectives/appBar.html',
            controller: 'AppBarController'
        }
    };

    app
        .directive('appBar', appBarDirective)
        .controller('AppBarController', AppBarController);


};
