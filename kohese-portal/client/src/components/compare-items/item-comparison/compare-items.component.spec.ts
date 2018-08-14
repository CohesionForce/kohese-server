import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AngularSplitModule } from 'angular-split';

import { MaterialModule } from '../../../material.module';
import { CompareItemsComponent } from './compare-items.component';

describe('Component: compare-items', () => {
  let component: CompareItemsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompareItemsComponent],
      imports : [
        MaterialModule,
        AngularSplitModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    let compareItemsFixture: ComponentFixture<CompareItemsComponent> = TestBed.
      createComponent(CompareItemsComponent);
    component = compareItemsFixture.componentInstance;

    compareItemsFixture.detectChanges();
  });
});
