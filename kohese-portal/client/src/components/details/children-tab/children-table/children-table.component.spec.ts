/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'
import { PipesModule } from '../../../../pipes/pipes.module';

import { ChildrenTableComponent } from './children-table.component';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';

import { DialogService } from '../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { NavigationService } from '../../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../../mocks/services/MockNavigationService';
import { BehaviorSubject } from 'rxjs';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
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
        {provide: NavigationService, useClass: MockNavigationService},
        {provide: DialogService, useClass: MockDialogService}
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

  afterEach(() => {
    childrenTableFixture.destroy();
    TestBed.resetTestingModule();
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
