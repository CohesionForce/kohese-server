/*
 * Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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

import { MaterialModule } from '../../../material.module';
import { TreeRowComponent } from './tree-row.component';
import { TreeRow } from './tree-row.class';
import { ItemProxy } from '../../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../../common/src/tree-configuration';

describe('Component: tree-row', () => {
  let component: TreeRowComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeRowComponent],
      imports: [MaterialModule]
    }).compileComponents();

    let fixture: ComponentFixture<TreeRowComponent> = TestBed.createComponent(
      TreeRowComponent);
    component = fixture.componentInstance;
    let proxy: ItemProxy = TreeConfiguration.getWorkingTree().getRootProxy();
    let row: TreeRow = new TreeRow(proxy);
    row.depth = 3;
    component.treeRow = row;

    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('instantiates the tree-row component', () => {
    expect(TreeRowComponent).toBeTruthy();
  })
});
