/*
 * Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
