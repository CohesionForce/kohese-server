import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: ['./app.component.scss']
})
export class AppComponent {
  constructor(private authenticationService: AuthenticationService) {
    window['tinyMCE'].overrideDefaults({
      base_url: '/tinymce/',
      suffix: '.min'
    });
  }
}
