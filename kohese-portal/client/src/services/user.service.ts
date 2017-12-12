import { Injectable } from '@angular/core'
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { Router } from '@angular/router';

import { ItemProxy } from '../../../common/models/item-proxy';
import { AuthTokenFactory } from './authentication-services/auth-token.factory';
import { JwtHelper } from 'angular2-jwt';
import { Observable } from 'rxjs/Observable';
import { ScalarObservable } from 'rxjs/observable/ScalarObservable';
import { of } from 'rxjs/observable/of';

@Injectable()
export class UserService implements OnInit {
  private currentUser: ItemProxy;
  private jwtHelper: JwtHelper = new JwtHelper();
  
  constructor(private authTokenFactory: AuthTokenFactory, private router: Router) {
  }

  ngOnInit() {
    this.authTokenFactory.getToken().subscribe((token) => {
      if (token) {
        let decodedToken: any = this.jwtHelper.decodeToken(token);
        let usersProxy: ItemProxy = ItemProxy.getRootProxy().getChildByName('users');
        if (usersProxy) {
          this.currentUser = usersProxy.getChildByName(decodedToken.username);
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

  getCurrentUsername (): ScalarObservable<string> {
    return new ScalarObservable((this.currentUser ? this.currentUser.item.name : 'Loading'));
  }

  getCurrentUserEmail (): ScalarObservable<string> {
    return new ScalarObservable((this.currentUser ? (this.currentUser.item.email ? this.currentUser.item.email :
      'No e-mail address specified') : 'Loading'));
  }
}
