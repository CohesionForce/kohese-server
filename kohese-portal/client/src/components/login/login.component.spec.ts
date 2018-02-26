import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { LoginComponent } from './login.component';
import { SessionService } from '../../services/user/session.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { MockAuthenticationService } from '../../../mocks/services/MockAuthenticationService';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';

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
        {provide: NavigationService, useClass: MockNavigationService}
      ]
    }).compileComponents();

    loginFixture = TestBed.createComponent(LoginComponent);
    loginComponent = loginFixture.componentInstance;

    loginFixture.detectChanges();
    
  })

  it('instantiates the login component', ()=>{
    expect(loginComponent).toBeTruthy(); 
  })
})