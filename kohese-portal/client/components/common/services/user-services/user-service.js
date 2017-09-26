/**
 * Created by josh on 10/8/15.
 * 
 *      Service that manages the status of the currently logged in User. 
 * 
 *      Contains information related to the authentication status
 */

function UserService(ItemRepository, $rootScope, jwtHelper, AuthTokenFactory, $state
                    , SessionService) {

    const service = this;
    var users = {};
    var currentUser = "";
    var userLoggedIn = false;

    service.getAllUsers = getAllUsers;
    service.getCurrentUser = getCurrentUser;
    service.authToken = {};
    service.getUsersItemId = getUsersItemId;

    function getUsersItemId() {
      return users.item.id;
  }

    function getAllUsers() {
      return users.children;
  }

    function getCurrentUser() {
        return currentUser.username;
    }

    function setCurrentUser() {
        service.authToken = AuthTokenFactory.getToken();
        if (service.authToken) {
            currentUser = jwtHelper.decodeToken(service.authToken);
            SessionService.registerSessions();
        } else {
            $state.go('login');
        }
    }

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getRootProxy();
        users = root.getChildByName('Users');
    });

    $rootScope.$on('userLoggedIn', function onUserLogin() {
        userLoggedIn = true;
        setCurrentUser();
        console.log('::: Logged in as ' + currentUser.username);
    });

    $rootScope.$on('userLoggedOut', function onUserLogout() {
        userLoggedIn = false;
    });

    setCurrentUser();
}

export default () => {

    angular.module('app.services.userservice', [
        'app.services.itemservice',
        'app.services.authentication'])
        .service('UserService', UserService);
}
