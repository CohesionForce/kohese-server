/**
 * Created by josh on 6/17/15.
 */

function AppBarController(AuthTokenFactory, $rootScope, UserService, $state, jwtHelper) {
    var ctrl = this;
    ctrl.userName = {};
    checkAuthentication();
    ctrl.userName = UserService.getCurrentUser();

    ctrl.navigate = function (state, params, type) {
        console.log(type);
        $rootScope.$broadcast('navigationEvent',
            {
                state: state,
                params: params,
                type: type
            });
    };


    ctrl.logout = function () {
        AuthTokenFactory.setToken();
    };

    function checkAuthentication() {
        ctrl.userLoggedIn = AuthTokenFactory.getToken() !== null;
        if (!ctrl.userLoggedIn) {
            $state.go('login');
            ctrl.onLoginScreen = true;
        } else {
            ctrl.userName = jwtHelper.decodeToken(AuthTokenFactory.getToken()).username;
        }
    }
}

function AppBar() {
    return {
        restrict: 'EA',
        templateUrl: 'components/common/directives/navDirectives/appBar.html',
        controller: 'AppBarController'
    }
}

export default () => {

    var app = angular.module('app.directives.navigation', [
        'app.services.authentication',
        'app.services.userservice',
        'app.services.tabservice',
        'angular-jwt']);

    app
        .directive('appBar', AppBar)
        .controller('AppBarController', AppBarController);

};
