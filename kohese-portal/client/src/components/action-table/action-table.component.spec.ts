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
import { TestBed, ComponentFixture} from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { BehaviorSubject } from 'rxjs';

// Kohese
import { NavigationService } from '../../services/navigation/navigation.service';
import { ActionTableComponent } from './action-table.component';
import { ItemProxy } from '../../../../common/src/item-proxy';
import { ItemRepository } from '../../services/item-repository/item-repository.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { PipesModule } from '../../pipes/pipes.module';
import { MaterialModule } from '../../material.module';

// Mocks
import { MockDialogService } from '../../../mocks/services/MockDialogService';
import { MockNavigationService } from '../../../mocks/services/MockNavigationService';
import { MockItemRepository} from '../../../mocks/services/MockItemRepository';

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

    let itemRepository: any = TestBed.inject(ItemRepository);
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
