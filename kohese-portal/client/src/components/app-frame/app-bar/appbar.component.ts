import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable ,  Subscription } from 'rxjs';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { ItemRepository, RepoStates,
  TreeConfigInfo } from '../../../services/item-repository/item-repository.service';
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
  private repositoryStatus: any;
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

  constructor(private sessionService: SessionService,
    protected NavigationService: NavigationService,
    private CurrentUserService: CurrentUserService,
    private _notificationService: NotificationService,
    private _itemRepository: ItemRepository) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repositoryStatusSubscription = this._itemRepository.
      getRepoStatusSubject().subscribe((status: any) => {
      switch(status.state) {
        case(RepoStates.DISCONNECTED):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'Disconnected';
          break;
        case(RepoStates.USER_LOCKED_OUT):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'User Locked Out';
          break;
        case(RepoStates.SYNCHRONIZATION_FAILED):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'Synchronization Failed';
          break;
        case(RepoStates.SYNCHRONIZING):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'Syncing';
          break;
        case(RepoStates.SYNCHRONIZATION_SUCCEEDED):
          this._itemRepositoryState = status.state;
          this.syncStatusString = '';
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
