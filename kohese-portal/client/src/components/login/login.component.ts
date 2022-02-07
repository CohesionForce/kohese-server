/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Angular
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

// Other External Dependencies

// Kohese
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DialogService } from '../../services/dialog/dialog.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class LoginErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  hide: boolean = true;
  loginSubmitted : boolean = false;

  usernameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);
  usernameMatcher = new LoginErrorStateMatcher();
  passwordMatcher = new LoginErrorStateMatcher();

  googleSVG =
    `
    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
      </g>
    </svg>
    `

  constructor(private authenticationService: AuthenticationService,
              private navigationService: NavigationService,
              private _dialogService: DialogService,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIconLiteral('google-svg', sanitizer.bypassSecurityTrustHtml(this.googleSVG));
  }

  ngOnInit(): void {}

  login(): void {
    this.loginSubmitted = true;
    console.log ('Login Submitted');
    this.authenticationService.login({
      username: this.username,
      password: this.password
    }).subscribe((decodedToken: string) => {
      this.navigationService.navigate('Dashboard', {});
      this.loginSubmitted = false;
    }, (errorResponse: HttpErrorResponse) => {
      let message: string = '';
      if (401 === errorResponse.status) {
        message += 'The supplied credentials were insufficient for granting ' +
          'access.';
      } else {
        message += 'The server may be unavailable.';
      }
      this._dialogService.openInformationDialog('Login Failed', message);
    });
  }

  googleLogin(): void {
    this.authenticationService.googleLogin();
  }

  showHidePassword() {
    let passwordContent = document.getElementById('password');
    if (passwordContent['type'] === "password") {
      passwordContent['type'] = "text";
    } else {
      passwordContent['type'] = "password";
    }
  }
}
