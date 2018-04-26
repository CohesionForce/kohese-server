import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
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
  let mockRepo: MockItemRepository;

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
    mockRepo = new MockItemRepository();

    childrenTableComponent.childrenStream =
      new BehaviorSubject<Array<ItemProxy>>(mockRepo.getRootProxy().children);
    childrenTableComponent.filterSubject = new BehaviorSubject<string>('');
    childrenTableComponent.editableStream = new BehaviorSubject<boolean>(false);

    childrenTableFixture.detectChanges();

  })

  it('instantiates the ChildrenTable component', ()=>{
    expect(childrenTableComponent).toBeTruthy();
  })

  it('updates the children list when a new array comes in', fakeAsync(()=>{
    let initialNumberOfChildren: number = childrenTableComponent.children.
      length;
    let item: any = MockItem();
    delete item.id;
    /* Delete the parentId so that this Item will be added as a child of the
    root proxy */
    delete item.parentId;
    new ItemProxy('Item', item);
    childrenTableComponent.childrenStream.next(mockRepo.getRootProxy().
      children);
    tick();
    expect(childrenTableComponent.children.length).toEqual(
      initialNumberOfChildren + 1);
  }));

  it('changes the order of children in their parent', () => {
    childrenTableComponent.editableStream.next(true);
    let rootProxy: ItemProxy = ItemProxy.getWorkingTree().getRootProxy();
    let changedOrderingType: boolean = false;
    if (!rootProxy.childrenAreManuallyOrdered()) {
      rootProxy.toggleChildrenAreManuallyOrdered();
      changedOrderingType = true;
    }
    let initialIndex: number;
    for (let j: number = 0; j < rootProxy.children.length; j++) {
      if ('test-uuid3' === rootProxy.children[j].item.id) {
        initialIndex = j;
        break;
      }
    }
    let dropEvent: any = jasmine.createSpyObj('DropEvent', ['preventDefault']);
    dropEvent.dataTransfer = jasmine.createSpyObj('DataTransfer', ['getData']);
    dropEvent.dataTransfer.getData.and.returnValue('test-uuid3');

    childrenTableComponent.whenDropOccurs(rootProxy.children[rootProxy.
      children.length - 1], dropEvent);

    for (let j: number = 0; j < rootProxy.children.length; j++) {
      if ('test-uuid3' === rootProxy.children[j].item.id) {
        expect(initialIndex).not.toEqual(j);
        break;
      }
    }

    if (changedOrderingType) {
      rootProxy.toggleChildrenAreManuallyOrdered();
    }
  });
})
