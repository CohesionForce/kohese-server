import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { Observable } from 'rxjs/Observable';
import { NavigatableComponent } from '../../classes/NavigationComponent.class';
import { TabService } from '../../services/tab/tab.service';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector: 'app-bar',
  templateUrl: './appbar.component.html'
})

export class AppBarComponent extends NavigatableComponent implements OnInit {
  userLoggedIn : boolean;
  userName : string;
  onLoginScreen : boolean;

  repositorySyncing: boolean;
  repositorySynced: boolean;
  repositorySyncFailed: boolean;

  constructor(private userService: UserService,
              protected TabService: TabService,
              protected NavigationService: NavigationService) {
                super(NavigationService, TabService)
               }

  ngOnInit() {
    /* TODO - Replace these default values with calls to services */
    this.userLoggedIn = true;
    this.userName = this.userService.getCurrentUsername().value;
    this.onLoginScreen = true;

    this.repositorySynced = true;
    this.repositorySyncing = false;
    this.repositorySyncFailed = false;
  }

  logout() {
    console.log('Logout Called - Not Implemented');
    console.log(this);
  }
}
