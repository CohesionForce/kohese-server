import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of as ObservableOf } from 'rxjs';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

import { DashboardModule } from '../../dashboard.module';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { TreeConfiguration } from '../../../../../../common/src/tree-configuration';
import { ProjectOverviewComponent } from './project-overview.component';

describe('ProjectOverviewComponent', () => {
  let component: ProjectOverviewComponent;
  let fixture: ComponentFixture<ProjectOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        DashboardModule,
      ],
      providers: [
        { provide: DialogService, useClass: MockDialogService },
        { provide: APP_BASE_HREF, useValue: '/'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectOverviewComponent);
    component = fixture.componentInstance;
    component.projectStream = ObservableOf({
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
