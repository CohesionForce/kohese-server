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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

// Kohese
import { ItemRepository } from '../../../services/item-repository/item-repository.service';
import { DocumentOutlineComponent } from './document-outline.component';

// Mocks
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('DocumentOutlineComponent', () => {
  let component: DocumentOutlineComponent;
  let fixture: ComponentFixture<DocumentOutlineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentOutlineComponent ],
      providers: [ {
        provide: ActivatedRoute,
        useValue: { params: new BehaviorSubject<any>({ id: 'test-uuid2' }) }
        }, { provide: ItemRepository, useClass: MockItemRepository } ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentOutlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.resetTestingModule();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
