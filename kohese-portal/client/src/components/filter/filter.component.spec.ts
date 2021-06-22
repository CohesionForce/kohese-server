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


import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { MaterialModule } from '../../material.module';
import { FilterComponent } from './filter.component';
import { Filter, FilterCriterion } from './filter.class';

describe('Component: filter', () => {
  let component: FilterComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { filter: undefined } },
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ],
      imports: [
        BrowserAnimationsModule,
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<FilterComponent> = TestBed.
      createComponent(FilterComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('determines if a criterion is defined', () => {
    expect(component.isCriterionDefined()).toEqual(false);
    let filter: Filter = component.filterSubject.getValue();
    filter.rootElement.criteria.push(new FilterCriterion(filter.
      filterableProperties[0], FilterCriterion.CONDITIONS.BEGINS_WITH,
      'test-uuid2'));
    expect(component.isCriterionDefined()).toEqual(true);
  });
});
