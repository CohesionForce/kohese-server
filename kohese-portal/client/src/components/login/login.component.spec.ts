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
