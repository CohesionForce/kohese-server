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

import { MAT_DIALOG_DATA } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../material.module';

// Kohese
import { PipesModule } from '../../../pipes/pipes.module';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { Comparison, ChangeType } from '../comparison.class';
import { CommitComparisonComponent } from './commit-comparison.component';
import { ItemRepository } from '../../../services/item-repository/item-repository.service';

// Mocks
import { MockItemRepository } from '../../../../mocks/services/MockItemRepository';

describe('Component: commit-comparison', () => {
  let component: CommitComparisonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommitComparisonComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            baseCommitId: '7ef7525795a5c370b0abfa501ab87324f5ce5908',
            changeCommitId: '42a8e801f9efef73db114730d5819997e38916d7'
          }
        },
        { provide: ItemRepository, useClass: MockItemRepository },
        DynamicTypesService
      ],
      imports: [
        BrowserAnimationsModule,
        MaterialModule,
        PipesModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<CommitComparisonComponent> = TestBed.
      createComponent(CommitComparisonComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('compares two commits', (done) => {
    let firstTime : boolean = true;
    let subscription = component.comparisonsSubject.subscribe((comparisons: Array<Comparison>) => {
      if (firstTime && comparisons.length === 0){
        // Ignore an empty list if this the firstTime since the comparision is async and may not have finished
      } else {
        expect(comparisons.length).toBeGreaterThan(0);
        console.log(comparisons);
        let comparison: Comparison = comparisons[0];
        expect(comparison.changeTypes.length).toBeGreaterThan(0);
        subscription.unsubscribe();
        done();
      }
      firstTime = false;
    });
  });
});
