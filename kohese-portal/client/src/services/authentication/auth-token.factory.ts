import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class AuthTokenFactory {
  private token: string;
  
  constructor() {
  }
  
  getToken(): Observable<string> {
    return Observable.of(this.token);
  }
  
  setToken(t: string) {
    this.token = t;
  }
}