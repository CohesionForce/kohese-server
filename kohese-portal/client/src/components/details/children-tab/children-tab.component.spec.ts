/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


// Angular
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../material.module';

// Kohese
import { ChildrenTabComponent } from './children-tab.component';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

// Mocks
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { MockItem } from '../../../../mocks/data/MockItem';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('Component: Children Tab', ()=>{
  let childrenTabComponent: ChildrenTabComponent;
  let childrenTabFixture : ComponentFixture<ChildrenTabComponent>;
  let proxyStream : BehaviorSubject<ItemProxy>;
  let editableStream : BehaviorSubject<boolean>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ChildrenTabComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         FormsModule,
         ReactiveFormsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: NavigationService, useClass: MockNavigationService },
        { provide: ItemRepository, useClass: MockItemRepository }
      ]
    }).compileComponents();

    childrenTabFixture = TestBed.createComponent(ChildrenTabComponent);
    childrenTabComponent = childrenTabFixture.componentInstance;

    proxyStream = new BehaviorSubject(new ItemProxy('Item', MockItem()));
    childrenTabComponent.proxyStream = new BehaviorSubject(new ItemProxy('Item', MockItem()));

    editableStream = new BehaviorSubject(false);
    childrenTabComponent.editableStream = editableStream;

    childrenTabFixture.detectChanges();

  });

  afterEach(() => {
    childrenTabFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the childrenTab component', ()=>{
    expect(childrenTabComponent).toBeTruthy();
  });

  it('updates the proxy when a new proxy is pushed downstream', ()=>{
    expect(childrenTabComponent.itemProxy.item.name).toBe('Test item');
    let newProxy = new ItemProxy('Item', MockItem());
    newProxy.item.name = "A different name";
    proxyStream.next(newProxy);
    expect(childrenTabComponent.itemProxy.item.name).toBe('A different name');

  });
});
