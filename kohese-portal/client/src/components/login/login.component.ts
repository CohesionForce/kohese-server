import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
  username: string;
  password : string;
  loginSubmitted : boolean;

  constructor() {

  }

  login () {
    this.loginSubmitted = true;
    console.log ('Login Submitted');
    console.log(this);
  }

  ngOnInit() {
    this.username = '';
    this.password = '';
    this.loginSubmitted = false;
  }

}
