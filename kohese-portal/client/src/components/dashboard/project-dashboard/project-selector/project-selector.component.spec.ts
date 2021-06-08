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
