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

// Kohese
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { KTableComponent } from './k-table.component';

// Mocks
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('Component: k-table', () => {
  let component: KTableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KTableComponent],
      providers: [
        { provide: ItemRepository, useClass: MockItemRepository }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<KTableComponent> = TestBed.createComponent(KTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

});
