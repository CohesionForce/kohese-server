import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { NavigationService } from '../../services/navigation/navigation.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { SessionService } from '../../services/user/session.service';
import * as ItemProxy from '../../../../common/models/item-proxy';

@Component({
  selector: 'app-bar',
  templateUrl: './appbar.component.html'
})

export class AppBarComponent extends NavigatableComponent implements OnInit {
  private userName : string;

  private repositorySyncing: boolean = false;
  private repositorySynced: boolean = true;
  private repositorySyncFailed: boolean = false;

  constructor(private sessionService: SessionService,
    protected NavigationService: NavigationService,
    private authenticationService: AuthenticationService) {
    super(NavigationService);
  }

  ngOnInit(): void {
    this.sessionService.getSessionUser().subscribe((proxy) => {
      if (proxy) {
        this.userName = proxy.item.name;
      } else {
        this.userName = 'Loading';
      }
    });
  }
  
  logout(): void {
    this.authenticationService.logout();
    this.navigate('Login', {});
  }
}
