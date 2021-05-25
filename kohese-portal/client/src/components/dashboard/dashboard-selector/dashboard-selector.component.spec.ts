import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { DashboardSelectorComponent } from './dashboard-selector.component';
import { MockUserData } from '../../../../mocks/data/MockUser';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

describe('Component: Dashboard Selector', ()=>{
  let dashboardSelectorComponent: DashboardSelectorComponent;
  let dashboardSelectorFixture : ComponentFixture<DashboardSelectorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DashboardSelectorComponent],
      imports : [
        RouterModule.forRoot([]),
        CommonModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/'}
      ]
    }).compileComponents();

    dashboardSelectorFixture = TestBed.createComponent(DashboardSelectorComponent);
    dashboardSelectorComponent = dashboardSelectorFixture.componentInstance;
    dashboardSelectorComponent.user = new ItemProxy('KoheseUser', MockUserData());

    dashboardSelectorFixture.detectChanges();

  })

  afterEach(() => {
    dashboardSelectorFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the dashboardSelector component', ()=>{
    expect(dashboardSelectorComponent).toBeTruthy();
  })
})
