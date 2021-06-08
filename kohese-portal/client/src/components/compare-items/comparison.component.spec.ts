import { TestBed, ComponentFixture } from '@angular/core/testing';

import { ComparisonComponent } from './comparison.component';

describe('Component: comparison', () => {
  let component: ComparisonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComparisonComponent]
    }).compileComponents();

    let fixture: ComponentFixture<ComparisonComponent> = TestBed.
      createComponent(ComparisonComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('returns a style object based on the given change', () => {
    expect(component.getChangeStyle({ added: true })['background-color']).
      toEqual('lightgreen');
    expect(component.getChangeStyle({ removed: true })['background-color']
      ).toEqual('lightcoral');
  });
});
