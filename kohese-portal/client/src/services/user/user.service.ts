import { Injectable } from '@angular/core'
import { Router } from '@angular/router';

import * as ItemProxy from '../../../../common/models/item-proxy';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AuthenticationService } from '../authentication/authentication.service';
import { ItemRepository } from '../item-repository/item-repository.service';

@Injectable()
export class UserService {
  private currentUser: BehaviorSubject<ItemProxy> = new BehaviorSubject(undefined);

  constructor(private authenticationService: AuthenticationService,
    private itemRepository: ItemRepository, private router: Router) {
    this.authenticationService.getAuthenticationInformation().subscribe((decodedToken) => {
      if (decodedToken) {
        let usersProxy: ItemProxy = itemRepository.getRootProxy().getChildByName('users');
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

  getAllUsers() : Array<any> {
    return [
      {
      item: {
        name: 'admin'
      }
    },
    {
      item: {
        name: 'test-user'
      }
    }]
  }

  getCurrentUser(): BehaviorSubject<ItemProxy> {
    return this.currentUser;
  }
}
