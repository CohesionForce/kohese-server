import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { AssignmentDashboardComponent } from './assignment-dashboard.component';
import { BehaviorSubject } from 'rxjs';
import { DashboardSelections } from '../dashboard-selector/dashboard-selector.component';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { ItemProxy } from '../../../../../common/src/item-proxy';

describe('Component: ', ()=>{
  let assignmentDashboardComponent: AssignmentDashboardComponent;
  let assignmentDashboardFixture : ComponentFixture<AssignmentDashboardComponent>;
  let assignmentTypeStream = new BehaviorSubject<DashboardSelections>(DashboardSelections.ACTIVE_ASSIGNMENTS);
  let assignmentListStream = new BehaviorSubject<Array<ItemProxy>>(new MockItemRepository().getRootProxy().children)

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [AssignmentDashboardComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
      ]
    }).compileComponents();

    assignmentDashboardFixture = TestBed.createComponent(AssignmentDashboardComponent);
    assignmentDashboardComponent = assignmentDashboardFixture.componentInstance;
    assignmentDashboardComponent.assignmentTypeStream = assignmentTypeStream;
    assignmentDashboardComponent.assignmentListStream = assignmentListStream;

    assignmentDashboardFixture.detectChanges();

  })

  it('instantiates the assignmentDashboard component', ()=>{
    expect(assignmentDashboardComponent).toBeTruthy();
  })
})