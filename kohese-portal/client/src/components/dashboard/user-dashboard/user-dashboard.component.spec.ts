import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { UserDashboardComponent } from './user-dashboard.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockUserData } from '../../../../mocks/data/MockUser'

import { ItemProxy } from '../../../../../common/src/item-proxy';


describe('Component: UserDashboardComponent', ()=>{
  let userDashboardComponent: UserDashboardComponent;
  let userDashboardFixture : ComponentFixture<UserDashboardComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [UserDashboardComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    userDashboardFixture = TestBed.createComponent(UserDashboardComponent);
    userDashboardComponent = userDashboardFixture.componentInstance;
    userDashboardComponent.user = new ItemProxy('KoheseUser', MockUserData())

    userDashboardFixture.detectChanges();

  })

  it('instantiates the userDashboard component', ()=>{
    expect(userDashboardComponent).toBeTruthy();
  })

  afterEach(()=>{
    ItemProxy.getWorkingTree().reset();
  })
})
