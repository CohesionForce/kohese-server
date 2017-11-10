/**
 * Created by josh on 6/17/15.
 */

function AppBarController($rootScope, UserService, LoginService, $state, jwtHelper, AuthTokenFactory) {
  var ctrl = this;
  ctrl.userName = '';
  checkAuthentication();
  ctrl.userName = UserService.getCurrentUsername();

  ctrl.navigate = function (state, params) {
    $rootScope.$broadcast('navigationEvent',
      {
        state: state,
        params: params
      });
  };

  ctrl.logout = function () {
    LoginService.logout();
    ctrl.onLoginScreen = true;
    ctrl.userLoggedIn = null;
  };
    
  $rootScope.$on('userLoggedIn', function() {
    checkAuthentication();
  });

  $rootScope.$on('userLoaded', function () {
    ctrl.userName = UserService.getCurrentUsername();
  });

  function checkAuthentication() {
    ctrl.userLoggedIn = LoginService.checkLoginStatus();
    if (!ctrl.userLoggedIn) {
      $state.go('login');
      ctrl.onLoginScreen = true;
    } else {
      ctrl.onLoginScreen = false;
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
