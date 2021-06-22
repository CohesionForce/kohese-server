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
