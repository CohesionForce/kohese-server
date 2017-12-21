import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SocketService } from '../socket/socket.service';
import { JwtHelper } from 'angular2-jwt';

@Injectable()
export class AuthenticationService {
  private readonly TOKEN_KEY: string = 'auth-token';
  private token: BehaviorSubject<string> = new BehaviorSubject(localStorage.getItem(this.TOKEN_KEY));
  private jwtHelper: JwtHelper = new JwtHelper();
  private authenticationInformation: BehaviorSubject<any> =
    new BehaviorSubject(this.jwtHelper.decodeToken(this.token.getValue()));
  
  constructor(private httpClient: HttpClient,
    private socketService: SocketService) {
    this.socketService.getSocket().on('connect', () => {
      this.socketService.getSocket().emit('authenticate', {
        token: this.token.getValue()
      });
    });
  }
  
  login(credentials: any) : BehaviorSubject<any> {
    return this.httpClient.post('/authenticate', {
      username: credentials.username,
      password: credentials.password
    }, {
      observe: 'response',
      responseType: 'text'
    }).mergeMap((httpResponse) => {
      localStorage.setItem(this.TOKEN_KEY, httpResponse.body);
      this.token.next(httpResponse.body);
      this.socketService.connect();
      this.authenticationInformation.next(this.jwtHelper.decodeToken(httpResponse.body));
      return this.authenticationInformation;
    }) as BehaviorSubject<any>;
  }
  
  logout(): void {
    this.token.next('');
    localStorage.setItem(this.TOKEN_KEY, undefined);
    this.authenticationInformation.next(undefined);
    this.socketService.disconnect();
  }
  
  getAuthenticationInformation(): BehaviorSubject<any> {
    return this.authenticationInformation;
  }
  
  getToken(): BehaviorSubject<string> {
    return this.token;
  }
}
