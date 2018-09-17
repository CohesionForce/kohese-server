import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

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
            baseCommitId: 'cca8746527cb48d3e8a815c12b99bc1cb378b9f0',
            changeCommitId: 'ccdaa0ec5f01db40886fe52e917c336eb7c075ea'
          }
        }, { provide: DynamicTypesService, useClass: MockDynamicTypesService }
      ],
      imports: [
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
  
  it('compares two commits', () => {
    let comparisons: Array<Comparison> = component.comparisonsSubject.
      getValue();
    expect(comparisons.length).toBeGreaterThan(0);
    let comparison: Comparison = comparisons[0];
    expect(comparison.changeTypes.length).toBeGreaterThan(0);
  });
});