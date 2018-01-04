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
  private readonly UNDEFINED_LOCAL_STORAGE_VALUE = 'undefined';
  private token: BehaviorSubject<string> = new BehaviorSubject(localStorage.getItem(this.TOKEN_KEY));
  private jwtHelper: JwtHelper = new JwtHelper();
  private authenticationInformation: BehaviorSubject<any> =
    new BehaviorSubject(this.UNDEFINED_LOCAL_STORAGE_VALUE);
  
  constructor(private httpClient: HttpClient,
    private socketService: SocketService) {
    let t: any = this.token.getValue();
    if (!((this.UNDEFINED_LOCAL_STORAGE_VALUE === t) || (null == t))) {
      this.authenticationInformation.next(this.jwtHelper.decodeToken(t));
    }
    
    this.socketService.getSocket().on('connect', () => {
      let t: any = this.token.getValue();
      if (!((this.UNDEFINED_LOCAL_STORAGE_VALUE === t) || (null == t))) {
        this.socketService.getSocket().emit('authenticate', {
          token: t
        });
      }
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
      this.socketService.connect();
      localStorage.setItem(this.TOKEN_KEY, httpResponse.body);
      this.token.next(httpResponse.body);
      this.authenticationInformation.next(this.jwtHelper.decodeToken(httpResponse.body));
      return this.authenticationInformation;
    }) as BehaviorSubject<any>;
  }
  
  logout(): void {
    this.token.next('');
    localStorage.removeItem(this.TOKEN_KEY);
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
