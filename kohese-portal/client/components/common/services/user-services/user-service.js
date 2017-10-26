/**
 * Created by josh on 10/8/15.
 * 
 *      Service that manages the status of the currently logged in User. 
 * 
 *      Contains information related to the authentication status
 */

function UserService(ItemRepository, $rootScope, jwtHelper, AuthTokenFactory, 
                     KoheseIO, $state, SessionService) {

    const service = this;
    var users = {};
    var currentUser = {};
    var userLoggedIn = false;

    service.getAllUsers = getAllUsers;
    service.getCurrentUsername = getCurrentUsername;
    service.getCurrentUserEmail = getCurrentUserEmail;
    service.authToken = {};
    service.getUsersItemId = getUsersItemId;

    function getUsersItemId() {
      return users.item.id;
  }

    function getAllUsers() {
      return users.children;
  }

    function getCurrentUsername() {
        return (currentUser.item) ? 
            currentUser.item.name : "Loading";
     }

    function getCurrentUserEmail() {
        if (currentUser.item)
        {
            return (currentUser.item.email) ? 
                currentUser.item.email : "No email specified";
        }
        else 
            return "Loading";
    }

    function setCurrentUser() {
        service.authToken = AuthTokenFactory.getToken();
        if (service.authToken) {
            var decodedToken = jwtHelper.decodeToken(service.authToken);
            var root = ItemRepository.getRootProxy();
            var users = root.getChildByName('Users');
            /* If the users object isn't around we probably are waiting for load
               We will call this function again when the repo is loaded. */
            if (users) 
            {
            currentUser = users.getChildByName(decodedToken.username);
            SessionService.registerSessions();
            }
        } else {
            $state.go('login');
        }
    }

    $rootScope.$on('itemRepositoryReady', function () {
        var root = ItemRepository.getRootProxy();
        users = root.getChildByName('Users');
        setCurrentUser();
        $rootScope.$broadcast('userLoaded');
    });

    $rootScope.$on('userLoggedIn', function onUserLogin() {
        userLoggedIn = true;
        setCurrentUser();
        console.log('::: Logged in as ' + currentUser.username);
    });

    $rootScope.$on('userLoggedOut', function onUserLogout() {
        userLoggedIn = false;
    });

    $rootScope.$on('UserUpdated', function onUserUpdated(event, data) {
        currentUser = data;
        });

    setCurrentUser();
}

export default () => {

    angular.module('app.services.userservice', [
        'app.services.itemservice',
        'app.services.authentication',
        'app.factories.koheseio',
        'angular-jwt',
        'app.services.sessionservice'])
        .service('UserService', UserService);
}
