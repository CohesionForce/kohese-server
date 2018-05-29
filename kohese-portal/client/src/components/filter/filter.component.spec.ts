import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { MaterialModule } from '../../material.module';
import { PipesModule } from '../../pipes/pipes.module';
import { DynamicTypesService } from '../../services/dynamic-types/dynamic-types.service';
import { MockDynamicTypesService } from '../../../mocks/services/MockDynamicTypesService';
import { FilterComponent } from './filter.component';
import { Filter } from './filter.class';
import { KoheseType } from '../../classes/UDT/KoheseType.class';

describe('Component: filter', () => {
  let component: FilterComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { filter: undefined } },
        { provide: DynamicTypesService, useClass: MockDynamicTypesService },
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ],
      imports: [
        BrowserAnimationsModule,
        MaterialModule,
        PipesModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<FilterComponent> = TestBed.
      createComponent(FilterComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });
  
  it('responds to the type selections changing', () => {
    component.typeSelectionsChanged(['Kurios Iesous']);
    expect(component.filter.types.length).toBeGreaterThan(0);
    expect(component.filter.properties.length).toBeGreaterThan(0);
  });
  
  it('determines if a given string represents a given KoheseType', () => {
    let koheseType: KoheseType = TestBed.get(DynamicTypesService).
      getKoheseTypes()['Kurios Iesous'];
    expect(component.compareTypeOptionAndSelection('Item', koheseType)).
      toEqual(true);
    expect(component.compareTypeOptionAndSelection('Type Name', koheseType)).
      toEqual(false);
  });
});
