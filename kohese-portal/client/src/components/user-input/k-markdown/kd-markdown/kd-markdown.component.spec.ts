import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KdMarkdownComponent } from './kd-markdown.component';

describe('KdMarkdownComponent', () => {
  let component: KdMarkdownComponent;
  let fixture: ComponentFixture<KdMarkdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KdMarkdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KdMarkdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
