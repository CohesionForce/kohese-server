import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { MaterialModule } from '../../material.module';
import { FilterComponent } from './filter.component';
import { Filter, TypeFilterCriterion } from './filter.class';

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
  
  it('determines if a criterion is defined', () => {
    expect(component.isCriterionDefined()).toEqual(false);
    component.filterSubject.getValue().rootElement.criteria.push(
      new TypeFilterCriterion(TypeFilterCriterion.CONDITIONS.SUBCLASS_OF,
      'Kurios Iesous'));
    expect(component.isCriterionDefined()).toEqual(true);
  });
});
