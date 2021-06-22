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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MaterialModule } from '../../../../material.module'

import { OpenAssignmentComponent } from './open-assignment.component';
import { MockAction } from '../../../../../mocks/data/MockItem';
import { ItemProxy } from '../../../../../../common/src/item-proxy';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../../mocks/services/MockDialogService';
import { ItemRepository } from '../../../../services/item-repository/item-repository.service';
import { MockItemRepository } from '../../../../../mocks/services/MockItemRepository';

describe('Component: ', ()=>{
  let openAssignmentComponent: OpenAssignmentComponent;
  let openAssignmentFixture : ComponentFixture<OpenAssignmentComponent>;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [OpenAssignmentComponent],
      imports : [CommonModule,
         MaterialModule,
         BrowserAnimationsModule
         ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {provide: DialogService, useClass: MockDialogService},
        {provide: ItemRepository, useClass: MockItemRepository}
      ]
    }).compileComponents();

    openAssignmentFixture = TestBed.createComponent(OpenAssignmentComponent);
    openAssignmentComponent = openAssignmentFixture.componentInstance;
    openAssignmentComponent.assignment = new ItemProxy('Action', MockAction());

    openAssignmentFixture.detectChanges();

  })

  afterEach(() => {
    openAssignmentFixture.destroy();
    TestBed.resetTestingModule();
  })

  it('instantiates the openAssignment component', ()=>{
    expect(openAssignmentComponent).toBeTruthy();
  })
})
