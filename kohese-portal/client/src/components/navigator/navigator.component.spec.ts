import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../../material.module';
import { NavigatorComponent } from './navigator.component';

describe('Component: navigator', () => {
  let component: NavigatorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavigatorComponent],
      imports: [
        BrowserAnimationsModule,
        MaterialModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    let fixture: ComponentFixture<NavigatorComponent> = TestBed.createComponent(NavigatorComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('instantiates the navigator component', () => {
    expect(component).toBeTruthy();
  })
});
