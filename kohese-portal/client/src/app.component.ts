import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService) {

  }

  ngOnInit () {

  }
}
