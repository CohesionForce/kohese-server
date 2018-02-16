import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SocketService } from '../socket/socket.service';
import { JwtHelper } from 'angular2-jwt';
import { CurrentUserService } from '../user/current-user.service';

@Injectable()
export class AuthenticationService {
  private readonly TOKEN_KEY: string = 'auth-token';
  private readonly UNDEFINED_LOCAL_STORAGE_VALUE = 'undefined';
  private token: BehaviorSubject<string> = new BehaviorSubject(localStorage.getItem(this.TOKEN_KEY));
  private jwtHelper: JwtHelper = new JwtHelper();
  
  constructor(private httpClient: HttpClient,
    private socketService: SocketService,
    private CurrentUserService : CurrentUserService) {
    let t: any = this.token.getValue();
    if (!((this.UNDEFINED_LOCAL_STORAGE_VALUE === t) || (null == t))) {
      this.CurrentUserService.setCurrentUser(this.jwtHelper.decodeToken(t));
    }

    this.CurrentUserService.getCredentialSubscription().subscribe((credentialCommand)=>{
      if (credentialCommand) {
        console.log(credentialCommand);
        if (credentialCommand.command === 'Login') {
          this.login(credentialCommand.credentials);
        } else if (credentialCommand.command === 'Logout') {
          this.logout();
        }
      }
    })
    
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
    }).mergeMap((httpResponse: any) => {
      let t: any = httpResponse.body;
      localStorage.setItem(this.TOKEN_KEY, t);
      this.token.next(t);
      this.socketService.connect();
      this.socketService.getSocket().emit('authenticate', {
        token: t
      });
      return this.CurrentUserService.setCurrentUser(this.jwtHelper.decodeToken(t));
    }) as BehaviorSubject<any>;
  }
  
  logout(): void {
    this.token.next('');
    localStorage.removeItem(this.TOKEN_KEY);
    this.CurrentUserService.setCurrentUser(undefined);
    this.socketService.disconnect();
  }
  getToken(): BehaviorSubject<string> {
    return this.token;
  }
}
