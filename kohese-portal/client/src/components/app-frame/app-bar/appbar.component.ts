import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { ItemRepository, RepoStates } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';
import * as ItemProxy from '../../../../../common/src/item-proxy';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-bar',
  templateUrl: './appbar.component.html'
})

export class AppBarComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  private userName : string;
  private repositoryStatus: any;
  public authenticated : boolean = false;
  private userSubscription: Subscription;
  private repositoryStatusSubscription: Subscription;
  private _itemRepositoryState: RepoStates;
  get itemRepositoryState() {
    return this._itemRepositoryState;
  }
  public readonly State: any = RepoStates;
  public syncStatusString : string;

  constructor(private sessionService: SessionService,
    protected NavigationService: NavigationService,
    private CurrentUserService: CurrentUserService,
    private itemRepository: ItemRepository) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.repositoryStatusSubscription = this.itemRepository.getRepoStatusSubject().subscribe((status: any) => {
      switch(status.state) {
        case(RepoStates.DISCONNECTED):
          this._itemRepositoryState = status.state;
          this.syncStatusString = 'Disconnected';
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

    this.CurrentUserService.getCurrentUserSubject().subscribe((userInfo)=>{
      if (userInfo) {
        this.authenticated = true;
        this.userName = userInfo.username
        console.log(this);
      } else {
        this.authenticated = false;
        this.userName = undefined;
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.repositoryStatusSubscription.unsubscribe();
  }

  logout(): void {
    this.CurrentUserService.logout();
    this.navigate('Login', {});
  }
}
