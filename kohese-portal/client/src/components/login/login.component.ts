/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
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


import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthenticationService } from '../../services/authentication/authentication.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DialogService } from '../../services/dialog/dialog.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
  username: string = '';
  password : string = '';
  loginSubmitted : boolean = false;

  constructor(private authenticationService: AuthenticationService,
    private navigationService: NavigationService, private _dialogService:
    DialogService) {
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
}
