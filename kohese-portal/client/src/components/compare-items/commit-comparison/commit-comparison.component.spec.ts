import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material';
import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { MaterialModule } from '../../../material.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { CommitComparisonComponent, Difference, DifferenceType,
  DifferenceTypeOperations } from './commit-comparison.component';

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
        }, { provide: DialogService, useClass: MockDialogService }
      ],
      imports: [
        VirtualScrollModule,
        MaterialModule,
        PipesModule
      ]
    }).compileComponents();
    
    let fixture: ComponentFixture<CommitComparisonComponent> = TestBed.
      createComponent(CommitComparisonComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
  
  it('compares two commits', () => {
    expect(component.differences.length).toBeGreaterThan(0);
    let difference: Difference = component.differences[0];
    if (difference) {
      expect(difference.differenceTypes.length).toBeGreaterThan(0);
      let differenceType: DifferenceType = difference.differenceTypes[0];
      expect(DifferenceTypeOperations.toString(differenceType)).not.toEqual(
        '');
      expect(DifferenceTypeOperations.getIconClass(differenceType)).not.
        toEqual('');
    }
  });
});