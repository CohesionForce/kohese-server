import { JwtHelperService } from '@auth0/angular-jwt';

import {mergeMap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { BehaviorSubject } from 'rxjs';
import { CurrentUserService } from '../user/current-user.service';

@Injectable()
export class AuthenticationService {
  private readonly TOKEN_KEY: string = 'auth-token';
  private readonly UNDEFINED_LOCAL_STORAGE_VALUE = 'undefined';
  private token: BehaviorSubject<string> = new BehaviorSubject(localStorage.getItem(this.TOKEN_KEY));
  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private httpClient: HttpClient,
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
    });
  }

  login(credentials: any) : BehaviorSubject<any> {
    return this.httpClient.post('/authenticate', {
      username: credentials.username,
      password: credentials.password
    }, {
      observe: 'response',
      responseType: 'text'
    }).pipe(mergeMap((httpResponse: any) => {
      let t: any = httpResponse.body;
      localStorage.setItem(this.TOKEN_KEY, t);
      this.token.next(t);
      return this.CurrentUserService.setCurrentUser(this.jwtHelper.decodeToken(t));
    })) as BehaviorSubject<any>;
  }

  logout(): void {
    this.token.next('');
    localStorage.removeItem(this.TOKEN_KEY);
    this.CurrentUserService.setCurrentUser(undefined);
  }
  getToken(): BehaviorSubject<string> {
    return this.token;
  }
}
