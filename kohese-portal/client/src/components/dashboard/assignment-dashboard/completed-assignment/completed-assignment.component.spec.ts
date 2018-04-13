import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { CompletedAssignmentComponent } from './completed-assignment.component';
import { MockAction } from '../../../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../../../common/src/item-proxy';

describe('Component: Completed Assignment', ()=>{
  let completedAssignmentComponent: CompletedAssignmentComponent;
  let completedAssignmentFixture : ComponentFixture<CompletedAssignmentComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [CompletedAssignmentComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
      ]
    }).compileComponents();

    completedAssignmentFixture = TestBed.createComponent(CompletedAssignmentComponent);
    completedAssignmentComponent = completedAssignmentFixture.componentInstance;
    completedAssignmentComponent.assignment = new ItemProxy('Action', MockAction());

    completedAssignmentFixture.detectChanges();
    
  })

  it('instantiates the completedAssignment component', ()=>{
    expect(completedAssignmentComponent).toBeTruthy(); 
  })
})