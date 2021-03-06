/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

// Other External Dependencies

// Kohese
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { ItemRepository, RepoStates, TreeConfigInfo } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';
import { NotificationService } from '../../../services/notifications/notification.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

@Component({
  selector: 'app-bar',
  templateUrl: './appbar.component.html',
  styleUrls: ['./appbar.component.scss'],
})

export class AppBarComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  public userName : string;
  public authenticated : boolean = false;
  private userSubscription: Subscription;
  private notificationSubscription: Subscription;
  private repositoryStatusSubscription: Subscription;
  private _itemRepositoryState: RepoStates;
  get itemRepositoryState() {
    return this._itemRepositoryState;
  }
  public readonly State: any = RepoStates;
  public syncStatusString: string;

  private _modifiedProxies: Array<ItemProxy> = [];
  get modifiedProxies() {
    return this._modifiedProxies;
  }

  public messageCount: number = 0;
  public messages: Array<string> = [];

  private _treeConfigInfoSubscription: Subscription;
  private _changeSubscription: Subscription;

  get itemRepository() {
    return this._itemRepository;
  }

  get TreeConfiguration() {
    return TreeConfiguration;
  }

  constructor(
              protected NavigationService: NavigationService,
              private CurrentUserService: CurrentUserService,
              private _notificationService: NotificationService,
              private _itemRepository: ItemRepository,
              private changeRef: ChangeDetectorRef
  ) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repositoryStatusSubscription = this._itemRepository.
      getRepoStatusSubject().subscribe((status: any) => {
      switch(status.state) {
        case(RepoStates.DISCONNECTED):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'Disconnected';
          this.changeRef.detectChanges();
          break;
        case(RepoStates.USER_LOCKED_OUT):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'User Locked Out';
          this.changeRef.detectChanges();
          break;
        case(RepoStates.SYNCHRONIZATION_FAILED):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'Synchronization Failed';
          this.changeRef.detectChanges();
          break;
        case(RepoStates.SYNCHRONIZING):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'Syncing';
          this.changeRef.detectChanges();
          break;
        case(RepoStates.SYNCHRONIZATION_SUCCEEDED):
          this._itemRepositoryState = status.state;
          this.syncStatusString = '';
          this.changeRef.detectChanges();
          break;
      }
    });

    this.userSubscription = this.CurrentUserService.getCurrentUserSubject().subscribe((userInfo)=>{
      if (userInfo) {
        this.authenticated = true;
        this.userName = userInfo.username;
        console.log(this);
      } else {
        this.authenticated = false;
        this.userName = undefined;
      }
    });
    this.notificationSubscription = this._notificationService.getNotifications().subscribe((notifications) => {
      this.messageCount = notifications.totalNotifications;
      this.messages = notifications.message;
    });

    this._treeConfigInfoSubscription = this._itemRepository.getTreeConfig().
      subscribe((treeConfigInfo: TreeConfigInfo) => {
      if (this._changeSubscription) {
        this._changeSubscription.unsubscribe();
      }

      if (treeConfigInfo) {
        this._changeSubscription = treeConfigInfo.config.getChangeSubject().
          subscribe((notification: any) => {
          if (notification.type === 'dirty') {
            let index: number = this._modifiedProxies.indexOf(notification.proxy);
            if (notification.dirty) {
              if (index === -1) {
                // Add item to list since it has become dirty
                this._modifiedProxies.push(notification.proxy);
              }
            } else {
              if (index !== -1) {
                // Remove item from the list since it is no longer dirty
                this._modifiedProxies.splice(index, 1);
              }
            }
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this._changeSubscription) {
      this._changeSubscription.unsubscribe();
    }
    this._treeConfigInfoSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.repositoryStatusSubscription.unsubscribe();
    this.notificationSubscription.unsubscribe();
  }

  logout(): void {
    this.CurrentUserService.logout();
    this.navigate('Login', {});
  }

  public deleteMessage(message: string): void {
    this._notificationService.deleteNotification(message);
  }
}
