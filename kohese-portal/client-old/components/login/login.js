/**
 * Created by josh on 9/8/15.
 */

function LoginController (LoginService, KoheseIO, AuthTokenFactory, $state) {
  var ctrl = this;

  ctrl.login = function (username, password) {
    console.log('Login');
    LoginService.login(username, password).then(function success (response) {
      AuthTokenFactory.setToken(response.data);
      KoheseIO.connect();
      $state.go('kohese.explore');
    }, function handleError (response) {
      alert('Error: ' + response.data);
    })
  };

  ctrl.logout = function () {
    ctrl.testNote = null;
    LoginService.logout();
  }
}

export const LoginModule = {
  init: function () {
    angular.module('app.login', ['app.services.authentication',
      'app.factories.koheseio'])
      .controller('LoginController', LoginController);
  }
}
