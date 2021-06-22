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


import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../material.module'

import { NavigationService } from '../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { ActionTableComponent } from './action-table.component';
import { PipesModule } from '../../pipes/pipes.module';
import { BehaviorSubject } from 'rxjs';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { KoheseModel } from '../../../../common/src/KoheseModel';
import { DialogService } from '../../services/dialog/dialog.service';

import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { MockItemRepository} from '../../../mocks/services/MockItemRepository';
import { MockKoheseType } from '../../../mocks/data/MockKoheseType';
import { ItemRepository } from '../../services/item-repository/item-repository.service';

describe('Component: Action Table', ()=>{
  let actionTableComponent: ActionTableComponent;
  let actionTableFixture : ComponentFixture<ActionTableComponent>;
  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [ActionTableComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule,
         CommonModule,
         PipesModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: DialogService, useClass: MockDialogService},
        {provide: NavigationService, useClass : MockNavigationService},
        {provide: ChangeDetectorRef, useValue : {markForCheck : ()=>{}}},
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    actionTableFixture = TestBed.createComponent(ActionTableComponent);
    actionTableComponent = actionTableFixture.componentInstance;

    let itemRepository: any = TestBed.get(ItemRepository);
    let proxy: ItemProxy = itemRepository.getRootProxy();

    actionTableComponent.proxyStream = new BehaviorSubject<any>(proxy);
    actionTableFixture.detectChanges();

  })

  afterEach(() => {
    actionTableFixture.destroy;
    TestBed.resetTestingModule();
  })

  it('instantiates the actionTable component', ()=>{
    expect(actionTableComponent).toBeTruthy();
  })

  afterEach(()=>{
    ItemProxy.getWorkingTree().reset();
  })
})
