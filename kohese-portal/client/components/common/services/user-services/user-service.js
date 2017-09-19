/**
 * Created by josh on 10/8/15.
 * 
 *      Service that manages the status of the currently logged in User. 
 * 
 *      Contains information related to the authentication status
 */

function UserService(ItemRepository, $rootScope, jwtHelper, AuthTokenFactory, KoheseIO, $state) {

    const service = this;
    var users = {};
    var currentUser = "";
    var userLoggedIn = false;

    service.getAllUsers = getAllUsers;
    service.getCurrentUser = getCurrentUser;
    service.sessions = {};
    service.authToken = {};
    service.getUsersItemId = getUsersItemId;

    function registerSessions() {
        KoheseIO.socket.on('session/add', function (session) {
            service.sessions[session.sessionId] = session;
            console.log("::: Added session %s for %s at %s", session.sessionId, session.username, session.address);
        });

        KoheseIO.socket.on('session/remove', function (session) {
            console.log("::: Removed session %s for %s at %s", session.sessionId, session.username, session.address);
            delete service.sessions[session.sessionId];
        });

        KoheseIO.socket.on('session/list', function (sessionList) {
            // Remove existing sessions
            for (var key in service.sessions) {
                console.log("... Removing session" + key);
                delete service.sessions[key];
            }

            for (var sessionIdx in sessionList) {
                var session = sessionList[sessionIdx];
                console.log("::: Existing session %s for %s at %s", session.sessionId, session.username, session.address);
                service.sessions[session.sessionId] = session;
            }
        });

    }


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
            registerSessions();
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
    console.log(currentUser);
}

export default () => {

    angular.module('app.services.userservice', [
        'app.services.itemservice',
        'app.services.authentication'])
        .service('UserService', UserService);
}
