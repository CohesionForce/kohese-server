import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of as ObservableOf } from 'rxjs';

import { DashboardModule } from '../dashboard.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { ProjectDashboardComponent } from './project-dashboard.component';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

describe('ProjectDashboardComponent', () => {
  let projectDashboardComponent: ProjectDashboardComponent;
  let fixture: ComponentFixture<ProjectDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        DashboardModule
      ],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: APP_BASE_HREF, useValue: '/'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDashboardComponent);
    projectDashboardComponent = fixture.componentInstance;
    projectDashboardComponent.dashboardSelectionStream = ObservableOf(DashboardSelections.PROJECT_OVERVIEW);

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  })

  it('should instantiate', () => {
    expect(projectDashboardComponent).toBeTruthy();
  });

  afterEach(() => {
    fixture.destroy();
  });
});
