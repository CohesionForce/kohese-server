import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NavigatableComponent } from '../../../classes/NavigationComponent.class';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { CurrentUserService } from '../../../services/user/current-user.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { SessionService } from '../../../services/user/session.service';
import * as ItemProxy from '../../../../../common/models/item-proxy';
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
  private _itemRepositoryState: any;
  get itemRepositoryState() {
    return this._itemRepositoryState;
  }
  public readonly State: any;

  constructor(private sessionService: SessionService,
    protected NavigationService: NavigationService,
    private CurrentUserService: CurrentUserService,
    private itemRepository: ItemRepository) {
    super(NavigationService);
    this.State = this.itemRepository.state; 
  }

  ngOnInit(): void {
    this.userSubscription = this.sessionService.getSessionUser().subscribe((proxy: ItemProxy) => {
      if (proxy) {
        this.userName = proxy.item.name;
      } else {
        this.userName = 'Loading';
      }
    });
    
    this.repositoryStatusSubscription = this.itemRepository.getRepoStatusSubject().subscribe((status: any) => {
      this._itemRepositoryState = status.state;
    });

    this.CurrentUserService.getCurrentUserSubject().subscribe((userInfo)=>{
      if (userInfo) {
        this.authenticated = true;
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
