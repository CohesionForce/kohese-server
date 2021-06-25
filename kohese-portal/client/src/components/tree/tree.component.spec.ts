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


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatIconModule, MatInputModule, MatSidenavModule,
  MatTooltipModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { TreeComponent } from './tree.component';

describe('TreeComponent', () => {
  let component: TreeComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeComponent],
      imports: [
        BrowserAnimationsModule,
        MatSidenavModule,
        MatIconModule,
        MatTooltipModule,
        MatInputModule,
        MatDialogModule
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<TreeComponent> = TestBed.
      createComponent(TreeComponent);
    component = componentFixture.componentInstance;

    MockItemRepository.singleton.mockFullSync();

    component.root = TreeConfiguration.getWorkingTree().getRootProxy();
    component.getChildren = (element: any) => {
      return (element as ItemProxy).children;
    };
    component.hasChildren = (element: any) => {
      return (component.getChildren(element).length > 0);
    };
    component.getText = (element: any) => {
      return (element as ItemProxy).item.name;
    };
    component.getIcon = (element: any) => {
      return (element as ItemProxy).model.view.item.icon;
    };
    component.allowMultiselect = true;
    component.showSelections = true;
    component.selection = [TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseModel'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseView'), TreeConfiguration.getWorkingTree().getProxyFor('Item')];

    componentFixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  })

  it('moves the selected element at a given index', () => {
    component.moveElement(2, 0, true);
    expect(component.selection).toEqual([TreeConfiguration.getWorkingTree().
      getProxyFor('Item'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseModel'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseView')]);

    component.moveElement(2, 0, false);
    expect(component.selection).toEqual([TreeConfiguration.getWorkingTree().
      getProxyFor('Item'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseView'), TreeConfiguration.getWorkingTree().getProxyFor(
      'KoheseModel')]);
  });
});
