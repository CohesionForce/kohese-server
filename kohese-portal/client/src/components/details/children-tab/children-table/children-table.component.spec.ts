import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'
import { PipesModule } from '../../../../pipes/pipes.module';

import { ChildrenTableComponent } from './children-table.component';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';

import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';
import { BehaviorSubject } from 'rxjs';
import * as ItemProxy from '../../../../../../common/models/item-proxy';
import { MockItem } from '../../../../../mocks/data/MockItem';

describe('Component: Children Table', ()=>{
  let childrenTableComponent: ChildrenTableComponent;
  let childrenTableFixture : ComponentFixture<ChildrenTableComponent>;
  let mockRepo = new MockItemRepository();
  let childSubject : BehaviorSubject<Array<ItemProxy>>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ChildrenTableComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService}
      ]
    }).compileComponents();

    childrenTableFixture = TestBed.createComponent(ChildrenTableComponent);
    childrenTableComponent = childrenTableFixture.componentInstance;

    childSubject = new BehaviorSubject<Array<ItemProxy>>(mockRepo.getRootProxy().children);

    childrenTableComponent.childrenStream = childSubject; 
    childrenTableComponent.filterSubject = new BehaviorSubject<string>('');

    childrenTableFixture.detectChanges();
    
  })

  it('instantiates the ChildrenTable component', ()=>{
    expect(childrenTableComponent).toBeTruthy(); 
  })

  it('updates the children list when a new array comes in', ()=>{
    expect(childrenTableComponent.children.length).toBe(5);
    let newChildren = mockRepo.getRootProxy().children;
    newChildren.push(new ItemProxy('Item', MockItem));
    childSubject.next(newChildren);
    expect(childrenTableComponent.children.length).toBe(6);
  })
})