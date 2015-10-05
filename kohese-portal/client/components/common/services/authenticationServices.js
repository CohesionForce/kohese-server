/**
 * Created by josh on 9/8/15.
 */

function LoginService($http, API_URL) {
    var service = this;

    service.login = function (username, password) {
        return $http.post(API_URL + '/login', {
            username: username,
            password: password
        })
    }
}

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
    angular.module('app.services.authentication', [])
        .service('loginService', LoginService)
        .factory('AuthTokenFactory', AuthTokenFactory)
        .factory('AuthInterceptor', AuthInterceptor);
}