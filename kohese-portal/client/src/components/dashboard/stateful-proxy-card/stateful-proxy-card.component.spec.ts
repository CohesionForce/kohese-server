import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatefulProxyCardComponent } from './stateful-proxy-card.component';

describe('StatefulProxyCardComponent', () => {
  let component: StatefulProxyCardComponent;
  let fixture: ComponentFixture<StatefulProxyCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatefulProxyCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatefulProxyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
