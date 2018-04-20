import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { DueAssignmentComponent } from './due-assignment.component';
import { MockAction } from '../../../../../mocks/data/MockItem';
import * as ItemProxy from '../../../../../../common/src/item-proxy';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';

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
        {provide : NavigationService, useClass: MockNavigationService},
        {provide: ItemRepository, useClass: MockItemRepository}
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