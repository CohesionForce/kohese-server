import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { DueAssignmentComponent } from './due-assignment.component';
import { MockAction } from '../../../../../mocks/data/MockItem';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';

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
        {provide: DialogService, useClass: MockDialogService},
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
