import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MaterialModule } from '../../../material.module';
import { DialogService } from '../../../services/dialog/dialog.service';
import { MockDialogService } from '../../../../mocks/services/MockDialogService';
import { ChangeSummaryComponent } from './change-summary.component';
import { Comparison } from '../comparison.class';

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

    fixture.detectChanges();
  });

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
