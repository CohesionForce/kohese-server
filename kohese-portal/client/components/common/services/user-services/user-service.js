/**
 * Created by josh on 10/8/15.
 */

function UserService(ItemRepository, $rootScope, jwtHelper, AuthTokenFactory, KoheseIO){

    const service = this;
    var users = {};

    var currentUser = "";
    var userLoggedIn = false;

    service.getAllUsers = getAllUsers;
    service.getCurrentUser = getCurrentUser;
    service.sessions = {};

    function registerSessions(){
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
        for (var key in service.sessions){
          console.log("... Removing session" + key);
          delete service.sessions[key];
        }
        
        for(var sessionIdx in sessionList){
          var session = sessionList[sessionIdx];
          console.log("::: Existing session %s for %s at %s", session.sessionId, session.username, session.address);
          service.sessions[session.sessionId] = session;
        }
      });
      
    }

    registerSessions();


    function getAllUsers(){
      return users.children;
    }

    function getCurrentUser(){
      return currentUser;
    }
    
    function setCurrentUser(){
      var authToken = AuthTokenFactory.getToken();
      if (authToken){
        currentUser = jwtHelper.decodeToken(authToken).username;        
      } else {
        currentUser = "";
      }
    }

    $rootScope.$on('itemRepositoryReady', function () {
      var root = ItemRepository.getRootProxy();
      users = root.getChildByName('Users');
    });

    $rootScope.$on('userLoggedIn', function onUserLogin() {
      userLoggedIn = true;
      setCurrentUser();
      console.log('::: Logged in as ' + currentUser);
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
