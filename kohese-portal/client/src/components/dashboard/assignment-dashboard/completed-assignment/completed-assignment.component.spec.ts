import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { CompletedAssignmentComponent } from './completed-assignment.component';
import { MockAction } from '../../../../../mocks/data/MockItem';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { PipesModule } from '../../../../pipes/pipes.module';

describe('Component: Completed Assignment', ()=>{
  let completedAssignmentComponent: CompletedAssignmentComponent;
  let completedAssignmentFixture : ComponentFixture<CompletedAssignmentComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [CompletedAssignmentComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide : NavigationService, useClass: MockNavigationService},
        {provide: ItemRepository, useClass: MockItemRepository}
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
