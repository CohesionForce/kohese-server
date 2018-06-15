import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationRowComponent } from './creation-row.component';

describe('CreationRowComponent', () => {
  let component: CreationRowComponent;
  let fixture: ComponentFixture<CreationRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreationRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
