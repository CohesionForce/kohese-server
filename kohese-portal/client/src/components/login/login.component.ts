import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/authentication/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
  username: string;
  password : string;
  loginSubmitted : boolean;

  constructor(private loginService: LoginService, private router: Router) {
  }

  login () {
    this.loginSubmitted = true;
    console.log ('Login Submitted');
    console.log(this);
    this.loginService.login({
      username: this.username,
      password: this.password
    }).subscribe(function (next) {
      this.router.navigate(['dashboard']);
    });
  }

  ngOnInit() {
    this.username = '';
    this.password = '';
    this.loginSubmitted = false;
  }

}
