import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication/authentication.service';
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

  constructor(private authenticationService: AuthenticationService, private router: Router,
    private socketService: SocketService) {
  }
  
  ngOnInit() {
  }

  login() {
    this.loginSubmitted = true;
    console.log ('Login Submitted');
    this.authenticationService.login({
      username: this.username,
      password: this.password
    }).subscribe((decodedToken) => {
      this.router.navigate(['/dashboard']);
      this.loginSubmitted = false;
    }, (err) => {
      console.log(err);
    });
  }
}
