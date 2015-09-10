/**
 * Created by josh on 9/8/15.
 */

function LoginController(loginService, AuthTokenFactory, $state){
    var ctrl = this;

    ctrl.login = function(username, password){
        console.log('Login');
        loginService.login(username, password).then(function success(response){
            AuthTokenFactory.setToken(response.data);
            $state.go('kohese.explore');
        }, function handleError(response){
            alert('Error: ' + response.data);
        })
    };

    ctrl.logout = function(){
        ctrl.testNote = null;
        AuthTokenFactory.setToken();
    }
}

export default () => {
    angular.module('app.login', ['app.services.authentication'])
        .controller('LoginController', LoginController);
}