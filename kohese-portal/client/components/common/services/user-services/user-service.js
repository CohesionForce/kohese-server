/**
 * Created by josh on 10/8/15.
 */

function UserService(ItemRepository, $rootScope, jwtHelper, AuthTokenFactory){

    const service = this;
    var users = [];
    var currentUser = jwtHelper.decodeToken(AuthTokenFactory.getToken()).username;

    service.getAllUsers = getAllUsers;
    service.getCurrentUser = getCurrentUser;

    function getAllUsers(){
       return users;
    }

    function getCurrentUser(){
        return currentUser;
    }

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getRootProxy();
        users = root.getChildByName('Users').children;
    });

    $rootScope.$on('userLoggedIn', function onUserLogin() {
        ctrl.userLoggedIn = true;
        ctrl.userName = jwtHelper.decodeToken(AuthTokenFactory.getToken()).username;
        console.log(ctrl.userName);
    });

    $rootScope.$on('userLoggedOut', function onUserLogout() {
        ctrl.userLoggedIn = false;
        ctrl.onLoginScreen = true;
    });

    console.log(currentUser);
}

export default () => {

    angular.module('app.services.userservice', [
        'app.services.itemservice',
        'app.services.authentication'])
        .service('UserService', UserService);
}
