import { Injectable } from '@angular/core'
import { Router } from '@angular/router';

import * as ItemProxy from '../../../../common/models/item-proxy';
import { AuthTokenFactory } from '../authentication/auth-token.factory';
import { JwtHelper } from 'angular2-jwt';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class UserService {
  private currentUser: BehaviorSubject<ItemProxy> = new BehaviorSubject(undefined);
  private jwtHelper: JwtHelper = new JwtHelper();
  
  constructor(private authTokenFactory: AuthTokenFactory, private router: Router) {
    this.authTokenFactory.getToken().subscribe((token) => {
      if (token) {
        let decodedToken: any = this.jwtHelper.decodeToken(token);
        let usersProxy: ItemProxy = ItemProxy.getRootProxy().getChildByName('users');
        if (usersProxy) {
          this.currentUser.next(usersProxy.getChildByName(decodedToken.username));
        }
      } else {
        this.router.navigate(['login']);
      }
    });
    console.log('User Service initialized');
  }

  getUsersItemId() {
  }

  getAllUsers() {
  }

  getCurrentUser(): BehaviorSubject<ItemProxy> {
    return this.currentUser;
  }
}
