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


import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { LoginComponent } from './login.component';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { MockAuthenticationService } from '../../../mocks/services/MockAuthenticationService';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockDialogService } from '../../../mocks/services/MockDialogService';

describe('Component: Login Component', ()=>{
  let loginComponent: LoginComponent;
  let loginFixture : ComponentFixture<LoginComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: AuthenticationService, useClass: MockAuthenticationService},
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: DialogService, useClass: MockDialogService}
      ]
    }).compileComponents();

    loginFixture = TestBed.createComponent(LoginComponent);
    loginComponent = loginFixture.componentInstance;

    loginFixture.detectChanges();

  })

  afterEach(() => {
    loginFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the login component', ()=>{
    expect(loginComponent).toBeTruthy();
  })
})
