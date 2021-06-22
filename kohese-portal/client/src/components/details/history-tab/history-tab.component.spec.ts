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


import { TestBed, ComponentFixture} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../material.module'

import { HistoryTabComponent} from './history-tab.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { MockItem } from '../../../../mocks/data/MockItem';

import { NavigationService } from '../../../services/navigation/navigation.service';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { BehaviorSubject } from 'rxjs';

describe('Component: History Tab', ()=>{
  let historyComponent: HistoryTabComponent;
  let historyFixture : ComponentFixture<HistoryTabComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [HistoryTabComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: NavigationService, useClass: MockNavigationService},
        { provide: ItemRepository, useClass: MockItemRepository },
        DynamicTypesService
      ]
    }).compileComponents();

    historyFixture = TestBed.createComponent(HistoryTabComponent);
    historyComponent = historyFixture.componentInstance;

    historyComponent.proxyStream = new BehaviorSubject(new ItemProxy('Item', MockItem()));

    historyFixture.detectChanges();

  })

  afterEach(() => {
    historyFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the history component', ()=>{
    expect(historyComponent).toBeTruthy();
  })
})
