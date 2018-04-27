import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { DashboardSelectorComponent } from './dashboard-selector.component';
import { MockUserData } from '../../../../mocks/data/MockUser';
import { ItemProxy } from '../../../../../common/src/item-proxy';

describe('Component: Dashboard Selector', ()=>{
  let dashboardSelectorComponent: DashboardSelectorComponent;
  let dashboardSelectorFixture : ComponentFixture<DashboardSelectorComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DashboardSelectorComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
      ]
    }).compileComponents();

    dashboardSelectorFixture = TestBed.createComponent(DashboardSelectorComponent);
    dashboardSelectorComponent = dashboardSelectorFixture.componentInstance;
    dashboardSelectorComponent.user = new ItemProxy('KoheseUser', MockUserData());

    dashboardSelectorFixture.detectChanges();

  })

  it('instantiates the dashboardSelector component', ()=>{
    expect(dashboardSelectorComponent).toBeTruthy();
  })
})
