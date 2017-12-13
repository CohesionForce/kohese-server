import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-bar',
  templateUrl: './appbar.component.html'
})

export class AppBarComponent implements OnInit {
  userLoggedIn : boolean;
  userName : string;
  onLoginScreen : boolean;

  repositorySyncing: boolean;
  repositorySynced: boolean;
  repositorySyncFailed: boolean;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.userLoggedIn = true;
    this.userName = this.userService.getCurrentUsername().value;
    this.onLoginScreen = true;

    this.repositorySynced = true;
    this.repositorySyncing = false;
    this.repositorySyncFailed = false;
  }

  navigate(state: string, params: object, type: string) {
    console.log(state)
    console.log(params);
    console.log(type);
    console.log(this);

  }

  logout() {
    console.log('Logout Called - Not Implemented');
    console.log(this);
  }
}
