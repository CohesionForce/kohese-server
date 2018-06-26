import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRowComponent } from './document-row.component';

describe('DocumentRowComponent', () => {
  let component: DocumentRowComponent;
  let fixture: ComponentFixture<DocumentRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
