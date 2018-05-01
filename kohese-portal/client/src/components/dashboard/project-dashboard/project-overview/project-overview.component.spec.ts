import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardModule } from '../../dashboard.module';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { ProjectOverviewComponent } from './project-overview.component';

describe('ProjectOverviewComponent', () => {
  let component: ProjectOverviewComponent;
  let fixture: ComponentFixture<ProjectOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ DashboardModule ],
      providers: [ { provide: DialogService, useClass: MockDialogService } ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ProjectOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
