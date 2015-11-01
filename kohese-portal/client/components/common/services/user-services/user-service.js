/**
 * Created by josh on 10/8/15.
 */

function UserService(ItemRepository, $rootScope, jwtHelper, AuthTokenFactory){

    const service = this;
    var users = {};

    var currentUser = "";
    var userLoggedIn = false;

    service.getAllUsers = getAllUsers;
    service.getCurrentUser = getCurrentUser;

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
