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

import { BehaviorSubject } from 'rxjs';
import { MaterialModule } from '../../../material.module';

// Kohese
import { DialogService } from '../../../services/dialog/dialog.service';
import { ChangeSummaryComponent } from './change-summary.component';
import { Comparison } from '../comparison.class';

// Mocks
import { MockDialogService } from '../../../../mocks/services/MockDialogService';

describe('Component: change-summary', () => {
  let component: ChangeSummaryComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeSummaryComponent],
      imports: [MaterialModule],
      providers: [{ provide: DialogService, useClass: MockDialogService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<ChangeSummaryComponent> = TestBed.
      createComponent(ChangeSummaryComponent);
    component = fixture.componentInstance;
    component.comparisonsSubject = new BehaviorSubject<Array<Comparison>>([]);

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('determines if a Comparison has changes', async () => {
    let comparisonWithChanges: Comparison = new Comparison({
      property: 'value'
      }, {
      property: 'Value'
    });
    await comparisonWithChanges.compare();
    expect(component.hasChanges(comparisonWithChanges)).toEqual(true);

    let comparisonWithoutChanges: Comparison = new Comparison({
      property: 'value'
      }, {
      property: 'value'
    });
    await comparisonWithChanges.compare();
    expect(component.hasChanges(comparisonWithoutChanges)).toEqual(false);
  });
});
