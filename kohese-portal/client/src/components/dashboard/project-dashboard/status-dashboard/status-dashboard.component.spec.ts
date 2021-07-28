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

// Angular
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { MaterialModule } from '../../../../material.module'; // deprecated

// Kohese
import { PipesModule } from '../../../../pipes/pipes.module';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { DynamicTypesService } from '../../../../services/dynamic-types/dynamic-types.service';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { StateFilterService } from '../../state-filter.service';
import { ProjectInfo } from '../../../../services/project-service/project.service';
import { StatusDashboardComponent } from './status-dashboard.component';

// Mocks
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { MockStateFilterService } from '../../../../../mocks/services/MockStateFilterService';
import { MockProjectService } from '../../../../../mocks/services/MockProjectService';

describe('Component: StatusDashboardComponent', () => {
  let component: StatusDashboardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusDashboardComponent ],
      imports: [
        BrowserAnimationsModule,
        MaterialModule,
        PipesModule
        ],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        DynamicTypesService,
        { provide: DialogService, useClass: MockDialogService },
        { provide: StateFilterService, useClass: MockStateFilterService }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();

    let fixture: ComponentFixture<StatusDashboardComponent> = TestBed.
      createComponent(StatusDashboardComponent);
    component = fixture.componentInstance;
    component.projectStream = new BehaviorSubject<ProjectInfo>(
      new MockProjectService().getProjects()[0]);
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
