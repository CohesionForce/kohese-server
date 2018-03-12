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
import * as ItemProxy from '../../../../../../common/src/item-proxy';
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
    childrenTableComponent.editableStream = new BehaviorSubject<boolean>(false);

    childrenTableFixture.detectChanges();
    
  })

  it('instantiates the ChildrenTable component', ()=>{
    expect(childrenTableComponent).toBeTruthy(); 
  })

  it('updates the children list when a new array comes in', ()=>{
    expect(childrenTableComponent.children.length).toBe(5);
    let newChildren = mockRepo.getRootProxy().children;
    newChildren.push(new ItemProxy('Item', MockItem()));
    childSubject.next(newChildren);
    expect(childrenTableComponent.children.length).toBe(6);
  });
  
  it('changes the order of children in their parent', () => {
    childrenTableComponent.editableStream.next(true);
    let rootProxy: ItemProxy = ItemProxy.getRootProxy();
    let changedOrderingType: boolean = false;
    if (!rootProxy.childrenAreManuallyOrdered()) {
      rootProxy.toggleChildrenAreManuallyOrdered();
      changedOrderingType = true;
    }
    let initialIndex: number;
    for (let j: number = 0; j < rootProxy.children.length; j++) {
      if ('view-item' === rootProxy.children[j].item.id) {
        initialIndex = j;
        break;
      }
    }
    let dropEvent: any = jasmine.createSpyObj('DropEvent', ['preventDefault']);
    dropEvent.dataTransfer = jasmine.createSpyObj('DataTransfer', ['getData']);
    dropEvent.dataTransfer.getData.and.returnValue('view-item');
    
    childrenTableComponent.whenDropOccurs(rootProxy.children[rootProxy.
      children.length - 1], dropEvent);
      
    for (let j: number = 0; j < rootProxy.children.length; j++) {
      if ('view-item' === rootProxy.children[j].item.id) {
        expect(initialIndex).not.toEqual(j);
        break;
      }
    }
    
    if (changedOrderingType) {
      rootProxy.toggleChildrenAreManuallyOrdered();
    }
  });
})