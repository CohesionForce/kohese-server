import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullscreenDocumentComponent } from './fullscreen-document.component';

describe('FullscreenDocumentComponent', () => {
  let component: FullscreenDocumentComponent;
  let fixture: ComponentFixture<FullscreenDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullscreenDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullscreenDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
