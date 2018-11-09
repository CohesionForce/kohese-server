import { TestBed, ComponentFixture } from '@angular/core/testing';

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
      providers: [{ provide: DialogService, useClass: MockDialogService }]
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

  it('returns a style object based on the given change', () => {
    expect(component.getChangeStyle({ added: true })['background-color']).
      toEqual('lightgreen');
    expect(component.getChangeStyle({ removed: true })['background-color']
      ).toEqual('lightcoral');
  });
});
