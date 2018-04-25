import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { ActiveAssignmentComponent } from './active-assignment.component';
import { MockAction } from '../../../../../mocks/data/MockItem';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';

describe('Component: Active Assignment', ()=>{
  let activeAssignmentComponent: ActiveAssignmentComponent;
  let activeAssignmentFixture : ComponentFixture<ActiveAssignmentComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ActiveAssignmentComponent],
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

    activeAssignmentFixture = TestBed.createComponent(ActiveAssignmentComponent);
    activeAssignmentComponent = activeAssignmentFixture.componentInstance;
    activeAssignmentComponent.assignment = new ItemProxy('Action', MockAction());

    activeAssignmentFixture.detectChanges();

  })

  it('instantiates the activeAssignment component', ()=>{
    expect(activeAssignmentComponent).toBeTruthy();
  })
})
