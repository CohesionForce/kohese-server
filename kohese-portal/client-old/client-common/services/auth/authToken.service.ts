/* Factory used to interact with the authentication token stored in local storage */
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

@Injectable()
export class AuthTokenService {
  private key = 'auth-token';
  public token: Observable<string>;

  constructor() {
    this.token = of(localStorage.getItem(this.key));
    console.log(this.token);
  }

  getToken () {
    return this.token;
  }

  setToken (token) {
    if (token) {
      localStorage.setItem(this.key, token)
    } else {
      localStorage.removeItem(this.key);
    }
  }
}


function AuthTokenFactory ($window, $rootScope) {
  'use strict';
  var store = $window.localStorage;
  var key = 'auth-token';

  return {
    getToken: getToken,
    setToken: setToken
  };

  function getToken () {
    return store.getItem(key);
  }

  function setToken (token) {
    if (token) {
      store.setItem(key, token);
      $rootScope.$broadcast('userLoggedIn');
    } else {
      store.removeItem(key);
      $rootScope.$broadcast('userLoggedOut');
    }
  }
}
