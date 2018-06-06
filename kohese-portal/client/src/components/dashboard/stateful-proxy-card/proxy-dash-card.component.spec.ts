import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProxyDashCardComponent } from './proxy-dash-card.component';

describe('ProxyDashCardComponent', () => {
  let component: ProxyDashCardComponent;
  let fixture: ComponentFixture<ProxyDashCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProxyDashCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProxyDashCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
