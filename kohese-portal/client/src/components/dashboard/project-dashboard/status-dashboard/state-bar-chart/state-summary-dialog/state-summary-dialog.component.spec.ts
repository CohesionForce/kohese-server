import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StateSummaryDialogComponent } from './state-summary-dialog.component';

describe('StateSummaryDialogComponent', () => {
  let component: StateSummaryDialogComponent;
  let fixture: ComponentFixture<StateSummaryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateSummaryDialogComponent ]
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
