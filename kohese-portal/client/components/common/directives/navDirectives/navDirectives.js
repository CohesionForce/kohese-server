/**
 * Created by josh on 6/17/15.
 */

function AppBarController(AuthTokenFactory, $scope, $state) {
    var ctrl = this;
    checkAuthentication();

    $scope.$on('userLoggedIn', function onUserLogin(){
       ctrl.userLoggedIn = true;
    });

    $scope.$on('userLoggedOut', function onUserLogout(){
        ctrl.userLoggedIn = false;
    });

    ctrl.logout = function () {
        AuthTokenFactory.setToken();
    };

    function checkAuthentication(){
        ctrl.userLoggedIn = AuthTokenFactory.getToken() !== null;
        if(!ctrl.userLoggedIn){
            $state.go('login');
        }
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
