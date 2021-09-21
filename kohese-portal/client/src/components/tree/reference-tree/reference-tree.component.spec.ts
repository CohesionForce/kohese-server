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
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { of as ObservableOf } from 'rxjs';

// Other External Dependencies
import { VirtualScrollModule } from 'angular2-virtual-scroll';

// Kohese
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DialogService } from '../../../services/dialog/dialog.service';
import { NavigationService } from '../../../services/navigation/navigation.service';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { ReferenceTreeComponent } from './reference-tree.component';

// Mocks
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';
import { MockNavigationService } from '../../../../mocks/services/MockNavigationService';

describe('Component: reference-tree', () => {
  let component: ReferenceTreeComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReferenceTreeComponent],
      imports: [
        VirtualScrollModule,
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository },
        { provide: ActivatedRoute, useValue: { params: ObservableOf({
          id: ''
        }) } },
        { provide: DialogService, useClass: MockDialogService },
        { provide: NavigationService, useClass: MockNavigationService },
        DynamicTypesService
      ]
    }).compileComponents();

    let fixture: ComponentFixture<ReferenceTreeComponent> = TestBed.
      createComponent(ReferenceTreeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('initializes', () => {
    expect(component.getRootRow()).toBeDefined();
  });
});
