import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { CurrentUserService } from './current-user.service';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ItemRepository, RepoStates } from '../item-repository/item-repository.service';

@Injectable()
export class SessionService {
  private sessionUser: BehaviorSubject<ItemProxy> = new BehaviorSubject(undefined);
  private treeConfig: any;
  initialized: boolean = false;

  private itemRepositoryStatusSubscription: Subscription;

  constructor(private CurrentUserService: CurrentUserService,
    private itemRepository: ItemRepository, private router: Router) {
    this.CurrentUserService.getCurrentUserSubject().subscribe((decodedToken) => {
      if (decodedToken) {
        console.log(this.initialized);
        this.itemRepository.getTreeConfig().subscribe((newConfig) => {
          if (newConfig) {
            if (!this.initialized) {
              this.treeConfig = newConfig.config;
              let usersProxy: ItemProxy = this.treeConfig.getRootProxy().getChildByName('Users');
              this.sessionUser.next(usersProxy.getChildByName(decodedToken.username));
            } else {
              console.log('$$$ Skip setting session user to undefined');
              // TODO Figure out why this was set to undefined
              // this.sessionUser.next(undefined);
            }
            this.initialized = true;
          }
        })
      } else {
        if (this.itemRepositoryStatusSubscription) {
          this.itemRepositoryStatusSubscription.unsubscribe();
          this.itemRepositoryStatusSubscription = undefined;
        }
        this.router.navigate(['login']);
      }

    });
  }

  getSessionUser(): BehaviorSubject<ItemProxy> {
    return this.sessionUser;
  }

  getUsers(): Array<ItemProxy> {
    let users: Array<ItemProxy> = [];
    this.treeConfig.getRootProxy().visitChildren(undefined, (proxy) => {
      if (proxy.kind === 'KoheseUser') {
        users.push(proxy);
      }
    });

    return users;
  }
}
