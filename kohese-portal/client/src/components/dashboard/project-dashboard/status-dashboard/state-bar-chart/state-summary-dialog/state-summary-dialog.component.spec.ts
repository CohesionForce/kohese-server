import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MAT_DIALOG_DATA } from '@angular/material';

import { StateSummaryDialogComponent } from './state-summary-dialog.component';

describe('StateSummaryDialogComponent', () => {
  let component: StateSummaryDialogComponent;
  let fixture: ComponentFixture<StateSummaryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateSummaryDialogComponent ],
      imports: [ NgxDatatableModule ],
      providers: [ {
        provide: MAT_DIALOG_DATA,
        useValue: {
          stateInfo: { stateName: 'Approved', kind: 'Kurios Iesous', proxies: [] },
          color: 'white'
          }
        } ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateSummaryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
