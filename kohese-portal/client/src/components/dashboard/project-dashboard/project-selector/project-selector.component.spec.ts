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


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { DashboardModule } from '../../dashboard.module';
import { ProjectService } from '../../../../services/project-service/project.service';
import { MockProjectService } from '../../../../../mocks/services/MockProjectService';
import { ProjectSelectorComponent } from './project-selector.component';

describe('ProjectSelectorComponent', () => {
  let component: ProjectSelectorComponent;
  let fixture: ComponentFixture<ProjectSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ DashboardModule ],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: ProjectService, useClass: MockProjectService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
