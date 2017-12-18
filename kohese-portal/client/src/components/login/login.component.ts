import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/authentication/login.service';
import { AuthTokenFactory } from '../../services/authentication/auth-token.factory';
import { SocketService } from '../../services/socket/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})

export class LoginComponent {
  private username: string = '';
  private password : string = '';
  private loginSubmitted : boolean = false;

  constructor(private loginService: LoginService, private router: Router,
    private authTokenFactory: AuthTokenFactory, private socketService: SocketService) {
  }
  
  ngOnInit() {
  }

  login() {
    this.loginSubmitted = true;
    console.log ('Login Submitted');
    this.loginService.login({
      username: this.username,
      password: this.password
    }).subscribe((httpResponse) => {
      this.authTokenFactory.setToken(httpResponse.body);
      this.socketService.connect();
      this.router.navigate(['/dashboard']);
      this.loginSubmitted = false;
    }, (err) => {
      console.log(err);
    });
  }
}
