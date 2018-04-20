import { TestBed, ComponentFixture} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { DashboardComponent} from './dashboard.component';

import { SessionService } from '../../services/user/session.service';
import { NavigationService } from '../../services/navigation/navigation.service';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

import { MockSessionService } from '../../../mocks/services/MockSessionService';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { LensModule } from '../lens/lens.module';

describe('Component: Dashboard', ()=>{
  let dashboardComponent: DashboardComponent;
  let dashboardFixture : ComponentFixture<DashboardComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: ItemRepository, useClass: MockItemRepository},
        {provide: SessionService, useClass: MockSessionService},
      ]
    }).compileComponents();

    dashboardFixture = TestBed.createComponent(DashboardComponent);
    dashboardComponent = dashboardFixture.componentInstance;

    dashboardFixture.detectChanges();
    
  })

  it('instantiates the dashboard component', ()=>{
    expect(dashboardComponent).toBeTruthy(); 
  })
})