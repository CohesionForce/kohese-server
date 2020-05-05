import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../../material.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { DynamicTypesService } from '../../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../../mocks/services/MockDynamicTypesService';
import { Comparison, ChangeType } from '../comparison.class';
import { CommitComparisonComponent } from './commit-comparison.component';

describe('Component: commit-comparison', () => {
  let component: CommitComparisonComponent;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommitComparisonComponent],
      providers: [ {
          provide: MAT_DIALOG_DATA,
          useValue: {
            baseCommitId: '7ef7525795a5c370b0abfa501ab87324f5ce5908',
            changeCommitId: '42a8e801f9efef73db114730d5819997e38916d7'
          }
        }, { provide: DynamicTypesService, useClass: MockDynamicTypesService }
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