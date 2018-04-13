import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { DueAssignmentComponent } from './due-assignment.component';
import { MockAction } from '../../../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../../../common/src/item-proxy';

describe('Component: ', ()=>{
  let dueAssignmentComponent: DueAssignmentComponent;
  let dueAssignmentFixture : ComponentFixture<DueAssignmentComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [DueAssignmentComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
      ]
    }).compileComponents();

    dueAssignmentFixture = TestBed.createComponent(DueAssignmentComponent);
    dueAssignmentComponent = dueAssignmentFixture.componentInstance;
    dueAssignmentComponent.assignment = new ItemProxy('Action', MockAction());

    dueAssignmentFixture.detectChanges();
    
  })

  it('instantiates the dueAssignment component', ()=>{
    expect(dueAssignmentComponent).toBeTruthy(); 
  })
})