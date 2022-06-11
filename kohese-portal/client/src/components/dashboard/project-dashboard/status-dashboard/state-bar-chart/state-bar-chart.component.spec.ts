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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { MaterialModule } from '../../../../../material.module';

// Kohese
import { DialogService } from '../../../../../services/dialog/dialog.service';
import { TreeConfiguration } from '../../../../../../../common/src/tree-configuration';
import { StateBarChartComponent } from './state-bar-chart.component';
import { ProjectInfo, ProjectService } from '../../../../../services/project-service/project.service';

// Mocks
import { MockDialogService } from '../../../../../../mocks/services/MockDialogService';
import { MockProjectService } from '../../../../../../mocks/services/MockProjectService';

describe('StateBarChartComponent', () => {
  let component: StateBarChartComponent;
  let fixture: ComponentFixture<StateBarChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StateBarChartComponent ],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MaterialModule
      ],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: ProjectService, useClass: MockProjectService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateBarChartComponent);
    component = fixture.componentInstance;
    component.projectStream = new BehaviorSubject<ProjectInfo>({
      proxy: TreeConfiguration.getWorkingTree().getProxyFor('test-uuid1'),
      users: [],
      projectItems: []
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
