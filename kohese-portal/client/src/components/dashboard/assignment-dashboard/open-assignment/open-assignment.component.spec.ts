import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { OpenAssignmentComponent } from './open-assignment.component';
import { MockAction } from '../../../../../mocks/data/MockItem';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';

describe('Component: ', ()=>{
  let openAssignmentComponent: OpenAssignmentComponent;
  let openAssignmentFixture : ComponentFixture<OpenAssignmentComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [OpenAssignmentComponent],
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

    openAssignmentFixture = TestBed.createComponent(OpenAssignmentComponent);
    openAssignmentComponent = openAssignmentFixture.componentInstance;
    openAssignmentComponent.assignment = new ItemProxy('Action', MockAction());

    openAssignmentFixture.detectChanges();

  })

  it('instantiates the openAssignment component', ()=>{
    expect(openAssignmentComponent).toBeTruthy();
  })
})
