import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { NavigationService } from '../../services/navigation/navigation.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
  username: string = '';
  password : string = '';
  loginSubmitted : boolean = false;

  constructor(private authenticationService: AuthenticationService,
    private navigationService: NavigationService) {
  }
  
  ngOnInit(): void {
  }

  login(): void {
    this.loginSubmitted = true;
    console.log ('Login Submitted');
    this.authenticationService.login({
      username: this.username,
      password: this.password
    }).subscribe((decodedToken: string) => {
      this.navigationService.navigate('Dashboard', {});
      this.loginSubmitted = false;
    }, (err) => {
      console.log(err);
    });
  }
}
