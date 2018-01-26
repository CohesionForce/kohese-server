import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { SessionService } from '../../services/user/session.service';
import * as ItemProxy from '../../../../common/models/item-proxy';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-bar',
  templateUrl: './appbar.component.html'
})

export class AppBarComponent extends NavigatableComponent
  implements OnInit, OnDestroy {
  private userName : string;
  private repositoryStatus: any;
  
  private userSubscription: Subscription;
  private repositoryStatusSubscription: Subscription;

  constructor(private sessionService: SessionService,
    protected NavigationService: NavigationService,
    private authenticationService: AuthenticationService,
    private itemRepository: ItemRepository) {
    super(NavigationService);
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
      this.repositoryStatus = status;
    });
  }
  
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    this.repositoryStatusSubscription.unsubscribe();
  }
  
  logout(): void {
    this.authenticationService.logout();
    this.navigate('Login', {});
  }
}
