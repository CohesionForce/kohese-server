import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AuthTokenFactory } from './auth-token.factory';

@Injectable()
export class LoginService {
  private readonly LOGIN_URL: string = '';

  constructor(private httpClient: HttpClient, private authTokenFactory: AuthTokenFactory) {
  }
  
  login(credentials: any) : Observable<any> {
    return this.httpClient.post(this.LOGIN_URL + '/login', {
      username: credentials.username,
      password: credentials.password
    });
  }
  
  logout() {
    this.authTokenFactory.setToken(undefined);
  }
  
  checkLoginStatus(): Observable<boolean> {
    return this.authTokenFactory.getToken().map((token) => {
      return (token !== null);
    });
  }
}