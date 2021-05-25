import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { MaterialModule } from '../../../../material.module';
import { PipesModule } from '../../../../pipes/pipes.module';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { DynamicTypesService } from '../../../../services/dynamic-types/dynamic-types.service';
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
