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
import { ProjectOverviewComponent } from './project-overview.component';

describe('Component: StatusDashboardComponent', () => {
  let component: ProjectOverviewComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectOverviewComponent ],
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

    let fixture: ComponentFixture<ProjectOverviewComponent> = TestBed.createComponent(ProjectOverviewComponent);
    component = fixture.componentInstance;
    component.projectStream = new BehaviorSubject<ProjectInfo>(new MockProjectService().getProjects()[0]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
