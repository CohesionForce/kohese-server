import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AuthTokenFactory } from './auth-token.factory';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class LoginService {
  constructor(private httpClient: HttpClient, private authTokenFactory: AuthTokenFactory,
    private socketService: SocketService) {
  }
  
  login(credentials: any) : Observable<any> {
    return this.httpClient.post('/login', {
      username: credentials.username,
      password: credentials.password
    });
  }
  
  logout() {
    this.authTokenFactory.setToken(undefined);
    this.socketService.disconnect();
  }
  
  checkLoginStatus(): Observable<boolean> {
    return this.authTokenFactory.getToken().map((token) => {
      return (token !== null);
    });
  }
}