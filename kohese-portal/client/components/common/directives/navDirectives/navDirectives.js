/**
 * Created by josh on 6/17/15.
 */

function AppBarController(AuthTokenFactory, $scope, $state, jwtHelper) {
    var ctrl = this;
    ctrl.userName = {};
    checkAuthentication();

    console.log($state.$current);

    $scope.$on('userLoggedIn', function onUserLogin(){
       ctrl.userLoggedIn = true;
        ctrl.userName = jwtHelper.decodeToken(AuthTokenFactory.getToken()).username;
        console.log(ctrl.userName);
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
        } else {
            ctrl.userName = jwtHelper.decodeToken(AuthTokenFactory.getToken()).username;
        }
    }
}
export default () => {

    var app = angular.module('app.directives.navigation', ['app.services.authentication',
    'angular-jwt']);
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
