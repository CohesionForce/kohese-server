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

import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { PipesModule } from '../../../pipes/pipes.module';

// Kohese
import { StateService } from '../../../services/state/state.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { KStateEditorComponent } from './k-state-editor.component';
import { ItemProxy } from '../../../../../common/src/item-proxy';

// Mocks
import { MockItem } from '../../../../mocks/data/MockItem';
import { MockStateService } from '../../../../mocks/services/MockStateService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('k-state-editor', () => {
  let stateEditor: ComponentFixture<KStateEditorComponent>;
  let component: KStateEditorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KStateEditorComponent],
      imports: [
        CommonModule,
        MaterialModule,
        PipesModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StateService, useClass: MockStateService },
        DynamicTypesService,
        { provide: ItemRepository,
          useClass: MockItemRepository }
      ]
    }).compileComponents();

    stateEditor = TestBed.createComponent(KStateEditorComponent);
    component = stateEditor.componentInstance;
    component.itemProxy = new ItemProxy('Item', MockItem());
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('changes the value of fields of type "StateMachine"', () => {
    component.transition('actionState', 'Assigned');
    expect(component.itemProxy.item['actionState']).toEqual('Assigned');
  });
});
