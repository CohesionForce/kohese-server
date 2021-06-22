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
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { AssignmentDashboardComponent } from './assignment-dashboard.component';
import { BehaviorSubject } from 'rxjs';
import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';

import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

describe('Component: ', ()=>{
  let assignmentDashboardComponent: AssignmentDashboardComponent;
  let assignmentDashboardFixture : ComponentFixture<AssignmentDashboardComponent>;
  let dashboardSelectionStream = new BehaviorSubject<DashboardSelections>(DashboardSelections.OPEN_ASSIGNMENTS);

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [AssignmentDashboardComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: DialogService, useClass: MockDialogService }
      ]
    }).compileComponents();

    assignmentDashboardFixture = TestBed.createComponent(AssignmentDashboardComponent);
    assignmentDashboardComponent = assignmentDashboardFixture.componentInstance;
    assignmentDashboardComponent.dashboardSelectionStream = dashboardSelectionStream;
    assignmentDashboardComponent.assignmentListStream =
      new BehaviorSubject<Array<ItemProxy>>([TreeConfiguration.getWorkingTree().
      getProxyFor('test-uuid3')]);

    assignmentDashboardFixture.detectChanges();

  })

  afterEach(() => {
    assignmentDashboardFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the assignmentDashboard component', ()=>{
    expect(assignmentDashboardComponent).toBeTruthy();
  })
})
