import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class AuthTokenFactory {
  private readonly KEY: string = 'auth-token';
  
  constructor() {
  }
  
  getToken(): Observable<string> {
    return Observable.of(localStorage.getItem(this.KEY));
  }
  
  setToken(token: string) {
    if (undefined !== token) {
      localStorage.setItem(this.KEY, token);
    } else {
      localStorage.removeItem(this.KEY);
    }
  }
}