/**
 * Created by josh on 9/8/15.
 *  Collection of Authentication and User session related services.
 *  Likely to be split in the future.
 */


/* Service used by views to log in and out of the kohese portal */
function LoginService($http, API_URL, AuthTokenFactory, KoheseIO) {
  var service = this;

  service.login = function (username, password) {
    return $http.post(API_URL + '/login', {
      username: username,
      password: password
    })
  }
  service.logout = function () {
    AuthTokenFactory.setToken();
    KoheseIO.disconnect();   
  }
  service.checkLoginStatus = function() {
    return AuthTokenFactory.getToken() !== null;
  }
}

/* Factory used to interact with the authentication token stored in local storage */
function AuthTokenFactory($window, $rootScope) {
  'use strict';
  var store = $window.localStorage;
  var key = 'auth-token';

  return {
    getToken: getToken,
    setToken: setToken
  };

  function getToken() {
    return store.getItem(key);
  }

  function setToken(token) {
    if (token) {
      store.setItem(key, token);
      $rootScope.$broadcast('userLoggedIn');
    } else {
      store.removeItem(key);
      $rootScope.$broadcast('userLoggedOut');
    }
  }
}

/* Interceptor used by router to confirm user is authenticated for the request */
function AuthInterceptor(AuthTokenFactory) {
  'use strict';
  return {
    request: addToken
  };

  function addToken(config) {
    var token = AuthTokenFactory.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = 'Bearer ' + token;
    }

    return config;
  }
}

export default () => {
  angular.module('app.services.authentication', 
    ['app.factories.koheseio',
      'app.constants.endpoints'])
    .service('LoginService', LoginService)
    .factory('AuthTokenFactory', AuthTokenFactory)
    .factory('AuthInterceptor', AuthInterceptor);
}