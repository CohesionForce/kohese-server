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


// Angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Kohese
import { ItemProxy } from '../../../../common/src/item-proxy';
import { TreeConfiguration } from '../../../../common/src/tree-configuration';
import { TreeService } from '../../services/tree/tree.service';
import { LogService } from '../../services/log/log.service';
import { TreeComponent } from './tree.component';

// Mocks
import { MockItemRepository } from '../../../mocks/services/MockItemRepository';
import { MockItem, MockAction } from '../../../mocks/data/MockItem';

fdescribe('TreeComponent', () => {
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
      ],
      providers: [
        { provide: TreeService, useClass: TreeService },
        { provide: LogService, useClass: LogService }
      ]
    }).compileComponents();

    let componentFixture: ComponentFixture<TreeComponent> = TestBed.createComponent(TreeComponent);
    component = componentFixture.componentInstance;

    MockItemRepository.singleton.mockFullSync();

    component.root = TreeConfiguration.getWorkingTree().getRootProxy();
    component.getTitle = {
      action: 'Tree Component Test Action',
      name: 'Tree Test Name'
    },
    component.getChildren = (element: any) => {
      return (element as ItemProxy).children;
    };
    component.getParent = (element: any) => {
      return (element as ItemProxy).parentProxy;
    },
    component.hasChildren = (element: any) => {
      return (component.getChildren(element).length > 0);
    };
    component.getText = (element: any) => {
      return (element as ItemProxy).item.name;
    };
    component.getIcon = (element: any) => {
      return (element as ItemProxy).model.view.item.icon;
    },
    component.isFavorite = (element: any) => {
      return (
        (element as ItemProxy).item.favorite ? (element as ItemProxy).item.favorite : false);
    };
    component.allowMultiselect = true;
    component.showSelections = true;
    component.selection = [
      TreeConfiguration.getWorkingTree().getProxyFor('KoheseModel'),
      TreeConfiguration.getWorkingTree().getProxyFor('KoheseView'),
      TreeConfiguration.getWorkingTree().getProxyFor('Item')
    ];

    componentFixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should instantiate the tree component', () => {
    expect(component).toBeTruthy();
  });

  it('should add recently viewed items to the quickSelectElements array', () => {
    let mockItem = new ItemProxy('Item', MockItem());
    component.quickSelectElements.push(mockItem);
    expect(component.quickSelectElements).toContain(mockItem);
  });

  it('should add favorited item to the favorites list and the top of the quickSelectElements', () => {
    component.update(true);
    const [firstKey] = component.elementMap.keys();
    let secondKey = Array.from(component.elementMap.keys())[1];

    component.quickSelectElements.push(secondKey);
    component.addToFavorites(firstKey);

    expect(component.favorites).toContain(firstKey);
    expect(component.quickSelectElements).toContain(firstKey);
    // check to make sure the recently added item is at the top of the recently viewed items
    expect(component.quickSelectElements[0]).toBe(firstKey);

  });

  it('should remove a favorited item from the favorites list but leave it in the quickSelectElements', () => {
    component.update(true);
    let [firstKey] = component.elementMap.keys();

    component.addToFavorites(firstKey);

    expect(component.favorites).toContain(firstKey);
    expect(component.quickSelectElements).toContain(firstKey);

    component.removeFromFavorites(firstKey);
    expect(component.favorites).not.toContain(firstKey);
    expect(component.quickSelectElements).toContain(firstKey);
  });

  it('should set the anchored item as root', () => {
    component.update(true);
    let firstElement = component.elementArray[0];
    expect(component.elementArray[0]).toBe(firstElement);

    let secondElement = component.elementArray[1];
    component.anchor(secondElement);
    expect(component.elementArray[0]).toBe(secondElement);
  });

  it('should set the root to the parent of the currently rooted item', () => {
    component.update(true);
    let firstElement = component.elementArray[0];
    let depthOneChildElements = component.getChildren(firstElement);
    let depthTwoChildElements = component.getChildren(depthOneChildElements[0]);
    let depthTwoChildElementParent = (depthTwoChildElements[0] as ItemProxy).parentProxy;

    // console.log('####### the depth one element to anchor', depthOneChildElements);
    // console.log('####### the depth two element to anchor', depthTwoChildElements);
    // console.log('####### the depth two parent element to anchor', depthTwoChildElementParent);

    component.anchor(depthTwoChildElements[0]);
    expect(component.elementArray[0]).toBe(depthTwoChildElements[0]);

    component.upLevelRoot();
    expect(component.elementArray[0]).toBe(depthTwoChildElementParent);

  });

  it('should return to the absolute root', () => {
    component.update(true);
    let firstElement = component.elementArray[0];
    let depthOneChildElements = component.getChildren(firstElement);
    let depthTwoChildElements = component.getChildren(depthOneChildElements[0]);

    // console.log('####### the depth one element to anchor', depthOneChildElements);
    // console.log('####### the depth two element to anchor', depthTwoChildElements);

    component.anchor(depthTwoChildElements[0]);
    expect(component.elementArray[0]).toBe(depthTwoChildElements[0]);

    component.returnToAbsoluteRoot();
    expect(component.elementArray[0]).toBe(component.absoluteRoot);
  });

  it('should add a selected element and remove a selected element', () => {
    component.update(true);
    let firstElement = component.elementArray[0];
    let depthOneChildElements = component.getChildren(firstElement);

    component.changeElementSelection(depthOneChildElements[0]);
    expect(component.selection).toContain(depthOneChildElements[0]);

    component.changeElementSelection(depthOneChildElements[0]);
    expect(component.selection).not.toContain(depthOneChildElements[0]);
  });

});
