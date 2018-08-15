import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MaterialModule } from '../../../../material.module';
import { PipesModule } from '../../../../pipes/pipes.module';
import { DynamicTypesService } from '../../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../../mocks/services/MockDynamicTypesService';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { StateFilterService } from '../../state-filter.service';
import { MockStateFilterService } from '../../../../../mocks/services/MockStateFilterService';
import { ProjectInfo } from '../../../../services/project-service/project.service';
import { MockProjectService } from '../../../../../mocks/services/MockProjectService';
import { StatusDashboardComponent } from './status-dashboard.component';

describe('Component: StatusDashboardComponent', () => {
  let component: StatusDashboardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusDashboardComponent ],
      imports: [
        MaterialModule,
        PipesModule
        ],
      providers: [
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
